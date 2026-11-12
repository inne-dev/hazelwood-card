package app

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	_ "image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

const (
	seasonalIconConfigPath = "assets/brand/seasonal-icons.json"
	seasonalIconFallback   = "hazelwood-favicon.png"
	maxSeasonalConfigSize  = 32 << 10
	maxSeasonalIconSize    = 256 << 10
)

var seasonalIDPattern = regexp.MustCompile(`^[a-z0-9-]+$`)

type seasonalIconConfig struct {
	Timezone           string             `json:"timezone"`
	MinimumDisplayDays int                `json:"minimumDisplayDays"`
	Seasons            []seasonalIconRule `json:"seasons"`
}

type seasonalIconRule struct {
	ID       string `json:"id"`
	Start    string `json:"start"`
	End      string `json:"end"`
	Priority int    `json:"priority"`
	Icon     string `json:"icon"`
}

func (a *App) handleSeasonalIcon(w http.ResponseWriter, _ *http.Request) {
	iconName := seasonalIconFallback
	configData, err := readLimitedFile(filepath.Join(a.webDir, seasonalIconConfigPath), maxSeasonalConfigSize)
	if err != nil {
		a.logger.Printf("read seasonal icon schedule: %v", err)
	} else {
		var config seasonalIconConfig
		if err := json.Unmarshal(configData, &config); err != nil {
			a.logger.Printf("parse seasonal icon schedule: %v", err)
		} else if location, err := validateSeasonalIconConfig(config); err != nil {
			a.logger.Printf("validate seasonal icon schedule: %v", err)
		} else if active, ok := activeSeasonalIcon(config.Seasons, time.Now().In(location)); ok {
			iconName = active.Icon
		}
	}
	iconPath := filepath.Join(a.webDir, "assets", "brand", iconName)
	iconData, err := readLimitedFile(iconPath, maxSeasonalIconSize)
	if err != nil || !validSeasonalPNG(iconData) {
		if iconName != seasonalIconFallback {
			a.logger.Printf("read seasonal icon %q; using default icon", iconName)
			iconData, err = readLimitedFile(filepath.Join(a.webDir, "assets", "brand", seasonalIconFallback), maxSeasonalIconSize)
		}
		if err != nil || !validSeasonalPNG(iconData) {
			http.Error(w, "Seasonal icon unavailable", http.StatusInternalServerError)
			return
		}
	}
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	_, _ = w.Write(iconData)
}

func validateSeasonalIconConfig(config seasonalIconConfig) (*time.Location, error) {
	if strings.TrimSpace(config.Timezone) == "" {
		return nil, errors.New("timezone is required")
	}
	location, err := time.LoadLocation(config.Timezone)
	if err != nil {
		return nil, fmt.Errorf("invalid timezone %q: %w", config.Timezone, err)
	}
	if config.MinimumDisplayDays < 7 {
		return nil, errors.New("minimumDisplayDays must be at least 7")
	}
	if len(config.Seasons) == 0 {
		return nil, errors.New("at least one season is required")
	}
	seen := make(map[string]struct{}, len(config.Seasons))
	for _, season := range config.Seasons {
		if !seasonalIDPattern.MatchString(season.ID) {
			return nil, fmt.Errorf("invalid season id %q", season.ID)
		}
		if _, exists := seen[season.ID]; exists {
			return nil, fmt.Errorf("duplicate season id %q", season.ID)
		}
		seen[season.ID] = struct{}{}
		if season.Icon == "" || filepath.Base(season.Icon) != season.Icon || !strings.HasSuffix(strings.ToLower(season.Icon), ".png") {
			return nil, fmt.Errorf("season %q must use a PNG filename without a path", season.ID)
		}
		start, err := parseSeasonDay(season.Start)
		if err != nil {
			return nil, fmt.Errorf("season %q start: %w", season.ID, err)
		}
		end, err := parseSeasonDay(season.End)
		if err != nil {
			return nil, fmt.Errorf("season %q end: %w", season.ID, err)
		}
		if end.Before(start) {
			end = end.AddDate(1, 0, 0)
		}
		displayDays := int(end.Sub(start).Hours()/24) + 1
		if displayDays < config.MinimumDisplayDays {
			return nil, fmt.Errorf("season %q lasts %d days; minimum is %d", season.ID, displayDays, config.MinimumDisplayDays)
		}
	}
	return location, nil
}

func parseSeasonDay(value string) (time.Time, error) {
	parsed, err := time.Parse("2006-01-02", "2000-"+value)
	if err != nil {
		return time.Time{}, fmt.Errorf("expected MM-DD date: %w", err)
	}
	if parsed.Format("01-02") != value {
		return time.Time{}, errors.New("expected a zero-padded MM-DD date")
	}
	return parsed, nil
}

func activeSeasonalIcon(seasons []seasonalIconRule, now time.Time) (seasonalIconRule, bool) {
	day := now.Format("01-02")
	var active seasonalIconRule
	found := false
	for _, season := range seasons {
		inRange := season.Start <= season.End && day >= season.Start && day <= season.End
		if season.Start > season.End {
			inRange = day >= season.Start || day <= season.End
		}
		if inRange && (!found || season.Priority > active.Priority) {
			active = season
			found = true
		}
	}
	return active, found
}

func validSeasonalPNG(data []byte) bool {
	if len(data) == 0 || len(data) > maxSeasonalIconSize {
		return false
	}
	config, format, err := image.DecodeConfig(bytes.NewReader(data))
	return err == nil && format == "png" && config.Width == 64 && config.Height == 64
}

func readLimitedFile(path string, limit int64) ([]byte, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	data, err := io.ReadAll(io.LimitReader(file, limit+1))
	if err != nil {
		return nil, err
	}
	if int64(len(data)) > limit {
		return nil, fmt.Errorf("file exceeds %d bytes", limit)
	}
	return data, nil
}
