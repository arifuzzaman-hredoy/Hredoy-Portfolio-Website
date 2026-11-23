-- Revert changes from 017_card_images_and_other_projects.up.sql

UPDATE site_images
SET url = 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/cicd.jpg',
    default_url = 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/cicd.jpg',
    alt = 'Automated CI/CD build and deployment pipeline',
    default_alt = 'Automated CI/CD build and deployment pipeline',
    updated_at = NOW()
WHERE key = 'about-cicd';

UPDATE site_images AS s
SET url = v.url,
    default_url = v.url,
    alt = v.alt,
    default_alt = v.alt,
    updated_at = NOW()
FROM (VALUES
  ('process-1-fundamentals', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-1.jpg', 'Learn DevOps Fundamentals'),
  ('process-2-practice', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-2.jpg', 'Hands-on DevOps Practice'),
  ('process-3-projects', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-3.jpg', 'Production Project Development'),
  ('process-4-improvement', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/step-4.jpg', 'Continuous Monitoring & Improvement')
) AS v(key, url, alt)
WHERE s.key = v.key;
