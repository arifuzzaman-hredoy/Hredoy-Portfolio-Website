-- Down migration
DELETE FROM content_blocks WHERE key LIKE 'projects.other.%';
