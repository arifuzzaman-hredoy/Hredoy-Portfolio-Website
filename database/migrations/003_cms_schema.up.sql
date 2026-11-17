-- CMS content tables for the admin-controlled public site.

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tech TEXT NOT NULL DEFAULT '',
  repo_url TEXT NOT NULL DEFAULT '',
  live_url TEXT NOT NULL DEFAULT '',
  image_path TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_published_sort
  ON projects (published, sort_order);

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  stored_name TEXT NOT NULL UNIQUE,
  path TEXT NOT NULL,
  mime TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  alt TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_created
  ON media (created_at DESC);

CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT '',
  group_name TEXT NOT NULL DEFAULT 'general',
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_group
  ON content_blocks (group_name, key);

-- ---------------------------------------------------------------------------
-- Seed: 15 projects already present on the static site.
-- ---------------------------------------------------------------------------
INSERT INTO projects (title, slug, summary, description, tech, repo_url, live_url, image_path, sort_order, published) VALUES
  ('DevSecOps, Monitoring & Kubernetes Platform', 'devsecops-monitoring-kubernetes', '', '', 'Kubernetes, Prometheus, Grafana, Trivy', 'https://github.com/arifuzzaman-hredoy/DevSecOps-Monitoring-Kubernetes-Platform', '', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg', 1, TRUE),
  ('Automated CI/CD Pipeline', 'automated-cicd-pipeline', '', '', 'GitHub Actions, Docker, GHCR', 'https://github.com/arifuzzaman-hredoy/Automated-CI-CD-Pipeline', '', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/automated-cicd-pipeline.svg', 2, TRUE),
  ('AWS Cloud Infrastructure & EC2 Deployment', 'aws-cloud-infrastructure-ec2', '', '', 'AWS, EC2, VPC, IAM', 'https://github.com/arifuzzaman-hredoy/AWS-Cloud-Infrastructure-EC2-Deployment', '', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/aws-cloud-infrastructure-ec2.svg', 3, TRUE),
  ('Infrastructure as Code with Terraform', 'terraform-infrastructure-as-code', '', '', 'Terraform, AWS, Modules', 'https://github.com/arifuzzaman-hredoy/Terraform-Infrastructure-as-Code', '', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/terraform-infrastructure-as-code.svg', 4, TRUE),
  ('Docker Compose Multi-Tier Platform', 'docker-compose-multi-tier', '', '', 'Docker Compose, Nginx, PostgreSQL', 'https://github.com/arifuzzaman-hredoy/Docker-compose-Multi-Tier-Platform', '', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/docker-compose-multi-tier.svg', 5, TRUE),
  ('Nginx Reverse Proxy, Domain & SSL', 'nginx-reverse-proxy-domain-ssl', '', '', 'Nginx, SSL/TLS, DNS', 'https://github.com/arifuzzaman-hredoy/Nginx-Reverse-Proxy-Domain-SSL', '', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/nginx-reverse-proxy-domain-ssl.svg', 6, TRUE),
  ('Docker Containerization Platform', 'docker-containerization-platform', '', '', '', 'https://github.com/arifuzzaman-hredoy/Docker-Containerization-Platform', '', '', 7, TRUE),
  ('Production Linux Server Administration', 'production-linux-server-administration', '', '', '', 'https://github.com/arifuzzaman-hredoy/Production-Linux-Server-Administration', '', '', 8, TRUE),
  ('DevOps Network Engineering Lab', 'devops-network-engineering-lab', '', '', '', 'https://github.com/arifuzzaman-hredoy/DevOps-Network-Engineering-Lab', '', '', 9, TRUE),
  ('Bash & Git DevOps Automation Toolkit', 'bash-git-devops-automation-toolkit', '', '', '', 'https://github.com/arifuzzaman-hredoy/Bash-Git-Devops-Automation-Toolkit', '', '', 10, TRUE),
  ('Git Version Control Lab', 'git-version-control-lab', '', '', '', 'https://github.com/arifuzzaman-hredoy/Git-Version-Control-Lab', '', '', 11, TRUE),
  ('GitHub Collaboration Lab', 'github-collaboration-lab', '', '', '', 'https://github.com/arifuzzaman-hredoy/GitHub-Collaboration-Lab', '', '', 12, TRUE),
  ('DevOps Workflow & SDLC Lab', 'devops-workflow-sdlc-lab', '', '', '', 'https://github.com/arifuzzaman-hredoy/Devops-Workflow-And-SDLC-Lab', '', '', 13, TRUE),
  ('Nexora Three-Tier Infrastructure', 'nexora-three-tier-infrastructure', '', '', '', 'https://github.com/arifuzzaman-hredoy/DevOps-Module-4-Assignment', '', '', 14, TRUE),
  ('TaskFlow DevOps Platform', 'taskflow-devops-platform', '', '', '', 'https://github.com/arifuzzaman-hredoy/DevOps-Real-World-Project-By-Python', 'https://taskflow.oxytumzone.com/', '', 15, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed: editable text blocks extracted from the current public page.
-- ---------------------------------------------------------------------------
INSERT INTO content_blocks (key, label, group_name, value) VALUES
  ('hero.headline.1', 'Hero headline line 1', 'Hero', 'Junior'),
  ('hero.headline.2', 'Hero headline line 2', 'Hero', 'DevOps'),
  ('hero.headline.3', 'Hero headline line 3', 'Hero', 'Engineer'),
  ('hero.desc', 'Hero description', 'Hero', 'I''m Arifuzzaman Hredoy, a Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. Continuously building practical projects and production-oriented engineering skills.'),
  ('hero.cta', 'Hero button label', 'Hero', 'Get In Touch'),
  ('hero.proof', 'Hero proof line', 'Hero', 'Building reliable infrastructure with modern DevOps practices'),

  ('about.eyebrow', 'About eyebrow', 'About', 'About Me'),
  ('about.headline', 'About headline', 'About', 'Passionate About Building Reliable Infrastructure'),
  ('about.paragraph', 'About paragraph', 'About', 'I''m Arifuzzaman Hredoy, currently pursuing a Diploma in Engineering in Computer Science & Technology at Rangpur Polytechnic Institute. I''m building practical skills in Linux, Docker, AWS, Terraform, and CI/CD through hands-on projects.'),
  ('about.cta', 'About button label', 'About', 'Get In Touch'),

  ('stats.tools.value', 'Stat: tools value', 'Stats', '20'),
  ('stats.tools.label', 'Stat: tools label', 'Stats', 'DevOps tools and technologies I practice'),
  ('stats.projects.value', 'Stat: projects value', 'Stats', '13'),
  ('stats.projects.label', 'Stat: projects label', 'Stats', 'Hands-on DevOps projects on GitHub'),
  ('stats.live.value', 'Stat: live value', 'Stats', '1'),
  ('stats.live.label', 'Stat: live label', 'Stats', 'Live deployment on AWS EC2'),

  ('mission.eyebrow', 'Mission eyebrow', 'Mission', 'My Mission'),
  ('mission.text', 'Mission text', 'Mission', 'Continuously learning and building practical DevOps skills to become a professional DevOps Engineer.'),
  ('mission.cta', 'Mission button label', 'Mission', 'Get In Touch'),

  ('skills.eyebrow', 'Skills eyebrow', 'Skills', 'My Skills'),
  ('skills.title', 'Skills title', 'Skills', 'Technical Skills & Tools.'),
  ('skills.desc', 'Skills description', 'Skills', 'Continuously learning and expanding my DevOps skillset across the modern cloud-native stack.'),
  ('skills.cta', 'Skills button label', 'Skills', 'Get In Touch'),

  ('process.eyebrow', 'Process eyebrow', 'Process', 'My Journey'),
  ('process.title', 'Process title', 'Process', 'The Process'),
  ('process.desc', 'Process description', 'Process', 'How I''m growing into a DevOps Engineer, from fundamentals to hands-on projects.'),

  ('cta.eyebrow', 'CTA eyebrow', 'Call to action', 'Looking for my first DevOps role'),
  ('cta.desc', 'CTA description', 'Call to action', 'I''m looking for a junior DevOps or cloud role where I can keep learning and contribute.'),
  ('cta.cta', 'CTA button label', 'Call to action', 'Get In Touch'),

  ('whoami.eyebrow', 'Who I Am eyebrow', 'Who I Am', 'About Me'),
  ('whoami.title', 'Who I Am title', 'Who I Am', 'Who I Am'),
  ('whoami.paragraph', 'Who I Am paragraph', 'Who I Am', 'Hello! I''m Arifuzzaman Hredoy, an aspiring DevOps Engineer and Computer Science and Technology (CST) student from Bangladesh.'),
  ('whoami.quote', 'Who I Am quote', 'Who I Am', '"Learn by Building, Grow by Solving, and Improve by Automating."'),
  ('whoami.name', 'Who I Am display name', 'Who I Am', 'Arifuzzaman Hredoy'),
  ('whoami.role', 'Who I Am display role', 'Who I Am', 'Junior DevOps Engineer'),

  ('projects.eyebrow', 'Projects eyebrow', 'Projects', 'Projects'),
  ('projects.title', 'Projects title', 'Projects', 'Featured Projects'),
  ('projects.desc', 'Projects description', 'Projects', 'A selection of hands-on DevOps projects covering Linux, Docker, CI/CD, AWS, Terraform, Kubernetes, and DevSecOps.'),
  ('projects.cta', 'Projects button label', 'Projects', 'All Projects'),

  ('contact.eyebrow', 'Contact eyebrow', 'Contact', 'Contact Me'),
  ('contact.title', 'Contact title', 'Contact', 'Get in touch'),
  ('contact.note', 'Contact note', 'Contact', 'Your message goes only to me and is never shared.'),
  ('contact.button', 'Contact button label', 'Contact', 'Send Message'),

  ('footer.tagline', 'Footer tagline', 'Footer', 'Junior DevOps Engineer · Cloud · Linux Admin'),
  ('footer.open', 'Footer open-to label', 'Footer', 'Open to'),
  ('footer.open_detail', 'Footer open-to detail', 'Footer', 'Remote · Junior & Intern roles · Immediate'),
  ('footer.subscribe', 'Footer subscribe title', 'Footer', 'Get updates on my new projects'),
  ('footer.copyright', 'Footer copyright', 'Footer', 'Arifuzzaman Hredoy')
ON CONFLICT (key) DO NOTHING;