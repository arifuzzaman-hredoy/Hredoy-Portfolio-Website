import { safeHref, val, type PortfolioData } from "@/lib/portfolio-data";
import { ArrowDiagIcon, SocialIcon } from "../Icons";

export default function OtherProjectsSection({ data }: { data: PortfolioData }) {
  const visible = [...data.projects]
    .filter((p) => p.published)
    .sort((a, b) => a.sort_order - b.sort_order);

  // If 6 or fewer projects, all are shown in Featured Projects
  if (visible.length <= 6) return null;

  const otherProjects = visible.slice(6);
  const eyebrow = val(data, "projects.other.eyebrow") || "ENGINEERING LABS";
  const title = val(data, "projects.other.title") || "Other Projects";
  const desc =
    val(data, "projects.other.desc") ||
    "Additional hands-on engineering, automation labs, and infrastructure builds.";
  const github = data.identity.github ?? "";
  const allUrl = safeHref(github ? `${github.replace(/\/$/, "")}?tab=repositories` : "");

  return (
    <section className="other-projects-section pt-100 pb-100" id="other-projects">
      <div className="container-2200 px-lg-5 px-3">
        {/* Header */}
        <div className="row align-items-end mb-50">
          <div className="col-xl-6 col-lg-7 col-12">
            <span className="other-projects-eyebrow d-inline-flex align-items-center gap-2 mb-3 text-uppercase">
              <span className="text-scramble" data-scramble-text={eyebrow}>
                {eyebrow}
              </span>
              <ArrowDiagIcon />
            </span>
            <h2 className="other-projects-title mb-0">{title}</h2>
          </div>
          <div className="col-xl-4 col-lg-5 col-12 mt-4 mt-lg-0">
            <p className="other-projects-desc mb-0">{desc}</p>
          </div>
          <div className="col-xl-2 col-12 mt-4 mt-xl-0 text-xl-end">
            <a
              href={allUrl}
              target="_blank"
              rel="noopener"
              className="other-projects-all-btn d-inline-flex align-items-center gap-2"
              aria-label="View all repositories on GitHub"
            >
              <span>All GitHub Repos</span>
              <ArrowDiagIcon />
            </a>
          </div>
        </div>

        {/* Compact Grid */}
        <div className="row g-4">
          {otherProjects.map((project) => {
            const repoHref = safeHref(project.repo_url);
            const liveHref = safeHref(project.live_url, "");
            const techList = project.tech
              ? project.tech
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [];

            return (
              <div key={project.slug || project.title} className="col-lg-4 col-md-6 col-12">
                <div className="other-project-card h-100 d-flex flex-column justify-content-between">
                  <div>
                    {/* Card Top: Folder icon + External action links */}
                    <div className="other-project-card__top d-flex align-items-center justify-content-between mb-3">
                      <div className="other-project-card__folder" aria-hidden="true">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                        </svg>
                      </div>

                      <div className="other-project-card__links d-flex align-items-center gap-3">
                        {repoHref && (
                          <a
                            href={repoHref}
                            target="_blank"
                            rel="noopener"
                            className="other-project-icon-link"
                            aria-label={`GitHub repository for ${project.title}`}
                          >
                            <SocialIcon name="github" />
                          </a>
                        )}
                        {liveHref && (
                          <a
                            href={liveHref}
                            target="_blank"
                            rel="noopener"
                            className="other-project-icon-link"
                            aria-label={`Live demo for ${project.title}`}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Card Title & Summary */}
                    <h3 className="other-project-card__title mb-2">
                      {repoHref ? (
                        <a href={repoHref} target="_blank" rel="noopener">
                          {project.title}
                        </a>
                      ) : (
                        project.title
                      )}
                    </h3>
                    {project.summary && (
                      <p className="other-project-card__summary mb-3">{project.summary}</p>
                    )}
                  </div>

                  {/* Card Bottom: Tech Pills */}
                  {techList.length > 0 && (
                    <div className="other-project-card__tags d-flex flex-wrap gap-2 pt-2">
                      {techList.map((tech, tIdx) => (
                        <span key={tIdx} className="other-project-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
