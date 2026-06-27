-- Adds a chiefs table and enforces referential integrity for chief_id columns.
-- Chief ids match the values already used by the initial seed so existing rows
-- validate against the new foreign keys without rewriting their references.

CREATE TABLE chiefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  village TEXT NOT NULL,
  district TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chiefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prototype_chiefs_all" ON chiefs
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed the chiefs referenced by the initial migration.
INSERT INTO chiefs (id, name, village, district) VALUES
  ('a0000001-0001-4001-8001-000000000001', 'Chief Letsie Ramokoatsi', 'Masianokeng', 'Maseru'),
  ('a0000001-0001-4001-8001-000000000002', 'Chief Motlalepula Tsolo', 'Ha Tsolo', 'Maseru'),
  ('a0000001-0001-4001-8001-000000000003', '''Mamohato Khumalo', 'Ha Ramokoatsi', 'Berea');

-- Enforce foreign keys now that every referenced chief exists.
ALTER TABLE profiles
  ADD CONSTRAINT profiles_chief_id_fkey
  FOREIGN KEY (chief_id) REFERENCES chiefs(id);

ALTER TABLE citizens
  ADD CONSTRAINT citizens_chief_id_fkey
  FOREIGN KEY (chief_id) REFERENCES chiefs(id);

ALTER TABLE land_records
  ADD CONSTRAINT land_records_chief_id_fkey
  FOREIGN KEY (chief_id) REFERENCES chiefs(id);

ALTER TABLE disputes
  ADD CONSTRAINT disputes_chief_id_fkey
  FOREIGN KEY (chief_id) REFERENCES chiefs(id);

ALTER TABLE residency_requests
  ADD CONSTRAINT residency_requests_chief_id_fkey
  FOREIGN KEY (chief_id) REFERENCES chiefs(id);
