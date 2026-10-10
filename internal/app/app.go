package app

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base32"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"hazelwood-card/internal/rcon"
	"hazelwood-card/internal/store"
)

const sessionTTL = 14 * 24 * time.Hour

type Options struct {
	CookieSecure   bool
	PublicOrigin   string
	WebDir         string
	MapURL         string
	MapPreviewPath string
	AdminUser      string
	AdminPass      string
}

type App struct {
	db             *store.DB
	rcon           *rcon.Client
	logger         *log.Logger
	cookieSecure   bool
	publicOrigin   *url.URL
	webDir         string
	mapURL         *url.URL
	mapPreviewPath string
	mapPreview     mapPreviewCache
	status         Status
	statusMu       sync.RWMutex
	rconMu         sync.Mutex
	rconLogMu      sync.Mutex
	lastRCONLog    time.Time
}

type Status struct {
	Available   bool           `json:"available"`
	Online      bool           `json:"online"`
	OnlineCount int            `json:"onlineCount"`
	MaxPlayers  int            `json:"maxPlayers"`
	Players     []StatusPlayer `json:"players"`
	CheckedAt   string         `json:"checkedAt"`
}

type StatusPlayer struct {
	Username string `json:"username"`
}

type user struct {
	ID        int64
	Username  string
	Role      string
	CreatedAt string
	LastSeen  *string
	Banned    bool
}

type contextKey int

const userContextKey contextKey = iota

func New(db *store.DB, rc *rcon.Client, opts Options, logger *log.Logger) (*App, error) {
	if logger == nil {
		logger = log.Default()
	}
	origin, err := url.Parse(opts.PublicOrigin)
	if err != nil || origin.Scheme == "" || origin.Host == "" || (origin.Path != "" && origin.Path != "/") {
		return nil, fmt.Errorf("PUBLIC_ORIGIN must be an absolute origin, got %q", opts.PublicOrigin)
	}
	mapURL, err := url.Parse(opts.MapURL)
	if err != nil || mapURL.Scheme == "" || mapURL.Host == "" {
		return nil, fmt.Errorf("BLUEMAP_URL must be an absolute URL, got %q", opts.MapURL)
	}
	if strings.TrimSpace(opts.AdminUser) == "" || strings.TrimSpace(opts.AdminPass) == "" {
		return nil, errors.New("ADMIN_USERNAME and ADMIN_PASSWORD are required")
	}
	a := &App{
		db: db, rcon: rc, logger: logger, cookieSecure: opts.CookieSecure,
		publicOrigin: origin, webDir: filepath.Clean(opts.WebDir), mapURL: mapURL,
		mapPreviewPath: opts.MapPreviewPath,
		status:         Status{Players: []StatusPlayer{}},
	}
	if err := a.initSchema(); err != nil {
		return nil, err
	}
	if err := a.seedAdmin(opts.AdminUser, opts.AdminPass); err != nil {
		return nil, err
	}
	if err := a.loadMapPreviewCache(); err != nil {
		logger.Printf("load map preview cache: %v", err)
	}
	return a, nil
}

func (a *App) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /map-preview.png", a.handleMapPreview)
	mux.HandleFunc("GET /api/status", a.handleStatus)
	mux.HandleFunc("GET /api/players/{username}", a.handlePlayer)
	mux.HandleFunc("POST /api/register", a.handleRegister)
	mux.HandleFunc("POST /api/login", a.handleLogin)
	mux.HandleFunc("POST /api/logout", a.handleLogout)
	mux.HandleFunc("GET /api/me", a.handleMe)
	mux.HandleFunc("POST /api/admin/invites", a.handleCreateInvite)
	mux.HandleFunc("GET /api/admin/players", a.handleAdminPlayers)
	mux.HandleFunc("POST /api/admin/players/{username}/ban", a.handleBan)
	mux.HandleFunc("POST /api/admin/players/{username}/unban", a.handleUnban)

	proxy := httputil.NewSingleHostReverseProxy(a.mapURL)
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		a.logger.Printf("map proxy failed: %v", err)
		http.Error(w, "Map service unavailable", http.StatusBadGateway)
	}
	proxy.Director = func(req *http.Request) {
		originalHost := req.Host
		req.URL.Scheme = a.mapURL.Scheme
		req.URL.Host = a.mapURL.Host
		req.URL.Path = singleJoiningSlash(a.mapURL.Path, strings.TrimPrefix(req.URL.Path, "/map"))
		req.URL.RawPath = ""
		req.Host = a.mapURL.Host
		req.Header.Set("X-Forwarded-Host", originalHost)
	}
	proxy.ModifyResponse = func(response *http.Response) error {
		response.Header.Set("Cache-Control", "private, no-cache")
		return nil
	}
	mapHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, ok := a.authenticate(r); !ok {
			w.Header().Set("Cache-Control", "no-store")
			http.Error(w, "Authentication required", http.StatusUnauthorized)
			return
		}
		proxy.ServeHTTP(w, r)
	})
	mux.Handle("/map/", mapHandler)
	mux.Handle("/map", http.RedirectHandler("/map/", http.StatusPermanentRedirect))

	static := http.FileServer(http.Dir(a.webDir))
	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}
		if r.URL.Path == "/" || strings.HasSuffix(r.URL.Path, ".html") {
			w.Header().Set("Cache-Control", "no-cache")
		} else {
			w.Header().Set("Cache-Control", "public, max-age=300")
		}
		static.ServeHTTP(w, r)
	}))

	return a.securityHeaders(a.originProtection(a.noStoreAPI(mux)))
}

func (a *App) StartWorker(ctx context.Context) {
	go a.worker(ctx)
	go a.mapPreviewWorker(ctx)
}

func (a *App) worker(ctx context.Context) {
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()
	lastCleanup := time.Time{}
	lastWhitelistSync := time.Time{}
	for {
		a.refreshStatus(ctx)
		a.processWhitelistActions(ctx)
		if lastWhitelistSync.IsZero() || time.Since(lastWhitelistSync) >= time.Minute {
			a.reconcileServerWhitelist(ctx)
			lastWhitelistSync = time.Now()
		}
		if time.Since(lastCleanup) > 10*time.Minute {
			_, _, _ = a.db.Exec("DELETE FROM sessions WHERE expires_at <= ?", nowString())
			lastCleanup = time.Now()
		}
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func (a *App) refreshStatus(ctx context.Context) {
	a.rconMu.Lock()
	defer a.rconMu.Unlock()
	callCtx, cancel := context.WithTimeout(ctx, 7*time.Second)
	defer cancel()
	result, err := a.rcon.List(callCtx)
	if err != nil {
		a.logRCONError("list", err)
		a.statusMu.Lock()
		a.status = Status{Players: []StatusPlayer{}, CheckedAt: nowString()}
		a.statusMu.Unlock()
		return
	}
	players := make([]StatusPlayer, 0, len(result.Players))
	for _, name := range result.Players {
		players = append(players, StatusPlayer{Username: name})
		_, _, _ = a.db.Exec("UPDATE users SET last_seen_at=? WHERE username=? COLLATE NOCASE", nowString(), name)
	}
	status := Status{
		Available: true,
		Online:    result.OnlineCount > 0, OnlineCount: result.OnlineCount,
		MaxPlayers: result.MaxPlayers, Players: players, CheckedAt: nowString(),
	}
	a.statusMu.Lock()
	a.status = status
	a.statusMu.Unlock()
}

func (a *App) processWhitelistActions(ctx context.Context) {
	for i := 0; i < 8; i++ {
		rows, err := a.db.Query("SELECT id, username FROM server_actions WHERE action='whitelist' ORDER BY id LIMIT 1")
		if err != nil || len(rows) == 0 {
			if err != nil {
				a.logger.Printf("read pending server action: %v", err)
			}
			return
		}
		id := valueInt(rows[0][0])
		name := valueString(rows[0][1])
		a.rconMu.Lock()
		callCtx, cancel := context.WithTimeout(ctx, 7*time.Second)
		_, commandErr := a.rcon.Command(callCtx, "whitelist add "+name)
		cancel()
		a.rconMu.Unlock()
		if commandErr != nil {
			a.logRCONError("whitelist", commandErr)
			return
		}
		if _, _, err := a.db.Exec("DELETE FROM server_actions WHERE id=?", id); err != nil {
			a.logger.Printf("delete completed server action: %v", err)
			return
		}
	}
}

func (a *App) reconcileServerWhitelist(ctx context.Context) {
	rows, err := a.db.Query("SELECT username FROM users WHERE role='player' AND banned_at IS NULL ORDER BY username")
	if err != nil {
		a.logger.Printf("read registered players for whitelist sync: %v", err)
		return
	}

	registered := make(map[string]string, len(rows))
	registeredNames := make([]string, 0, len(rows))
	for _, row := range rows {
		name := valueString(row[0])
		key := strings.ToLower(name)
		registered[key] = name
		registeredNames = append(registeredNames, name)
	}

	callCtx, cancel := context.WithTimeout(ctx, 7*time.Second)
	response, err := a.command(callCtx, "whitelist list")
	cancel()
	if err != nil {
		a.logRCONError("whitelist sync", err)
		return
	}
	currentNames, err := parseWhitelist(response)
	if err != nil {
		a.logger.Printf("parse server whitelist: %v", err)
		return
	}

	removed, added := 0, 0
	for _, name := range currentNames {
		key := strings.ToLower(name)
		if _, ok := registered[key]; ok {
			delete(registered, key)
			continue
		}
		callCtx, cancel = context.WithTimeout(ctx, 7*time.Second)
		_, err = a.command(callCtx, "whitelist remove "+name)
		cancel()
		if err != nil {
			a.logRCONError("whitelist remove", err)
			return
		}
		removed++
	}

	for _, name := range registeredNames {
		key := strings.ToLower(name)
		if _, ok := registered[key]; !ok {
			continue
		}
		callCtx, cancel = context.WithTimeout(ctx, 7*time.Second)
		_, err = a.command(callCtx, "whitelist add "+name)
		cancel()
		if err != nil {
			a.logRCONError("whitelist add", err)
			return
		}
		delete(registered, key)
		added++
	}

	if removed > 0 || added > 0 {
		a.logger.Printf("reconciled Minecraft whitelist: removed %d unregistered, added %d registered players", removed, added)
	}
}

func parseWhitelist(response string) ([]string, error) {
	response = strings.TrimSpace(response)
	if strings.Contains(strings.ToLower(response), "no whitelisted players") {
		return nil, nil
	}
	separator := strings.LastIndex(response, ":")
	if separator < 0 {
		return nil, errors.New("unexpected whitelist response")
	}
	list := strings.TrimSpace(response[separator+1:])
	if list == "" {
		return nil, nil
	}
	parts := strings.Split(list, ",")
	names := make([]string, 0, len(parts))
	for _, part := range parts {
		name := strings.TrimSpace(part)
		if !validUsername(name) {
			return nil, errors.New("unexpected whitelist entry")
		}
		names = append(names, name)
	}
	return names, nil
}

func (a *App) logRCONError(operation string, err error) {
	a.rconLogMu.Lock()
	defer a.rconLogMu.Unlock()
	if time.Since(a.lastRCONLog) >= time.Minute {
		a.logger.Printf("RCON %s failed: %v", operation, err)
		a.lastRCONLog = time.Now()
	}
}

func (a *App) initSchema() error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL COLLATE NOCASE UNIQUE,
			password_salt TEXT NOT NULL,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'player' CHECK(role IN ('player','admin')),
			created_at TEXT NOT NULL,
			last_seen_at TEXT,
			banned_at TEXT,
			ban_reason TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS invites (
			code_hash TEXT PRIMARY KEY,
			created_by INTEGER NOT NULL REFERENCES users(id),
			created_at TEXT NOT NULL,
			used_at TEXT,
			used_by INTEGER REFERENCES users(id)
		)`,
		`CREATE TABLE IF NOT EXISTS sessions (
			token_hash TEXT PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			created_at TEXT NOT NULL,
			expires_at TEXT NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at)`,
		`CREATE TABLE IF NOT EXISTS server_actions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			action TEXT NOT NULL CHECK(action IN ('whitelist')),
			username TEXT NOT NULL,
			created_at TEXT NOT NULL
		)`,
	}
	for _, statement := range statements {
		if _, _, err := a.db.Exec(statement); err != nil {
			return fmt.Errorf("initialize database: %w", err)
		}
	}
	return nil
}

func (a *App) seedAdmin(username, password string) error {
	if !validUsername(username) {
		return errors.New("ADMIN_USERNAME must be a valid Minecraft nickname (3-16 letters, digits, or underscore)")
	}
	salt, hash, err := hashPassword(password)
	if err != nil {
		return err
	}
	_, _, err = a.db.Exec(`INSERT INTO users(username,password_salt,password_hash,role,created_at)
		VALUES(?,?,?,'admin',?)
		ON CONFLICT(username) DO UPDATE SET password_salt=excluded.password_salt,
		password_hash=excluded.password_hash, role='admin'`, username, salt, hash, nowString())
	if err != nil {
		return fmt.Errorf("seed admin account: %w", err)
	}
	return nil
}

func (a *App) securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		next.ServeHTTP(w, r)
	})
}

func (a *App) originProtection(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") && r.Method != http.MethodGet && r.Method != http.MethodHead && r.Method != http.MethodOptions {
			origin, err := url.Parse(r.Header.Get("Origin"))
			requestHost := r.Header.Get("X-Forwarded-Host")
			if requestHost == "" {
				requestHost = r.Host
			}
			requestScheme := "http"
			if r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https") {
				requestScheme = "https"
			}
			if err != nil || origin.Scheme == "" || !strings.EqualFold(origin.Scheme, requestScheme) || !strings.EqualFold(origin.Host, requestHost) {
				writeError(w, http.StatusForbidden, "invalid request origin")
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) noStoreAPI(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			w.Header().Set("Cache-Control", "no-store")
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) authenticate(r *http.Request) (user, bool) {
	cookie, err := r.Cookie("hw_session")
	if err != nil || cookie.Value == "" || len(cookie.Value) > 100 {
		return user{}, false
	}
	hash := tokenHash(cookie.Value)
	row, ok, err := a.db.QueryOne(`SELECT users.id,users.username,users.role,users.created_at,users.last_seen_at,users.banned_at
		FROM sessions JOIN users ON users.id=sessions.user_id
		WHERE sessions.token_hash=? AND sessions.expires_at>?`, hash, nowString())
	if err != nil || !ok || row[5] != nil {
		return user{}, false
	}
	result := user{ID: valueInt(row[0]), Username: valueString(row[1]), Role: valueString(row[2]), CreatedAt: valueString(row[3])}
	if row[4] != nil {
		lastSeen := valueString(row[4])
		result.LastSeen = &lastSeen
	}
	return result, true
}

func (a *App) createSession(w http.ResponseWriter, r *http.Request, u user) error {
	var token [32]byte
	if _, err := rand.Read(token[:]); err != nil {
		return err
	}
	encoded := base64.RawURLEncoding.EncodeToString(token[:])
	now := time.Now().UTC()
	if _, _, err := a.db.Exec("INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(?,?,?,?)",
		tokenHash(encoded), u.ID, now.Format(time.RFC3339Nano), now.Add(sessionTTL).Format(time.RFC3339Nano)); err != nil {
		return err
	}
	http.SetCookie(w, &http.Cookie{
		Name: "hw_session", Value: encoded, Path: "/", HttpOnly: true,
		Secure: a.secureCookie(r), SameSite: http.SameSiteStrictMode,
		Expires: now.Add(sessionTTL), MaxAge: int(sessionTTL.Seconds()),
	})
	return nil
}

func (a *App) clearSession(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie("hw_session"); err == nil && cookie.Value != "" {
		_, _, _ = a.db.Exec("DELETE FROM sessions WHERE token_hash=?", tokenHash(cookie.Value))
	}
	http.SetCookie(w, &http.Cookie{
		Name: "hw_session", Value: "", Path: "/", HttpOnly: true,
		Secure: a.secureCookie(r), SameSite: http.SameSiteStrictMode,
		MaxAge: -1, Expires: time.Unix(1, 0),
	})
}

func (a *App) secureCookie(r *http.Request) bool {
	return a.cookieSecure || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")
}

func (a *App) requireUser(w http.ResponseWriter, r *http.Request) (user, bool) {
	u, ok := a.authenticate(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "authentication required")
		return user{}, false
	}
	return u, true
}

func (a *App) requireAdmin(w http.ResponseWriter, r *http.Request) (user, bool) {
	u, ok := a.requireUser(w, r)
	if !ok {
		return user{}, false
	}
	if u.Role != "admin" {
		writeError(w, http.StatusForbidden, "admin access required")
		return user{}, false
	}
	return u, true
}

func (a *App) issueInvite(admin user) (string, error) {
	var bytes [20]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return "", err
	}
	code := "HW-" + base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(bytes[:])
	_, _, err := a.db.Exec("INSERT INTO invites(code_hash,created_by,created_at) VALUES(?,?,?)", tokenHash(code), admin.ID, nowString())
	if err != nil {
		return "", err
	}
	return code, nil
}

func (a *App) createPlayerAndConsumeInvite(username, password, inviteCode string) error {
	salt, hash, err := hashPassword(password)
	if err != nil {
		return err
	}
	return a.db.WithTx(func(tx *store.Tx) error {
		changed, _, err := tx.Exec("UPDATE invites SET used_at=? WHERE code_hash=? AND used_at IS NULL", nowString(), tokenHash(inviteCode))
		if err != nil {
			return err
		}
		if changed != 1 {
			return errInvalidInvite
		}
		_, exists, err := tx.QueryOne("SELECT id FROM users WHERE username=? COLLATE NOCASE", username)
		if err != nil {
			return err
		}
		if exists {
			return errUsernameTaken
		}
		_, _, err = tx.Exec(`INSERT INTO users(username,password_salt,password_hash,role,created_at)
			VALUES(?,?,?,'player',?)`, username, salt, hash, nowString())
		if err != nil {
			return err
		}
		row, ok, err := tx.QueryOne("SELECT id FROM users WHERE username=? COLLATE NOCASE", username)
		if err != nil || !ok {
			if err != nil {
				return err
			}
			return errors.New("created player account could not be read")
		}
		userID := valueInt(row[0])
		if _, _, err = tx.Exec("UPDATE invites SET used_by=? WHERE code_hash=?", userID, tokenHash(inviteCode)); err != nil {
			return err
		}
		_, _, err = tx.Exec("INSERT INTO server_actions(action,username,created_at) VALUES('whitelist',?,?)", username, nowString())
		return err
	})
}

func (a *App) statusSnapshot() Status {
	a.statusMu.RLock()
	defer a.statusMu.RUnlock()
	status := a.status
	status.Players = append([]StatusPlayer(nil), status.Players...)
	return status
}

func (a *App) playerOnline(username string) bool {
	for _, player := range a.statusSnapshot().Players {
		if strings.EqualFold(player.Username, username) {
			return true
		}
	}
	return false
}

func (a *App) command(ctx context.Context, command string) (string, error) {
	a.rconMu.Lock()
	defer a.rconMu.Unlock()
	return a.rcon.Command(ctx, command)
}

func (a *App) decodeJSON(w http.ResponseWriter, r *http.Request, destination any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 8*1024)
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

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func nowString() string { return time.Now().UTC().Format(time.RFC3339Nano) }

func tokenHash(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func valueInt(value any) int64 {
	if number, ok := value.(int64); ok {
		return number
	}
	return 0
}

func valueString(value any) string {
	if text, ok := value.(string); ok {
		return text
	}
	return ""
}

func singleJoiningSlash(a, b string) string {
	if strings.HasSuffix(a, "/") {
		a = strings.TrimSuffix(a, "/")
	}
	if !strings.HasPrefix(b, "/") {
		b = "/" + b
	}
	return a + b
}
