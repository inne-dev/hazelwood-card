package app

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHiddenPlayerIsFilteredFromPlayerSurfaces(t *testing.T) {
	a, _, _ := newProfileTestApp(t)
	if _, _, err := a.db.Exec(`INSERT INTO users(id,username,password_salt,password_hash,role,created_at) VALUES(4,'hazelwood','salt','hash','player',?)`, nowString()); err != nil {
		t.Fatal(err)
	}
	if err := addTestSession(t, a.db, 4, "hazelwood-session"); err != nil {
		t.Fatal(err)
	}
	a.status = Status{
		Available: true, Online: true, OnlineCount: 2, MaxPlayers: 20,
		Players: []StatusPlayer{{Username: "HAZELWOOD"}, {Username: "Bob"}},
	}

	handler := a.Handler()
	request := httptest.NewRequest(http.MethodGet, "/api/status", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("status code = %d, body %s", response.Code, response.Body.String())
	}
	var status struct {
		Players     []StatusPlayer `json:"players"`
		OnlineCount int            `json:"onlineCount"`
		MaxPlayers  int            `json:"maxPlayers"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &status); err != nil {
		t.Fatal(err)
	}
	if len(status.Players) != 1 || status.Players[0].Username != "Bob" {
		t.Fatalf("visible online players = %#v, want only Bob", status.Players)
	}
	if status.OnlineCount != 2 || status.MaxPlayers != 20 {
		t.Fatalf("server capacity = %d/%d, want original 2/20", status.OnlineCount, status.MaxPlayers)
	}

	response = httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/leaderboard", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("leaderboard code = %d, body %s", response.Code, response.Body.String())
	}
	assertNoHiddenUsername(t, response.Body.String())

	request = httptest.NewRequest(http.MethodGet, "/api/players", nil)
	request.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("player directory code = %d, body %s", response.Code, response.Body.String())
	}
	assertNoHiddenUsername(t, response.Body.String())

	for _, path := range []string{
		"/api/player/HAZELWOOD",
		"/api/players/HAZELWOOD",
		"/api/players/HaZeLwOoD/details",
		"/api/players/hazelwood/head.png",
	} {
		request = httptest.NewRequest(http.MethodGet, path, nil)
		if strings.HasSuffix(path, "/details") {
			request.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
		}
		response = httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		if response.Code != http.StatusNotFound {
			t.Errorf("GET %s status = %d, want 404; body %s", path, response.Code, response.Body.String())
		}
	}

	request = httptest.NewRequest(http.MethodGet, "/api/players/HAZELWOOD/skin.png", nil)
	request.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusNotFound {
		t.Errorf("hidden skin status = %d, want 404", response.Code)
	}

	request = httptest.NewRequest(http.MethodGet, "/api/me", nil)
	request.AddCookie(&http.Cookie{Name: "hw_session", Value: "hazelwood-session"})
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK || !strings.Contains(response.Body.String(), `"username":"hazelwood"`) {
		t.Errorf("hidden player's own session changed: status=%d body=%s", response.Code, response.Body.String())
	}
}

func TestAdminPlayerListAndSearchHidePlayerCaseInsensitively(t *testing.T) {
	a, _, _ := newProfileTestApp(t)
	if _, _, err := a.db.Exec(`INSERT INTO users(id,username,password_salt,password_hash,role,created_at) VALUES(4,'hazelwood','salt','hash','player',?)`, nowString()); err != nil {
		t.Fatal(err)
	}
	handler := a.Handler()

	for _, path := range []string{"/api/admin/players", "/api/admin/players?search=HAZELWOOD"} {
		request := httptest.NewRequest(http.MethodGet, path, nil)
		request.AddCookie(&http.Cookie{Name: "hw_session", Value: "carol-session"})
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		if response.Code != http.StatusOK {
			t.Fatalf("GET %s code = %d, body %s", path, response.Code, response.Body.String())
		}
		assertNoHiddenUsername(t, response.Body.String())
		var body struct {
			Players []struct {
				Username string `json:"username"`
			} `json:"players"`
		}
		if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
			t.Fatal(err)
		}
		if strings.Contains(path, "search=") {
			if len(body.Players) != 0 {
				t.Errorf("hidden player search returned rows: %#v", body.Players)
			}
		} else {
			found := map[string]bool{}
			for _, player := range body.Players {
				found[player.Username] = true
			}
			if !found["Alice"] || !found["Bob"] {
				t.Errorf("admin list lost visible players: %#v", body.Players)
			}
		}
	}
}

func assertNoHiddenUsername(t *testing.T, body string) {
	t.Helper()
	if strings.Contains(strings.ToLower(body), hiddenPlayerUsername) {
		t.Errorf("response exposed hidden username: %s", body)
	}
}
