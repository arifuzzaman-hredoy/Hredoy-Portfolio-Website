import { listItems, val, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";

export default function CtaSection({ data }: { data: PortfolioData }) {
  const eyebrow = val(data, "cta.eyebrow");
  const ctaText = val(data, "cta.cta");
  const features = listItems(data, "cta.list");

  return (
    <div className="sec-7-home-7 overflow-hidden py-4">
      <div className="container-2200 px-lg-5 px-3 py-120">
        <div className="row align-items-center g-4 g-xxl-5">
          <div className="col-xxl-5 col-xl-6 col-12">
            <div className="sec-7-home-7__media">
              <div className="anim-zoomin-wrap" style={{ overflow: "hidden" }}>
                <div className="fix anim-zoomin">
                  <CmsImage
                    data={data}
                    slot="cta-connect"
                    width={1500}
                    height={1000}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-7 col-xl-6 col-12">
            <div className="sec-7-home-7__content ms-xxl-4">
              <div className="sec-7-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-3 text-uppercase">
                <span className="text-scramble" data-scramble-text={eyebrow}>{eyebrow}</span>
                <CmsImage data={data} slot="sec7-eyebrow-arrow" className="sec-7-home-7__eyebrow-icon" width={14} height={13} />
              </div>

              <p className="sec-7-home-7__headline mb-4 mb-lg-40 reveal-text">{val(data, "cta.desc")}</p>

              <ul className="sec-7-home-7__features list-unstyled mb-4 mb-lg-60">
                {features.map((item, idx) => (
                  <li key={item.id} className="sec-7-home-7__feature at_fade_anim" data-delay={((idx + 1) * 0.1).toFixed(1)}>
                    <CmsImage data={data} slot="sec7-plus" width={18} height={18} aria-hidden="true" />
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>

              <div className="sec-7-home-7__cta d-inline-flex align-items-stretch at_fade_anim">
                <a href="#contact" className="at-btn sec-7-home-7__cta-btn">
                  <span>
                    <span className="text-1">{ctaText}</span>
                    <span className="text-2">{ctaText}</span>
                  </span>
                </a>
                <a href="#contact" className="sec-7-home-7__cta-circle" aria-label={ctaText}>
                  <CmsImage data={data} slot="sec7-btn-arrow" width={24} height={24} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sec-7-home-7__star" aria-hidden="true">
        <CmsImage data={data} slot="sec7-rotating" width={100} height={100} />
      </div>
    </div>
  );
}
