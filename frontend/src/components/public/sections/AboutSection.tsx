import { val, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";
import { ArrowDiagIcon } from "../Icons";

export default function AboutSection({ data }: { data: PortfolioData }) {
  const eyebrow = val(data, "about.eyebrow");

  return (
    <div className="sec-2-home-7 p-relative bg-neutral-0" id="about">
      <div className="container-2200 px-lg-5 px-3">
        <div className="sec-2-home-7__intro row g-0 pt-100 pb-60">
          <div className="col-lg-7 col-12 pe-lg-4">
            <a href="#about" className="sec-2-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-30 text-uppercase">
              <span className="text-scramble" data-scramble-text={eyebrow}>{eyebrow}</span>
              <ArrowDiagIcon />
            </a>
            <h2 className="sec-2-home-7__headline mb-0">
              <span className="sec-2-home-7__headline-strong reveal-text">{val(data, "about.headline")}</span>
            </h2>
          </div>
          <div className="col-lg-5 col-12 mt-4 mt-lg-0 ps-lg-4 d-flex align-items-end">
            <p
              className="sec-2-home-7__desc mb-0 reveal-text"
              dangerouslySetInnerHTML={{ __html: val(data, "about.paragraph") }}
            />
          </div>
        </div>

        <div className="sec-2-home-7__grid">
          <div className="sec-2-home-7__row">
            <div className="sec-2-home-7__cell sec-2-home-7__cell--img sec-2-home-7__col-1">
              <div className="sec-2-home-7__img-wrap">
                <div className="thumb fix anim-zoomin">
                  <CmsImage data={data} slot="about-linux" dataSpeed=".8" width={1000} height={1080} />
                </div>
              </div>
            </div>
            <div className="sec-2-home-7__cell sec-2-home-7__cell--feature sec-2-home-7__col-2">
              <div className="ps-4">
                <div className="sec-2-home-7__feature-icon mb-3 at_fade_anim">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M40 20V0H20H0V20V40H20L40 20ZM40 20H20V40L0 20L20 0L40 20Z" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="sec-2-home-7__feature-title at-char-animation">{val(data, "about.feature.1.title")}</h3>
                <p className="sec-2-home-7__feature-desc mb-0 at_fade_anim">{val(data, "about.feature.1.desc")}</p>
              </div>
            </div>
            <div className="sec-2-home-7__cell sec-2-home-7__cell--stat sec-2-home-7__col-4">
              <h3 className="sec-2-home-7__stat-value mb-3">
                <span className="odometer" data-count={val(data, "stats.tools.value")}>0</span>+
              </h3>
              <p className="sec-2-home-7__stat-label mb-0 at_fade_anim">{val(data, "stats.tools.label")}</p>
            </div>
          </div>

          <div className="sec-2-home-7__row">
            <div className="sec-2-home-7__cell sec-2-home-7__cell--img sec-2-home-7__col-2">
              <div className="sec-2-home-7__img-wrap ms-2">
                <div className="thumb fix anim-zoomin">
                  <CmsImage data={data} slot="about-cloud" dataSpeed=".8" width={1000} height={1080} />
                </div>
              </div>
            </div>
            <div className="sec-2-home-7__cell sec-2-home-7__cell--feature sec-2-home-7__col-3">
              <div className="ps-4">
                <div className="sec-2-home-7__feature-icon mb-3 at_fade_anim">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <path d="M40 12L32 20V8H20L28 0H40V12Z" fill="currentColor" />
                    <path d="M8 20L20 8L32 20L20 32L8 20Z" fill="currentColor" />
                    <path d="M8 20L0 28V40H12L20 32L28 40H40V28L32 20V32H20H8V20Z" fill="currentColor" />
                    <path d="M8 20L0 12V0H12L20 8H8V20Z" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="sec-2-home-7__feature-title at-char-animation">{val(data, "about.feature.2.title")}</h3>
                <p className="sec-2-home-7__feat-desc mb-0 at_fade_anim" data-delay="0.1">{val(data, "about.feature.2.desc")}</p>
              </div>
            </div>
            <div className="sec-2-home-7__cell sec-2-home-7__cell--stat sec-2-home-7__col-5">
              <h3 className="sec-2-home-7__stat-value mb-3">
                <span className="odometer" data-count={val(data, "stats.projects.value")}>0</span>+
              </h3>
              <p className="sec-2-home-7__stat-label mb-0 at_fade_anim">{val(data, "stats.projects.label")}</p>
            </div>
          </div>

          <div className="sec-2-home-7__row">
            <div className="sec-2-home-7__cell sec-2-home-7__cell--stat sec-2-home-7__col-1">
              <h3 className="sec-2-home-7__stat-value mb-3">
                <span className="odometer" data-count={val(data, "stats.live.value")}>0</span>+
              </h3>
              <p className="sec-2-home-7__stat-label mb-0 at_fade_anim">{val(data, "stats.live.label")}</p>
            </div>
            <div className="sec-2-home-7__cell sec-2-home-7__cell--img sec-2-home-7__col-3">
              <div className="sec-2-home-7__img-wrap ms-2">
                <div className="thumb fix anim-zoomin">
                  <CmsImage data={data} slot="about-cicd" dataSpeed=".8" width={1000} height={1080} />
                </div>
              </div>
            </div>
            <div className="sec-2-home-7__cell sec-2-home-7__cell--feature sec-2-home-7__col-4">
              <div className="ps-4">
                <div className="sec-2-home-7__feature-icon mb-3 at_fade_anim">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M39.5 0.5L26.5 13.5L13.5 0.5L0.5 13.5V39.5L13.5 26.5L26.5 39.5L39.5 26.5V0.5ZM13.5 26.5V13.5H26.5V26.5H13.5Z" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="sec-2-home-7__feature-title at-char-animation">{val(data, "about.feature.3.title")}</h3>
                <p className="sec-2-home-7__feature-desc mb-0 at_fade_anim">{val(data, "about.feature.3.desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
