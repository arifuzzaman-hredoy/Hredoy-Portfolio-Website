import { Fragment } from "react";
import { getProjectImage } from "@/lib/cms-render";
import { optimizeCloudinaryUrl, safeHref, val, type PortfolioData } from "@/lib/portfolio-data";
import { ArrowDiagIcon } from "../Icons";

const PROJECT_SUMMARIES: Record<string, string> = {
  "devsecops-monitoring-kubernetes":
    "Production Kubernetes cluster deployment with Trivy container vulnerability scanning, Prometheus metrics scraping, and real-time Grafana observability dashboards.",
  "automated-cicd-pipeline":
    "End-to-end automated continuous integration and delivery pipeline with GitHub Actions, multi-stage Docker builds, GHCR registry, and zero-downtime deployment.",
  "aws-cloud-infrastructure-ec2":
    "Scalable AWS cloud hosting with custom VPC, public/private subnets, EC2 instances, EBS storage volumes, IAM security policies, and CloudWatch monitoring.",
  "terraform-infrastructure-as-code":
    "Declarative, modular Infrastructure as Code provisioning cloud resources, remote state locking with S3 & DynamoDB, and repeatable multi-environment architecture.",
  "docker-compose-multi-tier":
    "Multi-tier microservices orchestration connecting frontend, Go REST API, PostgreSQL database, and Redis cache with isolated Docker bridge networks and volumes.",
  "nginx-reverse-proxy-domain-ssl":
    "High-performance Nginx edge reverse proxy with Let's Encrypt SSL/TLS termination, HTTP/2 optimization, security headers, rate limiting, and custom domain routing.",
};

export default function ProjectsSection({ data }: { data: PortfolioData }) {
  const eyebrow = val(data, "projects.eyebrow");
  const titleParts = val(data, "projects.title").split(/\r?\n|\s+/).filter(Boolean);
  const github = data.identity.github ?? "";
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
            <a href="#other-projects" className="sec-10-home-7__btn-all d-inline-flex align-items-center gap-2 at_fade_anim">
              <span>{val(data, "projects.cta")}</span>
              <ArrowDiagIcon />
            </a>
          </div>
        </div>

        <div className="row g-4 sec-10-home-7__grid">
          {featured.map((project) => {
            const imgKey = `project-${project.slug}`;
            const rawImg = (data.images && data.images[imgKey]) || getProjectImage(project);
            const imgUrl = optimizeCloudinaryUrl(rawImg);
            const repoHref = safeHref(project.repo_url);
            const liveHref = safeHref(project.live_url, "");
            const summary =
              (project.summary && project.summary.trim()) ||
              (project.description && project.description.trim()) ||
              PROJECT_SUMMARIES[project.slug] ||
              "";

            return (
              <div key={project.slug || project.title} className="project-card col-lg-4 col-md-6 col-12 mb-0" data-category="">
                <div className="card h-100 project-card-wrapper border-0 shadow-sm d-flex flex-column">
                  {/* Snug 16:9 thumbnail container matching diagram aspect ratio */}
                  <div className="blog-card__thumb hover-effect-1 project-thumb position-relative overflow-hidden">
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        className="blog-card__img22 project-img"
                        alt={project.title}
                        width={1600}
                        height={900}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                  {/* Rich project content with summary and theme-adaptive pill action button */}
                  <div className="blog-card__content p-4 d-flex flex-column justify-content-between" style={{ flex: 1 }}>
                    <div>
                      <h3 className="h6 blog-card__title mb-2">{project.title}</h3>
                      <p className="blog-card__meta mb-3">
                        <span className="blog-card__meta-text">{project.tech}</span>
                      </p>
                      {summary && (
                        <p className="project-card__summary mb-4">
                          {summary}
                        </p>
                      )}
                    </div>
                    <div className="project-card__actions d-flex align-items-center gap-2 mt-auto pt-2">
                      <a
                        href={repoHref}
                        target="_blank"
                        rel="noopener"
                        className="btn-project-pill d-inline-flex align-items-center gap-2"
                      >
                        <span>View Project</span>
                        <ArrowDiagIcon />
                      </a>
                      {liveHref && (
                        <a
                          href={liveHref}
                          target="_blank"
                          rel="noopener"
                          className="btn-project-pill btn-project-pill--live d-inline-flex align-items-center gap-2"
                        >
                          <span>Live Demo</span>
                          <ArrowDiagIcon />
                        </a>
                      )}
                    </div>
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
