import { listItems, type PortfolioData } from "@/lib/portfolio-data";
import { ArrowRightIcon, BrandLogo } from "../Icons";

export default function SearchOverlay({ data }: { data: PortfolioData }) {
  const popularTags = listItems(data, "hero.tags").map((item) => item.title).filter(Boolean);

  return (
    <>
      <div className="at-search-body-overlay" />
      <div className="at-search-form-toggle">
        <div className="container">
          <div className="row mb-60">
            <div className="col-lg-12">
              <div className="at-search-top d-flex justify-content-between align-items-center">
                <div className="at-header-logo at-search-logo">
                  <BrandLogo data={data} />
                </div>
                <button className="at-search-close" aria-label="Close search">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="at-search-form">
                <form action="#">
                  <div className="at-search-form-input">
                    <input type="text" placeholder="Find what you need…" required />
                    <span className="at-search-focus-border" />
                    <button className="at-search-form-btn at-btn" type="submit">
                      <span>
                        <span className="text-1">Search</span>
                        <span className="text-2">Search</span>
                      </span>
                      <i className="icon-arrow-right">
                        <ArrowRightIcon />
                        <ArrowRightIcon />
                      </i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-12">
              <div className="at-categories">
                <h3 className="at-categories-title">Popular searches</h3>
                <ul className="at-categories-list">
                  {popularTags.map((tag) => (
                    <li key={tag}>
                      <a href="#" className="at-categories-item">
                        {tag}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
