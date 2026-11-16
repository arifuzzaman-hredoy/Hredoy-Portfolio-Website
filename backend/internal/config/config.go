package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	AppEnv       string
	AppPort      string
	LogLevel     string
	DatabaseURL  string
	MigrationURL string
}

func Load() (*Config, error) {
	cfg := &Config{
		AppEnv:       env("APP_ENV", "development"),
		AppPort:      env("APP_PORT", "8080"),
		LogLevel:     env("LOG_LEVEL", "info"),
		DatabaseURL:  env("DATABASE_URL", "postgres://portfolio:portfolio@postgres:5432/portfolio?sslmode=disable"),
		MigrationURL: env("MIGRATION_PATH", "file://db/migrations"),
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
		cfg.MigrationURL = "file://db/migrations"
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
