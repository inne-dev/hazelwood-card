package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"hazelwood-card/internal/app"
	"hazelwood-card/internal/rcon"
	"hazelwood-card/internal/store"
)

type config struct {
	addr                string
	dbPath              string
	rconAddress         string
	rconPassword        string
	minecraftAuthSecret string
	adminUser           string
	adminPass           string
	publicOrigin        string
	webDir              string
	mapURL              string
	minecraftDataDir    string
	serverAddress       string
	cookieSecure        bool
}

func main() {
	logger := log.New(os.Stdout, "hazelwood ", log.LstdFlags|log.LUTC)
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatalf("configuration: %v", err)
	}
	if cfg.dbPath != ":memory:" {
		if err := os.MkdirAll(filepath.Dir(cfg.dbPath), 0o700); err != nil {
			logger.Fatalf("create database directory: %v", err)
		}
	}
	database, err := store.Open(cfg.dbPath)
	if err != nil {
		logger.Fatalf("open database %q: %v", cfg.dbPath, err)
	}
	defer database.Close()
	if cfg.dbPath != ":memory:" {
		if err := os.Chmod(cfg.dbPath, 0o600); err != nil {
			logger.Printf("set database permissions: %v", err)
		}
	}

	mapPreviewPath := ""
	if cfg.dbPath != ":memory:" {
		mapPreviewPath = filepath.Join(filepath.Dir(cfg.dbPath), "map-preview.png")
	}
	backend, err := app.New(database, rcon.New(cfg.rconAddress, cfg.rconPassword), app.Options{
		CookieSecure:        cfg.cookieSecure,
		PublicOrigin:        cfg.publicOrigin,
		WebDir:              cfg.webDir,
		MapURL:              cfg.mapURL,
		MapPreviewPath:      mapPreviewPath,
		MinecraftDataDir:    cfg.minecraftDataDir,
		ServerAddress:       cfg.serverAddress,
		AdminUser:           cfg.adminUser,
		AdminPass:           cfg.adminPass,
		MinecraftAuthSecret: cfg.minecraftAuthSecret,
	}, logger)
	if err != nil {
		logger.Fatalf("initialize application: %v", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	backend.StartWorker(ctx)

	server := &http.Server{
		Addr: cfg.addr, Handler: backend.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    16 * 1024,
	}
	errCh := make(chan error, 1)
	go func() {
		logger.Printf("listening on %s", cfg.addr)
		if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	select {
	case err := <-errCh:
		logger.Fatalf("HTTP server: %v", err)
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			logger.Printf("graceful shutdown: %v", err)
			_ = server.Close()
		}
	}
}

func loadConfig() (config, error) {
	adminUser, err := requiredEnv("ADMIN_USERNAME")
	if err != nil {
		return config{}, err
	}
	adminPass, err := requiredSecretEnv("ADMIN_PASSWORD")
	if err != nil {
		return config{}, err
	}
	rconHost, err := requiredEnv("RCON_HOST")
	if err != nil {
		return config{}, err
	}
	if strings.Contains(rconHost, ":") {
		return config{}, errors.New("RCON_HOST must be a hostname or IP without port; use RCON_PORT for port")
	}
	rconPassword, err := readRCONPassword()
	if err != nil {
		return config{}, err
	}
	minecraftAuthSecret, err := readMinecraftAuthSecret()
	if err != nil {
		return config{}, err
	}
	rconPortText := envOr("RCON_PORT", "25575")
	rconPort, err := strconv.Atoi(rconPortText)
	if err != nil || rconPort < 1 || rconPort > 65535 {
		return config{}, fmt.Errorf("RCON_PORT must be an integer from 1 to 65535, got %q", rconPortText)
	}
	cookieSecure := false
	if value := os.Getenv("COOKIE_SECURE"); value != "" {
		cookieSecure, err = strconv.ParseBool(value)
		if err != nil {
			return config{}, fmt.Errorf("COOKIE_SECURE must be true or false: %w", err)
		}
	}
	return config{
		addr:                envOr("HTTP_ADDR", ":8080"),
		dbPath:              envOr("DB_PATH", "/data/hazelwood.sqlite"),
		rconAddress:         net.JoinHostPort(rconHost, strconv.Itoa(rconPort)),
		rconPassword:        rconPassword,
		minecraftAuthSecret: minecraftAuthSecret,
		adminUser:           adminUser,
		adminPass:           adminPass,
		publicOrigin:        envOr("PUBLIC_ORIGIN", "https://hazelwood-card.inne.space"),
		webDir:              envOr("WEB_DIR", "./web"),
		mapURL:              envOr("BLUEMAP_URL", "http://minecraft-server:8100"),
		minecraftDataDir:    envOr("MINECRAFT_DATA_DIR", "/minecraft-data"),
		serverAddress:       envOr("MINECRAFT_SERVER_ADDRESS", "hazelwood.inne.space"),
		cookieSecure:        cookieSecure,
	}, nil
}

func readRCONPassword() (string, error) {
	file := envOr("RCON_PASSWORD_FILE", "/run/secrets/rcon_password")
	if file != "" {
		contents, err := os.ReadFile(file)
		if err == nil {
			password := strings.TrimSpace(string(contents))
			if password != "" {
				return password, nil
			}
		} else if !errors.Is(err, os.ErrNotExist) && os.Getenv("RCON_PASSWORD") == "" {
			return "", fmt.Errorf("read RCON_PASSWORD_FILE %q: %w", file, err)
		}
	}
	if password := os.Getenv("RCON_PASSWORD"); password != "" {
		return password, nil
	}
	return "", errors.New("RCON password required: provide secret file at RCON_PASSWORD_FILE (default /run/secrets/rcon_password) or RCON_PASSWORD for local development")
}

func readMinecraftAuthSecret() (string, error) {
	file := envOr("MINECRAFT_AUTH_SECRET_FILE", "/run/secrets/minecraft_auth_secret")
	if file != "" {
		contents, err := os.ReadFile(file)
		if err == nil {
			secret := strings.TrimSpace(string(contents))
			if secret != "" {
				return secret, nil
			}
		} else if !errors.Is(err, os.ErrNotExist) && strings.TrimSpace(os.Getenv("MINECRAFT_AUTH_SECRET")) == "" {
			return "", fmt.Errorf("read MINECRAFT_AUTH_SECRET_FILE %q: %w", file, err)
		}
	}
	if secret := os.Getenv("MINECRAFT_AUTH_SECRET"); strings.TrimSpace(secret) != "" {
		return secret, nil
	}
	return "", nil
}

func requiredEnv(name string) (string, error) {
	value := strings.TrimSpace(os.Getenv(name))
	if value == "" {
		return "", fmt.Errorf("%s is required", name)
	}
	return value, nil
}

func requiredSecretEnv(name string) (string, error) {
	value := os.Getenv(name)
	if strings.TrimSpace(value) == "" {
		return "", fmt.Errorf("%s is required", name)
	}
	return value, nil
}

func envOr(name, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(name)); value != "" {
		return value
	}
	return fallback
}
