package app

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/config"
	postgresdb "github.com/arifuzzaman-hredoy/portfolio/internal/db"
	portfoliohttp "github.com/arifuzzaman-hredoy/portfolio/internal/http"
	"github.com/arifuzzaman-hredoy/portfolio/internal/logging"
	"github.com/golang-migrate/migrate/v4"
	migratepgx "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func Run(ctx context.Context, cfg *config.Config) error {
	logger := logging.New(cfg.LogLevel)
	logger.Info("starting portfolio app", "env", cfg.AppEnv, "port", cfg.AppPort)

	if cfg.AdminPassword == "" {
		logger.Warn("ADMIN_PASSWORD is not set; /super-admin login is disabled")
	}

	if err := runMigrations(cfg.MigrationURL, cfg.DatabaseURL); err != nil {
		return fmt.Errorf("run migrations: %w", err)
	}

	pool, err := postgresdb.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("connect db: %w", err)
	}
	defer pool.Close()

	router := portfoliohttp.NewRouter(cfg, logger, pool)
	server := &http.Server{
		Addr:              ":" + cfg.AppPort,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       30 * time.Second,
	}

	serverErrCh := make(chan error, 1)
	go func() {
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrCh <- err
			return
		}
		serverErrCh <- nil
	}()

	shutdownCh := make(chan os.Signal, 1)
	signal.Notify(shutdownCh, os.Interrupt, syscall.SIGTERM)

	select {
	case sig := <-shutdownCh:
		logger.Info("received shutdown signal", "signal", sig.String())
	case err := <-serverErrCh:
		if err != nil {
			return fmt.Errorf("serve http: %w", err)
		}
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("shutdown server: %w", err)
	}

	logger.Info("portfolio app shutdown complete")
	return nil
}

// runMigrations applies pending migrations using the pgx driver so connection
// options such as channel_binding are honoured (the lib/pq driver does not
// understand them and would forward them to the server as runtime parameters).
func runMigrations(migrationURL, databaseURL string) error {
	sqlDB, err := sql.Open("pgx/v5", databaseURL)
	if err != nil {
		return err
	}
	defer sqlDB.Close()

	driver, err := migratepgx.WithInstance(sqlDB, &migratepgx.Config{})
	if err != nil {
		return err
	}

	m, err := migrate.NewWithDatabaseInstance(migrationURL, "pgx5", driver)
	if err != nil {
		return err
	}
	defer m.Close()

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}
	return nil
}
