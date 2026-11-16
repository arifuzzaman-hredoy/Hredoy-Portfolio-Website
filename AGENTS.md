# AGENTS.md

## Project Summary
"Hredoy's Portfolio" is the production DevOps portfolio website of Arifuzzaman Hredoy (aspiring Junior DevOps Engineer, Bangladesh). Planned production domain: `oxytumzone.com` (staging at `staging.oxytumzone.com`). Private repository: `https://github.com/arifuzzaman-hredoy/Hredoy-Portfolio-Website`.

## Approved Architecture & Core Decisions
1. **Frontend / Design**: Orisa Home 07 Dark. Original design (layout, typography, colors, animations, responsive behavior) must be preserved exactly. Frontend uses HTML/CSS/JS + assets only (NO React, TypeScript, Tailwind, or template CSS rewrites). Dark theme only.
2. **Backend**: Go with `chi` router, `pgx` + `sqlc`, `golang-migrate`.
3. **Database**: PostgreSQL 16. Dynamic owner profile and site metadata live in `site_settings` table (not hardcoded).
4. **Public Site (`/`)**: Server-rendered Go `html/template`. Markup/CSS/JS identical to original template. No public JSON API; the only public write route is `POST /contact`.
5. **Admin (`/super-admin`)**: Single owner, server-rendered Go templates with separate plain CSS (never mix with Bootstrap CSS), plain JS/htmx, no Node build.
6. **DevOps & Deployment**: Docker Compose (`nginx` + `app` + `postgres`). EC2 + GitHub Actions CI/CD. Postgres and Go app are never published to host; Nginx reverse proxy handles external traffic (locally bound to `127.0.0.1:8080:80`).
7. **SEO / AEO / GEO**: Server-rendered metadata, OpenGraph, JSON-LD schemas (`Person`, `ProfilePage`, etc.), `sitemap.xml`, `robots.txt`, `llms.txt`.

## Hard Rules
- **Honest Content Only**: Never add fake metrics, clients, awards, or unconfirmed projects.
- **Workflow**: Plan -> User explicit approval -> Small phase execution -> Short report -> STOP.
- **Branching & PRs**: One branch per phase, small atomic commits, all tests/CI green before merging.
- **Protection**: Never touch `.git`, `docs/`, `tests/visual/snapshots`, or the 166 verified template files without explicit task instructions. Never delete files outside exact task scope. No secrets in repo. Never push to `main` directly.

## Repository Layout
- `frontend/templates/`: Template HTML files (e.g. `index-7-dark.html`).
- `frontend/static/assets/`: 166 verified template assets (css, js, fonts, imgs).
- `backend/`: Go application code (`cmd/portfolio/`, `internal/app/`, `internal/config/`, etc.), `go.mod`, `go.sum`.
- `database/`: `migrations/`, `queries/`, `sqlc.yaml`.
- `devops/`: `docker-compose.yml`, `docker/Dockerfile`, `nginx/nginx.conf`.
- `tests/visual/`: Visual baseline regression tests with Playwright (`snapshots/`).
- `scripts/`: Verification scripts (`verify-template-checksums.ps1`).

## Environment Gotchas & Commands
- **Windows Path Gotcha**: Current path has `&` ("Cloud & DevOps"), which breaks `npx playwright test`. Always run Playwright via Node:
  ```powershell
  node .\node_modules\@playwright\test\cli.js test
  ```
- **Line Endings**: Use Windows Git (`git -c core.autocrlf=true status`). Do not edit `.gitattributes` without approval.
- **Docker Mounts**: Creating bind mounts of missing files causes Docker to create a directory. Keep `devops/nginx/nginx.conf` intact.
- **Verification Commands**:
  - Frontend Template Checksums:
    ```powershell
    powershell -ExecutionPolicy Bypass -File scripts\verify-template-checksums.ps1
    ```
  - Backend Checks & Tests:
    ```powershell
    cd backend
    gofmt -l .
    go vet ./...
    go test ./...
    ```
  - Docker Compose Stack:
    ```powershell
    cd devops
    docker compose up --build -d
    docker compose ps
    curl http://127.0.0.1:8080/healthz
    curl http://127.0.0.1:8080/readyz
    docker compose down
    ```

## Roadmap Status
- **Phase 1 (Baseline)**: Complete.
- **Phase 2 (Foundation & Structure Refactor)**: Refactored layout (`refactor/project-structure`).
- **Phase 3 (Public Template Shell)**: Next phase (requires user explicit approval to start).
