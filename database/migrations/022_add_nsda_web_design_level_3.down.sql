-- Down migration
DELETE FROM certificates WHERE credential_id = 'NSC-ICT-WD-L3-003103';
UPDATE certificates SET sort_order = 3 WHERE credential_id = 'JDOP-2026-001';
