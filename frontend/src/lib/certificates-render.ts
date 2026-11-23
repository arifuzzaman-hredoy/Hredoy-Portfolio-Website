// Public Certificates section: server-rendered markup plus the pure renderers
// the client controller reuses after every API query. Keeping the card and
// pagination rendering in one dependency-free module means the first render and
// the filtered renders cannot drift apart.

export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  course_name: string;
  credential_id: string;
  credential_url: string;
  image_path: string;
  pdf_path: string;
  description: string;
  issue_date: string;
  expiry_date: string | null;
  expired: boolean;
  category: string;
  skills: string[];
  featured: boolean;
  published: boolean;
  sort_order: number;
};

export type CertificatePage = {
  certificates: Certificate[];
  count: number;
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type CertificateFilters = {
  search: string;
  category: string;
  sort: string;
  page: number;
};

export const CERTIFICATES_PER_PAGE = 9;

export const CERTIFICATE_SORT_OPTIONS = [
  { value: "order", label: "Curated order" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A–Z" },
] as const;

const CONTACT_MARKER = "<!-- Home 7 Section 11 — Get in touch (contact form) -->";
const CONTACT_OPEN = '<div class="sec-11-home-7 pt-120 pb-120" id="contact">';

export function escapeText(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeAttr(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;");
}

// Certificate assets may be absolute (Cloudinary) or site-relative uploads.
export function certificateAssetUrl(raw: string, fallback = ""): string {
  const value = (raw ?? "").trim();
  if (!value) return fallback;
  if (/^(https?:)?\/\//i.test(value)) return value;
  if (value.startsWith("/")) return value;
  return fallback;
}

// Only an absolute web address can verify a credential.
export function certificateVerifyUrl(raw: string): string {
  const value = (raw ?? "").trim();
  return /^https?:\/\//i.test(value) ? value : "";
}

export function formatCertificateDate(value: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec((value ?? "").trim());
  if (!match) return "";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function dateRange(cert: Certificate): string {
  const issued = formatCertificateDate(cert.issue_date);
  const expires = cert.expiry_date ? formatCertificateDate(cert.expiry_date) : "";
  if (issued && expires) return `${issued} – ${expires}`;
  return issued || expires;
}

function cardImage(cert: Certificate): string {
  return certificateAssetUrl(cert.image_path, "");
}

function cardMeta(cert: Certificate): string {
  return [cert.issuer, cert.category].filter(Boolean).map(escapeText).join(" · ");
}

function statusLabel(cert: Certificate): string {
  if (cert.expired) return "Expired";
  if (cert.expiry_date) return "Valid";
  return "";
}

export function renderCertificateCard(cert: Certificate): string {
  const image = cardImage(cert);
  const thumb = image
    ? `                    <img src="${escapeAttr(image)}" class="blog-card__img22" alt="${escapeAttr(cert.title)} certificate" width="1600" height="1000" loading="lazy" decoding="async">`
    : `                    <span class="cert-card__noimg" aria-hidden="true">Certificate</span>`;
  const meta = cardMeta(cert);
  const range = dateRange(cert);
  const status = statusLabel(cert);
  const badges = [
    cert.featured ? '<span class="cert-card__badge">Featured</span>' : "",
    status ? `<span class="cert-card__badge cert-card__badge--${cert.expired ? "expired" : "valid"}">${status}</span>` : "",
  ]
    .filter(Boolean)
    .join("");
  const skills = (cert.skills ?? [])
    .slice(0, 3)
    .map((skill) => `<li class="cert-card__skill">${escapeText(skill)}</li>`)
    .join("");
  const verify = certificateVerifyUrl(cert.credential_url);
  const verifyLink = verify
    ? `                                    <a class="cert-card__verify" href="${escapeAttr(verify)}" target="_blank" rel="noopener noreferrer">Verify credential</a>\n`
    : "";

  return (
    '                            <div class="col-lg-4 col-md-6 col-12 mb-30" data-cert-card="' +
    escapeAttr(cert.id) +
    '">\n' +
    '                                <div class="blog-card certificates-card h-100 d-flex flex-column">\n' +
    '                                    <div class="blog-card__thumb hover-effect-1 certificates-card__thumb">\n' +
    `                                        <button type="button" class="blog-card__img-link cert-card__open" data-cert-open="${escapeAttr(cert.id)}" aria-label="View certificate: ${escapeAttr(cert.title)}">\n` +
    thumb +
    "\n" +
    "                                        </button>\n" +
    "                                    </div>\n" +
    '                                    <div class="blog-card__content certificates-card__content d-flex flex-column justify-content-between p-4 flex-grow-1">\n' +
    '                                        <div>\n' +
    (badges ? `                                            <p class="cert-card__badges mb-2">${badges}</p>\n` : "") +
    '                                            <h2 class="h6 blog-card__title mb-2">\n' +
    `                                                <button type="button" class="blog-card__title-link cert-card__open" data-cert-open="${escapeAttr(cert.id)}">${escapeText(cert.title)}</button>\n` +
    "                                            </h2>\n" +
    (meta ? `                                            <p class="blog-card__meta mb-2"><span class="blog-card__meta-text">${meta}</span></p>\n` : "") +
    (range ? `                                            <p class="cert-card__date mb-3">${escapeText(range)}</p>\n` : "") +
    "                                        </div>\n" +
    '                                        <div class="mt-auto">\n' +
    verifyLink +
    (skills ? `                                            <ul class="cert-card__skills list-unstyled d-flex flex-wrap gap-1 mb-0 mt-2">${skills}</ul>\n` : "") +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                            </div>"
  );
}

export function renderCertificateCards(certs: Certificate[]): string {
  return certs.map(renderCertificateCard).join("\n\n");
}

export function certificateStatusText(page: Pick<CertificatePage, "total" | "page" | "per_page" | "count">): string {
  if (page.total === 0) return "No certificates match your filters.";
  const start = (page.page - 1) * page.per_page + 1;
  const end = start + page.count - 1;
  return `Showing ${start}–${end} of ${page.total} certificates`;
}

function pageWindow(page: number, totalPages: number): number[] {
  const pages = new Set<number>([1, totalPages]);
  for (let i = page - 1; i <= page + 1; i += 1) pages.add(i);
  return [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
}

export function renderCertificatePagination(page: CertificatePage): string {
  if (page.total_pages <= 1) return "";
  const items: string[] = [];
  items.push(
    `<li><button type="button" class="cert-pagination__button" data-cert-page="${page.page - 1}"${page.page <= 1 ? " disabled" : ""} aria-label="Previous page">Prev</button></li>`,
  );
  let previous = 0;
  for (const value of pageWindow(page.page, page.total_pages)) {
    if (previous && value - previous > 1) items.push('<li class="cert-pagination__gap" aria-hidden="true">…</li>');
    const current = value === page.page;
    items.push(
      `<li><button type="button" class="cert-pagination__button${current ? " is-current" : ""}" data-cert-page="${value}"${current ? ' aria-current="page"' : ""} aria-label="Page ${value}">${value}</button></li>`,
    );
    previous = value;
  }
  items.push(
    `<li><button type="button" class="cert-pagination__button" data-cert-page="${page.page + 1}"${page.page >= page.total_pages ? " disabled" : ""} aria-label="Next page">Next</button></li>`,
  );
  return `<ul class="cert-pagination__list list-unstyled d-flex flex-wrap gap-2 mb-0">${items.join("")}</ul>`;
}

export function renderCertificateCategories(categories: string[]): string {
  return categories
    .filter(Boolean)
    .map((category) => `<option value="${escapeAttr(category)}">${escapeText(category)}</option>`)
    .join("");
}

function renderSortOptions(): string {
  return CERTIFICATE_SORT_OPTIONS.map(
    (option) => `<option value="${option.value}">${option.label}</option>`,
  ).join("");
}

function renderModal(): string {
  return [
    '                <dialog class="cert-modal" id="certificate-modal" aria-labelledby="cert-modal-title">',
    '                    <div class="cert-modal__panel">',
    '                        <div class="cert-modal__head">',
    '                            <p class="cert-modal__eyebrow mb-0" id="cert-modal-meta"></p>',
    '                            <h3 class="cert-modal__title" id="cert-modal-title"></h3>',
    '                            <button type="button" class="cert-modal__close" data-cert-close aria-label="Close certificate viewer">',
    '                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
    '                                    <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />',
    "                                </svg>",
    "                            </button>",
    "                        </div>",
    '                        <div class="cert-modal__body">',
    '                            <div class="cert-modal__media" id="cert-modal-media"></div>',
    '                            <div class="cert-modal__info">',
    '                                <dl class="cert-modal__facts mb-0" id="cert-modal-facts"></dl>',
    '                                <p class="cert-modal__description mb-0" id="cert-modal-description"></p>',
    '                                <ul class="cert-modal__skills list-unstyled d-flex flex-wrap gap-2 mb-0" id="cert-modal-skills"></ul>',
    '                                <div class="cert-modal__actions d-flex flex-wrap gap-2" id="cert-modal-actions"></div>',
    "                            </div>",
    "                        </div>",
    '                        <div class="cert-modal__foot">',
    '                            <button type="button" class="cert-modal__nav" data-cert-prev>Previous</button>',
    '                            <span class="cert-modal__count" id="cert-modal-count" aria-live="polite"></span>',
    '                            <button type="button" class="cert-modal__nav" data-cert-next>Next</button>',
    "                        </div>",
    "                    </div>",
    "                </dialog>",
  ].join("\n");
}

function renderStructuredData(certs: Certificate[]): string {
  const entries = certs
    .map((cert) => {
      const url = certificateVerifyUrl(cert.credential_url);
      if (!url) return null;
      return {
        "@type": "Certification",
        name: cert.title,
        description: cert.description || undefined,
        url,
        datePublished: cert.issue_date || undefined,
        expires: cert.expiry_date || undefined,
        issuer: { "@type": "Organization", name: cert.issuer || undefined },
      };
    })
    .filter(Boolean);

  if (entries.length === 0) return "";
  const payload = { "@context": "https://schema.org", "@graph": entries };
  return (
    '                <script type="application/ld+json">' +
    JSON.stringify(payload).replace(/</g, "\\u003c") +
    "</script>\n"
  );
}

function serializePage(page: CertificatePage, categories: string[]): string {
  return JSON.stringify({
    page: page.page,
    per_page: page.per_page,
    total: page.total,
    total_pages: page.total_pages,
    certificates: page.certificates,
    categories,
  }).replace(/</g, "\\u003c");
}

export function renderCertificatesSection(
  page: CertificatePage,
  categories: string[],
): string {
  if (page.total === 0 || page.certificates.length === 0) return "";

  return [
    "                <!--Certificates (CMS)—placed after Featured Projects-->",
    '                <div class="sec-10-home-7 certificates-cms bg-neutral-0 pt-120 pb-120" id="certificates">',
    '                    <div class="container-2200 px-lg-5 px-3">',
    '                        <div class="row align-items-end mb-50">',
    '                            <div class="col-xl-4 col-lg-4 col-12">',
    '                                <div class="sec-10-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase">',
    '                                    <span class="text-scramble" data-scramble-text="Certificates">Certificates</span>',
    '                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">',
    '                                        <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />',
    "                                    </svg>",
    "                                </div>",
    '                                <h2 class="sec-10-home-7__title mb-0 reveal-text">Verified <br class="d-none d-sm-inline" />Certificates</h2>',
    "                            </div>",
    '                            <div class="col-xl-5 col-lg-6 col-12 mt-4 mt-xl-0">',
    '                                <p class="sec-10-home-7__lead mb-0 reveal-text">',
    "                                    Courses, labs and credentials I completed, with the verification link and the document itself where available.",
    "                                </p>",
    "                            </div>",
    "                        </div>",
    '                        <div class="cert-toolbar d-flex flex-wrap align-items-center gap-3 mb-40">',
    '                            <label class="cert-toolbar__field" for="cert-search">',
    '                                <span class="visually-hidden">Search certificates</span>',
    '                                <input type="search" id="cert-search" class="cert-toolbar__input" placeholder="Search certificates" autocomplete="off" />',
    "                            </label>",
    '                            <label class="cert-toolbar__field" for="cert-category">',
    '                                <span class="visually-hidden">Filter by category</span>',
    '                                <select id="cert-category" class="cert-toolbar__select">',
    '                                    <option value="">All categories</option>',
    `                                    ${renderCertificateCategories(categories)}`,
    "                                </select>",
    "                            </label>",
    '                            <label class="cert-toolbar__field" for="cert-sort">',
    '                                <span class="visually-hidden">Sort certificates</span>',
    '                                <select id="cert-sort" class="cert-toolbar__select">',
    `                                    ${renderSortOptions()}`,
    "                                </select>",
    "                            </label>",
    '                            <p class="cert-status mb-0 ms-xl-auto" id="cert-status" role="status" aria-live="polite">',
    `                                ${escapeText(certificateStatusText(page))}`,
    "                            </p>",
    "                        </div>",
    '                        <div class="row g-3 sec-10-home-7__grid cert-grid" id="cert-grid" aria-busy="false">',
    renderCertificateCards(page.certificates),
    "                        </div>",
    '                        <nav class="cert-pagination mt-40" id="cert-pagination" aria-label="Certificates pagination">',
    `                            ${renderCertificatePagination(page)}`,
    "                        </nav>",
    "                    </div>",
    renderModal(),
    '                    <script type="application/json" id="certificates-data">',
    `                        ${serializePage(page, categories)}`,
    "                    </script>",
    renderStructuredData(page.certificates).trimEnd(),
    "                </div>",
    "",
  ].join("\n");
}

// Insert the section between Featured Projects and Contact. Both markers are
// code-owned, so a missing marker simply leaves the page untouched.
export function insertCertificatesSection(html: string, section: string): string {
  if (!section) return html;
  const marker = html.indexOf(CONTACT_MARKER);
  if (marker !== -1) return html.slice(0, marker) + section + "\n" + html.slice(marker);
  const contact = html.indexOf(CONTACT_OPEN);
  if (contact !== -1) return html.slice(0, contact) + section + html.slice(contact);
  return html;
}
