# Phase 1-2 Foundation Implementation and Validation

## Scope

Implemented the approved Phase 1 baseline and Phase 2 Go/PostgreSQL foundation only. No admin panel, real portfolio content, template conversion, or changes to `template-source/` were made.

No files were deleted during this work. The Docker validation stack is running under Compose project `hredoy-foundation-validation`.

## What Was Built

- Go application skeleton with environment configuration, chi routing, structured logging, PostgreSQL connection pooling, graceful shutdown, `/healthz`, and database-backed `/readyz`.
- Initial PostgreSQL migration, sqlc-generated database package, and migration loading in the runtime image.
- Docker Compose services for PostgreSQL, the Go app, and nginx, with service health checks. PostgreSQL has no host port mapping.
- GitHub Actions checks for Go formatting, dependency verification, vet, tests, binary build, Compose configuration, and Docker image build.
- Playwright visual-regression tooling and the original homepage screenshots.
- `godotenv` was removed because it was unused and its declared module version did not exist. Dependency resolution selected Go 1.24, so the Docker builder now uses Go 1.24.
- Added a binary health-check command used by the app container health check. The runtime image copies only the Go binary and database migrations; Node and Playwright are not included in the final image.

## How to Run Locally

Start the stack:

```powershell
docker compose up -d --build --wait
```

Check service health and endpoints:

```powershell
docker compose ps
curl.exe http://localhost/healthz
curl.exe http://localhost/readyz
```

Run the Go checks:

```powershell
gofmt -w cmd internal
go mod verify
go vet ./...
go test ./...
go build -o build\portfolio.exe ./cmd/portfolio
```

Run the visual regression suite (after `npm ci`):

```powershell
node .\node_modules\@playwright\test\cli.js test
```

The direct Playwright invocation avoids a Windows npm script path parsing issue with this workspace's `&` character.

## Validation Results

| Check | Result |
|---|---|
| Current branch | `roadmap/02-go-postgres-foundation` |
| `gofmt` | Pass; no unformatted Go files |
| `go mod verify` | Pass |
| `go vet ./...` | Pass |
| `go test ./...` | Pass |
| `go build ./cmd/portfolio` | Pass |
| `docker compose config --quiet` | Pass |
| Docker image build | Pass |
| Compose service health | PostgreSQL, app, and nginx all healthy |
| `/healthz` and `/readyz` | Both return HTTP 200 through nginx inside the Compose network (`ok`, `ready`) |
| Fresh database migration | Pass; `schema_migrations` reports version 1, `dirty = false`; `site_settings` and `contact_messages` exist |
| PostgreSQL host port | None published |
| Visual regression | 3 passed at the 1% maximum pixel-difference threshold |
| Template checksums | Pass; all 817 files match the Phase 1 manifest |
| Node/Playwright in app image | Not part of runtime stage; final image contains the Go binary and migration files |

Baseline and passing visual comparisons:

- `tests/visual/snapshots/homepage.spec.js/home-07-dark-desktop-1440x900.png`
- `tests/visual/snapshots/homepage.spec.js/home-07-dark-tablet-768x1024.png`
- `tests/visual/snapshots/homepage.spec.js/home-07-dark-mobile-390x844.png`

## Ignore Rules

`.gitignore` covers `.env` and `.env.*` (while allowing `.env.example`), `node_modules/`, `test-results/`, `var/media/`, and build outputs including `build/`, `bin/`, `dist/`, test binaries, and coverage files.

## Known Issues and Limits

- This workspace's host port 80 responds from an unrelated nginx service, and Docker Desktop does not report a host-published port for the Compose nginx container. The endpoints were therefore verified through nginx from inside the Compose network, where both passed. The PostgreSQL port isolation requirement is verified from the resolved Compose config.
- PostgreSQL emits its standard Alpine image warnings about missing system locales and local `trust` authentication during fresh initialization. The database is not published to the host; production credentials and deployment hardening remain future work.
- Visual tooling is development/test-only. The public website still serves the untouched original static template; Go template conversion is a later approved phase.
