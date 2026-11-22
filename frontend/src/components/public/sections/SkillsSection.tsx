import { listItems, metaTags, val, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";
import { ArrowDiagIcon, ArrowUpRightIcon } from "../Icons";

export default function SkillsSection({ data }: { data: PortfolioData }) {
  const eyebrow = val(data, "skills.eyebrow");
  const ctaText = val(data, "skills.cta");
  const accordionItems = listItems(data, "skills.accordion");
  const physicsTools = listItems(data, "skills.throwables");

  return (
    <div className="sec-5-home-7 bg-neutral-0 overflow-hidden" id="skills">
      <div className="container-2200 px-lg-5 px-3 pt-120 pb-80">
        <div className="row g-4 g-xl-5 align-items-start">
          <div className="col-xl-4 col-lg-5 col-12">
            <div className="sec-5-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase">
              <span className="text-scramble" data-scramble-text={eyebrow}>{eyebrow}</span>
              <ArrowDiagIcon />
            </div>
            <h2 className="sec-5-home-7__title mb-4 mb-xl-5 reveal-text">{val(data, "skills.title")}</h2>
            <div className="sec-5-home-7__cta d-inline-flex align-items-stretch at_fade_anim">
              <a href="#contact" className="at-btn sec-5-home-7__cta-btn text-capitalize">
                <span>
                  <span className="text-1">{ctaText}</span>
                  <span className="text-2">{ctaText}</span>
                </span>
              </a>
              <a href="#contact" className="sec-5-home-7__cta-circle d-inline-flex align-items-center justify-content-center text-white" aria-label={ctaText}>
                <ArrowUpRightIcon />
              </a>
            </div>
          </div>

          <div className="col-xl-3 col-lg-5 col-12 mx-lg-auto">
            <div className="sec-5-home-7__photo scroll-move-up">
              <div className="fix anim-zoomin">
                <CmsImage
                  data={data}
                  slot="technical-skills"
                  altFallback="Technical Skills & Tools"
                  className="w-100 object-fit-contain"
                  width={900}
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-12 col-12">
            <div className="accordion accordion-flush sec-5-home-7__accordion" id="accordionSec5Home7">
              {accordionItems.map((item, idx) => {
                const n = idx + 1;
                const headingId = `headingSec5H7${n}`;
                const collapseId = `collapseSec5H7${n}`;
                const expanded = idx === 0;
                const tags = metaTags(item, "tags");
                return (
                  <div key={item.id} className="accordion-item sec-5-home-7__acc-item scroll-move-up">
                    <h3 className="accordion-header" id={headingId}>
                      <button
                        className={`accordion-button sec-5-home-7__acc-btn${expanded ? "" : " collapsed"}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${collapseId}`}
                        aria-expanded={expanded}
                        aria-controls={collapseId}
                      >
                        <span className="sec-5-home-7__acc-title">{item.title}</span>
                        <span className="sec-5-home-7__acc-toggle" aria-hidden="true">
                          <svg className="sec-5-home-7__acc-plus" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </span>
                      </button>
                    </h3>
                    <div id={collapseId} className={`accordion-collapse collapse${expanded ? " show" : ""}`} data-bs-parent="#accordionSec5Home7">
                      <div className="accordion-body sec-5-home-7__acc-body">
                        <p className="sec-5-home-7__acc-text mb-0">{item.body}</p>
                        {tags.length > 0 && (
                          <div className="sec-5-home-7__tags d-flex flex-wrap gap-2 pt-4">
                            {tags.map((tag) => (
                              <span key={tag} className="sec-5-home-7__tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-0 text-center">
        <div className="scroll-move-up">
          <h6 className="mb-4 mb-xl-5 reveal-text">{val(data, "skills.desc")}</h6>
        </div>
      </div>

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
    </div>
  );
}
