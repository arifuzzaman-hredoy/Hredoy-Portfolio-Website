-- Down migration
DELETE FROM certificates WHERE credential_id = 'JDOP-2026-001';
