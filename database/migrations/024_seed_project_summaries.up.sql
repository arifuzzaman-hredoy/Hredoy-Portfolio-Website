-- Migration 024: Seed rich descriptions and summaries for the featured DevOps projects
UPDATE projects
SET summary = 'Production Kubernetes cluster deployment with Trivy container vulnerability scanning, Prometheus metrics scraping, and real-time Grafana observability dashboards.',
    description = 'Production Kubernetes cluster deployment with Trivy container vulnerability scanning, Prometheus metrics scraping, and real-time Grafana observability dashboards.'
WHERE slug = 'devsecops-monitoring-kubernetes' OR title ILIKE '%DevSecOps%';

UPDATE projects
SET summary = 'End-to-end automated continuous integration and delivery pipeline with GitHub Actions, multi-stage Docker builds, GHCR registry, and zero-downtime deployment.',
    description = 'End-to-end automated continuous integration and delivery pipeline with GitHub Actions, multi-stage Docker builds, GHCR registry, and zero-downtime deployment.'
WHERE slug = 'automated-cicd-pipeline' OR slug = 'automated-ci-cd-pipeline' OR title ILIKE '%CI/CD Pipeline%';

UPDATE projects
SET summary = 'Scalable AWS cloud hosting with custom VPC, public/private subnets, EC2 instances, EBS storage volumes, IAM security policies, and CloudWatch monitoring.',
    description = 'Scalable AWS cloud hosting with custom VPC, public/private subnets, EC2 instances, EBS storage volumes, IAM security policies, and CloudWatch monitoring.'
WHERE slug = 'aws-cloud-infrastructure-ec2' OR title ILIKE '%AWS Cloud Infrastructure%';

UPDATE projects
SET summary = 'Declarative, modular Infrastructure as Code provisioning cloud resources, remote state locking with S3 & DynamoDB, and repeatable multi-environment architecture.',
    description = 'Declarative, modular Infrastructure as Code provisioning cloud resources, remote state locking with S3 & DynamoDB, and repeatable multi-environment architecture.'
WHERE slug = 'terraform-infrastructure-as-code' OR slug = 'infrastructure-as-code-terraform' OR title ILIKE '%Terraform%';

UPDATE projects
SET summary = 'Multi-tier microservices orchestration connecting frontend, Go REST API, PostgreSQL database, and Redis cache with isolated Docker bridge networks and volumes.',
    description = 'Multi-tier microservices orchestration connecting frontend, Go REST API, PostgreSQL database, and Redis cache with isolated Docker bridge networks and volumes.'
WHERE slug = 'docker-compose-multi-tier' OR title ILIKE '%Docker Compose%';

UPDATE projects
SET summary = 'High-performance Nginx edge reverse proxy with Let''s Encrypt SSL/TLS termination, HTTP/2 optimization, security headers, rate limiting, and custom domain routing.',
    description = 'High-performance Nginx edge reverse proxy with Let''s Encrypt SSL/TLS termination, HTTP/2 optimization, security headers, rate limiting, and custom domain routing.'
WHERE slug = 'nginx-reverse-proxy-domain-ssl' OR slug = 'nginx-reverse-proxy' OR title ILIKE '%Nginx Reverse Proxy%';
