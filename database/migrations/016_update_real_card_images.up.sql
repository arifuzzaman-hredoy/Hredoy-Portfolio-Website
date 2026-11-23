-- Update all card and section image slots with real, clean, professional Cloudinary photos.
--
-- Excludes hero-portrait and brand-logo as per explicit user instructions.
-- Both url and default_url (and alt and default_alt) are updated so that:
--   1. The live site immediately serves the clean real images.
--   2. "Reset to default" in Super Admin resets to these professional photos.
--   3. The owner can replace, edit alt text, or reset any of them from Super Admin.

-- 1. Update site_images for About, Process, Mission, Skills, CTA, and Featured Projects
UPDATE site_images AS s
SET url = v.url,
    default_url = v.url,
    alt = v.alt,
    default_alt = v.alt,
    updated_at = NOW()
FROM (VALUES
  -- About section cards
  ('about-linux', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/linux.jpg', 'Linux server administration and terminal workstation'),
  ('about-cloud', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/cloud.jpg', 'Cloud infrastructure and datacenter servers'),
  ('about-cicd', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/cicd.jpg', 'Automated CI/CD build and deployment pipeline'),

  -- Process section cards
  ('process-1-fundamentals', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-1.jpg', 'Learn DevOps Fundamentals'),
  ('process-2-practice', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-2.jpg', 'Hands-on DevOps Practice'),
  ('process-3-projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-3.jpg', 'Production Project Development'),
  ('process-4-improvement', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-4.jpg', 'Continuous Monitoring & Improvement'),

  -- Mission section
  ('mission-learning-path', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/engineer.jpg', 'DevOps Engineer learning and development path'),

  -- Skills section
  ('technical-skills', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/devops.jpg', 'Technical Skills, Tools and Cloud Architecture'),

  -- Call to action section
  ('cta-connect', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/team-1.jpg', 'DevOps engineering collaboration and connection'),

  -- Featured Projects slots in site_images
  ('project-devsecops-monitoring-kubernetes', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/devops.jpg', 'DevSecOps, Monitoring & Kubernetes Platform'),
  ('project-automated-cicd-pipeline', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/blog-cicd.jpg', 'Automated CI/CD Pipeline'),
  ('project-aws-cloud-infrastructure-ec2', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/cloud.jpg', 'AWS Cloud Infrastructure & EC2 Deployment'),
  ('project-terraform-infrastructure-as-code', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/blog-terraform.jpg', 'Infrastructure as Code with Terraform'),
  ('project-docker-compose-multi-tier', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/blog-docker.jpg', 'Docker Compose Multi-Tier Platform'),
  ('project-nginx-reverse-proxy-domain-ssl', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/security.jpg', 'Nginx Reverse Proxy, Domain & SSL')
) AS v(key, url, alt)
WHERE s.key = v.key;

-- 2. Update projects table with matching professional project photos
UPDATE projects AS p
SET image_path = v.image_path,
    updated_at = NOW()
FROM (VALUES
  ('devsecops-monitoring-kubernetes', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/devops.jpg'),
  ('automated-cicd-pipeline', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/blog-cicd.jpg'),
  ('aws-cloud-infrastructure-ec2', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/cloud.jpg'),
  ('terraform-infrastructure-as-code', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/blog-terraform.jpg'),
  ('docker-compose-multi-tier', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/blog-docker.jpg'),
  ('nginx-reverse-proxy-domain-ssl', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/security.jpg'),
  ('docker-containerization-platform', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/blog-docker.jpg'),
  ('production-linux-server-administration', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/blog-linux.jpg')
) AS v(slug, image_path)
WHERE p.slug = v.slug;

-- 3. Update content_items process.cards metadata with clean Cloudinary image URLs
UPDATE content_items
SET meta = jsonb_set(meta, '{image}', '"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-1.jpg"'),
    updated_at = NOW()
WHERE parent_key = 'process.cards' AND sort_order = 1;

UPDATE content_items
SET meta = jsonb_set(meta, '{image}', '"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-2.jpg"'),
    updated_at = NOW()
WHERE parent_key = 'process.cards' AND sort_order = 2;

UPDATE content_items
SET meta = jsonb_set(meta, '{image}', '"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-3.jpg"'),
    updated_at = NOW()
WHERE parent_key = 'process.cards' AND sort_order = 3;

UPDATE content_items
SET meta = jsonb_set(meta, '{image}', '"https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-4.jpg"'),
    updated_at = NOW()
WHERE parent_key = 'process.cards' AND sort_order = 4;
