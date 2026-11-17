-- Make site_images the source of truth for image alt text.
--
-- Until now the alt attribute of every <img> was hardcoded in the generated
-- template, so the admin Site Images screen could only replace image URLs.
-- These updates copy the alt text the template already renders into the
-- matching rows. Because the values are identical to the current markup, the
-- public page stays byte-for-byte unchanged until an admin edits a field.
--
-- Only slots that actually map to an <img> are touched. favicon, og-image and
-- apple-touch-icon are metadata, not rendered images, so they keep their alts.
--
-- Deliberately not reversible: a down migration cannot know which alts an
-- admin may have written since, so this is a no-op.

UPDATE site_images SET alt = 'Hredoy'                                        WHERE key = 'brand-logo';
UPDATE site_images SET alt = 'Arifuzzaman Hredoy'                            WHERE key = 'hero-portrait';
UPDATE site_images SET alt = 'decorative star'                               WHERE key = 'star-asterisk';
UPDATE site_images SET alt = 'Linux'                                         WHERE key = 'avatar-linux';
UPDATE site_images SET alt = 'Docker'                                        WHERE key = 'avatar-docker';
UPDATE site_images SET alt = 'AWS'                                           WHERE key = 'avatar-aws';
UPDATE site_images SET alt = 'GitHub Actions'                                WHERE key = 'avatar-github-actions';
UPDATE site_images SET alt = 'Terraform'                                     WHERE key = 'avatar-terraform';
UPDATE site_images SET alt = 'Linux terminal showing server commands'        WHERE key = 'about-linux';
UPDATE site_images SET alt = 'Cloud with server stack illustration'          WHERE key = 'about-cloud';
UPDATE site_images SET alt = 'CI/CD pipeline stages illustration'            WHERE key = 'about-cicd';
UPDATE site_images SET alt = 'Linux server session'                          WHERE key = 'slider-1-linux';
UPDATE site_images SET alt = 'Cloud infrastructure'                          WHERE key = 'slider-2-cloud';
UPDATE site_images SET alt = 'CI/CD pipeline'                                WHERE key = 'slider-3-cicd';
UPDATE site_images SET alt = 'Monitoring dashboard chart'                    WHERE key = 'slider-4-monitoring';
UPDATE site_images SET alt = 'Security shield'                               WHERE key = 'slider-5-security';
UPDATE site_images SET alt = 'Learning path: Linux, Docker, CI/CD, AWS'      WHERE key = 'mission-learning-path';
UPDATE site_images SET alt = 'Linux'                                         WHERE key = 'skills-linux';
UPDATE site_images SET alt = 'Learn Fundamentals'                            WHERE key = 'process-1-fundamentals';
UPDATE site_images SET alt = 'Hands-on Practice'                             WHERE key = 'process-2-practice';
UPDATE site_images SET alt = 'Project Development'                           WHERE key = 'process-3-projects';
UPDATE site_images SET alt = 'Continuous Improvement'                        WHERE key = 'process-4-improvement';
UPDATE site_images SET alt = 'Network of DevOps tools connected around Hredoy' WHERE key = 'cta-connect';
UPDATE site_images SET alt = 'Arifuzzaman Hredoy'                            WHERE key = 'who-i-am-portrait';