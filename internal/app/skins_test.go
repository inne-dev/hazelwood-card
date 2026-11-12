package app

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"image"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"

	"hazelwood-card/internal/rcon"
)

func TestSkinRequestCallbacksRequireSharedSecretAndAreOwnerScoped(t *testing.T) {
	a, _, secret := newProfileTestApp(t)
	_, id, err := a.db.Exec(`INSERT INTO skin_requests(user_id,username,player_uuid,kind,value,model,status,created_at,updated_at)
		VALUES(1,'Alice','edf78b19-f733-3619-a46a-56324548077e','player','Notch','classic','pending',?,?)`, nowString(), nowString())
	if err != nil {
		t.Fatal(err)
	}
	handler := a.Handler()
	path := "/internal/minecraft/skin-requests/" + strconv.FormatInt(id, 10) + "/result"
	payload := `{"status":"completed","textureURL":"https://textures.minecraft.net/texture/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","model":"slim"}`
	unauthorized := httptest.NewRequest(http.MethodPost, path, strings.NewReader(payload))
	unauthorized.Header.Set("Content-Type", "application/json")
	unauthorizedResponse := httptest.NewRecorder()
	handler.ServeHTTP(unauthorizedResponse, unauthorized)
	if unauthorizedResponse.Code != http.StatusUnauthorized {
		t.Fatalf("callback without secret status = %d", unauthorizedResponse.Code)
	}

	callback := httptest.NewRequest(http.MethodPost, path, strings.NewReader(payload))
	callback.Header.Set("Content-Type", "application/json")
	callback.Header.Set("Authorization", "Bearer "+secret)
	callbackResponse := httptest.NewRecorder()
	handler.ServeHTTP(callbackResponse, callback)
	if callbackResponse.Code != http.StatusOK {
		t.Fatalf("callback status = %d, body %s", callbackResponse.Code, callbackResponse.Body.String())
	}

	poll := httptest.NewRequest(http.MethodGet, "/api/me/skin/requests/"+strconv.FormatInt(id, 10), nil)
	poll.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	pollResponse := httptest.NewRecorder()
	handler.ServeHTTP(pollResponse, poll)
	if pollResponse.Code != http.StatusOK {
		t.Fatalf("owner poll status = %d, body %s", pollResponse.Code, pollResponse.Body.String())
	}
	var status skinRequestStatus
	if err := json.Unmarshal(pollResponse.Body.Bytes(), &status); err != nil {
		t.Fatal(err)
	}
	if status.Status != "completed" || status.Model != "slim" || status.TextureURL == nil || *status.TextureURL != "https://textures.minecraft.net/texture/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" {
		t.Fatalf("unexpected owner status: %#v", status)
	}

	otherPoll := httptest.NewRequest(http.MethodGet, "/api/me/skin/requests/"+strconv.FormatInt(id, 10), nil)
	otherPoll.AddCookie(&http.Cookie{Name: "hw_session", Value: "bob-session"})
	otherResponse := httptest.NewRecorder()
	handler.ServeHTTP(otherResponse, otherPoll)
	if otherResponse.Code != http.StatusNotFound {
		t.Fatalf("different account poll status = %d, want 404", otherResponse.Code)
	}
}

func TestSkinUploadValidatesDimensionsAndQueuesOnlyOwnAccount(t *testing.T) {
	var imageBytes bytes.Buffer
	if err := png.Encode(&imageBytes, image.NewRGBA(image.Rect(0, 0, 64, 64))); err != nil {
		t.Fatal(err)
	}
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	file, err := writer.CreateFormFile("skin", "skin.png")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := file.Write(imageBytes.Bytes()); err != nil {
		t.Fatal(err)
	}
	if err := writer.WriteField("model", "slim"); err != nil {
		t.Fatal(err)
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodPost, "/api/me/skin", &body)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	kind, encoded, model, err := readSkinChangeInput(httptest.NewRecorder(), request)
	if err != nil {
		t.Fatal(err)
	}
	decoded, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil || kind != "upload" || model != "slim" || !bytes.Equal(decoded, imageBytes.Bytes()) {
		t.Fatalf("parsed skin upload differs, kind=%q model=%q err=%v", kind, model, err)
	}
	if err := validateSkinPNG([]byte("not a PNG")); err == nil {
		t.Fatal("invalid PNG was accepted")
	}
	var wrongSize bytes.Buffer
	if err := png.Encode(&wrongSize, image.NewRGBA(image.Rect(0, 0, 32, 32))); err != nil {
		t.Fatal(err)
	}
	if err := validateSkinPNG(wrongSize.Bytes()); err == nil {
		t.Fatal("wrong-sized PNG was accepted")
	}

	a, _, _ := newProfileTestApp(t)
	a.rcon = testRCON{err: errors.New("Minecraft server unavailable")}
	jsonRequest := httptest.NewRequest(http.MethodPost, "http://portal/api/me/skin", strings.NewReader(`{"playerName":"Notch","model":"classic"}`))
	jsonRequest.Header.Set("Content-Type", "application/json")
	jsonRequest.Header.Set("Origin", "http://portal")
	jsonRequest.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	response := httptest.NewRecorder()
	a.Handler().ServeHTTP(response, jsonRequest)
	if response.Code != http.StatusServiceUnavailable {
		t.Fatalf("offline RCON request status = %d, body %s", response.Code, response.Body.String())
	}
	var created skinRequestStatus
	if err := json.Unmarshal(response.Body.Bytes(), &created); err == nil && created.Status == "pending" {
		t.Fatal("request claimed a pending change after offline server response")
	}
	row, found, err := a.db.QueryOne("SELECT status FROM skin_requests WHERE user_id=1 ORDER BY id DESC LIMIT 1")
	if err != nil || !found || row[0] != "failed" {
		t.Fatalf("offline request should be persisted failed, row=%#v found=%t err=%v", row, found, err)
	}
}

func TestSafeMinecraftTextureURLAllowlist(t *testing.T) {
	valid := "https://textures.minecraft.net/texture/0123456789abcdef0123456789abcdef"
	if safeMinecraftTextureURL(valid) != valid {
		t.Fatal("official texture URL should be accepted")
	}
	for _, invalid := range []string{
		"http://textures.minecraft.net/texture/0123456789abcdef0123456789abcdef",
		"https://textures.minecraft.net.evil.invalid/texture/0123456789abcdef0123456789abcdef",
		"https://127.0.0.1/texture/0123456789abcdef0123456789abcdef",
		"https://textures.minecraft.net/texture/0123456789abcdef0123456789abcdef?x=1",
		"https://textures.minecraft.net/texture/%2e%2e",
	} {
		if safeMinecraftTextureURL(invalid) != "" {
			t.Fatalf("unsafe texture URL accepted: %s", invalid)
		}
	}
}

func TestDefaultSkinSelectionMatchesMinecraftUUIDHash(t *testing.T) {
	tests := []struct {
		uuid      string
		assetPath string
		model     string
	}{
		{uuid: "edf78b19-f733-3619-a46a-56324548077e", assetPath: "assets/minecraft/textures/entity/player/slim/steve.png", model: "slim"},
		{uuid: "ce65bf3a-5ea3-3afa-8522-d7677b785b05", assetPath: "assets/minecraft/textures/entity/player/wide/noor.png", model: "classic"},
	}
	for _, test := range tests {
		path, model, ok := defaultSkinSelection(test.uuid)
		if !ok || path != test.assetPath || model != test.model {
			t.Errorf("defaultSkinSelection(%q) = (%q, %q, %t), want (%q, %q, true)", test.uuid, path, model, ok, test.assetPath, test.model)
		}
	}
	if _, _, ok := defaultSkinSelection("not-a-uuid"); ok {
		t.Fatal("invalid UUID unexpectedly selected a default skin")
	}
}

func TestDefaultSkinFallbackUsesBoundedLocalClientArchive(t *testing.T) {
	a, dataDir, _ := newProfileTestApp(t)
	writeProfileTestFile(t, dataDir, "usercache.json", `[{"uuid":"edf78b19-f733-3619-a46a-56324548077e","name":"Alice"},{"uuid":"ce65bf3a-5ea3-3afa-8522-d7677b785b05","name":"Bob"}]`)
	var pngBytes bytes.Buffer
	if err := png.Encode(&pngBytes, image.NewRGBA(image.Rect(0, 0, 64, 64))); err != nil {
		t.Fatal(err)
	}
	jarPath := filepath.Join(dataDir, "bluemap", minecraftClientJarName)
	if err := os.MkdirAll(filepath.Dir(jarPath), 0o700); err != nil {
		t.Fatal(err)
	}
	jar, err := os.Create(jarPath)
	if err != nil {
		t.Fatal(err)
	}
	archive := zip.NewWriter(jar)
	asset, err := archive.Create("assets/minecraft/textures/entity/player/slim/steve.png")
	if err == nil {
		_, err = asset.Write(pngBytes.Bytes())
	}
	if closeErr := archive.Close(); err == nil {
		err = closeErr
	}
	if closeErr := jar.Close(); err == nil {
		err = closeErr
	}
	if err != nil {
		t.Fatal(err)
	}

	players, err := a.loadMinecraftPlayers()
	if err != nil {
		t.Fatal(err)
	}
	var alice, bob *minecraftPlayer
	for i := range players {
		switch players[i].Username {
		case "Alice":
			alice = &players[i]
		case "Bob":
			bob = &players[i]
		}
	}
	if alice == nil || bob == nil {
		t.Fatalf("expected cached players Alice and Bob, got %#v", players)
	}
	if _, model, available := a.playerSkinDisplay(*alice); !available || model != "slim" {
		t.Fatalf("Alice default skin metadata = (%q, %t), want slim and available", model, available)
	}
	if _, _, available := a.playerSkinDisplay(*bob); available {
		t.Fatal("missing default-skin asset should remain unavailable")
	}

	handler := a.Handler()
	request := httptest.NewRequest(http.MethodGet, "/api/players", nil)
	request.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("player directory status = %d", response.Code)
	}
	var directory struct {
		Players []playerSummary `json:"players"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &directory); err != nil {
		t.Fatal(err)
	}
	for _, player := range directory.Players {
		if player.Username == "Alice" && player.SkinURL == nil {
			t.Fatal("player directory should expose the available default skin")
		}
		if player.Username == "Bob" && player.SkinURL != nil {
			t.Fatal("player directory should keep a missing default skin unavailable")
		}
	}

	request = httptest.NewRequest(http.MethodGet, "/api/players/Alice/details", nil)
	request.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	var details struct {
		Skin playerSkin `json:"skin"`
	}
	if response.Code != http.StatusOK || json.Unmarshal(response.Body.Bytes(), &details) != nil || !details.Skin.Available || details.Skin.Model != "slim" {
		t.Fatalf("player details should expose slim default-skin metadata, status=%d body=%s skin=%#v", response.Code, response.Body.String(), details.Skin)
	}

	request = httptest.NewRequest(http.MethodGet, "/api/players/Alice/skin.png", nil)
	request.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK || response.Header().Get("Content-Type") != "image/png" {
		t.Fatalf("default skin endpoint status/content type = %d/%q, body %s", response.Code, response.Header().Get("Content-Type"), response.Body.String())
	}
	decoded, err := png.Decode(bytes.NewReader(response.Body.Bytes()))
	if err != nil || decoded.Bounds().Dx() != 64 || decoded.Bounds().Dy() != 64 {
		t.Fatalf("default skin endpoint returned invalid image: %v", err)
	}

	request = httptest.NewRequest(http.MethodGet, "/api/players/Bob/skin.png", nil)
	request.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusNotFound {
		t.Fatalf("missing local default skin status = %d, want 404", response.Code)
	}
}

func TestSkinRequestWaitsForPluginCallbackAndRejectsPluginFailure(t *testing.T) {
	tests := []struct {
		name         string
		consoleReply string
		wantStatus   int
		wantDBStatus string
	}{
		{name: "accepted remains pending", consoleReply: "§aЗапрос на смену скина принят.", wantStatus: http.StatusAccepted, wantDBStatus: "pending"},
		{name: "service rejected", consoleReply: "Не удалось принять запрос на смену скина.", wantStatus: http.StatusServiceUnavailable, wantDBStatus: "failed"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			a, _, _ := newProfileTestApp(t)
			a.rcon = testRCON{reply: test.consoleReply}
			request := httptest.NewRequest(http.MethodPost, "http://portal/api/me/skin", strings.NewReader(`{"playerName":"Notch","model":"classic"}`))
			request.Header.Set("Content-Type", "application/json")
			request.Header.Set("Origin", "http://portal")
			request.AddCookie(&http.Cookie{Name: "hw_session", Value: "alice-session"})
			response := httptest.NewRecorder()
			a.Handler().ServeHTTP(response, request)
			if response.Code != test.wantStatus {
				t.Fatalf("request status = %d, body %s", response.Code, response.Body.String())
			}
			row, found, err := a.db.QueryOne("SELECT status FROM skin_requests WHERE user_id=1 ORDER BY id DESC LIMIT 1")
			if err != nil || !found || valueString(row[0]) != test.wantDBStatus {
				t.Fatalf("persisted status = %#v, found=%t, err=%v", row, found, err)
			}
			if test.wantStatus == http.StatusAccepted {
				var result skinRequestStatus
				if err := json.Unmarshal(response.Body.Bytes(), &result); err != nil {
					t.Fatal(err)
				}
				if result.Status != "pending" || result.RequestID == 0 || result.ID != result.RequestID {
					t.Fatalf("accepted command must wait for plugin callback: %#v", result)
				}
			}
		})
	}
}

func TestSkinRequestCanBeFetchedOnlyByInternalSecret(t *testing.T) {
	a, _, secret := newProfileTestApp(t)
	_, id, err := a.db.Exec(`INSERT INTO skin_requests(user_id,username,player_uuid,kind,value,model,status,created_at,updated_at)
		VALUES(1,'Alice','edf78b19-f733-3619-a46a-56324548077e','upload','cG5n','classic','pending',?,?)`, nowString(), nowString())
	if err != nil {
		t.Fatal(err)
	}
	path := "/internal/minecraft/skin-requests/" + strconv.FormatInt(id, 10)
	request := httptest.NewRequest(http.MethodGet, path, nil)
	request.Header.Set("Authorization", "Bearer "+secret)
	response := httptest.NewRecorder()
	a.Handler().ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("plugin request status = %d, body %s", response.Code, response.Body.String())
	}
	var payload minecraftSkinRequest
	if err := json.Unmarshal(response.Body.Bytes(), &payload); err != nil {
		t.Fatal(err)
	}
	if payload.Username != "Alice" || payload.UUID != "edf78b19-f733-3619-a46a-56324548077e" || payload.Kind != "upload" || payload.Value != "cG5n" || payload.Model != "classic" {
		t.Fatalf("unexpected plugin request: %#v", payload)
	}
}

type testRCON struct {
	reply string
	err   error
}

func (r testRCON) Command(context.Context, string) (string, error) { return r.reply, r.err }
func (r testRCON) List(context.Context) (rcon.Status, error)       { return rcon.Status{}, r.err }
