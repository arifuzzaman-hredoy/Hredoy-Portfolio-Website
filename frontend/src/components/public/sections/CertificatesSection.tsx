import {
  CERTIFICATE_SORT_OPTIONS,
  certificateStatusText,
  certificateVerifyUrl,
  renderCertificateCards,
  renderCertificatePagination,
  type Certificate,
  type CertificatePage,
} from "@/lib/certificates-render";
import { ArrowDiagIcon } from "../Icons";

function buildStructuredData(certs: Certificate[]) {
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

  if (entries.length === 0) return null;
  return JSON.stringify({ "@context": "https://schema.org", "@graph": entries }).replace(/</g, "\\u003c");
}

export default function CertificatesSection({
  page,
  categories,
}: {
  page: CertificatePage;
  categories: string[];
}) {
  if (page.total === 0 || page.certificates.length === 0) return null;

  const jsonLd = buildStructuredData(page.certificates);
  const embeddedData = JSON.stringify({
    page: page.page,
    per_page: page.per_page,
    total: page.total,
    total_pages: page.total_pages,
    certificates: page.certificates,
    categories,
  }).replace(/</g, "\\u003c");

  return (
    <div className="sec-10-home-7 certificates-cms bg-neutral-0 pt-120 pb-120" id="certificates">
      <div className="container-2200 px-lg-5 px-3">
        <div className="row align-items-end mb-50">
          <div className="col-xl-4 col-lg-4 col-12">
            <div className="sec-10-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase">
              <span className="text-scramble" data-scramble-text="Certificates">Certificates</span>
              <ArrowDiagIcon />
            </div>
            <h2 className="sec-10-home-7__title mb-0 reveal-text">
              Verified <br className="d-none d-sm-inline" />Certificates
            </h2>
          </div>
          <div className="col-xl-5 col-lg-6 col-12 mt-4 mt-xl-0">
            <p className="sec-10-home-7__lead mb-0 reveal-text">
              Courses, labs and credentials I completed, with the verification link and the document itself where available.
            </p>
          </div>
        </div>

        <div className="cert-toolbar d-flex flex-wrap align-items-center gap-3 mb-40">
          <label className="cert-toolbar__field" htmlFor="cert-search">
            <span className="visually-hidden">Search certificates</span>
            <input type="search" id="cert-search" className="cert-toolbar__input" placeholder="Search certificates" autoComplete="off" />
          </label>
          <label className="cert-toolbar__select-wrap" htmlFor="cert-category">
            <span className="visually-hidden">Filter by category</span>
            <select id="cert-category" className="cert-toolbar__select">
              <option value="">All categories</option>
              {categories.filter(Boolean).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
          <label className="cert-toolbar__select-wrap" htmlFor="cert-sort">
            <span className="visually-hidden">Sort certificates</span>
            <select id="cert-sort" className="cert-toolbar__select">
              {CERTIFICATE_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>

        <p className="cert-status mb-4" id="cert-status" role="status" aria-live="polite">
          {certificateStatusText(page)}
        </p>

        <div
          className="row g-3 sec-10-home-7__grid"
          id="cert-grid"
          aria-busy="false"
          dangerouslySetInnerHTML={{ __html: renderCertificateCards(page.certificates) }}
        />

        <nav
          className="cert-pagination mt-50"
          id="cert-pagination"
          aria-label="Certificates pages"
          dangerouslySetInnerHTML={{ __html: renderCertificatePagination(page) }}
        />

        {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
        <script id="certificates-data" type="application/json" dangerouslySetInnerHTML={{ __html: embeddedData }} />

        <dialog className="cert-modal" id="certificate-modal" aria-labelledby="cert-modal-title">
          <div className="cert-modal__panel">
            <div className="cert-modal__head">
              <p className="cert-modal__eyebrow mb-0" id="cert-modal-meta" />
              <h3 className="cert-modal__title" id="cert-modal-title" />
              <button type="button" className="cert-modal__close" data-cert-close="" aria-label="Close certificate viewer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="cert-modal__body">
              <div className="cert-modal__media" id="cert-modal-media" />
              <div className="cert-modal__info">
                <dl className="cert-modal__facts mb-0" id="cert-modal-facts" />
                <p className="cert-modal__description mb-0" id="cert-modal-description" />
                <ul className="cert-modal__skills list-unstyled d-flex flex-wrap gap-2 mb-0" id="cert-modal-skills" />
                <div className="cert-modal__actions d-flex flex-wrap gap-2" id="cert-modal-actions" />
              </div>
            </div>
            <div className="cert-modal__foot">
              <button type="button" className="cert-modal__nav" data-cert-prev="">Previous</button>
              <span className="cert-modal__count" id="cert-modal-count" aria-live="polite" />
              <button type="button" className="cert-modal__nav" data-cert-next="">Next</button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
}
