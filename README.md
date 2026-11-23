<div align="center">

# Hredoy's Portfolio

### Production DevOps Portfolio Website — Full-Stack, CMS-Driven, Self-Hosted

**Live site:** [oxytumzone.com](https://oxytumzone.com)

A server-rendered portfolio for **Arifuzzaman Hredoy** (Junior DevOps Engineer, Bangladesh), built with **Go + Next.js + PostgreSQL**, containerised with **Docker Compose**, and deployed to **AWS EC2** behind **nginx** with a **GitHub Actions** CI/CD pipeline and **Cloudflare** edge caching.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Admin Panel](#admin-panel)
- [Deployment](#deployment)
- [Verification & Scripts](#verification--scripts)
- [Accessibility, SEO & Performance](#accessibility-seo--performance)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This repository powers a production, content-managed portfolio. It pairs a **Go (chi) backend** — which owns the database, admin panel, contact form, and JSON API — with a **Next.js (React) frontend** that renders the public site. All site content (profile, projects, certificates, resume, images, lists, SEO text) is editable from a built-in **Super Admin** panel and served dynamically, so no redeploy is needed to change content.

The design is based on the **Orisa Home 07 Dark** template; its original layout, typography, colours, animations, and responsive behaviour are preserved, with the body markup rendered through reusable React section components.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Backend** | Go 1.24, [chi](https://github.com/go-chi/chi) v5 router |
| **Database** | PostgreSQL 16, [pgx](https://github.com/jackc/pgx) v5, [sqlc](https://sqlc.dev), [golang-migrate](https://github.com/golang-migrate/migrate) |
| **Reverse proxy** | nginx (serves Next.js + proxies Go API/admin) |
| **Containerisation** | Docker Compose (`nginx` + `app` + `frontend` + `postgres`) |
| **CI/CD** | GitHub Actions → GHCR (GitHub Container Registry) → EC2 |
| **Edge / CDN** | Cloudflare (HTML + asset caching, edge purge on save) |
| **Media** | Cloudinary (with local-disk fallback) |
| **Email** | SMTP (contact form notifications) |

---

## Architecture

```
                         ┌──────────────────────────────┐
   Visitor  ───────────▶ │   nginx  (127.0.0.1:8080)     │
                         │   reverse proxy + routing     │
                         └───────────┬──────────┬────────┘
                                     │          │
              /  /_next  /assets      │          │  /api  /super-admin  /uploads
                                     ▼          ▼
                        ┌────────────────┐  ┌──────────────────────┐
                        │  Next.js 16     │  │  Go (chi) backend     │
                        │  React 19 SSR   │  │  REST API + Admin     │
                        │  (frontend:3000)│  │  (app:8080)           │
                        └───────┬─────────┘  └──────────┬───────────┘
                                │  HTTP JSON API         │
                                └───────────┬────────────┘
                                            ▼
                                  ┌───────────────────┐
                                  │  PostgreSQL 16     │
                                  │  (private network) │
                                  └───────────────────┘
```

- The **Go backend** is the source of truth: it owns PostgreSQL, serves the JSON API the frontend consumes, and hosts the admin panel, contact form, and SEO endpoints.
- The **Next.js frontend** fetches content from the backend API and server-renders the public pages.
- **nginx** is the only host-exposed service; it routes `/`, `/_next`, `/assets` to the frontend and `/api`, `/super-admin`, `/uploads` to the backend.
- **Cloudflare** caches the HTML and assets at the edge; after an admin save the backend purges the edge copy so edits appear immediately.

---

## Features

- **Server-rendered public site** — fast, SEO-friendly, no client-side-only content.
- **Full Super Admin CMS** at `/super-admin` — manage profile, settings, content blocks, repeatable lists, projects, certificates, resume/CV, site images, and media uploads.
- **Contact form** — stores messages in PostgreSQL and (optionally) emails the owner via SMTP, with honeypot + rate limiting.
- **Projects & Certificates** — database-backed, with featured toggles, categories, and image management.
- **Resume / CV section** — admin-uploaded PDF/HTML resume with a responsive viewer.
- **On-demand cache revalidation** — admin saves revalidate the Next.js cache *and* purge the Cloudflare edge copy.
- **SEO / AEO / GEO** — server-rendered metadata, OpenGraph, Twitter cards, JSON-LD (`Person`, `WebSite`), `sitemap.xml`, `robots.txt`, and `llms.txt`.
- **Security headers, CSRF protection, session auth, and rate limiting** built into the Go backend.

---

## Project Structure

```
.
├── backend/                     # Go application (chi router)
│   ├── cmd/portfolio/           # Entry point
│   └── internal/
│       ├── app/                 # App wiring
│       ├── certificates/        # Certificate domain logic
│       ├── cloudflare/          # Cloudflare edge purge client
│       ├── cloudinary/          # Media upload client
│       ├── cmsgen/              # CMS manifest + content generation
│       ├── config/              # Env configuration loader
│       ├── db/                  # Postgres connection
│       ├── http/                # Handlers, templates, router, sessions
│       ├── logging/             # Structured slog logging
│       ├── notify/              # SMTP email notifications
│       ├── services/            # Business services
│       └── store/               # sqlc-generated store
├── database/
│   ├── migrations/              # golang-migrate SQL migrations (001–024)
│   └── queries/                 # sqlc query definitions
├── devops/
│   ├── docker-compose.yml       # Local/production compose stack
│   ├── docker/Dockerfile        # Backend image
│   ├── nginx/nginx.conf         # Reverse proxy config
│   └── .env.example             # Env template
├── frontend/                    # Next.js application
│   ├── app/                     # App Router (page, layout, api, contact)
│   ├── public/assets/           # Template CSS/JS/fonts/images
│   ├── scripts/                 # Template conversion + verification tools
│   └── src/
│       ├── components/public/   # HomeContent + sections/ + shared components
│       └── lib/                 # CMS renderers, data helpers
├── docs/                        # Analysis & planning documents
└── .github/workflows/           # CI (ci.yml) + CD (deploy.yml)
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 and **npm**
- **Go** ≥ 1.24
- **Docker** + Docker Compose (for the full stack)
- **PostgreSQL** 16 (or use the Docker Compose service)

> **Windows note:** the project path contains `&` ("Cloud & DevOps"), which can break `npm`/`npx` module resolution. Run Next.js directly via Node:
> ```powershell
> cd frontend
> node node_modules\next\dist\bin\next dev -p 3001
> node node_modules\next\dist\bin\next build
> ```

### 1. Clone the repository

```bash
git clone https://github.com/arifuzzaman-hredoy/Hredoy-Portfolio-Website.git
cd Hredoy-Portfolio-Website
```

### 2. Configure environment

```bash
cp .env.example .env            # backend (repo root)
cp devops/.env.example devops/.env   # docker compose stack
```

Fill in the values (see [Environment Variables](#environment-variables)). **Never commit `.env`.**

### 3. Run with Docker Compose (recommended)

```bash
cd devops
docker compose up --build -d
docker compose ps
curl http://127.0.0.1:8080/healthz    # -> {"status":"ok"}
curl http://127.0.0.1:8080/readyz     # -> {"status":"ready"}
```

The public site is then available at `http://127.0.0.1:8080` and the admin at `/super-admin`.

### 4. Run the frontend standalone (local dev)

```bash
cd frontend
npm install
node node_modules\next\dist\bin\next dev -p 3001
```

### 5. Run the backend standalone

```bash
cd backend
go mod download
go run ./cmd/portfolio        # reads .env, listens on :8080
```

---

## Environment Variables

All variables are read by the Go backend (`backend/internal/config/config.go`). See `.env.example` for the canonical list.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_ENV` | no | `development` | Runtime environment |
| `APP_PORT` | no | `8080` | Backend listen port |
| `LOG_LEVEL` | no | `info` | Log verbosity |
| `DATABASE_URL` | **yes** | `postgres://portfolio:portfolio@postgres:5432/portfolio?sslmode=disable` | PostgreSQL DSN |
| `MIGRATION_PATH` | no | `file://../database/migrations` | Migration source (Docker uses `file:///app/db/migrations`) |
| `SITE_URL` | no | `https://oxytumzone.com` | Public site URL (SEO, links, purge target) |
| `ADMIN_USERNAME` | no | `admin` | Super admin username |
| `ADMIN_PASSWORD` | for admin | *(empty)* | Super admin password (both fields required to enable login) |
| `UPLOAD_DIR` | no | `./uploads` | Local media upload directory |
| `CLOUDINARY_CLOUD_NAME` | no | *(empty)* | Cloudinary cloud name (media hosting) |
| `CLOUDINARY_API_KEY` | no | *(empty)* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | no | *(empty)* | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | no | `portfolio` | Cloudinary upload folder |
| `REVALIDATE_URL` | no | `http://frontend:3000/api/revalidate` | Next.js revalidate endpoint (internal network) |
| `REVALIDATE_TOKEN` | for revalidation | *(empty)* | Shared secret between backend and frontend |
| `SMTP_HOST` | no | *(empty)* | SMTP server (contact email notifications) |
| `SMTP_PORT` | no | `587` | SMTP port |
| `SMTP_USERNAME` | no | *(empty)* | SMTP username |
| `SMTP_PASSWORD` | no | *(empty)* | SMTP password (Gmail: use an App Password) |
| `SMTP_FROM` | no | *(empty)* | Sender address |
| `CONTACT_NOTIFY_TO` | no | *(empty)* | Recipient of contact notifications |
| `CLOUDFLARE_API_TOKEN` | no | *(empty)* | Cloudflare token with **Zone → Cache Purge** permission |
| `CLOUDFLARE_ZONE_ID` | no | *(empty)* | Cloudflare zone ID |

---

## Database

- **Migrations** live in `database/migrations/` (golang-migrate, `001`–`024`, up/down pairs).
- **Queries** are defined in `database/queries/` and compiled to Go by **sqlc** (`sqlc.yaml`).
- Key tables: `site_settings`, `contact_messages`, `projects`, `media`, `content_blocks`, `content_items`, `site_images`, `certificates`.
- Content is seeded from migrations so a fresh database boots with the full site populated.

Generate store code with sqlc:

```bash
sqlc generate
```

---

## Admin Panel

The Super Admin panel is served by the Go backend at **`/super-admin`** (server-rendered Go templates with plain CSS/JS — deliberately separate from the public Bootstrap theme).

| Route | Purpose |
|-------|---------|
| `/super-admin` | Dashboard |
| `/super-admin/messages` | Contact inbox (read/unread/delete) |
| `/super-admin/settings` | Owner profile & site settings (`site_settings`) |
| `/super-admin/content` | Editable text content blocks |
| `/super-admin/lists` | Repeatable lists (tags, skills, nav, etc.) |
| `/super-admin/projects` | Projects CRUD |
| `/super-admin/certificates` | Certificates CRUD |
| `/super-admin/resume` | Resume/CV upload + active selection |
| `/super-admin/site-images` | Site image slots (desktop + mobile) |
| `/super-admin/media` | Media library uploads |

Protected by session auth, CSRF (double-submit cookie), and rate limiting. After any public-content save, the backend revalidates the Next.js cache and purges the Cloudflare edge copy.

---

## Deployment

**Target:** AWS EC2, Docker Compose behind nginx, with GitHub Actions CI/CD.

### CI/CD pipeline (`.github/workflows/`)

- **`ci.yml`** — format check, `go vet`, unit tests, and build on push/PR.
- **`deploy.yml`** — on push to `main`:
  1. Build `portfolio-app` and `portfolio-frontend` images and push to **GHCR**.
  2. SSH into EC2 (`ubuntu@$EC2_HOST`), `cd /opt/portfolio`, `docker compose pull && docker compose up -d`.
  3. Verify `https://oxytumzone.com/api/v1/projects` returns HTTP 200.

**EC2 deployment path:** `/opt/portfolio` (contains only `compose.yaml` + `.env`; source lives in GitHub and is baked into the GHCR images). `EC2_HOST` and `SSH_PRIVATE_KEY` are stored as GitHub Actions secrets.

### Caching (Cloudflare)

- **HTML** at `/` is cached at the edge; after an admin save the backend purges it so edits appear instantly.
- **`/assets/*`** is cached at the edge; after changing anything under `frontend/public/assets/`, purge the Cloudflare cache (Caching → Configuration → Purge Everything) or run the deploy pipeline.

---

## Verification & Scripts

**Frontend** (run in `frontend/`):

```powershell
node node_modules\next\dist\bin\next build     # production build
node node_modules/typescript/bin/tsc --noEmit  # type check
```

**Backend** (run in `backend/`):

```powershell
gofmt -l .        # formatting (note: CRLF checkout may list files)
go vet ./...      # static analysis
go test ./...     # unit tests
```

**Docker stack** (run in `devops/`):

```powershell
docker compose up --build -d
docker compose ps
curl http://127.0.0.1:8080/healthz
curl http://127.0.0.1:8080/readyz
docker compose down
```

---

## Accessibility, SEO & Performance

- **Accessibility:** semantic landmarks, ARIA labels, keyboard navigation, and `prefers-reduced-motion` support.
- **SEO/AEO/GEO:** server-rendered `<title>`/meta, OpenGraph, Twitter cards, JSON-LD (`Person`, `WebSite`), `sitemap.xml`, `robots.txt`, and `llms.txt` for AI answer engines.
- **Performance:** server rendering, `transform`/`opacity`-only animations, async GSAP loading, immutable asset caching, and edge HTML caching.

---

## Security

- **No secrets in the repository** — all credentials live in environment variables / GitHub Actions secrets.
- **Security headers** (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) on every response.
- **CSRF protection** (double-submit cookie) and **session auth** on the admin panel.
- **Rate limiting** on login and contact endpoints.
- **Non-root** application container (distroless); PostgreSQL and the app are never published to the host.

---

## Contributing

This is a personal portfolio project. The workflow is **plan → approve → implement → verify**, committing directly to `main` with small, atomic commits once build, lint, and tests pass. See [`AGENTS.md`](./AGENTS.md) for the full set of project rules and conventions.

---

## License

Content and code are © Arifuzzaman Hredoy. The design derives from the **Orisa** template; its license terms apply to the template-derived assets. See individual asset licenses where noted.

---

<div align="center">

**Built with Go, Next.js, PostgreSQL, Docker, and a lot of ☕ by [Arifuzzaman Hredoy](https://github.com/arifuzzaman-hredoy)**

</div>