import { Fragment } from "react";
import { val, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";
import { ArrowDiagIcon, ArrowUpRightIcon } from "../Icons";

export default function WhoIAmSection({ data }: { data: PortfolioData }) {
  const { identity } = data;
  const eyebrow = val(data, "whoami.eyebrow");
  const ctaText = val(data, "whoami.cta");
  const ownerName = val(data, "whoami.name") || (identity.owner_name ?? "");
  const nameParts = ownerName.split(/\s+/).filter(Boolean);
  const role = val(data, "whoami.role") || (identity.role ?? "");
  const rawQuote = val(data, "whoami.quote");
  const quote = rawQuote ? `"${rawQuote.replace(/^["“]|["”]$/g, "")}"` : "";

  return (
    <div className="sec-8-home-7 p-relative bg-neutral-0">
      <div className="container-2200 px-lg-5 px-3">
        <div className="row g-0 align-items-start">
          <div className="col-xl-5 col-lg-5 col-12 sec-8-home-7__lead">
            <a href="#about" className="sec-8-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase">
              <span className="text-scramble" data-scramble-text={eyebrow}>{eyebrow}</span>
              <ArrowDiagIcon />
            </a>

            <h2 className="sec-8-home-7__heading mb-40 reveal-text">{val(data, "whoami.title")}</h2>

            <p
              className="sec-8-home-7__desc mb-4 reveal-text"
              dangerouslySetInnerHTML={{ __html: val(data, "whoami.paragraph") }}
            />
            <p className="sec-8-home-7__desc mb-40 reveal-text">
              <strong>{quote}</strong>
            </p>

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
          </div>

          <div className="col-xl-7 col-lg-7 col-12 mt-5 mt-lg-0">
            <div className="sec-8-home-7__grid">
              <div className="sec-8-home-7__col">
                <a href="#contact" className="sec-8-home-7__card" aria-label={`${ownerName} — ${role}`}>
                  <div className="sec-8-home-7__photo">
                    <div className="anim-zoomin-wrap">
                      <CmsImage data={data} slot="who-i-am-portrait" width={1122} height={748} />
                    </div>
                  </div>
                  <span className="sec-8-home-7__badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none" aria-hidden="true">
                      <path d="M12.57 3.905L2.74 13.74 1.26 12.26 11.095 2.43 2.29 2.43V0.33L14.42 0.33V12.46H12.32L12.57 3.905Z" fill="currentColor" />
                    </svg>
                  </span>
                  <div className="sec-8-home-7__info">
                    <h3 className="sec-8-home-7__name mb-0 at_fade_anim">
                      {nameParts.map((part, idx) => (
                        <Fragment key={`${part}-${idx}`}>
                          {idx > 0 && <br />}
                          {part}
                        </Fragment>
                      ))}
                    </h3>
                    <p className="sec-8-home-7__role mb-0 at_fade_anim" data-delay="0.1">{role}</p>
                  </div>
                </a>
              </div>
              <div className="sec-8-home-7__col sec-8-home-7__col--offset" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
