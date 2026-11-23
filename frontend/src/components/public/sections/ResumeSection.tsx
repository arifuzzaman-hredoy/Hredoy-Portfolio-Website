"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { val, type PortfolioData } from "@/lib/portfolio-data";
import { assetUrl } from "@/lib/assets";
import { ArrowDiagIcon } from "../Icons";

function getCloudinaryPageUrl(url: string, page: number): string {
  const pngUrl = url.replace(/\.pdf$/i, ".png");
  if (pngUrl.includes("/image/upload/")) {
    if (/\/image\/upload\/pg_\d+\//.test(pngUrl)) {
      return pngUrl.replace(/\/image\/upload\/pg_\d+\//, `/image/upload/pg_${page}/`);
    }
    return pngUrl.replace("/image/upload/", `/image/upload/pg_${page}/`);
  }
  return pngUrl;
}

export default function ResumeSection({ data }: { data: PortfolioData }) {
  const [activeDoc, setActiveDoc] = useState<"cv" | "resume" | null>(null);
  const [mounted, setMounted] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loadingHtml, setLoadingHtml] = useState<boolean>(false);
  const [htmlError, setHtmlError] = useState<boolean>(false);
  const [viewerMode, setViewerMode] = useState<"image" | "native" | "gdocs">("image");
  const [fitMode, setFitMode] = useState<"width" | "page">("width");
  const [pdfPages, setPdfPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const eyebrow = val(data, "resume.eyebrow") || "CURRICULUM VITAE & RESUME";
  const title = val(data, "resume.title") || "Verified Credentials & Documents";
  const lead =
    val(data, "resume.lead") ||
    "Download or preview my formal Curriculum Vitae and role-tailored DevOps Resume in standard document formats.";

  // CV details
  const cvTitle = val(data, "resume.cv.title") || "Curriculum Vitae (CV)";
  const cvBadge = val(data, "resume.cv.badge") || "Full Academic & Technical Profile";
  const cvDesc =
    val(data, "resume.cv.desc") ||
    "Complete record of educational qualifications, polytechnic diploma, Linux & cloud training, extracurricular debates, and engineering achievements.";
  const cvFormat = val(data, "resume.cv.format") || "PDF";
  const cvUpdated = val(data, "resume.cv.updated") || "Updated Nov 2026";
  const cvUrl = assetUrl(val(data, "resume.cv.file_url") || "/assets/docs/Arifuzzaman-Hredoy-DevOps-CV.pdf");
  const cvSize = val(data, "resume.cv.file_size") || "1.2 MB";
  const cvPages = parseInt(val(data, "resume.cv.pages") || "4", 10) || 4;

  // Resume details
  const resumeTitle = val(data, "resume.resume.title") || "DevOps Engineer Resume";
  const resumeBadge = val(data, "resume.resume.badge") || "ATS-Optimized · 1-Page";
  const resumeDesc =
    val(data, "resume.resume.desc") ||
    "Compact, recruiter-focused single-page resume highlighting production Docker, CI/CD pipelines, AWS EC2, Linux administration, and IaC skills.";
  const resumeFormat = val(data, "resume.resume.format") || "PDF";
  const resumeUpdated = val(data, "resume.resume.updated") || "Updated Nov 2026";
  const resumeUrl = assetUrl(val(data, "resume.resume.file_url") || "/assets/docs/Arifuzzaman-Hredoy-DevOps-Resume.pdf");
  const resumeSize = val(data, "resume.resume.file_size") || "240 KB";
  const resumePages = parseInt(val(data, "resume.resume.pages") || "1", 10) || 1;

  // Active document for modal preview
  const activeTitle = activeDoc === "cv" ? cvTitle : resumeTitle;
  const activeUrl = activeDoc === "cv" ? cvUrl : resumeUrl;
  const activeFormat = activeDoc === "cv" ? cvFormat : resumeFormat;
  const activeSize = activeDoc === "cv" ? cvSize : resumeSize;
  const activeBadge = activeDoc === "cv" ? cvBadge : resumeBadge;
  const initialConfiguredPages = activeDoc === "cv" ? cvPages : resumePages;

  const isHtml =
    (activeFormat || "").toUpperCase() === "HTML" ||
    (activeFormat || "").toUpperCase() === "HTM" ||
    (activeUrl || "").toLowerCase().endsWith(".html") ||
    (activeUrl || "").toLowerCase().endsWith(".htm");

  const isPdf =
    (activeFormat || "").toUpperCase() === "PDF" ||
    (activeUrl || "").toLowerCase().includes(".pdf");

  const isImage =
    ["PNG", "JPG", "JPEG", "WEBP", "SVG", "GIF"].includes((activeFormat || "").toUpperCase()) ||
    /\.(png|jpe?g|webp|svg|gif)$/i.test(activeUrl || "");

  const isCloudinaryImageUpload =
    activeUrl.includes("res.cloudinary.com") && activeUrl.includes("/image/upload/");

  // Dynamically probe for multi-page PDF count in Cloudinary
  useEffect(() => {
    if (!activeDoc || !activeUrl) {
      setPdfPages(1);
      setCurrentPage(1);
      return;
    }

    if (isPdf && isCloudinaryImageUpload) {
      // Start with configured count (default 4 for CV, 1 for Resume)
      const count = initialConfiguredPages > 0 ? initialConfiguredPages : 1;
      setPdfPages(count);
      setCurrentPage(1);

      // Probe beyond configured count or verify availability
      let cancelled = false;
      const probePage = (page: number) => {
        if (cancelled || page > 15) return;
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          setPdfPages((prev) => Math.max(prev, page));
          probePage(page + 1);
        };
        img.onerror = () => {
          if (cancelled) return;
          // Page not found; if page was higher than current max, stop
        };
        img.src = getCloudinaryPageUrl(activeUrl, page);
      };

      // Probe pages 1 through 10
      probePage(1);

      return () => {
        cancelled = true;
      };
    } else {
      setPdfPages(1);
      setCurrentPage(1);
    }
  }, [activeDoc, activeUrl, isPdf, isCloudinaryImageUpload, initialConfiguredPages]);

  // Load HTML text if previewing an HTML document
  useEffect(() => {
    if (!activeDoc || !activeUrl) {
      setHtmlContent("");
      setLoadingHtml(false);
      setHtmlError(false);
      return;
    }

    if (isHtml) {
      setLoadingHtml(true);
      setHtmlError(false);
      setHtmlContent("");
      fetch(activeUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load document");
          return res.text();
        })
        .then((text) => {
          let processed = text;
          // Ensure responsive viewport tag exists for mobile devices
          if (!processed.includes('name="viewport"')) {
            processed = processed.replace(
              /<head[^>]*>/i,
              `$&<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">`
            );
          }
          // Inject comprehensive mobile responsive stylesheet overrides
          const responsiveOverrides = `
            <style id="mobile-viewport-responsive">
              @media (max-width: 768px) {
                html, body {
                  padding: 8px 6px !important;
                  margin: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  overflow-x: hidden !important;
                  font-size: 13px !important;
                  background: #f8fafc !important;
                  box-sizing: border-box !important;
                }
                .resume-sheet, .container, .page, [class*="resume"], [class*="sheet"] {
                  max-width: 100% !important;
                  width: 100% !important;
                  padding: 16px 12px !important;
                  margin: 0 0 16px 0 !important;
                  box-sizing: border-box !important;
                  border-width: 2px !important;
                  box-shadow: none !important;
                }
                .two-column-layout, [class*="column-layout"], [class*="two-col"], [class*="grid-2"] {
                  display: flex !important;
                  flex-direction: column !important;
                  grid-template-columns: 1fr !important;
                  width: 100% !important;
                  gap: 16px !important;
                }
                .main-content, [class*="main-content"] {
                  order: 1 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  padding-left: 0 !important;
                  padding-right: 0 !important;
                }
                .sidebar, [class*="sidebar"] {
                  order: 2 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  border-right: none !important;
                  border-top: 1.5px solid var(--border-gray, #cbd5e1) !important;
                  padding-right: 0 !important;
                  padding-top: 16px !important;
                  margin-top: 8px !important;
                }
                table, tr, td, th {
                  max-width: 100% !important;
                  box-sizing: border-box !important;
                  word-break: break-word !important;
                }
                * {
                  max-width: 100% !important;
                  box-sizing: border-box !important;
                  word-break: break-word !important;
                  overflow-wrap: break-word !important;
                }
              }
            </style>
          `;
          if (processed.includes("</head>")) {
            processed = processed.replace("</head>", `${responsiveOverrides}</head>`);
          } else {
            processed = responsiveOverrides + processed;
          }
          setHtmlContent(processed);
          setLoadingHtml(false);
        })
        .catch(() => {
          setHtmlError(true);
          setLoadingHtml(false);
        });
    } else {
      setHtmlContent("");
      setLoadingHtml(false);
      setHtmlError(false);
    }

    // Set viewer mode for PDF: if Cloudinary image upload, default to crisp image rendering
    if (isPdf) {
      if (isCloudinaryImageUpload) {
        setViewerMode("image");
      } else if (activeUrl.includes("/raw/upload/")) {
        setViewerMode("gdocs");
      } else {
        setViewerMode("native");
      }
    }
  }, [activeDoc, activeUrl, activeFormat, isHtml, isPdf, isCloudinaryImageUpload]);

  // Handle ESC key to close modal and strictly lock background website scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDoc(null);
      }
    };
    if (activeDoc) {
      window.addEventListener("keydown", handleKeyDown);
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevBodyPaddingRight = document.body.style.paddingRight;

      // Prevent scrollbar layout jump
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Lock both documentElement and body so the background website CANNOT scroll
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.paddingRight = prevBodyPaddingRight;
      };
    }
  }, [activeDoc]);

  // Jump smoothly to a specific page
  const scrollToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    const el = document.getElementById(`resume-page-${pageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="resume-cv-section pt-120 pb-120" id="resume">
      <div className="container-2200 px-lg-5 px-3">
        {/* Section Header */}
        <div className="row align-items-end mb-50">
          <div className="col-xl-6 col-lg-7 col-12">
            <span className="resume-cv-eyebrow d-inline-flex align-items-center gap-2 mb-3 text-uppercase">
              <span className="text-scramble" data-scramble-text={eyebrow}>
                {eyebrow}
              </span>
              <ArrowDiagIcon />
            </span>
            <h2 className="resume-cv-title mb-0">{title}</h2>
          </div>
          <div className="col-xl-6 col-lg-5 col-12 mt-4 mt-lg-0">
            <p className="resume-cv-lead mb-0">{lead}</p>
          </div>
        </div>

        {/* 2-Card Layout (CV & Resume) */}
        <div className="row g-4">
          {/* Card 1: Curriculum Vitae (CV) */}
          <div className="col-lg-6 col-12">
            <div className="resume-card h-100 d-flex flex-column justify-content-between p-4 p-md-5">
              <div>
                <div className="resume-card__head d-flex align-items-center justify-content-between mb-4">
                  <div className="resume-card__icon-box d-inline-flex align-items-center justify-content-center" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className="resume-card__badges d-flex flex-wrap gap-2">
                    <span className="resume-badge resume-badge--accent">{cvBadge}</span>
                    <span className="resume-badge">{cvFormat}</span>
                  </div>
                </div>

                <h3 className="resume-card__title mb-3">{cvTitle}</h3>
                <p className="resume-card__desc mb-4">{cvDesc}</p>

                <div className="resume-card__meta d-flex flex-wrap align-items-center gap-3 mb-4">
                  <span className="resume-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {cvUpdated}
                  </span>
                  <span className="resume-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {cvSize}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="resume-card__actions d-flex flex-wrap gap-3 pt-3">
                <button
                  type="button"
                  className="btn-resume-preview d-inline-flex align-items-center justify-content-center gap-2"
                  onClick={() => setActiveDoc("cv")}
                  aria-label={`Preview ${cvTitle} in browser`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview CV</span>
                </button>
                <a
                  href={cvUrl}
                  download={`Arifuzzaman-Hredoy-DevOps-CV.${(cvFormat || "pdf").toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-resume-download d-inline-flex align-items-center justify-content-center gap-2"
                  aria-label={`Download ${cvTitle}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download CV</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: DevOps Resume */}
          <div className="col-lg-6 col-12">
            <div className="resume-card h-100 d-flex flex-column justify-content-between p-4 p-md-5">
              <div>
                <div className="resume-card__head d-flex align-items-center justify-content-between mb-4">
                  <div className="resume-card__icon-box d-inline-flex align-items-center justify-content-center" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div className="resume-card__badges d-flex flex-wrap gap-2">
                    <span className="resume-badge resume-badge--accent">{resumeBadge}</span>
                    <span className="resume-badge">{resumeFormat}</span>
                  </div>
                </div>

                <h3 className="resume-card__title mb-3">{resumeTitle}</h3>
                <p className="resume-card__desc mb-4">{resumeDesc}</p>

                <div className="resume-card__meta d-flex flex-wrap align-items-center gap-3 mb-4">
                  <span className="resume-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {resumeUpdated}
                  </span>
                  <span className="resume-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {resumeSize}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="resume-card__actions d-flex flex-wrap gap-3 pt-3">
                <button
                  type="button"
                  className="btn-resume-preview d-inline-flex align-items-center justify-content-center gap-2"
                  onClick={() => setActiveDoc("resume")}
                  aria-label={`Preview ${resumeTitle} in browser`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview Resume</span>
                </button>
                <a
                  href={resumeUrl}
                  download={`Arifuzzaman-Hredoy-DevOps-Resume.${(resumeFormat || "pdf").toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-resume-download d-inline-flex align-items-center justify-content-center gap-2"
                  aria-label={`Download ${resumeTitle}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download Resume</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive In-Website Document Viewer Modal */}
      {mounted &&
        activeDoc &&
        createPortal(
          <div
            className="resume-modal-backdrop"
            onClick={() => setActiveDoc(null)}
            onWheel={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div
              className="resume-modal-dialog"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="resume-modal-title"
            >
              {/* Modal Head */}
              <div className="resume-modal-head p-3 p-md-4">
                {/* Main Row: Title, Badges, and Action Icons */}
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2 flex-grow-1 overflow-hidden">
                    <h3 className="resume-modal-title mb-0 text-truncate" id="resume-modal-title">
                      {activeTitle}
                    </h3>
                    <span className="resume-badge resume-badge--accent d-none d-sm-inline-block text-truncate">
                      {activeBadge}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-modal-link-btn"
                      title="Open in new browser tab"
                      aria-label="Open document in new browser tab"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                    <button
                      type="button"
                      className="resume-modal-close-btn"
                      onClick={() => setActiveDoc(null)}
                      aria-label="Close document preview"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Unified Responsive Controls Toolbar (Available on Phone, Tablet & Desktop) */}
                <div className="resume-modal-toolbar mt-3 pt-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
                  {/* Left: View Mode Switcher */}
                  <div className="d-flex align-items-center gap-1 flex-wrap">
                    {isPdf && (
                      <div className="resume-segmented-control d-inline-flex align-items-center p-1">
                        {isCloudinaryImageUpload && (
                          <button
                            type="button"
                            onClick={() => setViewerMode("image")}
                            className={`resume-segmented-btn ${viewerMode === "image" ? "resume-segmented-btn--active" : ""}`}
                            title="High-definition multi-page view"
                          >
                            <span>🖼️ Preview</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setViewerMode("native")}
                          className={`resume-segmented-btn ${viewerMode === "native" ? "resume-segmented-btn--active" : ""}`}
                          title="Browser native PDF reader"
                        >
                          <span>📄 PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewerMode("gdocs")}
                          className={`resume-segmented-btn ${viewerMode === "gdocs" ? "resume-segmented-btn--active" : ""}`}
                          title="Google Docs document viewer"
                        >
                          <span>🌐 Docs</span>
                        </button>
                      </div>
                    )}

                    {/* Fit Mode Toggle for Image View */}
                    {((isPdf && viewerMode === "image") || isImage) && (
                      <button
                        type="button"
                        onClick={() => setFitMode((prev) => (prev === "width" ? "page" : "width"))}
                        className="resume-toolbar-btn d-inline-flex align-items-center gap-1"
                        title={fitMode === "width" ? "Switch to Fit Page" : "Switch to Full Width"}
                      >
                        <span>{fitMode === "width" ? "📜 Full Width" : "🔍 Fit Page"}</span>
                      </button>
                    )}
                  </div>

                  {/* Right: Multi-Page Navigator (when PDF in image mode and multiple pages exist) */}
                  {isPdf && viewerMode === "image" && pdfPages > 1 && (
                    <div className="resume-page-nav d-inline-flex align-items-center gap-1">
                      <span className="resume-page-nav-label">
                        {pdfPages} Pages
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("resume-viewport");
                          if (el) el.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="resume-page-jump-btn"
                        title="Scroll to Top"
                      >
                        All
                      </button>
                      {Array.from({ length: pdfPages }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => scrollToPage(num)}
                          className={`resume-page-jump-btn ${currentPage === num ? "resume-page-jump-btn--active" : ""}`}
                          title={`Jump to Page ${num}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Body / Viewer */}
              <div className="resume-modal-body p-0" id="resume-viewport">
                {isHtml ? (
                  loadingHtml ? (
                    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center" style={{ minHeight: "65vh" }}>
                      <div className="spinner-border text-info mb-3" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mb-0">Rendering formatted document...</p>
                    </div>
                  ) : htmlError ? (
                    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center" style={{ minHeight: "65vh" }}>
                      <p className="text-warning mb-3">Unable to embed HTML document inline.</p>
                      <a href={activeUrl} target="_blank" rel="noopener noreferrer" className="btn-resume-modal-primary" style={{ textDecoration: "none" }}>
                        Open in New Window &rarr;
                      </a>
                    </div>
                  ) : (
                    <iframe
                      srcDoc={htmlContent}
                      className="resume-modal-iframe"
                      title={`${activeTitle} Document Preview`}
                      sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                  )
                ) : isImage ? (
                  <div className="resume-document-viewport">
                    <img
                      src={activeUrl}
                      alt={activeTitle}
                      className={`resume-document-img ${fitMode === "page" ? "resume-document-img--fit-page" : ""}`}
                    />
                  </div>
                ) : isPdf ? (
                  viewerMode === "image" && isCloudinaryImageUpload ? (
                    <div className="resume-document-viewport">
                      {Array.from({ length: pdfPages }, (_, i) => i + 1).map((pageNum) => (
                        <div
                          key={pageNum}
                          className="resume-document-page mb-4"
                          id={`resume-page-${pageNum}`}
                        >
                          <div className="resume-page-header d-flex align-items-center justify-content-between mb-2 px-1">
                            <span className="resume-page-badge">
                              Page {pageNum} of {pdfPages}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById("resume-viewport");
                                if (el) el.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="resume-page-top-link"
                            >
                              ↑ Top
                            </button>
                          </div>
                          <img
                            src={getCloudinaryPageUrl(activeUrl, pageNum)}
                            alt={`${activeTitle} - Page ${pageNum} of ${pdfPages}`}
                            className={`resume-document-img ${fitMode === "page" ? "resume-document-img--fit-page" : ""}`}
                            loading={pageNum === 1 ? "eager" : "lazy"}
                          />
                        </div>
                      ))}
                    </div>
                  ) : viewerMode === "native" ? (
                    <iframe
                      src={`${activeUrl}#toolbar=0`}
                      className="resume-modal-iframe"
                      title={`${activeTitle} Document Preview`}
                    />
                  ) : (
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(activeUrl)}&embedded=true`}
                      className="resume-modal-iframe"
                      title={`${activeTitle} Document Preview`}
                    />
                  )
                ) : (
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(activeUrl)}&embedded=true`}
                    className="resume-modal-iframe"
                    title={`${activeTitle} Document Preview`}
                  />
                )}
              </div>

              {/* Modal Foot */}
              <div className="resume-modal-foot p-3 p-md-4">
                <div className="d-flex align-items-center justify-content-between gap-3 resume-modal-foot-inner">
                  <span className="resume-modal-meta-text">
                    Format: <strong>{activeFormat}</strong> &middot; Size: <strong>{activeSize}</strong>
                    {isPdf && viewerMode === "image" && pdfPages > 1 && (
                      <span> &middot; <strong>{pdfPages} Pages</strong></span>
                    )}
                  </span>
                  <div className="d-flex align-items-center gap-2 resume-modal-foot-actions">
                    <button
                      type="button"
                      className="btn-resume-modal-secondary"
                      onClick={() => setActiveDoc(null)}
                    >
                      Close
                    </button>
                    <a
                      href={activeUrl}
                      download={activeDoc === "cv" ? `Arifuzzaman-Hredoy-DevOps-CV.${(activeFormat || "pdf").toLowerCase()}` : `Arifuzzaman-Hredoy-DevOps-Resume.${(activeFormat || "pdf").toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-resume-modal-primary d-inline-flex align-items-center justify-content-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Download ({activeSize})</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
