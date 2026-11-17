package config

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	AppEnv              string
	AppPort             string
	LogLevel            string
	DatabaseURL         string
	MigrationURL        string
	SiteURL             string
	AdminUsername       string
	AdminPassword       string
	UploadDir           string
	CloudinaryCloud     string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
	CloudinaryFolder    string
	RevalidateURL       string
	RevalidateToken     string
}

func Load() (*Config, error) {
	loadDotEnv()

	cfg := &Config{
		AppEnv:              env("APP_ENV", "development"),
		AppPort:             env("APP_PORT", "8080"),
		LogLevel:            env("LOG_LEVEL", "info"),
		DatabaseURL:         env("DATABASE_URL", "postgres://portfolio:portfolio@postgres:5432/portfolio?sslmode=disable"),
		MigrationURL:        env("MIGRATION_PATH", "file://../database/migrations"),
		SiteURL:             strings.TrimRight(env("SITE_URL", "https://oxytumzone.com"), "/"),
		AdminUsername:       env("ADMIN_USERNAME", "admin"),
		AdminPassword:       env("ADMIN_PASSWORD", ""),
		UploadDir:           env("UPLOAD_DIR", "./uploads"),
		CloudinaryCloud:     env("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryAPIKey:    env("CLOUDINARY_API_KEY", ""),
		CloudinaryAPISecret: env("CLOUDINARY_API_SECRET", ""),
		CloudinaryFolder:    env("CLOUDINARY_FOLDER", "portfolio"),
		RevalidateURL:       strings.TrimRight(env("REVALIDATE_URL", "http://frontend:3000/api/revalidate"), "/"),
		RevalidateToken:     env("REVALIDATE_TOKEN", ""),
	}

	cfg.AppEnv = strings.ToLower(cfg.AppEnv)
	cfg.LogLevel = strings.ToLower(cfg.LogLevel)
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.AppPort == "" {
		cfg.AppPort = "8080"
	}
	if cfg.MigrationURL == "" {
		cfg.MigrationURL = "file://../database/migrations"
	}
	if cfg.AdminUsername == "" {
		cfg.AdminUsername = "admin"
	}
	return cfg, nil
}

func env(key, fallback string) string {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback
	}
	return strings.TrimSpace(value)
}

// loadDotEnv loads KEY=VALUE pairs from the nearest .env file into the process
// environment. Variables already present in the environment always win, so
// container and CI configuration keeps precedence over the file.
func loadDotEnv() {
	dir, err := os.Getwd()
	if err != nil {
		return
	}
	for i := 0; i < 4; i++ {
		data, err := os.ReadFile(filepath.Join(dir, ".env"))
		if err == nil {
			applyDotEnv(string(data))
			return
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return
		}
		dir = parent
	}
}

func applyDotEnv(content string) {
	scanner := bufio.NewScanner(strings.NewReader(content))
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		line = strings.TrimPrefix(line, "export ")
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.TrimSpace(value)
		if len(value) >= 2 {
			first, last := value[0], value[len(value)-1]
			if (first == '"' && last == '"') || (first == '\'' && last == '\'') {
				value = value[1 : len(value)-1]
			}
		}
		if key == "" {
			continue
		}
		if _, exists := os.LookupEnv(key); exists {
			continue
		}
		_ = os.Setenv(key, value)
	}
}
