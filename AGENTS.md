# AGENTS.md

## Project Summary
"Hredoy's Portfolio" is the production DevOps portfolio website of Arifuzzaman Hredoy (aspiring Junior DevOps Engineer, Bangladesh). Planned production domain: `oxytumzone.com` (staging at `staging.oxytumzone.com`). Private repository: `https://github.com/arifuzzaman-hredoy/Hredoy-Portfolio-Website`.

## Approved Architecture & Core Decisions
1. **Frontend / Design**: Orisa Home 07 Dark. Original design (layout, typography, colors, animations, responsive behavior) must be preserved exactly. The frontend is a Next.js (React + TypeScript) app in `frontend/`, rendering the template via `HomeContent.tsx` (generated from the original Orisa template by `scripts/convert-template.mjs`). Raw template CSS/JS assets are preserved as-is; no Tailwind or CSS rewrites. Dark theme only.
2. **Backend**: Go with `chi` router, `pgx` + `sqlc`, `golang-migrate`.
3. **Database**: PostgreSQL 16. Dynamic owner profile and site metadata live in `site_settings` table (not hardcoded).
4. **Public Site (`/`)**: Next.js app in `frontend/` (server-rendered). Markup/CSS/JS identical to original template. No public JSON API; the only public write route is `POST /contact` (backend).
5. **Admin (`/super-admin`)**: Single owner, server-rendered Go templates with separate plain CSS (never mix with Bootstrap CSS), plain JS/htmx, no Node build.
6. **DevOps & Deployment**: Docker Compose (`nginx` + `app` + `postgres`). EC2 + GitHub Actions CI/CD. Postgres and Go app are never published to host; Nginx reverse proxy handles external traffic (locally bound to `127.0.0.1:8080:80`).
7. **SEO / AEO / GEO**: Server-rendered metadata, OpenGraph, JSON-LD schemas (`Person`, `ProfilePage`, etc.), `sitemap.xml`, `robots.txt`, `llms.txt`.

## Hard Rules
- **Honest Content Only**: Never add fake metrics, clients, awards, or unconfirmed projects.
- **Workflow**: Plan -> User explicit approval -> Small phase execution -> Short report -> STOP.
- **Branching & PRs**: Work on `main` only — no feature branches, no pull requests. Commit and push directly to `main`. Small atomic commits, and only push once the build, lint and Go tests pass.
- **Protection**: Never touch `.git` or `docs/` without explicit task instructions. Never delete files outside exact task scope. No secrets in repo.

## Repository Layout
- `frontend/`: Next.js application (React + TypeScript). `app/` (routes/layouts), `src/components/public/` (`HomeContent.tsx`, `ScriptLoader.tsx`), `public/assets/` (css, js, fonts, imgs), `scripts/` (`convert-template.mjs` generator + verification tools), `package.json`.
- `backend/`: Go application code (`cmd/portfolio/`, `internal/app/`, `internal/config/`, etc.), `go.mod`, `go.sum`.
- `database/`: `migrations/`, `queries/`, `sqlc.yaml`.
- `devops/`: `docker-compose.yml`, `docker/Dockerfile`, `nginx/nginx.conf`.
- `docs/`: Analysis and planning documents.

## Environment Gotchas & Commands
- **Windows Path Gotcha**: Current path has `&` ("Cloud & DevOps"), which breaks `npm`/`npx` module resolution. Run Next.js directly via Node:
  ```powershell
  cd frontend
  node node_modules\next\dist\bin\next dev -p 3001
  node node_modules\next\dist\bin\next build
  ```
- **Line Endings**: Use Windows Git (`git -c core.autocrlf=true status`). Do not edit `.gitattributes` without approval.
- **Docker Mounts**: Creating bind mounts of missing files causes Docker to create a directory. Keep `devops/nginx/nginx.conf` intact.
- **Verification Commands**:
  - Frontend Build:
    ```powershell
    cd frontend
    node node_modules\next\dist\bin\next build
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
- **Phase 2 (Foundation & Structure Refactor)**: Complete.
- **Phase 3 (Public Template Shell)**: Complete — the Next.js frontend renders the template from the Go backend, with a full admin at `/super-admin`.
- **Content slices**: B1 (typed, manifest-driven CMS content), the revalidation slice (on-demand cache purge after an admin save), B2 (owner identity + image alts from `site_settings`/`site_images`), B3 (repeatable lists from `content_items`), B4 (performance: subset icon fonts, minified `main.css`, WebP image delivery) — all shipped.

## Deployment Gotchas
- **Cloudflare caches `/assets/*`.** `main.css` and the fonts revalidate, but `assets/css/vendors/*.css` is served from a long-lived edge copy. After changing anything under `frontend/public/assets/`, purge the Cloudflare cache (Caching → Configuration → Purge Everything) or the old bytes keep being served to some PoPs even though the origin is correct.
- **HTML is cached at the edge.** With a Cloudflare cache rule for `/` (Cache Eligibility: Eligible, Edge TTL: override origin, Browser TTL: respect origin) the HTML no longer hits the origin, so the first request after a cold start drops from ~1.2 s to well under 0.1 s. That makes an edge purge mandatory after every admin save, which is why `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID` are set: the revalidation middleware purges the URL right after it revalidates Next.js.
- **Contact email is optional.** With `SMTP_HOST`, `SMTP_FROM` and `CONTACT_NOTIFY_TO` set, every contact message is also emailed to the owner; otherwise messages only land in the database and the admin inbox.
