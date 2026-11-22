-- Reverses 015_site_image_projects.up.sql

DELETE FROM site_images WHERE key IN (
  'project-automated-cicd-pipeline',
  'project-aws-cloud-infrastructure-ec2',
  'project-devsecops-monitoring-kubernetes',
  'project-docker-compose-multi-tier',
  'project-nginx-reverse-proxy-domain-ssl',
  'project-terraform-infrastructure-as-code'
);
