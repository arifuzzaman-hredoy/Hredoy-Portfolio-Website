-- Revert seeded certificates
DELETE FROM certificates WHERE image_path LIKE '/assets/imgs/certificates/%';
