-- Repeatable content lists for the admin-controlled public site.
--
-- Each row is one item in a named list (parent_key). The shape of an item is
-- defined in backend/internal/http/lists_schema.go: every list uses the same
-- three payload columns (title, body, meta) and differs only in which meta keys
-- it declares. Keeping one table means one admin editor, one API and one
-- renderer cover every list on the page.
--
-- meta holds the per-list extras: {"href":"#skills"} for link lists,
-- {"tags":["Ubuntu","Bash"]} for the skills accordions,
-- {"image":"...","image_alt":"...","delay":"0.1"} for the process cards, and
-- {"icon":"github"} (an allow-listed key, never raw SVG) for the socials.

CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_key TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The public API always reads one list in sort order; the admin reads the same.
CREATE INDEX IF NOT EXISTS idx_content_items_parent_sort
  ON content_items (parent_key, sort_order);

-- ---------------------------------------------------------------------------
-- Seed: every list already rendered by the template, as defaults.
-- ---------------------------------------------------------------------------

-- Hero skill pills (one row, one line).
INSERT INTO content_items (parent_key, title, body, meta, sort_order, published) VALUES
  ('hero.tags', 'Linux', '', '{}'::jsonb, 1, TRUE),
  ('hero.tags', 'CI/CD', '', '{}'::jsonb, 2, TRUE),
  ('hero.tags', 'Git', '', '{}'::jsonb, 3, TRUE),
  ('hero.tags', 'Nginx', '', '{}'::jsonb, 4, TRUE),
  ('hero.tags', 'GitHub Actions', '', '{}'::jsonb, 5, TRUE);

-- Navbar dropdowns. The offcanvas menu clones this markup in main.js, so the
-- nav is modelled once and the clone follows.
INSERT INTO content_items (parent_key, title, body, meta, sort_order, published) VALUES
  ('nav.dropdown.core', '01. Linux Administration', '', '{"href":"#skills"}'::jsonb, 1, TRUE),
  ('nav.dropdown.core', '02. Docker & Compose', '', '{"href":"#skills"}'::jsonb, 2, TRUE),
  ('nav.dropdown.core', '03. CI/CD with GitHub Actions', '', '{"href":"#skills"}'::jsonb, 3, TRUE),
  ('nav.dropdown.core', '04. Git & GitHub', '', '{"href":"#skills"}'::jsonb, 4, TRUE),
  ('nav.dropdown.cloud', '05. AWS & EC2', '', '{"href":"#skills"}'::jsonb, 1, TRUE),
  ('nav.dropdown.cloud', '06. Terraform (IaC)', '', '{"href":"#skills"}'::jsonb, 2, TRUE),
  ('nav.dropdown.cloud', '07. Prometheus & Grafana', '', '{"href":"#skills"}'::jsonb, 3, TRUE),
  ('nav.dropdown.cloud', '08. DevSecOps with Trivy', '', '{"href":"#skills"}'::jsonb, 4, TRUE),
  ('nav.dropdown.projects', 'DevSecOps & Kubernetes Platform', '', '{"href":"https://github.com/arifuzzaman-hredoy/DevSecOps-Monitoring-Kubernetes-Platform"}'::jsonb, 1, TRUE),
  ('nav.dropdown.projects', 'Automated CI/CD Pipeline', '', '{"href":"https://github.com/arifuzzaman-hredoy/Automated-CI-CD-Pipeline"}'::jsonb, 2, TRUE),
  ('nav.dropdown.projects', 'AWS Cloud Infrastructure', '', '{"href":"https://github.com/arifuzzaman-hredoy/AWS-Cloud-Infrastructure-EC2-Deployment"}'::jsonb, 3, TRUE),
  ('nav.dropdown.projects', 'Terraform Infrastructure as Code', '', '{"href":"https://github.com/arifuzzaman-hredoy/Terraform-Infrastructure-as-Code"}'::jsonb, 4, TRUE),
  ('nav.dropdown.projects', 'Docker Compose Multi-Tier Platform', '', '{"href":"https://github.com/arifuzzaman-hredoy/Docker-compose-Multi-Tier-Platform"}'::jsonb, 5, TRUE),
  ('nav.dropdown.projects', 'Nginx Reverse Proxy & SSL', '', '{"href":"https://github.com/arifuzzaman-hredoy/Nginx-Reverse-Proxy-Domain-SSL"}'::jsonb, 6, TRUE),
  ('nav.dropdown.links', 'About Me', '', '{"href":"#about"}'::jsonb, 1, TRUE),
  ('nav.dropdown.links', 'Email', '', '{"href":"mailto:arifuzzamanhredoy@gmail.com"}'::jsonb, 2, TRUE),
  ('nav.dropdown.links', 'GitHub', '', '{"href":"https://github.com/arifuzzaman-hredoy"}'::jsonb, 3, TRUE),
  ('nav.dropdown.links', 'LinkedIn', '', '{"href":"https://www.linkedin.com/in/arifuzzaman-hredoy/"}'::jsonb, 4, TRUE);

-- Skills accordion: title, body, and a tags[] list in meta.
INSERT INTO content_items (parent_key, title, body, meta, sort_order, published) VALUES
  ('skills.accordion', '01. Linux Administration',
   'Managing and troubleshooting Linux servers, configuring services, and automating system tasks with Bash scripting.',
   '{"tags":["Ubuntu","Bash","Troubleshooting"]}'::jsonb, 1, TRUE),
  ('skills.accordion', '02. Containerization',
   'Building and deploying containerized applications using Docker and Docker Compose for consistent environments.',
   '{"tags":["Docker","Docker Compose","GHCR"]}'::jsonb, 2, TRUE),
  ('skills.accordion', '03. CI/CD Pipelines',
   'Creating automated build and deployment pipelines with GitHub Actions for continuous integration and delivery.',
   '{"tags":["GitHub Actions","Automation","Deployment"]}'::jsonb, 3, TRUE),
  ('skills.accordion', '04. Cloud Infrastructure',
   'Deploying applications on AWS EC2 with Nginx, domain/DNS and SSL/TLS, while learning VPC networking and Terraform.',
   '{"tags":["AWS","EC2","SSL/TLS"]}'::jsonb, 4, TRUE);

-- The capsule physics animation reads this a11y list as its label source.
INSERT INTO content_items (parent_key, title, body, meta, sort_order, published) VALUES
  ('skills.throwables', 'Docker', '', '{}'::jsonb, 1, TRUE),
  ('skills.throwables', 'Kubernetes', '', '{}'::jsonb, 2, TRUE),
  ('skills.throwables', 'Linux', '', '{}'::jsonb, 3, TRUE),
  ('skills.throwables', 'AWS', '', '{}'::jsonb, 4, TRUE),
  ('skills.throwables', 'Terraform', '', '{}'::jsonb, 5, TRUE),
  ('skills.throwables', 'Git', '', '{}'::jsonb, 6, TRUE),
  ('skills.throwables', 'Nginx', '', '{}'::jsonb, 7, TRUE),
  ('skills.throwables', 'GitHub Actions', '', '{}'::jsonb, 8, TRUE),
  ('skills.throwables', 'GitHub', '', '{}'::jsonb, 9, TRUE),
  ('skills.throwables', 'Ubuntu', '', '{}'::jsonb, 10, TRUE),
  ('skills.throwables', 'Bash', '', '{}'::jsonb, 11, TRUE),
  ('skills.throwables', 'Python', '', '{}'::jsonb, 12, TRUE),
  ('skills.throwables', 'Go', '', '{}'::jsonb, 13, TRUE),
  ('skills.throwables', 'JavaScript', '', '{}'::jsonb, 14, TRUE),
  ('skills.throwables', 'PostgreSQL', '', '{}'::jsonb, 15, TRUE),
  ('skills.throwables', 'Helm', '', '{}'::jsonb, 16, TRUE),
  ('skills.throwables', 'Prometheus', '', '{}'::jsonb, 17, TRUE),
  ('skills.throwables', 'Grafana', '', '{}'::jsonb, 18, TRUE),
  ('skills.throwables', 'Argo CD', '', '{}'::jsonb, 19, TRUE),
  ('skills.throwables', 'Trivy', '', '{}'::jsonb, 20, TRUE);

-- Process: the staircase chips and the four cards.
INSERT INTO content_items (parent_key, title, body, meta, sort_order, published) VALUES
  ('process.chips', 'Learn Fundamentals', '', '{}'::jsonb, 1, TRUE),
  ('process.chips', 'Practice Daily', '', '{}'::jsonb, 2, TRUE),
  ('process.chips', 'Build Projects', '', '{}'::jsonb, 3, TRUE),
  ('process.chips', 'Keep Improving', '', '{}'::jsonb, 4, TRUE),
  ('process.cards', 'Learn Fundamentals',
   'Understanding the fundamentals of Linux, networking, and cloud computing through hands-on practice and coursework.',
   '{"image":"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-1-fundamentals.svg","image_alt":"Learn Fundamentals","delay":"0.1"}'::jsonb, 1, TRUE),
  ('process.cards', 'Hands-on Practice',
   'Building practical projects with Docker, CI/CD pipelines, and cloud infrastructure to apply theoretical knowledge.',
   '{"image":"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-2-practice.svg","image_alt":"Hands-on Practice","delay":"0.3"}'::jsonb, 2, TRUE),
  ('process.cards', 'Project Development',
   'Creating real-world DevOps projects like automated deployments, infrastructure provisioning, and monitoring solutions.',
   '{"image":"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-3-projects.svg","image_alt":"Project Development","delay":"0.5"}'::jsonb, 3, TRUE),
  ('process.cards', 'Continuous Improvement',
   'Refining skills, exploring new tools, and staying updated with the latest DevOps practices and technologies.',
   '{"image":"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-4-improvement.svg","image_alt":"Continuous Improvement","delay":"0.7"}'::jsonb, 4, TRUE);

-- Marquee: the ticker duplicates this list twice per row in the markup.
INSERT INTO content_items (parent_key, title, body, meta, sort_order, published) VALUES
  ('marquee.items', 'Linux', '', '{}'::jsonb, 1, TRUE),
  ('marquee.items', 'Docker', '', '{}'::jsonb, 2, TRUE),
  ('marquee.items', 'Kubernetes', '', '{}'::jsonb, 3, TRUE),
  ('marquee.items', 'AWS', '', '{}'::jsonb, 4, TRUE),
  ('marquee.items', 'Terraform', '', '{}'::jsonb, 5, TRUE),
  ('marquee.items', 'CI/CD', '', '{}'::jsonb, 6, TRUE),
  ('marquee.items', 'GitHub Actions', '', '{}'::jsonb, 7, TRUE),
  ('marquee.items', 'Nginx', '', '{}'::jsonb, 8, TRUE),
  ('marquee.items', 'Prometheus', '', '{}'::jsonb, 9, TRUE),
  ('marquee.items', 'Grafana', '', '{}'::jsonb, 10, TRUE),
  ('marquee.items', 'PostgreSQL', '', '{}'::jsonb, 11, TRUE);

-- Call to action: the four check-mark features.
INSERT INTO content_items (parent_key, title, body, meta, sort_order, published) VALUES
  ('cta.list', 'Practical DevOps skills', '', '{}'::jsonb, 1, TRUE),
  ('cta.list', 'Real-world projects', '', '{}'::jsonb, 2, TRUE),
  ('cta.list', 'Continuous learning', '', '{}'::jsonb, 3, TRUE),
  ('cta.list', 'Hands-on practice', '', '{}'::jsonb, 4, TRUE);

-- Footer: nav links, social links (icon is an allow-listed key) and contact lines.
INSERT INTO content_items (parent_key, title, body, meta, sort_order, published) VALUES
  ('footer.nav', 'Home', '', '{"href":"/","current":true}'::jsonb, 1, TRUE),
  ('footer.nav', 'About', '', '{"href":"#about"}'::jsonb, 2, TRUE),
  ('footer.nav', 'Skills', '', '{"href":"#skills"}'::jsonb, 3, TRUE),
  ('footer.nav', 'Projects', '', '{"href":"#projects"}'::jsonb, 4, TRUE),
  ('footer.nav', 'Contact', '', '{"href":"#contact"}'::jsonb, 5, TRUE),
  ('footer.socials', 'GitHub', '', '{"href":"https://github.com/arifuzzaman-hredoy","icon":"github"}'::jsonb, 1, TRUE),
  ('footer.socials', 'LinkedIn', '', '{"href":"https://www.linkedin.com/in/arifuzzaman-hredoy/","icon":"linkedin"}'::jsonb, 2, TRUE),
  ('footer.socials', 'Email', '', '{"href":"mailto:arifuzzamanhredoy@gmail.com","icon":"email"}'::jsonb, 3, TRUE),
  ('footer.socials', 'Facebook', '', '{"href":"https://www.facebook.com/arifuzzamanhredoy","icon":"facebook"}'::jsonb, 4, TRUE),
  ('footer.socials', 'Instagram', '', '{"href":"https://www.instagram.com/hredoy_403x/","icon":"instagram"}'::jsonb, 5, TRUE),
  ('footer.links', 'GitHub', '', '{"href":"https://github.com/arifuzzaman-hredoy"}'::jsonb, 1, TRUE),
  ('footer.links', 'LinkedIn', '', '{"href":"https://www.linkedin.com/in/arifuzzaman-hredoy/"}'::jsonb, 2, TRUE),
  ('footer.links', 'Email', '', '{"href":"mailto:arifuzzamanhredoy@gmail.com"}'::jsonb, 3, TRUE);