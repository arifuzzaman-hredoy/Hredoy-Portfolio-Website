"use client";

import { useEffect, useId, useRef, useState } from "react";
import { listItems, metaTags, val, type PortfolioData } from "@/lib/portfolio-data";

export default function SkillsSection({ data }: { data: PortfolioData }) {
  const eyebrow = val(data, "skills.eyebrow") || "My Skills";
  const title = val(data, "skills.title") || "Technical Skills & Tools.";
  const ctaText = val(data, "skills.cta") || "Get In Touch";
  const desc =
    val(data, "skills.desc") ||
    "Continuously learning and expanding my DevOps skillset across the modern cloud-native stack.";

  const rawAccordionItems = listItems(data, "skills.accordion");
  const physicsTools = listItems(data, "skills.throwables");

  // Fallback if no items in DB
  const items =
    rawAccordionItems.length > 0
      ? rawAccordionItems
      : [
          {
            id: "1",
            title: "Linux Administration",
            body: "Managing and troubleshooting Linux servers, configuring services, and automating system tasks with Bash scripting.",
            sort_order: 1,
            meta: { tags: ["Ubuntu", "Bash", "Troubleshooting"] },
          },
          {
            id: "2",
            title: "Containerization",
            body: "Packaging applications into portable containers and running multi-service stacks the same way everywhere.",
            sort_order: 2,
            meta: { tags: ["Docker", "Compose", "Kubernetes"] },
          },
          {
            id: "3",
            title: "CI/CD Pipelines",
            body: "Automating build, test and deploy so every push is checked and shipped without manual steps.",
            sort_order: 3,
            meta: { tags: ["GitHub Actions", "Jenkins", "GitOps"] },
          },
          {
            id: "4",
            title: "Cloud Infrastructure",
            body: "Provisioning and scaling cloud resources with infrastructure as code and sensible cost control.",
            sort_order: 4,
            meta: { tags: ["AWS", "Terraform", "Nginx"] },
          },
        ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [curNameOpacity, setCurNameOpacity] = useState(1);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const sectionId = useId();

  const totalCount = items.length;
  const activeItem = activeIdx >= 0 ? items[activeIdx] : null;
  const activeRawTitle = activeItem?.title ?? "";
  const activeCleanName = activeItem ? activeRawTitle.replace(/^\d+[\.\s]+/, "") : "Click to view skill";

  const handleSelectSkill = (idx: number) => {
    if (idx === activeIdx) {
      setActiveIdx(-1);
      return;
    }
    setCurNameOpacity(0);
    setActiveIdx(idx);
    setTimeout(() => {
      setCurNameOpacity(1);
    }, 150);
  };

  // Headline lines for the 3-line layout
  const headlineLines = [
    { text: "Technical", delay: "0s" },
    { text: "Skills &", delay: "0.1s" },
    { text: "Tools.", delay: "0.2s" },
  ];

  // Word-by-word reveal for bottom statement on scroll
  const statementWords = desc.trim().split(/\s+/);
  useEffect(() => {
    function handleScroll() {
      if (!statementRef.current) return;
      const rect = statementRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      let progress = Math.min(
        1,
        Math.max(0, (viewportH * 0.92 - rect.top) / (viewportH * 0.42))
      );
      if (document.documentElement.scrollHeight <= viewportH + 40) progress = 1;
      const count = Math.round(progress * statementWords.length);
      setRevealedCount(count);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [desc, statementWords.length]);

  return (
    <>
      <section className="skills skills-interactive-section" id="skills">
        <div className="container-fluid px-4 px-xl-5">
          <div className="row g-5">
            {/* Left column (sticky) */}
            <div className="col-lg-5">
              <div className="left">
                <a href="#skills" className="eyebrow">
                  {eyebrow}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <path d="M2 12L12 2M5 2h7v7" />
                  </svg>
                </a>

                <h2 className="headline" id="skills-headline">
                  {headlineLines.map((line, lIdx) => (
                    <span key={lIdx} className="ln">
                      <span style={{ animationDelay: line.delay }}>
                        {[...line.text].map((c, cIdx) => (
                          <span key={cIdx} className="ch">
                            {c === " " ? "\u00A0" : c}
                          </span>
                        ))}
                      </span>
                    </span>
                  ))}
                </h2>

                <a href="#contact" className="touch" aria-label={`${ctaText} - Let's talk`}>
                  <span className="t">
                    <span>{ctaText}</span>
                    <span>Let&apos;s talk</span>
                  </span>
                  <span className="a" aria-hidden="true">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M2 12L12 2M5 2h7v7" />
                    </svg>
                  </span>
                </a>

                {/* Index tracker */}
                <div className="tracker">
                  <div className="top">
                    <span className="cur">
                      <span
                        id="curNum"
                        style={{
                          transform: `translateY(${-(activeIdx >= 0 ? activeIdx : 0)}em)`,
                          opacity: activeIdx >= 0 ? 1 : 0.5,
                        }}
                      >
                        {items.map((_, i) => (
                          <i
                            key={i}
                            style={{
                              display: "block",
                              fontStyle: "normal",
                              height: "1em",
                              lineHeight: 1,
                            }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </i>
                        ))}
                      </span>
                    </span>
                    <span className="tot">/ {String(totalCount).padStart(2, "0")}</span>
                    <span
                      className="name"
                      id="curName"
                      style={{ opacity: curNameOpacity }}
                    >
                      {activeCleanName}
                    </span>
                  </div>

                  <div
                    className="segs"
                    id="segs"
                    style={{
                      gridTemplateColumns: `repeat(${totalCount}, 1fr)`,
                    }}
                  >
                    {items.map((item, i) => (
                      <button
                        key={item.id ?? i}
                        type="button"
                        className={activeIdx >= 0 && i <= activeIdx ? "on" : ""}
                        aria-label={`Skill ${i + 1}: ${item.title}`}
                        onClick={() => handleSelectSkill(i)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Interactive Accordion */}
            <div className="col-lg-7 rv in">
              <div className="accordion acc" id={`acc-${sectionId}`}>
                {items.map((item, idx) => {
                  const num = String(idx + 1).padStart(2, "0");
                  const isOpen = activeIdx === idx;
                  const tags = metaTags(item as any, "tags");
                  const collapseId = `collapse-skill-${sectionId}-${idx}`;
                  const cleanTitle = item.title.replace(/^\d+[\.\s]+/, "");

                  return (
                    <div key={item.id ?? idx} className="accordion-item">
                      <h3 className="accordion-header">
                        <button
                          className={`accordion-button${isOpen ? "" : " collapsed"}`}
                          type="button"
                          onClick={() => handleSelectSkill(idx)}
                          aria-expanded={isOpen}
                          aria-controls={collapseId}
                          data-name={cleanTitle}
                        >
                          <span className="num">{num}.</span>
                          {cleanTitle}
                        </button>
                      </h3>
                      <div
                        id={collapseId}
                        className={`accordion-collapse collapse${isOpen ? " show" : ""}`}
                      >
                        <div className="accordion-body">
                          <span className="ghost" aria-hidden="true">
                            {num}
                          </span>
                          <p>{item.body}</p>
                          {tags.map((tag, tIdx) => (
                            <span key={tag || tIdx} className="pill">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom statement section with word-by-word scroll reveal */}
      <section className="skills-statement-wrap container">
        <p className="skills-statement" ref={statementRef} id="skills-statement">
          {statementWords.map((word, wIdx) => (
            <span
              key={wIdx}
              className={`w${wIdx < revealedCount ? " on" : ""}`}
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </section>

      {/* Physics Falling Tools Stage */}
      <div className="container-fluid px-0">
        <div className="client-capsule-wrapper-box" data-tech-physics="true">
          <div className="client-capsule-wrapper tech-phys-stage" data-tech-physics-stage="" />
          <ul className="visually-hidden tech-phys-a11y">
            {physicsTools.map((tool) => (
              <li key={tool.id}>{tool.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
