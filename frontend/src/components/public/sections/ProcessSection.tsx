"use client";

import { useState } from "react";
import { listItems, metaText, optimizeCloudinaryUrl, val, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";
import { ArrowDiagIcon } from "../Icons";

type ProcessDetailInfo = {
  phase: string;
  tagline: string;
  practices: string[];
  tools: string[];
  deliverable: string;
};

const PROCESS_INFO: Record<number, ProcessDetailInfo> = {
  0: {
    phase: "PHASE 01 · SYSTEM FOUNDATIONS",
    tagline: "Core Operating Systems, Networking & Scripting Fundamentals",
    practices: [
      "Master Linux system administration: FHS filesystem hierarchy, systemd daemon management, permissions, and process lifecycle",
      "Architect reliable networking: TCP/IP stack, subnets, routing tables, DNS resolution, and firewall rules (UFW/iptables)",
      "Develop robust Bash automation scripts for server provisioning, cron scheduling, and log rotations",
      "Enforce baseline security hardening: SSH key access, non-root execution, and strict access controls",
    ],
    tools: ["Linux / Ubuntu", "Bash Automation", "Git & GitHub", "Networking (DNS/TCP)", "SSH & UFW Security"],
    deliverable: "Hardened, production-ready Linux server environment with repeatable automation scripts.",
  },
  1: {
    phase: "PHASE 02 · CONTAINERIZATION & CI",
    tagline: "Standardized Environments, Multi-Tier Docker Stacks & Automated Workflows",
    practices: [
      "Package services into lightweight, secure container images using multi-stage Dockerfiles and non-root users",
      "Orchestrate multi-tier microservice stacks (App, Database, Cache) via Docker Compose with dedicated bridge networks",
      "Construct automated CI pipelines in GitHub Actions for static analysis, unit tests, and automated image builds",
      "Configure reverse proxies with Nginx, automated SSL/TLS certificates via Certbot, and rate limiting",
    ],
    tools: ["Docker", "Docker Compose", "GitHub Actions CI", "Nginx Reverse Proxy", "Certbot SSL", "GHCR Registry"],
    deliverable: "Fully containerized services with automated continuous integration tests triggered on every git push.",
  },
  2: {
    phase: "PHASE 03 · CLOUD & IAC ARCHITECTURE",
    tagline: "Declarative Infrastructure, Cloud Provisioning & Zero-Downtime Deployments",
    practices: [
      "Author modular, declarative Infrastructure as Code using Terraform with remote state locking",
      "Deploy scalable infrastructure on AWS: Custom VPCs, public/private subnets, Security Groups, EC2, and IAM policies",
      "Implement automated blue/green or rolling deployment strategies with health check validations",
      "Manage environment variables and production secrets securely with encryption and zero hardcoded credentials",
    ],
    tools: ["Terraform (IaC)", "AWS (VPC, EC2, IAM)", "Ansible Configuration", "PostgreSQL", "Docker Networks"],
    deliverable: "Idempotent, version-controlled cloud infrastructure capable of instant, automated environment provisioning.",
  },
  3: {
    phase: "PHASE 04 · OBSERVABILITY & CONTINUOUS OPS",
    tagline: "Metrics Telemetry, Alerting Dashboards, Security Auditing & Continuous Delivery",
    practices: [
      "Implement full-stack observability with Prometheus metrics scraping, Node Exporter, and system telemetry",
      "Build real-time visualization dashboards in Grafana with proactive alert thresholds for latency and errors",
      "Embed automated container vulnerability scanning into pipelines using Trivy and container image signing",
      "Ensure production resilience with automated database backups, healthcheck restart policies, and disaster recovery drills",
    ],
    tools: ["Prometheus Telemetry", "Grafana Dashboards", "Trivy Security Scanning", "Docker Healthchecks", "Automated Backups"],
    deliverable: "Production platform with 99.9% uptime targets, real-time alerting, and automated self-healing mechanisms.",
  },
};

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
  const detail = activeIdx !== null ? PROCESS_INFO[activeIdx] : null;

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

        {/* Process Detail Showcase (Clicking any process shows its rich details) */}
        {activeCard ? (
          <div className="process-detail-showcase" id={`process-detail-${activeCard.id}`}>
            <div className="row g-4 align-items-center">
              <div className="col-lg-7 col-12">
                <div className="process-detail-showcase__content pe-lg-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="process-detail-showcase__badge">
                      {detail?.phase || `Process Step ${(activeIdx ?? 0) + 1} of ${cards.length}`}
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

                  <h3 className="process-detail-showcase__title mb-2">
                    <span className="text-theme me-2" style={{ color: "var(--at-theme-primary, #14b8a6)" }}>
                      {activeNum}
                    </span>
                    {activeCard.title}
                  </h3>

                  {detail?.tagline && (
                    <p className="process-detail-showcase__tagline mb-3" style={{ color: "var(--at-theme-primary, #14b8a6)" }}>
                      {detail.tagline}
                    </p>
                  )}

                  <p className="process-detail-showcase__desc mb-4">{activeCard.body}</p>

                  {/* Core Implementation Practices */}
                  {detail && detail.practices.length > 0 && (
                    <div className="process-detail-practices mb-4">
                      <h4 className="process-detail-subheading mb-2">Key Implementation Practices:</h4>
                      <ul className="process-detail-practice-list list-unstyled mb-0">
                        {detail.practices.map((practice, pIdx) => (
                          <li key={pIdx} className="process-detail-practice-item d-flex align-items-start mb-2">
                            <span className="process-detail-check-icon me-2" aria-hidden="true">
                              ✓
                            </span>
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Deliverable Box */}
                  {detail?.deliverable && (
                    <div className="process-detail-deliverable mb-4 p-3 rounded">
                      <span className="process-detail-deliverable-title d-block mb-1">
                        🎯 Key Milestone Deliverable:
                      </span>
                      <span className="process-detail-deliverable-text">{detail.deliverable}</span>
                    </div>
                  )}

                  {/* Tools & Tech Stack */}
                  {detail && detail.tools.length > 0 && (
                    <div className="process-detail-tools mb-4">
                      <span className="process-detail-tools-label d-block mb-2">Tools & Technologies:</span>
                      <div className="d-flex flex-wrap gap-2">
                        {detail.tools.map((tool, tIdx) => (
                          <span key={tIdx} className="process-detail-tool-tag">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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

              <div className="col-lg-5 col-12">
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
