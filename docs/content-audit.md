# Content & Asset Audit — Hredoy Portfolio

**Audit type:** read-only. No layout, design, animation, spacing, section structure or code was changed.
**Date:** 2026-11-17
**Scope:** `frontend/`, `backend/`, `database/`, `docs/`
**Primary content file:** `frontend/src/components/public/HomeContent.tsx` (1620 lines, renders one static HTML string via `dangerouslySetInnerHTML`)
**Stylesheet:** `frontend/public/assets/css/main.css` (38,280 lines)
**Metadata:** `frontend/app/layout.tsx`

> Honesty rule applied throughout: nothing below is invented. Anything that cannot be verified from the repo is marked **needs my input**.

---

## 0. Page inventory

The public site is a **single page** with anchor navigation. There is exactly one public route plus one form endpoint.

| Route | File | Type | Notes |
|---|---|---|---|
| `/` | `frontend/app/page.tsx` → `HomeContent.tsx` | Static (prerendered) | The entire portfolio is one long page; all sections are anchors (`#about`, `#skills`, `#projects`, `#contact`). |
| `/contact` (POST) | `frontend/app/contact/route.ts` | Dynamic | Proxies form POST to Go backend `/contact`. |
| `/super-admin`, `/super-admin/login`, `/super-admin/messages`, `/super-admin/settings` | `backend/internal/http/templates/*.html` | Server-rendered Go | Admin only; not public content. |

**No other pages exist.** There is no separate blog page, no project detail page, no about page, no testimonials page. The template's blog grid was repurposed into the Projects section (see §4.10).

**Infrastructure note (affects SEO, see §8):** `devops/nginx/nginx.conf` proxies `/` to the Go app (`app:8080`), and the Go `home` handler returns the plain string `Hredoy Portfolio backend is running.` (`backend/internal/http/handlers.go:42-46`). The Next.js portfolio is **not** wired into the nginx/compose stack. So in the containerised deployment the public homepage is not the Next.js page. This is an infra gap, not a content edit — flagged for your decision.

---

## 1. Global / shared elements

### 1.1 Search overlay
- **Where:** `HomeContent.tsx:9-73` — `.at-search-body-overlay`, `.at-search-form-toggle`, `.at-search-form`
- **Current text:**
  - Logo text: `Hredoy`
  - Input placeholder: `Find what you need…`
  - Button: `Search`
  - Heading: `Popular searches`
  - Links: `CI/CD`, `Kubernetes`, `Docker`, `Linux`, `Cloud`, `Automation`, `Terraform`, `Git`, `AWS`, `DevOps` — all `href="#"`
- **Images:** `/assets/imgs/template/logo/favicon.svg` (28×30) — template logo.
- **Colors:** overlay/form styled in `main.css` (`.at-search-*`); accent `--at-theme-primary` `#14b8a6` (main.css:1162).
- **Classification:** **REMOVE** (or wire to a real search). It is a template search UI with `action="#"` and no backend; every "popular search" is a dead `#` link.

### 1.2 Header + primary navigation
- **Where:** `HomeContent.tsx:74-209` — `.header-7`, `.at-header-area`, `#header7Nav`
- **Current text:**
  - Logo: `Hredoy`
  - Nav: `Home`, `Expertise` (dropdown), `Projects` (dropdown), `Resources` (dropdown), `Contact`
  - Expertise mega-menu title `Core DevOps`: `01. CI/CD Pipelines`, `02. Kubernetes Infrastructure`, `03. Docker Containerization`, `04. Linux Systems & Automation`
  - Expertise mega-menu title `Cloud & IaC`: `05. Cloud Architecture (AWS)`, `06. Infrastructure as Code (Terraform)`, `07. Version Control (Git)`, `08. DevOps Task Manager`
  - Projects dropdown: `DevSecOps & Kubernetes Platform`, `Automated CI/CD Pipeline`, `AWS Cloud Infrastructure`, `Terraform Infrastructure as Code`, `Docker Compose Multi-Tier Platform`, `Nginx Reverse Proxy & SSL`
  - Resources dropdown: `About Me`, `DevOps Services`, `GitHub`, `LinkedIn`
  - Buttons (icon-only): search, theme toggle, hamburger
  - Sticky button: `MENU`
- **Images:** `/assets/imgs/template/logo/favicon-dark.svg` (49×54) — template logo; inline SVG icons.
- **Colors:** header transparent over hero; text `#fff`; dark-mode logo invert (`main.css:38143-38146`); accent `--at-theme-primary` `#14b8a6`.
- **Classification:**
  - KEEP structure.
  - **REPLACE** `08. DevOps Task Manager` — reads like a SaaS product, not a DevOps skill.
  - **REPLACE** nav labels `Expertise` / `Resources` — agency-style; consider `Skills` / `Links`.
  - **REMOVE** the search button (see §1.1).
  - **REPLACE** logo — see §1.5.

### 1.3 Offcanvas panel 1 (mobile/tablet menu)
- **Where:** `HomeContent.tsx:210-290` — `.at-offcanvas-area`
- **Current text:**
  - Logo: `Hredoy`
  - Heading: `Hi, I'm Hredoy`
  - Paragraph: `Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. I build reliable, automated, production-ready systems.`
  - `Get in touch`
  - `arifuzzamanhredoy@gmail.com`
  - `github.com/arifuzzaman-hredoy`
  - `linkedin.com/in/arifuzzaman-hredoy`
  - `Rangpur, Bangladesh`
  - `Follow Us`
  - Social labels: `GitHub`, `LinkedIn`, `Email`
- **Images:** five template avatars `/assets/imgs/template/avatar/avatar-10.webp` … `avatar-14.webp` (103×103 each), all `alt="DevOps"`.
- **Colors:** panel surface from `main.css` `.at-offcanvas*`; accent `#14b8a6`.
- **Classification:**
  - KEEP text (matches DB `bio`/`owner_name`).
  - **REPLACE** the 5-avatar gallery — template stock headshots, not your content. Either remove or replace with real images (see §7).
  - **REPLACE** `Hi, I'm Hredoy` → `Hi, I'm Arifuzzaman Hredoy` (consistency).

### 1.4 Offcanvas panel 2 (fullscreen menu)
- **Where:** `HomeContent.tsx:292-338` — `.at-offcanvas-2-area`
- **Current text:** logo `Hredoy`; social `GitHub`, `LinkedIn`, `Email`; `CLOSE`.
- **Images:** `/assets/imgs/template/logo/favicon.svg` (28×30).
- **Classification:** KEEP structure; **REPLACE** logo; **REMOVE** `Follow Us`-style agency framing if unused.

### 1.5 Logo / favicon
- **Where:** `frontend/public/assets/imgs/template/logo/favicon.svg` (28×30), `favicon-dark.svg` (49×54), `frontend/app/favicon.ico` (15,086 B).
- **What it is:** a generic geometric cube/hexagon mark (`favicon.svg` = three translucent polygons), not a personal logo.
- **Classification:** **REPLACE WITH MY REAL CONTENT.** Needs a real monogram/logo (see §7, item L1).

### 1.6 Footer
- **Where:** `HomeContent.tsx:1417-1603` — `.footer-7`
- **Current text:**
  - Nav: `Home`, `About`, `Skills`, `Projects`, `Contact`
  - Socials: `GitHub`, `LinkedIn`, `Email`, `Facebook`, `Instagram`
  - Contact lines: `github.com/arifuzzaman-hredoy`, `linkedin.com/in/arifuzzaman-hredoy`, `arifuzzamanhredoy@gmail.com`, `Rangpur, Bangladesh`
  - Tagline: `Junior DevOps Engineer · Cloud · Linux Admin`
  - `Open to` → `Remote · Full-time · Immediate Joining`
  - Newsletter: `Let's build something amazing together`, input placeholder `Email`, button `Get In Touch`
  - Big word: `DEVOPS ENGINEER`
  - Copyright: `Arifuzzaman Hredoy © 2026`
  - Policies: `Privacy Policy`, `Terms of Use`, `Refund Policy` — all `href="#"`
- **Images:** none (inline SVG social icons; decorative SVG at `main.css`/`HomeContent.tsx:1527-1535`).
- **Colors:** `.footer-7 { background:#0f0f0f; color:#fefefe; }` (`main.css:4596-4600`); nav link `#b7b7b7` (`main.css:4621`); borders `rgba(255,255,255,0.12)`.
- **Classification:**
  - KEEP nav + real contact lines (verify Facebook/Instagram).
  - **REMOVE** `Refund Policy` — meaningless for a portfolio; also `Terms of Use`/`Privacy Policy` are dead `#` links.
  - **REPLACE** newsletter form — `action="#"` with no handler. Either remove or wire to a real endpoint.
  - **REPLACE** `Let's build something amazing together` — agency wording.
  - **REPLACE** `Open to Remote · Full-time · Immediate Joining` — unverifiable availability claim (**needs my input**).
  - **REPLACE** `DEVOPS ENGINEER` big word — consider `JUNIOR DEVOPS ENGINEER` or your name.
  - **REPLACE** `© 2026` → dynamic year (currently hardcoded).

### 1.7 Back-to-top
- **Where:** `HomeContent.tsx:1606-1615` — `.back-to-top-wrapper`, `#back_to_top`. Icon only. **KEEP.**

---

## 2. Design tokens (colors) — where defined

| Token | Value | Defined at |
|---|---|---|
| Theme primary (accent) | `#14b8a6` | `main.css:1162` (`--at-theme-primary`) |
| Gradient primary | `linear-gradient(90deg,#a020f0 0%,#00ffd1 100%)` | `main.css:1163` (`--at-gradient-primary`) |
| Body / heading font | `'DM Sans', sans-serif` | `main.css:1101-1103` |
| Neutral 0 (section bg) | `#FEFEFE` light / `#0C0C0C` dark | `main.css:1130`, dark override `main.css:38127` |
| Neutral 50 (alt section bg) | `#F2F2F2` light / `#141414` dark | `main.css:1134`, dark override `main.css:38129` |
| Neutral 900 (text) | `#1D1D1D` light / `#EFEFEF` dark | `main.css:1146`, dark override `main.css:38137` |
| Button bg / text | `#1D1D1D` / `#FEFEFE` | `main.css:37290-37304` (`.at-btn`) |
| Section bg utilities | `.bg-neutral-0`, `.bg-neutral-50` | `main.css:1966-1980` |
| Hero split (desktop) | left `#14b8a6`, right `#0f766e`, text `#fff` | `main.css:13363-13387` |
| Hero gradient (tablet/phone) | `#2dd4bf` → `#0f766e` | `main.css:13799-13800` (`--hero-grad-top/bottom`) |
| Hero arch surface | `rgba(255,255,255,0.14)` | `main.css:13801` (`--hero-arch`) |
| Hero chip bg / border | `rgba(255,255,255,0.14)` / `rgba(255,255,255,0.35)` | `main.css:13803-13804` |
| Footer bg / text | `#0f0f0f` / `#fefefe` | `main.css:4598-4599` |
| Dark theme activation | `[data-bs-theme=dark]` (default on `<html>`) | `main.css:38121`; `layout.tsx:25` |

**Note:** dark mode is the default (`<html data-bs-theme="dark">`, `layout.tsx:25`). All "neutral" section backgrounds therefore resolve to near-black in production.

---

## 3. Section-by-section audit

Legend for classification: **KEEP** = accurate/keep as-is · **REPLACE** = needs your real content · **REMOVE** = template leftover / false claim / dead UI.

---

### 3.1 Hero — `sec-1-home-7`
- **Where:** `HomeContent.tsx:349-485`; selector `.sec-1-home-7`
- **Current text (exact):**
  - Brackets: `[ BUILD ]` `[ AUTOMATE ]` `[ SCALE ]` `[ DEPLOY ]`
  - H1: `Junior` / `DevOps` / `Engineer` (three `.sec-1-home-7__headline-line` spans)
  - Description: `I'm Arifuzzaman Hredoy, a Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. Continuously building practical projects and production-oriented engineering skills.`
  - CTA: `Get In Touch` (+ circular arrow button, `aria-label="Get In Touch"`)
  - Proof text: `Building reliable infrastructure with modern DevOps practices`
  - Tags: `Linux`, `Docker`, `Kubernetes`, `CI/CD`, `AWS`
  - Floating chips (decorative, tablet/phone only): `Linux`, `Docker`, `Kubernetes`, `CI/CD`, `AWS`
  - Decorative star `alt="decorative star"`
- **Images:**
  - `/assets/imgs/pages/home-13/Home-menu-pic.webp` — 1024×1053, 39,718 B (converted from `Home-menu-pic.png`, 755,643 B). **Template placeholder** — stock portrait with baked-in teal background.
  - `/assets/imgs/pages/home-7/star-asterisk.svg` — 114×114, decorative.
  - Proof avatars `/assets/imgs/pages/home-7/avatar-1.jpg` … `avatar-5.jpg` — 1000×667 JPEGs, `alt="Linux"/"Docker"/"Kubernetes"/"AWS"/"Terraform"` — **template stock photos, not tech logos**.
- **Colors:** desktop split `#14b8a6`/`#0f766e` (`main.css:13382-13387`); tablet/phone gradient `#2dd4bf`→`#0f766e` + arch/chip tokens (`main.css:13799-13804`); text `#fff`.
- **Classification:**
  - KEEP H1, brackets, CTA label.
  - **REPLACE** photo — needs your real portrait (see §7, H1).
  - **REPLACE** proof avatars — they are stock photos labelled as technologies. Either remove the avatar stack or replace with real tech logos.
  - **REPLACE** `Building reliable infrastructure with modern DevOps practices` — claim; keep only if true.
  - **REPLACE** `production-oriented engineering skills` — claim (**needs my input**).
  - **REPLACE** decorative star `alt` → `alt=""` + `aria-hidden="true"`.
  - **REPLACE** chips — currently decorative only; if kept, they duplicate the tags row.
- **Needs from you (H1):** real photo, **portrait, 4:5 aspect (e.g. 1024×1280)**, PNG/JPG, transparent or plain background preferred; plus a short one-line headline if you want it changed.

---

### 3.2 About — `sec-2-home-7` (`id="about"`)
- **Where:** `HomeContent.tsx:486-595`; selector `.sec-2-home-7`
- **Current text (exact):**
  - Eyebrow: `About Me`
  - Headline: `Passionate About Building Reliable Infrastructure`
  - Paragraph: `I'm Arifuzzaman Hredoy, currently pursuing a Diploma in Engineering in Computer Science & Technology at Rangpur Polytechnic Institute. I'm building practical skills in Linux, Docker, Kubernetes, AWS, and CI/CD through hands-on projects.`
  - Feature 1: `Linux Administration` — `Managing and securing Linux servers, configuring services, and automating system tasks with Bash scripting.`
  - Stat 1: `12+` — `Core DevOps technologies I work with`
  - Feature 2: `Cloud & AWS` — `Deploying and managing cloud infrastructure on AWS, working with EC2, S3, VPC, and other core services.`
  - Stat 2: `8+` — `Hands-on DevOps project areas`
  - Stat 3: `3+` — `Semesters completed in my Diploma`
  - Feature 3: `CI/CD & Automation` — `Building automated pipelines with GitHub Actions, Docker, and Kubernetes for continuous integration and deployment.`
- **Images:**
  - `/assets/imgs/pages/home-7/linux.jpg` — 1000×667, 74,576 B — **template stock**
  - `/assets/imgs/pages/home-7/cloud.jpg` — 1000×665, 95,383 B — **template stock**
  - `/assets/imgs/pages/home-7/cicd.jpg` — 1000×667, 128,919 B — **template stock**
- **Colors:** section `bg-neutral-0` (`main.css:1966`); feature icons `currentColor`; accent `#14b8a6`.
- **Classification:**
  - KEEP the 3 feature titles/descriptions (accurate, junior-appropriate) — verify claims.
  - **REPLACE** stats `12+`, `8+`, `3+` — unverifiable and internally inconsistent (34 tech logos exist; 14 repos listed; "3rd Semester" ≠ "3+ completed"). See §7 S1–S3.
  - **REPLACE** the 3 stock photos with real screenshots/diagrams (see §7 H2).
  - **REPLACE** headline if you want a different emphasis.
- **Needs from you (S1–S3):** the real numbers (how many technologies you actually use, how many project areas, how many semesters completed), or permission to remove the stat row entirely.

---

### 3.3 About-me slider — `home-2-section-8`
- **Where:** `HomeContent.tsx:596-627`; selector `.home-2-section-8`, `.about-me-slider-active`
- **Current text:** none (images only)
- **Images:** `/assets/imgs/pages/img-48.jpg` (135,437 B), `img-45.jpg` (95,383 B), `img-46.jpg` (138,123 B), `img-47.jpg` (128,919 B), `img-49.jpg` (163,977 B) — all 1000×~667 JPEGs, all `alt="DevOps"`.
  - **Duplicate content:** `img-45.jpg` = `cloud.jpg`; `img-47.jpg` = `cicd.jpg` = `step-3.jpg`; `img-48.jpg` = `devops.jpg` = `step-4.jpg`; `img-49.jpg` = `security.jpg` (identical MD5).
- **Colors:** section default.
- **Classification:** **REMOVE** or **REPLACE**. This is a template image slider reusing the same stock photos as other sections. No real content.
- **Needs from you (H3):** 3–5 real images (screenshots, diagrams, workspace) at **16:10 landscape, ≥1200 px wide**, or confirm removal.

---

### 3.4 My Mission — `sec-4-home-7`
- **Where:** `HomeContent.tsx:628-688`; selector `.sec-4-home-7`, `bg-neutral-50`
- **Current text (exact):**
  - Eyebrow: `My Mission`
  - Title: `Continuously learning and building practical DevOps skills to become a professional DevOps Engineer.`
  - CTA: `Let's Connect`
  - Location block:
    - `Location`
    - `Rangpur, Bangladesh`
    - `Email: arifuzzamanhredoy@gmail.com`
    - `GitHub: github.com/arifuzzaman-hredoy`
  - Education block:
    - `Diploma in Engineering — Computer Science & Technology`
    - `Institute: Rangpur Polytechnic Institute`
    - `Semester: 3rd Semester`
    - `GPA: 3.93 (1st) · 3.69 (2nd)`
- **Images:**
  - `/assets/imgs/pages/home-7/devops.jpg` — 1000×667, 135,437 B (`width="377" height="471"`) — **template stock**
  - `/assets/imgs/pages/home-7/sec-4-pin-icon.svg` — 40×40, decorative
- **Colors:** section `bg-neutral-50` (`main.css:1974`); accent `#14b8a6`.
- **Classification:**
  - KEEP location + email + GitHub (verify).
  - **REPLACE** education details (institute, semester, GPA) — **needs my input / verification**. GPA is a factual claim.
  - **REPLACE** `devops.jpg` stock photo.
  - **REPLACE** CTA `Let's Connect` → clearer label (e.g. `Get In Touch`).
- **Needs from you (E1):** confirm institute name, current semester, and whether to publish GPA (and exact values).

---

### 3.5 Skills — `sec-5-home-7` (`id="skills"`)
- **Where:** `HomeContent.tsx:689-864`; selector `.sec-5-home-7`
- **Current text (exact):**
  - Eyebrow: `My Skills`
  - Title: `Technical Skills & Proficiency.`
  - CTA: `Get In Touch`
  - Accordion:
    - `01. Linux Administration` — `Managing and securing Linux servers, configuring services, and automating system tasks with Bash scripting.` — tags `Ubuntu`, `Bash`, `Server Security`
    - `02. Containerization` — `Building and deploying containerized applications using Docker and Docker Compose for consistent environments.` — tags `Docker`, `Docker Compose`, `Container Registry`
    - `03. CI/CD Pipelines` — `Creating automated build and deployment pipelines with GitHub Actions for continuous integration and delivery.` — tags `GitHub Actions`, `Automation`, `Deployment`
    - `04. Cloud Infrastructure` — `Deploying and managing cloud infrastructure on AWS, working with EC2, S3, VPC, and other core services.` — tags `AWS`, `EC2`, `S3`
  - Tagline above logos: `Continuously learning and expanding my DevOps skillset across the modern cloud-native stack.`
  - Visually-hidden tech list (34): `Docker, Kubernetes, Linux, AWS, Terraform, Git, Nginx, GitHub Actions, GitHub, Ubuntu, Bash, Python, Go, PostgreSQL, Packer, Ansible, Jenkins, Helm, Prometheus, Grafana, Argo CD, GitLab, Redis, MySQL, Apache, Cloudflare, Let's Encrypt, SonarQube, Trivy, Vault, Wireshark, Postman, VS Code, Vim`
- **Images:** none in markup — 34 logo SVGs injected by `frontend/public/assets/js/tech-physics.js` from `/assets/images/tech/<key>.svg`.
- **Colors:** section `bg-neutral-0`; accordion from `main.css` `.sec-5-home-7__*`; accent `#14b8a6`.
- **Classification:**
  - KEEP the 4 accordion items (accurate) — verify each claim.
  - **REPLACE** the 34-item tech list with only technologies you can defend. Several are likely aspirational (Packer, Vault, SonarQube, Trivy, Wireshark, Argo CD, Helm, Prometheus, Grafana). **needs my input** — confirm which you actually use.
  - **REPLACE** title `Technical Skills & Proficiency.` — "Proficiency" overstates for a junior; consider `Technical Skills`.
  - **REPLACE** `engineer.jpg` (see images below).
- **Images (markup):** `/assets/imgs/pages/home-7/engineer.jpg` — 1000×667, 86,175 B — **template stock**; also reused for the Nginx project card (§3.10). `engineer.jpg` is byte-identical to `avatar-5.jpg`.
- **Needs from you (T1):** the definitive list of tools you can discuss in an interview, grouped (e.g. OS, Containers, CI/CD, Cloud, IaC, Monitoring, Security).

---

### 3.6 My Journey / The Process — `sec-6-home-7`
- **Where:** `HomeContent.tsx:865-966`; selector `.sec-6-home-7`
- **Current text (exact):**
  - Eyebrow: `My Journey`
  - Title: `The Process`
  - Description: `My systematic approach to becoming a DevOps Engineer, from fundamentals to advanced practices.`
  - Chips: `Learn Fundamentals`, `Practice Daily`, `Build Projects`, `Keep Improving`
  - Card 01: `Learn Fundamentals` — `Understanding the fundamentals of Linux, networking, and cloud computing through hands-on practice and coursework.`
  - Card 02: `Hands-on Practice` — `Building practical projects with Docker, CI/CD pipelines, and cloud infrastructure to apply theoretical knowledge.`
  - Card 03: `Project Development` — `Creating real-world DevOps projects like automated deployments, infrastructure provisioning, and monitoring solutions.`
  - Card 04: `Continuous Improvement` — `Refining skills, exploring new tools, and staying updated with the latest DevOps practices and technologies.`
- **Images:** `/assets/imgs/pages/home-7/step-1.jpg` (114,586 B), `step-2.jpg` (74,576 B), `step-3.jpg` (128,919 B), `step-4.jpg` (135,437 B) — all 1000×~667 JPEGs, **template stock**. Duplicates: `step-1`=`blog-linux.jpg`, `step-2`=`linux.jpg`, `step-3`=`cicd.jpg`, `step-4`=`devops.jpg`.
- **Colors:** section `bg-neutral-0`; cards from `main.css` `.sec-6-home-7__*`.
- **Classification:**
  - KEEP the 4 process cards (generic, honest, no false claims) — optional rewording.
  - **REPLACE** the 4 stock images with real screenshots/diagrams.
- **Needs from you (H4):** 4 images, **4:3 landscape, ≥1200 px**, or confirm removal of card media.

---

### 3.7 CTA banner — `sec-7-home-7`
- **Where:** `HomeContent.tsx:967-1032`; selector `.sec-7-home-7`
- **Current text (exact):**
  - Eyebrow: `Ready to Build the Future ?`
  - Headline: `Let's work together to build reliable, scalable infrastructure for your next project.`
  - Features: `Practical DevOps skills`, `Real-world projects`, `Continuous learning`, `Production mindset`
  - CTA: `Start Your Journey`
- **Images:** `/assets/imgs/pages/home-7/security.jpg` — 1000×667, 163,977 B (`width="798" height="798"`) — **template stock**; `sec-7-eyebrow-arrow.svg` (14×13), `sec-7-plus.svg` (18×18), `sec-7-btn-arrow.svg` (24×24), `sec-7-rotating.svg` (100×100) — decorative.
- **Colors:** `.sec-7-home-7` from `main.css`; accent `#14b8a6`.
- **Classification:**
  - **REPLACE** `Ready to Build the Future ?` — agency/marketing tone.
  - **REPLACE** `Let's work together to build reliable, scalable infrastructure for your next project.` — this is written as if you are selling services. For a junior portfolio, reframe to "I'm looking for a team where I can…" (**needs my input**).
  - **REPLACE** `Start Your Journey` — ambiguous CTA; use `Get In Touch` / `View My Projects`.
  - **REPLACE** `Production mindset` — claim (**needs my input**).
  - **REPLACE** `security.jpg` stock photo.
- **Needs from you (C1):** one sentence describing what you are looking for (internship / junior role / remote), and the primary CTA label.

---

### 3.8 About Me / Who I Am — `sec-8-home-7`
- **Where:** `HomeContent.tsx:1033-1109`; selector `.sec-8-home-7`
- **Current text (exact):**
  - Eyebrow: `About Me`
  - Heading: `Who I Am`
  - Paragraph 1: `Hello! I'm Arifuzzaman Hredoy, an aspiring DevOps Engineer and Computer Science and Technology (CST) student from Bangladesh.`
  - Paragraph 2: `"Learn by Building, Grow by Solving, and Improve by Automating."`
  - CTA: `Let's Connect`
  - Card: name `Arifuzzaman Hredoy`, role `Junior DevOps Engineer`
- **Images:** `/assets/imgs/pages/home-7/team-1.jpg` — 1000×666, 96,432 B — **template stock**.
- **Colors:** section `bg-neutral-0`; `.sec-8-home-7__*` in `main.css`.
- **Classification:**
  - KEEP text (honest).
  - **REPLACE** `team-1.jpg` with your real photo (or remove the card).
  - **REPLACE** card `href="#about"` (self-link) → `#contact` or a real about target.
  - **REMOVE** leftover HTML comments naming template people: `<!-- Card 1: Darrell Steward -->` (line 1077), `<!-- Card 2: Amelia Courtney (dark badge) -->` (1096), `<!-- Card 3: Esther Howard -->` (1101), `<!-- Card 4: Jacob Jones -->` (1103).
- **Needs from you (H5):** real photo **4:5 portrait, ≥800 px**, or confirm removal of the card.

---

### 3.9 Tech marquee — `sec-9-home-7`
- **Where:** `HomeContent.tsx:1110-1215`; selector `.sec-9-home-7`
- **Current text (exact, repeated twice per row):** `Linux`, `Docker`, `Kubernetes`, `AWS`, `Terraform`, `CI/CD`, `GitHub Actions`, `Nginx`, `Prometheus`, `Grafana`, `PostgreSQL`
- **Images:** `/assets/imgs/pages/home-7/marquee-star.svg` — 40×40, decorative separator.
- **Colors:** transparent; text inherits; `changeless` theme lock (`main.css:38156+`).
- **Classification:** **REPLACE** with your confirmed tech list (must match §3.5). **KEEP** the marquee mechanism.

---

### 3.10 Featured Projects — `sec-10-home-7` (`id="projects"`)
- **Where:** `HomeContent.tsx:1216-1362`; selector `.sec-10-home-7`
- **Current text (exact):**
  - Eyebrow: `Projects`
  - Title: `Featured Projects`
  - Lead: `A selection of hands-on DevOps projects covering Linux, Docker, CI/CD, AWS, Terraform, Kubernetes, and DevSecOps.`
  - Button: `All Projects` → `https://github.com/arifuzzaman-hredoy/`
  - Cards:
    1. `DevSecOps, Monitoring & Kubernetes Platform` — `Kubernetes · Prometheus · Grafana · Trivy` — `https://github.com/arifuzzaman-hredoy/DevSecOps-Monitoring-Kubernetes-Platform`
    2. `Automated CI/CD Pipeline` — `GitHub Actions · Docker · GHCR` — `https://github.com/arifuzzaman-hredoy/Automated-CI-CD-Pipeline`
    3. `AWS Cloud Infrastructure & EC2 Deployment` — `AWS · EC2 · VPC · IAM` — `https://github.com/arifuzzaman-hredoy/AWS-Cloud-Infrastructure-EC2-Deployment`
    4. `Infrastructure as Code with Terraform` — `Terraform · AWS · Modules` — `https://github.com/arifuzzaman-hredoy/Terraform-Infrastructure-as-Code`
    5. `Docker Compose Multi-Tier Platform` — `Docker Compose · Nginx · PostgreSQL` — `https://github.com/arifuzzaman-hredoy/Docker-compose-Multi-Tier-Platform`
    6. `Nginx Reverse Proxy, Domain & SSL` — `Nginx · SSL/TLS · DNS` — `https://github.com/arifuzzaman-hredoy/Nginx-Reverse-Proxy-Domain-SSL`
  - Heading: `All 14 Repositories`
  - List (14):
    1. `01. DevOps Workflow & SDLC Lab`
    2. `02. Production Linux Server Administration`
    3. `03. DevOps Network Engineering Lab`
    4. `04. Bash & Git DevOps Automation Toolkit`
    5. `05. Docker Containerization Platform`
    6. `06. Docker Compose Multi-Tier Platform`
    7. `07. Git Version Control Lab`
    8. `08. GitHub Collaboration Lab`
    9. `09. Nginx Reverse Proxy, Domain & SSL`
    10. `10. Automated CI/CD Pipeline`
    11. `11. AWS Cloud Infrastructure & EC2 Deployment`
    12. `12. Infrastructure as Code with Terraform`
    13. `13. DevSecOps, Monitoring & Kubernetes Platform`
    14. `14. Nexora Three-Tier Infrastructure` → `https://github.com/arifuzzaman-hredoy/DevOps-Module-4-Assignment`
- **Images (card thumbs):**
  - `security.jpg` (163,977 B) — template stock
  - `cicd.jpg` (128,919 B) — template stock
  - `cloud.jpg` (95,383 B) — template stock
  - `blog-terraform.jpg` (1000×750, 105,865 B) — template stock
  - `devops.jpg` (135,437 B) — template stock
  - `engineer.jpg` (86,175 B) — template stock (same file as §3.5 photo)
- **Colors:** section `bg-neutral-0`; cards `.blog-card__*` from `main.css`.
- **Classification:**
  - KEEP the 6 featured projects **only if every repo exists and is public** (**needs my input**).
  - **REPLACE** all 6 card thumbnails with real screenshots/architecture diagrams (**16:10, ≥1200 px**).
  - **REPLACE** `All 14 Repositories` / the 14-item list — verify all 14 repos exist; the 14th label (`Nexora Three-Tier Infrastructure`) does not match its URL slug (`DevOps-Module-4-Assignment`) — confirm the real title.
  - **REPLACE** `All Projects` link target if you have a curated projects page.
- **Needs from you (P1):** for each of the 6 featured repos — one-line description, your role, and whether it is public; plus a screenshot/diagram per card.

---

### 3.11 Contact — `sec-11-home-7` (`id="contact"`)
- **Where:** `HomeContent.tsx:1363-1414`; selector `.sec-11-home-7`
- **Current text (exact):**
  - Eyebrow: `Contact Me`
  - Title: `Get in touch`
  - Fields (placeholders): `Your name *`, `Your email *`, `Your phone *`, `Your message *`
  - Button: `Send Message`
  - Disclaimer: `By submitting, you agree to our Terms and Privacy Policy.` — both `href="#"`
- **Images:** none.
- **Colors:** `.sec-11-home-7` / `.sec-4-about-form__*` from `main.css`; `.at-btn` bg `#1D1D1D` (`main.css:37302`).
- **Classification:**
  - KEEP name/email/message fields.
  - **REMOVE** the `phone` field — it is `required` in the UI but **not forwarded** by `frontend/app/contact/route.ts:29` (only `name`, `email`, `message`) and there is **no phone column** in `contact_messages` (`database/migrations/001_init_schema.up.sql:9-17`). It is a dead required field.
  - **REMOVE** the `Terms` / `Privacy Policy` links (`href="#"`) or create real pages.
  - **REPLACE** the form action behaviour — currently redirects to `/?sent=1#contact` / `/?error=1#contact` but **no success/error message is rendered anywhere**. Add visible feedback (**needs my input** on wording).
- **Needs from you (F1):** confirm whether to keep phone (and add DB column) or remove it; approve success/error messages.

---

## 4. Database vs static — what should come from the admin panel

### 4.1 What exists today
- `site_settings` table (`database/migrations/001_init_schema.up.sql:1-7`) — key/value.
- Seeded keys (`database/migrations/002_seed_site_settings.up.sql`):
  `owner_name`, `role`, `email`, `github`, `linkedin`, `location`, `bio`.
- Read API: `GET /api/v1/site-settings` (`backend/internal/http/router.go:40`, handler `handlers.go:163-178`).
- Admin editor: `/super-admin/settings` (`backend/internal/http/admin.go:182-228`, template `settings.html`).
- Contact inbox: `/super-admin/messages` (`contact_messages` table).

### 4.2 Critical gap
**The public Next.js page does not consume `site_settings` at all.** `frontend/` contains no reference to `site_settings`, `owner_name`, or `/api/v1/site-settings` (verified by repo-wide search). Every value in `HomeContent.tsx` is hardcoded. So editing the admin panel changes the API response but **not the public page** — guaranteed content drift.

### 4.3 Recommendation

| Content | Source | Reason |
|---|---|---|
| Owner name, role, email, GitHub, LinkedIn, location, bio | **DB** (`site_settings`) | Already modelled; used in many places; changes often. |
| Hero headline / sub-headline / CTA labels | **DB** | Marketing copy you will iterate on. |
| Stats (technologies, project areas, semesters) | **DB** | Numeric claims you may revise. |
| Education (institute, semester, GPA) | **DB** | Facts that change. |
| Tech stack list (names + order) | **DB** (new table or JSON setting) | Drives §3.5, §3.9, and the physics scene. |
| Projects (title, description, tech, repo URL, image, order) | **DB** (new table) | You will add/remove repos. |
| Social links (Facebook, Instagram) | **DB** | Currently hardcoded only. |
| Section headings that never change (e.g. "The Process", "Get in touch") | **Static** | Low churn; simpler. |
| Layout, design tokens, colours, fonts | **Static** | Never user-editable. |
| SEO title/description/OG image | **DB** (with static fallback) | You will tune these. |
| Legal pages (Privacy/Terms) | **Static** (real files) or remove | Not dynamic. |

> Wiring DB → Next.js is a code change (server-side fetch of `/api/v1/site-settings` with a build-time fallback). It is **out of scope for this audit**; listed here as the recommended target.

---

## 5. Images — full inventory & placeholder status

### 5.1 Hero / portrait
| Path | Size | Placeholder? | Used at |
|---|---|---|---|
| `assets/imgs/pages/home-13/Home-menu-pic.webp` | 1024×1053, 39,718 B | **Yes — template stock** | Hero (§3.1) |
| `assets/imgs/pages/home-13/Home-menu-pic.png` | 1024×1053, 755,643 B | Source of the above (unused) | — |

### 5.2 Section photography (all template stock JPEGs)
| Path | Dimensions | Bytes | Duplicate of |
|---|---|---|---|
| `home-7/linux.jpg` | 1000×667 | 74,576 | `step-2.jpg` |
| `home-7/cloud.jpg` | 1000×665 | 95,383 | `img-45.jpg` |
| `home-7/cicd.jpg` | 1000×667 | 128,919 | `step-3.jpg`, `img-47.jpg` |
| `home-7/devops.jpg` | 1000×667 | 135,437 | `step-4.jpg`, `img-48.jpg` |
| `home-7/security.jpg` | 1000×667 | 163,977 | `img-49.jpg` |
| `home-7/engineer.jpg` | 1000×667 | 86,175 | `avatar-5.jpg` |
| `home-7/team-1.jpg` | 1000×666 | 96,432 | — |
| `home-7/step-1.jpg` | 1000×668 | 114,586 | `blog-linux.jpg` |
| `home-7/step-2.jpg` | 1000×667 | 74,576 | `linux.jpg` |
| `home-7/step-3.jpg` | 1000×667 | 128,919 | `cicd.jpg` |
| `home-7/step-4.jpg` | 1000×667 | 135,437 | `devops.jpg` |
| `home-7/blog-terraform.jpg` | 1000×750 | 105,865 | — |
| `home-7/avatar-1.jpg` | 1000×667 | 102,210 | — |
| `home-7/avatar-2.jpg` | 1000×668 | 106,902 | — |
| `home-7/avatar-3.jpg` | 1000×667 | 90,696 | — |
| `home-7/avatar-4.jpg` | 1000×563 | 63,112 | — |
| `home-7/avatar-5.jpg` | 1000×667 | 86,175 | `engineer.jpg` |
| `pages/img-45.jpg` | 1000×665 | 95,383 | `cloud.jpg` |
| `pages/img-46.jpg` | 1000×561 | 138,123 | — |
| `pages/img-47.jpg` | 1000×667 | 128,919 | `cicd.jpg` |
| `pages/img-48.jpg` | 1000×667 | 135,437 | `devops.jpg` |
| `pages/img-49.jpg` | 1000×667 | 163,977 | `security.jpg` |

**All 22 of the above are template placeholders.** None is your content.

### 5.3 Decorative / icons (keep)
`marquee-star.svg` (40×40), `sec-4-pin-icon.svg` (40×40), `sec-7-btn-arrow.svg` (24×24), `sec-7-eyebrow-arrow.svg` (14×13), `sec-7-plus.svg` (18×18), `sec-7-rotating.svg` (100×100), `star-asterisk.svg` (114×114), `template/avatar/avatar-10…14.webp` (103×103, offcanvas), `template/logo/favicon.svg` (28×30), `template/logo/favicon-dark.svg` (49×54).

### 5.4 Tech logos (generated)
34 SVGs under `frontend/public/assets/images/tech/` injected by `tech-physics.js`. **KEEP** (subject to §3.5 list confirmation).

---

## 6. SEO audit

### 6.1 Present
| Item | Value | Where |
|---|---|---|
| `title` | `Hredoy's Portfolio — Junior DevOps Engineer` | `layout.tsx:5` |
| `description` | `Arifuzzaman Hredoy — Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code.` | `layout.tsx:6` |
| `keywords` | DevOps, Linux, Cloud, CI/CD, Docker, Kubernetes, AWS, Terraform, Portfolio | `layout.tsx:7` |
| `authors` | Arifuzzaman Hredoy | `layout.tsx:8` |
| `openGraph.title` | same as title | `layout.tsx:10` |
| `openGraph.description` | same as description | `layout.tsx:11` |
| `openGraph.type` | `website` | `layout.tsx:12` |
| `viewport` / `themeColor` | `width=device-width`, `initialScale=1`, `viewportFit=cover`, `#0f766e` | `layout.tsx:16-21` |
| `lang` | `en` | `layout.tsx:25` |
| `robots.txt` | `User-agent: * / Allow: / / Disallow: /super-admin / Sitemap: <SiteURL>/sitemap.xml` | `backend/internal/http/handlers.go:184-187` (Go, dynamic) |
| `sitemap.xml` | single URL `<SiteURL>/` | `backend/internal/http/handlers.go:189-200` (Go, dynamic) |
| `llms.txt` | short profile + links | `backend/internal/http/handlers.go:202-217` (Go, dynamic) |

### 6.2 Missing
| Item | Impact |
|---|---|
| **Open Graph image** (`openGraph.images`) | Social shares show no preview image. **High priority.** |
| `openGraph.url`, `openGraph.siteName`, `openGraph.locale` | Incomplete OG. |
| `twitter` card metadata (`summary_large_image`) | No X/Twitter preview. |
| `metadataBase` | OG/canonical URLs may resolve incorrectly. |
| `alternates.canonical` | No canonical URL. |
| `icons` (favicon/apple-touch) | Only `app/favicon.ico` exists; no explicit icon metadata. |
| **JSON-LD structured data** (`Person`, `ProfilePage`, `WebSite`, `BreadcrumbList`) | No `application/ld+json` anywhere (verified). **High priority** for AEO/GEO. |
| `robots.txt` / `sitemap.xml` / `llms.txt` in `frontend/public/` | They exist only in the Go backend. If the Next.js app is served directly, they 404. |
| Sitemap coverage | Only `/`; no section anchors, no project deep links (there are none). |
| Per-section `id` anchors in sitemap | N/A (single page). |
| `lang` alternates / hreflang | Single-language site; low priority. |

### 6.3 Alt-text audit
| Location | Current alt | Verdict |
|---|---|---|
| Hero photo | `Arifuzzaman Hredoy` | KEEP |
| Hero proof avatars (×5) | `Linux`, `Docker`, `Kubernetes`, `AWS`, `Terraform` | **REPLACE** — images are stock photos, not those technologies. |
| Decorative star | `decorative star` | **REPLACE** → `alt=""` + `aria-hidden="true"`. |
| Offcanvas gallery avatars (×5) | `DevOps` | **REPLACE** — stock headshots; or remove. |
| Sec-2 images (×3) | `Linux terminal`, `Cloud infrastructure`, `CI/CD pipeline` | **REPLACE** — stock photos; use descriptive alts for real images. |
| Sec-3 slider (×5) | `DevOps` (all identical) | **REPLACE** — non-descriptive duplicates. |
| Sec-4 image | `DevOps` | **REPLACE** — generic. |
| Sec-5 image | `DevOps Engineer` | **REPLACE** — generic. |
| Sec-6 step images (×4) | `Learn Fundamentals`, `Hands-on Practice`, `Project Development`, `Continuous Improvement` | KEEP (match card titles) |
| Sec-7 image | `DevOps` | **REPLACE** — generic. |
| Sec-8 card image | `Arifuzzaman Hredoy` | KEEP (if real photo) |
| Sec-10 project thumbs (×6) | descriptive project names | KEEP (if real screenshots) |
| Logo images (header/offcanvas) | `Hredoy` | KEEP (or your real name) |
| Decorative SVGs | `alt=""` | KEEP |

### 6.4 Recommended metadata to add (no code change made)
- `metadataBase: new URL("https://oxytumzone.com")`
- `openGraph.images: [{ url: "/og/og-home.png", width: 1200, height: 630, alt: "Arifuzzaman Hredoy — Junior DevOps Engineer" }]`
- `openGraph.siteName`, `openGraph.locale: "en_US"`, `openGraph.url`
- `twitter: { card: "summary_large_image", title, description, images }`
- `alternates: { canonical: "/" }`
- JSON-LD `Person` (name, jobTitle, url, sameAs[GitHub, LinkedIn], email, address) + `ProfilePage` + `WebSite`.
- `icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" }`

---

## 7. Template placeholders, dead links & false claims

### 7.1 Placeholder / dead `href="#"` links
| Line(s) | Context | Action |
|---|---|---|
| 31 | Search `<form action="#">` | REMOVE search or wire it |
| 57-66 | "Popular searches" items | REMOVE with search |
| 92 | Nav `Home` | Change to `/` |
| 94, 133, 144 | Nav dropdown parents `Expertise` / `Projects` / `Resources` | Keep as dropdown toggles (acceptable) or link to first child |
| 1408 | `Terms` / `Privacy Policy` | REMOVE or create pages |
| 1563 | Footer newsletter `<form action="#" method="post">` | REMOVE or wire |
| 1596-1598 | `Privacy Policy`, `Terms of Use`, `Refund Policy` | REMOVE (esp. Refund) or create pages |

### 7.2 Placeholder emails / phones / socials
- **Emails:** `arifuzzamanhredoy@gmail.com` — real (used consistently). **KEEP** (verify).
- **Phones:** none in content; the contact form asks for a phone it never stores (§3.11).
- **Socials:** GitHub `github.com/arifuzzaman-hredoy`, LinkedIn `linkedin.com/in/arifuzzaman-hredoy`, Facebook `facebook.com/arifuzzamanhredoy`, Instagram `instagram.com/hredoy_403x`. **needs my input** — confirm each is correct and public.
- **No `example.com`, no `your@email`, no `555-`, no `John Doe`/`Jane Doe`.** Verified.

### 7.3 Lorem ipsum
- **None found** anywhere in `frontend/`, `backend/`, `database/`.

### 7.4 Template names in comments (invisible but leftover)
- `HomeContent.tsx:1077` `<!-- Card 1: Darrell Steward -->`
- `HomeContent.tsx:1096` `<!-- Card 2: Amelia Courtney (dark badge) -->`
- `HomeContent.tsx:1101` `<!-- Card 3: Esther Howard -->`
- `HomeContent.tsx:1103` `<!-- Card 4: Jacob Jones -->`

### 7.5 False / unverifiable claims (honesty check)
| Claim | Where | Status |
|---|---|---|
| `12+` core DevOps technologies | §3.2 | **Unverifiable** — 34 logos listed elsewhere. Needs my input. |
| `8+` hands-on project areas | §3.2 | **Unverifiable.** Needs my input. |
| `3+` semesters completed | §3.2 | Conflicts with `3rd Semester` (§3.4). Needs my input. |
| `production-oriented engineering skills` | §3.1 | **Claim.** Needs my input. |
| `production-ready systems` | §1.3 | **Claim.** Needs my input. |
| `Building reliable infrastructure with modern DevOps practices` | §3.1 | **Claim.** Needs my input. |
| `Production mindset` | §3.7 | **Claim.** Needs my input. |
| `Ready to Build the Future ?` | §3.7 | Marketing/agency tone, not a factual claim. |
| `Let's work together to build reliable, scalable infrastructure for your next project.` | §3.7 | Reads as a service pitch. Needs rewrite. |
| `Open to Remote · Full-time · Immediate Joining` | §1.6 | **Unverifiable availability.** Needs my input. |
| GPA `3.93` / `3.69` | §3.4 | **Needs my input** (factual). |
| `All 14 Repositories` | §3.10 | **Needs my input** (all must exist & be public). |
| 6 featured project titles/descriptions | §3.10 | **Needs my input** (each repo must exist). |

### 7.6 Explicitly absent (good news)
There are **no** fake client logos, **no** fake testimonials, **no** "Happy Clients" counters, **no** "Get A Free Quote", **no** agency portfolio sections, **no** star ratings, **no** awards. The template's marketing sections were already removed/replaced. The remaining agency-flavoured strings are listed in §7.5.

---

## 8. Prioritized checklist — what I must provide

### P0 — Blocking honesty/legal (do first)
1. **Confirm or correct every factual claim** in §7.5 (stats, GPA, semester, availability, "production-ready", "production mindset"). Reply with corrected values or "remove".
2. **Confirm all 14 repositories exist and are public**, and give the correct title for #14 (`Nexora Three-Tier Infrastructure` vs `DevOps-Module-4-Assignment`).
3. **Confirm the 6 featured projects** — one-line description + your role + public/private.
4. **Confirm social URLs** (Facebook, Instagram) are correct and public.

### P1 — Real assets
5. **Hero portrait** — `H1`: portrait, **4:5 (e.g. 1024×1280)**, PNG/JPG, plain or transparent background.
6. **About photo** — `H5`: portrait **4:5, ≥800 px** (or say "remove").
7. **Project screenshots/diagrams** — `P1`: 6 images, **16:10, ≥1200 px** (architecture diagrams preferred).
8. **Section imagery** — `H2`/`H3`/`H4`: real screenshots or diagrams for About / slider / Mission / Process (4 images, 4:3), or approve removal of stock photos.
9. **Logo / favicon** — `L1`: a real monogram or logo (SVG preferred), or approve keeping the template mark.
10. **OG image** — `SEO1`: **1200×630** PNG/JPG for social sharing.

### P2 — Copy decisions
11. **Tech stack list** — `T1`: the definitive tools you can defend, grouped.
12. **CTA labels** — `C1`: primary CTA wording (e.g. `Get In Touch` / `View My Projects`) and what you are looking for (internship / junior role / remote).
13. **Remove or keep** the search overlay, newsletter form, and legal links (`Terms`/`Privacy`/`Refund`).
14. **Phone field** — `F1`: remove it, or keep it and add a DB column.
15. **Contact form feedback** — approve success/error message wording.

### P3 — SEO
16. **Domain** — confirm `https://oxytumzone.com` (and staging) for `metadataBase`/canonical/sitemap.
17. **Person schema data** — confirm name, job title, location, sameAs links, email.
18. **Approve** adding `openGraph.images`, Twitter card, JSON-LD, and static `robots.txt`/`sitemap.xml`/`llms.txt` in `frontend/public/`.

### P4 — Architecture decision (not content)
19. **DB-driven content** — confirm whether to wire `site_settings` into the Next.js page (server-side fetch) and which new keys/tables to add (projects, tech list, stats, education, socials).
20. **Serving** — decide whether nginx should route `/` to the Next.js app instead of the Go plain-text handler (currently `devops/nginx/nginx.conf:36-42` → `app:8080`, which returns `Hredoy Portfolio backend is running.`).

---

## 9. Quick reference — section map

| # | Section | Selector | Lines | id |
|---|---|---|---|---|
| — | Search overlay | `.at-search-form-toggle` | 9-73 | — |
| — | Header / nav | `.header-7` | 74-209 | — |
| — | Offcanvas 1 | `.at-offcanvas-area` | 210-290 | — |
| — | Offcanvas 2 | `.at-offcanvas-2-area` | 292-338 | — |
| 1 | Hero | `.sec-1-home-7` | 349-485 | — |
| 2 | About | `.sec-2-home-7` | 486-595 | `#about` |
| 3 | About slider | `.home-2-section-8` | 596-627 | — |
| 4 | My Mission | `.sec-4-home-7` | 628-688 | — |
| 5 | Skills | `.sec-5-home-7` | 689-864 | `#skills` |
| 6 | My Journey / Process | `.sec-6-home-7` | 865-966 | — |
| 7 | CTA banner | `.sec-7-home-7` | 967-1032 | — |
| 8 | Who I Am | `.sec-8-home-7` | 1033-1109 | — |
| 9 | Tech marquee | `.sec-9-home-7` | 1110-1215 | — |
| 10 | Featured Projects | `.sec-10-home-7` | 1216-1362 | `#projects` |
| 11 | Contact | `.sec-11-home-7` | 1363-1414 | `#contact` |
| — | Footer | `.footer-7` | 1417-1603 | — |
| — | Back to top | `.back-to-top-wrapper` | 1606-1615 | — |

---

*End of audit. No project files were modified; this document is the only file created.*