package http

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(logger *slog.Logger, db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	deps := HandlerDeps{Logger: logger, DB: db}
	r.Get("/", deps.home)
	r.Get("/healthz", deps.health)
	r.Get("/readyz", deps.readyz)
	return r
}
