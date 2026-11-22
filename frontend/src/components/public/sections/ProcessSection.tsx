import { listItems, metaText, val, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";
import { ArrowDiagIcon } from "../Icons";

export default function ProcessSection({ data }: { data: PortfolioData }) {
  const eyebrow = val(data, "process.eyebrow");
  const chips = listItems(data, "process.chips");
  const cards = listItems(data, "process.cards");

  return (
    <div className="sec-6-home-7 p-relative bg-neutral-0">
      <div className="container-2200 px-lg-5 px-3">
        <div className="sec-6-home-7__header row g-0 pt-100 pb-50">
          <div className="col-lg-7 col-12">
            <a href="#skills" className="sec-6-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-3 text-uppercase">
              <span className="text-scramble" data-scramble-text={eyebrow}>{eyebrow}</span>
              <ArrowDiagIcon />
            </a>
            <h2 className="sec-6-home-7__title mb-0 reveal-text">{val(data, "process.title")}</h2>
          </div>
          <div className="col-lg-5 col-12 mt-4 mt-lg-0 d-flex align-items-end justify-content-lg-end">
            <p className="sec-6-home-7__desc text-lg-end mb-0 at_fade_anim">{val(data, "process.desc")}</p>
          </div>
        </div>

        <div className="sec-6-home-7__chips d-none d-lg-flex flex-column mb-80">
          {chips.map((chip, idx) => (
            <span
              key={chip.id}
              className={`sec-6-home-7__chip sec-6-home-7__chip--${idx + 1} at_fade_anim`}
              data-fade-offset={idx > 0 ? "100" : undefined}
              data-delay={((idx + 1) * 0.1).toFixed(1)}
            >
              <span className="sec-6-home-7__chip-text">{chip.title}</span>
            </span>
          ))}
        </div>

        <div className="sec-6-home-7__cards pb-120">
          {cards.map((card, idx) => {
            const num = metaText(card, "number") || `[${String(idx + 1).padStart(2, "0")}]`;
            const imageSlot = metaText(card, "image");
            return (
              <div key={card.id} className="sec-6-home-7__card-wrap at_fade_anim" data-delay={(0.1 + idx * 0.2).toFixed(1)}>
                <div className="sec-6-home-7__card">
                  <div className="sec-6-home-7__card-body">
                    <p className="sec-6-home-7__card-num mb-0">{num}</p>
                    <h3 className="sec-6-home-7__card-title mb-0">{card.title}</h3>
                    <p className="sec-6-home-7__card-desc mb-0">{card.body}</p>
                  </div>
                  <div className="sec-6-home-7__card-media">
                    {imageSlot && <CmsImage data={data} slot={imageSlot} altFallback={card.title} width={1200} height={900} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
