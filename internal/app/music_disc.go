package app

import (
	"archive/zip"
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"
)

const (
	musicDiscUploadLimit    = 8 << 20
	musicDiscConvertedLimit = 5 << 20
	musicDiscMaxDuration    = 5 * time.Minute
	musicDiscPackDir        = "/data/music-packs"
	musicDiscTempDir        = "/data/music-packs/.tmp"
)

var musicDiscUploadGate = make(chan struct{}, 1)

type musicDiscMetadata struct {
	ID        string `json:"id"`
	RequestID string `json:"requestId"`
	Recipient string `json:"recipient"`
	Title     string `json:"title"`
	Status    string `json:"status"`
}

type musicDiscStatus struct {
	ID        string `json:"id"`
	RequestID string `json:"requestId"`
	Status    string `json:"status"`
	Recipient string `json:"recipient"`
	Error     string `json:"error"`
}

func (a *App) initMusicDiscSchema() error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS music_disc_requests (
			id TEXT PRIMARY KEY,
			request_id TEXT NOT NULL UNIQUE,
			owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			recipient_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			recipient TEXT NOT NULL,
			title TEXT NOT NULL,
			sound_key TEXT NOT NULL UNIQUE,
			pack_url TEXT NOT NULL,
			sha1 TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed','failed')),
			error TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			CHECK(id=request_id)
		)`,
		`CREATE INDEX IF NOT EXISTS music_disc_recipient_pending_idx
			ON music_disc_requests(recipient_user_id,status,created_at)`,
		`CREATE INDEX IF NOT EXISTS music_disc_owner_idx
			ON music_disc_requests(owner_user_id,id)`,
	}
	for _, statement := range statements {
		if _, _, err := a.db.Exec(statement); err != nil {
			return fmt.Errorf("initialize music disc database: %w", err)
		}
	}
	return nil
}

func (a *App) registerMusicDiscRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/me/music-disc", a.handleUploadMusicDisc)
	mux.HandleFunc("GET /api/me/music-disc/requests/{id}", a.handleMusicDiscStatus)
	mux.HandleFunc("GET /internal/minecraft/music-disc-requests", a.handleMinecraftMusicDiscRequests)
	mux.HandleFunc("GET /internal/minecraft/music-disc-requests/{id}", a.handleMinecraftMusicDiscRequest)
	mux.HandleFunc("GET /internal/minecraft/music-disc-requests/{id}/audio", a.handleMinecraftMusicDiscAudio)
	mux.HandleFunc("POST /internal/minecraft/music-disc-requests/{id}/result", a.handleMinecraftMusicDiscResult)
	mux.HandleFunc("GET /music-packs/{filename}", a.handleMusicDiscPack)
}

func (a *App) handleUploadMusicDisc(w http.ResponseWriter, r *http.Request) {
	u, ok := a.requireUser(w, r)
	if !ok {
		return
	}
	select {
	case musicDiscUploadGate <- struct{}{}:
		defer func() { <-musicDiscUploadGate }()
	default:
		w.Header().Set("Retry-After", "5")
		writeError(w, http.StatusServiceUnavailable, "another music disc is being prepared; try again shortly")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, musicDiscUploadLimit+(128<<10))
	if err := r.ParseMultipartForm(1 << 20); err != nil {
		var maxBytesErr *http.MaxBytesError
		if errors.As(err, &maxBytesErr) {
			writeError(w, http.StatusRequestEntityTooLarge, "audio must be 8 MiB or smaller")
		} else {
			writeError(w, http.StatusBadRequest, "invalid multipart request")
		}
		return
	}
	if r.MultipartForm == nil {
		writeError(w, http.StatusBadRequest, "invalid multipart request")
		return
	}
	defer r.MultipartForm.RemoveAll()

	var fileCount int
	for _, files := range r.MultipartForm.File {
		fileCount += len(files)
	}
	if fileCount != 1 || len(r.MultipartForm.File["audio"]) != 1 ||
		len(r.MultipartForm.Value) != 1 || len(r.MultipartForm.Value["title"]) != 1 {
		writeError(w, http.StatusBadRequest, "audio and title are required once each")
		return
	}
	title, ok := safeMusicDiscTitle(r.MultipartForm.Value["title"][0])
	if !ok {
		writeError(w, http.StatusBadRequest, "title must be 1-48 printable characters")
		return
	}
	// A music disc always belongs to the signed-in player.
	recipient := u.Username

	fileHeader := r.MultipartForm.File["audio"][0]
	if fileHeader.Size > musicDiscUploadLimit {
		writeError(w, http.StatusRequestEntityTooLarge, "audio must be 8 MiB or smaller")
		return
	}
	var audio []byte
	switch strings.ToLower(filepath.Ext(fileHeader.Filename)) {
	case ".ogg":
		file, err := fileHeader.Open()
		if err != nil {
			writeError(w, http.StatusBadRequest, "could not read audio upload")
			return
		}
		audio, readErr := io.ReadAll(io.LimitReader(file, musicDiscUploadLimit+1))
		closeErr := file.Close()
		if readErr != nil || closeErr != nil {
			writeError(w, http.StatusBadRequest, "could not read audio upload")
			return
		}
		if len(audio) > musicDiscUploadLimit {
			writeError(w, http.StatusRequestEntityTooLarge, "audio must be 8 MiB or smaller")
			return
		}
		if !hasVorbisIdentificationHeader(audio) {
			writeError(w, http.StatusBadRequest, "audio must be OGG Vorbis")
			return
		}
	case ".mp3":
		inputPath, err := storeMusicDiscUpload(fileHeader)
		if err != nil {
			if errors.Is(err, errMusicDiscUploadTooLarge) {
				writeError(w, http.StatusRequestEntityTooLarge, "audio must be 8 MiB or smaller")
			} else {
				a.logger.Printf("store MP3 music disc upload: %v", err)
				writeError(w, http.StatusBadRequest, "could not read audio upload")
			}
			return
		}
		defer os.Remove(inputPath)
		audio, err = convertMusicDiscMP3(r.Context(), inputPath)
		if err != nil {
			a.logger.Printf("convert MP3 music disc upload: %v", err)
			status := http.StatusBadRequest
			if errors.Is(err, errMusicDiscUnavailable) || errors.Is(err, errMusicDiscTimeout) {
				status = http.StatusServiceUnavailable
			}
			writeError(w, status, err.Error())
			return
		}
	default:
		writeError(w, http.StatusBadRequest, "audio must be an .ogg or .mp3 file")
		return
	}

	recipientID := u.ID

	id, err := newMusicDiscUUID()
	if err != nil {
		a.logger.Printf("create music disc request id: %v", err)
		writeError(w, http.StatusInternalServerError, "could not create music disc request")
		return
	}
	audioPath := a.musicDiscAudioPath(id)
	if err := persistMusicDiscAudio(audioPath, audio); err != nil {
		a.logger.Printf("store music disc audio: %v", err)
		writeError(w, http.StatusInternalServerError, "could not store music disc audio")
		return
	}
	now := nowString()
	_, _, err = a.db.Exec(`INSERT INTO music_disc_requests
		(id,request_id,owner_user_id,recipient_user_id,recipient,title,sound_key,pack_url,sha1,status,error,created_at,updated_at)
		VALUES(?,?,?,?,?,?,?,?,?,'pending','',?,?)`,
		id, id, u.ID, recipientID, recipient, title, "cdisc:"+id, "", "", now, now)
	if err != nil {
		_ = os.Remove(audioPath)
		a.logger.Printf("queue music disc request: %v", err)
		writeError(w, http.StatusInternalServerError, "could not queue music disc request")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"id": id, "requestId": id, "status": "pending", "recipient": recipient,
		"title": title,
	})
	a.notifyMusicDiscRequest(id)
}

func (a *App) handleMusicDiscStatus(w http.ResponseWriter, r *http.Request) {
	u, ok := a.requireUser(w, r)
	if !ok {
		return
	}
	id, valid := canonicalMusicDiscUUID(r.PathValue("id"))
	if !valid {
		http.NotFound(w, r)
		return
	}
	row, found, err := a.db.QueryOne(`SELECT id,request_id,status,recipient,error
		FROM music_disc_requests WHERE id=? AND owner_user_id=?`, id, u.ID)
	if err != nil {
		a.logger.Printf("read music disc request: %v", err)
		writeError(w, http.StatusInternalServerError, "could not load music disc request")
		return
	}
	if !found {
		http.NotFound(w, r)
		return
	}
	writeJSON(w, http.StatusOK, musicDiscStatus{
		ID: valueString(row[0]), RequestID: valueString(row[1]), Status: valueString(row[2]),
		Recipient: valueString(row[3]), Error: valueString(row[4]),
	})
}

func (a *App) handleMinecraftMusicDiscRequest(w http.ResponseWriter, r *http.Request) {
	if !a.authorizeMusicDiscInternal(w, r, http.MethodGet) {
		return
	}
	id, valid := canonicalMusicDiscUUID(r.PathValue("id"))
	if !valid {
		http.NotFound(w, r)
		return
	}
	row, found, err := a.db.QueryOne(`SELECT id,request_id,recipient,title,status
		FROM music_disc_requests WHERE id=? AND status='pending'`, id)
	if err != nil {
		a.logger.Printf("read pending music disc request: %v", err)
		writeError(w, http.StatusInternalServerError, "could not load music disc request")
		return
	}
	if !found {
		http.NotFound(w, r)
		return
	}
	writeJSON(w, http.StatusOK, musicDiscMetadata{
		ID: valueString(row[0]), RequestID: valueString(row[1]), Recipient: valueString(row[2]),
		Title: valueString(row[3]), Status: valueString(row[4]),
	})
}

func (a *App) handleMinecraftMusicDiscAudio(w http.ResponseWriter, r *http.Request) {
	if !a.authorizeMusicDiscInternal(w, r, http.MethodGet) {
		return
	}
	id, valid := canonicalMusicDiscUUID(r.PathValue("id"))
	if !valid {
		http.NotFound(w, r)
		return
	}
	_, found, err := a.db.QueryOne(`SELECT id FROM music_disc_requests WHERE id=? AND status='pending'`, id)
	if err != nil {
		a.logger.Printf("verify pending music disc audio: %v", err)
		writeError(w, http.StatusInternalServerError, "could not load music disc audio")
		return
	}
	if !found {
		http.NotFound(w, r)
		return
	}
	audio, err := a.readMusicDiscAudio(id)
	if err != nil {
		a.logger.Printf("read music disc audio %s: %v", id, err)
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "audio/ogg")
	w.Header().Set("Content-Disposition", `attachment; filename="`+id+`.ogg"`)
	w.Header().Set("Content-Length", strconv.Itoa(len(audio)))
	_, _ = w.Write(audio)
}

func (a *App) handleMinecraftMusicDiscRequests(w http.ResponseWriter, r *http.Request) {
	if !a.authorizeMusicDiscInternal(w, r, http.MethodGet) {
		return
	}
	recipient := strings.TrimSpace(r.URL.Query().Get("recipient"))
	if !validUsername(recipient) {
		writeError(w, http.StatusBadRequest, "invalid recipient")
		return
	}
	rows, err := a.db.Query(`SELECT d.id,d.request_id,u.username,d.title,d.status
		FROM music_disc_requests d JOIN users u ON u.id=d.recipient_user_id
		WHERE u.username=? COLLATE NOCASE AND u.banned_at IS NULL
			AND (d.status IN ('pending','completed') OR (d.status='failed' AND d.error='Resource pack download failed'))
		ORDER BY d.created_at,d.id`, recipient)
	if err != nil {
		a.logger.Printf("list music disc requests: %v", err)
		writeError(w, http.StatusInternalServerError, "could not list music disc requests")
		return
	}
	requests := make([]musicDiscMetadata, 0, len(rows))
	for _, row := range rows {
		requestID := valueString(row[1])
		requests = append(requests, musicDiscMetadata{
			ID: valueString(row[0]), RequestID: requestID, Recipient: valueString(row[2]),
			Title: valueString(row[3]), Status: valueString(row[4]),
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"requests": requests})
}

func (a *App) musicDiscAudioPath(id string) string {
	dir := strings.TrimSpace(a.musicDiscAudioDir)
	if dir == "" {
		dir = musicDiscPackDir
	}
	return filepath.Join(dir, id+".ogg")
}

func persistMusicDiscAudio(path string, contents []byte) error {
	if len(contents) == 0 || len(contents) > musicDiscUploadLimit {
		return fmt.Errorf("music disc audio size %d is outside the allowed range", len(contents))
	}
	dir := filepath.Dir(path)
	tempDir := filepath.Join(dir, ".tmp")
	if err := os.MkdirAll(tempDir, 0o750); err != nil {
		return err
	}
	temporary, err := os.CreateTemp(tempDir, "music-disc-*.ogg")
	if err != nil {
		return err
	}
	temporaryPath := temporary.Name()
	keep := false
	defer func() {
		if !keep {
			_ = os.Remove(temporaryPath)
		}
	}()
	if _, err := temporary.Write(contents); err != nil {
		_ = temporary.Close()
		return err
	}
	if err := temporary.Sync(); err != nil {
		_ = temporary.Close()
		return err
	}
	if err := temporary.Close(); err != nil {
		return err
	}
	if err := os.Rename(temporaryPath, path); err != nil {
		return err
	}
	keep = true
	return nil
}

func (a *App) readMusicDiscAudio(id string) ([]byte, error) {
	path := a.musicDiscAudioPath(id)
	audio, err := os.ReadFile(path)
	if err == nil {
		if len(audio) == 0 || len(audio) > musicDiscUploadLimit {
			return nil, fmt.Errorf("stored audio size %d is outside the allowed range", len(audio))
		}
		return audio, nil
	}
	if !errors.Is(err, os.ErrNotExist) {
		return nil, err
	}
	// Requests created before CDisc stored audio inside a per-disc resource pack.
	// Extract that file lazily so queued deliveries survive the migration.
	archive, err := zip.OpenReader(filepath.Join(filepath.Dir(path), id+".zip"))
	if err != nil {
		return nil, err
	}
	defer archive.Close()
	name := "assets/hazelwood/sounds/disc_" + id + ".ogg"
	for _, file := range archive.File {
		if file.Name != name || file.UncompressedSize64 > musicDiscUploadLimit {
			continue
		}
		reader, err := file.Open()
		if err != nil {
			return nil, err
		}
		contents, readErr := io.ReadAll(io.LimitReader(reader, musicDiscUploadLimit+1))
		closeErr := reader.Close()
		if readErr != nil {
			return nil, readErr
		}
		if closeErr != nil {
			return nil, closeErr
		}
		if len(contents) == 0 || len(contents) > musicDiscUploadLimit {
			return nil, fmt.Errorf("legacy audio size %d is outside the allowed range", len(contents))
		}
		return contents, nil
	}
	return nil, os.ErrNotExist
}

func (a *App) handleMinecraftMusicDiscResult(w http.ResponseWriter, r *http.Request) {
	if !a.authorizeMusicDiscInternal(w, r, http.MethodPost) {
		return
	}
	id, valid := canonicalMusicDiscUUID(r.PathValue("id"))
	if !valid {
		http.NotFound(w, r)
		return
	}
	var input struct {
		Status string `json:"status"`
		Error  string `json:"error,omitempty"`
	}
	if err := a.decodeJSON(w, r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid result")
		return
	}
	if input.Status != "completed" && input.Status != "failed" {
		writeError(w, http.StatusBadRequest, "status must be completed or failed")
		return
	}
	errorText := ""
	if input.Status == "failed" {
		var ok bool
		errorText, ok = safeMusicDiscError(input.Error)
		if !ok {
			writeError(w, http.StatusBadRequest, "failed result requires a short printable error")
			return
		}
	} else if input.Error != "" {
		writeError(w, http.StatusBadRequest, "completed result cannot include an error")
		return
	}

	changed, _, err := a.db.Exec(`UPDATE music_disc_requests SET status=?,error=?,updated_at=?
		WHERE id=? AND (status='pending' OR (status='failed' AND error='Resource pack download failed'))`, input.Status, errorText, nowString(), id)
	if err != nil {
		a.logger.Printf("update music disc result: %v", err)
		writeError(w, http.StatusInternalServerError, "could not update music disc request")
		return
	}
	if changed == 0 {
		_, found, err := a.db.QueryOne("SELECT id FROM music_disc_requests WHERE id=?", id)
		if err != nil {
			a.logger.Printf("check music disc result: %v", err)
			writeError(w, http.StatusInternalServerError, "could not update music disc request")
			return
		}
		if !found {
			http.NotFound(w, r)
			return
		}
		writeError(w, http.StatusConflict, "music disc request already finished")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": id, "requestId": id, "status": input.Status})
}

func (a *App) handleMusicDiscPack(w http.ResponseWriter, r *http.Request) {
	filename := r.PathValue("filename")
	if !strings.HasSuffix(filename, ".zip") {
		http.NotFound(w, r)
		return
	}
	id, valid := canonicalMusicDiscUUID(strings.TrimSuffix(filename, ".zip"))
	if !valid {
		http.NotFound(w, r)
		return
	}
	path := musicDiscPackPath(id)
	file, err := os.Open(path)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer file.Close()
	info, err := file.Stat()
	if err != nil || !info.Mode().IsRegular() {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="`+id+`.zip"`)
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	http.ServeContent(w, r, id+".zip", info.ModTime(), file)
}

func (a *App) authorizeMusicDiscInternal(w http.ResponseWriter, r *http.Request, method string) bool {
	w.Header().Set("Cache-Control", "no-store")
	if !a.hasMinecraftAuthSecret || !validMinecraftAuthToken(r.Header.Get("Authorization"), a.minecraftAuthSecret) {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return false
	}
	if r.Method != method {
		w.Header().Set("Allow", method)
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return false
	}
	return true
}

func (a *App) notifyMusicDiscRequest(id string) {
	if a.rcon == nil {
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		if _, err := a.command(ctx, "hwdisc "+id); err != nil {
			a.logRCONError("hwdisc", err)
		}
	}()
}

func safeMusicDiscTitle(title string) (string, bool) {
	title = strings.TrimSpace(title)
	if !utf8.ValidString(title) {
		return "", false
	}
	length := utf8.RuneCountInString(title)
	if length < 1 || length > 48 {
		return "", false
	}
	for _, char := range title {
		if !unicode.IsGraphic(char) {
			return "", false
		}
	}
	return title, true
}

func safeMusicDiscError(message string) (string, bool) {
	message = strings.TrimSpace(message)
	if !utf8.ValidString(message) || len(message) == 0 || len(message) > 512 {
		return "", false
	}
	for _, char := range message {
		if !unicode.IsGraphic(char) {
			return "", false
		}
	}
	return message, true
}

func hasVorbisIdentificationHeader(audio []byte) bool {
	if len(audio) < 27 || string(audio[:4]) != "OggS" || audio[4] != 0 || audio[5]&0x02 == 0 {
		return false
	}
	segmentCount := int(audio[26])
	if len(audio) < 27+segmentCount {
		return false
	}
	offset := 27 + segmentCount
	packet := make([]byte, 0, 7)
	for _, segment := range audio[27 : 27+segmentCount] {
		segmentLength := int(segment)
		if offset+segmentLength > len(audio) {
			return false
		}
		needed := 7 - len(packet)
		if segmentLength > needed {
			segmentLength = needed
		}
		packet = append(packet, audio[offset:offset+segmentLength]...)
		offset += int(segment)
		if len(packet) == 7 {
			return bytes.Equal(packet, []byte{1, 'v', 'o', 'r', 'b', 'i', 's'})
		}
		if segment == 0 || segment < 255 {
			return false
		}
	}
	return false
}

var (
	errMusicDiscUploadTooLarge = errors.New("music disc upload exceeds size limit")
	errMusicDiscDuration       = errors.New("MP3 must be five minutes or shorter")
	errMusicDiscInvalidMP3     = errors.New("file is not a valid MP3 audio track")
	errMusicDiscConversion     = errors.New("could not convert MP3 to Minecraft audio format")
	errMusicDiscUnavailable    = errors.New("MP3 conversion is unavailable on this server")
	errMusicDiscTimeout        = errors.New("MP3 conversion timed out; try a shorter file")
)

func storeMusicDiscUpload(header *multipart.FileHeader) (string, error) {
	source, err := header.Open()
	if err != nil {
		return "", err
	}
	defer source.Close()

	temporary, err := createMusicDiscTemp("hazelwood-music-upload-*.mp3")
	if err != nil {
		return "", err
	}
	path := temporary.Name()
	keep := false
	defer func() {
		if !keep {
			_ = os.Remove(path)
		}
	}()

	written, copyErr := io.Copy(temporary, io.LimitReader(source, musicDiscUploadLimit+1))
	closeErr := temporary.Close()
	if copyErr != nil {
		return "", copyErr
	}
	if closeErr != nil {
		return "", closeErr
	}
	if written > musicDiscUploadLimit {
		return "", errMusicDiscUploadTooLarge
	}
	keep = true
	return path, nil
}

func createMusicDiscTemp(pattern string) (*os.File, error) {
	if err := os.MkdirAll(musicDiscTempDir, 0700); err != nil {
		return nil, err
	}
	if err := os.Chmod(musicDiscTempDir, 0700); err != nil {
		return nil, err
	}
	return os.CreateTemp(musicDiscTempDir, pattern)
}

func convertMusicDiscMP3(requestContext context.Context, inputPath string) ([]byte, error) {
	ffprobePath, err := exec.LookPath("ffprobe")
	if err != nil {
		return nil, errMusicDiscUnavailable
	}
	ffmpegPath, err := exec.LookPath("ffmpeg")
	if err != nil {
		return nil, errMusicDiscUnavailable
	}

	ctx, cancel := context.WithTimeout(requestContext, 90*time.Second)
	defer cancel()

	codec, duration, err := probeMusicDiscAudio(ctx, ffprobePath, inputPath, "mp3")
	if err != nil || codec != "mp3" {
		return nil, errMusicDiscInvalidMP3
	}
	if duration <= 0 || duration > musicDiscMaxDuration.Seconds() {
		return nil, errMusicDiscDuration
	}

	output, err := createMusicDiscTemp("hazelwood-music-converted-*.ogg")
	if err != nil {
		return nil, errMusicDiscConversion
	}
	outputPath := output.Name()
	if err := output.Close(); err != nil {
		_ = os.Remove(outputPath)
		return nil, errMusicDiscConversion
	}
	defer os.Remove(outputPath)

	command := exec.CommandContext(ctx, ffmpegPath,
		"-nostdin", "-hide_banner", "-loglevel", "error", "-y",
		"-protocol_whitelist", "file", "-threads", "1", "-f", "mp3", "-i", inputPath,
		"-map", "0:a:0", "-vn", "-sn", "-dn", "-map_metadata", "-1",
		"-ac", "2", "-ar", "44100", "-c:a", "libvorbis", "-b:a", "96k", "-threads", "1",
		"-t", strconv.Itoa(int(musicDiscMaxDuration.Seconds())), "-fs", strconv.Itoa(musicDiscConvertedLimit),
		"-f", "ogg", outputPath,
	)
	command.Stdout = io.Discard
	command.Stderr = &limitedMusicDiscOutput{limit: 2048}
	if err := command.Run(); err != nil {
		if errors.Is(ctx.Err(), context.DeadlineExceeded) {
			return nil, errMusicDiscTimeout
		}
		return nil, errMusicDiscConversion
	}

	info, err := os.Stat(outputPath)
	if err != nil || info.Size() <= 0 || info.Size() > musicDiscConvertedLimit {
		return nil, errMusicDiscConversion
	}
	converted, err := os.ReadFile(outputPath)
	if err != nil || !hasVorbisIdentificationHeader(converted) {
		return nil, errMusicDiscConversion
	}
	outputCodec, outputDuration, err := probeMusicDiscAudio(ctx, ffprobePath, outputPath, "ogg")
	if err != nil || outputCodec != "vorbis" || outputDuration <= 0 ||
		outputDuration > musicDiscMaxDuration.Seconds()+0.5 || outputDuration+1.0 < duration {
		return nil, errMusicDiscConversion
	}
	return converted, nil
}

func probeMusicDiscAudio(ctx context.Context, ffprobePath, path, format string) (string, float64, error) {
	command := exec.CommandContext(ctx, ffprobePath,
		"-v", "error", "-select_streams", "a:0",
		"-protocol_whitelist", "file", "-f", format,
		"-show_entries", "stream=codec_name:format=duration",
		"-of", "default=noprint_wrappers=1:nokey=0", path,
	)
	output := &limitedMusicDiscOutput{limit: 4096}
	command.Stdout = output
	command.Stderr = io.Discard
	if err := command.Run(); err != nil {
		return "", 0, err
	}
	var codec string
	var duration float64
	for _, line := range strings.Split(output.buffer.String(), "\n") {
		key, value, ok := strings.Cut(strings.TrimSpace(line), "=")
		if !ok {
			continue
		}
		switch key {
		case "codec_name":
			codec = value
		case "duration":
			parsedDuration, parseErr := strconv.ParseFloat(value, 64)
			if parseErr != nil {
				return "", 0, parseErr
			}
			duration = parsedDuration
		}
	}
	if codec == "" || duration <= 0 {
		return "", 0, errors.New("audio stream has no codec or duration")
	}
	return codec, duration, nil
}

type limitedMusicDiscOutput struct {
	buffer bytes.Buffer
	limit  int
}

func (output *limitedMusicDiscOutput) Write(data []byte) (int, error) {
	length := len(data)
	remaining := output.limit - output.buffer.Len()
	if remaining > 0 {
		if len(data) > remaining {
			data = data[:remaining]
		}
		_, _ = output.buffer.Write(data)
	}
	return length, nil
}

func newMusicDiscUUID() (string, error) {
	var value [16]byte
	if _, err := rand.Read(value[:]); err != nil {
		return "", err
	}
	value[6] = value[6]&0x0f | 0x40
	value[8] = value[8]&0x3f | 0x80
	encoded := hex.EncodeToString(value[:])
	return encoded[:8] + "-" + encoded[8:12] + "-" + encoded[12:16] + "-" + encoded[16:20] + "-" + encoded[20:], nil
}

func canonicalMusicDiscUUID(value string) (string, bool) {
	if len(value) != 36 || value[8] != '-' || value[13] != '-' || value[18] != '-' || value[23] != '-' ||
		value[14] != '4' || (value[19] != '8' && value[19] != '9' && value[19] != 'a' && value[19] != 'A' && value[19] != 'b' && value[19] != 'B') {
		return "", false
	}
	for i, char := range value {
		if i == 8 || i == 13 || i == 18 || i == 23 {
			continue
		}
		if !((char >= '0' && char <= '9') || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F')) {
			return "", false
		}
	}
	return strings.ToLower(value), true
}

func musicDiscPackURL(origin *url.URL, id string) string {
	base := "https://hazelwood-card.inne.space"
	if origin != nil && origin.Scheme != "" && origin.Host != "" {
		base = origin.Scheme + "://" + origin.Host
	}
	return strings.TrimRight(base, "/") + "/music-packs/" + id + ".zip"
}

func buildMusicDiscPack(id, title string, audio []byte) ([]byte, error) {
	soundName := "disc_" + id
	soundKey := "hazelwood:" + soundName
	metadata, err := json.Marshal(struct {
		Pack struct {
			Description string `json:"description"`
			MinFormat   []int  `json:"min_format"`
			MaxFormat   []int  `json:"max_format"`
		} `json:"pack"`
	}{Pack: struct {
		Description string `json:"description"`
		MinFormat   []int  `json:"min_format"`
		MaxFormat   []int  `json:"max_format"`
	}{Description: "Hazelwood music disc: " + title, MinFormat: []int{97, 1}, MaxFormat: []int{97, 1}}})
	if err != nil {
		return nil, err
	}
	sounds, err := json.Marshal(map[string]any{
		soundName: map[string]any{
			"sounds": []any{map[string]any{"name": soundKey, "stream": true}},
		},
	})
	if err != nil {
		return nil, err
	}

	var output bytes.Buffer
	archive := zip.NewWriter(&output)
	for _, entry := range []struct {
		name   string
		data   []byte
		method uint16
	}{
		{name: "pack.mcmeta", data: metadata, method: zip.Deflate},
		{name: "assets/hazelwood/sounds.json", data: sounds, method: zip.Deflate},
		{name: "assets/hazelwood/sounds/" + soundName + ".ogg", data: audio, method: zip.Store},
	} {
		header := &zip.FileHeader{Name: entry.name, Method: entry.method}
		writer, err := archive.CreateHeader(header)
		if err != nil {
			_ = archive.Close()
			return nil, err
		}
		if _, err := writer.Write(entry.data); err != nil {
			_ = archive.Close()
			return nil, err
		}
	}
	if err := archive.Close(); err != nil {
		return nil, err
	}
	return output.Bytes(), nil
}

func persistMusicDiscPack(id string, contents []byte) error {
	if err := os.MkdirAll(musicDiscPackDir, 0700); err != nil {
		return err
	}
	temporary, err := os.CreateTemp(musicDiscPackDir, ".music-disc-*.tmp")
	if err != nil {
		return err
	}
	temporaryPath := temporary.Name()
	defer os.Remove(temporaryPath)
	if _, err := temporary.Write(contents); err != nil {
		_ = temporary.Close()
		return err
	}
	if err := temporary.Sync(); err != nil {
		_ = temporary.Close()
		return err
	}
	if err := temporary.Close(); err != nil {
		return err
	}
	return os.Rename(temporaryPath, musicDiscPackPath(id))
}

func musicDiscPackPath(id string) string {
	return filepath.Join(musicDiscPackDir, id+".zip")
}
