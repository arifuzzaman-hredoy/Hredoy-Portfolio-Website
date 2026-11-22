import { Fragment } from "react";
import { listItems, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";

function MarqueeRow({
  data,
  items,
  direction,
}: {
  data: PortfolioData;
  items: string[];
  direction: "left" | "right";
}) {
  const doubled = [...items, ...items];
  return (
    <div className="sec-9-home-7__row">
      <div className={`sec-9-home-7__ticker py-3 changeless carouselTicker carouselTicker-${direction}`}>
        <ul className={`d-flex align-items-center gap-4 carouselTicker__list scroll-move-${direction} list-unstyled mb-0 sec-9-home-7__list`}>
          {doubled.map((item, idx) => (
            <Fragment key={`${direction}-${item}-${idx}`}>
              <li className="sec-9-home-7__item">{item}</li>
              <li className="sec-9-home-7__sep">
                <CmsImage data={data} slot="marquee-star" />
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function MarqueeSection({ data }: { data: PortfolioData }) {
  const items = listItems(data, "marquee.items").map((item) => item.title).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <div className="sec-9-home-7 py-4">
      <MarqueeRow data={data} items={items} direction="left" />
      <MarqueeRow data={data} items={items} direction="right" />
    </div>
  );
}
