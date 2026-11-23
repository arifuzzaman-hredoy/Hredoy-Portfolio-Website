-- Revert card and section image slots to original SVG assets

UPDATE site_images AS s
SET url = v.url,
    default_url = v.url,
    alt = v.alt,
    default_alt = v.alt,
    updated_at = NOW()
FROM (VALUES
  ('about-linux', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-linux.svg', 'Linux terminal showing server commands'),
  ('about-cloud', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cloud.svg', 'Cloud with server stack illustration'),
  ('about-cicd', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cicd.svg', 'CI/CD pipeline stages illustration'),
  ('process-1-fundamentals', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-1-fundamentals.svg', 'Learn Fundamentals'),
  ('process-2-practice', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-2-practice.svg', 'Hands-on Practice'),
  ('process-3-projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-3-projects.svg', 'Project Development'),
  ('process-4-improvement', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-4-improvement.svg', 'Continuous Improvement'),
  ('mission-learning-path', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/mission-learning-path.svg', 'Learning path: Linux, Docker, CI/CD, AWS'),
  ('technical-skills', '/assets/imgs/portfolio/sections/technical-skills.svg', 'Technical Skills & Tools'),
  ('cta-connect', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/cta-connect.svg', 'Network of DevOps tools connected around Hredoy'),
  ('project-automated-cicd-pipeline', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/automated-cicd-pipeline.svg', 'Automated CI/CD Pipeline flow diagram'),
  ('project-aws-cloud-infrastructure-ec2', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/aws-cloud-infrastructure-ec2.svg', 'AWS VPC and EC2 infrastructure diagram'),
  ('project-devsecops-monitoring-kubernetes', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg', 'DevSecOps, Monitoring & Kubernetes Platform stack diagram'),
  ('project-docker-compose-multi-tier', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/docker-compose-multi-tier.svg', 'Docker Compose multi-tier platform diagram'),
  ('project-nginx-reverse-proxy-domain-ssl', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/nginx-reverse-proxy-domain-ssl.svg', 'Nginx reverse proxy with DNS and SSL/TLS diagram'),
  ('project-terraform-infrastructure-as-code', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/terraform-infrastructure-as-code.svg', 'Terraform plan and apply flow diagram')
) AS v(key, url, alt)
WHERE s.key = v.key;

UPDATE projects AS p
SET image_path = v.image_path,
    updated_at = NOW()
FROM (VALUES
  ('devsecops-monitoring-kubernetes', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg'),
  ('automated-cicd-pipeline', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/automated-cicd-pipeline.svg'),
  ('aws-cloud-infrastructure-ec2', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/aws-cloud-infrastructure-ec2.svg'),
  ('terraform-infrastructure-as-code', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/terraform-infrastructure-as-code.svg'),
  ('docker-compose-multi-tier', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/docker-compose-multi-tier.svg'),
  ('nginx-reverse-proxy-domain-ssl', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/nginx-reverse-proxy-domain-ssl.svg'),
  ('docker-containerization-platform', ''),
  ('production-linux-server-administration', '')
) AS v(slug, image_path)
WHERE p.slug = v.slug;

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
