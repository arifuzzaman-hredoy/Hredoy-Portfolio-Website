-- Site image defaults, so "Reset to default" can restore a slot to the file
-- that ships with the code instead of to whatever was uploaded last.
--
-- Without this a mis-upload is unrecoverable from the admin: the current URL is
-- overwritten in place and the original is lost.
--
-- The defaults below are hardcoded on purpose. Copying the live url/alt columns
-- would bake in whatever is in the database today, which is exactly the value
-- Reset has to escape from: the about-* slots, for example, currently hold
-- uploaded PNGs and must still reset to the SVG that ships with the template.
-- Keep this list in sync with SITE_IMAGE_DEFAULTS in
-- frontend/src/lib/cms-render.ts; the alts come from the template markup.

ALTER TABLE site_images ADD COLUMN IF NOT EXISTS default_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS default_alt TEXT NOT NULL DEFAULT '';

-- Code defaults for every slot the CMS manages. Guarded so a re-run never
-- overwrites a value that was already resolved.
UPDATE site_images AS s
SET default_url = v.url,
    default_alt = v.alt
FROM (VALUES
  ('about-cicd', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cicd.svg', 'CI/CD pipeline stages illustration'),
  ('about-cloud', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cloud.svg', 'Cloud with server stack illustration'),
  ('about-linux', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-linux.svg', 'Linux terminal showing server commands'),
  ('apple-touch-icon', 'https://res.cloudinary.com/dvatduo79/image/upload/apple-touch-icon.png', ''),
  ('avatar-aws', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-3-aws.svg', 'AWS'),
  ('avatar-docker', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-2-docker.svg', 'Docker'),
  ('avatar-github-actions', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-4-github-actions.svg', 'GitHub Actions'),
  ('avatar-linux', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-1-linux.svg', 'Linux'),
  ('avatar-terraform', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-5-terraform.svg', 'Terraform'),
  ('brand-logo', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/brand-logo.png', 'Hredoy'),
  ('cta-connect', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/cta-connect.svg', 'Network of DevOps tools connected around Hredoy'),
  ('favicon', 'https://res.cloudinary.com/dvatduo79/image/upload/favicon.png', ''),
  ('hero-badge-aws', '/assets/imgs/hero-tools/aws-v3.svg', 'AWS'),
  ('hero-badge-docker', '/assets/imgs/hero-tools/docker-v3.svg', 'Docker'),
  ('hero-badge-grafana', '/assets/imgs/hero-tools/grafana-v3.svg', 'Grafana'),
  ('hero-badge-kubernetes', '/assets/imgs/hero-tools/kubernetes-v3.svg', 'Kubernetes'),
  ('hero-badge-terraform', '/assets/imgs/hero-tools/terraform-v3.svg', 'Terraform'),
  ('hero-portrait', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-13/Home-menu-pic.webp', 'Arifuzzaman Hredoy'),
  ('marquee-star', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg', ''),
  ('mission-learning-path', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/mission-learning-path.svg', 'Learning path: Linux, Docker, CI/CD, AWS'),
  ('og-image', 'https://res.cloudinary.com/dvatduo79/image/upload/og/og-home.png', 'Hredoy''s Portfolio — Junior DevOps Engineer'),
  ('process-1-fundamentals', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-1-fundamentals.svg', 'Learn Fundamentals'),
  ('process-2-practice', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-2-practice.svg', 'Hands-on Practice'),
  ('process-3-projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-3-projects.svg', 'Project Development'),
  ('process-4-improvement', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-4-improvement.svg', 'Continuous Improvement'),
  ('sec4-pin-icon', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-4-pin-icon.svg', ''),
  ('sec7-btn-arrow', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-btn-arrow.svg', ''),
  ('sec7-eyebrow-arrow', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-eyebrow-arrow.svg', ''),
  ('sec7-plus', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-plus.svg', ''),
  ('sec7-rotating', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-rotating.svg', ''),
  ('skills-linux', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/skills-linux.svg', 'Linux'),
  ('slider-1-linux', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-1-linux.svg', 'Linux server session'),
  ('slider-2-cloud', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-2-cloud.svg', 'Cloud infrastructure'),
  ('slider-3-cicd', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-3-cicd.svg', 'CI/CD pipeline'),
  ('slider-4-monitoring', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-4-monitoring.svg', 'Monitoring dashboard chart'),
  ('slider-5-security', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-5-security.svg', 'Security shield'),
  ('star-asterisk', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/star-asterisk.svg', 'decorative star'),
  ('who-i-am-portrait', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/who-i-am-portrait.jpg', 'Arifuzzaman Hredoy')
) AS v(key, url, alt)
WHERE s.key = v.key
  AND (s.default_url = '' OR s.default_alt = '');

-- A slot added later without a code default keeps default_url = ''. The admin
-- screen hides "Reset to default" for those rows and the reset handler refuses
-- to run, so an unknown slot can never be blanked.

-- Hero proof badges. These are local assets (not Cloudinary) and are already
-- referenced by the template with exactly these alt values, so seeding them
-- here changes nothing visually; it only makes them replaceable and resettable.
INSERT INTO site_images (key, label, group_name, url, public_id, alt, default_url, default_alt) VALUES
  ('hero-badge-docker', 'Hero Badge: Docker', 'Hero', '/assets/imgs/hero-tools/docker-v3.svg', '', 'Docker', '/assets/imgs/hero-tools/docker-v3.svg', 'Docker'),
  ('hero-badge-kubernetes', 'Hero Badge: Kubernetes', 'Hero', '/assets/imgs/hero-tools/kubernetes-v3.svg', '', 'Kubernetes', '/assets/imgs/hero-tools/kubernetes-v3.svg', 'Kubernetes'),
  ('hero-badge-aws', 'Hero Badge: AWS', 'Hero', '/assets/imgs/hero-tools/aws-v3.svg', '', 'AWS', '/assets/imgs/hero-tools/aws-v3.svg', 'AWS'),
  ('hero-badge-terraform', 'Hero Badge: Terraform', 'Hero', '/assets/imgs/hero-tools/terraform-v3.svg', '', 'Terraform', '/assets/imgs/hero-tools/terraform-v3.svg', 'Terraform'),
  ('hero-badge-grafana', 'Hero Badge: Grafana', 'Hero', '/assets/imgs/hero-tools/grafana-v3.svg', '', 'Grafana', '/assets/imgs/hero-tools/grafana-v3.svg', 'Grafana')
ON CONFLICT (key) DO NOTHING;
