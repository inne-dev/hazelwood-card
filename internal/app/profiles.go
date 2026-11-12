package app

import (
	"crypto/md5"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

const (
	maxMinecraftFileBytes = 4 << 20
	maxUserCacheBytes     = 512 << 10
)

var (
	playerUUIDPattern    = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)
	advancementIDPattern = regexp.MustCompile(`^[a-z0-9_.-]+:[a-z0-9_./-]+$`)
)

type playerSummary struct {
	Username         string  `json:"username"`
	UUID             string  `json:"uuid"`
	Online           bool    `json:"online"`
	PlaySeconds      *int64  `json:"playSeconds"`
	AdvancementCount *int    `json:"advancementCount"`
	SkinURL          *string `json:"skinURL"`
}

type publicLeaderboardPlayer struct {
	Username         string `json:"username"`
	Online           *bool  `json:"online"`
	PlaySeconds      *int64 `json:"playSeconds"`
	AdvancementCount *int   `json:"advancementCount"`
}

type playerDimensionStats struct {
	Overworld *int64 `json:"overworld"`
	Nether    *int64 `json:"nether"`
	End       *int64 `json:"end"`
}

type playerStats struct {
	Available      bool                 `json:"available"`
	PlaySeconds    *int64               `json:"playSeconds"`
	Deaths         *int64               `json:"deaths"`
	MobKills       *int64               `json:"mobKills"`
	BlocksMined    *int64               `json:"blocksMined"`
	DistanceMeters *float64             `json:"distanceMeters"`
	Dimensions     playerDimensionStats `json:"dimensions"`
	TrackingSince  *string              `json:"trackingSince"`
}

type playerAdvancement struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Done        *bool    `json:"done"`
	CompletedAt *string  `json:"completedAt"`
	EarnedBy    []string `json:"earnedBy"`
	MissingBy   []string `json:"missingBy"`
}

type playerHistoryItem struct {
	Type            string           `json:"type"`
	At              string           `json:"at"`
	StartedAt       string           `json:"startedAt,omitempty"`
	DurationSeconds int64            `json:"durationSeconds"`
	Dimension       *string          `json:"dimension"`
	AdvancementID   *string          `json:"advancementId"`
	Deaths          *int64           `json:"deaths,omitempty"`
	Dimensions      map[string]int64 `json:"dimensions,omitempty"`
	Advancements    []string         `json:"advancements,omitempty"`
}

type playerSkin struct {
	TextureURL  string `json:"textureURL"`
	HeadVersion string `json:"headVersion"`
	Model       string `json:"model"`
	Available   bool   `json:"available"`
}

type playerDetailsResponse struct {
	Username     string              `json:"username"`
	UUID         string              `json:"uuid"`
	Online       bool                `json:"online"`
	Stats        playerStats         `json:"stats"`
	Advancements []playerAdvancement `json:"advancements"`
	History      []playerHistoryItem `json:"history"`
	Skin         playerSkin          `json:"skin"`
}

type minecraftPlayer struct {
	Username string
	UUID     string
	Online   bool
	Profile  minecraftPortalProfile
}

type minecraftStatsData struct {
	Stats map[string]map[string]json.Number `json:"stats"`
}

type minecraftAdvancementProgress struct {
	Done     bool              `json:"done"`
	Criteria map[string]string `json:"criteria"`
}

type minecraftPortalProfile struct {
	Username      string                 `json:"username"`
	UUID          string                 `json:"uuid"`
	UpdatedAt     string                 `json:"updatedAt"`
	TrackingSince string                 `json:"trackingSince"`
	Dimensions    map[string]json.Number `json:"dimensions"`
	History       []playerHistoryItem    `json:"history"`
	Skin          struct {
		TextureURL string `json:"textureURL"`
		Model      string `json:"model"`
	} `json:"skin"`
}

type advancementCatalogue struct {
	Advancements []struct {
		ID          string `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
	} `json:"advancements"`
}

type cachedPlayer struct {
	UUID string `json:"uuid"`
	Name string `json:"name"`
}

func (a *App) handleServerInfo(w http.ResponseWriter, _ *http.Request) {
	address := a.serverAddress
	if address == "" {
		address = "hazelwood.inne.space"
	}
	writeJSON(w, http.StatusOK, struct {
		Address   string `json:"address"`
		Downloads struct {
			Linux   *string `json:"linux"`
			MacOS   *string `json:"macos"`
			Windows *string `json:"windows"`
		} `json:"downloads"`
	}{Address: address})
}

func (a *App) handlePlayers(w http.ResponseWriter, r *http.Request) {
	if _, ok := a.requireUser(w, r); !ok {
		return
	}
	players, err := a.loadMinecraftPlayers()
	if err != nil {
		a.logger.Printf("load player directory: %v", err)
		writeError(w, http.StatusInternalServerError, "could not load players")
		return
	}
	result := make([]playerSummary, 0, len(players))
	for _, player := range players {
		if isHiddenPlayer(player.Username) {
			continue
		}
		stats, _, err := a.readPlayerStats(player.UUID)
		if err != nil && !errors.Is(err, fs.ErrNotExist) {
			a.logger.Printf("read player stats: %v", err)
		}
		advancements, known, err := a.readPlayerAdvancements(player.UUID)
		if err != nil && !errors.Is(err, fs.ErrNotExist) {
			a.logger.Printf("read player advancements: %v", err)
		}
		var playSeconds *int64
		if stats != nil {
			playSeconds = playSecondsFromStats(*stats)
		}
		var advancementCount *int
		if known {
			count := countCompletedAdvancements(advancements)
			advancementCount = &count
		}
		var skinURL *string
		if url, _, available := a.playerSkinDisplay(player); available {
			skinURL = &url
		}
		result = append(result, playerSummary{
			Username: player.Username, UUID: player.UUID, Online: player.Online,
			PlaySeconds: playSeconds, AdvancementCount: advancementCount, SkinURL: skinURL,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"players": result})
}

func (a *App) handleLeaderboard(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(`SELECT username FROM users ORDER BY username COLLATE NOCASE`)
	if err != nil {
		a.logger.Printf("load leaderboard accounts: %v", err)
		writeError(w, http.StatusInternalServerError, "could not load leaderboard")
		return
	}
	registered := make(map[string]struct{}, len(rows))
	for _, row := range rows {
		registered[strings.ToLower(valueString(row[0]))] = struct{}{}
	}

	players, err := a.loadMinecraftPlayers()
	if err != nil {
		a.logger.Printf("load leaderboard players: %v", err)
		writeError(w, http.StatusInternalServerError, "could not load leaderboard")
		return
	}
	statusAvailable := a.statusSnapshot().Available
	result := make([]publicLeaderboardPlayer, 0, len(registered))
	for _, player := range players {
		if isHiddenPlayer(player.Username) {
			continue
		}
		if _, ok := registered[strings.ToLower(player.Username)]; !ok {
			continue
		}
		stats, _, statsErr := a.readPlayerStats(player.UUID)
		if statsErr != nil && !errors.Is(statsErr, fs.ErrNotExist) {
			a.logger.Printf("read leaderboard stats: %v", statsErr)
		}
		advancements, known, advancementErr := a.readPlayerAdvancements(player.UUID)
		if advancementErr != nil && !errors.Is(advancementErr, fs.ErrNotExist) {
			a.logger.Printf("read leaderboard advancements: %v", advancementErr)
		}

		var online *bool
		if statusAvailable {
			value := player.Online
			online = &value
		}
		var playSeconds *int64
		if stats != nil {
			playSeconds = playSecondsFromStats(*stats)
		}
		var advancementCount *int
		if known {
			count := countCompletedAdvancements(advancements)
			advancementCount = &count
		}
		result = append(result, publicLeaderboardPlayer{
			Username: player.Username, Online: online,
			PlaySeconds: playSeconds, AdvancementCount: advancementCount,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"players": result})
}

func (a *App) handlePlayerDetails(w http.ResponseWriter, r *http.Request) {
	if _, ok := a.requireUser(w, r); !ok {
		return
	}
	username := r.PathValue("username")
	if !validUsername(username) {
		writeError(w, http.StatusBadRequest, "invalid Minecraft nickname")
		return
	}
	if isHiddenPlayer(username) {
		writeError(w, http.StatusNotFound, "player not found")
		return
	}
	players, err := a.loadMinecraftPlayers()
	if err != nil {
		a.logger.Printf("load player directory: %v", err)
		writeError(w, http.StatusInternalServerError, "could not load player profile")
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
		writeError(w, http.StatusNotFound, "player not found")
		return
	}
	profile := selected.Profile
	statsData, statsAvailable, statsErr := a.readPlayerStats(selected.UUID)
	if statsErr != nil && !errors.Is(statsErr, fs.ErrNotExist) {
		a.logger.Printf("read player stats: %v", statsErr)
	}
	advancementsByPlayer := make(map[string]map[string]minecraftAdvancementProgress, len(players))
	knownAdvancements := make(map[string]bool, len(players))
	for _, player := range players {
		advancements, known, readErr := a.readPlayerAdvancements(player.UUID)
		if readErr != nil && !errors.Is(readErr, fs.ErrNotExist) {
			a.logger.Printf("read player advancements: %v", readErr)
		}
		advancementsByPlayer[player.UUID] = advancements
		knownAdvancements[player.UUID] = known
	}
	items, err := a.buildPlayerAdvancements(selected, players, advancementsByPlayer, knownAdvancements)
	if err != nil {
		a.logger.Printf("load advancement catalogue: %v", err)
	}
	stats := buildPlayerStats(statsData, statsAvailable, profile)
	history := mergePlayerHistory(profile.History, advancementsByPlayer[selected.UUID], knownAdvancements[selected.UUID])
	_, model, skinAvailable := a.playerSkinDisplay(*selected)
	writeJSON(w, http.StatusOK, playerDetailsResponse{
		Username: selected.Username, UUID: selected.UUID, Online: selected.Online, Stats: stats,
		Advancements: items, History: history,
		Skin: playerSkin{TextureURL: playerSkinPath(selected.Username), HeadVersion: playerHeadVersion(*selected), Model: model, Available: skinAvailable},
	})
}

func mergePlayerHistory(pluginHistory []playerHistoryItem, advancements map[string]minecraftAdvancementProgress, known bool) []playerHistoryItem {
	history := append([]playerHistoryItem(nil), pluginHistory...)
	if known {
		for id, progress := range advancements {
			if !progress.Done || isRecipeAdvancement(id) {
				continue
			}
			duplicate := false
			for _, event := range history {
				if strings.EqualFold(event.Type, "advancement") && event.AdvancementID != nil && *event.AdvancementID == id {
					duplicate = true
					break
				}
			}
			if duplicate {
				continue
			}
			completedAt := advancementCompletionTime(progress.Criteria)
			if completedAt == nil {
				continue
			}
			advancementID := id
			history = append(history, playerHistoryItem{
				Type: "advancement", At: *completedAt, AdvancementID: &advancementID,
			})
		}
	}
	return summarizePlayerHistory(history)
}

const minimumRecordedSessionSeconds = 5 * 60

func summarizePlayerHistory(events []playerHistoryItem) []playerHistoryItem {
	ordered := append([]playerHistoryItem(nil), events...)
	sort.SliceStable(ordered, func(i, j int) bool {
		first, firstOK := parseMinecraftTimestamp(ordered[i].At)
		second, secondOK := parseMinecraftTimestamp(ordered[j].At)
		if firstOK != secondOK {
			return firstOK
		}
		if firstOK && !first.Equal(second) {
			return first.Before(second)
		}
		if !firstOK && ordered[i].At != ordered[j].At {
			return ordered[i].At < ordered[j].At
		}
		return historyEventPriority(ordered[i].Type) < historyEventPriority(ordered[j].Type)
	})

	var summaries []playerHistoryItem
	var current *playerHistoryItem
	finish := func(at string, durationSeconds int64) {
		if current == nil {
			return
		}
		current.At = at
		if durationSeconds <= 0 {
			start, startOK := parseMinecraftTimestamp(current.StartedAt)
			end, endOK := parseMinecraftTimestamp(at)
			if startOK && endOK {
				durationSeconds = int64(end.Sub(start).Seconds())
			}
		}
		current.DurationSeconds = max(0, durationSeconds)
		if current.DurationSeconds >= minimumRecordedSessionSeconds {
			summaries = append(summaries, *current)
		}
		current = nil
	}

	for _, event := range ordered {
		switch strings.ToLower(strings.ReplaceAll(strings.ReplaceAll(event.Type, "-", "_"), " ", "_")) {
		case "gameplay_session", "session_summary":
			if event.DurationSeconds >= minimumRecordedSessionSeconds {
				summaries = append(summaries, event)
			}
		case "session_started", "session_start":
			// A missing end marker can span a server restart. Discard it rather than
			// counting the disconnected time as part of a gameplay session.
			startedAt := event.At
			current = &playerHistoryItem{
				Type: "gameplay_session", StartedAt: startedAt,
				Dimensions: make(map[string]int64), Advancements: []string{},
			}
		case "session_ended", "session_end":
			finish(event.At, event.DurationSeconds)
		case "playtime", "dimension_time":
			if current != nil && event.Dimension != nil && event.DurationSeconds > 0 {
				current.Dimensions[*event.Dimension] = addHistorySeconds(current.Dimensions[*event.Dimension], event.DurationSeconds)
			}
		case "advancement", "advancement_earned":
			if current != nil && event.AdvancementID != nil && *event.AdvancementID != "" {
				appendUniqueHistoryAdvancement(current, *event.AdvancementID)
			}
		}
	}

	sort.SliceStable(summaries, func(i, j int) bool {
		first, firstOK := parseMinecraftTimestamp(summaries[i].At)
		second, secondOK := parseMinecraftTimestamp(summaries[j].At)
		if firstOK && secondOK {
			return first.After(second)
		}
		return summaries[i].At > summaries[j].At
	})
	if len(summaries) > 250 {
		summaries = summaries[:250]
	}
	if summaries == nil {
		return []playerHistoryItem{}
	}
	return summaries
}

func historyEventPriority(eventType string) int {
	switch strings.ToLower(strings.ReplaceAll(strings.ReplaceAll(eventType, "-", "_"), " ", "_")) {
	case "session_started", "session_start":
		return 0
	case "session_ended", "session_end":
		return 2
	default:
		return 1
	}
}

func appendUniqueHistoryAdvancement(session *playerHistoryItem, advancementID string) {
	for _, existing := range session.Advancements {
		if existing == advancementID {
			return
		}
	}
	session.Advancements = append(session.Advancements, advancementID)
}

func addHistorySeconds(current, added int64) int64 {
	if added > 0 && current > int64(^uint64(0)>>1)-added {
		return int64(^uint64(0) >> 1)
	}
	return current + added
}

func (a *App) loadMinecraftPlayers() ([]minecraftPlayer, error) {
	rows, err := a.db.Query(`SELECT username FROM users ORDER BY username COLLATE NOCASE`)
	if err != nil {
		return nil, err
	}
	byName := make(map[string]*minecraftPlayer, len(rows)+8)
	add := func(name, uuid string) *minecraftPlayer {
		if !validUsername(name) {
			return nil
		}
		key := strings.ToLower(name)
		if existing := byName[key]; existing != nil {
			if playerUUIDPattern.MatchString(uuid) {
				existing.UUID = strings.ToLower(uuid)
			}
			return existing
		}
		if !playerUUIDPattern.MatchString(uuid) {
			uuid = offlinePlayerUUID(name)
		}
		player := &minecraftPlayer{Username: name, UUID: strings.ToLower(uuid), Online: a.playerOnline(name)}
		byName[key] = player
		return player
	}
	for _, row := range rows {
		add(valueString(row[0]), "")
	}
	if cache, readErr := a.readUserCache(); readErr == nil {
		for _, entry := range cache {
			if !validUsername(entry.Name) || !playerUUIDPattern.MatchString(entry.UUID) {
				continue
			}
			add(entry.Name, entry.UUID)
		}
	} else if !errors.Is(readErr, fs.ErrNotExist) {
		a.logger.Printf("read Minecraft user cache: %v", readErr)
	}
	for _, statusPlayer := range a.statusSnapshot().Players {
		add(statusPlayer.Username, "")
	}
	players := make([]minecraftPlayer, 0, len(byName))
	for _, player := range byName {
		player.Online = a.playerOnline(player.Username)
		player.Profile = a.readPortalProfile(player.UUID)
		if (player.Profile.Username != "" && !strings.EqualFold(player.Profile.Username, player.Username)) ||
			(player.Profile.UUID != "" && !strings.EqualFold(player.Profile.UUID, player.UUID)) {
			player.Profile = minecraftPortalProfile{}
		}
		players = append(players, *player)
	}
	sort.Slice(players, func(i, j int) bool {
		return strings.ToLower(players[i].Username) < strings.ToLower(players[j].Username)
	})
	return players, nil
}

func (a *App) readUserCache() ([]cachedPlayer, error) {
	contents, err := readLimitedRegularFile(filepath.Join(a.minecraftDataDir, "usercache.json"), maxUserCacheBytes)
	if err != nil {
		return nil, err
	}
	var entries []cachedPlayer
	if err := json.Unmarshal(contents, &entries); err != nil {
		return nil, fmt.Errorf("parse user cache: %w", err)
	}
	return entries, nil
}

func (a *App) readPlayerStats(uuid string) (*minecraftStatsData, bool, error) {
	if !playerUUIDPattern.MatchString(uuid) {
		return nil, false, nil
	}
	path := filepath.Join(a.minecraftDataDir, "world", "players", "stats", strings.ToLower(uuid)+".json")
	contents, err := readLimitedRegularFile(path, maxMinecraftFileBytes)
	if err != nil {
		return nil, false, err
	}
	var stats minecraftStatsData
	if err := json.Unmarshal(contents, &stats); err != nil {
		return nil, false, fmt.Errorf("parse Minecraft stats: %w", err)
	}
	if stats.Stats == nil {
		return nil, false, errors.New("Minecraft stats file has no stats object")
	}
	return &stats, true, nil
}

func (a *App) readPlayerAdvancements(uuid string) (map[string]minecraftAdvancementProgress, bool, error) {
	if !playerUUIDPattern.MatchString(uuid) {
		return nil, false, nil
	}
	path := filepath.Join(a.minecraftDataDir, "world", "players", "advancements", strings.ToLower(uuid)+".json")
	contents, err := readLimitedRegularFile(path, maxMinecraftFileBytes)
	if err != nil {
		return nil, false, err
	}
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(contents, &raw); err != nil {
		return nil, false, fmt.Errorf("parse Minecraft advancements: %w", err)
	}
	if raw == nil {
		return nil, false, errors.New("Minecraft advancements file is empty")
	}
	progress := make(map[string]minecraftAdvancementProgress, len(raw))
	for id, entry := range raw {
		if !advancementIDPattern.MatchString(id) {
			continue
		}
		var item minecraftAdvancementProgress
		if err := json.Unmarshal(entry, &item); err != nil {
			return nil, false, fmt.Errorf("parse Minecraft advancement %q: %w", id, err)
		}
		progress[id] = item
	}
	return progress, true, nil
}

func (a *App) readPortalProfile(uuid string) minecraftPortalProfile {
	if !playerUUIDPattern.MatchString(uuid) {
		return minecraftPortalProfile{}
	}
	path := filepath.Join(a.minecraftDataDir, "plugins", "HazelwoodAuth", "portal", "profiles", strings.ToLower(uuid)+".json")
	contents, err := readLimitedRegularFile(path, maxMinecraftFileBytes)
	if err != nil {
		return minecraftPortalProfile{}
	}
	var profile minecraftPortalProfile
	if json.Unmarshal(contents, &profile) != nil || (profile.UUID != "" && !strings.EqualFold(profile.UUID, uuid)) || (profile.Username != "" && !validUsername(profile.Username)) {
		return minecraftPortalProfile{}
	}
	if profile.Skin.Model != "classic" && profile.Skin.Model != "slim" {
		profile.Skin.Model = "classic"
	}
	return profile
}

func (a *App) buildPlayerAdvancements(selected *minecraftPlayer, players []minecraftPlayer, progressByUUID map[string]map[string]minecraftAdvancementProgress, knownByUUID map[string]bool) ([]playerAdvancement, error) {
	catalogue := make(map[string]struct{ Title, Description string })
	path := filepath.Join(a.minecraftDataDir, "plugins", "HazelwoodAuth", "portal", "catalog.json")
	if contents, err := readLimitedRegularFile(path, maxMinecraftFileBytes); err == nil {
		var source advancementCatalogue
		if json.Unmarshal(contents, &source) == nil {
			for _, item := range source.Advancements {
				if !advancementIDPattern.MatchString(item.ID) || isRecipeAdvancement(item.ID) {
					continue
				}
				catalogue[item.ID] = struct{ Title, Description string }{strings.TrimSpace(item.Title), strings.TrimSpace(item.Description)}
			}
		}
	}
	for _, progress := range progressByUUID {
		for id := range progress {
			if !advancementIDPattern.MatchString(id) || isRecipeAdvancement(id) {
				continue
			}
			if _, exists := catalogue[id]; !exists {
				catalogue[id] = struct{ Title, Description string }{fallbackAdvancementTitle(id), ""}
			}
		}
	}
	ids := make([]string, 0, len(catalogue))
	for id := range catalogue {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	items := make([]playerAdvancement, 0, len(ids))
	for _, id := range ids {
		definition := catalogue[id]
		item := playerAdvancement{ID: id, Title: definition.Title, Description: definition.Description, EarnedBy: []string{}, MissingBy: []string{}}
		if item.Title == "" {
			item.Title = fallbackAdvancementTitle(id)
		}
		if selected != nil && knownByUUID[selected.UUID] {
			progress, exists := progressByUUID[selected.UUID][id]
			done := exists && progress.Done
			item.Done = &done
			if done {
				item.CompletedAt = advancementCompletionTime(progress.Criteria)
			}
		}
		for _, player := range players {
			if !knownByUUID[player.UUID] {
				continue
			}
			progress, exists := progressByUUID[player.UUID][id]
			if exists && progress.Done {
				item.EarnedBy = append(item.EarnedBy, player.Username)
			} else {
				item.MissingBy = append(item.MissingBy, player.Username)
			}
		}
		items = append(items, item)
	}
	return items, nil
}

func buildPlayerStats(data *minecraftStatsData, available bool, profile minecraftPortalProfile) playerStats {
	result := playerStats{
		Available: available,
		Dimensions: playerDimensionStats{
			Overworld: numberPointer(profile.Dimensions["overworld"]),
			Nether:    numberPointer(profile.Dimensions["nether"]),
			End:       numberPointer(profile.Dimensions["end"]),
		},
	}
	if profile.TrackingSince != "" {
		trackingSince := normalizeMinecraftTimestamp(profile.TrackingSince)
		result.TrackingSince = &trackingSince
	}
	if !available || data == nil {
		return result
	}
	custom := data.Stats["minecraft:custom"]
	if ticks, ok := playTicks(custom); ok {
		if value, valid := numberInt64(ticks); valid && value >= 0 {
			seconds := value / 20
			result.PlaySeconds = &seconds
		}
	}
	deaths := statInt64(custom["minecraft:deaths"])
	mobKills := statInt64(custom["minecraft:mob_kills"])
	blocksMined := int64(0)
	for _, count := range data.Stats["minecraft:mined"] {
		if value, ok := numberInt64(count); ok && value > 0 && blocksMined <= int64(^uint64(0)>>1)-value {
			blocksMined += value
		}
	}
	distanceCentimeters := int64(0)
	distanceFields := []string{"walk_one_cm", "sprint_one_cm", "swim_one_cm", "boat_one_cm", "minecart_one_cm", "pig_one_cm", "horse_one_cm", "aviate_one_cm", "fly_one_cm", "fall_one_cm", "climb_one_cm"}
	for _, field := range distanceFields {
		if value, ok := numberInt64(custom["minecraft:"+field]); ok && value > 0 && distanceCentimeters <= int64(^uint64(0)>>1)-value {
			distanceCentimeters += value
		}
	}
	distanceMeters := float64(distanceCentimeters) / 100
	result.Deaths, result.MobKills, result.BlocksMined, result.DistanceMeters = &deaths, &mobKills, &blocksMined, &distanceMeters
	return result
}

func playSecondsFromStats(data minecraftStatsData) *int64 {
	if ticks, ok := playTicks(data.Stats["minecraft:custom"]); ok {
		if value, valid := numberInt64(ticks); valid && value >= 0 {
			seconds := value / 20
			return &seconds
		}
	}
	return nil
}

func playTicks(custom map[string]json.Number) (json.Number, bool) {
	if ticks, ok := custom["minecraft:play_time"]; ok {
		return ticks, true
	}
	// Older vanilla versions persisted this same tick counter under this name.
	ticks, ok := custom["minecraft:play_one_minute"]
	return ticks, ok
}

func countCompletedAdvancements(progress map[string]minecraftAdvancementProgress) int {
	count := 0
	for id, item := range progress {
		if item.Done && !isRecipeAdvancement(id) {
			count++
		}
	}
	return count
}

func isRecipeAdvancement(id string) bool { return strings.Contains(id, ":recipes/") }

func fallbackAdvancementTitle(id string) string {
	_, name, _ := strings.Cut(id, ":")
	if slash := strings.LastIndex(name, "/"); slash >= 0 {
		name = name[slash+1:]
	}
	parts := strings.FieldsFunc(strings.ReplaceAll(name, "_", " "), func(r rune) bool { return r == ' ' })
	for i, part := range parts {
		if len(part) == 0 {
			continue
		}
		parts[i] = strings.ToUpper(part[:1]) + part[1:]
	}
	return strings.Join(parts, " ")
}

func advancementCompletionTime(criteria map[string]string) *string {
	var latest time.Time
	for _, timestamp := range criteria {
		parsed, ok := parseMinecraftTimestamp(timestamp)
		if ok && parsed.After(latest) {
			latest = parsed
		}
	}
	if latest.IsZero() {
		return nil
	}
	value := latest.UTC().Format(time.RFC3339)
	return &value
}

func normalizeMinecraftTimestamp(value string) string {
	if parsed, ok := parseMinecraftTimestamp(value); ok {
		return parsed.UTC().Format(time.RFC3339)
	}
	return value
}

func parseMinecraftTimestamp(value string) (time.Time, bool) {
	for _, layout := range []string{time.RFC3339Nano, "2006-01-02 15:04:05 -0700", "2006-01-02 15:04:05 -0700 MST"} {
		if parsed, err := time.Parse(layout, value); err == nil {
			return parsed, true
		}
	}
	return time.Time{}, false
}

func numberPointer(number json.Number) *int64 {
	value, ok := numberInt64(number)
	if !ok || value < 0 {
		return nil
	}
	return &value
}

func numberInt64(number json.Number) (int64, bool) {
	if number == "" {
		return 0, false
	}
	value, err := strconv.ParseInt(number.String(), 10, 64)
	return value, err == nil
}

func statInt64(number json.Number) int64 {
	value, ok := numberInt64(number)
	if !ok || value < 0 {
		return 0
	}
	return value
}

func offlinePlayerUUID(username string) string {
	// Minecraft's offline UUID is UUID.nameUUIDFromBytes("OfflinePlayer:" + name).
	// Keep it local: names never reach the filesystem directly.
	bytes := md5.Sum([]byte("OfflinePlayer:" + username))
	bytes[6] = (bytes[6] & 0x0f) | 0x30
	bytes[8] = (bytes[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x", bytes[0:4], bytes[4:6], bytes[6:8], bytes[8:10], bytes[10:16])
}

func readLimitedRegularFile(path string, limit int64) ([]byte, error) {
	info, err := os.Lstat(path)
	if err != nil {
		return nil, err
	}
	if info.Mode()&os.ModeSymlink != 0 || !info.Mode().IsRegular() || info.Size() > limit {
		return nil, errors.New("Minecraft data file is not a bounded regular file")
	}
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	opened, err := file.Stat()
	if err != nil || !opened.Mode().IsRegular() {
		return nil, errors.New("Minecraft data file is not a regular file")
	}
	contents, err := io.ReadAll(io.LimitReader(file, limit+1))
	if err != nil {
		return nil, err
	}
	if int64(len(contents)) > limit {
		return nil, errors.New("Minecraft data file exceeds size limit")
	}
	return contents, nil
}

func playerSkinPath(username string) string {
	return "/api/players/" + username + "/skin.png"
}

func normalizeSkinModel(model string) string {
	if model == "slim" {
		return "slim"
	}
	return "classic"
}
