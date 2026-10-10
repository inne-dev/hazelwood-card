package app

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode"
)

var (
	errInvalidInvite = errors.New("invalid or already used invitation code")
	errUsernameTaken = errors.New("nickname already registered")
	usernamePattern  = regexp.MustCompile(`^[A-Za-z0-9_]{3,16}$`)
	invitePattern    = regexp.MustCompile(`^HW-[A-Z2-7]{32}$`)
	searchPattern    = regexp.MustCompile(`^[A-Za-z0-9_]{0,16}$`)
)

type credentials struct {
	Username   string `json:"username"`
	Password   string `json:"password"`
	InviteCode string `json:"inviteCode"`
}

func (a *App) handleStatus(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, a.statusSnapshot())
}

func (a *App) handlePlayer(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")
	if !validUsername(username) {
		writeError(w, http.StatusBadRequest, "invalid Minecraft nickname")
		return
	}
	row, ok, err := a.db.QueryOne(`SELECT username,created_at,last_seen_at FROM users
		WHERE username=? COLLATE NOCASE AND role='player'`, username)
	if err != nil {
		a.logger.Printf("read player profile: %v", err)
		writeError(w, http.StatusInternalServerError, "could not load player profile")
		return
	}
	if !ok {
		writeError(w, http.StatusNotFound, "player not found")
		return
	}
	var lastSeen any
	if row[2] != nil {
		lastSeen = valueString(row[2])
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"username": valueString(row[0]), "createdAt": valueString(row[1]),
		"lastSeenAt": lastSeen, "online": a.playerOnline(valueString(row[0])),
	})
}

func (a *App) handleRegister(w http.ResponseWriter, r *http.Request) {
	var input credentials
	if err := a.decodeJSON(w, r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON request")
		return
	}
	input.Username = strings.TrimSpace(input.Username)
	input.InviteCode = strings.ToUpper(strings.TrimSpace(input.InviteCode))
	if !validUsername(input.Username) {
		writeError(w, http.StatusBadRequest, "nickname must be 3-16 letters, digits, or underscores")
		return
	}
	if len(input.Password) < 12 || len(input.Password) > 1024 {
		writeError(w, http.StatusBadRequest, "password must be 12-1024 bytes")
		return
	}
	if !invitePattern.MatchString(input.InviteCode) {
		writeError(w, http.StatusBadRequest, "invalid invitation code")
		return
	}
	if err := a.createPlayerAndConsumeInvite(input.Username, input.Password, input.InviteCode); err != nil {
		switch {
		case errors.Is(err, errInvalidInvite):
			writeError(w, http.StatusConflict, "invitation code is invalid or already used")
		case errors.Is(err, errUsernameTaken):
			writeError(w, http.StatusConflict, "nickname already registered")
		default:
			a.logger.Printf("register player: %v", err)
			writeError(w, http.StatusInternalServerError, "could not create account")
		}
		return
	}
	u, ok, err := a.loadUser(input.Username)
	if err != nil || !ok {
		a.logger.Printf("read new account: %v", err)
		writeError(w, http.StatusInternalServerError, "account created; sign in to continue")
		return
	}
	if err := a.createSession(w, r, u); err != nil {
		a.logger.Printf("create registration session: %v", err)
		writeError(w, http.StatusInternalServerError, "account created; sign in to continue")
		return
	}
	writeJSON(w, http.StatusCreated, publicUser(u))
}

func (a *App) handleLogin(w http.ResponseWriter, r *http.Request) {
	var input credentials
	if err := a.decodeJSON(w, r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON request")
		return
	}
	input.Username = strings.TrimSpace(input.Username)
	if !validUsername(input.Username) || input.Password == "" || len(input.Password) > 1024 {
		writeError(w, http.StatusBadRequest, "invalid credentials")
		return
	}
	row, ok, err := a.db.QueryOne(`SELECT id,username,password_salt,password_hash,role,created_at,last_seen_at,banned_at
		FROM users WHERE username=? COLLATE NOCASE`, input.Username)
	if err != nil {
		a.logger.Printf("read login account: %v", err)
		writeError(w, http.StatusInternalServerError, "could not sign in")
		return
	}
	if !ok || !verifyPassword(input.Password, valueString(row[2]), valueString(row[3])) {
		writeError(w, http.StatusUnauthorized, "invalid nickname or password")
		return
	}
	if row[7] != nil {
		writeError(w, http.StatusForbidden, "account is banned")
		return
	}
	now := nowString()
	if _, _, err := a.db.Exec("UPDATE users SET last_seen_at=? WHERE id=?", now, valueInt(row[0])); err != nil {
		a.logger.Printf("update login time: %v", err)
		writeError(w, http.StatusInternalServerError, "could not sign in")
		return
	}
	u := user{ID: valueInt(row[0]), Username: valueString(row[1]), Role: valueString(row[4]), CreatedAt: valueString(row[5])}
	seen := now
	u.LastSeen = &seen
	if err := a.createSession(w, r, u); err != nil {
		a.logger.Printf("create login session: %v", err)
		writeError(w, http.StatusInternalServerError, "could not sign in")
		return
	}
	writeJSON(w, http.StatusOK, publicUser(u))
}

func (a *App) handleLogout(w http.ResponseWriter, r *http.Request) {
	a.clearSession(w, r)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *App) handleMe(w http.ResponseWriter, r *http.Request) {
	u, ok := a.requireUser(w, r)
	if !ok {
		return
	}
	response := publicUser(u)
	response["online"] = a.playerOnline(u.Username)
	writeJSON(w, http.StatusOK, map[string]any{"user": response})
}

func (a *App) handleCreateInvite(w http.ResponseWriter, r *http.Request) {
	admin, ok := a.requireAdmin(w, r)
	if !ok {
		return
	}
	code, err := a.issueInvite(admin)
	if err != nil {
		a.logger.Printf("create invitation: %v", err)
		writeError(w, http.StatusInternalServerError, "could not create invitation")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"code": code, "createdAt": nowString()})
}

func (a *App) handleAdminPlayers(w http.ResponseWriter, r *http.Request) {
	if _, ok := a.requireAdmin(w, r); !ok {
		return
	}
	search := r.URL.Query().Get("search")
	if len(search) > 16 || !searchPattern.MatchString(search) {
		writeError(w, http.StatusBadRequest, "search must be a partial Minecraft nickname")
		return
	}
	search = strings.ReplaceAll(search, "!", "!!")
	search = strings.ReplaceAll(search, "%", "!%")
	search = strings.ReplaceAll(search, "_", "!_")
	rows, err := a.db.Query(`SELECT username,created_at,last_seen_at,banned_at,ban_reason FROM users
		WHERE role='player' AND username LIKE '%' || ? || '%' ESCAPE '!'
		ORDER BY username COLLATE NOCASE LIMIT 100`, search)
	if err != nil {
		a.logger.Printf("list admin players: %v", err)
		writeError(w, http.StatusInternalServerError, "could not load players")
		return
	}
	players := make([]map[string]any, 0, len(rows))
	for _, row := range rows {
		var lastSeen, banReason any
		if row[2] != nil {
			lastSeen = valueString(row[2])
		}
		if row[4] != nil {
			banReason = valueString(row[4])
		}
		username := valueString(row[0])
		players = append(players, map[string]any{
			"username": username, "createdAt": valueString(row[1]), "lastSeenAt": lastSeen,
			"online": a.playerOnline(username), "banned": row[3] != nil, "banReason": banReason,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"players": players})
}

func (a *App) handleBan(w http.ResponseWriter, r *http.Request) {
	admin, ok := a.requireAdmin(w, r)
	if !ok {
		return
	}
	username := r.PathValue("username")
	if !validUsername(username) {
		writeError(w, http.StatusBadRequest, "invalid Minecraft nickname")
		return
	}
	var input struct {
		Reason string `json:"reason"`
	}
	if err := a.decodeJSON(w, r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON request")
		return
	}
	reason := strings.TrimSpace(input.Reason)
	if reason == "" {
		reason = "Banned from Hazelwood"
	}
	if len([]rune(reason)) > 200 {
		writeError(w, http.StatusBadRequest, "ban reason must be at most 200 characters")
		return
	}
	for _, char := range reason {
		if unicode.IsControl(char) {
			writeError(w, http.StatusBadRequest, "ban reason contains invalid characters")
			return
		}
	}
	player, found, err := a.db.QueryOne("SELECT username,role FROM users WHERE username=? COLLATE NOCASE", username)
	if err != nil {
		a.logger.Printf("read ban target: %v", err)
		writeError(w, http.StatusInternalServerError, "could not ban player")
		return
	}
	if !found || valueString(player[1]) != "player" {
		writeError(w, http.StatusNotFound, "player not found")
		return
	}
	username = valueString(player[0])
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	_, err = a.command(ctx, "ban "+username+" "+reason)
	cancel()
	if err != nil {
		a.logRCONError("ban", err)
		writeError(w, http.StatusServiceUnavailable, "Minecraft server is unavailable")
		return
	}
	if a.playerOnline(username) {
		kickCtx, kickCancel := context.WithTimeout(r.Context(), 8*time.Second)
		_, kickErr := a.command(kickCtx, "kick "+username+" Banned: "+reason)
		kickCancel()
		if kickErr != nil {
			a.logRCONError("kick", kickErr)
		}
	}
	if _, _, err := a.db.Exec("UPDATE users SET banned_at=?,ban_reason=? WHERE username=? COLLATE NOCASE", nowString(), reason, username); err != nil {
		a.logger.Printf("store ban: %v", err)
		writeError(w, http.StatusInternalServerError, "player banned on server; profile update failed")
		return
	}
	a.logger.Printf("admin %s banned player %s", admin.Username, username)
	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "username": username, "banned": true, "reason": reason})
}

func (a *App) handleUnban(w http.ResponseWriter, r *http.Request) {
	admin, ok := a.requireAdmin(w, r)
	if !ok {
		return
	}
	username := r.PathValue("username")
	if !validUsername(username) {
		writeError(w, http.StatusBadRequest, "invalid Minecraft nickname")
		return
	}
	player, found, err := a.db.QueryOne("SELECT username,role FROM users WHERE username=? COLLATE NOCASE", username)
	if err != nil {
		a.logger.Printf("read unban target: %v", err)
		writeError(w, http.StatusInternalServerError, "could not unban player")
		return
	}
	if !found || valueString(player[1]) != "player" {
		writeError(w, http.StatusNotFound, "player not found")
		return
	}
	username = valueString(player[0])
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	_, err = a.command(ctx, "pardon "+username)
	cancel()
	if err != nil {
		a.logRCONError("unban", err)
		writeError(w, http.StatusServiceUnavailable, "Minecraft server is unavailable")
		return
	}
	if _, _, err := a.db.Exec("UPDATE users SET banned_at=NULL,ban_reason=NULL WHERE username=? COLLATE NOCASE", username); err != nil {
		a.logger.Printf("store unban: %v", err)
		writeError(w, http.StatusInternalServerError, "player unbanned on server; profile update failed")
		return
	}
	a.logger.Printf("admin %s unbanned player %s", admin.Username, username)
	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "username": username, "banned": false})
}

func (a *App) loadUser(username string) (user, bool, error) {
	row, ok, err := a.db.QueryOne(`SELECT id,username,role,created_at,last_seen_at FROM users
		WHERE username=? COLLATE NOCASE`, username)
	if err != nil || !ok {
		return user{}, ok, err
	}
	u := user{ID: valueInt(row[0]), Username: valueString(row[1]), Role: valueString(row[2]), CreatedAt: valueString(row[3])}
	if row[4] != nil {
		seen := valueString(row[4])
		u.LastSeen = &seen
	}
	return u, true, nil
}

func publicUser(u user) map[string]any {
	return map[string]any{"username": u.Username, "role": u.Role, "createdAt": u.CreatedAt, "lastSeenAt": u.LastSeen}
}

func validUsername(username string) bool { return usernamePattern.MatchString(username) }

func (a *App) String() string { return fmt.Sprintf("hazelwood app (%s)", a.publicOrigin.Host) }
