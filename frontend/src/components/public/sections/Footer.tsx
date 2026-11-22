import { isExternalHref, listItems, metaText, safeHref, val, type PortfolioData } from "@/lib/portfolio-data";
import { ArrowDiagIcon, SocialIcon } from "../Icons";

export default function Footer({ data }: { data: PortfolioData }) {
  const { identity } = data;
  const navItems = listItems(data, "footer.nav");
  const socials = listItems(data, "footer.socials");
  const bottomLinks = listItems(data, "footer.links");

  const github = identity.github ?? "";
  const linkedin = identity.linkedin ?? "";
  const email = identity.email ?? "";
  const location = identity.location ?? "";
  const githubLabel = github.replace(/^https?:\/\/(www\.)?/i, "");
  const linkedinLabel = linkedin.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
  const ownerName = identity.owner_name ?? "";
  const year = new Date().getFullYear();

  return (
    <footer className="footer-7 overflow-hidden">
      <div className="container-2200 px-lg-5 px-3">
        <div className="footer-7__top">
          <nav className="footer-7__nav" aria-label="Footer navigation">
            {navItems.map((item, idx) => {
              const href = safeHref(metaText(item, "href"));
              return (
                <a
                  key={item.id}
                  className="footer-7__nav-link at_fade_anim"
                  data-delay={((idx + 1) * 0.1).toFixed(1)}
                  href={href}
                  aria-current={href === "/" ? "page" : undefined}
                >
                  <span>{item.title}</span>
                  <ArrowDiagIcon className="footer-7__nav-arrow" />
                </a>
              );
            })}
          </nav>
        </div>

        <div className="footer-7__mid">
          <div className="row g-5">
            <div className="col-xxl-3 col-lg-4 col-md-6">
              <div className="alt-footer-social-item">
                <ul className="list-unstyled mb-0">
                  {socials.map((item, idx) => {
                    const href = safeHref(metaText(item, "href"));
                    const ext = isExternalHref(href);
                    return (
                      <li key={item.id} className="at_fade_anim" data-delay={((idx + 1) * 0.1).toFixed(1)}>
                        <a
                          href={href}
                          aria-label={item.title}
                          target={ext ? "_blank" : undefined}
                          rel={ext ? "noopener" : undefined}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div className="icon-social">
                              <SocialIcon name={item.title} />
                            </div>
                            {item.title}
                          </div>
                          <span className="icon-arrow-right">
                            <ArrowDiagIcon />
                            <ArrowDiagIcon />
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="col-xxl-3 d-none d-xxl-block pt-4" aria-hidden="true">
              <div className="row p-relative pt-4">
                <div className="pt-4">
                  <div className="col-4 ms-auto pt-4">
                    <div className="at-about-svg-wrap">
                      <svg xmlns="http://www.w3.org/2000/svg" width="57" height="91" viewBox="0 0 57 91" fill="none">
                        <path opacity="0.1" d="M0 0L56.4024 33.572V90.336L0 56.46V0Z" fill="#515151" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="113" height="68" viewBox="0 0 113 68" fill="none">
                        <path opacity="0.3" d="M0 33.876L56.4024 0L112.805 33.876V34.1294L56.4024 68.0054L0 34.1294V33.876Z" fill="#515151" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="57" height="91" viewBox="0 0 57 91" fill="none">
                        <path opacity="0.2" d="M56.4009 0L8.7738e-05 33.5367V90.2413L56.4009 56.4008V0Z" fill="#515151" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xxl-3 col-lg-4 col-md-6">
              <div className="footer-7__contact">
                {github && (
                  <p className="footer-7__contact-line mb-1 at_fade_anim" data-delay="0.1">
                    <a href={github}>{githubLabel}</a>
                  </p>
                )}
                {linkedin && (
                  <p className="footer-7__contact-line mb-1 at_fade_anim" data-delay="0.2">
                    <a href={linkedin}>{linkedinLabel}</a>
                  </p>
                )}
                {email && (
                  <p className="footer-7__contact-line mb-3 at_fade_anim" data-delay="0.3">
                    <a href={`mailto:${email}`}>{email}</a>
                  </p>
                )}
                {location && (
                  <p className="footer-7__address mb-0 at_fade_anim" data-delay="0.3">
                    {location}
                  </p>
                )}
                <p className="footer-7__contact-line mb-0 at_fade_anim" data-delay="0.3">
                  {val(data, "footer.tagline")}
                </p>

                <div className="footer-7__hours mt-30 at_fade_anim" data-delay="0.4">
                  <p className="footer-7__hours-label mb-1">{val(data, "footer.open")}</p>
                  <p className="footer-7__hours-value mb-0">{val(data, "footer.open_detail")}</p>
                </div>
              </div>
            </div>

            <div className="col-xxl-3 col-lg-4 col-md-6 ms-xxl-auto">
              <div className="footer-7__newsletter">
                <p className="footer-7__newsletter-title mb-3 at_fade_anim" data-delay="0.1">
                  {val(data, "footer.subscribe")}
                </p>
                <form className="footer-7__form at_fade_anim" data-delay="0.2" action="#" method="post">
                  <label className="visually-hidden" htmlFor="footer7Email">Email</label>
                  <input id="footer7Email" className="footer-7__input" type="email" name="email" placeholder="Email" required />
                  <button className="footer-7__submit" type="submit">
                    <span>
                      <span className="text-1">Subscribe</span>
                      <span className="text-2">Subscribe</span>
                    </span>
                    <i aria-hidden="true">
                      <ArrowDiagIcon />
                      <ArrowDiagIcon />
                    </i>
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="at_fade_anim text-center" data-delay="0.1">
            <h2 className="footer-7__word fw-900 mb-0 text-scale-anim" aria-hidden="true">
              {val(data, "footer.big_word")}
            </h2>
          </div>
        </div>

        <div className="footer-7__bottom" data-delay="0.1" data-start="10%">
          <div className="footer-7__bottom-inner d-flex flex-wrap gap-3 align-items-center justify-content-between">
            <span className="footer-7__copy">
              {val(data, "footer.copyright") || ownerName} © {year}
            </span>
            <ul className="footer-7__policies list-unstyled d-flex flex-wrap gap-3 mb-0">
              {bottomLinks.map((item) => {
                const href = safeHref(metaText(item, "href"));
                const ext = isExternalHref(href);
                return (
                  <li key={item.id}>
                    <a href={href} target={ext ? "_blank" : undefined} rel={ext ? "noopener" : undefined}>
                      {item.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
