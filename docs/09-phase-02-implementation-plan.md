# Phase 02 - Implementation Plan

## Status and governing decisions

This is a planning document only. No application code, database migrations,
deployment configuration, or template changes are included. Phase 03 requires
explicit approval of this plan and resolution of the owner-input items below.

The approved decisions supersede earlier Phase 01 proposals:

- Backend: Go, with chi, pgx, sqlc and golang-migrate as the proposed core.
- Database: PostgreSQL.
- Public rendering: server-rendered Go `html/template`; the public frontend
  remains the original HTML/CSS/JavaScript and assets.
- Admin: server-rendered Go templates, separate plain CSS, no Node build.
- Deployment: Docker Compose on AWS EC2, Nginx, GitHub Actions, custom domain.
- Public home page: `/`; single-owner admin: `/super-admin`.
- Do not modify `template-source/` during planning.
- Only verified owner content may appear publicly. Unpopulated sections and
  unverified candidate projects stay unpublished or are removed.
- Dark appearance is the first design target. Do not expose a light-theme
  control until a light version is implemented and approved.

## 1. Architecture overview and request flow

### Components

```text
Browser
  | HTTPS (oxytumzone.com or staging hostname)
  v
Nginx
  |-- serves public static assets from the copied template asset tree
  |-- serves isolated admin CSS/static files
  |-- applies TLS, compression, caching, request limits and security headers
  `-- proxies same-origin dynamic requests
        v
     Go application (chi)
        |-- public handlers -> content/SEO services -> sqlc queries -> pgx
        |-- admin handlers -> authentication/authorization/CSRF -> services
        |-- contact POST -> validation/anti-abuse -> PostgreSQL
        `-- uploads/CV -> validated persistent media storage
                       |
                       v
                  PostgreSQL
```

### Public GET request

1. Browser requests a page over HTTPS.
2. Nginx serves cacheable static files directly; all page routes are proxied
   to Go on the private Compose network.
3. chi selects a public handler. Middleware adds request IDs, recovery,
   security headers and staging/production indexing policy.
4. The handler gets published content and site settings through a service
   layer. sqlc-generated queries use pgx with PostgreSQL.
5. Go `html/template` renders the page, SEO metadata, JSON-LD and all
   meaningful content into the initial HTML. JavaScript is not required to
   load page text or project data.
6. Go's contextual HTML escaping remains enabled. Database values are data,
   never trusted template source or raw HTML.

### Admin request

1. Nginx applies a coarse login rate limit and proxies `/super-admin/*` to Go.
2. The application validates the session, CSRF token and requested
   authorization before invoking a state-changing handler.
3. Admin forms use server-rendered pages and POST/Redirect/GET. A successful
   mutation is recorded in PostgreSQL and, for sensitive changes, the audit
   log.
4. Admin responses have `noindex` headers and are excluded from public
   sitemap/metadata. Authentication, not robots rules, protects the route.

### Contact request

`POST /contact` is the only planned public write operation. The application
validates required fields, honeypot, length limits and rate limits, then
stores the message. Public content/project routes remain read-only GETs; no
public content API is planned.

## 2. Proposed folder structure

This is a target structure for a later implementation phase, not a set of
files created now:

```text
.
├── cmd/
│   └── portfolio/
│       └── main.go
├── internal/
│   ├── config/
│   ├── http/
│   │   ├── router.go
│   │   ├── middleware/
│   │   ├── public/
│   │   └── admin/
│   ├── auth/
│   ├── content/
│   ├── contact/
│   ├── media/
│   ├── seo/
│   ├── service/
│   └── store/
│       └── db/              # sqlc-generated Go query code
├── db/
│   ├── migrations/          # golang-migrate SQL up/down files
│   └── queries/             # sqlc query source
├── web/
│   ├── templates/
│   │   ├── public/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   └── partials/
│   │   └── admin/
│   │       ├── layouts/
│   │       ├── pages/
│   │       └── partials/
│   └── static/
│       ├── assets/          # copied template assets; original URLs retained
│       ├── admin/
│       │   ├── admin.css
│       │   └── admin.js
│       └── favicon/         # public icon files only, if kept separate
├── var/
│   └── media/               # runtime mount; excluded from source control
├── deploy/
│   ├── Dockerfile
│   ├── compose.yaml
│   └── nginx/
│       ├── nginx.conf
│       └── site.conf
├── .github/
│   └── workflows/
├── go.mod
├── go.sum
└── sqlc.yaml
```

`template-source/` remains the read-only design/reference copy. In a later
approved implementation, only the necessary assets are copied into
`web/static/assets/`; source changes for the delivered site are made in the
application copy. CSS/JS files and their ordering should initially be kept
byte-for-byte, apart from specifically approved, visually neutral fixes
described in Section 12.

Admin CSS is loaded only by the admin layout. Do not load Bootstrap or
`main.css` under `/super-admin`. Public and admin templates can share Go
helpers and data types but must use distinct layouts and stylesheets.

## 3. Database schema proposal

Use PostgreSQL with UUID primary keys for content rows and UTC
`timestamptz` audit fields. Add foreign keys, `NOT NULL` and `CHECK` rules
where stated. The exact migration DDL is deferred until approval.

| Table | Proposed columns and constraints | Relations and indexes |
|---|---|---|
| `site_settings` | Singleton `id smallint` constrained to `1`; `site_name`, `owner_name`, `professional_title`, `email`, optional `contact_phone`, `domain`, `canonical_base_url`, `github_url`, `linkedin_url`, optional `social_links jsonb`, `locale`; `updated_at`. These fields hold the approved Hredoy/site identity and links; templates must read them from this table. Never store account passwords or secrets here. | One row, created by a migration/seed. Check valid locale/URL formats in application validation; canonical host is environment-aware for staging. |
| `home_sections` | `id uuid`, unique `section_key`, `sort_order`, `is_visible`, `eyebrow`, `heading`, `body`, `cta_label`, `cta_url`, `content jsonb`, `updated_at`. JSON stores section-specific structured text/labels, not executable markup. | Index `(is_visible, sort_order)`. Application validates the expected JSON shape for each known `section_key`. |
| `pages` | `id uuid`, unique `page_key`, `slug` (nullable only for home), `title`, `summary`, `content jsonb`, `is_published`, `seo_title`, `meta_description`, `canonical_path`, `og_title`, `og_description`, `og_image_media_id`, `twitter_card`, timestamps. | Unique normalized slug for non-home routes; index `(is_published, page_key)`. Used for About and other content pages. |
| `navigation_items` | `id uuid`, `location` (`header`/`footer`), `label`, `href`, `sort_order`, `is_visible`, `created_at`, `updated_at`. | Index `(location, is_visible, sort_order)`. Validate internal routes and allowlisted external URL schemes. |
| `projects` | `id uuid`, unique lowercase `slug`, `title`, `summary`, `problem`, `solution`, `what_i_learned`, `status` constrained to `completed` or `in_progress`, `is_published`, `sort_order`, optional `started_at`/`completed_at`, `repository_url`, `live_url`, `seo_title`, `meta_description`, `canonical_path`, `og_title`, `og_description`, timestamps. | Index `(is_published, sort_order, updated_at)` and unique slug. The `status` is separate from publication; nothing is public until explicitly published. |
| `project_media` | `id uuid`, `project_id`, server-generated `storage_key`, `alt_text`, `caption`, `sort_order`, `mime_type`, `byte_size`, `created_at`. | FK to `projects` with delete cascade; index `(project_id, sort_order)`. |
| `skills` | `id uuid`, `name`, `category`, factual `description`/evidence, `usage_status` constrained to `studied` or `used`, `is_published`, `sort_order`, timestamps. No invented proficiency score. | Index `(is_published, category, sort_order)`. |
| `project_skills` | `project_id`, `skill_id`. | Composite primary key; FKs cascade. Supports project-specific tools only when recorded as a verified skill. |
| `certifications` | `id uuid`, `name`, `issuer`, `status` constrained to `completed` or `in_progress`, optional issue/expiry dates, credential ID/URL, `is_published`, `sort_order`, timestamps. | Index `(is_published, status, sort_order)`. Completed and ongoing entries remain distinct in UI. |
| `education` | `id uuid`, `institution`, `program_or_credential`, factual `description`, `status`, optional start/end dates, `is_published`, `sort_order`, timestamps. | Index `(is_published, sort_order)`. |
| `media_assets` | `id uuid`, server-generated `storage_key`, `purpose`, `alt_text`, `mime_type`, `byte_size`, checksum, `created_at`. | Unique storage key; index `purpose`. No user-controlled path is used to locate files. |
| `cv_files` | `id uuid`, unique `media_asset_id`, display name, version, `is_current`, `uploaded_at`. | FK to `media_assets`; partial unique index for a single `is_current = true` row. |
| `contact_messages` | `id uuid`, `name`, `email`, optional `phone`, `message`, `is_read`, `received_at`, optional `read_at`, `deleted_at` only if soft-delete is approved. Do not persist the honeypot value. | Index `(is_read, received_at DESC)` and optionally `email`. Define retention policy before production. |
| `admin_users` | `id uuid`, unique normalized `email`, `password_hash`, `is_active`, `created_at`, `last_login_at`, `password_changed_at`. | Single active owner account enforced operationally; no public signup. |
| `admin_sessions` | `id uuid`, `admin_user_id`, unique `session_token_hash`, `csrf_token_hash`, `created_at`, `expires_at`, `last_seen_at`. | FK to admin; index `(admin_user_id, expires_at)` and expiry cleanup index. Store only a hash of the opaque cookie token. |
| `rate_limit_buckets` | `key_hash`, `bucket_start`, `request_count`, `expires_at`. Hash keys derived from normalized client/IP plus action; never store raw client IP for this limiter. | Composite primary key `(key_hash, bucket_start)`; index on `expires_at`. Nginx also applies coarse request limits. |
| `admin_audit_log` | `id uuid`, `admin_user_id`, `action`, `entity_type`, `entity_id`, timestamp, limited metadata. Avoid secrets and message bodies. | FK to admin; index `(created_at DESC)` and `(entity_type, entity_id)`. |

### Site-settings and content guarantees

- `site_settings` holds the provided website name, owner's full name and
  aspirational title, email, domain, GitHub and LinkedIn URLs; these values
  are not copied as constants into public templates.
- Hero/about text and known homepage section content are managed through
  `home_sections` and the relevant `pages` rows.
- Projects, skills, certifications and education have structured tables so
  the admin can add/edit them without editing source files.
- All candidate projects begin as unpublished records or remain unseeded
  until the owner confirms the project exists and supplies factual content
  and status. Candidate names alone do not establish that work is complete.
- The set of columns for SEO is repeated on project records because each
  project has its own slug and independently editable metadata. A later
  refactor to a shared SEO table is possible but not necessary initially.
- Contact message deletion should be a hard delete only after confirmation;
  otherwise use soft-delete plus a documented retention/cleanup policy.

## 4. Routes and endpoints

Use chi route groups with explicit methods, middleware and not-found handling.
The list is proposed and may be refined before implementation.

### Public routes

| Method and path | Behavior |
|---|---|
| `GET /` | Server-rendered homepage; one H1, published sections/content only. |
| `GET /about` | Factual owner bio, education and published certifications as approved. |
| `GET /projects` | Published projects, with status labels and pagination only if needed. |
| `GET /projects/{slug}` | Published project detail; unpublished/unknown slugs return 404. |
| `GET /certifications` | Optional page if the owner approves a standalone page; completed/ongoing sections kept separate. |
| `GET /cv` | Download/inline CV from the current validated `cv_files` entry; do not expose storage paths. |
| `GET /contact` | Optional standalone contact page; otherwise use homepage section and anchor. |
| `POST /contact` | Validate, rate-limit and save a message; redirect with a safe success/error state. The only public write route. |
| `GET /robots.txt` | Production crawler policy and sitemap location; staging policy is `noindex`/blocked. |
| `GET /sitemap.xml` | Generated from canonical, published public pages and projects only. |
| `GET /llms.txt` | Low-cost curated index of truthful public pages; no private/admin content. |
| `GET /healthz` | Minimal liveness response. Do not expose configuration, database details or secrets. |
| `GET /readyz` | Internal/readiness check suitable for Docker/Nginx health checks; keep non-public if it reveals dependency state. |

There is no public JSON content API. Every public page and project is
server-rendered from PostgreSQL; public content GETs do not mutate state.

### Admin routes

All `/super-admin/*` routes except login require an active session, CSRF
validation for mutations, and `X-Robots-Tag: noindex, nofollow`. Responses
must not be cached publicly.

| Methods and path | Screens/actions |
|---|---|
| `GET, POST /super-admin/login` | Login form and rate-limited credential validation. |
| `POST /super-admin/logout` | CSRF-protected session invalidation. |
| `GET /super-admin` | Dashboard with content counts and unread-message count; no sensitive details in public logs. |
| `GET, POST /super-admin/projects/new` | Create draft project. |
| `GET, POST /super-admin/projects/{id}/edit` | Edit factual copy, status, publication, SEO and links. |
| `POST /super-admin/projects/{id}/delete` | CSRF-protected delete/confirmation flow. |
| `POST /super-admin/projects/{id}/screenshots` | Validated, size-limited screenshot upload and metadata. |
| `GET /super-admin/skills`; `GET, POST /super-admin/skills/new`; `GET, POST /super-admin/skills/{id}/edit`; `POST /super-admin/skills/{id}/delete` | List/create/edit/delete skills and mark `studied`/`used`. |
| `GET /super-admin/certifications`; `GET, POST /super-admin/certifications/new`; `GET, POST /super-admin/certifications/{id}/edit`; `POST /super-admin/certifications/{id}/delete` | Manage issuer, dates, status and credential link. |
| `GET /super-admin/education`; `GET, POST /super-admin/education/new`; `GET, POST /super-admin/education/{id}/edit`; `POST /super-admin/education/{id}/delete` | Manage education records and visibility. |
| `GET, POST /super-admin/cv` | Upload, replace, preview metadata and select current CV. |
| `GET /super-admin/messages` | Paginated message inbox/filter. |
| `POST /super-admin/messages/{id}/read` | Mark read/unread. |
| `POST /super-admin/messages/{id}/delete` | CSRF-protected deletion with confirmation. |
| `GET, POST /super-admin/settings` | Edit site settings, home sections, SEO defaults and links. |
| `GET, POST /super-admin/pages/*` | Edit page copy, visibility and page SEO. |
| `GET, POST /super-admin/navigation` | Edit header/footer labels/order/links. |

State changes use POST rather than GET. The admin is one owner account; no
public signup, role system or multi-tenant abstraction is required.

## 5. Homepage section-to-data mapping

The original numbered sections are mapped below. "Remove" means omit the
demo section from the delivered page rather than leave fictional template
content visible. Visibility is controlled by data where useful; it does not
mean a blank placeholder should be rendered.

| Template area | Target content and source | Decision |
|---|---|---|
| Header/search/menu | `site_settings.site_name`; `navigation_items`; GitHub/LinkedIn/contact links from settings. Search overlay is not useful without an actual index. | Preserve header composition, replace Orisa/demo routes with real route links. Remove/hide search until a real search feature is approved. Remove the broken theme control. |
| 1. Hero | Owner name/title, concise factual introduction, CTA to Projects/Contact. Data from `site_settings` and `home_sections.hero`. | Keep styling; use exactly one homepage H1: “Arifuzzaman Hredoy, Junior DevOps Engineer” (editable through admin). Owner-approved image/visual only. |
| 2. Startup/About and metrics | Short factual bio and optional CTA to About/CV; `home_sections.about` / About page data. | Remove all demo metrics, avatars, client counts and unsupported agency claims. Do not replace them with invented numbers. |
| 3. Image carousel | Real screenshots from published `projects` and `project_media`, with project name and link. | Render only when at least one approved, published project has a suitable image; otherwise omit the carousel. |
| 4. Mission/locations | Education entries or concise factual profile detail from `education`/About. | Remove mission copy and fictional US office/phone/address. Keep only the structure if actual education/profile content fits; otherwise hide. |
| 5. Services accordion/partners | Skills from `skills`, grouped by category and factual `usage_status` (`studied`/`used`). | Rename to skills/learning as approved. Remove founder/service claims and all demo partner logos. Do not show a technology unless owner verifies it. |
| 6. Process | A personally accurate DevOps workflow from `home_sections.workflow`; for example stages only after the owner describes what he actually does. | Keep four-card visual only if real sequential steps can be stated truthfully. No invented production history, customer outcomes or scale claims. |
| 7. CTA | Neutral CTA to Contact, GitHub or CV from settings. | Keep layout/visual style; remove agency pitch and fake opportunity bullets. |
| 8. Team | Completed certifications from `certifications`, with completed/ongoing clearly separated, or another verified profile section. | Remove all demo team members/roles. Hide if there is not enough real credential content; never invent peers or awards. |
| 9. Marquee | No required data source. Could use an owner-approved list of verified skills, but that duplicates Section 5. | Default: remove. Do not retain template marketing keywords as implied skills/services. |
| 10. Articles | Published project write-ups from `projects`; detail page follows the project structure below. | Use only authored factual project content; hide the grid until entries are ready. Remove template authors, dates and article imagery. |
| 11. Contact | Real contact fields from settings and a working `POST /contact` form. | Keep the contact design and implement DB persistence, validation, honeypot and rate limits. Whether phone is required remains an owner decision. |
| Footer | Site settings, approved navigation, GitHub/LinkedIn/email, current year. | Replace Orisa address/hours and placeholder social URLs. Remove the newsletter form unless a real mailing-list service and consent process are approved. |

### Candidate project workflow

The seven names supplied for consideration are:

- DevOps Workflow & SDLC Lab
- Production Linux Server Administration
- Network Engineering & Troubleshooting Lab
- Bash & Git DevOps Automation Toolkit
- TaskFlow DevOps Platform
- Nexora Infrastructure Project
- StudioSpace Deployment Project

For each, the owner must confirm that it exists, assign `completed` or
`in_progress`, provide actual problem/solution/tools/learning content, choose
screenshots and links, and explicitly publish it. Do not infer completion or
technical stack from a project name. Draft/unpublished records are excluded
from all public routes, sitemap and JSON-LD.

### Project detail content order

Each `/projects/{slug}` page uses a repeatable structure: title/status,
summary, problem, solution, tools/skills (from verified project associations),
what I learned, screenshot gallery with alt text, GitHub link and optional
live link. Project-specific SEO fields are rendered from the project row.
An FAQ is optional and appears only if factual questions/answers are supplied.

## 6. Go template and partials plan

Use Go's standard `html/template` with parsed templates and named blocks. Do
not use React/TypeScript or a client-side content renderer.

### Public layout and partials

- `public/layouts/base.gohtml`: document shell, language, metadata blocks,
  canonical, OG/Twitter metadata, JSON-LD, and the original CSS/script
  includes in original order.
- `public/partials/header.gohtml`: original Header 7 structure/classes,
  populated with settings and the approved navigation items.
- `public/partials/search.gohtml`: omitted until search has a real behavior.
- `public/partials/footer.gohtml`: original Footer 7 visual structure with
  real settings/social links; no fake contact details/newsletter.
- `public/partials/contact-form.gohtml`: original form styling/classes with
  server `action`, CSRF token, honeypot and feedback region.
- `public/pages/home.gohtml`: the retained Home 07 section sequence and
  section-specific classes.
- `public/pages/about.gohtml`, `projects.gohtml`, `project.gohtml`,
  `certifications.gohtml`: additional server-rendered public pages.
- `admin/layouts/base.gohtml`: separate layout and plain CSS, with no public
  Bootstrap stylesheet.

### Preservation rules

1. Capture the original page and asset tree as the immutable visual baseline.
2. Initially split `index-7-dark.html` at existing header/section/footer
   boundaries; keep all existing wrappers, class names, IDs, data attributes,
   CSS/JS files, animation hooks, asset names and script ordering for retained
   sections.
3. Replace only content text, links, lists and repeated card data with Go
   template values/ranges. Use the same HTML element structure where
   meaningful; do not make dynamic HTML from database strings.
4. Convert unsafe demo links/forms to explicit route URLs and real form
   endpoints. Use root-resolving asset URLs and test them on nested
   `/projects/{slug}` routes. An optional `<base href="/">` must be checked
   against in-page anchors before adoption.
5. Use Go's normal contextual escaping. Do not mark database content as
   `template.HTML`; allow only validated URL schemes for links.
6. Render initial content, project cards, headings and meta tags in HTML.
   JavaScript enhances visual behavior only.
7. Admin uses independent partials and a distinct CSS file. It must not import
   the public theme CSS or Bootstrap styles.
8. The only planned changes to template asset copies are approved URL/font
   fixes and later removal of assets proven unused by the complete route and
   CSS/JS reference graph. `template-source/` remains untouched.

The public markup cannot be literally unchanged in every byte: new metadata,
CSRF fields, routes and semantically corrected heading tags are required.
Acceptance is that the original visual system and behavior of retained
sections remain intact, with changes limited to content/data bindings and
necessary integration/accessibility/security markup.

## 7. Admin panel screens and behavior

The initial admin should be plain, responsive, keyboard-usable and functional
without a JavaScript build:

1. **Login:** one owner account; username/email and password; clear error with
   no account enumeration; rate-limited.
2. **Dashboard:** links to projects, skills, credentials, settings, CV and
   messages; counts only.
3. **Projects list:** title, status, draft/published state, edit, reorder and
   safe delete. Project editor includes factual copy, slug, screenshots,
   alt text, links, status and SEO fields.
4. **Skills:** category, name, factual description/evidence, `studied` or
   `used`, visibility and ordering. No self-rated proficiency required.
5. **Certifications:** issuer, credential link/ID, dates and distinct
   completed/in-progress state.
6. **Education:** institution, program, dates, factual description and order.
7. **CV:** upload/replace/select current file; show type and size; download
   preview through the public CV route.
8. **Messages:** paginated inbox, read/unread state, message detail, delete
   confirmation. Escape message text on display.
9. **Site settings:** all provided identity/contact/social/domain values,
   homepage hero/about/workflow copy, page defaults and contact preferences.
10. **Page/SEO editor:** page visibility, title, summary, meta description,
    canonical/OG values and social image. Project-specific SEO remains in its
    project form.
11. **Navigation and homepage sections:** menu labels/order/visibility and
    known section copy/order/visibility. Do not offer arbitrary layout
    construction or raw HTML editing.

Start with normal server-rendered forms and POST/Redirect/GET. Plain JS may
enhance confirmation or image preview. htmx is optional later, not a
dependency for core CRUD.

## 8. Security plan

### Authentication and sessions

- Create the only admin account from a deployment environment variable set
  or a one-time seed command that prompts/accepts a secret securely. Never
  commit a password or provide a default password.
- Store Argon2id password hashes (preferred) or bcrypt hashes with a
  documented work factor. Use constant-time comparison where applicable.
- No admin registration/reset route is public. Password reset is an
  operational owner-controlled process unless a separate secure flow is
  approved.
- Use a cryptographically random opaque session cookie; store only its hash
  server-side. Set `HttpOnly`, `Secure`, `SameSite=Strict` (or justify Lax
  for navigation), `Path=/`, and an appropriate expiry. Rotate the session
  after successful login and invalidate it on logout/password change.
- Protect every mutation with a synchronizer CSRF token and origin checks.
- Add login throttling at Nginx and the application. Avoid raw IP retention;
  document bucket and message retention.

### Authorization, validation and uploads

- Require authentication and owner authorization on every admin handler,
  not just the admin homepage.
- Validate all inputs on the server: bounds, email, slug format, status
  allowlists, URLs/schemes, dates, enum values, JSON section shape and
  cross-field consistency. Use parameterized sqlc queries only.
- Validate upload size, allowed MIME by content sniffing, extension, image
  decode where relevant, and PDF constraints. Generate random storage names;
  never use the supplied filename as a path. Store outside the executable
  tree or in a dedicated static volume; do not execute uploads. Add safe
  download headers for CV.
- Require meaningful alt text for non-decorative project images. Do not
  expose temporary files or upload metadata beyond the public asset needed.
- Escape contact message content in admin rendering. Do not interpolate
  submitted text into SQL, logs or HTML unsafely.

### Contact anti-abuse and data handling

- Apply server validation and request-body limits, Nginx `limit_req`, and
  application rate limiting. Use a honeypot that is not stored; silently
  accept/discard honeypot submissions without revealing the trap.
- Store only fields required to respond. Define deletion/retention and backup
  handling for contact messages before production.
- The public form has no need to accept arbitrary HTML or attachments.
- Do not log message bodies, credentials, CSRF tokens, cookies or upload
  contents. Use redacted operational logs.

### Browser, Nginx and database controls

- Add HSTS after HTTPS is proven, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, frame protection via CSP `frame-ancestors`, and a
  restrictive Content Security Policy compatible with local template JS.
  Avoid allowing inline script broadly; nonce/hash any inline code only if
  required. Test CSP against the existing animations/plugins before enforcing.
- TLS termination at Nginx; proxy only to the Go app on the private Compose
  network. PostgreSQL is not published to the public host interface.
- Use environment/secret injection, least-privilege app DB role, separate
  migration role or controlled migration step, routine encrypted backups and
  restore testing.
- Pin dependencies and run Go vulnerability/dependency checks in CI.

## 9. SEO, AEO and GEO plan

### Initial HTML and page semantics

- Render all page content on the server. Keep scripts as progressive
  enhancement, not as the only way to discover a page's text or links.
- Homepage title/H1 starts with the factual identity
  **“Arifuzzaman Hredoy, Junior DevOps Engineer”**. One H1 per page; section
  headings follow a logical hierarchy. Where the source uses heading tags
  for appearance (for example article cards styled as `.h6`), adjust the tag
  semantics only as needed and preserve the same classes/computed visual
  style.
- About page begins with a concise, factual answer to “Who is Arifuzzaman
  Hredoy?” and separates established facts from aspirations/current learning.
- Project pages use the approved problem/solution/tools/learning/GitHub
  structure and show completed/in-progress truthfully.
- Audit every informative image for accurate alt text; keep decorative
  images empty-alt and avoid generic `orisa` values.

### Metadata and structured data

- Page and project records manage title, meta description, canonical path,
  Open Graph title/description/image and Twitter card data.
- Build canonical URLs from the configured production base URL; staging
  canonicals must not accidentally point at an indexable staging duplicate.
- Generate JSON-LD from validated rows and settings:
  - `Person` for owner name, job title, canonical URL, GitHub/LinkedIn
    `sameAs` and verified `knowsAbout` skills.
  - `ProfilePage` on About, referring to the `Person`.
  - `SoftwareSourceCode` for software projects where accurate; otherwise
    `CreativeWork`. Use verified repository links and project facts.
  - `BreadcrumbList` on About/project routes.
- JSON-LD must contain no unpublished projects, invented credentials,
  unsupported claims or private data. Validate output with schema tooling
  before release.

### Crawling and discoverability

- Generate `sitemap.xml` from canonical published pages/projects only; update
  when publish state or slug changes.
- Production `robots.txt` allows the intended search and AI crawlers
  (including GPTBot, OAI-SearchBot, ClaudeBot and PerplexityBot) and advertises
  the sitemap. Do not treat robots rules as access control.
- `/super-admin` has authentication, `X-Robots-Tag: noindex, nofollow`, a
  robots disallow, and no sitemap entries.
- Add a concise, factual `llms.txt` with links to public About, Projects and
  Contact pages; keep it consistent with the site's actual public content.
- Submit sitemap and verification in Google Search Console and Bing Webmaster
  Tools after DNS/canonical setup. Measure outcomes rather than promising
  rankings or AI citations.
- Inventory old URLs on `oxytumzone.com` before replacement. Map relevant
  indexed URLs to the closest new page with permanent 301 redirects; return
  404/410 where there is no relevant replacement instead of redirecting
  everything to `/`.

### Performance and Core Web Vitals

- Audit transferred bytes and real browser performance before changing the
  asset set. Keep WebP and add responsive source sizes only if they preserve
  image crop and design.
- Nginx serves versioned/static assets with long cache lifetimes; HTML and
  dynamic pages have appropriate shorter/private cache policy. Enable gzip
  and optionally Brotli if the installed Nginx build/module supports it.
- Lazy-load below-the-fold imagery; do not lazy-load the likely LCP hero
  image. Add explicit image dimensions/aspect ratios where safe.
- Measure LCP, INP and CLS on staging. Remove or defer only scripts/assets
  proven unused after reference-graph checks and visual/regression testing.

## 10. Docker, Nginx, GitHub Actions and EC2

### Local/staging Compose design

Compose services:

- `nginx`: public HTTP/HTTPS entrypoint, serves static files and reverse
  proxies same-origin dynamic requests.
- `app`: Go binary container, non-root, listens on an internal port only.
- `postgres`: PostgreSQL, private network, persistent named volume, health
  check; no public port binding in production.

Use a persistent upload/media volume mounted read-only to Nginx only where
needed for static delivery, and writable by the app. Keep database and
uploads in separate volumes. Use health checks and `depends_on` health
conditions; do not treat startup ordering as database readiness. Apply
migrations in a deliberate release step, not concurrently from every app
replica. Provide a tested backup/restore procedure.

### Nginx

- Serve static paths and cache immutable/versioned assets.
- Proxy `/`, `/projects/*`, `/super-admin/*` and other dynamic routes to Go
  on the internal network; preserve client IP only through trusted proxy
  configuration.
- Force HTTPS and canonical host in production. Do not redirect staging
  blindly to production.
- Set request-body limits and upload-specific rate limits, compression,
  security headers and cache controls. Apply `noindex` and `X-Robots-Tag`
  staging policy to every staging response.
- Configure per-path 301 mappings based on old URL inventory.

### GitHub Actions

Proposed workflow stages:

1. Format check, `go vet`, unit tests and static analysis.
2. sqlc generation consistency check; migration up/down or fresh-database
   integration test.
3. Build Go binary/container; scan dependencies/image and check for secrets.
4. Publish immutable image to a registry.
5. Deploy to staging with a protected environment, then smoke tests,
   security/header checks and visual-regression run.
6. Require manual production environment approval after owner review.
7. Deploy production image, apply migrations in a controlled step, smoke test,
   and retain the prior image/DB backup for rollback.

No Node installation is required. Use AWS OIDC/IAM role assumption where the
EC2 deployment method permits it; otherwise use a tightly scoped deployment
credential. Do not place `.env`, SSH private keys, DB passwords or production
uploads in the repository or build image.

### AWS EC2 and cutover sequence

1. Inventory the current site, indexed URL paths, DNS records, TLS setup,
   analytics/Search Console and any existing data. Export old config and
   content; preserve a restorable backup before deletion.
2. Build the new service on a staging subdomain over HTTPS, using a separate
   database and staging-only secrets. Require password protection or
   `noindex` for staging.
3. Validate content, routes, admin isolation, backups, restore, contact
   delivery/storage, robots/sitemap, old-link redirects and visual/regression
   checks. Obtain explicit owner acceptance.
4. Lower DNS TTL before cutover if operationally appropriate; prepare EC2,
   firewall/security groups, domain certificate and production backups.
5. Deploy the approved release while the old site remains recoverable. Verify
   direct health, canonical host, HTTPS, static assets and admin.
6. Switch DNS or Nginx vhost to the new site. Apply reviewed 301 redirects.
   Monitor logs, error rates, contact submissions and Search Console.
7. Keep a rollback path until the owner confirms the new site is stable.
   Retire the old site only after backup retention and cutover approval.

Do not delete the live old site until staging is accepted and production
backup/rollback are confirmed.

## 11. Phase roadmap and acceptance criteria

| Phase | Scope | Acceptance criteria |
|---|---|---|
| 0. Plan approval and content intake | Approve this plan; provide project status/content, bio, education, certifications, CV, image preferences, old URL inventory and deployment preferences. | Every candidate public claim has an owner-verified source; no project is presumed completed; unresolved content remains draft/hidden. |
| 1. Baseline and asset audit | Preserve source package; capture original dark page at agreed viewports; map CSS/JS/assets and licenses; decide which sections can be retained. | Baseline screenshots and asset-reference inventory saved; source `template-source/` checksums unchanged; no cleanup before reference evidence. |
| 2. Go/Postgres foundation | Go app, config, chi routing, PostgreSQL connection, sqlc and migration workflow; local Compose and health checks. | Fresh database migrates cleanly; app starts without secrets in repo; tests/vet pass; DB is private to Compose. |
| 3. Public template shell | Convert retained header/footer and sections to Go templates; retain original public CSS/JS/assets and script order; no dynamic data yet beyond test-only fixtures. | Page renders server-side; direct/nested routes resolve assets; no CSS console/load errors; original layout and animations remain visually equivalent. |
| 4. Authentication and admin shell | Login/session/CSRF, rate limits, separate admin layout/CSS, audit support. | Unauthenticated admin routes redirect/deny; session cookie flags verified over HTTPS; CSRF and rate-limit tests pass; admin does not load public Bootstrap/theme styles. |
| 5. Schema and admin CRUD | Migrations and admin for site settings, sections/pages, projects, skills, certifications, education, CV and contact inbox. | Each required record can be created/edited/hidden/deleted as specified; uploaded files are validated and safely named; drafts never leak to public pages. |
| 6. Dynamic public pages and contact | Home/About/Projects/Project/Contact/CV rendering, published-only queries, working DB-backed contact form. | Initial HTML contains complete content/meta; `POST /contact` validates, rate-limits, honeypot works and stores valid submissions; public content has no mutation/API route. |
| 7. SEO, accessibility and performance | Per-page metadata, JSON-LD, sitemap/robots/llms, semantics/alt audit, Nginx caching/compression and Web Vitals. | One H1 per page; schema validates and excludes drafts; `/super-admin` is authenticated/noindex; published pages appear in sitemap; agreed accessibility/perf checks pass. |
| 8. Hardening and staging deployment | CI workflow, dependency/image scan, HTTPS staging, backups/restore, old URL redirects and operational runbook. | Staging noindex; CI green; restore test passes; contact/admin/security smoke tests pass; owner signs off on content and design. |
| 9. Production cutover | Approved EC2 release, TLS, canonical URL, redirects, DNS, monitoring and rollback. | HTTPS/canonical/indexing/redirect checks pass; old site recoverable through rollback window; owner explicitly authorizes retirement of old site. |

### Visual-regression acceptance

- Capture the original `index-7-dark.html` at a fixed desktop, tablet and
  mobile viewport before implementation (recommended initial set:
  1440x900, 768x1024 and 390x844).
- Compare the Go-rendered page with the original using screenshots and
  computed layout/style checks for retained sections: container/grid
  geometry, spacing, typography, palette, image aspect/crop, menu behavior
  and animations.
- Content and imagery that must change, and sections deliberately removed,
  are expected differences. Mask text/image pixels only for automated
  pixel-diff scoring where their content is intentionally dynamic; inspect
  unmasked component boundaries and review complete side-by-side screenshots.
- No unexplained changes to retained component styling, responsive order,
  overflow, hover/focus behavior or animation timing are accepted. Any visual
  deviation needs documented owner approval.
- Test desktop/tablet/mobile, reduced-motion mode, keyboard navigation and
  no-JavaScript content rendering. Save baselines/results in the project
  workflow, not in production content.

## 12. Risks, open questions and owner input

### Light theme

The supplied package does **not** contain a complete Orisa Home 07 light
homepage: the package has only `index-7-dark.html`. The header's demo menu
references `index-7.html`, but that light HTML file is not present. Bootstrap
color-mode code and theme tokens exist, but they are not a finished, visually
validated Home 07 light variant. Therefore, a proper light theme needs a
separate design/adaptation and visual QA phase; it is not safe to enable the
existing switcher as-is. The Phase 02/initial public build will keep dark mode
only and hide the non-working switch control.

### Required owner decisions/input before content implementation

1. For each of the seven candidate projects, confirm it is real, choose
   `completed` or `in_progress`, provide accurate problem/solution/tools/
   learning copy, and provide only real screenshots and repository/live URLs.
2. Provide the factual About biography, current education, completed
   certifications and separately ongoing certifications/learning.
3. Provide the CV file and confirm whether its download should be public.
4. Choose the homepage image strategy: owner portrait, real project imagery,
   or retaining any non-claim decorative template image. Confirm rights for
   all images/logos. Template stock graphics may not accurately represent
   DevOps work.
5. Confirm whether the About, Certifications and Contact standalone routes
   are wanted, or whether any of them should be homepage-only.
6. Confirm whether phone is collected and required on the contact form. Email
   is already specified; no location/address is assumed.
7. Confirm whether contact messages should be DB-only or also emailed to
   the owner, and specify a delivery provider if notifications are wanted.
8. Set contact-message retention/deletion policy and whether soft deletion is
   required.
9. Provide/approve the staging hostname, AWS region/instance constraints,
   domain DNS access and TLS/certificate approach.
10. Provide the old site's known URLs or allow an inventory from its
    sitemap/Search Console/logs before writing redirect rules.
11. Approve hiding/removing the demo sections identified in Section 5 when
    no authentic content exists, including partner logos, demo metrics,
    team cards, marketing marquee and newsletter.
12. Confirm whether a future light-theme phase is desired after dark launch;
    if so, approve it as a new design/QA phase rather than part of initial
    implementation.

### Main risks

- **Content/layout coupling:** real text may wrap differently from demo copy.
  Set sensible content-length guidance in admin and review actual entries
  at all viewports without clipping or changing the design system.
- **Section removal:** removing fictional agency sections changes page length
  and visual rhythm even when retained sections remain pixel-accurate. The
  exact retained/removed set needs owner approval.
- **Candidate-project ambiguity:** names alone do not establish project
  completion, used technologies or deployment status. Publish only verified
  records.
- **Heavy multi-demo assets:** pruning before dependency tracing can break
  Home 07 motion. Inventory actual CSS URLs, JS selectors and asset requests
  first, then remove only demonstrably unused copied assets.
- **Font fixes:** correct the Google Fonts URL or serve a licensed local DM
  Sans asset and compare it visually. Resolve missing Font Awesome variants
  by either adding properly licensed files or removing unsupported unused
  face declarations after confirming icons; do not silently substitute a
  visually different icon font.
- **CSP vs animation libraries:** existing GSAP/plugins and inline SVG/style
  behavior may require a carefully tested CSP. Do not weaken CSP broadly to
  make a console error disappear.
- **Admin uploads and contact data:** CV/screenshots/messages are user data;
  storage, backup, access and retention need operational ownership.
- **Single EC2 availability:** Compose on one EC2 instance is a practical
  initial deployment but is a single point of failure; document backup and
  recovery expectations and avoid promising high availability.
- **SEO cutover:** missing old URL inventory can create broken backlinks or
  redirect mistakes. Do not switch DNS before mapping important old routes.
- **Licensing:** verify the template, Font Awesome Pro, GSAP plugins and any
  repurposed imagery license terms for the planned public deployment.

## Approval gate

This plan is complete. No implementation has started. Wait for explicit
approval of this Phase 02 plan and the required owner inputs before Phase 03.
