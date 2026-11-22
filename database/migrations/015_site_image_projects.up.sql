-- Add Featured Projects image slots to the CMS-managed site_images table.
--
-- These 6 project images were hardcoded Cloudinary SVGs in HomeContent.tsx
-- and are now CMS-manageable: the owner can replace or reset them from
-- Super Admin → Site Images.
--
-- Migration 010 already added the default_url/default_alt columns, so this
-- migration only inserts the new rows.

INSERT INTO site_images (key, label, group_name, url, public_id, alt, default_url, default_alt) VALUES
  ('project-automated-cicd-pipeline', 'Featured Project: Automated CI/CD Pipeline', 'Projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/automated-cicd-pipeline.svg', '', 'Automated CI/CD Pipeline flow diagram', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/automated-cicd-pipeline.svg', 'Automated CI/CD Pipeline flow diagram'),
  ('project-aws-cloud-infrastructure-ec2', 'Featured Project: AWS Cloud Infrastructure & EC2 Deployment', 'Projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/aws-cloud-infrastructure-ec2.svg', '', 'AWS VPC and EC2 infrastructure diagram', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/aws-cloud-infrastructure-ec2.svg', 'AWS VPC and EC2 infrastructure diagram'),
  ('project-devsecops-monitoring-kubernetes', 'Featured Project: DevSecOps, Monitoring & Kubernetes Platform', 'Projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg', '', 'DevSecOps, Monitoring & Kubernetes Platform stack diagram', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg', 'DevSecOps, Monitoring & Kubernetes Platform stack diagram'),
  ('project-docker-compose-multi-tier', 'Featured Project: Docker Compose Multi-Tier Platform', 'Projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/docker-compose-multi-tier.svg', '', 'Docker Compose multi-tier platform diagram', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/docker-compose-multi-tier.svg', 'Docker Compose multi-tier platform diagram'),
  ('project-nginx-reverse-proxy-domain-ssl', 'Featured Project: Nginx Reverse Proxy, Domain & SSL', 'Projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/nginx-reverse-proxy-domain-ssl.svg', '', 'Nginx reverse proxy with DNS and SSL/TLS diagram', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/nginx-reverse-proxy-domain-ssl.svg', 'Nginx reverse proxy with DNS and SSL/TLS diagram'),
  ('project-terraform-infrastructure-as-code', 'Featured Project: Infrastructure as Code with Terraform', 'Projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/terraform-infrastructure-as-code.svg', '', 'Terraform plan and apply flow diagram', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/terraform-infrastructure-as-code.svg', 'Terraform plan and apply flow diagram')
ON CONFLICT (key) DO NOTHING;
