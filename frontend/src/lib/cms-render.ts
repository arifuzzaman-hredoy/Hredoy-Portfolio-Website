// Pure, client-safe helpers that inject CMS-managed content into the original
// Orisa template markup. The HTML is treated as the source of truth and only
// the values that actually changed are substituted, so the default render is
// byte-for-byte identical to the template.

export type Project = {
  id: string;
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

// Single-line values that need an exact anchor (short or repeated strings).
type Anchor = {
  key: string;
  needle: string;
  wrap: (value: string) => string;
};

const ANCHORS: Anchor[] = [
  {
    key: "hero.headline.1",
    needle: '<span class="sec-1-home-7__headline-line">Junior</span>',
    wrap: (v) => `<span class="sec-1-home-7__headline-line">${v}</span>`,
  },
  {
    key: "hero.headline.2",
    needle: '<span class="sec-1-home-7__headline-line">DevOps</span>',
    wrap: (v) => `<span class="sec-1-home-7__headline-line">${v}</span>`,
  },
  {
    key: "hero.headline.3",
    needle: '<span class="sec-1-home-7__headline-line">Engineer</span>',
    wrap: (v) => `<span class="sec-1-home-7__headline-line">${v}</span>`,
  },
  {
    key: "stats.tools.value",
    needle: '<span class="odometer" data-count="20">0</span>',
    wrap: (v) => `<span class="odometer" data-count="${v}">0</span>`,
  },
  {
    key: "stats.projects.value",
    needle: '<span class="odometer" data-count="13">0</span>',
    wrap: (v) => `<span class="odometer" data-count="${v}">0</span>`,
  },
  {
    key: "stats.live.value",
    needle: '<span class="odometer" data-count="1">0</span>',
    wrap: (v) => `<span class="odometer" data-count="${v}">0</span>`,
  },
];

// Longer, unique text blocks matched with flexible whitespace so line wrapping
// and indentation in the template do not matter.
const PARAGRAPHS: { key: string; def: string }[] = [
  {
    key: "hero.desc",
    def: "I'm Arifuzzaman Hredoy, a Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. Continuously building practical projects and production-oriented engineering skills.",
  },
  {
    key: "stats.tools.label",
    def: "DevOps tools and technologies I practice",
  },
  {
    key: "stats.projects.label",
    def: "Hands-on DevOps projects on GitHub",
  },
  {
    key: "stats.live.label",
    def: "Live deployment on AWS EC2",
  },
  {
    key: "mission.text",
    def: "Continuously learning and building practical DevOps skills to become a professional DevOps Engineer.",
  },
  {
    key: "skills.desc",
    def: "Continuously learning and expanding my DevOps skillset across the modern cloud-native stack.",
  },
  {
    key: "process.desc",
    def: "How I'm growing into a DevOps Engineer, from fundamentals to hands-on projects.",
  },
  {
    key: "cta.desc",
    def: "I'm looking for a junior DevOps or cloud role where I can keep learning and contribute.",
  },
  {
    key: "projects.desc",
    def: "A selection of hands-on DevOps projects covering Linux, Docker, CI/CD, AWS, Terraform, Kubernetes, and DevSecOps.",
  },
  {
    key: "footer.tagline",
    def: "Junior DevOps Engineer · Cloud · Linux Admin",
  },
];

function escapeHTML(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Images live on Cloudinary. Older database rows may still store the legacy
// local path, so map those to the CDN transparently.
const CDN_BASE = "https://res.cloudinary.com/dvatduo79/image/upload";

function cdnUrl(value: string): string {
  if (!value) return "";
  if (value.startsWith("/assets/")) return `${CDN_BASE}${value}`;
  return value;
}

// Default (seeded) URLs for each site image slot. When the CMS returns a
// different URL for a slot, every occurrence of the default in the template
// markup is replaced. This keeps the static markup as the source of truth and
// makes the default render byte-for-byte identical when nothing changed.
const SITE_IMAGE_DEFAULTS: Record<string, string> = {
  "brand-logo":
    "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/brand-logo.png",
  "hero-portrait":
    "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-13/Home-menu-pic.webp",
  "avatar-linux":
    "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-1-linux.svg",
  "avatar-docker":
    "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-2-docker.svg",
  "avatar-aws":
    "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-3-aws.svg",
  "avatar-github-actions":
    "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-4-github-actions.svg",
  "avatar-terraform":
    "https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-5-terraform.svg",
};

// applySiteImages replaces hardcoded image URLs in the template markup with
// CMS-managed values. Only slots whose URL differs from the default are
// touched, so an unchanged CMS produces identical output.
export function applySiteImages(
  html: string,
  urls: Record<string, string>,
): string {
  let out = html;
  for (const [key, defaultUrl] of Object.entries(SITE_IMAGE_DEFAULTS)) {
    const cdn = urls[key];
    if (cdn && cdn !== defaultUrl) {
      out = out.split(defaultUrl).join(cdn);
    }
  }
  return out;
}

// Builds a whitespace-tolerant regex for a plain-text value as it appears in
// the (HTML-escaped) template markup.
function flexRegex(text: string): RegExp {
  const body = escapeHTML(text)
    .trim()
    .split(/\s+/)
    .map(escapeRegex)
    .join("\\s+");
  return new RegExp(body);
}

function renderProjectCard(project: Project): string {
  const title = escapeHTML(project.title);
  const tech = escapeHTML(project.tech);
  const repo = escapeHTML(project.repo_url || "#");
  const image = escapeHTML(cdnUrl(project.image_path));
  return `                            <div class="blog-card col-lg-3 col-md-6 col-12 mb-30" data-category="">
                                <div class="blog-card__thumb hover-effect-1">
                                    <a href="${repo}" target="_blank" rel="noopener" class="blog-card__img-link">
                                        <img src="${image}" class="blog-card__img22" alt="${title}" width="1600" height="1000">
                                    </a>
                                </div>
                                <div class="blog-card__content">
                                    <h2 class=" h6 blog-card__title">
                                        <a href="${repo}" target="_blank" rel="noopener" class="blog-card__title-link">${title}</a>
                                    </h2>
                                    <p class="blog-card__meta">
                                        <span class="blog-card__meta-text">${tech}</span>
                                    </p>
                                </div>
                            </div>`;
}

function renderProjectListItem(index: number, project: Project): string {
  const title = escapeHTML(project.title);
  const repo = escapeHTML(project.repo_url || "#");
  const live = project.live_url
    ? ` <a href="${escapeHTML(project.live_url)}" target="_blank" rel="noopener" style="color:var(--at-theme-primary);font-weight:600">Live</a>`
    : "";
  const number = String(index + 1).padStart(2, "0");
  return `                                <li><a href="${repo}" target="_blank" rel="noopener">${number}. ${title}</a>${live}</li>`;
}

function renderProjectList(projects: Project[]): string {
  const items = projects
    .map((project, index) => renderProjectListItem(index, project))
    .join("\n");
  return `                            <ul class="list-unstyled d-flex flex-wrap gap-3 mb-0">\n${items}\n                            </ul>`;
}

const GRID_OPEN = '<div class="row g-3 sec-10-home-7__grid">';
const ALL_OPEN = '<div class="sec-10-home-7__all mt-50">';
const LIST_OPEN = '<ul class="list-unstyled d-flex flex-wrap gap-3 mb-0">';

function applyProjects(html: string, projects: Project[]): string {
  if (projects.length === 0) return html;
  let out = html;

  const featured = projects.filter((p) => p.image_path).slice(0, 6);
  const cards = (featured.length > 0 ? featured : projects.slice(0, 6))
    .map(renderProjectCard)
    .join("\n");

  const gridStart = out.indexOf(GRID_OPEN);
  const allStart = out.indexOf(ALL_OPEN);
  if (gridStart !== -1 && allStart > gridStart) {
    const grid = `${GRID_OPEN}\n${cards}\n                        </div>`;
    out = out.slice(0, gridStart) + grid + out.slice(allStart);
  }

  const listStart = out.indexOf(LIST_OPEN);
  if (listStart !== -1) {
    const listEnd = out.indexOf("</ul>", listStart);
    if (listEnd !== -1) {
      out = out.slice(0, listStart) + renderProjectList(projects) + out.slice(listEnd + 5);
    }
  }

  out = out.replace(/All \d+ Projects/, `All ${projects.length} Projects`);
  return out;
}

export function applyCMSContent(
  html: string,
  content: Record<string, string>,
  projects: Project[] = [],
): string {
  let out = html;

  for (const anchor of ANCHORS) {
    const value = content[anchor.key];
    if (value === undefined || value === "") continue;
    if (out.includes(anchor.needle)) {
      out = out.replace(anchor.needle, anchor.wrap(escapeHTML(value)));
    }
  }

  for (const paragraph of PARAGRAPHS) {
    const value = content[paragraph.key];
    if (value === undefined || value === paragraph.def) continue;
    const re = flexRegex(paragraph.def);
    if (re.test(out)) {
      out = out.replace(re, escapeHTML(value));
    }
  }

  return applyProjects(out, projects);
}