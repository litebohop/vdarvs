-- Clear demo/seed operational data. Keeps profiles, chiefs, and auth users.
DELETE FROM notifications;
DELETE FROM audit_logs;
DELETE FROM role_requests;
DELETE FROM documents;
DELETE FROM disputes;
DELETE FROM animals;
DELETE FROM land_records;
DELETE FROM residency_requests;
DELETE FROM citizens;
