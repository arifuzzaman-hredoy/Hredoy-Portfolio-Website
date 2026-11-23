"use client";

import { useState } from "react";
import { listItems, metaText, optimizeCloudinaryUrl, val, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";
import { ArrowDiagIcon } from "../Icons";

export default function ProcessSection({ data }: { data: PortfolioData }) {
  const eyebrow = val(data, "process.eyebrow");
  const cards = listItems(data, "process.cards");
  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  const activeCard =
    activeIdx !== null && activeIdx >= 0 && activeIdx < cards.length
      ? cards[activeIdx]
      : null;
  const activeNum = activeCard
    ? metaText(activeCard, "number") || `[${String((activeIdx ?? 0) + 1).padStart(2, "0")}]`
    : "";
  const activeImageVal = activeCard ? metaText(activeCard, "image") : "";
  const activeImageAlt = activeCard ? metaText(activeCard, "image_alt") || activeCard.title : "";
  const isDirectUrl = /^(\/|https?:\/\/)/i.test(activeImageVal);

  const handleSelect = (idx: number) => {
    setActiveIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="sec-6-home-7 p-relative bg-neutral-0 pb-120" id="process">
      <div className="container-2200 px-lg-5 px-3">
        {/* Section Header */}
        <div className="sec-6-home-7__header row g-0 pt-100 pb-50">
          <div className="col-lg-7 col-12">
            <a
              href="#process"
              className="sec-6-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-3 text-uppercase"
            >
              <span className="text-scramble" data-scramble-text={eyebrow}>
                {eyebrow}
              </span>
              <ArrowDiagIcon />
            </a>
            <h2 className="sec-6-home-7__title mb-0 reveal-text">{val(data, "process.title")}</h2>
          </div>
          <div className="col-lg-5 col-12 mt-4 mt-lg-0 d-flex align-items-end justify-content-lg-end">
            <p className="sec-6-home-7__desc text-lg-end mb-0 at_fade_anim">
              {val(data, "process.desc")}
            </p>
          </div>
        </div>

        {/* The 4 Process Options (Interactive Buttons) */}
        <div className="process-options-grid mb-4">
          <div className="row g-3">
            {cards.map((card, idx) => {
              const num = metaText(card, "number") || `[${String(idx + 1).padStart(2, "0")}]`;
              const isSelected = activeIdx === idx;
              return (
                <div key={card.id} className="col-xl-3 col-md-6 col-12">
                  <button
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className={`process-option-card w-100 h-100 text-start ${isSelected ? "is-active" : ""}`}
                    aria-expanded={isSelected}
                    aria-controls={`process-detail-${card.id}`}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="process-option-card__num">{num}</span>
                      <span className="process-option-card__indicator" aria-hidden="true">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.5 7H11.5M11.5 7L7 2.5M11.5 7L7 11.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                    <h3 className="process-option-card__title mb-0">{card.title}</h3>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Process Detail Showcase (Clicking any process shows its details) */}
        {activeCard ? (
          <div className="process-detail-showcase" id={`process-detail-${activeCard.id}`}>
            <div className="row g-4 align-items-center">
              <div className="col-lg-6 col-12">
                <div className="process-detail-showcase__content pe-lg-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="process-detail-showcase__badge">
                      Process Step {(activeIdx ?? 0) + 1} of {cards.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIdx(null)}
                      className="process-detail-showcase__close-btn"
                      aria-label="Close process details"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <h3 className="process-detail-showcase__title mb-3">
                    <span className="text-theme me-2" style={{ color: "var(--at-theme-primary, #14b8a6)" }}>
                      {activeNum}
                    </span>
                    {activeCard.title}
                  </h3>
                  <p className="process-detail-showcase__desc mb-4">{activeCard.body}</p>

                  <div className="process-detail-showcase__actions d-flex flex-wrap gap-2 pt-2">
                    {activeIdx !== null && activeIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveIdx(activeIdx - 1)}
                        className="btn process-detail-nav-btn"
                      >
                        ← Prev Step
                      </button>
                    )}
                    {activeIdx !== null && activeIdx < cards.length - 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveIdx(activeIdx + 1)}
                        className="btn process-detail-nav-btn process-detail-nav-btn--primary"
                      >
                        Next: {cards[activeIdx + 1].title} →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-6 col-12">
                <div className="process-detail-showcase__media">
                  {activeImageVal &&
                    (isDirectUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={optimizeCloudinaryUrl(activeImageVal)}
                        alt={activeImageAlt}
                        width={1200}
                        height={900}
                        loading="eager"
                        className="img-fluid"
                      />
                    ) : (
                      <CmsImage data={data} slot={activeImageVal} width={1200} height={900} />
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="process-detail-prompt text-center py-4">
            <p className="mb-0 text-muted">
              Click on any of the 4 processes above to explore its workflow, details, and architecture.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
