package app

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"io"
	"math"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sync"
	"time"
)

const (
	mapPreviewTTL          = 12 * time.Hour
	mapPreviewRetryDelay   = 5 * time.Minute
	mapPreviewBuildTimeout = 45 * time.Second
	mapPreviewTilePixels   = 160
	mapPreviewTileRadius   = 4
	maxMapPreviewTileBytes = 8 << 20
	maxMapPreviewBytes     = 16 << 20
	maxBlueMapSettingsSize = 1 << 20
	maxBlueMapLODCount     = 8
	maxBlueMapTileSize     = 1024
)

var mapPreviewClient = &http.Client{Timeout: 4 * time.Second}

type mapPreviewCache struct {
	mu          sync.RWMutex
	png         []byte
	updatedAt   time.Time
	lastAttempt time.Time
	lastError   error
	refreshing  bool
	done        chan struct{}
}

type blueMapIndex struct {
	Maps []string `json:"maps"`
}

type blueMapSettings struct {
	StartPos []float64 `json:"startPos"`
	Lowres   struct {
		TileSize  []float64 `json:"tileSize"`
		LODFactor int       `json:"lodFactor"`
		LODCount  int       `json:"lodCount"`
	} `json:"lowres"`
}

func (a *App) loadMapPreviewCache() error {
	if a.mapPreviewPath == "" {
		return nil
	}
	file, err := os.Open(a.mapPreviewPath)
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		return err
	}
	if info.Size() <= 0 || info.Size() > maxMapPreviewBytes {
		return fmt.Errorf("cached PNG size %d is outside limits", info.Size())
	}
	data, err := io.ReadAll(io.LimitReader(file, maxMapPreviewBytes+1))
	if err != nil {
		return err
	}
	if len(data) > maxMapPreviewBytes {
		return fmt.Errorf("cached PNG exceeds %d bytes", maxMapPreviewBytes)
	}
	if _, err := png.DecodeConfig(bytes.NewReader(data)); err != nil {
		return fmt.Errorf("decode cached PNG: %w", err)
	}

	a.mapPreview.mu.Lock()
	a.mapPreview.png = data
	a.mapPreview.updatedAt = info.ModTime()
	a.mapPreview.mu.Unlock()
	return nil
}

func (a *App) handleMapPreview(w http.ResponseWriter, r *http.Request) {
	data, updatedAt := a.cachedMapPreview()
	if len(data) == 0 {
		ctx, cancel := context.WithTimeout(r.Context(), mapPreviewBuildTimeout)
		err := a.refreshMapPreview(ctx)
		cancel()
		if err != nil {
			http.Error(w, "Map preview unavailable", http.StatusServiceUnavailable)
			return
		}
		data, updatedAt = a.cachedMapPreview()
		if len(data) == 0 {
			http.Error(w, "Map preview unavailable", http.StatusServiceUnavailable)
			return
		}
	} else if time.Since(updatedAt) >= mapPreviewTTL {
		a.scheduleMapPreviewRefresh()
	}

	age := time.Since(updatedAt)
	if age < 0 {
		age = 0
	}
	maxAge := 0
	if age < mapPreviewTTL {
		maxAge = int((mapPreviewTTL - age).Seconds())
	}
	etag := fmt.Sprintf(`"%x"`, updatedAt.UnixNano())
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d, stale-while-revalidate=300", maxAge))
	w.Header().Set("Last-Modified", updatedAt.UTC().Format(http.TimeFormat))
	w.Header().Set("ETag", etag)
	w.Header().Set("X-Content-Type-Options", "nosniff")
	if r.Header.Get("If-None-Match") == etag {
		w.WriteHeader(http.StatusNotModified)
		return
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(data)
}

func (a *App) cachedMapPreview() ([]byte, time.Time) {
	a.mapPreview.mu.RLock()
	defer a.mapPreview.mu.RUnlock()
	return a.mapPreview.png, a.mapPreview.updatedAt
}

func (a *App) scheduleMapPreviewRefresh() {
	done, shouldRun := a.beginMapPreviewRefresh()
	if !shouldRun {
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), mapPreviewBuildTimeout)
		defer cancel()
		if err := a.performMapPreviewRefresh(ctx, done); err != nil {
			a.logger.Printf("refresh map preview: %v", err)
		}
	}()
}

func (a *App) refreshMapPreview(ctx context.Context) error {
	done, shouldRun := a.beginMapPreviewRefresh()
	if shouldRun {
		return a.performMapPreviewRefresh(ctx, done)
	}
	if done == nil {
		return nil
	}

	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-done:
		a.mapPreview.mu.RLock()
		err := a.mapPreview.lastError
		a.mapPreview.mu.RUnlock()
		return err
	}
}

func (a *App) beginMapPreviewRefresh() (chan struct{}, bool) {
	a.mapPreview.mu.Lock()
	defer a.mapPreview.mu.Unlock()

	if !a.mapPreview.updatedAt.IsZero() && time.Since(a.mapPreview.updatedAt) < mapPreviewTTL {
		return nil, false
	}
	if a.mapPreview.refreshing {
		return a.mapPreview.done, false
	}
	if a.mapPreview.lastError != nil && time.Since(a.mapPreview.lastAttempt) < mapPreviewRetryDelay {
		return nil, false
	}
	done := make(chan struct{})
	a.mapPreview.refreshing = true
	a.mapPreview.done = done
	a.mapPreview.lastAttempt = time.Now()
	a.mapPreview.lastError = nil
	return done, true
}

func (a *App) performMapPreviewRefresh(ctx context.Context, done chan struct{}) error {
	data, err := a.generateMapPreview(ctx)
	if err == nil && a.mapPreviewPath != "" {
		if writeErr := writeMapPreviewFile(a.mapPreviewPath, data); writeErr != nil {
			a.logger.Printf("persist map preview: %v", writeErr)
		}
	}

	a.mapPreview.mu.Lock()
	if err == nil {
		a.mapPreview.png = data
		a.mapPreview.updatedAt = time.Now()
	}
	a.mapPreview.lastError = err
	a.mapPreview.refreshing = false
	a.mapPreview.done = nil
	close(done)
	a.mapPreview.mu.Unlock()
	return err
}

func writeMapPreviewFile(path string, data []byte) error {
	directory := filepath.Dir(path)
	if err := os.MkdirAll(directory, 0o700); err != nil {
		return err
	}
	file, err := os.CreateTemp(directory, ".map-preview-*.tmp")
	if err != nil {
		return err
	}
	tempPath := file.Name()
	defer os.Remove(tempPath)
	if err := file.Chmod(0o600); err != nil {
		_ = file.Close()
		return err
	}
	if _, err := file.Write(data); err != nil {
		_ = file.Close()
		return err
	}
	if err := file.Sync(); err != nil {
		_ = file.Close()
		return err
	}
	if err := file.Close(); err != nil {
		return err
	}
	return os.Rename(tempPath, path)
}

func (a *App) mapPreviewWorker(ctx context.Context) {
	for {
		refreshCtx, cancel := context.WithTimeout(ctx, mapPreviewBuildTimeout)
		err := a.refreshMapPreview(refreshCtx)
		cancel()
		if err != nil && ctx.Err() == nil {
			a.logger.Printf("refresh map preview: %v", err)
		}

		timer := time.NewTimer(a.nextMapPreviewDelay())
		select {
		case <-ctx.Done():
			timer.Stop()
			return
		case <-timer.C:
		}
	}
}

func (a *App) nextMapPreviewDelay() time.Duration {
	a.mapPreview.mu.RLock()
	updatedAt := a.mapPreview.updatedAt
	lastAttempt := a.mapPreview.lastAttempt
	a.mapPreview.mu.RUnlock()
	now := time.Now()

	if updatedAt.IsZero() || now.Sub(updatedAt) >= mapPreviewTTL {
		if lastAttempt.IsZero() {
			return 0
		}
		delay := lastAttempt.Add(mapPreviewRetryDelay).Sub(now)
		if delay < 0 {
			return 0
		}
		return delay
	}
	return updatedAt.Add(mapPreviewTTL).Sub(now)
}

func (a *App) generateMapPreview(ctx context.Context) ([]byte, error) {
	indexData, status, err := a.fetchMapPreviewResource(ctx, "settings.json", maxBlueMapSettingsSize)
	if err != nil {
		return nil, fmt.Errorf("fetch BlueMap settings: %w", err)
	}
	if status != http.StatusOK {
		return nil, fmt.Errorf("BlueMap settings returned HTTP %d", status)
	}
	var index blueMapIndex
	if err := json.Unmarshal(indexData, &index); err != nil {
		return nil, fmt.Errorf("parse BlueMap settings: %w", err)
	}
	mapID := chooseBlueMapID(index.Maps)
	if mapID == "" {
		return nil, errors.New("BlueMap did not publish a map")
	}

	settingsPath, _ := url.JoinPath("maps", mapID, "settings.json")
	settingsData, status, err := a.fetchMapPreviewResource(ctx, settingsPath, maxBlueMapSettingsSize)
	if err != nil {
		return nil, fmt.Errorf("fetch map settings: %w", err)
	}
	if status != http.StatusOK {
		return nil, fmt.Errorf("map settings returned HTTP %d", status)
	}
	var settings blueMapSettings
	if err := json.Unmarshal(settingsData, &settings); err != nil {
		return nil, fmt.Errorf("parse map settings: %w", err)
	}
	if len(settings.Lowres.TileSize) < 2 || len(settings.StartPos) < 2 || settings.Lowres.LODCount < 1 {
		return nil, errors.New("BlueMap map settings are missing low-resolution tile geometry")
	}
	for _, size := range settings.Lowres.TileSize[:2] {
		if size <= 0 || size > maxBlueMapTileSize {
			return nil, errors.New("BlueMap map settings contain an unsupported low-resolution tile size")
		}
	}
	if settings.Lowres.LODFactor < 2 {
		return nil, errors.New("BlueMap map settings contain an invalid LOD factor")
	}
	if settings.Lowres.LODCount > maxBlueMapLODCount {
		settings.Lowres.LODCount = maxBlueMapLODCount
	}

	for lod := 1; lod <= settings.Lowres.LODCount; lod++ {
		radius := mapPreviewTileRadius
		if lod > 1 {
			radius = 2
		}
		imageData, hasContent, err := a.renderMapPreviewLOD(ctx, mapID, settings, lod, radius)
		if err != nil {
			return nil, err
		}
		if hasContent {
			return imageData, nil
		}
	}
	return nil, errors.New("BlueMap has no rendered low-resolution map tiles near the start position")
}

func chooseBlueMapID(ids []string) string {
	for _, id := range ids {
		if id == "world" && validBlueMapID(id) {
			return id
		}
	}
	for _, id := range ids {
		if validBlueMapID(id) {
			return id
		}
	}
	return ""
}

func validBlueMapID(id string) bool {
	if id == "" || len(id) > 64 {
		return false
	}
	for _, character := range id {
		if (character >= 'a' && character <= 'z') || (character >= 'A' && character <= 'Z') || (character >= '0' && character <= '9') || character == '_' || character == '-' {
			continue
		}
		return false
	}
	return true
}

func (a *App) renderMapPreviewLOD(ctx context.Context, mapID string, settings blueMapSettings, lod, radius int) ([]byte, bool, error) {
	tileBlocksX := settings.Lowres.TileSize[0] * math.Pow(float64(settings.Lowres.LODFactor), float64(lod-1))
	tileBlocksZ := settings.Lowres.TileSize[1] * math.Pow(float64(settings.Lowres.LODFactor), float64(lod-1))
	centerX := int(math.Floor(settings.StartPos[0] / tileBlocksX))
	centerZ := int(math.Floor(settings.StartPos[1] / tileBlocksZ))
	minX, maxX := centerX-radius, centerX+radius
	minZ, maxZ := centerZ-radius, centerZ+radius
	columns, rows := maxX-minX+1, maxZ-minZ+1
	canvas := image.NewRGBA(image.Rect(0, 0, columns*mapPreviewTilePixels, rows*mapPreviewTilePixels))
	var content image.Rectangle
	hasContent := false
	loadedTiles := 0

	for tileZ := minZ; tileZ <= maxZ; tileZ++ {
		for tileX := minX; tileX <= maxX; tileX++ {
			if err := ctx.Err(); err != nil {
				return nil, false, err
			}
			tilePath := fmt.Sprintf("maps/%s/tiles/%d/x%d/z%d.png", mapID, lod, tileX, tileZ)
			tileData, status, err := a.fetchMapPreviewResource(ctx, tilePath, maxMapPreviewTileBytes)
			if err != nil {
				return nil, false, fmt.Errorf("fetch tile x=%d z=%d lod=%d: %w", tileX, tileZ, lod, err)
			}
			if status == http.StatusNoContent || status == http.StatusNotFound {
				continue
			}
			if status != http.StatusOK {
				return nil, false, fmt.Errorf("tile x=%d z=%d lod=%d returned HTTP %d", tileX, tileZ, lod, status)
			}
			config, err := png.DecodeConfig(bytes.NewReader(tileData))
			if err != nil {
				return nil, false, fmt.Errorf("read tile x=%d z=%d lod=%d dimensions: %w", tileX, tileZ, lod, err)
			}
			if config.Width > int(settings.Lowres.TileSize[0])+2 || config.Height > int(settings.Lowres.TileSize[1])*2+2 {
				return nil, false, fmt.Errorf("tile x=%d z=%d lod=%d exceeds configured dimensions", tileX, tileZ, lod)
			}
			tile, err := png.Decode(bytes.NewReader(tileData))
			if err != nil {
				return nil, false, fmt.Errorf("decode tile x=%d z=%d lod=%d: %w", tileX, tileZ, lod, err)
			}
			bounds := tile.Bounds()
			sourceWidth := min(int(settings.Lowres.TileSize[0]), bounds.Dx())
			sourceHeight := min(int(settings.Lowres.TileSize[1]), bounds.Dy()/2)
			if sourceWidth <= 0 || sourceHeight <= 0 {
				continue
			}

			destinationX := (tileX - minX) * mapPreviewTilePixels
			destinationY := (tileZ - minZ) * mapPreviewTilePixels
			for y := 0; y < mapPreviewTilePixels; y++ {
				sourceY := bounds.Min.Y + y*sourceHeight/mapPreviewTilePixels
				for x := 0; x < mapPreviewTilePixels; x++ {
					sourceX := bounds.Min.X + x*sourceWidth/mapPreviewTilePixels
					pixel := color.RGBAModel.Convert(tile.At(sourceX, sourceY)).(color.RGBA)
					canvas.SetRGBA(destinationX+x, destinationY+y, pixel)
					if pixel.A > 0 {
						pixelBounds := image.Rect(destinationX+x, destinationY+y, destinationX+x+1, destinationY+y+1)
						if !hasContent {
							content = pixelBounds
							hasContent = true
						} else {
							content = content.Union(pixelBounds)
						}
					}
				}
			}
			loadedTiles++
		}
	}
	if loadedTiles == 0 || !hasContent {
		return nil, false, nil
	}

	content = content.Inset(-mapPreviewTilePixels / 12)
	content = content.Intersect(canvas.Bounds())
	cropped := canvas.SubImage(content)
	var output bytes.Buffer
	encoder := png.Encoder{CompressionLevel: png.BestSpeed}
	if err := encoder.Encode(&output, cropped); err != nil {
		return nil, false, fmt.Errorf("encode map preview: %w", err)
	}
	if output.Len() > maxMapPreviewBytes {
		return nil, false, fmt.Errorf("generated map preview exceeds %d bytes", maxMapPreviewBytes)
	}
	return output.Bytes(), true, nil
}

func (a *App) fetchMapPreviewResource(ctx context.Context, relativePath string, limit int64) ([]byte, int, error) {
	target, err := url.JoinPath(a.mapURL.String(), relativePath)
	if err != nil {
		return nil, 0, err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return nil, 0, err
	}
	response, err := mapPreviewClient.Do(request)
	if err != nil {
		return nil, 0, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, 64<<10))
		return nil, response.StatusCode, nil
	}
	data, err := io.ReadAll(io.LimitReader(response.Body, limit+1))
	if err != nil {
		return nil, response.StatusCode, err
	}
	if int64(len(data)) > limit {
		return nil, response.StatusCode, fmt.Errorf("response exceeds %d bytes", limit)
	}
	return data, response.StatusCode, nil
}
