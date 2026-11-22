// CMS rendering: map CMS content blocks onto the Orisa template HTML.
//
// The template markup in HomeContent.tsx is the source of truth for structure.
// This module replaces individual text nodes, element bodies and attribute
// values when the CMS returns a value that differs from the code-owned default
// (defaults come from the CMS manifest via /api/v1/content). When a value is
// missing or unchanged the markup is left byte-identical, so the static render
// is always the fallback.
//
// To make a new region editable, add one rule to RULES below and one entry to
// backend/internal/cmsgen/manifest.go. Nothing else needs to change.

export type Project = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  tech: string;
  repo_url: string;
  live_url: string;
  image_path: string;
  sort_order: number;
  published: boolean;
};

export const cmsUrl = (path: string, fallback: string): string => {
  const value = (path ?? "").trim();
  if (!value) return fallback;
  return /^(https?:)?\/\//i.test(value) ? value : fallback;
};

export function getProjectImage(project: Project): string {
  const candidate = (project.image_path ?? "").trim();
  if (!candidate) return "/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg";
  return cmsUrl(candidate, "/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg");
}

type ContentMap = Record<string, string | undefined>;

// ---------------------------------------------------------------------------
// Rule kinds
// ---------------------------------------------------------------------------

// exact: replace one literal string (an element with no inner markup).
type ExactRule = {
  kind: "exact";
  key: string;
  needle: string;
  wrap?: (value: string) => string;
};

// scoped: replace the first `max` occurrences of a literal string after a
// unique anchor. Used where the same label appears once per section.
type ScopedRule = {
  kind: "scoped";
  key: string;
  scope: string;
  needle: string;
  wrap?: (value: string) => string;
  max: number;
};

// element: replace the inner HTML between two unique markers. The opening
// marker is kept as-is.
type ElementRule = {
  kind: "element";
  key: string;
  open: string;
  close: string;
  wrap: (value: string) => string;
  // normalize lets a stored value be compared in a friendlier form (for
  // example stripping the quotation marks a previous seed stored).
  normalize?: (value: string) => string;
  // raw marks rules whose value is trusted HTML rather than plain text.
  raw?: boolean;
};

// prefix: replace everything from the start of `open` up to `close` (which is
// kept). Used for labels where the old text sits inside the opening marker,
// for example `<p class="mb-2">Email: `.
type PrefixRule = {
  kind: "prefix";
  key: string;
  open: string;
  close: string;
  wrap: (value: string) => string;
};

// list: replace the inner HTML of a container with one item per line.
type ListRule = {
  kind: "list";
  key: string;
  open: string;
  close: string;
  wrap: (items: string[]) => string;
};

type Rule = ExactRule | ScopedRule | ElementRule | PrefixRule | ListRule;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHTML(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

// breakable renders newlines as the template's responsive line break.
function breakable(brClass: string) {
  return (value: string): string =>
    escapeHTML(value).replace(/\n/g, ` <br class="${brClass}" />`);
}

function el(key: string, open: string, close: string, extra: Partial<ElementRule> = {}): ElementRule {
  const rule: ElementRule = { kind: "element", key, open, close, wrap: escapeHTML, ...extra };
  // A raw rule inserts the value verbatim (trusted HTML from the CMS).
  if (extra.raw && !extra.wrap) rule.wrap = (value: string) => value;
  return rule;
}

function exact(key: string, needle: string, wrap?: (value: string) => string): ExactRule {
  return { kind: "exact", key, needle, wrap };
}

function scoped(key: string, scope: string, needle: string, max = 3): ScopedRule {
  return { kind: "scoped", key, scope, needle, max };
}

const TAG_ARROW_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">\n' +
  '                                                    <path d="M5.62494 9.99994L0.562517 10L0.5625 8.75003L4.49994 8.74996L4.5 2.39273L2.27828 4.86124L1.48278 3.97739L5.0625 0L8.64225 3.97739L7.84676 4.86124L5.625 2.3927L5.62494 9.99994Z" fill="currentColor" />\n' +
  "                                                </svg>";

// Section anchors used to disambiguate repeated labels.
const SCOPE = {
  about: '<div class="sec-2-home-7 p-relative bg-neutral-0" id="about">',
  hero: '<div class="sec-1-home-7__cta d-flex align-items-center flex-wrap gap-2 mb-60">',
  mission: '<div class="sec-4-home-7 bg-neutral-50 pt-120 pb-120">',
  skills: '<div class="sec-5-home-7 bg-neutral-0 overflow-hidden" id="skills">',
  cta: '<div class="sec-7-home-7 overflow-hidden py-4">',
  whoami: '<div class="sec-8-home-7 p-relative bg-neutral-0">',
  contactForm: '<form class="sec-4-about-form sec-11-home-7__form" action="/contact" method="post">',
} as const;

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const RULES: Rule[] = [
  // --- SEO -----------------------------------------------------------------
  // seo.* is consumed by app/layout.tsx (generateMetadata), not by the body.

  // --- Navbar --------------------------------------------------------------
  exact("nav.home", '<li><a href="/">Home</a></li>', (v) => `<li><a href="/">${escapeHTML(v)}</a></li>`),
  exact("nav.skills", '<a href="#">Skills</a>', (v) => `<a href="#">${escapeHTML(v)}</a>`),
  exact("nav.projects", '<a href="#">Projects</a>', (v) => `<a href="#">${escapeHTML(v)}</a>`),
  exact("nav.contact", '<li><a href="#contact">Contact</a></li>', (v) => `<li><a href="#contact">${escapeHTML(v)}</a></li>`),
  exact("nav.group.core", '<span class="at-megamenu-title">Core DevOps</span>', (v) => `<span class="at-megamenu-title">${escapeHTML(v)}</span>`),
  exact("nav.group.cloud", '<span class="at-megamenu-title">Cloud &amp; Ops</span>', (v) => `<span class="at-megamenu-title">${escapeHTML(v)}</span>`),
  exact("nav.links", '<a href="#">Links</a>', (v) => `<a href="#">${escapeHTML(v)}</a>`),

  // --- Hero ----------------------------------------------------------------
  exact("hero.headline.1", '<span class="sec-1-home-7__headline-line">Junior</span>', (v) => `<span class="sec-1-home-7__headline-line">${escapeHTML(v)}</span>`),
  exact("hero.headline.2", '<span class="sec-1-home-7__headline-line">DevOps</span>', (v) => `<span class="sec-1-home-7__headline-line">${escapeHTML(v)}</span>`),
  exact("hero.headline.3", '<span class="sec-1-home-7__headline-line">Engineer</span>', (v) => `<span class="sec-1-home-7__headline-line">${escapeHTML(v)}</span>`),
  {
    kind: "list",
    key: "hero.brackets",
    open: '<ul class="sec-1-home-7__brackets list-unstyled d-flex flex-wrap gap-4 mb-30">',
    close: "</ul>",
    wrap: (items) =>
      items
        .map((v, i) => `                                        <li class="at_fade_anim" data-start="100%" data-delay="0.${i + 1}">[ ${escapeHTML(v)} ]</li>`)
        .join("\n"),
  },
  el("hero.desc", '<p class="sec-1-home-7__desc text-white mb-40 at_fade_anim" data-start="100%" data-delay="0.5">', "</p>"),
  scoped("hero.cta", SCOPE.hero, "Get In Touch", 3),
  el("hero.proof", '<p class="sec-1-home-7__proof-text text-white fw-700 mb-0 at_fade_anim" data-start="100%" data-delay="0.6">', "</p>", {
    wrap: breakable("d-none d-xl-inline"),
  }),
  {
    kind: "list",
    key: "hero.tags",
    open: '<div class="sec-1-home-7__tags">',
    close: "</div>",
    wrap: (items) =>
      items
        .map(
          (v, i) =>
            `                                            <a href="#skills" class="sec-1-home-7__tag at_fade_anim" data-start="100%" data-delay="0.${i + 1}">\n` +
            `                                                <span>${escapeHTML(v)}</span>\n` +
            `                                                ${TAG_ARROW_SVG}\n` +
            `                                            </a>`,
        )
        .join("\n"),
  },

  // --- About ---------------------------------------------------------------
  scoped("about.eyebrow", SCOPE.about, '<span class="text-scramble" data-scramble-text="About Me">About Me</span>', 1),
  el("about.headline", '<span class="sec-2-home-7__headline-strong reveal-text">', "</span>"),
  el("about.paragraph", '<p class="sec-2-home-7__desc mb-0  reveal-text">', "</p>", { raw: true }),
  exact(
    "about.feature.1.title",
    '<h3 class="sec-2-home-7__feature-title at-char-animation">Linux Administration</h3>',
    (v) => `<h3 class="sec-2-home-7__feature-title at-char-animation">${escapeHTML(v)}</h3>`,
  ),
  exact(
    "about.feature.1.desc",
    '<p class="sec-2-home-7__feature-desc mb-0 at_fade_anim">Managing and securing Linux servers, configuring services, and automating system tasks with Bash scripting.</p>',
    (v) => `<p class="sec-2-home-7__feature-desc mb-0 at_fade_anim">${escapeHTML(v)}</p>`,
  ),
  exact(
    "about.feature.2.title",
    '<h3 class="sec-2-home-7__feature-title at-char-animation">Cloud & AWS</h3>',
    (v) => `<h3 class="sec-2-home-7__feature-title at-char-animation">${escapeHTML(v)}</h3>`,
  ),
  exact(
    "about.feature.2.desc",
    '<p class="sec-2-home-7__feat-desc mb-0 at_fade_anim" data-delay="0.1">Deploying and managing cloud infrastructure on AWS, working with EC2, VPC, and IAM.</p>',
    (v) => `<p class="sec-2-home-7__feat-desc mb-0 at_fade_anim" data-delay="0.1">${escapeHTML(v)}</p>`,
  ),
  exact(
    "about.feature.3.title",
    '<h3 class="sec-2-home-7__feature-title at-char-animation">CI/CD & Automation</h3>',
    (v) => `<h3 class="sec-2-home-7__feature-title at-char-animation">${escapeHTML(v)}</h3>`,
  ),
  exact(
    "about.feature.3.desc",
    '<p class="sec-2-home-7__feature-desc mb-0 at_fade_anim">Building automated pipelines with GitHub Actions, Docker, and GHCR for continuous integration and delivery.</p>',
    (v) => `<p class="sec-2-home-7__feature-desc mb-0 at_fade_anim">${escapeHTML(v)}</p>`,
  ),

  // --- Stats ---------------------------------------------------------------
  // The odometer animates from the inner 0 to data-count, so only data-count
  // changes; the inner text stays 0 exactly like the template.
  exact(
    "stats.tools.value",
    '<span class="odometer" data-count="20">0</span>',
    (v) => `<span class="odometer" data-count="${escapeHTML(v)}">0</span>`,
  ),
  exact(
    "stats.projects.value",
    '<span class="odometer" data-count="13">0</span>',
    (v) => `<span class="odometer" data-count="${escapeHTML(v)}">0</span>`,
  ),
  exact(
    "stats.live.value",
    '<span class="odometer" data-count="1">0</span>',
    (v) => `<span class="odometer" data-count="${escapeHTML(v)}">0</span>`,
  ),
  exact(
    "stats.tools.label",
    '<p class="sec-2-home-7__stat-label mb-0 at_fade_anim">DevOps tools and technologies I practice</p>',
    (v) => `<p class="sec-2-home-7__stat-label mb-0 at_fade_anim">${escapeHTML(v)}</p>`,
  ),
  exact(
    "stats.projects.label",
    '<p class="sec-2-home-7__stat-label mb-0 at_fade_anim">Hands-on DevOps projects on GitHub</p>',
    (v) => `<p class="sec-2-home-7__stat-label mb-0 at_fade_anim">${escapeHTML(v)}</p>`,
  ),
  exact(
    "stats.live.label",
    '<p class="sec-2-home-7__stat-label mb-0 at_fade_anim">Live deployment on AWS EC2</p>',
    (v) => `<p class="sec-2-home-7__stat-label mb-0 at_fade_anim">${escapeHTML(v)}</p>`,
  ),

  // --- Mission -------------------------------------------------------------
  exact(
    "mission.eyebrow",
    '<span class="text-scramble" data-scramble-text="My Mission">My Mission</span>',
    (v) => `<span class="text-scramble" data-scramble-text="${escapeHTML(v)}">${escapeHTML(v)}</span>`,
  ),
  el("mission.text", '<span class="reveal-text sec-4-home-7__title-part sec-4-home-7__title-part--950">', "</span>"),
  scoped("mission.cta", SCOPE.mission, "Get In Touch", 3),
  exact(
    "mission.loc.title",
    '<h3 class="sec-4-home-7__loc-title h6 mb-3 at-char-animation">Location</h3>',
    (v) => `<h3 class="sec-4-home-7__loc-title h6 mb-3 at-char-animation">${escapeHTML(v)}</h3>`,
  ),
  exact("mission.loc.location", '<p class="mb-2">Rangpur, Bangladesh</p>', (v) => `<p class="mb-2">${escapeHTML(v)}</p>`),
  {
    kind: "prefix",
    key: "mission.loc.email_label",
    open: '<p class="mb-2">Email: ',
    close: '<a href="mailto:',
    wrap: (v) => `${escapeHTML(v)} `,
  },
  {
    kind: "prefix",
    key: "mission.loc.github_label",
    open: '<p class="mb-2">GitHub: ',
    close: '<a href="https://github.com/arifuzzaman-hredoy"',
    wrap: (v) => `${escapeHTML(v)} `,
  },
  exact(
    "mission.edu.degree",
    '<p class="mb-2">Diploma in Engineering — Computer Science &amp; Technology</p>',
    (v) => `<p class="mb-2">${escapeHTML(v)}</p>`,
  ),
  {
    kind: "element",
    key: "mission.edu.institute",
    open: '<p class="mb-2">Institute: <span class="sec-4-home-7__loc-strong">',
    close: "</span>",
    wrap: (v) => escapeHTML(v),
  },
  {
    kind: "element",
    key: "mission.edu.semester",
    open: '<p class="mb-2">Semester: <span class="sec-4-home-7__loc-strong">',
    close: "</span>",
    wrap: (v) => escapeHTML(v),
  },
  {
    kind: "element",
    key: "mission.edu.gpa",
    open: '<p class="mb-0">GPA: ',
    close: "</p>",
    wrap: (v) => escapeHTML(v),
  },

  // --- Skills --------------------------------------------------------------
  exact(
    "skills.eyebrow",
    '<span class="text-scramble" data-scramble-text="My Skills">My Skills</span>',
    (v) => `<span class="text-scramble" data-scramble-text="${escapeHTML(v)}">${escapeHTML(v)}</span>`,
  ),
  el("skills.title", '<h2 class="sec-5-home-7__title mb-4 mb-xl-5 reveal-text">', "</h2>"),
  el("skills.desc", '<h6 class="mb-4 mb-xl-5 reveal-text">', "</h6>"),
  scoped("skills.cta", SCOPE.skills, "Get In Touch", 3),

  // --- Process -------------------------------------------------------------
  exact(
    "process.eyebrow",
    '<span class="text-scramble" data-scramble-text="My Journey">My Journey</span>',
    (v) => `<span class="text-scramble" data-scramble-text="${escapeHTML(v)}">${escapeHTML(v)}</span>`,
  ),
  exact("process.title", '<h2 class="sec-6-home-7__title mb-0 reveal-text">The Process</h2>', (v) => `<h2 class="sec-6-home-7__title mb-0 reveal-text">${escapeHTML(v)}</h2>`),
  el("process.desc", '<p class="sec-6-home-7__desc text-lg-end mb-0 at_fade_anim">', "</p>"),

  // --- Call to action ------------------------------------------------------
  exact(
    "cta.eyebrow",
    '<span class="text-scramble" data-scramble-text="Looking for my first DevOps role">Looking for my first DevOps role</span>',
    (v) => `<span class="text-scramble" data-scramble-text="${escapeHTML(v)}">${escapeHTML(v)}</span>`,
  ),
  el("cta.desc", '<p class="sec-7-home-7__headline mb-4 mb-lg-40 reveal-text">', "</p>"),
  scoped("cta.cta", SCOPE.cta, "Get In Touch", 3),

  // --- Who I Am ------------------------------------------------------------
  scoped("whoami.eyebrow", SCOPE.whoami, '<span class="text-scramble" data-scramble-text="About Me">About Me</span>', 1),
  el("whoami.title", '<h2 class="sec-8-home-7__heading mb-40 reveal-text">', "</h2>"),
  el("whoami.paragraph", '<p class="sec-8-home-7__desc mb-4 reveal-text">', "</p>", { raw: true }),
  {
    kind: "element",
    key: "whoami.quote",
    open: '<p class="sec-8-home-7__desc mb-40 reveal-text">',
    close: "</p>",
    wrap: (v) => `<strong>"${escapeHTML(v)}"</strong>`,
    normalize: (v) => v.replace(/^"([\s\S]*)"$/, "$1").trim(),
  },
  el("whoami.name", '<h3 class="sec-8-home-7__name mb-0 at_fade_anim">', "</h3>"),
  exact(
    "whoami.role",
    '<p class="sec-8-home-7__role mb-0 at_fade_anim" data-delay="0.1">Junior DevOps Engineer</p>',
    (v) => `<p class="sec-8-home-7__role mb-0 at_fade_anim" data-delay="0.1">${escapeHTML(v)}</p>`,
  ),
  scoped("whoami.cta", SCOPE.whoami, "Get In Touch", 3),

  // --- Projects ------------------------------------------------------------
  exact(
    "projects.eyebrow",
    '<span class="text-scramble" data-scramble-text="Projects">Projects</span>',
    (v) => `<span class="text-scramble" data-scramble-text="${escapeHTML(v)}">${escapeHTML(v)}</span>`,
  ),
  el("projects.title", '<h2 class="sec-10-home-7__title mb-0 reveal-text">', "</h2>", {
    wrap: breakable("d-none d-sm-inline"),
  }),
  el("projects.desc", '<p class="sec-10-home-7__lead mb-0 reveal-text">', "</p>"),
  scoped("projects.cta", '<div class="col-xl-3 col-lg-12 mt-4 mt-lg-4 mt-xl-0 ms-xl-auto text-xl-end">', "All Projects", 1),

  // --- Contact -------------------------------------------------------------
  exact(
    "contact.eyebrow",
    '<span class="text-scramble" data-scramble-text="Contact Me">Contact Me</span>',
    (v) => `<span class="text-scramble" data-scramble-text="${escapeHTML(v)}">${escapeHTML(v)}</span>`,
  ),
  exact("contact.title", '<h2 class="sec-11-home-7__title mb-0 reveal-text">Get in touch</h2>', (v) => `<h2 class="sec-11-home-7__title mb-0 reveal-text">${escapeHTML(v)}</h2>`),
  el("contact.note", '<p class="sec-4-about-form__disclaimer at_fade_anim" data-delay="0.1">', "</p>"),
  scoped("contact.button", SCOPE.contactForm, "Send Message", 2),
  exact("contact.form.name", 'placeholder="Your name *"', (v) => `placeholder="${escapeHTML(v)} *"`),
  exact("contact.form.name", 'aria-label="Your name"', (v) => `aria-label="${escapeHTML(v)}"`),
  exact("contact.form.email", 'placeholder="Your email *"', (v) => `placeholder="${escapeHTML(v)} *"`),
  exact("contact.form.email", 'aria-label="Your email"', (v) => `aria-label="${escapeHTML(v)}"`),
  exact("contact.form.subject", 'placeholder="Your subject *"', (v) => `placeholder="${escapeHTML(v)} *"`),
  exact("contact.form.subject", 'aria-label="Your subject"', (v) => `aria-label="${escapeHTML(v)}"`),
  exact("contact.form.message", 'placeholder="Your message *"', (v) => `placeholder="${escapeHTML(v)} *"`),
  exact("contact.form.message", 'aria-label="Your message"', (v) => `aria-label="${escapeHTML(v)}"`),

  // --- Footer --------------------------------------------------------------
  exact("footer.tagline", '<p class="footer-7__contact-line mb-0 at_fade_anim" data-delay="0.3">Junior DevOps Engineer · Cloud · Linux Admin</p>', (v) => `<p class="footer-7__contact-line mb-0 at_fade_anim" data-delay="0.3">${escapeHTML(v)}</p>`),
  exact("footer.open", '<p class="footer-7__hours-label mb-1">Open to</p>', (v) => `<p class="footer-7__hours-label mb-1">${escapeHTML(v)}</p>`),
  exact("footer.open_detail", '<p class="footer-7__hours-value mb-0">Remote · Junior &amp; Intern roles · Immediate</p>', (v) => `<p class="footer-7__hours-value mb-0">${escapeHTML(v)}</p>`),
  exact("footer.subscribe", '<p class="footer-7__newsletter-title mb-3 at_fade_anim" data-delay="0.1">Get updates on my new projects</p>', (v) => `<p class="footer-7__newsletter-title mb-3 at_fade_anim" data-delay="0.1">${escapeHTML(v)}</p>`),
  exact("footer.big_word", '<h2 class="footer-7__word fw-900 mb-0 text-scale-anim" aria-hidden="true">DEVOPS ENGINEER</h2>', (v) => `<h2 class="footer-7__word fw-900 mb-0 text-scale-anim" aria-hidden="true">${escapeHTML(v)}</h2>`),
  // The year is appended by the template, so only the name is replaced.
  exact("footer.copyright", '<span class="footer-7__copy">Arifuzzaman Hredoy © ', (v) => `<span class="footer-7__copy">${escapeHTML(v)} © `),
];

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------

function replaceExact(html: string, needle: string, replacement: string): string {
  const index = html.indexOf(needle);
  if (index === -1) return html;
  return html.slice(0, index) + replacement + html.slice(index + needle.length);
}

function replaceScoped(html: string, scope: string, needle: string, replacement: string, max: number): string {
  const scopeIndex = html.indexOf(scope);
  if (scopeIndex === -1) return html;

  let out = html;
  let from = scopeIndex;
  let count = 0;
  while (count < max) {
    const index = out.indexOf(needle, from);
    if (index === -1) break;
    out = out.slice(0, index) + replacement + out.slice(index + needle.length);
    from = index + replacement.length;
    count++;
  }
  return out;
}

function replaceElement(html: string, open: string, close: string, inner: string): string {
  const startIndex = html.indexOf(open);
  if (startIndex === -1) return html;
  const contentStart = startIndex + open.length;
  const endIndex = html.indexOf(close, contentStart);
  if (endIndex === -1) return html;
  return html.slice(0, contentStart) + inner + html.slice(endIndex);
}

// replacePrefix keeps the opening tag of `open` (up to and including its ">")
// and replaces everything up to `close`, which is kept.
function replacePrefix(html: string, open: string, close: string, inner: string): string {
  const startIndex = html.indexOf(open);
  if (startIndex === -1) return html;
  const tagEnd = html.indexOf(">", startIndex);
  if (tagEnd === -1) return html;
  const contentStart = tagEnd + 1;
  const endIndex = html.indexOf(close, contentStart);
  if (endIndex === -1) return html;
  return html.slice(0, contentStart) + inner + html.slice(endIndex);
}

function applyRule(html: string, rule: Rule, values: ContentMap, defaults: ContentMap): string {
  const raw = values[rule.key];
  if (raw === undefined || raw === "") return html;

  const fallback = defaults[rule.key];
  const value = rule.kind === "element" && rule.normalize ? rule.normalize(raw) : raw;

  if (fallback !== undefined) {
    const unchanged =
      rule.kind === "element" || rule.kind === "prefix" ? collapse(value) === collapse(fallback) : value === fallback;
    if (unchanged) return html;
  }

  switch (rule.kind) {
    case "exact":
      return replaceExact(html, rule.needle, (rule.wrap ?? escapeHTML)(value));
    case "scoped":
      return replaceScoped(html, rule.scope, rule.needle, escapeHTML(value), rule.max);
    case "element":
      return replaceElement(html, rule.open, rule.close, rule.wrap(value));
    case "prefix":
      return replacePrefix(html, rule.open, rule.close, rule.wrap(value));
    case "list":
      return replaceElement(html, rule.open, rule.close, rule.wrap(value.split("\n").map((item) => item.trim()).filter(Boolean)));
  }
}

// Owner details exactly as they appear in the template markup. These mirror the
// seed in database/migrations/002_seed_site_settings.up.sql, so a setting the
// owner has not touched is a no-op and the render stays byte-identical.
const IDENTITY_DEFAULTS = {
  owner_name: "Arifuzzaman Hredoy",
  role: "Junior DevOps Engineer",
  email: "arifuzzamanhredoy@gmail.com",
  github: "https://github.com/arifuzzaman-hredoy",
  linkedin: "https://www.linkedin.com/in/arifuzzaman-hredoy/",
  location: "Rangpur, Bangladesh",
  bio: "Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. I build reliable, automated, production-ready systems.",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// "https://www.linkedin.com/in/user/" -> "linkedin.com/in/user"
function bareHost(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}

/**
 * Rewrite a profile URL wherever it appears. Inside href="..." the match is
 * preceded by the opening quote, so the full URL is used there; in visible text
 * the scheme-free form reads better. The match stops at the profile itself, so
 * repository links that carry a "/<repo>" suffix are never rewritten.
 */
function replaceProfileLink(html: string, defaultUrl: string, value: string): string {
  const host = escapeRegExp(bareHost(defaultUrl));
  const pattern = new RegExp(
    `(?:https?:\\/\\/)?(?:www\\.)?${host}(?:\\/(?![\\w-])|(?![\\/\\w-]))`,
    "g",
  );

  return html.replace(pattern, (_match, offset: number) => {
    const inAttribute = html[offset - 1] === '"';
    return escapeHTML(inAttribute ? value : bareHost(value));
  });
}

/**
 * Replace the hardcoded owner details with the values from site_settings. Only
 * applied when a value differs from the built-in default, so the render stays
 * byte-identical until the owner edits a setting.
 */
export function applyIdentity(html: string, identity: Record<string, string>): string {
  let out = html;

  const put = (key: keyof typeof IDENTITY_DEFAULTS, value: string | undefined) => {
    const next = value?.trim();
    if (!next || next === IDENTITY_DEFAULTS[key]) return;
    out = out.split(IDENTITY_DEFAULTS[key]).join(escapeHTML(next));
  };

  put("owner_name", identity.owner_name);
  put("role", identity.role);
  put("location", identity.location);
  put("bio", identity.bio);
  put("email", identity.email);

  const github = identity.github?.trim();
  if (github && github !== IDENTITY_DEFAULTS.github) {
    out = replaceProfileLink(out, IDENTITY_DEFAULTS.github, github);
  }

  const linkedin = identity.linkedin?.trim();
  if (linkedin && linkedin !== IDENTITY_DEFAULTS.linkedin) {
    out = replaceProfileLink(out, IDENTITY_DEFAULTS.linkedin, linkedin);
  }

  return out;
}

/**
 * Apply CMS content values, owner identity and project overrides to the
 * template HTML.
 *
 * Values that are missing or equal to the manifest default leave the markup
 * untouched, so the static render is always the fallback.
 */
export function applyCMSContent(
  html: string,
  content: ContentMap,
  defaults: ContentMap = {},
  projects: Project[] = [],
  identity: Record<string, string> = {},
): string {
  let out = applyIdentity(html, identity);
  for (const rule of RULES) {
    out = applyRule(out, rule, content, defaults);
  }
  out = applyProjects(out, projects);
  return out;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

// Default URL of every CMS-managed image slot, exactly as it appears in the
// template markup. Keys match the site_images table so the admin screen and the
// renderer always agree on which slot is which. Slots that render no <img>
// (favicon, og-image, apple-touch-icon) are metadata and are not listed here.
export const SITE_IMAGE_DEFAULTS: Record<string, string> = {
  "brand-logo": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/brand-logo.png",
  "hero-portrait": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-13/Home-menu-pic.webp",
  "hero-badge-docker": "/assets/imgs/hero-tools/docker-v3.svg",
  "hero-badge-kubernetes": "/assets/imgs/hero-tools/kubernetes-v3.svg",
  "hero-badge-aws": "/assets/imgs/hero-tools/aws-v3.svg",
  "hero-badge-terraform": "/assets/imgs/hero-tools/terraform-v3.svg",
  "hero-badge-grafana": "/assets/imgs/hero-tools/grafana-v3.svg",
  "star-asterisk": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/star-asterisk.svg",
  "avatar-linux": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-1-linux.svg",
  "avatar-docker": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-2-docker.svg",
  "avatar-aws": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-3-aws.svg",
  "avatar-github-actions": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-4-github-actions.svg",
  "avatar-terraform": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-5-terraform.svg",
  "about-linux": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-linux.svg",
  "about-cloud": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cloud.svg",
  "about-cicd": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cicd.svg",
  "slider-1-linux": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-1-linux.svg",
  "slider-2-cloud": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-2-cloud.svg",
  "slider-3-cicd": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-3-cicd.svg",
  "slider-4-monitoring": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-4-monitoring.svg",
  "slider-5-security": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-5-security.svg",
  "mission-learning-path": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/mission-learning-path.svg",
  "skills-linux": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/skills-linux.svg",
  "technical-skills": "/assets/imgs/portfolio/sections/technical-skills.svg",
  "process-1-fundamentals": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-1-fundamentals.svg",
  "process-2-practice": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-2-practice.svg",
  "process-3-projects": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-3-projects.svg",
  "process-4-improvement": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-4-improvement.svg",
  "project-automated-cicd-pipeline": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/automated-cicd-pipeline.svg",
  "project-aws-cloud-infrastructure-ec2": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/aws-cloud-infrastructure-ec2.svg",
  "project-devsecops-monitoring-kubernetes": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg",
  "project-docker-compose-multi-tier": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/docker-compose-multi-tier.svg",
  "project-nginx-reverse-proxy-domain-ssl": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/nginx-reverse-proxy-domain-ssl.svg",
  "project-terraform-infrastructure-as-code": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/terraform-infrastructure-as-code.svg",
  "cta-connect": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/cta-connect.svg",
  "who-i-am-portrait": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/who-i-am-portrait.jpg",
  "sec7-rotating": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-rotating.svg",
  "sec4-pin-icon": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-4-pin-icon.svg",
  "marquee-star": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg",
  "sec7-plus": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-plus.svg",
  "sec7-btn-arrow": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-btn-arrow.svg",
  "sec7-eyebrow-arrow": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-eyebrow-arrow.svg",
};

// setImageAttr replaces or appends one attribute on an <img> tag. The
// replacement is a function so a value containing "$" is inserted literally.
function setImageAttr(tag: string, name: string, value: string): string {
  const pattern = new RegExp("\\s" + name + '="[^"]*"');
  if (pattern.test(tag)) return tag.replace(pattern, () => " " + name + '="' + value + '"');
  return tag.replace(/\s*\/?>$/, (closing) => " " + name + '="' + value + '"' + closing);
}

const CLOUDINARY_UPLOAD = "/image/upload/";

/**
 * Ask Cloudinary for WebP instead of the stored JPEG. Only <img> sources are
 * rewritten, so favicons and og:image keep their PNG. Logos, SVGs and images
 * that are already WebP are left alone: they are small, or re-encoding them
 * costs visible quality.
 */
function optimizeCloudinaryImg(tag: string): string {
  const src = tag.match(/\ssrc="([^"]*)"/)?.[1];
  if (!src) return tag;
  if (!/^https?:\/\/res\.cloudinary\.com\//i.test(src)) return tag;

  const at = src.indexOf(CLOUDINARY_UPLOAD);
  if (at < 0) return tag;
  const rest = src.slice(at + CLOUDINARY_UPLOAD.length);
  if (rest.includes(",")) return tag;
  if (!/\.jpe?g$/i.test(rest)) return tag;

  const optimized = src.slice(0, at + CLOUDINARY_UPLOAD.length) + "f_webp,q_auto:best/" + rest;
  return tag.replace(/\ssrc="[^"]*"/, () => ' src="' + optimized + '"');
}

/**
 * Breakpoint (inclusive) below which a mobile variant image is used.
 * Slots without a mobile variant always fall back to the primary image.
 */
const MOBILE_BREAKPOINT = 767;

/**
 * Apply CMS image URLs and alt text to template HTML. Each  is matched to
 * a site_images slot by the src it already has, so the admin screen and the
 * renderer cannot drift apart. A slot is only rewritten when the CMS value
 * differs from the template default, which keeps the render byte-identical
 * until an admin edits something.
 *
 * An empty alt never overrides the markup: decorative images are better served
 * by the template's own alt than by a blank CMS field.
 *
 * When a slot has a mobile variant, the  is wrapped in a <picture> with a
 * <source media="(max-width: 767px)"> so browsers pick the mobile composition
 * at the appropriate breakpoint. Slots without a mobile variant render a plain
 *  exactly as before.
 */
export function applySiteImages(
  html: string,
  images: Record<string, string>,
  alts: Record<string, string> = {},
  mobiles: Record<string, string> = {},
): string {
  const keyBySrc = new Map<string, string>();
  for (const [key, src] of Object.entries(SITE_IMAGE_DEFAULTS)) keyBySrc.set(src, key);

  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = tag.match(/\ssrc="([^"]*)"/)?.[1];
    if (!src) return optimizeCloudinaryImg(tag);
    const key = keyBySrc.get(src);
    if (!key) return optimizeCloudinaryImg(tag);

    let out = tag;

    const url = images[key]?.trim();
    if (url && url !== SITE_IMAGE_DEFAULTS[key]) {
      out = setImageAttr(out, "src", escapeHTML(url));
    }

    const alt = alts[key]?.trim();
    if (alt) {
      const current = out.match(/\salt="([^"]*)"/)?.[1];
      if (current !== escapeHTML(alt)) out = setImageAttr(out, "alt", escapeHTML(alt));
    }

    // Wrap in <picture> with a mobile source when a mobile variant exists.
    // Browsers use the <source> below the breakpoint, falling back to the
    // primary <img> above it and when no mobile variant is configured.
    const mobileUrl = mobiles[key]?.trim();
    if (mobileUrl) {
      const mobileSrc = escapeHTML(mobileUrl);
      out = `<picture><source media="(max-width: ${MOBILE_BREAKPOINT}px)" srcset="${mobileSrc}">${out}</picture>`;
    }

    return optimizeCloudinaryImg(out);
  });
}

// ---------------------------------------------------------------------------
// Repeatable lists (content_items)
//
// Every list on the page is one parent_key. Each renderer below rebuilds the
// inner HTML of its container from the stored rows. The container markup is
// never touched when the rebuilt HTML matches what is already there (whitespace
// ignored), so an untouched list stays byte-identical to the template.
// ---------------------------------------------------------------------------

export type ListItem = {
  title: string;
  body: string;
  meta: Record<string, string | string[]>;
  sort_order: number;
};

export type ContentGroups = Record<string, ListItem[]>;

const LIST_INDENT = "                                ";

function metaText(item: ListItem, key: string): string {
  const raw = item.meta?.[key];
  if (Array.isArray(raw)) return raw.join(", ");
  return typeof raw === "string" ? raw : "";
}

function metaList(item: ListItem, key: string): string[] {
  const raw = item.meta?.[key];
  if (Array.isArray(raw)) return raw.filter((v) => typeof v === "string");
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

// The template's own decorative SVGs. They are duplicated here so a rebuilt
// list carries exactly the same markup as the static page.
const FOOTER_ARROW_SVG =
  '<svg class="footer-7__nav-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">\n' +
  '                                    <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />\n' +
  "                                </svg>";

const ACC_PLUS_SVG =
  '<svg class="sec-5-home-7__acc-plus" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">\n' +
  '                                                        <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />\n' +
  "                                                    </svg>";

const MARQUEE_STAR =
  "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg";

// nthIndexOf returns the start of the nth (1-based) occurrence, or -1.
function nthIndexOf(html: string, needle: string, n: number): number {
  let from = 0;
  for (let i = 0; i < n; i++) {
    const at = html.indexOf(needle, from);
    if (at === -1) return -1;
    from = at + needle.length;
    if (i === n - 1) return at;
  }
  return -1;
}

// replaceInner swaps the HTML between `start` (just after an opening tag) and
// the next `close`. When the rebuilt HTML matches the current one the input is
// returned unchanged, which is what keeps the static render byte-identical.
function replaceInner(html: string, start: number, close: string, next: string): string {
  const end = html.indexOf(close, start);
  if (end === -1) return html;
  if (collapse(html.slice(start, end)) === collapse(next)) return html;
  return html.slice(0, start) + next + html.slice(end);
}

// replaceDivInner finds the </div> that closes the <div> opening at `start`,
// counting nesting so cards inside a container do not end it early.
function replaceDivInner(html: string, start: number, next: string): string {
  const tagRe = /<div\b|<\/div>/g;
  tagRe.lastIndex = start;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(html))) {
    if (match[0] !== "</div>") {
      depth++;
      continue;
    }
    depth--;
    if (depth === 0) {
      if (collapse(html.slice(start, match.index)) === collapse(next)) return html;
      return html.slice(0, start) + next + html.slice(match.index);
    }
  }
  return html;
}

function replaceAfterTag(
  html: string,
  anchorStart: number,
  open: string,
  close: string,
  next: string,
): string {
  const openAt = html.indexOf(open, anchorStart);
  if (openAt === -1) return html;
  return replaceInner(html, openAt + open.length, close, next);
}

function replaceAllTag(html: string, open: string, close: string, next: string): string {
  let out = html;
  for (let guard = 0; guard < 32; guard++) {
    const at = out.indexOf(open);
    if (at === -1) return out;
    const start = at + open.length;
    const end = out.indexOf(close, start);
    if (end === -1) return out;
    if (collapse(out.slice(start, end)) === collapse(next)) {
      // Already correct here: skip past this container so the next one is checked.
      const skip = end + close.length;
      const rest = replaceAllTag(out.slice(skip), open, close, next);
      return out.slice(0, skip) + rest;
    }
    out = out.slice(0, start) + next + out.slice(end);
  }
  return out;
}

// isExternal decides whether a rebuilt link needs target/rel, matching the
// template: absolute http(s) links open in a new tab, in-page anchors do not.
function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function linkAttrs(href: string): string {
  return isExternal(href) ? ' target="_blank" rel="noopener"' : "";
}

function renderHeroTags(items: ListItem[]): string {
  return items
    .map(
      (item, i) =>
        `${LIST_INDENT}<a href="#skills" class="sec-1-home-7__tag at_fade_anim" data-start="100%" data-delay="0.${i + 1}">\n` +
        `${LIST_INDENT}    <span>${escapeHTML(item.title)}</span>\n` +
        `${LIST_INDENT}    ${TAG_ARROW_SVG}\n` +
        `${LIST_INDENT}</a>`,
    )
    .join("\n");
}

function renderNavDropdown(items: ListItem[]): string {
  return items
    .map((item) => {
      const href = metaText(item, "href") || "#";
      return `${LIST_INDENT}    <li><a href="${escapeHTML(href)}"${linkAttrs(href)}>${escapeHTML(item.title)}</a></li>`;
    })
    .join("\n");
}

function renderSubmenu(items: ListItem[]): string {
  return items
    .map((item) => {
      const href = metaText(item, "href") || "#";
      return `${LIST_INDENT}    <li><a href="${escapeHTML(href)}"${linkAttrs(href)}>${escapeHTML(item.title)}</a></li>`;
    })
    .join("\n");
}

function renderAccordion(items: ListItem[]): string {
  return items
    .map((item, i) => {
      const n = i + 1;
      const open = i === 0;
      const tags = metaList(item, "tags");
      const tagRow = tags.length
        ? `\n${LIST_INDENT}                <div class="sec-5-home-7__tags d-flex flex-wrap gap-2 pt-4">\n` +
          tags
            .map((t) => `${LIST_INDENT}                    <span class="sec-5-home-7__tag">${escapeHTML(t)}</span>`)
            .join("\n") +
          `\n${LIST_INDENT}                </div>`
        : "";
      return (
        `${LIST_INDENT}<div class="accordion-item sec-5-home-7__acc-item scroll-move-up">\n` +
        `${LIST_INDENT}    <h3 class="accordion-header" id="headingSec5H7${n}">\n` +
        `${LIST_INDENT}        <button class="accordion-button sec-5-home-7__acc-btn${open ? "" : " collapsed"}" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSec5H7${n}" aria-expanded="${open ? "true" : "false"}" aria-controls="collapseSec5H7${n}">\n` +
        `${LIST_INDENT}            <span class="sec-5-home-7__acc-title">${escapeHTML(item.title)}</span>\n` +
        `${LIST_INDENT}            <span class="sec-5-home-7__acc-toggle" aria-hidden="true">\n` +
        `${LIST_INDENT}                ${ACC_PLUS_SVG}\n` +
        `${LIST_INDENT}            </span>\n` +
        `${LIST_INDENT}        </button>\n` +
        `${LIST_INDENT}    </h3>\n` +
        `${LIST_INDENT}    <div id="collapseSec5H7${n}" class="accordion-collapse collapse${open ? " show" : ""}" data-bs-parent="#accordionSec5Home7">\n` +
        `${LIST_INDENT}        <div class="accordion-body sec-5-home-7__acc-body">\n` +
        `${LIST_INDENT}            <p class="sec-5-home-7__acc-text mb-0">${escapeHTML(item.body)}</p>${tagRow}\n` +
        `${LIST_INDENT}        </div>\n` +
        `${LIST_INDENT}    </div>\n` +
        `${LIST_INDENT}</div>`
      );
    })
    .join("\n");
}

function renderCapsules(items: ListItem[]): string {
  return items.map((item) => `${LIST_INDENT}    <li>${escapeHTML(item.title)}</li>`).join("\n");
}

function renderProcessChips(items: ListItem[]): string {
  return items
    .map((item, i) => {
      // The staircase only offsets chips after the first; the template carries
      // that as data-fade-offset.
      const offset = i === 0 ? "" : ' data-fade-offset="100"';
      return (
        `${LIST_INDENT}    <span class="sec-6-home-7__chip sec-6-home-7__chip--${i + 1} at_fade_anim"${offset} data-delay="0.${i + 1}">\n` +
        `${LIST_INDENT}        <span class="sec-6-home-7__chip-text">${escapeHTML(item.title)}</span>\n` +
        `${LIST_INDENT}    </span>`
      );
    })
    .join("\n");
}

function renderProcessCards(items: ListItem[]): string {
  return items
    .map((item, i) => {
      const delay = metaText(item, "delay") || `0.${i * 2 + 1}`;
      const image = metaText(item, "image");
      const alt = metaText(item, "image_alt") || item.title;
      const media = image
        ? `\n${LIST_INDENT}            <div class="sec-6-home-7__card-media">\n` +
          `${LIST_INDENT}                <img src="${escapeHTML(image)}" alt="${escapeHTML(alt)}" width="1200" height="900" />\n` +
          `${LIST_INDENT}            </div>`
        : "";
      return (
        `${LIST_INDENT}    <div class="sec-6-home-7__card-wrap at_fade_anim" data-delay="${escapeHTML(delay)}">\n` +
        `${LIST_INDENT}        <div class="sec-6-home-7__card">\n` +
        `${LIST_INDENT}            <div class="sec-6-home-7__card-body">\n` +
        `${LIST_INDENT}                <p class="sec-6-home-7__card-num mb-0">[${String(i + 1).padStart(2, "0")}]</p>\n` +
        `${LIST_INDENT}                <h3 class="sec-6-home-7__card-title mb-0">${escapeHTML(item.title)}</h3>\n` +
        `${LIST_INDENT}                <p class="sec-6-home-7__card-desc mb-0">\n` +
        `${LIST_INDENT}                    ${escapeHTML(item.body)}\n` +
        `${LIST_INDENT}                </p>\n` +
        `${LIST_INDENT}            </div>${media}\n` +
        `${LIST_INDENT}        </div>\n` +
        `${LIST_INDENT}    </div>`
      );
    })
    .join("\n\n");
}

function renderMarqueeItems(items: ListItem[]): string {
  const row = items
    .map(
      (item) =>
        `${LIST_INDENT}    <li class="sec-9-home-7__item">${escapeHTML(item.title)}</li>\n` +
        `${LIST_INDENT}    <li class="sec-9-home-7__sep"><img src="${MARQUEE_STAR}" alt="" /></li>`,
    )
    .join("\n");
  return row;
}

function renderCtaFeatures(items: ListItem[]): string {
  return items
    .map(
      (item, i) =>
        `${LIST_INDENT}    <li class="sec-7-home-7__feature at_fade_anim" data-delay="0.${i + 1}">\n` +
        `${LIST_INDENT}        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-plus.svg" alt="" width="18" height="18" aria-hidden="true" />\n` +
        `${LIST_INDENT}        <span>${escapeHTML(item.title)}</span>\n` +
        `${LIST_INDENT}    </li>`,
    )
    .join("\n");
}

function renderFooterNav(items: ListItem[]): string {
  return items
    .map((item, i) => {
      const href = metaText(item, "href") || "#";
      const current = href === "/" ? ' aria-current="page"' : "";
      return (
        `${LIST_INDENT}    <a class="footer-7__nav-link at_fade_anim" data-delay="0.${i + 1}" href="${escapeHTML(href)}"${current}>\n` +
        `${LIST_INDENT}        <span>${escapeHTML(item.title)}</span>\n` +
        `${LIST_INDENT}        ${FOOTER_ARROW_SVG}\n` +
        `${LIST_INDENT}    </a>`
      );
    })
    .join("\n");
}

const SOCIAL_ICONS: Record<string, string> = {
  github: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z\" fill=\"currentColor\"/></svg>",
  linkedin: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" fill=\"none\" aria-hidden=\"true\"><path d=\"M15.3352 15.339H12.6697V11.1622C12.6697 10.1662 12.6495 8.8845 11.2807 8.8845C9.89102 8.8845 9.67872 9.9683 9.67872 11.0887V15.339H7.01322V6.75H9.57372V7.9207H9.60822C9.96602 7.2457 10.836 6.53325 12.1357 6.53325C14.8365 6.53325 15.336 8.3108 15.336 10.6245L15.3352 15.339ZM4.00275 5.57475C3.14475 5.57475 2.4555 4.88025 2.4555 4.026C2.4555 3.1725 3.1455 2.47875 4.00275 2.47875C4.85775 2.47875 5.55075 3.1725 5.55075 4.026C5.55075 4.88025 4.857 5.57475 4.00275 5.57475ZM5.33925 15.339H2.66625V6.75H5.33925V15.339ZM16.6687 0H1.32825C0.594 0 0 0.5805 0 1.29675V16.7033C0 17.4202 0.594 18 1.32825 18H16.6665C17.4 18 18 17.4202 18 16.7033V1.29675C18 0.5805 17.4 0 16.6665 0H16.6687Z\" fill=\"currentColor\"/></svg>",
  email: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M1.5 5.25A1.5 1.5 0 0 1 3 3.75h18a1.5 1.5 0 0 1 1.5 1.5v13.5A1.5 1.5 0 0 1 21 20.25H3A1.5 1.5 0 0 1 1.5 18.75V5.25zm2.2.5L12 12l8.3-6.25H3.7zM21 7.32l-8.4 6.3a1 1 0 0 1-1.2 0L3 7.32V18.75h18V7.32z\" fill=\"currentColor\"/></svg>",
  facebook: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.7-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z\" fill=\"currentColor\"/></svg>",
  instagram: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3zm6.9-11.2a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z\" fill=\"currentColor\"/></svg>",
};

const SOCIAL_ARROW =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M7.60201e-05 6.26559L0 2.03894e-05L1.49997 -4.58971e-07L1.50004 4.87322L9.12873 4.87329L6.16652 2.12355L7.22714 1.139L12 5.56948L7.22713 10L6.16652 9.01545L9.12876 6.26566L7.60201e-05 6.26559Z" fill="currentColor" /></svg>';

// socialLinkAttrs reuses the target/rel attributes the template already has on
// the nth social link. The markup is inconsistent (GitHub and LinkedIn open in
// place, Facebook and Instagram in a new tab), so preserving it per row is the
// only way a rebuilt list stays byte-identical.
function socialLinkAttrs(html: string, index: number): string {
  const anchor = html.indexOf('<div class="alt-footer-social-item">');
  if (anchor === -1) return "";
  const open = '<ul class="list-unstyled mb-0">';
  const at = html.indexOf(open, anchor);
  if (at === -1) return "";
  const start = at + open.length;
  const end = html.indexOf("</ul>", start);
  if (end === -1) return "";
  const tags = html.slice(start, end).match(/<a\b[^>]*>/g) ?? [];
  const attrs = tags[index]?.match(/\s(?:target|rel)="[^"]*"/g);
  return attrs ? attrs.join("") : "";
}

function renderSocials(html: string, items: ListItem[]): string {
  return items
    .map((item, i) => {
      const href = metaText(item, "href") || "#";
      const icon = SOCIAL_ICONS[metaText(item, "icon")] ?? SOCIAL_ICONS.github;
      return (
        `${LIST_INDENT}    <li class="at_fade_anim" data-delay="0.${i + 1}">\n` +
        `${LIST_INDENT}        <a href="${escapeHTML(href)}"${socialLinkAttrs(html, i)} aria-label="${escapeHTML(item.title)}">\n` +
        `${LIST_INDENT}            <div class="d-flex align-items-center gap-2">\n` +
        `${LIST_INDENT}                <div class="icon-social">\n` +
        `${LIST_INDENT}                    ${icon}\n` +
        `${LIST_INDENT}                </div>\n` +
        `${LIST_INDENT}                ${escapeHTML(item.title)}\n` +
        `${LIST_INDENT}            </div>\n` +
        `${LIST_INDENT}            ${SOCIAL_ARROW}\n` +
        `${LIST_INDENT}        </a>\n` +
        `${LIST_INDENT}    </li>`
      );
    })
    .join("\n");
}

function renderFooterLinks(items: ListItem[]): string {
  return items
    .map((item) => {
      const href = metaText(item, "href") || "#";
      return `${LIST_INDENT}    <li><a href="${escapeHTML(href)}"${linkAttrs(href)}>${escapeHTML(item.title)}</a></li>`;
    })
    .join("\n");
}

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------

// Each entry knows how to locate its container and how to rebuild it. The
// anchor-based entries exist because two containers share a class and can only
// be told apart by what precedes them.
const LIST_RENDERERS: Record<string, (html: string, items: ListItem[]) => string> = {
  "hero.tags": (html, items) => {
    const open = '<div class="sec-1-home-7__tags">';
    const at = html.indexOf(open);
    if (at === -1) return html;
    return replaceInner(html, at + open.length, "</div>", renderHeroTags(items));
  },

  "nav.dropdown.core": (html, items) => {
    const box = nthIndexOf(html, '<div class="at-megamenu-box">', 1);
    if (box === -1) return html;
    return replaceAfterTag(html, box, "<ul>", "</ul>", renderNavDropdown(items));
  },

  "nav.dropdown.cloud": (html, items) => {
    const box = nthIndexOf(html, '<div class="at-megamenu-box">', 2);
    if (box === -1) return html;
    return replaceAfterTag(html, box, "<ul>", "</ul>", renderNavDropdown(items));
  },

  "nav.dropdown.projects": (html, items) => {
    const anchor = html.indexOf('<a href="#">Projects</a>');
    if (anchor === -1) return html;
    return replaceAfterTag(html, anchor, '<ul class="at-submenu submenu">', "</ul>", renderSubmenu(items));
  },

  "nav.dropdown.links": (html, items) => {
    const anchor = html.indexOf('<a href="#">Links</a>');
    if (anchor === -1) return html;
    return replaceAfterTag(html, anchor, '<ul class="at-submenu submenu">', "</ul>", renderSubmenu(items));
  },

  "skills.accordion": (html, items) => {
    const open = '<div class="accordion accordion-flush sec-5-home-7__accordion" id="accordionSec5Home7">';
    const at = html.indexOf(open);
    if (at === -1) return html;
    return replaceDivInner(html, at + open.length, renderAccordion(items));
  },

  "skills.throwables": (html, items) =>
    replaceFirst(html, '<ul class="visually-hidden tech-phys-a11y">', "</ul>", renderCapsules(items)),

  "process.chips": (html, items) =>
    replaceFirst(
      html,
      '<div class="sec-6-home-7__chips d-none d-lg-flex flex-column mb-80">',
      "</div>",
      renderProcessChips(items),
    ),

  "process.cards": (html, items) => {
    const open = '<div class="sec-6-home-7__cards pb-120">';
    const at = html.indexOf(open);
    if (at === -1) return html;
    return replaceDivInner(html, at + open.length, renderProcessCards(items));
  },

  "marquee.items": (html, items) => {
    // The ticker duplicates the row so the GSAP loop is seamless, and both
    // rows (left and right) carry the same doubled content.
    const row = renderMarqueeItems(items);
    const doubled = `${row}\n${row}`;
    const left = replaceAllTag(
      html,
      '<ul class="d-flex align-items-center gap-4 carouselTicker__list scroll-move-left list-unstyled mb-0 sec-9-home-7__list">',
      "</ul>",
      doubled,
    );
    return replaceAllTag(
      left,
      '<ul class="d-flex align-items-center gap-4 carouselTicker__list scroll-move-right list-unstyled mb-0 sec-9-home-7__list">',
      "</ul>",
      doubled,
    );
  },

  "cta.list": (html, items) =>
    replaceFirst(
      html,
      '<ul class="sec-7-home-7__features list-unstyled mb-4 mb-lg-60">',
      "</ul>",
      renderCtaFeatures(items),
    ),

  "footer.nav": (html, items) =>
    replaceFirst(html, '<nav class="footer-7__nav" aria-label="Footer navigation">', "</nav>", renderFooterNav(items)),

  "footer.socials": (html, items) => {
    const anchor = html.indexOf('<div class="alt-footer-social-item">');
    if (anchor === -1) return html;
    return replaceAfterTag(html, anchor, '<ul class="list-unstyled mb-0">', "</ul>", renderSocials(html, items));
  },

  "footer.links": (html, items) =>
    replaceFirst(
      html,
      '<ul class="footer-7__policies list-unstyled d-flex flex-wrap gap-3 mb-0">',
      "</ul>",
      renderFooterLinks(items),
    ),
};

// replaceFirst swaps the inner HTML of the first `open` ... `close` pair.
function replaceFirst(html: string, open: string, close: string, next: string): string {
  const at = html.indexOf(open);
  if (at === -1) return html;
  return replaceInner(html, at + open.length, close, next);
}

/**
 * Apply the repeatable homepage lists. A group that is missing, empty, or whose
 * rebuilt markup matches the container leaves the page untouched, so the static
 * template render stays the fallback.
 */
export function applyContentItems(html: string, groups: ContentGroups): string {
  let out = html;
  for (const [key, render] of Object.entries(LIST_RENDERERS)) {
    const items = groups[key];
    if (!items || items.length === 0) continue;
    const next = render(out, items);
    if (next !== out) out = next;
  }
  return out;
}

function renderFeaturedCard(project: Project): string {
  const viewLink = cmsUrl(project.live_url, cmsUrl(project.repo_url, "#"));
  return (
    '                            <div class="project-card col-lg-4 col-md-6 col-12 mb-0" data-category="">\n' +
    '                                <div class="card h-100 project-card-wrapper border-0 shadow-sm d-flex flex-column" style="min-height:480px;">\n' +
    '                                    <div class="blog-card__thumb hover-effect-1 project-thumb position-relative overflow-hidden" style="flex:0 0 65%;">\n' +
    `                                        <img src="${cmsUrl(getProjectImage(project), "/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg")}" class="project-img" alt="${escapeHTML(project.title)}" width="1600" height="800" style="width:100%;height:100%;object-fit:cover;display:block;">\n` +
    "                                    </div>\n" +
    '                                    <div class="blog-card__content p-4 d-flex flex-column" style="flex:1;">\n' +
    `                                        <h2 class=" h6 blog-card__title mb-2">${escapeHTML(project.title)}</h2>\n` +
    '                                        <p class="blog-card__meta mb-3">\n' +
    `                                            <span class="blog-card__meta-text">${escapeHTML(project.tech)}</span>\n` +
    "                                        </p>\n" +
    `                                        <a href="${viewLink}" target="_blank" rel="noopener" class="btn btn-primary mt-auto">View Project</a>\n` +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                            </div>"
  );
}

function renderAllProjectsLink(project: Project, index: number): string {
  const label = `${String(index + 1).padStart(2, "0")}. ${escapeHTML(project.title)}`;
  const repo = cmsUrl(project.repo_url, "#");
  const live = cmsUrl(project.live_url, "");
  const liveLink = live
    ? ` <a href="${live}" target="_blank" rel="noopener" style="color:var(--at-theme-primary);font-weight:600">Live</a>`
    : "";
  return `                                <li><a href="${repo}" target="_blank" rel="noopener">${label}</a>${liveLink}</li>`;
}

export function applyProjects(html: string, projects: Project[]): string {
  const visible = projects.filter((p) => p.published).sort((a, b) => a.sort_order - b.sort_order);
  if (visible.length === 0) return html;
  let out = html;

  const cardsMatch = out.match(/<div class="row g-4 sec-10-home-7__grid">([\s\S]*?)<\/div>\s*<div class="sec-10-home-7__all mt-50">/);
  if (cardsMatch) {
    const cards = visible
      .slice(0, 6)
      .map(renderFeaturedCard)
      .join("\n\n");
    out = out.replace(cardsMatch[1], `\n${cards}\n                        `);
  }

  const listMatch = out.match(/<h3 class="h6 mb-3">All 15 Projects<\/h3>/);
  if (listMatch) {
    out = out.replace(listMatch[0], `<h3 class="h6 mb-3">All ${visible.length} Projects</h3>`);
  }

  const ulPattern = /(<ul class="list-unstyled d-flex flex-wrap gap-3 mb-0">)([\s\S]*?)(<\/ul>)/;
  const ulMatch = out.match(ulPattern);
  if (ulMatch) {
    const items = visible.map(renderAllProjectsLink).join("\n");
    out = out.replace(ulMatch[2], `\n${items}\n                            `);
  }

  return out;
}
