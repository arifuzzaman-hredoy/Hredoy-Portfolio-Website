# Cleanup Stage 2 — Result

**Status:** Approved deletions applied on `chore/cleanup-unused-files`. Phase 3 has not started.

## Before and after

| State | Files | Bytes |
|---|---:|---:|
| Before cleanup | 817 | 120,935,793 |
| Removed from `template-source/` | 651 | 102,106,332 |
| Remaining in `template-source/` | 166 | 18,829,461 |

The committed deletions match the 651 unique paths in Section C of `docs/11-cleanup-dry-run.md` exactly: 0 missing and 0 extra. The approved generated project outputs listed in Section A of that report were also removed after validation:

| Generated target | Files | Bytes |
|---|---:|---:|
| `build/portfolio.exe` | 1 | 15,976,448 |
| `node_modules/` | 194 | 19,068,780 |
| `test-results/.last-run.json` | 1 | 45 |
| **Total** | **196** | **35,045,273** |

`package.json`, `package-lock.json`, the three baseline screenshots, docs, Go source, database files, deployment files, and configuration remain. `.vscode/settings.json` is user-local and was not touched or staged.

### Removed groups

| Group | Files | Bytes |
|---|---:|---:|
| Other home demo image directories (home-6, home-8..home-15) | 327 | 16,564,819 |
| Cursor-trail demo images | 8 | 65,536 |
| Portfolio demo image directories | 25 | 5,017,360 |
| Product demo images | 27 | 8,227,046 |
| Slideshow demo images | 2 | 283,176 |
| Unreferenced shared pages-root images | 230 | 69,625,666 |
| Unreferenced template avatars/logos | 19 | 219,044 |
| Unreferenced standalone demo videos | 2 | 2,013,779 |
| Unlinked stylesheet | 1 | 2,288 |
| Unlinked/dynamically unrequested scripts | 10 | 87,618 |
| **Total** | **651** | **102,106,332** |

The script group is 10 files / 87,618 bytes: `horizontal-scroll-gallery.js` was retained after the cross-check found its relative path in `assets/css/main.css`.

## Kept-text cross-check

The original graph was too permissive: it treated CSS references as removable when their selectors were absent from the homepage DOM. The owner identified five image files named in `assets/css/main.css`; the graph had not kept them because it filtered by homepage selector applicability. The method was corrected to search each proposed file's basename and `template-source/`-relative path in every kept `.html`, `.css`, `.js`, and `.json` file, independent of selector use.

The final cross-check output:

```text
candidate files after owner exemptions: 677
kept text files scanned (.html/.css/.js/.json): 30
candidate files found by basename and/or relative path in kept text: 26
remaining deletion candidates: 651
kept text files scanned (.html/.css/.js/.json): 31
remaining basename/relative-path matches: 0
```

The 26 matches moved to KEEP:

- `assets/imgs/pages/home-11/bg.webp` — `assets/css/main.css`
- `assets/imgs/pages/home-11/img-1.webp`, `img-2.webp`, `img-3.webp` — `index-7-dark.html`
- `assets/imgs/pages/home-9/arrow.svg`, `btn-arrow.svg`, `logo-brand-01.webp`, `logo-brand-02.webp`, `logo-brand-03.webp`, `logo-brand-04.webp`, `logo-brand-06.webp`, `logo-brand-07.webp`, `sec-7-photo.webp` — `index-7-dark.html`
- `assets/imgs/pages/slideshow/img-1.webp`, `img-2.webp`, `img-3.webp` — `index-7-dark.html`
- `assets/imgs/pages/bg.webp` — `assets/css/main.css`
- `assets/imgs/pages/img-1.webp`, `img-2.webp`, `img-3.webp` — `index-7-dark.html`
- `assets/imgs/template/avatar/avatar-1.webp` through `avatar-5.webp` — `index-7-dark.html`
- `assets/js/horizontal-scroll-gallery.js` — relative-path match in `assets/css/main.css`

The five additional owner-protected files were also kept after confirming their literal CSS URL references:

- `assets/imgs/pages/home-13/footer13-bg.webp`
- `assets/imgs/pages/img-81.webp`
- `assets/imgs/pages/img-82.webp`
- `assets/imgs/pages/img-83.webp`
- `assets/imgs/pages/img-84.webp`

Dynamic paths in retained JavaScript were checked: `data-background`, `data-img-award`, existing image `src` values copied by ripple/gallery code, zoom-plugin image data attributes, CSS background URLs parsed by the ripple plugin, and the Bootstrap source-map URL. None named any of the final 651 deletion candidates. The detailed scan and exact proposed deletion paths are in `docs/11-cleanup-dry-run.md`.

## Validation results

| Check | Result |
|---|---|
| Baseline screenshots | Present and unchanged: `tests/visual/snapshots/homepage.spec.js/home-07-dark-desktop-1440x900.png`, `tests/visual/snapshots/homepage.spec.js/home-07-dark-tablet-768x1024.png`, `tests/visual/snapshots/homepage.spec.js/home-07-dark-mobile-390x844.png` |
| Visual regression | **PASS** — all 3 viewport tests passed (35.4s); baseline snapshots were not updated |
| Browser interaction pass | **PASS** — menu and search opened/closed; each of 4 accordion items expanded in sequence; all 5 Swiper slides visited; marquee moved; hero button and portfolio card hover succeeded; ScrollSmoother traversed to max scroll |
| Browser assets/network | **PASS** — 85 CSS/JS/font/image requests; 0 failed, 0 non-200/404; 0 console errors and 0 uncaught page errors |
| `gofmt` | **PASS** — no unformatted Go files |
| `go vet ./...` | **PASS** |
| `go build -o build/portfolio.exe ./cmd/portfolio` | **PASS** |
| `go test ./...` | **BLOCKED** — `TestHealthcheck` cannot bind/connect to `127.0.0.1:8049` because socket access is denied by the environment; Go telemetry token access is also denied |
| Docker Compose runtime | **BLOCKED** — Docker config access to `C:\Users\USER\.docker\config.json` and the Docker engine named pipe are denied; no `compose up`, health, or fresh-database migration run was possible |
| Remaining template checksums | **PASS** — regenerated manifest and verified all 166 remaining files |
| `git diff --check` | **PASS** — no whitespace errors; Git emitted only its LF/CRLF warning for the checksum manifest |

The baseline screenshot paths above are the preserved originals. The visual test command that worked in this Windows workspace was:

```powershell
node .\node_modules\@playwright\test\cli.js test
```

`npm run test:visual` could not resolve the Playwright CLI through its Windows shim because the repository path contains `&`; the direct Node entry point completed the full test suite. The approved `node_modules/` directory was removed after testing; run `npm ci` before repeating the visual/browser checks. Node and Playwright remain development/test tooling only; neither is in the Go application source or Docker image.

Compose configuration statically confirms that PostgreSQL has no host `ports` mapping. Runtime container health, `/healthz`, `/readyz`, and the fresh-database migration remain unverified until Docker access is available. The initial migration is `db/migrations/001_init_schema.up.sql`.

## Checksum and Git details

`docs/phase-01-template-source.sha256` now records the 166 remaining template files; the previous 817-file manifest is superseded. `scripts/verify-template-checksums.ps1` verified all 166 entries. No remaining template file was modified; the only template changes are the 651 approved deletions.

`package.json` and `package-lock.json` are retained. `.gitignore` covers `.env`/`.env.*` (except `.env.example`), `node_modules/`, `test-results/`, `var/media/`, and `/build/`. No `.gitattributes` file was added or changed.

Proposed `.gitattributes` policy for a future approval (not applied):

```gitattributes
template-source/** -text
*.go text eol=lf
Dockerfile text eol=lf
*.sh text eol=lf
deploy/nginx/** text eol=lf
```

This keeps template bytes stable for the checksum manifest while normalizing Go, Dockerfile, shell, and nginx files to LF.

## Remaining blockers

- Review the environment policy to permit the localhost socket needed by `TestHealthcheck` and Docker engine access. No sandbox restrictions were bypassed.
- Re-run `go test ./...`, `docker compose up`, container health checks, endpoint checks, and the fresh-database migration once access is available.
- The visual and browser checks passed; no baseline or retained template file needs restoration.

Cleanup is complete for the approved list. Stop here pending explicit approval before Phase 3.
