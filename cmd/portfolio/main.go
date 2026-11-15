package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/app"
	"github.com/arifuzzaman-hredoy/portfolio/internal/config"
)

func main() {
	if len(os.Args) == 2 && os.Args[1] == "healthcheck" {
		if err := healthcheck(os.Getenv("APP_PORT")); err != nil {
			log.Print(err)
			os.Exit(1)
		}
		return
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := app.Run(ctx, cfg); err != nil {
		log.Fatalf("run app: %v", err)
	}
}

func healthcheck(port string) error {
	if port == "" {
		port = "8080"
	}
	if _, err := strconv.Atoi(port); err != nil {
		return fmt.Errorf("invalid APP_PORT for healthcheck: %w", err)
	}

	client := &http.Client{Timeout: 3 * time.Second}
	for _, path := range []string{"/healthz", "/readyz"} {
		resp, err := client.Get("http://127.0.0.1:" + port + path)
		if err != nil {
			return fmt.Errorf("request %s: %w", path, err)
		}
		_ = resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("%s returned HTTP %d", path, resp.StatusCode)
		}
	}
	return nil
}
