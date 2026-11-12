package app

import (
	"archive/zip"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"image/draw"
	"image/png"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

const (
	maxSkinUploadBytes         = 256 << 10
	maxSkinTextureBytes        = 1 << 20
	maxMinecraftClientJarBytes = 64 << 20
	skinRequestTimeout         = 5 * time.Minute
	skinRequestCooldown        = 15 * time.Second
	minecraftClientJarName     = "minecraft-client-26.3.jar"
)

// This ordering matches Minecraft 26.3's DefaultPlayerSkin client class.
var defaultSkinNames = [...]string{"alex", "ari", "efe", "kai", "makena", "noor", "steve", "sunny", "zuri"}

type skinChangeRequest struct {
	PlayerName string `json:"playerName"`
	Model      string `json:"model"`
}

type skinTextureCacheEntry struct {
	contents  []byte
	expiresAt time.Time
}

type minecraftSkinRequest struct {
	Username string `json:"username"`
	UUID     string `json:"uuid"`
	Kind     string `json:"kind"`
	Value    string `json:"value"`
	Model    string `json:"model"`
}

type minecraftSkinResult struct {
	Status     string `json:"status"`
	TextureURL string `json:"textureURL"`
	Model      string `json:"model"`
	Error      string `json:"error"`
}

type skinRequestStatus struct {
	ID         int64   `json:"id"`
	RequestID  int64   `json:"requestId"`
	Status     string  `json:"status"`
	TextureURL *string `json:"textureURL"`
	Model      string  `json:"model"`
	Error      *string `json:"error"`
}

func (a *App) handleRequestSkinChange(w http.ResponseWriter, r *http.Request) {
	u, ok := a.requireUser(w, r)
	if !ok {
		return
	}
	a.expireSkinRequests()
	cutoff := time.Now().UTC().Add(-skinRequestCooldown).Format(time.RFC3339Nano)
	_, recentlyRequested, err := a.db.QueryOne("SELECT id FROM skin_requests WHERE user_id=? AND created_at>=? LIMIT 1", u.ID, cutoff)
	if err != nil {
		a.logger.Printf("check recent skin request: %v", err)
		writeError(w, http.StatusInternalServerError, "could not create skin request")
		return
	}
	if recentlyRequested {
		writeError(w, http.StatusTooManyRequests, "wait before requesting another skin change")
		return
	}
	kind, value, model, err := readSkinChangeInput(w, r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	players, err := a.loadMinecraftPlayers()
	if err != nil {
		a.logger.Printf("resolve Minecraft UUID for skin request: %v", err)
		writeError(w, http.StatusInternalServerError, "could not create skin request")
		return
	}
	var uuid string
	for _, player := range players {
		if strings.EqualFold(player.Username, u.Username) {
			uuid = player.UUID
			break
		}
	}
	if uuid == "" {
		uuid = offlinePlayerUUID(u.Username)
	}
	_, hasPending, err := a.db.QueryOne("SELECT id FROM skin_requests WHERE user_id=? AND status='pending' LIMIT 1", u.ID)
	if err != nil {
		a.logger.Printf("check pending skin request: %v", err)
		writeError(w, http.StatusInternalServerError, "could not create skin request")
		return
	}
	if hasPending {
		writeError(w, http.StatusConflict, "a skin change is already pending")
		return
	}
	now := nowString()
	_, id, err := a.db.Exec(`INSERT INTO skin_requests(user_id,username,player_uuid,kind,value,model,status,created_at,updated_at)
		VALUES(?,?,?,?,?,?,'pending',?,?)`, u.ID, u.Username, uuid, kind, value, model, now, now)
	if err != nil {
		if strings.Contains(err.Error(), "skin_requests_one_pending_per_user") || strings.Contains(err.Error(), "UNIQUE constraint failed: skin_requests.user_id") {
			writeError(w, http.StatusConflict, "a skin change is already pending")
			return
		}
		a.logger.Printf("store skin change request: %v", err)
		writeError(w, http.StatusInternalServerError, "could not create skin request")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()
	response, err := a.command(ctx, fmt.Sprintf("hwskin %d", id))
	if err != nil || !minecraftSkinRequestAccepted(response) {
		_, _, _ = a.db.Exec("UPDATE skin_requests SET status='failed',error=?,updated_at=? WHERE id=? AND status='pending'", "Minecraft server is unavailable or skin command is not installed", nowString(), id)
		writeError(w, http.StatusServiceUnavailable, "Minecraft skin service is unavailable")
		return
	}
	writeJSON(w, http.StatusAccepted, skinRequestStatus{ID: id, RequestID: id, Status: "pending", Model: model})
}

func minecraftSkinRequestAccepted(response string) bool {
	return strings.Contains(strings.ToLower(response), "запрос на смену скина принят")
}

func (a *App) expireSkinRequests() {
	cutoff := time.Now().UTC().Add(-skinRequestTimeout).Format(time.RFC3339Nano)
	_, _, err := a.db.Exec(`UPDATE skin_requests SET status='failed',error='skin change timed out',updated_at=?
		WHERE status='pending' AND created_at<?`, nowString(), cutoff)
	if err != nil {
		a.logger.Printf("expire skin requests: %v", err)
	}
}

func readSkinChangeInput(w http.ResponseWriter, r *http.Request) (kind, value, model string, err error) {
	contentType := strings.ToLower(strings.TrimSpace(strings.SplitN(r.Header.Get("Content-Type"), ";", 2)[0]))
	if contentType == "multipart/form-data" {
		r.Body = http.MaxBytesReader(w, r.Body, maxSkinUploadBytes+8*1024)
		if err := r.ParseMultipartForm(256 << 10); err != nil {
			return "", "", "", errors.New("invalid skin upload")
		}
		defer func() {
			if r.MultipartForm != nil {
				_ = r.MultipartForm.RemoveAll()
			}
		}()
		file, header, err := r.FormFile("skin")
		if err != nil {
			return "", "", "", errors.New("upload a PNG skin in the skin field")
		}
		defer file.Close()
		if header.Size < 1 || header.Size > maxSkinUploadBytes {
			return "", "", "", errors.New("skin upload must be 256 KB or smaller")
		}
		contents, err := io.ReadAll(io.LimitReader(file, maxSkinUploadBytes+1))
		if err != nil || len(contents) > maxSkinUploadBytes {
			return "", "", "", errors.New("skin upload must be 256 KB or smaller")
		}
		if err := validateSkinPNG(contents); err != nil {
			return "", "", "", err
		}
		model = r.FormValue("model")
		if model == "" {
			model = "classic"
		}
		if model != "classic" && model != "slim" {
			return "", "", "", errors.New("skin model must be classic or slim")
		}
		return "upload", base64.StdEncoding.EncodeToString(contents), model, nil
	}
	if contentType != "application/json" {
		return "", "", "", errors.New("send JSON playerName or multipart PNG skin")
	}
	var input skinChangeRequest
	if err := decodeJSONLimit(w, r, &input, 8*1024); err != nil {
		return "", "", "", errors.New("invalid skin request")
	}
	input.PlayerName = strings.TrimSpace(input.PlayerName)
	if !validUsername(input.PlayerName) {
		return "", "", "", errors.New("playerName must be a valid Minecraft nickname")
	}
	if input.Model == "" {
		input.Model = "classic"
	}
	if input.Model != "classic" && input.Model != "slim" {
		return "", "", "", errors.New("skin model must be classic or slim")
	}
	return "player", input.PlayerName, input.Model, nil
}

func validateSkinPNG(contents []byte) error {
	config, err := png.DecodeConfig(bytes.NewReader(contents))
	if err != nil || (config.Width != 64 || (config.Height != 64 && config.Height != 32)) {
		return errors.New("skin PNG must be 64×64 or 64×32 pixels")
	}
	if _, err := png.Decode(bytes.NewReader(contents)); err != nil {
		return errors.New("skin upload is an incomplete or invalid PNG")
	}
	return nil
}

func (a *App) handleSkinRequestStatus(w http.ResponseWriter, r *http.Request) {
	u, ok := a.requireUser(w, r)
	if !ok {
		return
	}
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid skin request id")
		return
	}
	row, found, err := a.db.QueryOne(`SELECT id,status,texture_url,model,error FROM skin_requests WHERE id=? AND user_id=?`, id, u.ID)
	if err != nil {
		a.logger.Printf("read skin request: %v", err)
		writeError(w, http.StatusInternalServerError, "could not read skin request")
		return
	}
	if !found {
		writeError(w, http.StatusNotFound, "skin request not found")
		return
	}
	response := skinRequestStatus{ID: valueInt(row[0]), RequestID: valueInt(row[0]), Status: valueString(row[1]), Model: valueString(row[3])}
	if row[2] != nil {
		value := valueString(row[2])
		response.TextureURL = &value
	}
	if row[4] != nil {
		value := valueString(row[4])
		response.Error = &value
	}
	writeJSON(w, http.StatusOK, response)
}

func (a *App) handleMinecraftSkinRequest(w http.ResponseWriter, r *http.Request) {
	if !a.authorizeMinecraftInternal(w, r) {
		return
	}
	id, ok := skinRequestID(r)
	if !ok {
		writeError(w, http.StatusBadRequest, "invalid skin request id")
		return
	}
	row, found, err := a.db.QueryOne(`SELECT username,player_uuid,kind,value,model FROM skin_requests WHERE id=? AND status='pending'`, id)
	if err != nil {
		a.logger.Printf("read Minecraft skin request: %v", err)
		writeError(w, http.StatusInternalServerError, "could not read skin request")
		return
	}
	if !found {
		writeError(w, http.StatusNotFound, "skin request not found")
		return
	}
	writeJSON(w, http.StatusOK, minecraftSkinRequest{
		Username: valueString(row[0]), UUID: valueString(row[1]), Kind: valueString(row[2]),
		Value: valueString(row[3]), Model: valueString(row[4]),
	})
}

func (a *App) handleMinecraftSkinResult(w http.ResponseWriter, r *http.Request) {
	if !a.authorizeMinecraftInternal(w, r) {
		return
	}
	id, ok := skinRequestID(r)
	if !ok {
		writeError(w, http.StatusBadRequest, "invalid skin request id")
		return
	}
	var input minecraftSkinResult
	if err := decodeJSONLimit(w, r, &input, 8*1024); err != nil {
		writeError(w, http.StatusBadRequest, "invalid skin request result")
		return
	}
	if input.Status != "completed" && input.Status != "failed" {
		writeError(w, http.StatusBadRequest, "status must be completed or failed")
		return
	}
	model := normalizeSkinModel(input.Model)
	var textureURL, errorText any
	if input.Status == "completed" {
		textureURL = safeMinecraftTextureURL(input.TextureURL)
		if textureURL == "" {
			writeError(w, http.StatusBadRequest, "completed skin result needs an official Minecraft texture URL")
			return
		}
	} else {
		input.Error = strings.TrimSpace(input.Error)
		if len(input.Error) > 300 {
			input.Error = input.Error[:300]
		}
		if input.Error == "" {
			input.Error = "skin change failed"
		}
		errorText = input.Error
	}
	changed, _, err := a.db.Exec(`UPDATE skin_requests SET status=?,texture_url=?,model=?,error=?,updated_at=? WHERE id=? AND status='pending'`,
		input.Status, textureURL, model, errorText, nowString(), id)
	if err != nil {
		a.logger.Printf("update Minecraft skin result: %v", err)
		writeError(w, http.StatusInternalServerError, "could not store skin result")
		return
	}
	if changed == 0 {
		_, exists, queryErr := a.db.QueryOne("SELECT id FROM skin_requests WHERE id=?", id)
		if queryErr != nil {
			writeError(w, http.StatusInternalServerError, "could not store skin result")
			return
		}
		if !exists {
			writeError(w, http.StatusNotFound, "skin request not found")
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *App) authorizeMinecraftInternal(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Cache-Control", "no-store")
	if !a.hasMinecraftAuthSecret || !validMinecraftAuthToken(r.Header.Get("Authorization"), a.minecraftAuthSecret) {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return false
	}
	return true
}

func skinRequestID(r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	return id, err == nil && id > 0
}

func decodeJSONLimit(w http.ResponseWriter, r *http.Request, destination any, limit int64) error {
	r.Body = http.MaxBytesReader(w, r.Body, limit)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return err
	}
	var extra any
	if err := decoder.Decode(&extra); err == nil {
		return errors.New("request must contain one JSON object")
	} else if !errors.Is(err, io.EOF) {
		return err
	}
	return nil
}

func safeMinecraftTextureURL(value string) string {
	parsed, err := url.Parse(strings.TrimSpace(value))
	if err != nil || parsed.Scheme != "https" || !strings.EqualFold(parsed.Hostname(), "textures.minecraft.net") || parsed.Port() != "" || parsed.User != nil || parsed.RawQuery != "" || parsed.Fragment != "" {
		return ""
	}
	parts := strings.Split(parsed.EscapedPath(), "/")
	if len(parts) != 3 || parts[1] != "texture" || len(parts[2]) < 32 || len(parts[2]) > 128 {
		return ""
	}
	for _, r := range parts[2] {
		if !((r >= '0' && r <= '9') || (r >= 'a' && r <= 'f') || (r >= 'A' && r <= 'F')) {
			return ""
		}
	}
	return "https://textures.minecraft.net/texture/" + parts[2]
}

func (a *App) handlePlayerSkin(w http.ResponseWriter, r *http.Request) {
	if _, ok := a.requireUser(w, r); !ok {
		return
	}
	username := r.PathValue("username")
	if !validUsername(username) {
		writeError(w, http.StatusBadRequest, "invalid Minecraft nickname")
		return
	}
	if isHiddenPlayer(username) {
		http.NotFound(w, r)
		return
	}
	players, err := a.loadMinecraftPlayers()
	if err != nil {
		a.logger.Printf("load skin profile: %v", err)
		http.Error(w, "Could not load skin", http.StatusInternalServerError)
		return
	}
	var selected *minecraftPlayer
	for _, player := range players {
		if strings.EqualFold(player.Username, username) {
			selected = &player
			break
		}
	}
	if selected == nil {
		http.NotFound(w, r)
		return
	}
	source := safeMinecraftTextureURL(selected.Profile.Skin.TextureURL)
	var texture []byte
	if source != "" {
		texture, err = a.loadSkinTexture(r.Context(), source)
	} else {
		texture, _, err = a.loadDefaultSkinTexture(selected.UUID)
	}
	if err != nil {
		a.logger.Printf("load Minecraft skin texture: %v", err)
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Cache-Control", "private, no-cache")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(texture)
}

func (a *App) handlePlayerHead(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")
	if !validUsername(username) {
		http.Error(w, "Invalid Minecraft username", http.StatusBadRequest)
		return
	}
	if isHiddenPlayer(username) {
		http.NotFound(w, r)
		return
	}
	players, err := a.loadMinecraftPlayers()
	if err != nil {
		a.logger.Printf("load head profile: %v", err)
		http.Error(w, "Could not load player head", http.StatusServiceUnavailable)
		return
	}
	var selected *minecraftPlayer
	for i := range players {
		if strings.EqualFold(players[i].Username, username) {
			selected = &players[i]
			break
		}
	}
	if selected == nil {
		http.NotFound(w, r)
		return
	}

	source := safeMinecraftTextureURL(selected.Profile.Skin.TextureURL)
	var texture []byte
	usingDefaultSkin := source == ""
	if source != "" {
		texture, err = a.loadSkinTexture(r.Context(), source)
		if err != nil {
			a.logger.Printf("load custom Minecraft head texture: %v", err)
			usingDefaultSkin = true
			texture, _, err = a.loadDefaultSkinTexture(selected.UUID)
		}
	} else {
		texture, _, err = a.loadDefaultSkinTexture(selected.UUID)
	}
	if err != nil {
		a.logger.Printf("load Minecraft head texture: %v", err)
		if usingDefaultSkin && errors.Is(err, os.ErrNotExist) {
			http.NotFound(w, r)
			return
		}
		http.Error(w, "Could not load player head", http.StatusBadGateway)
		return
	}
	head, err := minecraftPlayerHeadPNG(texture)
	if err != nil {
		a.logger.Printf("crop Minecraft player head: %v", err)
		http.Error(w, "Could not load player head", http.StatusBadGateway)
		return
	}
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(head)
}

func minecraftPlayerHeadPNG(texture []byte) ([]byte, error) {
	skin, err := png.Decode(bytes.NewReader(texture))
	if err != nil {
		return nil, err
	}
	bounds := skin.Bounds()
	if bounds.Dx() != 64 || (bounds.Dy() != 32 && bounds.Dy() != 64) {
		return nil, errors.New("Minecraft skin is not a 64-pixel skin")
	}
	head := image.NewRGBA(image.Rect(0, 0, 8, 8))
	draw.Draw(head, head.Bounds(), skin, image.Pt(bounds.Min.X+8, bounds.Min.Y+8), draw.Src)
	if bounds.Dy() == 64 {
		draw.Draw(head, head.Bounds(), skin, image.Pt(bounds.Min.X+40, bounds.Min.Y+8), draw.Over)
	}
	var encoded bytes.Buffer
	if err := png.Encode(&encoded, head); err != nil {
		return nil, err
	}
	return encoded.Bytes(), nil
}

func (a *App) playerSkinDisplay(player minecraftPlayer) (textureURL, model string, available bool) {
	if safeMinecraftTextureURL(player.Profile.Skin.TextureURL) != "" {
		return playerSkinPath(player.Username), normalizeSkinModel(player.Profile.Skin.Model), true
	}
	_, model, err := a.loadDefaultSkinTexture(player.UUID)
	if err != nil {
		return "", "classic", false
	}
	return playerSkinPath(player.Username), model, true
}

func playerHeadVersion(player minecraftPlayer) string {
	source := safeMinecraftTextureURL(player.Profile.Skin.TextureURL)
	if source == "" {
		source = "default:" + strings.ToLower(player.UUID)
	}
	version := sha256.Sum256([]byte(source))
	return hex.EncodeToString(version[:12])
}

func defaultSkinSelection(uuid string) (assetPath, model string, ok bool) {
	if !playerUUIDPattern.MatchString(uuid) {
		return "", "", false
	}
	bytes, err := hex.DecodeString(strings.ReplaceAll(uuid, "-", ""))
	if err != nil || len(bytes) != 16 {
		return "", "", false
	}
	hash := binary.BigEndian.Uint32(bytes[0:4]) ^ binary.BigEndian.Uint32(bytes[4:8]) ^
		binary.BigEndian.Uint32(bytes[8:12]) ^ binary.BigEndian.Uint32(bytes[12:16])
	index := int32(hash) % 18
	if index < 0 {
		index += 18 // Java Math.floorMod(uuid.hashCode(), 18).
	}
	model = "classic"
	if index < 9 {
		model = "slim"
	} else {
		index -= 9
	}
	kind := "wide"
	if model == "slim" {
		kind = "slim"
	}
	return "assets/minecraft/textures/entity/player/" + kind + "/" + defaultSkinNames[index] + ".png", model, true
}

func (a *App) loadDefaultSkinTexture(uuid string) ([]byte, string, error) {
	assetPath, model, ok := defaultSkinSelection(uuid)
	if !ok {
		return nil, "", os.ErrNotExist
	}
	cacheKey := "minecraft-default:" + assetPath
	a.skinCacheMu.Lock()
	if entry, exists := a.skinCache[cacheKey]; exists && time.Now().Before(entry.expiresAt) {
		contents := append([]byte(nil), entry.contents...)
		a.skinCacheMu.Unlock()
		return contents, model, nil
	}
	delete(a.skinCache, cacheKey)
	a.skinCacheMu.Unlock()

	jarPath := filepath.Join(a.minecraftDataDir, "bluemap", minecraftClientJarName)
	info, err := os.Lstat(jarPath)
	if err != nil {
		return nil, "", err
	}
	if info.Mode()&os.ModeSymlink != 0 || !info.Mode().IsRegular() || info.Size() > maxMinecraftClientJarBytes {
		return nil, "", errors.New("Minecraft client archive is not a bounded regular file")
	}
	archive, err := zip.OpenReader(jarPath)
	if err != nil {
		return nil, "", err
	}
	defer archive.Close()
	var asset *zip.File
	for _, file := range archive.File {
		if file.Name == assetPath {
			asset = file
			break
		}
	}
	if asset == nil || asset.UncompressedSize64 > maxSkinTextureBytes || asset.CompressedSize64 > maxSkinTextureBytes {
		return nil, "", os.ErrNotExist
	}
	reader, err := asset.Open()
	if err != nil {
		return nil, "", err
	}
	contents, readErr := io.ReadAll(io.LimitReader(reader, maxSkinTextureBytes+1))
	closeErr := reader.Close()
	if readErr != nil {
		return nil, "", readErr
	}
	if closeErr != nil {
		return nil, "", closeErr
	}
	if len(contents) > maxSkinTextureBytes {
		return nil, "", errors.New("default Minecraft skin exceeds size limit")
	}
	config, err := png.DecodeConfig(bytes.NewReader(contents))
	if err != nil || config.Width != 64 || config.Height != 64 {
		return nil, "", errors.New("default Minecraft skin is not a 64×64 PNG")
	}
	if _, err := png.Decode(bytes.NewReader(contents)); err != nil {
		return nil, "", errors.New("default Minecraft skin is incomplete or invalid")
	}

	a.skinCacheMu.Lock()
	if a.skinCache == nil {
		a.skinCache = make(map[string]skinTextureCacheEntry)
	}
	if len(a.skinCache) >= 128 {
		for key := range a.skinCache {
			delete(a.skinCache, key)
		}
	}
	a.skinCache[cacheKey] = skinTextureCacheEntry{contents: append([]byte(nil), contents...), expiresAt: time.Now().Add(time.Hour)}
	a.skinCacheMu.Unlock()
	return contents, model, nil
}

func (a *App) loadSkinTexture(ctx context.Context, source string) ([]byte, error) {
	a.skinCacheMu.Lock()
	entry, exists := a.skinCache[source]
	if exists && time.Now().Before(entry.expiresAt) {
		contents := append([]byte(nil), entry.contents...)
		a.skinCacheMu.Unlock()
		return contents, nil
	}
	delete(a.skinCache, source)
	a.skinCacheMu.Unlock()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, source, nil)
	if err != nil {
		return nil, err
	}
	client := http.Client{Timeout: 5 * time.Second, CheckRedirect: func(req *http.Request, via []*http.Request) error {
		if len(via) >= 2 || safeMinecraftTextureURL(req.URL.String()) == "" {
			return errors.New("Minecraft texture redirect rejected")
		}
		return nil
	}}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Minecraft texture returned HTTP %d", response.StatusCode)
	}
	contents, err := io.ReadAll(io.LimitReader(response.Body, maxSkinTextureBytes+1))
	if err != nil || len(contents) > maxSkinTextureBytes {
		return nil, errors.New("Minecraft texture exceeds size limit")
	}
	config, err := png.DecodeConfig(bytes.NewReader(contents))
	if err != nil || config.Width != 64 || (config.Height != 64 && config.Height != 32) {
		return nil, errors.New("Minecraft texture is not a bounded PNG")
	}
	if _, err := png.Decode(bytes.NewReader(contents)); err != nil {
		return nil, errors.New("Minecraft texture is incomplete or invalid")
	}
	a.skinCacheMu.Lock()
	if a.skinCache == nil {
		a.skinCache = make(map[string]skinTextureCacheEntry)
	}
	if len(a.skinCache) >= 128 {
		for key := range a.skinCache {
			delete(a.skinCache, key)
		}
	}
	a.skinCache[source] = skinTextureCacheEntry{contents: append([]byte(nil), contents...), expiresAt: time.Now().Add(time.Hour)}
	a.skinCacheMu.Unlock()
	return contents, nil
}
