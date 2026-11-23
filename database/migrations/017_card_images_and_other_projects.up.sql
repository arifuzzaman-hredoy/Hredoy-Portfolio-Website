-- Update About CI/CD card image to real CI/CD photo, restore clean DevOps process graphics,
-- and enrich remaining projects with tech stacks and descriptions for "Other Projects".

-- 1. Update About CI/CD image slot
UPDATE site_images
SET url = 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/blog-cicd.jpg',
    default_url = 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/blog-cicd.jpg',
    alt = 'Automated CI/CD build, test and deployment pipeline',
    default_alt = 'Automated CI/CD build, test and deployment pipeline',
    updated_at = NOW()
WHERE key = 'about-cicd';

-- 2. Restore clean DevOps process diagrams
UPDATE site_images AS s
SET url = v.url,
    default_url = v.url,
    alt = v.alt,
    default_alt = v.alt,
    updated_at = NOW()
FROM (VALUES
  ('process-1-fundamentals', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-1-fundamentals.svg', 'Linux Administration & Shell Fundamentals'),
  ('process-2-practice', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-2-practice.svg', 'Docker & Containerization Practice'),
  ('process-3-projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-3-projects.svg', 'CI/CD & Cloud Project Engineering'),
  ('process-4-improvement', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-4-improvement.svg', 'Monitoring, Metrics & Continuous Improvement')
) AS v(key, url, alt)
WHERE s.key = v.key;

UPDATE content_items
SET meta = jsonb_set(meta, '{image}', '"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-1-fundamentals.svg"'),
    updated_at = NOW()
WHERE parent_key = 'process.cards' AND sort_order = 1;

UPDATE content_items
SET meta = jsonb_set(meta, '{image}', '"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-2-practice.svg"'),
    updated_at = NOW()
WHERE parent_key = 'process.cards' AND sort_order = 2;

UPDATE content_items
SET meta = jsonb_set(meta, '{image}', '"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-3-projects.svg"'),
    updated_at = NOW()
WHERE parent_key = 'process.cards' AND sort_order = 3;

UPDATE content_items
SET meta = jsonb_set(meta, '{image}', '"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-4-improvement.svg"'),
    updated_at = NOW()
WHERE parent_key = 'process.cards' AND sort_order = 4;

-- 3. Update tech stack and summaries for remaining projects (projects 7-15)
UPDATE projects AS p
SET tech = v.tech,
    summary = v.summary
FROM (VALUES
  ('docker-containerization-platform', 'Docker, Dockerfile, Container Isolation', 'Hands-on containerization lab isolating services with Docker.'),
  ('production-linux-server-administration', 'Linux, Systemd, SSH, Hardening', 'Production Linux server setup, service management, and security hardening.'),
  ('devops-network-engineering-lab', 'Networking, DNS, TCP/IP, Firewalls', 'Network configuration, subnetting, DNS routing, and firewall rules for DevOps.'),
  ('bash-git-devops-automation-toolkit', 'Bash, Shell Scripting, Git, Automation', 'Shell scripting automation toolkit for recurring administrative DevOps workflows.'),
  ('git-version-control-lab', 'Git, Branching Strategy, Rebasing', 'Deep-dive version control lab practicing advanced branching and merge strategies.'),
  ('github-collaboration-lab', 'GitHub, Pull Requests, Code Reviews', 'Team collaboration patterns, protected branches, and review automation.'),
  ('devops-workflow-sdlc-lab', 'SDLC, DevOps, Release Management', 'End-to-end SDLC pipeline mapping code commit to release deployment.'),
  ('nexora-three-tier-infrastructure', 'Architecture, Nginx, App, PostgreSQL', 'Full three-tier architecture deployment with reverse proxy and database.'),
  ('taskflow-devops-platform', 'Python, Docker, CI/CD, Live Demo', 'Production Python web application packaged and deployed with live URL.')
) AS v(slug, tech, summary)
WHERE p.slug = v.slug;
