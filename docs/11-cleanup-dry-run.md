# Cleanup Stage 1 — Dry-Run Inventory

**Status:** Stage 1 dry run complete; the approved Stage 2 deletion list has been applied. Final results and validation are recorded in `docs/12-cleanup-result.md`.

Branch: `chore/cleanup-unused-files` (created from committed Phase 1–2 state).

## A. Project files outside `template-source/`

These were the approved generated targets for Stage 2 and were removed after validation. No source, configuration, CI, database, deployment, documentation, or baseline screenshot/snapshot files were included.

| Exact target | Files | Bytes | Why considered generated |
|---|---:|---:|---|
| `build/portfolio.exe` | 1 | 15,976,448 | Compiled local Go binary; reproducible with `go build`. |
| `node_modules/ (recursive)` | 194 | 19,068,780 | Installed Playwright test dependencies; reproducible with `npm ci` from the lockfile. |
| `test-results/.last-run.json` | 1 | 45 | Playwright-generated last-run state; not a baseline or snapshot. |

**Outside-template proposed total:** 196 files, 35,045,273 bytes (33.42 MiB).

- No root-level `.log`, `.tmp`, `.bak`, `.old`, or `.test` files were found; `build/portfolio.exe` is the only root-project executable.
- SHA-256 comparison found 8 identical-content groups in `node_modules/`; these are already covered by the proposed recursive removal of that generated dependency directory. No duplicate was found among the build output and `test-results/`.
- Identical `node_modules/` groups:
  - `playwright/LICENSE` = `playwright-core/LICENSE` = `@playwright/test/LICENSE`
  - `playwright/NOTICE` = `playwright-core/NOTICE` = `@playwright/test/NOTICE`
  - `playwright/README.md` = `@playwright/test/README.md`
  - `playwright-core/lib/vite/recorder/playwright-logo.svg` = `playwright-core/lib/vite/traceViewer/playwright-logo.svg`
  - `playwright-core/lib/vite/traceViewer/codeMirrorModule.-QdMvsKi.css` = `playwright-core/lib/vite/recorder/assets/codeMirrorModule--QdMvsKi.css` = `playwright-core/lib/vite/dashboard/assets/codeMirrorModule--QdMvsKi.css`
  - `playwright-core/lib/vite/traceViewer/codicon.DCmgc-ay.ttf` = `playwright-core/lib/vite/recorder/assets/codicon-DCmgc-ay.ttf` = `playwright-core/lib/vite/dashboard/assets/codicon-DCmgc-ay.ttf`
  - `@playwright/test/index.d.ts` = `@playwright/test/index.mjs`
  - `@playwright/test/reporter.js` = `@playwright/test/reporter.mjs`
- An empty `internal/services/` directory exists; **KEEP** as part of the future Go project structure.
- `node_modules/` is test tooling only; it is not part of Go application source or the final Docker image.

## B. Homepage reference graph

### Evidence and method

- Inspected `index-7-dark.html`, all directly loaded stylesheets, local CSS `url()` and `@import` references, `@font-face` declarations, source-map comments, and linked JS strings.
- Browser capture at 1440×900, 768×1024, and 390×844 scrolled the full page at each size: 85 unique local responses (1 document, 9 CSS, 20 JS, 53 images, 2 fonts), all HTTP 200; no failed requests or console errors.
- The browser confirms lazy images and JS behavior used at these viewports. Linked JS literal scan found no additional local file path loads.
- The package contains 817 files (120,935,793 bytes) and exactly one HTML page: `index-7-dark.html`.

### Mandatory kept-text cross-check (owner-exempt files excluded first)

Search scope: every kept `.html`, `.css`, `.js`, and `.json` file under `template-source/` (30 files). For each of the 677 proposed files remaining after excluding the owner's five KEEP files, searched its exact basename and its path relative to `template-source/`. A literal match in either form moves the candidate to KEEP, even if the referencing CSS selector is absent from the homepage DOM.

Cross-check output:

```text
candidate files after owner exemptions: 677
kept text files scanned (.html/.css/.js/.json): 30
candidate files found by basename and/or relative path in kept text: 26
```

All 26 hits are now removed from the deletion list:

- KEEP `assets/imgs/pages/home-11/bg.webp` <- `assets/css/main.css` (basename)
- KEEP `assets/imgs/pages/home-11/img-1.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-11/img-2.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-11/img-3.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-9/arrow.svg` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-9/btn-arrow.svg` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-9/logo-brand-01.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-9/logo-brand-02.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-9/logo-brand-03.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-9/logo-brand-04.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-9/logo-brand-06.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-9/logo-brand-07.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/home-9/sec-7-photo.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/slideshow/img-1.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/slideshow/img-2.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/slideshow/img-3.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/bg.webp` <- `assets/css/main.css` (basename)
- KEEP `assets/imgs/pages/img-1.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/img-2.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/pages/img-3.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/template/avatar/avatar-1.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/template/avatar/avatar-2.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/template/avatar/avatar-3.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/template/avatar/avatar-4.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/imgs/template/avatar/avatar-5.webp` <- `index-7-dark.html` (basename)
- KEEP `assets/js/horizontal-scroll-gallery.js` <- `assets/css/main.css` (relative-path)

Because `horizontal-scroll-gallery.js` is now kept, a final pass included it as the 31st kept text file:

```text
remaining deletion candidates: 651
kept text files scanned (.html/.css/.js/.json): 31
remaining basename/relative-path matches: 0
```

Owner-exempt files, independently confirmed by literal path in `assets/css/main.css`:

- KEEP `assets/imgs/pages/home-13/footer13-bg.webp` <- `assets/css/main.css` (CSS `url()`)
- KEEP `assets/imgs/pages/img-81.webp` <- `assets/css/main.css` (CSS `url()`)
- KEEP `assets/imgs/pages/img-82.webp` <- `assets/css/main.css` (CSS `url()`)
- KEEP `assets/imgs/pages/img-83.webp` <- `assets/css/main.css` (CSS `url()`)
- KEEP `assets/imgs/pages/img-84.webp` <- `assets/css/main.css` (CSS `url()`)

Dynamic/concatenated path patterns found in kept JavaScript (these read a path from DOM/CSS at runtime rather than constructing one fixed filename):

- `assets/js/main.js:94`: `[data-background]` becomes a CSS `background-image` via string concatenation; value is supplied by the page's `data-background` attribute.
- `assets/js/main.js:465`: award-card preview assigns `img.src` from `data-img-award`.
- `assets/js/main.js:1995-2006`: ripple-image copies an existing `<img src>` into `background-image` and the ripple plugin's `imageUrl`.
- `assets/js/vendors/jquery.elevatezoom.js:91,110,1192,1210`: zoom plugin fetches image URLs held in `imageSrc`, `data-image`, and `data-zoom-image` values.
- `assets/js/vendors/ripple-2.js:70-72,131`: ripple plugin parses the current CSS `background-image` URL and loads that same value into an `Image`.
- `assets/js/horizontal-scroll-gallery.js:58`: gallery copies each slide image's `currentSrc` (or fallback `src`) into a generated background image. The script is now kept because `assets/css/main.css` names its relative path.
- `assets/js/vendors/bootstrap.min.js`: source map is named by the static `//# sourceMappingURL=bootstrap.min.js.map` comment; this map is retained.

No JS path concatenation naming any of the final proposed-deletion files was found in the kept JS scan. Candidate scripts themselves are not treated as kept text; they are only considered deletable if no other kept text names them.

### Keep: live dependency graph

**CSS (9 page links):**

- `template-source/assets/css/vendors/carouselTicker.css`
- `template-source/assets/css/vendors/bootstrap.min.css`
- `template-source/assets/css/vendors/swiper-bundle.min.css`
- `template-source/assets/css/vendors/nice-select.css`
- `template-source/assets/css/vendors/font-awesome-pro.css`
- `template-source/assets/css/vendors/magnific-popup.css`
- `template-source/assets/css/vendors/odometer.css`
- `template-source/assets/css/vendors/spacing.css`
- `template-source/assets/css/main.css`

**JavaScript (20 page links, including Bootstrap and color-mode support):**

- `template-source/assets/js/vendors/color-modes.js`
- `template-source/assets/js/vendors/jquery-3.7.1.min.js`
- `template-source/assets/js/vendors/plugin.js`
- `template-source/assets/js/vendors/bootstrap.min.js`
- `template-source/assets/js/vendors/swiper-bundle.min.js`
- `template-source/assets/js/vendors/jquery.carouselTicker.min.js`
- `template-source/assets/js/vendors/jquery.magnific-popup.min.js`
- `template-source/assets/js/vendors/jquery.odometer.min.js`
- `template-source/assets/js/vendors/jquery.appear.js`
- `template-source/assets/js/vendors/jquery.elevatezoom.js`
- `template-source/assets/js/vendors/nice-select.js`
- `template-source/assets/js/vendors/parallax.js`
- `template-source/assets/js/vendors/ripple-2.js`
- `template-source/assets/js/vendors/imagesloaded-pkgd.js`
- `template-source/assets/js/vendors/isotope.pkgd.min.js`
- `template-source/assets/js/vendors/image-hover-effects.js`
- `template-source/assets/js/at-cursor.js`
- `template-source/assets/js/main.js`
- `template-source/assets/js/matter.js`
- `template-source/assets/js/throwable.js`

**Images requested by the browser (53):**

- `template-source/assets/imgs/template/logo/favicon.svg`
- `template-source/assets/imgs/template/logo/favicon-dark.svg`
- `template-source/assets/imgs/template/avatar/avatar-10.webp`
- `template-source/assets/imgs/template/avatar/avatar-11.webp`
- `template-source/assets/imgs/template/avatar/avatar-12.webp`
- `template-source/assets/imgs/template/avatar/avatar-13.webp`
- `template-source/assets/imgs/template/avatar/avatar-14.webp`
- `template-source/assets/imgs/pages/home-7/star-asterisk.svg`
- `template-source/assets/imgs/pages/home-7/hero-vr.webp`
- `template-source/assets/imgs/pages/home-7/avatar-1.webp`
- `template-source/assets/imgs/pages/home-7/avatar-2.webp`
- `template-source/assets/imgs/pages/home-7/avatar-3.webp`
- `template-source/assets/imgs/pages/home-7/avatar-4.webp`
- `template-source/assets/imgs/pages/home-7/avatar-5.webp`
- `template-source/assets/imgs/pages/home-7/sec2-img-1.webp`
- `template-source/assets/imgs/pages/home-7/sec2-img-2.webp`
- `template-source/assets/imgs/pages/home-7/sec2-img-3.webp`
- `template-source/assets/imgs/pages/img-48.webp`
- `template-source/assets/imgs/pages/img-45.webp`
- `template-source/assets/imgs/pages/img-46.webp`
- `template-source/assets/imgs/pages/img-47.webp`
- `template-source/assets/imgs/pages/img-49.webp`
- `template-source/assets/imgs/pages/home-7/sec-4-pin-icon.svg`
- `template-source/assets/imgs/template/logo/logo-brand-01.webp`
- `template-source/assets/imgs/template/logo/logo-brand-02.webp`
- `template-source/assets/imgs/template/logo/logo-brand-03.webp`
- `template-source/assets/imgs/template/logo/logo-brand-04.webp`
- `template-source/assets/imgs/template/logo/logo-brand-05.webp`
- `template-source/assets/imgs/template/logo/logo-brand-06.webp`
- `template-source/assets/imgs/template/logo/logo-brand-07.webp`
- `template-source/assets/imgs/template/logo/logo-brand-08.webp`
- `template-source/assets/imgs/template/logo/logo-brand-09.webp`
- `template-source/assets/imgs/template/logo/logo-brand-10.webp`
- `template-source/assets/imgs/pages/home-7/step-1.webp`
- `template-source/assets/imgs/pages/home-7/step-2.webp`
- `template-source/assets/imgs/pages/home-7/step-3.webp`
- `template-source/assets/imgs/pages/home-7/step-4.webp`
- `template-source/assets/imgs/pages/home-7/sec-7-eyebrow-arrow.svg`
- `template-source/assets/imgs/pages/home-7/sec-7-plus.svg`
- `template-source/assets/imgs/pages/home-7/sec-7-btn-arrow.svg`
- `template-source/assets/imgs/pages/home-7/sec-7-rotating.svg`
- `template-source/assets/imgs/pages/home-7/team-1-darrell.webp`
- `template-source/assets/imgs/pages/home-7/team-2-amelia.webp`
- `template-source/assets/imgs/pages/home-7/team-3-esther.webp`
- `template-source/assets/imgs/pages/home-7/team-4-jacob.webp`
- `template-source/assets/imgs/pages/home-7/marquee-star.svg`
- `template-source/assets/imgs/pages/home-7/insight-1-retro.webp`
- `template-source/assets/imgs/pages/home-7/insight-2-office.webp`
- `template-source/assets/imgs/pages/home-7/insight-3-fabric.webp`
- `template-source/assets/imgs/pages/home-7/insight-4-conference.webp`
- `template-source/assets/imgs/pages/home-7/sec-4-helmet.webp`
- `template-source/assets/imgs/pages/home-7/sec-5-founder.webp`
- `template-source/assets/imgs/pages/home-7/sec-7-photo.webp`

**Fonts requested by the browser:**

- `template-source/assets/fonts/fa-light-300.woff2`
- `template-source/assets/fonts/fa-regular-400.woff2`

Active CSS imports Google Fonts DM Sans from `https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&display=swap`. Font Awesome CSS references existing brands/light/regular/solid `.woff2` and `.ttf` pairs; keep all eight as declared families/fallbacks. It also references missing `fa-duotone-900`, `fa-thin-100`, and `fa-v4compatibility` files; they are absent already and cannot be deletion candidates.

Keep source maps referenced by active code: `assets/css/main.css.map`, `assets/css/vendors/bootstrap.min.css.map`, and `assets/js/vendors/bootstrap.min.js.map`. Keep every `assets/imgs/icons/` file: `cross-out.webp` is referenced by a shared hover cursor rule whose applicability is uncertain.

**Method correction:** The first graph treated CSS references as deletable when the associated demo selector was absent from the homepage DOM. That was too permissive: it did not treat every literal reference from a kept text file as a KEEP rule. The owner identified `assets/imgs/pages/home-13/footer13-bg.webp` and `assets/imgs/pages/img-81.webp` through `img-84.webp`, which are literally named in kept `assets/css/main.css`. These five files are removed from the deletion list and marked KEEP. The final cross-check below enforces basename-or-relative-path matches in every kept HTML/CSS/JS/JSON file, regardless of selector activity.

The selected HTML contains 73 distinct local `.html` href targets that do not exist (including `index.html`, `about-1.html`, and `portfolio-1.html`). Only `index-7-dark.html` exists. These are dangling links, not existing files to delete; link changes are outside this deletion-only proposal.

### Proposed deletion groups

| Group | Files | Bytes | Evidence for non-use by this homepage |
|---|---:|---:|---|
| Other home demo image directories (home-6, home-8..home-15) | 327 | 16,564,819 | Located in other numbered demo folders; no DOM, active stylesheet selector, linked-JS runtime request, or 3-viewport browser network request references these folders. The selected `home-7/` folder is retained. |
| Other demo image directory: cursor-trail | 8 | 65,536 | Dedicated cursor-trail directory; `cursor-trail.js` is not linked or dynamically loaded. The selected page’s `at-cursor.js` remains. |
| Portfolio demo image directories | 25 | 5,017,360 | Five portfolio-mode-specific folders; no HTML page or loaded JS/CSS uses these images on the selected homepage. |
| Other demo image directory: product | 27 | 8,227,046 | Product-shop assets; no product HTML page exists, and no selected-page ref/request. |
| Other demo image directory: slideshow | 2 | 283,176 | Slideshow demo assets; all matching slideshow scripts are unlinked and no homepage requests them. |
| Shared pages-root images absent from index-7-dark | 230 | 69,625,666 | Not referenced by selected-page HTML or requested after full-page scrolling at all three viewports. CSS-only references are from `.footer-13__body` / `.card__process-pill--*` rules absent from the current DOM. |
| Template avatar/logo files not referenced by index-7-dark | 19 | 219,044 | Active refs are avatar-10..14, both favicon files, and logo-brand-01..10. Only other avatar/logo files are listed. |
| Standalone demo video assets with no page/runtime reference | 2 | 2,013,779 | No selected-page HTML/CSS/JS URL ref and no browser request. |
| Stylesheet not linked by index-7-dark | 1 | 2,288 | Not among the 9 stylesheet links and not imported by the active stylesheet graph. |
| Scripts not linked or dynamically requested by index-7-dark | 10 | 87,618 | Not among the page’s 20 script tags; none appeared as a dynamic request in the three-viewport browser capture. `horizontal-scroll-gallery.js` is kept because the final text cross-check found its path in `assets/css/main.css`. |


## C. Exact approved deletion list

The following exact paths under `template-source/` were approved and deleted in Stage 2. Paths below are relative to `template-source/`.

### Other home demo image directories (home-6, home-8..home-15) — 327 files, 16,564,819 bytes

- `assets/imgs/pages/home-10/footer-10-bg-lines.webp`
- `assets/imgs/pages/home-10/footer-10-deco-1.webp`
- `assets/imgs/pages/home-10/footer-10-deco-2.webp`
- `assets/imgs/pages/home-10/hero-10-sec1-video-backup.webp`
- `assets/imgs/pages/home-10/hero-10.webm`
- `assets/imgs/pages/home-10/sec-1-alien.webp`
- `assets/imgs/pages/home-10/sec-1-bg-lines.webp`
- `assets/imgs/pages/home-10/sec-1-shape-25.webp`
- `assets/imgs/pages/home-10/sec-2-scene.webp`
- `assets/imgs/pages/home-10/sec-3-project-1.webp`
- `assets/imgs/pages/home-10/sec-3-project-2.webp`
- `assets/imgs/pages/home-10/sec-3-project-3.webp`
- `assets/imgs/pages/home-10/sec-3-project-4.webp`
- `assets/imgs/pages/home-10/sec-3-project-5.webp`
- `assets/imgs/pages/home-10/sec-4-img-1.webp`
- `assets/imgs/pages/home-10/sec-4-img-2.webp`
- `assets/imgs/pages/home-10/sec-4-img-3.webp`
- `assets/imgs/pages/home-10/sec-4-img-4.webp`
- `assets/imgs/pages/home-10/sec-4-img-5.webp`
- `assets/imgs/pages/home-10/sec-4-service-1.webp`
- `assets/imgs/pages/home-10/sec-4-service-2.webp`
- `assets/imgs/pages/home-10/sec-4-service-3.webp`
- `assets/imgs/pages/home-10/sec-4-service-4.webp`
- `assets/imgs/pages/home-10/sec-4-svc-1.webp`
- `assets/imgs/pages/home-10/sec-4-svc-2.webp`
- `assets/imgs/pages/home-10/sec-4-svc-3.webp`
- `assets/imgs/pages/home-10/sec-4-svc-4.webp`
- `assets/imgs/pages/home-10/sec-5-wireframe-head.webp`
- `assets/imgs/pages/home-10/sec-6-member-1.webp`
- `assets/imgs/pages/home-10/sec-6-member-2.webp`
- `assets/imgs/pages/home-10/sec-6-member-3.webp`
- `assets/imgs/pages/home-10/sec-6-member-4.webp`
- `assets/imgs/pages/home-11/hero-11.webm`
- `assets/imgs/pages/home-11/img-10.webp`
- `assets/imgs/pages/home-11/img-11.webp`
- `assets/imgs/pages/home-11/img-12.webp`
- `assets/imgs/pages/home-11/img-13.webp`
- `assets/imgs/pages/home-11/img-14.webp`
- `assets/imgs/pages/home-11/img-4.webp`
- `assets/imgs/pages/home-11/img-5.webp`
- `assets/imgs/pages/home-11/img-6.webp`
- `assets/imgs/pages/home-11/img-7.webp`
- `assets/imgs/pages/home-11/img-8.webp`
- `assets/imgs/pages/home-11/img-9.webp`
- `assets/imgs/pages/home-11/member-1.webp`
- `assets/imgs/pages/home-11/member-2.webp`
- `assets/imgs/pages/home-11/member-3.webp`
- `assets/imgs/pages/home-11/member-4.webp`
- `assets/imgs/pages/home-12/sec-1-avatar-1.webp`
- `assets/imgs/pages/home-12/sec-1-avatar-2.webp`
- `assets/imgs/pages/home-12/sec-1-avatar-3.webp`
- `assets/imgs/pages/home-12/sec-1-avatar-4.webp`
- `assets/imgs/pages/home-12/sec-1-tile-1.webp`
- `assets/imgs/pages/home-12/sec-1-tile-2.webp`
- `assets/imgs/pages/home-12/sec-1-tile-3.webp`
- `assets/imgs/pages/home-12/sec-1-tile-4.webp`
- `assets/imgs/pages/home-12/sec-1-tile-5.webp`
- `assets/imgs/pages/home-12/sec-1-tile-6.webp`
- `assets/imgs/pages/home-12/sec-2-project-1.webp`
- `assets/imgs/pages/home-12/sec-2-project-2.webp`
- `assets/imgs/pages/home-12/sec-2-project-3.webp`
- `assets/imgs/pages/home-12/sec-2-project-4.webp`
- `assets/imgs/pages/home-12/sec-4-process-1.webp`
- `assets/imgs/pages/home-12/sec-4-process-2.webp`
- `assets/imgs/pages/home-12/sec-4-process-3.webp`
- `assets/imgs/pages/home-12/sec-6-brand-1.svg`
- `assets/imgs/pages/home-12/sec-6-brand-2.svg`
- `assets/imgs/pages/home-12/sec-6-brand-3.svg`
- `assets/imgs/pages/home-12/sec-6-brand-4.svg`
- `assets/imgs/pages/home-12/sec-6-brand-5.svg`
- `assets/imgs/pages/home-12/sec-6-brand-6.svg`
- `assets/imgs/pages/home-12/sec-6-brand-7.svg`
- `assets/imgs/pages/home-12/sec-7-avatar-1.webp`
- `assets/imgs/pages/home-12/sec-7-avatar-2.webp`
- `assets/imgs/pages/home-12/sec-7-avatar-3.webp`
- `assets/imgs/pages/home-12/sec-7-avatar-4.webp`
- `assets/imgs/pages/home-12/sec-7-avatar-5.webp`
- `assets/imgs/pages/home-12/sec-7-avatar-6.webp`
- `assets/imgs/pages/home-13/home-13_sec_9_1.webp`
- `assets/imgs/pages/home-13/home-13_sec_9_2.webp`
- `assets/imgs/pages/home-13/home-13_sec_9_3.webp`
- `assets/imgs/pages/home-13/home-13_sec_9_4.webp`
- `assets/imgs/pages/home-13/home-13_sec_9_5.webp`
- `assets/imgs/pages/home-13/home-13_sec_9_6.webp`
- `assets/imgs/pages/home-13/home-13_sec_9_7.webp`
- `assets/imgs/pages/home-13/home-13_sec_9_8.webp`
- `assets/imgs/pages/home-13/home-13_sec_9_9.webp`
- `assets/imgs/pages/home-13/sec-1-hero-1.webp`
- `assets/imgs/pages/home-13/sec-1-hero-2.webp`
- `assets/imgs/pages/home-13/sec-1-hero-3.webp`
- `assets/imgs/pages/home-13/sec-1-hero-4.webp`
- `assets/imgs/pages/home-13/sec-1-hero-5.webp`
- `assets/imgs/pages/home-13/sec-1-hero.webp`
- `assets/imgs/pages/home-13/sec-1-icon-1.webp`
- `assets/imgs/pages/home-13/sec-1-icon-2.webp`
- `assets/imgs/pages/home-13/sec-1-icon-3.webp`
- `assets/imgs/pages/home-13/sec-1-icon-4.webp`
- `assets/imgs/pages/home-13/sec-1-icon-5.webp`
- `assets/imgs/pages/home-13/sec-2-avatar-1.webp`
- `assets/imgs/pages/home-13/sec-2-avatar-2.webp`
- `assets/imgs/pages/home-13/sec-2-avatar-3.webp`
- `assets/imgs/pages/home-13/sec-2-avatar-4.webp`
- `assets/imgs/pages/home-13/sec-2-avatar-5.webp`
- `assets/imgs/pages/home-13/sec-2-img-1.webp`
- `assets/imgs/pages/home-13/sec-2-img-2.webp`
- `assets/imgs/pages/home-13/sec-2-shape-1.webp`
- `assets/imgs/pages/home-13/sec-2-shape-2.webp`
- `assets/imgs/pages/home-13/sec-2-shape-3.webp`
- `assets/imgs/pages/home-13/sec-2-shape-4.webp`
- `assets/imgs/pages/home-13/sec-3-img-1.webp`
- `assets/imgs/pages/home-13/sec-3-img-2.webp`
- `assets/imgs/pages/home-13/sec-3-img-3.webp`
- `assets/imgs/pages/home-13/sec-3-img-4.webp`
- `assets/imgs/pages/home-13/sec-5-img-1.webp`
- `assets/imgs/pages/home-13/sec-5-img-2.webp`
- `assets/imgs/pages/home-13/sec-5-img-3.webp`
- `assets/imgs/pages/home-13/sec-5-img-4.webp`
- `assets/imgs/pages/home-13/sec-5-img-5.webp`
- `assets/imgs/pages/home-13/sec-7-client-1.webp`
- `assets/imgs/pages/home-13/sec-7-client-2.webp`
- `assets/imgs/pages/home-13/sec-7-client-3.webp`
- `assets/imgs/pages/home-13/sec-8-building-1.webp`
- `assets/imgs/pages/home-13/sec-8-building-2.webp`
- `assets/imgs/pages/home-13/sec-8-building-3.webp`
- `assets/imgs/pages/home-13/sec-8-building-4.webp`
- `assets/imgs/pages/home-13/sec-8-building-5.webp`
- `assets/imgs/pages/home-14/sec-1-hero.webp`
- `assets/imgs/pages/home-14/sec-2-portrait.webp`
- `assets/imgs/pages/home-14/sec-3-card-1.webp`
- `assets/imgs/pages/home-14/sec-3-card-2.webp`
- `assets/imgs/pages/home-14/sec-3-card-3.webp`
- `assets/imgs/pages/home-14/sec-3-card-4.webp`
- `assets/imgs/pages/home-14/sec-3-featured.webp`
- `assets/imgs/pages/home-14/sec-4-tile-01.webp`
- `assets/imgs/pages/home-14/sec-4-tile-02.webp`
- `assets/imgs/pages/home-14/sec-4-tile-03.webp`
- `assets/imgs/pages/home-14/sec-4-tile-04.webp`
- `assets/imgs/pages/home-14/sec-4-tile-05.webp`
- `assets/imgs/pages/home-14/sec-4-tile-06.webp`
- `assets/imgs/pages/home-14/sec-4-tile-07.webp`
- `assets/imgs/pages/home-14/sec-4-tile-08.webp`
- `assets/imgs/pages/home-14/sec-4-tile-09.webp`
- `assets/imgs/pages/home-14/sec-4-tile-10.webp`
- `assets/imgs/pages/home-14/sec-4-tile-11.webp`
- `assets/imgs/pages/home-14/sec-4-tile-12.webp`
- `assets/imgs/pages/home-14/sec-5-icon-1.webp`
- `assets/imgs/pages/home-14/sec-5-icon-2.webp`
- `assets/imgs/pages/home-14/sec-5-icon-3.webp`
- `assets/imgs/pages/home-14/sec-5-icon-4.webp`
- `assets/imgs/pages/home-14/sec-5-icon-5.webp`
- `assets/imgs/pages/home-14/sec-7-portrait-1.webp`
- `assets/imgs/pages/home-14/sec-7-portrait-2.webp`
- `assets/imgs/pages/home-14/sec-7-portrait-3.webp`
- `assets/imgs/pages/home-14/sec-7-portrait.webp`
- `assets/imgs/pages/home-14/sec-9-feed-1.webp`
- `assets/imgs/pages/home-14/sec-9-feed-2.webp`
- `assets/imgs/pages/home-14/sec-9-feed-3.webp`
- `assets/imgs/pages/home-14/sec-9-feed-4.webp`
- `assets/imgs/pages/home-14/sec-9-feed-5.webp`
- `assets/imgs/pages/home-14/sec-9-feed-6.webp`
- `assets/imgs/pages/home-14/sec-9-feed-7.webp`
- `assets/imgs/pages/home-14/sec-9-feed-8.webp`
- `assets/imgs/pages/home-14/sec-9-feed-9.webp`
- `assets/imgs/pages/home-15/footer-bg.webp`
- `assets/imgs/pages/home-15/sec-1-avatar-1.webp`
- `assets/imgs/pages/home-15/sec-1-avatar-2.webp`
- `assets/imgs/pages/home-15/sec-1-avatar-3.webp`
- `assets/imgs/pages/home-15/sec-1-avatar-4.webp`
- `assets/imgs/pages/home-15/sec-1-avatar-5.webp`
- `assets/imgs/pages/home-15/sec-1-hero.webp`
- `assets/imgs/pages/home-15/sec-1-lines.svg`
- `assets/imgs/pages/home-15/sec-2-img-1.webp`
- `assets/imgs/pages/home-15/sec-2-img-2.webp`
- `assets/imgs/pages/home-15/sec-2-shape-25.svg`
- `assets/imgs/pages/home-15/sec-4-project-1.webp`
- `assets/imgs/pages/home-15/sec-4-project-2.webp`
- `assets/imgs/pages/home-15/sec-4-project-3.webp`
- `assets/imgs/pages/home-15/sec-4-project-4.webp`
- `assets/imgs/pages/home-15/sec-5-phase-1.webp`
- `assets/imgs/pages/home-15/sec-5-phase-2.webp`
- `assets/imgs/pages/home-15/sec-5-phase-3.webp`
- `assets/imgs/pages/home-15/sec-5-phase-4.webp`
- `assets/imgs/pages/home-15/sec-5-phase-5.webp`
- `assets/imgs/pages/home-15/sec-6-member-1.png`
- `assets/imgs/pages/home-15/sec-6-member-2.png`
- `assets/imgs/pages/home-15/sec-6-member-3.png`
- `assets/imgs/pages/home-15/sec-6-member-4.png`
- `assets/imgs/pages/home-15/sec-7-img.webp`
- `assets/imgs/pages/home-15/sec-8-avatar-1.webp`
- `assets/imgs/pages/home-15/sec-8-avatar-2.webp`
- `assets/imgs/pages/home-15/sec-8-avatar-3.webp`
- `assets/imgs/pages/home-15/sec-8-avatar-4.webp`
- `assets/imgs/pages/home-15/sec-8-avatar-5.webp`
- `assets/imgs/pages/home-15/sec-9-blog-1.webp`
- `assets/imgs/pages/home-15/sec-9-blog-2.webp`
- `assets/imgs/pages/home-15/sec-9-blog-3.webp`
- `assets/imgs/pages/home-15/sec-9-blog-4.webp`
- `assets/imgs/pages/home-6/image-1.webp`
- `assets/imgs/pages/home-6/image-10.webp`
- `assets/imgs/pages/home-6/image-11.webp`
- `assets/imgs/pages/home-6/image-12.webp`
- `assets/imgs/pages/home-6/image-13.webp`
- `assets/imgs/pages/home-6/image-14.webp`
- `assets/imgs/pages/home-6/image-15.webp`
- `assets/imgs/pages/home-6/image-16.webp`
- `assets/imgs/pages/home-6/image-17.webp`
- `assets/imgs/pages/home-6/image-18.webp`
- `assets/imgs/pages/home-6/image-19.webp`
- `assets/imgs/pages/home-6/image-2.webp`
- `assets/imgs/pages/home-6/image-20.webp`
- `assets/imgs/pages/home-6/image-21.webp`
- `assets/imgs/pages/home-6/image-22.webp`
- `assets/imgs/pages/home-6/image-23.webp`
- `assets/imgs/pages/home-6/image-24.webp`
- `assets/imgs/pages/home-6/image-25.webp`
- `assets/imgs/pages/home-6/image-26.webp`
- `assets/imgs/pages/home-6/image-3.webp`
- `assets/imgs/pages/home-6/image-4.webp`
- `assets/imgs/pages/home-6/image-5.webp`
- `assets/imgs/pages/home-6/image-6.webp`
- `assets/imgs/pages/home-6/image-7.webp`
- `assets/imgs/pages/home-6/image-8.webp`
- `assets/imgs/pages/home-6/image-9.webp`
- `assets/imgs/pages/home-8/footer-8-bg.webp`
- `assets/imgs/pages/home-8/footer-8-fb.svg`
- `assets/imgs/pages/home-8/footer-8-ig.svg`
- `assets/imgs/pages/home-8/footer-8-in.svg`
- `assets/imgs/pages/home-8/footer-8-nav-arrow.svg`
- `assets/imgs/pages/home-8/footer-8-social-arrow-2.svg`
- `assets/imgs/pages/home-8/footer-8-social-arrow.svg`
- `assets/imgs/pages/home-8/footer-8-submit-arrow.svg`
- `assets/imgs/pages/home-8/footer-8-x.svg`
- `assets/imgs/pages/home-8/footer-8-yt.svg`
- `assets/imgs/pages/home-8/hero8-badge.svg`
- `assets/imgs/pages/home-8/hero8-img-1.webp`
- `assets/imgs/pages/home-8/hero8-img-2.webp`
- `assets/imgs/pages/home-8/hero8-img-3.webp`
- `assets/imgs/pages/home-8/hero8-img-4.webp`
- `assets/imgs/pages/home-8/hero8-img-5.webp`
- `assets/imgs/pages/home-8/hero8-img-6.webp`
- `assets/imgs/pages/home-8/hero8-img-8.gif`
- `assets/imgs/pages/home-8/hero8-sec3-img-1.webp`
- `assets/imgs/pages/home-8/hero8-sec3-img-2.webp`
- `assets/imgs/pages/home-8/hero8-sec4-hover-1.webp`
- `assets/imgs/pages/home-8/hero8-sec4-hover-2.webp`
- `assets/imgs/pages/home-8/hero8-sec4-hover-3.webp`
- `assets/imgs/pages/home-8/hero8-sec4-hover-4.webp`
- `assets/imgs/pages/home-8/sec-10-1.webp`
- `assets/imgs/pages/home-8/sec-10-2.webp`
- `assets/imgs/pages/home-8/sec-10-3.webp`
- `assets/imgs/pages/home-8/sec6-icon-arrow-up-right.svg`
- `assets/imgs/pages/home-8/sec6-icon-plus.svg`
- `assets/imgs/pages/home-8/sec6-work-1.webp`
- `assets/imgs/pages/home-8/sec6-work-2.webp`
- `assets/imgs/pages/home-8/sec6-work-3.webp`
- `assets/imgs/pages/home-8/sec6-work-4.webp`
- `assets/imgs/pages/home-8/sec6-work-5.webp`
- `assets/imgs/pages/home-8/sec6-work-6.webp`
- `assets/imgs/pages/home-8/sec6-work-7.webp`
- `assets/imgs/pages/home-8/sec7-img-1.webp`
- `assets/imgs/pages/home-8/sec7-img-2.webp`
- `assets/imgs/pages/home-8/sec7-img-3.webp`
- `assets/imgs/pages/home-8/sec7-img-4.webp`
- `assets/imgs/pages/home-8/sec7-img-5.webp`
- `assets/imgs/pages/home-8/sec7-img-6.webp`
- `assets/imgs/pages/home-8/sec7-mark-mask.svg`
- `assets/imgs/pages/home-8/sec7-mark.svg`
- `assets/imgs/pages/home-8/sec8-arrow.svg`
- `assets/imgs/pages/home-8/sec8-asterisk.svg`
- `assets/imgs/pages/home-8/sec8-avatar-1.webp`
- `assets/imgs/pages/home-8/sec8-avatar-2.webp`
- `assets/imgs/pages/home-8/sec8-avatar-3.webp`
- `assets/imgs/pages/home-8/sec8-avatar-4.webp`
- `assets/imgs/pages/home-8/sec8-star.svg`
- `assets/imgs/pages/home-8/sec9-arrow.svg`
- `assets/imgs/pages/home-8/sec9-bg-blur.webp`
- `assets/imgs/pages/home-8/sec9-btn-icon.svg`
- `assets/imgs/pages/home-8/sec9-card-figure.webp`
- `assets/imgs/pages/home-8/sec9-card-visors.webp`
- `assets/imgs/pages/home-9/contact-arrow.svg`
- `assets/imgs/pages/home-9/footer-9-line.webp`
- `assets/imgs/pages/home-9/globe.webp`
- `assets/imgs/pages/home-9/logo-2.svg`
- `assets/imgs/pages/home-9/logo-3.svg`
- `assets/imgs/pages/home-9/logo-4.svg`
- `assets/imgs/pages/home-9/sec-1-thumb-1.webp`
- `assets/imgs/pages/home-9/sec-1-thumb-2.webp`
- `assets/imgs/pages/home-9/sec-1-thumb-3.webp`
- `assets/imgs/pages/home-9/sec-2-lines.svg`
- `assets/imgs/pages/home-9/sec-3-eyebrow-arrow.svg`
- `assets/imgs/pages/home-9/sec-3-img-0.webp`
- `assets/imgs/pages/home-9/sec-3-img-1.webp`
- `assets/imgs/pages/home-9/sec-3-img-2.webp`
- `assets/imgs/pages/home-9/sec-3-img-3.webp`
- `assets/imgs/pages/home-9/sec-4-cta-arrow.webp`
- `assets/imgs/pages/home-9/sec-4-img-1.webp`
- `assets/imgs/pages/home-9/sec-4-img-2.webp`
- `assets/imgs/pages/home-9/sec-4-img-3.webp`
- `assets/imgs/pages/home-9/sec-4-img-4.webp`
- `assets/imgs/pages/home-9/sec-4-img-5.webp`
- `assets/imgs/pages/home-9/sec-4-img-6.webp`
- `assets/imgs/pages/home-9/sec-4-view-arrow.webp`
- `assets/imgs/pages/home-9/sec-5-btn-arrow.webp`
- `assets/imgs/pages/home-9/sec-5-cta-round-arrow.webp`
- `assets/imgs/pages/home-9/sec-5-img-1.webp`
- `assets/imgs/pages/home-9/sec-6-avatar-1.webp`
- `assets/imgs/pages/home-9/sec-6-avatar-2.webp`
- `assets/imgs/pages/home-9/sec-6-avatar-3.webp`
- `assets/imgs/pages/home-9/sec-6-avatar-4.webp`
- `assets/imgs/pages/home-9/sec-6-avatar-5.webp`
- `assets/imgs/pages/home-9/sec-6-avatar-6.webp`
- `assets/imgs/pages/home-9/sec-6-fly-1.webp`
- `assets/imgs/pages/home-9/sec-6-fly-2.webp`
- `assets/imgs/pages/home-9/sec-6-fly-3.webp`
- `assets/imgs/pages/home-9/sec-6-fly-4.webp`
- `assets/imgs/pages/home-9/sec-6-fly-5.webp`
- `assets/imgs/pages/home-9/sec-6-fly-6.webp`
- `assets/imgs/pages/home-9/sec-6-fly.webp`
- `assets/imgs/pages/home-9/sec-6-shape.webp`
- `assets/imgs/pages/home-9/sec-6-tag-arrow.webp`
- `assets/imgs/pages/home-9/sec-7-deco.webp`
- `assets/imgs/pages/home-9/sec-7-layer.webp`
- `assets/imgs/pages/home-9/sec-7-tag-arrow.webp`
- `assets/imgs/pages/home-9/star.webp`
- `assets/imgs/pages/home-9/testimonial-1.webp`
- `assets/imgs/pages/home-9/testimonial-2.webp`
- `assets/imgs/pages/home-9/testimonial-3.webp`

### Other demo image directory: cursor-trail — 8 files, 65,536 bytes

- `assets/imgs/pages/cursor-trail/cursor trail 1.webp`
- `assets/imgs/pages/cursor-trail/cursor trail 2.webp`
- `assets/imgs/pages/cursor-trail/cursor trail 3.webp`
- `assets/imgs/pages/cursor-trail/cursor trail 4.webp`
- `assets/imgs/pages/cursor-trail/cursor trail 5.webp`
- `assets/imgs/pages/cursor-trail/cursor trail 6.webp`
- `assets/imgs/pages/cursor-trail/cursor trail 7.webp`
- `assets/imgs/pages/cursor-trail/cursor trail 8.webp`

### Portfolio demo image directories — 25 files, 5,017,360 bytes

- `assets/imgs/pages/portfolio-cinema/img_1.jpg`
- `assets/imgs/pages/portfolio-cinema/img_2.jpg`
- `assets/imgs/pages/portfolio-cinema/img_3.jpg`
- `assets/imgs/pages/portfolio-cinema/img_4.jpg`
- `assets/imgs/pages/portfolio-cinema/img_5.jpg`
- `assets/imgs/pages/portfolio-curtain/img_1.jpg`
- `assets/imgs/pages/portfolio-curtain/img_2.jpg`
- `assets/imgs/pages/portfolio-curtain/img_3.jpg`
- `assets/imgs/pages/portfolio-curtain/img_4.jpg`
- `assets/imgs/pages/portfolio-curtain/img_5.jpg`
- `assets/imgs/pages/portfolio-split/img_1.jpg`
- `assets/imgs/pages/portfolio-split/img_2.jpg`
- `assets/imgs/pages/portfolio-split/img_3.jpg`
- `assets/imgs/pages/portfolio-split/img_4.jpg`
- `assets/imgs/pages/portfolio-split/img_5.jpg`
- `assets/imgs/pages/portfolio-stack/img_1.jpg`
- `assets/imgs/pages/portfolio-stack/img_2.jpg`
- `assets/imgs/pages/portfolio-stack/img_3.jpg`
- `assets/imgs/pages/portfolio-stack/img_4.jpg`
- `assets/imgs/pages/portfolio-stack/img_5.jpg`
- `assets/imgs/pages/portfolio-zstack/img_1.jpg`
- `assets/imgs/pages/portfolio-zstack/img_2.jpg`
- `assets/imgs/pages/portfolio-zstack/img_3.jpg`
- `assets/imgs/pages/portfolio-zstack/img_4.jpg`
- `assets/imgs/pages/portfolio-zstack/img_5.jpg`

### Other demo image directory: product — 27 files, 8,227,046 bytes

- `assets/imgs/pages/product/img-shop-1.webp`
- `assets/imgs/pages/product/img-shop-2.webp`
- `assets/imgs/pages/product/img-shop-3.webp`
- `assets/imgs/pages/product/img-shop-4.webp`
- `assets/imgs/pages/product/img-shop-5.webp`
- `assets/imgs/pages/product/img-shop-6.webp`
- `assets/imgs/pages/product/img-shop-7.webp`
- `assets/imgs/pages/product/img-shop-8.webp`
- `assets/imgs/pages/product/img-shop-9.webp`
- `assets/imgs/pages/product/product-1.webp`
- `assets/imgs/pages/product/product-10.webp`
- `assets/imgs/pages/product/product-11.webp`
- `assets/imgs/pages/product/product-12.webp`
- `assets/imgs/pages/product/product-2.webp`
- `assets/imgs/pages/product/product-3.webp`
- `assets/imgs/pages/product/product-4.webp`
- `assets/imgs/pages/product/product-5.webp`
- `assets/imgs/pages/product/product-6.webp`
- `assets/imgs/pages/product/product-7.webp`
- `assets/imgs/pages/product/product-8.webp`
- `assets/imgs/pages/product/product-9.webp`
- `assets/imgs/pages/product/product-details-1.webp`
- `assets/imgs/pages/product/product-details-2.webp`
- `assets/imgs/pages/product/product-details-3.webp`
- `assets/imgs/pages/product/product-details-4.webp`
- `assets/imgs/pages/product/product-details-5.webp`
- `assets/imgs/pages/product/product-details-6.webp`

### Other demo image directory: slideshow — 2 files, 283,176 bytes

- `assets/imgs/pages/slideshow/img-4.webp`
- `assets/imgs/pages/slideshow/img-5.webp`

### Shared pages-root images absent from index-7-dark — 230 files, 69,625,666 bytes

- `assets/imgs/pages/bg-img-2.webp`
- `assets/imgs/pages/bg-img-3.webp`
- `assets/imgs/pages/bg-img-4.webp`
- `assets/imgs/pages/bg-img-5.webp`
- `assets/imgs/pages/bg-img-6.webp`
- `assets/imgs/pages/bg-img-7.webp`
- `assets/imgs/pages/bg-img.webp`
- `assets/imgs/pages/img-10-sm.webp`
- `assets/imgs/pages/img-10.webp`
- `assets/imgs/pages/img-100.webp`
- `assets/imgs/pages/img-101.webp`
- `assets/imgs/pages/img-102.webp`
- `assets/imgs/pages/img-103.webp`
- `assets/imgs/pages/img-104.webp`
- `assets/imgs/pages/img-105.webp`
- `assets/imgs/pages/img-106.webp`
- `assets/imgs/pages/img-107.webp`
- `assets/imgs/pages/img-108.webp`
- `assets/imgs/pages/img-109.webp`
- `assets/imgs/pages/img-11.webp`
- `assets/imgs/pages/img-110.webp`
- `assets/imgs/pages/img-111.webp`
- `assets/imgs/pages/img-112.webp`
- `assets/imgs/pages/img-113.webp`
- `assets/imgs/pages/img-114.webp`
- `assets/imgs/pages/img-115.webp`
- `assets/imgs/pages/img-116.webp`
- `assets/imgs/pages/img-117.webp`
- `assets/imgs/pages/img-118.webp`
- `assets/imgs/pages/img-119.webp`
- `assets/imgs/pages/img-12.webp`
- `assets/imgs/pages/img-120.webp`
- `assets/imgs/pages/img-121.webp`
- `assets/imgs/pages/img-122.webp`
- `assets/imgs/pages/img-123.webp`
- `assets/imgs/pages/img-124.webp`
- `assets/imgs/pages/img-125.webp`
- `assets/imgs/pages/img-126.webp`
- `assets/imgs/pages/img-127.webp`
- `assets/imgs/pages/img-128.webp`
- `assets/imgs/pages/img-129.webp`
- `assets/imgs/pages/img-13.webp`
- `assets/imgs/pages/img-130.webp`
- `assets/imgs/pages/img-131.webp`
- `assets/imgs/pages/img-132.webp`
- `assets/imgs/pages/img-133.webp`
- `assets/imgs/pages/img-134.webp`
- `assets/imgs/pages/img-135.webp`
- `assets/imgs/pages/img-136.webp`
- `assets/imgs/pages/img-137.webp`
- `assets/imgs/pages/img-138.webp`
- `assets/imgs/pages/img-139.webp`
- `assets/imgs/pages/img-14.webp`
- `assets/imgs/pages/img-140.webp`
- `assets/imgs/pages/img-141.webp`
- `assets/imgs/pages/img-142.webp`
- `assets/imgs/pages/img-143.webp`
- `assets/imgs/pages/img-144.webp`
- `assets/imgs/pages/img-145.webp`
- `assets/imgs/pages/img-146.webp`
- `assets/imgs/pages/img-147.webp`
- `assets/imgs/pages/img-148.webp`
- `assets/imgs/pages/img-149.webp`
- `assets/imgs/pages/img-15.webp`
- `assets/imgs/pages/img-150.webp`
- `assets/imgs/pages/img-151.webp`
- `assets/imgs/pages/img-152.webp`
- `assets/imgs/pages/img-153.webp`
- `assets/imgs/pages/img-154.webp`
- `assets/imgs/pages/img-155.webp`
- `assets/imgs/pages/img-156.webp`
- `assets/imgs/pages/img-157.webp`
- `assets/imgs/pages/img-158.webp`
- `assets/imgs/pages/img-159.webp`
- `assets/imgs/pages/img-16.webp`
- `assets/imgs/pages/img-160.webp`
- `assets/imgs/pages/img-161.webp`
- `assets/imgs/pages/img-162.webp`
- `assets/imgs/pages/img-163.webp`
- `assets/imgs/pages/img-164.webp`
- `assets/imgs/pages/img-165.webp`
- `assets/imgs/pages/img-166.webp`
- `assets/imgs/pages/img-167.webp`
- `assets/imgs/pages/img-168.webp`
- `assets/imgs/pages/img-169.webp`
- `assets/imgs/pages/img-17.webp`
- `assets/imgs/pages/img-170.webp`
- `assets/imgs/pages/img-171.webp`
- `assets/imgs/pages/img-172.webp`
- `assets/imgs/pages/img-173.webp`
- `assets/imgs/pages/img-174.webp`
- `assets/imgs/pages/img-175.webp`
- `assets/imgs/pages/img-176.webp`
- `assets/imgs/pages/img-177.webp`
- `assets/imgs/pages/img-178.webp`
- `assets/imgs/pages/img-179.webp`
- `assets/imgs/pages/img-18.webp`
- `assets/imgs/pages/img-180.webp`
- `assets/imgs/pages/img-181.webp`
- `assets/imgs/pages/img-182.webp`
- `assets/imgs/pages/img-183.webp`
- `assets/imgs/pages/img-184.webp`
- `assets/imgs/pages/img-185.webp`
- `assets/imgs/pages/img-186.webp`
- `assets/imgs/pages/img-187.webp`
- `assets/imgs/pages/img-188.webp`
- `assets/imgs/pages/img-189.webp`
- `assets/imgs/pages/img-19.webp`
- `assets/imgs/pages/img-190.webp`
- `assets/imgs/pages/img-191.webp`
- `assets/imgs/pages/img-192.webp`
- `assets/imgs/pages/img-193.webp`
- `assets/imgs/pages/img-194.webp`
- `assets/imgs/pages/img-195.webp`
- `assets/imgs/pages/img-196.webp`
- `assets/imgs/pages/img-197.webp`
- `assets/imgs/pages/img-198.webp`
- `assets/imgs/pages/img-199.webp`
- `assets/imgs/pages/img-1_1.webp`
- `assets/imgs/pages/img-20.webp`
- `assets/imgs/pages/img-200.webp`
- `assets/imgs/pages/img-201.webp`
- `assets/imgs/pages/img-202.webp`
- `assets/imgs/pages/img-203.webp`
- `assets/imgs/pages/img-204.webp`
- `assets/imgs/pages/img-205.webp`
- `assets/imgs/pages/img-206.webp`
- `assets/imgs/pages/img-207.webp`
- `assets/imgs/pages/img-208.webp`
- `assets/imgs/pages/img-209.webp`
- `assets/imgs/pages/img-21.webp`
- `assets/imgs/pages/img-210.webp`
- `assets/imgs/pages/img-211.webp`
- `assets/imgs/pages/img-212.webp`
- `assets/imgs/pages/img-213.webp`
- `assets/imgs/pages/img-214.webp`
- `assets/imgs/pages/img-215.webp`
- `assets/imgs/pages/img-216.webp`
- `assets/imgs/pages/img-22.webp`
- `assets/imgs/pages/img-23.webp`
- `assets/imgs/pages/img-24.webp`
- `assets/imgs/pages/img-25.webp`
- `assets/imgs/pages/img-26.webp`
- `assets/imgs/pages/img-27.webp`
- `assets/imgs/pages/img-28.webp`
- `assets/imgs/pages/img-29.webp`
- `assets/imgs/pages/img-30.webp`
- `assets/imgs/pages/img-31.webp`
- `assets/imgs/pages/img-32.webp`
- `assets/imgs/pages/img-33.webp`
- `assets/imgs/pages/img-34.webp`
- `assets/imgs/pages/img-35.webp`
- `assets/imgs/pages/img-36.webp`
- `assets/imgs/pages/img-37.webp`
- `assets/imgs/pages/img-38.webp`
- `assets/imgs/pages/img-39.webp`
- `assets/imgs/pages/img-4.webp`
- `assets/imgs/pages/img-40-lg.webp`
- `assets/imgs/pages/img-40.webp`
- `assets/imgs/pages/img-41-lg.webp`
- `assets/imgs/pages/img-41.webp`
- `assets/imgs/pages/img-42-lg.webp`
- `assets/imgs/pages/img-42.webp`
- `assets/imgs/pages/img-43-lg.webp`
- `assets/imgs/pages/img-43.webp`
- `assets/imgs/pages/img-44-lg.webp`
- `assets/imgs/pages/img-44.webp`
- `assets/imgs/pages/img-5-sm.webp`
- `assets/imgs/pages/img-5.webp`
- `assets/imgs/pages/img-50.webp`
- `assets/imgs/pages/img-51.webp`
- `assets/imgs/pages/img-52.webp`
- `assets/imgs/pages/img-53.webp`
- `assets/imgs/pages/img-54.webp`
- `assets/imgs/pages/img-55.webp`
- `assets/imgs/pages/img-56.webp`
- `assets/imgs/pages/img-57.webp`
- `assets/imgs/pages/img-58.webp`
- `assets/imgs/pages/img-59.webp`
- `assets/imgs/pages/img-6-sm.webp`
- `assets/imgs/pages/img-6.webp`
- `assets/imgs/pages/img-60.webp`
- `assets/imgs/pages/img-61.webp`
- `assets/imgs/pages/img-62.webp`
- `assets/imgs/pages/img-63.webp`
- `assets/imgs/pages/img-64.webp`
- `assets/imgs/pages/img-65.webp`
- `assets/imgs/pages/img-66.webp`
- `assets/imgs/pages/img-67.webp`
- `assets/imgs/pages/img-68.webp`
- `assets/imgs/pages/img-69.webp`
- `assets/imgs/pages/img-7-sm.webp`
- `assets/imgs/pages/img-7.webp`
- `assets/imgs/pages/img-70.webp`
- `assets/imgs/pages/img-71.webp`
- `assets/imgs/pages/img-72.webp`
- `assets/imgs/pages/img-73.webp`
- `assets/imgs/pages/img-74.webp`
- `assets/imgs/pages/img-75.webp`
- `assets/imgs/pages/img-76.webp`
- `assets/imgs/pages/img-77.webp`
- `assets/imgs/pages/img-78.webp`
- `assets/imgs/pages/img-79.webp`
- `assets/imgs/pages/img-8-sm.webp`
- `assets/imgs/pages/img-8.webp`
- `assets/imgs/pages/img-80.webp`
- `assets/imgs/pages/img-85.webp`
- `assets/imgs/pages/img-86.webp`
- `assets/imgs/pages/img-87.webp`
- `assets/imgs/pages/img-88.webp`
- `assets/imgs/pages/img-89-sm.webp`
- `assets/imgs/pages/img-89.webp`
- `assets/imgs/pages/img-9-sm.webp`
- `assets/imgs/pages/img-9.webp`
- `assets/imgs/pages/img-90-sm.webp`
- `assets/imgs/pages/img-90.webp`
- `assets/imgs/pages/img-91-sm.webp`
- `assets/imgs/pages/img-91.webp`
- `assets/imgs/pages/img-92-sm.webp`
- `assets/imgs/pages/img-92.webp`
- `assets/imgs/pages/img-93-sm.webp`
- `assets/imgs/pages/img-93.webp`
- `assets/imgs/pages/img-94.webp`
- `assets/imgs/pages/img-95.webp`
- `assets/imgs/pages/img-96.webp`
- `assets/imgs/pages/img-97.webp`
- `assets/imgs/pages/img-98.webp`
- `assets/imgs/pages/img-99.webp`
- `assets/imgs/pages/img-gemstone.webp`
- `assets/imgs/pages/noise.gif`

### Template avatar/logo files not referenced by index-7-dark — 19 files, 219,044 bytes

- `assets/imgs/template/avatar/avatar-15.webp`
- `assets/imgs/template/avatar/avatar-16.webp`
- `assets/imgs/template/avatar/avatar-17.webp`
- `assets/imgs/template/avatar/avatar-18.webp`
- `assets/imgs/template/avatar/avatar-19.webp`
- `assets/imgs/template/avatar/avatar-20.webp`
- `assets/imgs/template/avatar/avatar-21.webp`
- `assets/imgs/template/avatar/avatar-6.webp`
- `assets/imgs/template/avatar/avatar-7.webp`
- `assets/imgs/template/avatar/avatar-8.webp`
- `assets/imgs/template/avatar/avatar-9.webp`
- `assets/imgs/template/logo/favicon-md.webp`
- `assets/imgs/template/logo/header-10-mark.webp`
- `assets/imgs/template/logo/logo-d.svg`
- `assets/imgs/template/logo/logo-w-lg.png`
- `assets/imgs/template/logo/logo-w.svg`
- `assets/imgs/template/logo/shape-3.png`
- `assets/imgs/template/logo/studio-2.svg`
- `assets/imgs/template/logo/studio.svg`

### Standalone demo video assets with no page/runtime reference — 2 files, 2,013,779 bytes

- `assets/imgs/video/live-bg.mov`
- `assets/imgs/video/video-1.mp4`

### Stylesheet not linked by index-7-dark — 1 files, 2,288 bytes

- `assets/css/sticky-cards.css`

### Scripts not linked or dynamically requested by index-7-dark — 10 files, 87,618 bytes

- `assets/js/cursor-trail.js`
- `assets/js/slideshow-cinema.js`
- `assets/js/slideshow-curtain.js`
- `assets/js/slideshow-horizontal.js`
- `assets/js/slideshow-split.js`
- `assets/js/slideshow-stack.js`
- `assets/js/slideshow-vista.js`
- `assets/js/slideshow-zstack.js`
- `assets/js/sticky-cards.js`
- `assets/js/vendors/splitting.js`


## Duplicate-content audit

SHA-256 comparison found these identical-content groups. They are informational and add no deletion paths beyond Section C. No paths will be deduplicated/repointed. A path also used by the selected homepage is KEEP.

- `assets/imgs/icons/brand-5.webp` = `assets/imgs/template/logo/logo-brand-04.webp`
- `assets/imgs/pages/home-10/footer-10-bg-lines.webp` = `assets/imgs/pages/home-10/sec-1-bg-lines.webp`
- `assets/imgs/pages/home-10/sec-3-project-1.webp` = `assets/imgs/pages/home-10/sec-4-img-1.webp`
- `assets/imgs/pages/home-10/sec-3-project-4.webp` = `assets/imgs/pages/home-10/sec-4-img-4.webp`
- `assets/imgs/pages/home-10/sec-4-service-1.webp` = `assets/imgs/pages/home-10/sec-4-svc-1.webp`
- `assets/imgs/pages/home-10/sec-4-service-2.webp` = `assets/imgs/pages/home-10/sec-4-svc-2.webp`
- `assets/imgs/pages/home-10/sec-4-service-3.webp` = `assets/imgs/pages/home-10/sec-4-svc-3.webp`
- `assets/imgs/pages/home-10/sec-4-service-4.webp` = `assets/imgs/pages/home-10/sec-4-svc-4.webp`
- `assets/imgs/pages/home-11/img-5.webp` = `assets/imgs/pages/slideshow/img-4.webp`
- `assets/imgs/pages/home-7/arrow-link.svg` = `assets/imgs/pages/home-8/sec6-icon-arrow-up-right.svg` = `assets/imgs/pages/home-9/sec-3-eyebrow-arrow.svg`
- `assets/imgs/pages/home-7/sec-7-btn-arrow.svg` = `assets/imgs/pages/home-9/btn-arrow.svg`
- `assets/imgs/pages/img-186.webp` = `assets/imgs/pages/img-35.webp`
- `assets/imgs/pages/portfolio-cinema/img_1.jpg` = `assets/imgs/pages/portfolio-curtain/img_1.jpg` = `assets/imgs/pages/portfolio-split/img_1.jpg` = `assets/imgs/pages/portfolio-stack/img_1.jpg` = `assets/imgs/pages/portfolio-zstack/img_1.jpg`
- `assets/imgs/pages/portfolio-cinema/img_2.jpg` = `assets/imgs/pages/portfolio-curtain/img_2.jpg` = `assets/imgs/pages/portfolio-split/img_2.jpg` = `assets/imgs/pages/portfolio-stack/img_2.jpg` = `assets/imgs/pages/portfolio-zstack/img_2.jpg`
- `assets/imgs/pages/portfolio-cinema/img_3.jpg` = `assets/imgs/pages/portfolio-curtain/img_3.jpg` = `assets/imgs/pages/portfolio-split/img_3.jpg` = `assets/imgs/pages/portfolio-stack/img_3.jpg` = `assets/imgs/pages/portfolio-zstack/img_3.jpg`
- `assets/imgs/pages/portfolio-cinema/img_4.jpg` = `assets/imgs/pages/portfolio-curtain/img_4.jpg` = `assets/imgs/pages/portfolio-split/img_4.jpg` = `assets/imgs/pages/portfolio-stack/img_4.jpg` = `assets/imgs/pages/portfolio-zstack/img_4.jpg`
- `assets/imgs/pages/portfolio-cinema/img_5.jpg` = `assets/imgs/pages/portfolio-curtain/img_5.jpg` = `assets/imgs/pages/portfolio-split/img_5.jpg` = `assets/imgs/pages/portfolio-stack/img_5.jpg` = `assets/imgs/pages/portfolio-zstack/img_5.jpg`
- `assets/imgs/template/avatar/avatar-3.webp` = `assets/imgs/template/avatar/avatar-9.webp`

## Totals and approval boundary

- Before: **817 files**, 120,935,793 bytes (115.33 MiB).
- Approved and removed: **651 files**, 102,106,332 bytes (97.33 MiB).
- Remaining after cleanup: **166 files**, 18,829,461 bytes (17.96 MiB).
- Identical-content groups: **18**; see audit above.
- No files have been deleted. This dry-run report is the only file added in this stage; no template file has been modified. Stage 2 must wait for explicit approval of the exact paths above.

During Stage 1, this document recorded the dry run without deleting files. After approval, Stage 2 applied the exact list above. The homepage, runtime-loaded assets, Bootstrap/color-mode assets, linked source maps, fonts, icons, baseline screenshots/snapshots, docs, Go source, database, deployment files, and configuration remain. No retained template file was modified; see `docs/12-cleanup-result.md` for final checks.
