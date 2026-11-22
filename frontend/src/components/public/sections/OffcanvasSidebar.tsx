import { listItems, metaText, safeHref, val, type PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "../CmsImage";
import { BrandLogo, SocialIcon } from "../Icons";

function SocialLinks({ data }: { data: PortfolioData }) {
  const socials = listItems(data, "footer.socials").filter((item) => {
    const label = item.title.toLowerCase();
    return label.includes("github") || label.includes("linkedin") || label.includes("email");
  });

  return (
    <ul className="at-offcanvas-social__grid">
      {socials.map((item) => {
        const href = safeHref(metaText(item, "href"));
        return (
          <li key={item.id}>
            <a href={href} className="at-offcanvas-social__link" aria-label={item.title}>
              <SocialIcon name={item.title} />
              <span>{item.title}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

const OFFCANVAS_AVATARS = [
  "avatar-linux",
  "avatar-docker",
  "avatar-aws",
  "avatar-github-actions",
  "avatar-terraform",
];

export default function OffcanvasSidebar({ data }: { data: PortfolioData }) {
  const { identity } = data;
  const email = identity.email ?? "";
  const github = identity.github ?? "";
  const linkedin = identity.linkedin ?? "";
  const location = identity.location ?? "";
  const githubLabel = github.replace(/^https?:\/\/(www\.)?/i, "");
  const linkedinLabel = linkedin.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");

  return (
    <>
      <div className="at-offcanvas-area">
        <div className="at-offcanvas">
          <div className="at-offcanvas-top d-flex align-items-center justify-content-between">
            <div className="at-offcanvas-logo">
              <BrandLogo data={data} />
            </div>
            <div className="at-offcanvas-close-btn">
              <button className="close-btn" aria-label="Close menu">
                <svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9.19141 9.80762L27.5762 28.1924" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.19141 28.1924L27.5762 9.80761" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="at-offcanvas-content d-none d-xl-block">
            <h3 className="at-offcanvas-title">Hi, I&apos;m {identity.owner_name ?? ""}</h3>
            <p className="fz-font-lg">{identity.bio ?? ""}</p>
          </div>
          <div className="at-offcanvas-menu d-xl-none pb-50">
            <nav />
          </div>
          <div className="at-offcanvas-gallery d-none d-xl-block">
            <div className="sec-2-home-5__avatars-row d-flex gap-2">
              {OFFCANVAS_AVATARS.map((slot) => (
                <div key={slot} className="sec-2-home-5__avatar-sm at-offcanvas-gallery-img">
                  <CmsImage data={data} slot={slot} className="img-cover" width={103} height={103} />
                </div>
              ))}
            </div>
          </div>
          <div className="at-offcanvas-contact">
            <h4 className="h5 at-offcanvas-title sm">{val(data, "contact.title")}</h4>
            <ul>
              {email && (
                <li>
                  <a className="fz-font-lg" href={`mailto:${email}`}>{email}</a>
                </li>
              )}
              {github && (
                <li>
                  <a className="fz-font-lg" href={github} target="_blank" rel="noopener">{githubLabel}</a>
                </li>
              )}
              {linkedin && (
                <li>
                  <a className="fz-font-lg" href={linkedin} target="_blank" rel="noopener">{linkedinLabel}</a>
                </li>
              )}
              {location && (
                <li>
                  <span className="fz-font-lg">{location}</span>
                </li>
              )}
            </ul>
          </div>
          <div className="at-offcanvas-social">
            <p className="fz-font-lg">Find Me Online</p>
            <SocialLinks data={data} />
          </div>
        </div>
      </div>
      <div className="body-overlay" />

      <div className="at-offcanvas-2-area">
        <div className="offcanvas-bg" />
        <div className="at-offcanvas-2-wrapper offcanvas-menu">
          <div className="at-offcanvas-2-left">
            <div className="at-header-logo d-flex justify-content-between align-items-center mb-50">
              <BrandLogo data={data} />
              <span className="hamburger-close-btn">
                <svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9.19141 9.80762L27.5762 28.1924" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.19141 28.1924L27.5762 9.80761" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <div className="at-offcanvas-menu counter-row">
              <nav />
            </div>
            <div className="at-offcanvas-social">
              <SocialLinks data={data} />
            </div>
            <span className="hamburger-close-btn hamburger-mobile-close-btn d-md-none">CLOSE</span>
          </div>
        </div>
      </div>
    </>
  );
}
