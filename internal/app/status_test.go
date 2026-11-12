package app

import (
	"encoding/json"
	"io"
	"log"
	"net/http/httptest"
	"testing"

	"hazelwood-card/internal/store"
)

func newStatusTestApp(t *testing.T) *App {
	t.Helper()
	db, err := store.Open(":memory:")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	a := &App{db: db, logger: log.New(io.Discard, "", 0), status: Status{Players: []StatusPlayer{}}}
	if err := a.initSchema(); err != nil {
		t.Fatal(err)
	}
	return a
}

func TestHandleStatusIncludesRegisteredPlayersWhenServerUnavailable(t *testing.T) {
	a := newStatusTestApp(t)
	for _, player := range []struct {
		username string
		role     string
		bannedAt any
	}{
		{username: "Builder", role: "player"},
		{username: "Visitor", role: "player", bannedAt: "2026-10-01T00:00:00Z"},
		{username: "Admin", role: "admin"},
		{username: "Hazelwood", role: "player"},
	} {
		if _, _, err := a.db.Exec("INSERT INTO users(username,password_salt,password_hash,role,created_at,banned_at) VALUES(?,?,?,?,?,?)", player.username, "salt", "hash", player.role, "2026-10-01T00:00:00Z", player.bannedAt); err != nil {
			t.Fatal(err)
		}
	}

	request := httptest.NewRequest("GET", "/api/status", nil)
	response := httptest.NewRecorder()
	a.handleStatus(response, request)
	if response.Code != 200 {
		t.Fatalf("status = %d, want 200", response.Code)
	}
	var body struct {
		Available         bool `json:"available"`
		RegisteredPlayers *int `json:"registeredPlayers"`
		OnlineCount       int  `json:"onlineCount"`
		MaxPlayers        int  `json:"maxPlayers"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Available {
		t.Fatal("server should remain unavailable")
	}
	if body.RegisteredPlayers == nil || *body.RegisteredPlayers != 3 {
		t.Fatalf("registeredPlayers = %v, want 3 public registered accounts", body.RegisteredPlayers)
	}
	if _, _, err := a.db.Exec("DELETE FROM users WHERE username=? COLLATE NOCASE", hiddenPlayerUsername); err != nil {
		t.Fatal(err)
	}
	response = httptest.NewRecorder()
	a.handleStatus(response, request)
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.RegisteredPlayers == nil || *body.RegisteredPlayers != 3 {
		t.Fatalf("registeredPlayers = %v, want 3 when hidden account is absent", body.RegisteredPlayers)
	}
	if body.OnlineCount != 0 || body.MaxPlayers != 0 {
		t.Fatalf("unavailable server exposed player capacity: %d/%d", body.OnlineCount, body.MaxPlayers)
	}
}

func TestHandleStatusOmitsRegisteredPlayersWhenCountFails(t *testing.T) {
	a := newStatusTestApp(t)
	if _, _, err := a.db.Exec("DROP TABLE users"); err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest("GET", "/api/status", nil)
	response := httptest.NewRecorder()
	a.handleStatus(response, request)
	if response.Code != 200 {
		t.Fatalf("status = %d, want 200", response.Code)
	}
	var body map[string]json.RawMessage
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if _, ok := body["registeredPlayers"]; ok {
		t.Fatalf("registeredPlayers must be omitted when count query fails, got %s", body["registeredPlayers"])
	}
}
