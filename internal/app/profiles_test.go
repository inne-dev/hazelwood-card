package app

import (
	"crypto/sha256"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"hazelwood-card/internal/store"
)

func newProfileTestApp(t *testing.T) (*App, string, string) {
	t.Helper()
	db, err := store.Open(":memory:")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	dataDir := t.TempDir()
	secret := "profile-internal-test-secret"
	a := &App{
		db: db, logger: log.New(io.Discard, "", 0),
		minecraftDataDir: dataDir, serverAddress: "hazelwood.inne.space",
		status: Status{Players: []StatusPlayer{}},
	}
	if err := a.initSchema(); err != nil {
		t.Fatal(err)
	}
	if _, _, err := db.Exec(`INSERT INTO users(id,username,password_salt,password_hash,role,created_at) VALUES(1,'Alice','salt','hash','player',?)`, nowString()); err != nil {
		t.Fatal(err)
	}
	if _, _, err := db.Exec(`INSERT INTO users(id,username,password_salt,password_hash,role,created_at) VALUES(2,'Bob','salt','hash','player',?)`, nowString()); err != nil {
		t.Fatal(err)
	}
	if _, _, err := db.Exec(`INSERT INTO users(id,username,password_salt,password_hash,role,created_at) VALUES(3,'Carol','salt','hash','admin',?)`, nowString()); err != nil {
		t.Fatal(err)
	}
	if err := addTestSession(t, db, 1, "alice-session"); err != nil {
		t.Fatal(err)
	}
	if err := addTestSession(t, db, 2, "bob-session"); err != nil {
		t.Fatal(err)
	}
	if err := addTestSession(t, db, 3, "carol-session"); err != nil {
		t.Fatal(err)
	}
	a.minecraftAuthSecret = sha256Bytes(secret)
	a.hasMinecraftAuthSecret = true
	return a, dataDir, secret
}

func TestSummarizePlayerHistoryKeepsOnlySessionsOfAtLeastFiveMinutes(t *testing.T) {
	deaths := int64(2)
	stringPointer := func(value string) *string { return &value }
	events := []playerHistoryItem{
		{Type: "session_started", At: "2026-10-12T10:00:00Z", Dimension: stringPointer("overworld")},
		{Type: "playtime", At: "2026-10-12T10:04:00Z", DurationSeconds: 240, Dimension: stringPointer("overworld")},
		{Type: "advancement", At: "2026-10-12T10:02:00Z", AdvancementID: stringPointer("minecraft:story/root")},
		{Type: "session_ended", At: "2026-10-12T10:04:59Z", DurationSeconds: 299},
		{Type: "session_started", At: "2026-10-12T11:00:00Z"},
		{Type: "playtime", At: "2026-10-12T11:03:00Z", DurationSeconds: 180, Dimension: stringPointer("overworld")},
		{Type: "advancement", At: "2026-10-12T11:04:00Z", AdvancementID: stringPointer("minecraft:story/root")},
		{Type: "playtime", At: "2026-10-12T11:05:00Z", DurationSeconds: 120, Dimension: stringPointer("nether")},
		{Type: "session_ended", At: "2026-10-12T11:05:00Z", DurationSeconds: 300},
		{Type: "gameplay_session", At: "2026-10-12T12:04:59Z", StartedAt: "2026-10-12T12:00:00Z", DurationSeconds: 299, Deaths: &deaths},
		{Type: "gameplay_session", At: "2026-10-12T13:05:00Z", StartedAt: "2026-10-12T13:00:00Z", DurationSeconds: 300, Deaths: &deaths},
	}

	history := summarizePlayerHistory(events)
	if len(history) != 2 {
		t.Fatalf("history has %d records, want the two five-minute sessions only: %#v", len(history), history)
	}
	legacy := history[1]
	if legacy.DurationSeconds != 300 || legacy.StartedAt != "2026-10-12T11:00:00Z" || legacy.Dimensions["overworld"] != 180 || legacy.Dimensions["nether"] != 120 {
		t.Fatalf("legacy session should aggregate duration and time per world: %#v", legacy)
	}
	if len(legacy.Advancements) != 1 || legacy.Advancements[0] != "minecraft:story/root" {
		t.Fatalf("legacy session should include its achievements: %#v", legacy.Advancements)
	}
	if history[0].Type != "gameplay_session" || history[0].Deaths == nil || *history[0].Deaths != 2 {
		t.Fatalf("new summaries should retain their death count and sort newest first: %#v", history[0])
	}
}

func addTestSession(t *testing.T, db *store.DB, userID int64, token string) error {
	t.Helper()
	_, _, err := db.Exec("INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(?,?,?,?)", tokenHash(token), userID, nowString(), time.Now().UTC().Add(time.Hour).Format(time.RFC3339Nano))
	return err
}

func TestPlayerEndpointsMergePortalAndWorldData(t *testing.T) {
	a, dataDir, _ := newProfileTestApp(t)
	const aliceUUID = "edf78b19-f733-3619-a46a-56324548077e"
	const bobUUID = "ce65bf3a-5ea3-3afa-8522-d7677b785b05"
	writeProfileTestFile(t, dataDir, "usercache.json", `[{"uuid":"edf78b19-f733-3619-a46a-56324548077e","name":"Alice"},{"uuid":"ce65bf3a-5ea3-3afa-8522-d7677b785b05","name":"Bob"},{"uuid":"bcca837f-eef5-3acb-a9f4-6e6835d56ab3","name":"OldPlayer"}]`)
	writeProfileTestFile(t, dataDir, "world/players/stats/"+aliceUUID+".json", `{"stats":{"minecraft:custom":{"minecraft:play_time":401,"minecraft:deaths":2,"minecraft:mob_kills":4,"minecraft:walk_one_cm":120,"minecraft:sprint_one_cm":80},"minecraft:mined":{"minecraft:stone":2,"minecraft:dirt":3}}}`)
	writeProfileTestFile(t, dataDir, "world/players/stats/"+bobUUID+".json", `{"stats":{"minecraft:custom":{"minecraft:play_time":40}}}`)
	writeProfileTestFile(t, dataDir, "world/players/advancements/"+aliceUUID+".json", `{"minecraft:story/root":{"done":true,"criteria":{"crafting_table":"2026-05-09 13:56:45 +0300"}},"minecraft:recipes/decorations/crafting_table":{"done":true,"criteria":{}},"DataVersion":5023}`)
	writeProfileTestFile(t, dataDir, "world/players/advancements/"+bobUUID+".json", `{"minecraft:story/root":{"done":false,"criteria":{}}}`)
	writeProfileTestFile(t, dataDir, "plugins/HazelwoodAuth/portal/catalog.json", `{"advancements":[{"id":"minecraft:story/root","title":"Taking Inventory","description":"Open your inventory"},{"id":"minecraft:adventure/adventuring_time","title":"Adventuring Time","description":"Visit every biome"}]}`)
	writeProfileTestFile(t, dataDir, "plugins/HazelwoodAuth/portal/profiles/"+aliceUUID+".json", `{"username":"Alice","uuid":"edf78b19-f733-3619-a46a-56324548077e","trackingSince":"2026-05-01T00:00:00Z","dimensions":{"overworld":300,"nether":30,"end":null},"history":[{"type":"session_started","at":"2026-05-09T13:50:00+03:00","dimension":"overworld"},{"type":"playtime","at":"2026-05-09T13:56:00+03:00","durationSeconds":360,"dimension":"overworld"},{"type":"advancement","at":"2026-05-09T13:56:45+03:00","dimension":"nether","advancementId":"minecraft:story/root"},{"type":"playtime","at":"2026-05-09T14:00:00+03:00","durationSeconds":240,"dimension":"nether"},{"type":"session_ended","at":"2026-05-09T14:00:00+03:00","durationSeconds":600}],"skin":{"textureURL":"https://textures.minecraft.net/texture/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","model":"slim"}}`)
	a.status.Players = []StatusPlayer{{Username: "Bob"}}

	handler := a.Handler()
	unauthenticated := httptest.NewRecorder()
	handler.ServeHTTP(unauthenticated, httptest.NewRequest(http.MethodGet, "/api/players", nil))
	if unauthenticated.Code != http.StatusUnauthorized {
		t.Fatalf("unauthenticated list status = %d, want 401", unauthenticated.Code)
	}

	request := httptest.NewRequest(http.MethodGet, "/api/players", nil)
	request.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("list status = %d, body %s", response.Code, response.Body.String())
	}
	var directory struct {
		Players []playerSummary `json:"players"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &directory); err != nil {
		t.Fatal(err)
	}
	if len(directory.Players) != 4 {
		t.Fatalf("directory has %d players, want 4 merged portal accounts and cached world players: %#v", len(directory.Players), directory.Players)
	}
	var oldPlayer, alice playerSummary
	for _, player := range directory.Players {
		if player.Username == "OldPlayer" {
			oldPlayer = player
		}
		if player.Username == "Alice" {
			alice = player
		}
	}
	if oldPlayer.UUID != "bcca837f-eef5-3acb-a9f4-6e6835d56ab3" || oldPlayer.PlaySeconds != nil || oldPlayer.AdvancementCount != nil {
		t.Fatalf("unknown world stats should remain unknown: %#v", oldPlayer)
	}
	if alice.PlaySeconds == nil || *alice.PlaySeconds != 20 || alice.AdvancementCount == nil || *alice.AdvancementCount != 1 || alice.SkinURL == nil {
		t.Fatalf("Alice summary = %#v, want 20s, one non-recipe advancement and skin URL", alice)
	}

	detailsRequest := httptest.NewRequest(http.MethodGet, "/api/players/Alice/details", nil)
	detailsRequest.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	detailsResponse := httptest.NewRecorder()
	handler.ServeHTTP(detailsResponse, detailsRequest)
	if detailsResponse.Code != http.StatusOK {
		t.Fatalf("details status = %d, body %s", detailsResponse.Code, detailsResponse.Body.String())
	}
	var details struct {
		Online       bool                `json:"online"`
		Stats        playerStats         `json:"stats"`
		Advancements []playerAdvancement `json:"advancements"`
		History      []playerHistoryItem `json:"history"`
		Skin         playerSkin          `json:"skin"`
	}
	if err := json.Unmarshal(detailsResponse.Body.Bytes(), &details); err != nil {
		t.Fatal(err)
	}
	if details.Online {
		t.Fatal("Alice should be offline when only Bob appears in server status")
	}
	if !details.Stats.Available || details.Stats.PlaySeconds == nil || *details.Stats.PlaySeconds != 20 || details.Stats.Deaths == nil || *details.Stats.Deaths != 2 || details.Stats.BlocksMined == nil || *details.Stats.BlocksMined != 5 || details.Stats.DistanceMeters == nil || *details.Stats.DistanceMeters != 2 {
		t.Fatalf("unexpected Alice stats: %#v", details.Stats)
	}
	if details.Stats.Dimensions.Overworld == nil || *details.Stats.Dimensions.Overworld != 300 || details.Stats.Dimensions.End != nil || details.Stats.TrackingSince == nil {
		t.Fatalf("unexpected plugin tracking fields: %#v", details.Stats)
	}
	if len(details.History) != 1 || !details.Skin.Available || details.Skin.Model != "slim" {
		t.Fatalf("unexpected history/skin details: %#v %#v", details.History, details.Skin)
	}
	session := details.History[0]
	if session.Type != "gameplay_session" || session.DurationSeconds != 600 || session.StartedAt != "2026-05-09T13:50:00+03:00" {
		t.Fatalf("history should combine the connection into a 10-minute gameplay session: %#v", session)
	}
	if session.Dimensions["overworld"] != 360 || session.Dimensions["nether"] != 240 || len(session.Advancements) != 1 || session.Advancements[0] != "minecraft:story/root" {
		t.Fatalf("session should include time per world and its earned achievement: %#v", session)
	}
	var story *playerAdvancement
	var adventuring *playerAdvancement
	for i := range details.Advancements {
		switch details.Advancements[i].ID {
		case "minecraft:story/root":
			story = &details.Advancements[i]
		case "minecraft:adventure/adventuring_time":
			adventuring = &details.Advancements[i]
		}
	}
	if story == nil || story.Done == nil || !*story.Done || len(story.EarnedBy) != 1 || story.EarnedBy[0] != "Alice" || len(story.MissingBy) != 1 || story.MissingBy[0] != "Bob" || story.CompletedAt == nil {
		t.Fatalf("unexpected story comparison: %#v", story)
	}
	if adventuring == nil || adventuring.Done == nil || *adventuring.Done || len(adventuring.MissingBy) != 2 {
		t.Fatalf("catalogue-only advancement should compare known files: %#v", adventuring)
	}

	bobRequest := httptest.NewRequest(http.MethodGet, "/api/players/Bob/details", nil)
	bobRequest.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	bobResponse := httptest.NewRecorder()
	handler.ServeHTTP(bobResponse, bobRequest)
	var bobDetails struct {
		Online bool `json:"online"`
	}
	if bobResponse.Code != http.StatusOK || json.Unmarshal(bobResponse.Body.Bytes(), &bobDetails) != nil || !bobDetails.Online {
		t.Fatalf("Bob details should report online, status=%d body=%s", bobResponse.Code, bobResponse.Body.String())
	}
}

func TestPlayerDetailsHeadVersionChangesWithMinecraftSkin(t *testing.T) {
	a, dataDir, _ := newProfileTestApp(t)
	const aliceUUID = "edf78b19-f733-3619-a46a-56324548077e"
	const profilePath = "plugins/HazelwoodAuth/portal/profiles/" + aliceUUID + ".json"
	writeProfileTestFile(t, dataDir, "usercache.json", `[{"uuid":"edf78b19-f733-3619-a46a-56324548077e","name":"Alice"}]`)
	writeProfileTestFile(t, dataDir, profilePath, `{"username":"Alice","uuid":"edf78b19-f733-3619-a46a-56324548077e","skin":{"textureURL":"https://textures.minecraft.net/texture/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","model":"classic"}}`)

	readHeadVersion := func() string {
		t.Helper()
		request := httptest.NewRequest(http.MethodGet, "/api/players/Alice/details", nil)
		request.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
		response := httptest.NewRecorder()
		a.Handler().ServeHTTP(response, request)
		if response.Code != http.StatusOK {
			t.Fatalf("details status = %d, body %s", response.Code, response.Body.String())
		}
		var body struct {
			Skin struct {
				HeadVersion string `json:"headVersion"`
			} `json:"skin"`
		}
		if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
			t.Fatal(err)
		}
		return body.Skin.HeadVersion
	}

	firstVersion := readHeadVersion()
	if firstVersion == "" {
		t.Fatal("player details should include a cache-busting version for the head image")
	}
	writeProfileTestFile(t, dataDir, profilePath, `{"username":"Alice","uuid":"edf78b19-f733-3619-a46a-56324548077e","skin":{"textureURL":"https://textures.minecraft.net/texture/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","model":"classic"}}`)
	secondVersion := readHeadVersion()
	if secondVersion == firstVersion {
		t.Fatalf("head image version remained %q after Minecraft skin texture changed", firstVersion)
	}
}

func TestPublicLeaderboardLimitsFieldsAndPreservesUnknownStats(t *testing.T) {
	a, dataDir, _ := newProfileTestApp(t)
	const aliceUUID = "edf78b19-f733-3619-a46a-56324548077e"
	const bobUUID = "ce65bf3a-5ea3-3afa-8522-d7677b785b05"
	writeProfileTestFile(t, dataDir, "usercache.json", `[{"uuid":"edf78b19-f733-3619-a46a-56324548077e","name":"Alice"},{"uuid":"ce65bf3a-5ea3-3afa-8522-d7677b785b05","name":"Bob"},{"uuid":"bcca837f-eef5-3acb-a9f4-6e6835d56ab3","name":"Carol"},{"uuid":"d23c4b73-bec6-34c4-9062-5685d6810a9d","name":"OldPlayer"}]`)
	writeProfileTestFile(t, dataDir, "world/players/stats/"+aliceUUID+".json", `{"stats":{"minecraft:custom":{"minecraft:play_time":401}}}`)
	writeProfileTestFile(t, dataDir, "world/players/advancements/"+aliceUUID+".json", `{"minecraft:story/root":{"done":true,"criteria":{"crafting_table":"2026-05-09 13:56:45 +0300"}},"minecraft:recipes/decorations/crafting_table":{"done":true,"criteria":{}},"DataVersion":5023}`)
	a.status = Status{Available: true, Online: true, Players: []StatusPlayer{{Username: "Bob"}}}

	handler := a.Handler()
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/leaderboard", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("leaderboard status = %d, body %s", response.Code, response.Body.String())
	}
	if got := response.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control = %q, want no-store", got)
	}
	var body struct {
		Players []map[string]json.RawMessage `json:"players"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if len(body.Players) != 3 {
		t.Fatalf("public leaderboard has %d players, want only 3 registered accounts: %s", len(body.Players), response.Body.String())
	}
	byName := make(map[string]map[string]json.RawMessage, len(body.Players))
	allowed := map[string]bool{"username": true, "online": true, "playSeconds": true, "advancementCount": true}
	for _, player := range body.Players {
		for field := range player {
			if !allowed[field] {
				t.Errorf("public leaderboard exposed unexpected field %q", field)
			}
		}
		if len(player) != len(allowed) {
			t.Errorf("leaderboard player has %d fields, want %d: %#v", len(player), len(allowed), player)
		}
		var username string
		if err := json.Unmarshal(player["username"], &username); err != nil {
			t.Fatal(err)
		}
		byName[username] = player
	}
	if _, ok := byName["OldPlayer"]; ok {
		t.Fatal("public leaderboard included username from world cache without a portal account")
	}
	if string(byName["Alice"]["playSeconds"]) != "20" || string(byName["Alice"]["advancementCount"]) != "1" || string(byName["Alice"]["online"]) != "false" {
		t.Fatalf("Alice leaderboard row = %#v, want 20 seconds, one earned advancement, offline", byName["Alice"])
	}
	if string(byName["Bob"]["online"]) != "true" || string(byName["Bob"]["playSeconds"]) != "null" || string(byName["Bob"]["advancementCount"]) != "null" {
		t.Fatalf("Bob leaderboard row = %#v, want online with unavailable stats left null", byName["Bob"])
	}

	a.status.Available = false
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/leaderboard", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("offline leaderboard status = %d, body %s", response.Code, response.Body.String())
	}
	body.Players = nil
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if string(body.Players[0]["online"]) != "null" {
		t.Fatalf("offline server should leave online status unknown, got %s", body.Players[0]["online"])
	}
}

func TestMinecraftPlayerDataReaderBoundsFilesAndRejectsSymlinks(t *testing.T) {
	dir := t.TempDir()
	tooLarge := filepath.Join(dir, "large.json")
	if err := os.WriteFile(tooLarge, []byte(strings.Repeat("x", int(maxUserCacheBytes+1))), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := readLimitedRegularFile(tooLarge, maxUserCacheBytes); err == nil {
		t.Fatal("oversized file was accepted")
	}
	secret := filepath.Join(dir, "secret")
	if err := os.WriteFile(secret, []byte("not Minecraft data"), 0o600); err != nil {
		t.Fatal(err)
	}
	link := filepath.Join(dir, "link.json")
	if err := os.Symlink(secret, link); err == nil {
		if _, err := readLimitedRegularFile(link, 1024); err == nil {
			t.Fatal("symlink was accepted")
		}
	}
}

func TestOfflinePlayerUUIDMatchesMinecraftAlgorithm(t *testing.T) {
	first := offlinePlayerUUID("Alice")
	if !playerUUIDPattern.MatchString(first) || first != offlinePlayerUUID("Alice") {
		t.Fatalf("offline UUID should be canonical and stable, got %q", first)
	}
	if first == offlinePlayerUUID("alice") {
		t.Fatal("offline UUID must preserve Minecraft nickname case")
	}
	if got := offlinePlayerUUID("inne"); got != "ce65bf3a-5ea3-3afa-8522-d7677b785b05" {
		t.Fatalf("offline UUID for server player inne = %s, want Minecraft's usercache UUID", got)
	}
}

func TestServerInfoExposesAddressAndUnconfiguredDownloads(t *testing.T) {
	a := &App{serverAddress: "hazelwood.inne.space"}
	response := httptest.NewRecorder()
	a.Handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/server-info", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("server info status = %d", response.Code)
	}
	var info struct {
		Address   string         `json:"address"`
		Downloads map[string]any `json:"downloads"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &info); err != nil {
		t.Fatal(err)
	}
	if info.Address != "hazelwood.inne.space" || info.Downloads["linux"] != nil || info.Downloads["macos"] != nil || info.Downloads["windows"] != nil {
		t.Fatalf("unexpected server info response: %#v", info)
	}
}

func writeProfileTestFile(t *testing.T, root, relativePath, contents string) {
	t.Helper()
	path := filepath.Join(root, filepath.FromSlash(relativePath))
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(contents), 0o600); err != nil {
		t.Fatal(err)
	}
}

func sha256Bytes(secret string) [32]byte {
	return sha256.Sum256([]byte(secret))
}
