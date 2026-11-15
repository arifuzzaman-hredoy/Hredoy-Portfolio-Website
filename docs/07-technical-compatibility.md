# 07 - Technical Compatibility

## Current starting point

The supplied source is a static HTML/CSS/JavaScript demo. It has no application
framework, build tool, package manifest, authentication, server endpoints,
database, migrations, deployment config, or CI pipeline. The selected
homepage's displayed content is hardcoded.

## Approved direction (supersedes earlier proposal)

The owner has selected Go and PostgreSQL. The earlier Laravel discussion in
this report was only a preliminary option and is superseded. The approved
direction is server-rendered Go `html/template` with a chi router, pgx,
sqlc-generated queries and golang-migrate-managed SQL migrations.

### Server-rendered, database-driven portfolio

Keep the public frontend in the original HTML/CSS/JavaScript/assets and render
it with Go templates. Preserve the Home 07 classes, structure and animation
hooks for retained sections; load every public content field from PostgreSQL.
The admin is also server-rendered Go, with its own plain CSS and no public
Bootstrap/theme stylesheet. The public website is `/`; the single-owner
admin is `/super-admin`. The detailed target structure and schema are in
[09-phase-02-implementation-plan.md](./09-phase-02-implementation-plan.md).

## Admin panel and security

The `/super-admin` route does not exist in the source. It must be an
authenticated, server-guarded route, not a path hidden by frontend navigation.
The approved requirements include a single environment/seed-created owner,
Argon2id or bcrypt password hashing, secure server-side sessions, CSRF,
rate limits, validated uploads and secure headers. Keep admin routes and
administrative assets separate from public content.

Database content must be validated and contextually escaped on output. Rich
text, URLs and uploaded media need allowlists and safe storage rules.

## Contact and newsletter forms

Both visible forms use `action="#"`; the contact form's name/email/phone/message
fields and footer's newsletter email currently have only native browser
validation. No server-side validation, CSRF token, anti-abuse control,
delivery service, persistence, consent text or confirmation state is present.
Connect forms only to a backend endpoint with server-side validation,
CSRF protection, rate limiting, spam controls and non-sensitive logging.
Never expose SMTP credentials/API keys in the frontend.

## Dark and light modes

Bootstrap's `data-bs-theme` attribute and the color-modes script provide a
starting hook, but the selected HTML pins dark mode and has no theme switcher.
The theme script gives explicit HTML mode precedence over local storage.
Before promising both themes, verify every Home 07 component and image contrast
in both modes; do not assume Bootstrap's base color mode changes the custom
theme's `.bg-neutral-*` and component rules correctly.

## SEO and accessibility

The head currently has a viewport declaration, a generic Orisa description,
title and favicon. The source does not declare a canonical URL, Open Graph
metadata, structured data or portfolio-specific metadata. Replace template
metadata with owner/site content and add appropriate canonical/social/robots
and structured data based on deployment. Keep server-rendered meaningful
headings and alt text. Some image alt attributes are generic (`orisa`) and
some decorative images are correctly empty-alt; audit descriptions after
content conversion. Keyboard and reduced-motion behavior also need validation.

## Docker, Nginx and GitHub Actions

These are not configured in the template. The approved deployment is Docker
Compose on AWS EC2 with Nginx, the Go app and PostgreSQL. Nginx serves static
assets and proxies same-origin application requests; PostgreSQL remains on a
private network. The rollout uses an HTTPS staging subdomain before the
`oxytumzone.com` cutover, with reviewed 301 redirects and a rollback path.
Production secrets are injected through the deployment environment, not
committed to the repository.

GitHub Actions will later format, test/vet, validate sqlc/migrations, scan
dependencies and build/deploy immutable images through protected staging and
production environments. No workflow exists in the supplied package.

## Risks to preserving the design

- A wholesale SPA rewrite risks changing motion, menu and responsive details.
- Dynamic content lengths can break the carefully art-directed oversized
  typography, staggered grids and image crops. Define editorial limits and
  test actual portfolio text.
- Replacing `.at-*` and `.sec-*-home-7` classes, utility order or DOM
  structure can silently disable selectors/GSAP animations.
- Global `main.css` contains styles for many template demos, making unrelated
  CSS changes risky. Prefer a baseline snapshot and narrowly scoped additions
  in an application layer; do not overwrite vendor CSS casually.
- Template JS assumes expected markup and global libraries; splitting or
  deferring scripts without checking the initialization order can remove
  behavior.
- Third-party license obligations and Font Awesome Pro/GSAP terms must be
  confirmed before deployment/redistribution.

## Remaining owner inputs

The backend, database, rendering model, admin path and deployment direction
are selected. Remaining implementation inputs include verified project
statuses/content, factual biography/education/certifications, CV and imagery,
contact-message retention and notification preferences, staging/AWS details,
old-site URL inventory, section removal approval and whether a later light
theme phase is wanted. See the approval checklist in
[09-phase-02-implementation-plan.md](./09-phase-02-implementation-plan.md).

## Evidence

- Static document and forms:
  `template-source/index-7-dark.html`, lines 1-25, 1,593-1,643 and
  1,800-1,830.
- Theme helper: `template-source/assets/js/vendors/color-modes.js`.
- Template-specific styling: `template-source/assets/css/main.css`.
- No app/build files are present in `template-source/`; package inventory is
  documented in [01-template-structure.md](./01-template-structure.md).
