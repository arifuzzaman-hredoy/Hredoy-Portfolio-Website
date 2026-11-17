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

/**
 * Apply CMS content values and project overrides to the template HTML.
 *
 * Values that are missing or equal to the manifest default leave the markup
 * untouched, so the static render is always the fallback.
 */
export function applyCMSContent(
  html: string,
  content: ContentMap,
  defaults: ContentMap = {},
  projects: Project[] = [],
): string {
  let out = html;
  for (const rule of RULES) {
    out = applyRule(out, rule, content, defaults);
  }
  out = applyProjects(out, projects);
  return out;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

/**
 * Replace an <img> src URL in template HTML using a unique anchor substring.
 * `anchor` is the substring that appears in the original tag; `replacement`
 * is what remains after removing the src attribute. The function injects
 * src="…" right after the anchor prefix (i.e. right after replacement).
 */
function replaceImageSrc(html: string, anchor: string, replacement: string, newUrl: string): string {
  const index = html.indexOf(anchor);
  if (index === -1) return html;
  const end = index + anchor.length;
  const before = html.slice(0, index);
  const after = html.slice(end);
  const injected = replacement ? `${replacement} src="${newUrl}"` : `src="${newUrl}"`;
  return before + injected + after;
}

/**
 * Apply CMS image URL overrides to template HTML. Only replaces an <img> src
 * when the CMS returns a URL that differs from the built-in default.
 */
export function applySiteImages(html: string, images: Record<string, string>): string {
  let out = html;
  for (const [key, swap] of Object.entries(IMAGE_SRC_SWAPS)) {
    const url = images[key]?.trim();
    if (!url) continue;
    if (url === SITE_IMAGE_DEFAULTS[key]) continue;
    out = replaceImageSrc(out, swap.anchor, swap.replacement, escapeHTML(url));
  }
  return out;
}

function renderFeaturedCard(project: Project): string {
  return (
    '                            <div class="blog-card col-lg-3 col-md-6 col-12 mb-30" data-category="">\n' +
    '                                <div class="blog-card__thumb hover-effect-1">\n' +
    `                                    <a href="${cmsUrl(project.repo_url, "#")}" target="_blank" rel="noopener" class="blog-card__img-link">\n` +
    `                                        <img src="${cmsUrl(getProjectImage(project), "/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg")}" class="blog-card__img22" alt="${escapeHTML(project.title)}" width="1600" height="1000">\n` +
    "                                    </a>\n" +
    "                                </div>\n" +
    '                                <div class="blog-card__content">\n' +
    '                                    <h2 class=" h6 blog-card__title">\n' +
    `                                        <a href="${cmsUrl(project.repo_url, "#")}" target="_blank" rel="noopener" class="blog-card__title-link">${escapeHTML(project.title)}</a>\n` +
    "                                    </h2>\n" +
    '                                    <p class="blog-card__meta">\n' +
    `                                        <span class="blog-card__meta-text">${escapeHTML(project.tech)}</span>\n` +
    "                                    </p>\n" +
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

  const cardsMatch = out.match(/<div class="row g-3 sec-10-home-7__grid">([\s\S]*?)<\/div>\s*<div class="sec-10-home-7__all mt-50">/);
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

// ---------------------------------------------------------------------------
// Site images
// ---------------------------------------------------------------------------

// Default image URLs used until the CMS row is populated. These mirror the
// paths currently hardcoded in HomeContent.tsx / layout.tsx.
export const SITE_IMAGE_DEFAULTS: Record<string, string> = {
  "brand-logo": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/logo/logo-white.png",
  "hero-portrait": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-13/Home-menu-pic.webp",
  "star-asterisk": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/star-asterisk.svg",
  "avatar-linux": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/hero-tools/linux.svg",
  "avatar-docker": "/assets/imgs/hero-tools/docker-v3.svg",
  "avatar-aws": "/assets/imgs/hero-tools/aws-v3.svg",
  "avatar-github-actions": "/assets/imgs/hero-tools/github-actions-v3.svg",
  "avatar-terraform": "/assets/imgs/hero-tools/terraform-v3.svg",
  "about-img-linux": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-linux.svg",
  "about-img-cloud": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cloud.svg",
  "about-img-cicd": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cicd.svg",
  "slider-1-linux": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-1-linux.svg",
  "slider-2-cloud": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-2-cloud.svg",
  "slider-3-cicd": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-3-cicd.svg",
  "slider-4-monitoring": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-4-monitoring.svg",
  "slider-5-security": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-5-security.svg",
  "mission-learning-path": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/mission-learning-path.svg",
  "skills-linux": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/skills-linux.svg",
  "process-1-fundamentals": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-1-fundamentals.svg",
  "process-2-practice": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-2-practice.svg",
  "process-3-projects": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-3-projects.svg",
  "process-4-improvement": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-4-improvement.svg",
  "cta-connect": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/cta-connect.svg",
  "cta-star": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-rotating.svg",
  "whoami-portrait": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/who-i-am-portrait.jpg",
  "og-image": "https://res.cloudinary.com/dvatduo79/image/upload/og/og-home.png",
  "favicon": "https://res.cloudinary.com/dvatduo79/image/upload/favicon.png",
  "apple-touch-icon": "https://res.cloudinary.com/dvatduo79/image/upload/apple-touch-icon.png",
  "mission-pin-icon": "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-4-pin-icon.svg",
};

// Map of CMS site_images key -> the unique surrounding substring used to swap
// an <img>'s src attribute value in the template HTML.
const IMAGE_SRC_SWAPS: Record<string, { anchor: string; replacement: string }> = {
  "brand-logo": {
    anchor: 'class="brand-logo" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/logo/logo-white.png"',
    replacement: 'class="brand-logo"',
  },
  "hero-portrait": {
    anchor: 'class="sec-1-home-7__img" width="1024" height="1053" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-13/Home-menu-pic.webp"',
    replacement: 'class="sec-1-home-7__img" width="1024" height="1053"',
  },
  "star-asterisk": {
    anchor: 'class="at-scroll-rotate" data-rotate-duration="18" data-rotate-sensitivity="0.18" data-rotate-boost="12" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/star-asterisk.svg"',
    replacement: 'class="at-scroll-rotate" data-rotate-duration="18" data-rotate-sensitivity="0.18" data-rotate-boost="12"',
  },
  "avatar-linux": {
    anchor: 'width="36" height="36" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/hero-tools/linux.svg" alt="Linux"',
    replacement: 'width="36" height="36" alt="Linux"',
  },
  "avatar-docker": {
    anchor: 'width="36" height="36" src="/assets/imgs/hero-tools/docker-v3.svg" alt="Docker"',
    replacement: 'width="36" height="36" alt="Docker"',
  },
  "avatar-aws": {
    anchor: 'width="36" height="36" src="/assets/imgs/hero-tools/aws-v3.svg" alt="AWS"',
    replacement: 'width="36" height="36" alt="AWS"',
  },
  "avatar-github-actions": {
    anchor: 'width="36" height="36" src="/assets/imgs/hero-tools/github-actions-v3.svg" alt="GitHub Actions"',
    replacement: 'width="36" height="36" alt="GitHub Actions"',
  },
  "avatar-terraform": {
    anchor: 'width="36" height="36" src="/assets/imgs/hero-tools/terraform-v3.svg" alt="Terraform"',
    replacement: 'width="36" height="36" alt="Terraform"',
  },
  "about-img-linux": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-linux.svg" alt="Linux terminal showing server commands" width="1000" height="1080"',
    replacement: 'alt="Linux terminal showing server commands" width="1000" height="1080"',
  },
  "about-img-cloud": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cloud.svg" alt="Cloud with server stack illustration" width="1000" height="1080"',
    replacement: 'alt="Cloud with server stack illustration" width="1000" height="1080"',
  },
  "about-img-cicd": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cicd.svg" alt="CI/CD pipeline stages illustration" width="1000" height="1080"',
    replacement: 'alt="CI/CD pipeline stages illustration" width="1000" height="1080"',
  },
  "slider-1-linux": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-1-linux.svg" alt="Linux server session"',
    replacement: 'alt="Linux server session"',
  },
  "slider-2-cloud": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-2-cloud.svg" alt="Cloud infrastructure"',
    replacement: 'alt="Cloud infrastructure"',
  },
  "slider-3-cicd": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-3-cicd.svg" alt="CI/CD pipeline"',
    replacement: 'alt="CI/CD pipeline"',
  },
  "slider-4-monitoring": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-4-monitoring.svg" alt="Monitoring dashboard chart"',
    replacement: 'alt="Monitoring dashboard chart"',
  },
  "slider-5-security": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-5-security.svg" alt="Security shield"',
    replacement: 'alt="Security shield"',
  },
  "mission-learning-path": {
    anchor: 'class="sec-4-home-7__img fix anim-zoomin" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/mission-learning-path.svg"',
    replacement: 'class="sec-4-home-7__img fix anim-zoomin"',
  },
  "skills-linux": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/skills-linux.svg" alt="Linux" class="w-100 h-100 object-fit-cover"',
    replacement: 'alt="Linux" class="w-100 h-100 object-fit-cover"',
  },
  "process-1-fundamentals": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-1-fundamentals.svg" alt="Learn Fundamentals"',
    replacement: 'alt="Learn Fundamentals"',
  },
  "process-2-practice": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-2-practice.svg" alt="Hands-on Practice"',
    replacement: 'alt="Hands-on Practice"',
  },
  "process-3-projects": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-3-projects.svg" alt="Project Development"',
    replacement: 'alt="Project Development"',
  },
  "process-4-improvement": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-4-improvement.svg" alt="Continuous Improvement"',
    replacement: 'alt="Continuous Improvement"',
  },
  "cta-connect": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/cta-connect.svg" alt="Network of DevOps tools connected around Hredoy"',
    replacement: 'alt="Network of DevOps tools connected around Hredoy"',
  },
  "cta-star": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-rotating.svg"',
    replacement: "",
  },
  "whoami-portrait": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/who-i-am-portrait.jpg"',
    replacement: "",
  },
  "mission-pin-icon": {
    anchor: 'src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-4-pin-icon.svg"',
    replacement: "",
  },
};
