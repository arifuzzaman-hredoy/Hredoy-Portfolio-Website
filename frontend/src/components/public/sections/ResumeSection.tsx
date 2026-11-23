"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { val, type PortfolioData } from "@/lib/portfolio-data";
import { assetUrl } from "@/lib/assets";
import { ArrowDiagIcon } from "../Icons";

export default function ResumeSection({ data }: { data: PortfolioData }) {
  const [activeDoc, setActiveDoc] = useState<"cv" | "resume" | null>(null);
  const [mounted, setMounted] = useState(false);

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

  // Active document for modal preview
  const activeTitle = activeDoc === "cv" ? cvTitle : resumeTitle;
  const activeUrl = activeDoc === "cv" ? cvUrl : resumeUrl;
  const activeFormat = activeDoc === "cv" ? cvFormat : resumeFormat;
  const activeSize = activeDoc === "cv" ? cvSize : resumeSize;
  const activeBadge = activeDoc === "cv" ? cvBadge : resumeBadge;

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDoc(null);
      }
    };
    if (activeDoc) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeDoc]);

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
            role="presentation"
          >
            <div
              className="resume-modal-dialog"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="resume-modal-title"
            >
              {/* Modal Head */}
              <div className="resume-modal-head d-flex align-items-center justify-content-between p-3 p-md-4">
                <div className="d-flex align-items-center gap-3">
                  <span className="resume-badge resume-badge--accent">{activeBadge}</span>
                  <h3 className="resume-modal-title mb-0" id="resume-modal-title">
                    {activeTitle}
                  </h3>
                </div>
                <div className="d-flex align-items-center gap-2">
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

              {/* Modal Body / Viewer */}
              <div className="resume-modal-body p-0">
                {(activeFormat || "").toUpperCase() === "PDF" || (activeUrl || "").toLowerCase().includes(".pdf") ? (
                  <iframe
                    src={`${activeUrl}#toolbar=0`}
                    className="resume-modal-iframe"
                    title={`${activeTitle} Document Preview`}
                  />
                ) : ["PNG", "JPG", "JPEG", "WEBP"].includes((activeFormat || "").toUpperCase()) ? (
                  <div className="d-flex align-items-center justify-content-center p-4" style={{ minHeight: "60vh" }}>
                    <img src={activeUrl} alt={activeTitle} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }} />
                  </div>
                ) : (
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(activeUrl)}&embedded=true`}
                    className="resume-modal-iframe"
                    title={`${activeTitle} Document Preview`}
                  />
                )}
              </div>

              {/* Modal Foot */}
              <div className="resume-modal-foot d-flex align-items-center justify-content-between p-3 p-md-4">
                <span className="resume-modal-meta-text">
                  Format: <strong>{activeFormat}</strong> &middot; File size: <strong>{activeSize}</strong>
                </span>
                <div className="d-flex align-items-center gap-3">
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
                    className="btn-resume-modal-primary d-inline-flex align-items-center gap-2"
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
          </div>,
          document.body
        )}
    </section>
  );
}
