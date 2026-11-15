package http

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type HandlerDeps struct {
	Logger *slog.Logger
	DB     *pgxpool.Pool
}

func (d HandlerDeps) home(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("Hredoy Portfolio is starting. Public routes are under construction.\n"))
}

func (d HandlerDeps) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (d HandlerDeps) readyz(w http.ResponseWriter, r *http.Request) {
	if d.DB == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "not-ready", "reason": "database not configured"})
		return
	}
	if err := d.DB.Ping(context.Background()); err != nil {
		d.Logger.Error("database readiness check failed", "error", err)
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "not-ready", "reason": "database unavailable"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
