-- Revert Migration 024: Clear summaries
UPDATE projects
SET summary = '', description = ''
WHERE slug IN (
  'devsecops-monitoring-kubernetes',
  'automated-cicd-pipeline',
  'automated-ci-cd-pipeline',
  'aws-cloud-infrastructure-ec2',
  'terraform-infrastructure-as-code',
  'infrastructure-as-code-terraform',
  'docker-compose-multi-tier',
  'nginx-reverse-proxy-domain-ssl',
  'nginx-reverse-proxy'
);
