import { Fragment } from "react";
import { getProjectImage } from "@/lib/cms-render";
import { optimizeCloudinaryUrl, safeHref, val, type PortfolioData } from "@/lib/portfolio-data";
import { ArrowDiagIcon } from "../Icons";

export default function ProjectsSection({ data }: { data: PortfolioData }) {
  const eyebrow = val(data, "projects.eyebrow");
  const titleParts = val(data, "projects.title").split(/\r?\n|\s+/).filter(Boolean);
  const github = data.identity.github ?? "";
  const allUrl = safeHref(github ? `${github.replace(/\/$/, "")}?tab=repositories` : "");
  const visible = [...data.projects].filter((p) => p.published).sort((a, b) => a.sort_order - b.sort_order);
  const featured = visible.slice(0, 6);

  return (
    <div className="sec-10-home-7 bg-neutral-0 pt-120 pb-120" id="projects">
      <div className="container-2200 px-lg-5 px-3">
        <div className="row align-items-end mb-50">
          <div className="col-xl-4 col-lg-4 col-12">
            <a href={safeHref(github)} target="_blank" rel="noopener" className="sec-10-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase">
              <span className="text-scramble" data-scramble-text={eyebrow}>{eyebrow}</span>
              <ArrowDiagIcon />
            </a>
            <h2 className="sec-10-home-7__title mb-0 reveal-text">
              {titleParts.map((part, idx) => (
                <Fragment key={`${part}-${idx}`}>
                  {idx > 0 && (
                    <>
                      {" "}
                      <br className="d-none d-sm-inline" />
                    </>
                  )}
                  {part}
                </Fragment>
              ))}
            </h2>
          </div>
          <div className="col-xl-5 col-lg-6 col-12 mt-4 mt-xl-0">
            <p className="sec-10-home-7__lead mb-0 reveal-text">{val(data, "projects.desc")}</p>
          </div>
          <div className="col-xl-3 col-lg-12 mt-4 mt-lg-4 mt-xl-0 ms-xl-auto text-xl-end">
            <a href={allUrl} target="_blank" rel="noopener" className="sec-10-home-7__btn-all d-inline-flex align-items-center gap-2 at_fade_anim">
              <span>{val(data, "projects.cta")}</span>
              <ArrowDiagIcon />
            </a>
          </div>
        </div>

        <div className="row g-3 sec-10-home-7__grid">
          {featured.map((project) => {
            const imgUrl = optimizeCloudinaryUrl(getProjectImage(project));
            const repoHref = safeHref(project.repo_url);
            const liveHref = safeHref(project.live_url, "");
            return (
              <div key={project.slug || project.title} className="project-card col-lg-4 col-md-6 col-12 mb-0" data-category="">
                <div className="card h-100 project-card-wrapper border-0 shadow-sm d-flex flex-column">
                  <div className="blog-card__thumb hover-effect-1 project-thumb position-relative overflow-hidden" style={{ height: "230px", flexShrink: 0 }}>
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        className="blog-card__img22 project-img"
                        alt={project.title}
                        width={1600}
                        height={800}
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                      />
                    )}
                  </div>
                  <div className="blog-card__content p-4 d-flex flex-column justify-content-between" style={{ flex: 1 }}>
                    <h2 className="h6 blog-card__title mb-2">{project.title}</h2>
                    <p className="blog-card__meta mb-3">
                      <span className="blog-card__meta-text">{project.tech}</span>
                    </p>
                    <div className="project-card__actions d-flex gap-2">
                      <a href={repoHref} target="_blank" rel="noopener" className="btn btn-primary btn-view-project">
                        View Project
                      </a>
                      {liveHref && (
                        <a href={liveHref} target="_blank" rel="noopener" className="btn btn-view-live">
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sec-10-home-7__all mt-50">
          <h3 className="h6 mb-3">All {visible.length} Projects</h3>
          <ul className="list-unstyled d-flex flex-wrap gap-3 mb-0">
            {visible.map((project, idx) => {
              const label = `${String(idx + 1).padStart(2, "0")}. ${project.title}`;
              const repoHref = safeHref(project.repo_url);
              const liveHref = safeHref(project.live_url, "");
              return (
                <li key={project.slug || project.title}>
                  <a href={repoHref} target="_blank" rel="noopener">{label}</a>
                  {liveHref && (
                    <>
                      {" "}
                      <a href={liveHref} target="_blank" rel="noopener" style={{ color: "var(--at-theme-primary)", fontWeight: 600 }}>
                        Live
                      </a>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
