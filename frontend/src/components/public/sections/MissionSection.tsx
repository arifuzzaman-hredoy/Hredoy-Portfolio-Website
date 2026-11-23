import { val, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";
import { ArrowDiagIcon, ArrowUpRightIcon } from "../Icons";

export default function MissionSection({ data }: { data: PortfolioData }) {
  const { identity } = data;
  const eyebrow = val(data, "mission.eyebrow");
  const ctaText = val(data, "mission.cta");
  const email = identity.email ?? "";
  const github = identity.github ?? "";
  const location = identity.location ?? "";
  const githubLabel = github.replace(/^https?:\/\/(www\.)?/i, "");

  return (
    <div className="sec-4-home-7 bg-neutral-50 pt-120 pb-120">
        <div className="container-2200 px-lg-5 px-3">
          <div className="row g-4 g-xl-5 align-items-start">
            <div className="col-xl-3 col-lg-4 col-12">
              <div className="sec-4-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase">
                <span className="text-scramble" data-scramble-text={eyebrow}>{eyebrow}</span>
                <ArrowDiagIcon />
              </div>
              <div className="sec-4-home-7__frame overflow-hidden mt-4 at-hover-parallax" data-parallax-strength="18" data-parallax-scale="1.05">
                <CmsImage
                  data={data}
                  slot="mission-learning-path"
                  className="sec-4-home-7__img fix anim-zoomin"
                  width={900}
                  height={1040}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <div className="col-xl-9 col-lg-8 col-12">
              <h2 className="sec-4-home-7__title mb-4 mb-lg-5">
                <span className="reveal-text sec-4-home-7__title-part sec-4-home-7__title-part--950">
                  {val(data, "mission.text")}
                </span>
              </h2>
              <div className="sec-4-home-7__cta d-inline-flex align-items-stretch mb-60 at_fade_anim">
                <a href="#about" className="at-btn sec-4-home-7__cta-btn text-capitalize">
                  <span>
                    <span className="text-1">{ctaText}</span>
                    <span className="text-2">{ctaText}</span>
                  </span>
                </a>
                <a href="#about" className="sec-4-home-7__cta-circle d-inline-flex align-items-center justify-content-center text-white" aria-label={ctaText}>
                  <ArrowUpRightIcon />
                </a>
              </div>
              <div className="sec-4-home-7__locations row g-4 g-lg-5">
                <div className="col-lg-6 col-12">
                  <div className="d-flex gap-4">
                    <div className="sec-4-home-7__pin flex-shrink-0" aria-hidden="true">
                      <CmsImage data={data} slot="sec4-pin-icon" width={40} height={40} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <h3 className="sec-4-home-7__loc-title h6 mb-3 at-char-animation">{val(data, "mission.loc.title")}</h3>
                      <div className="sec-4-home-7__loc-body at_fade_anim">
                        {(val(data, "mission.loc.location") || location) && (
                          <p className="mb-2">{val(data, "mission.loc.location") || location}</p>
                        )}
                        {email && (
                          <p className="mb-2">
                            {val(data, "mission.loc.email_label")} <a href={`mailto:${email}`} className="sec-4-home-7__loc-strong">{email}</a>
                          </p>
                        )}
                        {github && (
                          <p className="mb-2">
                            {val(data, "mission.loc.github_label")} <a href={github} target="_blank" rel="noopener" className="sec-4-home-7__loc-strong">{githubLabel}</a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-12">
                  <div className="sec-4-home-7__loc-body sec-4-home-7__loc-body--solo ps-lg-4 at_fade_anim">
                    <p className="mb-2">{val(data, "mission.edu.degree")}</p>
                    <p className="mb-2">
                      Institute: <span className="sec-4-home-7__loc-strong">{val(data, "mission.edu.institute")}</span>
                    </p>
                    <p className="mb-2">
                      Semester: <span className="sec-4-home-7__loc-strong">{val(data, "mission.edu.semester")}</span>
                    </p>
                    <p className="mb-0">
                      GPA: <span className="sec-4-home-7__loc-strong">{val(data, "mission.edu.gpa")}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
