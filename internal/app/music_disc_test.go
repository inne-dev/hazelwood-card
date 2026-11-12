package app

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

const testMusicDiscID = "550e8400-e29b-41d4-a716-446655440000"

func musicDiscTestApp(t *testing.T, status string) (*App, string) {
	t.Helper()
	a, _, secret := newProfileTestApp(t)
	if err := a.initMusicDiscSchema(); err != nil {
		t.Fatal(err)
	}
	a.musicDiscAudioDir = t.TempDir()
	now := nowString()
	_, _, err := a.db.Exec(`INSERT INTO music_disc_requests
		(id,request_id,owner_user_id,recipient_user_id,recipient,title,sound_key,pack_url,sha1,status,error,created_at,updated_at)
		VALUES(?,?,?,?,?,?,?,?,?,?,?, ?,?)`,
		testMusicDiscID, testMusicDiscID, 1, 1, "Alice", "Test track", "cdisc:"+testMusicDiscID,
		"", "", status, "", now, now)
	if err != nil {
		t.Fatal(err)
	}
	return a, secret
}

func TestMusicDiscAudioEndpointRequiresMinecraftAuth(t *testing.T) {
	a, _ := musicDiscTestApp(t, "pending")
	request := httptest.NewRequest(http.MethodGet, "/internal/minecraft/music-disc-requests/"+testMusicDiscID+"/audio", nil)
	response := httptest.NewRecorder()
	a.Handler().ServeHTTP(response, request)

	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusUnauthorized)
	}
	if got := response.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control = %q, want no-store", got)
	}
}

func TestMusicDiscAudioEndpointServesPendingOGGOnlyToPlugin(t *testing.T) {
	a, secret := musicDiscTestApp(t, "pending")
	audio := []byte("OggS test audio bytes")
	if err := persistMusicDiscAudio(a.musicDiscAudioPath(testMusicDiscID), audio); err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodGet, "/internal/minecraft/music-disc-requests/"+testMusicDiscID+"/audio", nil)
	request.Header.Set("Authorization", "Bearer "+secret)
	response := httptest.NewRecorder()
	a.Handler().ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body %s", response.Code, response.Body.String())
	}
	if got := response.Header().Get("Content-Type"); got != "audio/ogg" {
		t.Fatalf("Content-Type = %q, want audio/ogg", got)
	}
	if got := response.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control = %q, want no-store", got)
	}
	if !bytes.Equal(response.Body.Bytes(), audio) {
		t.Fatalf("audio response = %q, want %q", response.Body.Bytes(), audio)
	}
}

func TestMusicDiscAudioEndpointDoesNotServeFinishedRequest(t *testing.T) {
	a, secret := musicDiscTestApp(t, "completed")
	if err := persistMusicDiscAudio(a.musicDiscAudioPath(testMusicDiscID), []byte("OggS audio")); err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodGet, "/internal/minecraft/music-disc-requests/"+testMusicDiscID+"/audio", nil)
	request.Header.Set("Authorization", "Bearer "+secret)
	response := httptest.NewRecorder()
	a.Handler().ServeHTTP(response, request)

	if response.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNotFound)
	}
}

func TestReadMusicDiscAudioSupportsLegacyResourcePackRequests(t *testing.T) {
	a, _ := musicDiscTestApp(t, "pending")
	audio := []byte("OggS legacy audio bytes")
	pack, err := buildMusicDiscPack(testMusicDiscID, "Legacy", audio)
	if err != nil {
		t.Fatal(err)
	}
	packPath := filepath.Join(a.musicDiscAudioDir, testMusicDiscID+".zip")
	if err := os.WriteFile(packPath, pack, 0o600); err != nil {
		t.Fatal(err)
	}
	got, err := a.readMusicDiscAudio(testMusicDiscID)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(got, audio) {
		t.Fatalf("extracted audio = %q, want %q", got, audio)
	}
}
