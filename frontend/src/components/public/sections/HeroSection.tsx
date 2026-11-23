import { Fragment } from "react";
import { lines, listItems, val, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";

const HERO_BADGE_SLOTS = [
  "hero-badge-docker",
  "hero-badge-kubernetes",
  "hero-badge-aws",
  "hero-badge-terraform",
  "hero-badge-grafana",
];

export default function HeroSection({ data }: { data: PortfolioData }) {
  const brackets = lines(data, "hero.brackets");
  const tags = lines(data, "hero.tags");
  const floatChips = listItems(data, "hero.tags").slice(0, 5);
  const proofLines = lines(data, "hero.proof");
  const ctaText = val(data, "hero.cta");

  return (
    <div className="sec-1-home-7 p-relative z-index-1 overflow-hidden">
      <div className="sec-1-home-7__bg d-flex">
        <div className="sec-1-home-7__bg-left" />
        <div className="sec-1-home-7__bg-right" />
      </div>

      <div className="sec-1-home-7__star d-none d-lg-flex">
        <CmsImage
          data={data}
          slot="star-asterisk"
          className="at-scroll-rotate"
          data-rotate-duration="18"
          data-rotate-sensitivity="0.18"
          data-rotate-boost="12"
        />
      </div>

      <div className="sec-1-home-7__img-wrap">
        <div className="anim-zoomin-wrap" style={{ overflow: "hidden" }}>
          <div className="anim-zoomin">
            <CmsImage
              data={data}
              slot="hero-portrait"
              className="sec-1-home-7__img"
              width={1024}
              height={1053}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
        {floatChips.map((chip) => (
          <span key={chip.id} className="hero-float-chip" aria-hidden="true">
            {chip.title}
          </span>
        ))}
      </div>

      <div className="container-2200 px-lg-5 px-3 p-relative z-index-1">
        <div className="row g-0 align-items-center">
          <div className="col-lg-6 p-relative sec-1-home-7__left" />
          <div className="col-lg-6 sec-1-home-7__right">
            <div className="sec-1-home-7__content">
              <ul className="sec-1-home-7__brackets list-unstyled d-flex flex-wrap gap-4 mb-30">
                {brackets.map((item, idx) => (
                  <li key={`${item}-${idx}`} className="at_fade_anim" data-on-scroll="0" data-delay={String(idx * 0.1)}>
                    [ {item} ]
                  </li>
                ))}
              </ul>

              <div className="sec-1-home-7__headline-wrap p-relative">
                <h1 className="sec-1-home-7__headline text-white text-uppercase fw-700 mb-30 at_fade_anim" data-on-scroll="0" data-delay="0">
                  <span className="sec-1-home-7__headline-line">{val(data, "hero.headline.1")}</span>
                  <span className="sec-1-home-7__headline-line">{val(data, "hero.headline.2")}</span>
                  <span className="sec-1-home-7__headline-line">{val(data, "hero.headline.3")}</span>
                </h1>
                <span className="sec-1-home-7__headline-arrow-cover d-none d-md-inline-block">
                  <span className="sec-1-home-7__headline-arrow at_fade_anim" data-on-scroll="0" data-delay="0.1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="70" height="53" viewBox="0 0 69 53" fill="none" aria-hidden="true">
                      <path d="M40.2 0L67.72 25.4267L69 26.7141L67.72 27.6797L40.2 53.1064L38.6 51.4971L64.2 27.6797H-59V25.4267H64.2L38.6 1.60928L40.2 0Z" fill="currentColor" />
                    </svg>
                  </span>
                </span>
              </div>

              <p className="sec-1-home-7__desc text-white mb-40 at_fade_anim" data-on-scroll="0" data-delay="0.2">
                {val(data, "hero.desc")}
              </p>

              <div className="sec-1-home-7__cta d-flex align-items-center flex-wrap gap-2 mb-60">
                <a href="#contact" className="sec-1-home-7__cta-btn at_fade_anim" data-on-scroll="0" data-delay="0.3">
                  <span>{ctaText}</span>
                </a>
                <a href="#contact" className="sec-1-home-7__cta-arrow" aria-label={ctaText}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path d="M0.21967 9.40717C-0.0732232 9.70006 -0.0732232 10.1749 0.21967 10.4678C0.512563 10.7607 0.987437 10.7607 1.28033 10.4678L0.21967 9.40717ZM10.6875 0.75C10.6875 0.335786 10.3517 2.97145e-09 9.9375 1.50485e-07L3.1875 -2.70983e-07C2.77329 -2.70983e-07 2.4375 0.335786 2.4375 0.75C2.4375 1.16421 2.77329 1.5 3.1875 1.5H9.1875V7.5C9.1875 7.91421 9.52329 8.25 9.9375 8.25C10.3517 8.25 10.6875 7.91421 10.6875 7.5L10.6875 0.75ZM0.75 9.9375L1.28033 10.4678L10.4678 1.28033L9.9375 0.75L9.40717 0.21967L0.21967 9.40717L0.75 9.9375Z" fill="currentColor" />
                  </svg>
                </a>
              </div>

              <div className="sec-1-home-7__meta">
                <div className="sec-1-home-7__proof">
                  <p className="sec-1-home-7__proof-text text-white fw-700 mb-0 at_fade_anim" data-on-scroll="0" data-delay="0.3">
                    {proofLines.map((line, idx) => (
                      <Fragment key={`${line}-${idx}`}>
                        {idx > 0 && <br className="d-none d-xl-inline" />}
                        {line}
                      </Fragment>
                    ))}
                  </p>
                  <div className="sec-1-home-7__avatars">
                    {HERO_BADGE_SLOTS.map((slot, idx) => (
                      <span key={slot} className="sec-1-home-7__avatar at_fade_anim" data-on-scroll="0" data-delay={String(idx * 0.1)}>
                        <span className="sec-1-home-7__badge" tabIndex={0} title={data.imageAlts[slot] ?? ""}>
                          <CmsImage data={data} slot={slot} width={36} height={36} loading="eager" decoding="async" />
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sec-1-home-7__tags">
                  {tags.map((tag, idx) => (
                    <a key={`${tag}-${idx}`} href="#skills" className="sec-1-home-7__tag at_fade_anim" data-on-scroll="0" data-delay={String(idx * 0.1)}>
                      <span>{tag}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none" aria-hidden="true">
                        <path d="M5.62494 9.99994L0.562517 10L0.5625 8.75003L4.49994 8.74996L4.5 2.39273L2.27828 4.86124L1.48278 3.97739L5.0625 0L8.64225 3.97739L7.84676 4.86124L5.625 2.3927L5.62494 9.99994Z" fill="currentColor" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
