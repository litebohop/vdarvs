-- VDARVS initial schema, RLS, and Lesotho seed data

CREATE TYPE user_role AS ENUM (
  'citizen', 'village_staff', 'village_chief', 'district_officer', 'administrator'
);

CREATE TYPE record_status AS ENUM (
  'draft', 'pending', 'under_review', 'approved', 'rejected', 'archived'
);

CREATE TYPE verification_status AS ENUM (
  'unverified', 'pending', 'verified', 'rejected'
);

CREATE TYPE gender AS ENUM ('male', 'female', 'other');

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'citizen',
  village TEXT,
  district TEXT,
  chief_id UUID,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  gender gender NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  village TEXT NOT NULL,
  community_council TEXT,
  district TEXT NOT NULL,
  po_box TEXT,
  chief_id UUID NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  status record_status NOT NULL DEFAULT 'draft',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_number TEXT NOT NULL UNIQUE,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES citizens(id),
  village TEXT NOT NULL,
  district TEXT NOT NULL,
  status record_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE land_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_number TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES citizens(id),
  village TEXT NOT NULL,
  community_council TEXT NOT NULL,
  district TEXT NOT NULL,
  land_type TEXT NOT NULL,
  size_hectares REAL NOT NULL,
  chief_id UUID NOT NULL,
  status record_status NOT NULL DEFAULT 'pending',
  description TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  village TEXT NOT NULL,
  district TEXT NOT NULL,
  status record_status NOT NULL DEFAULT 'pending',
  issued_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by TEXT
);

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  complainant_id UUID NOT NULL REFERENCES citizens(id),
  respondent_name TEXT NOT NULL,
  village TEXT NOT NULL,
  district TEXT NOT NULL,
  chief_id UUID NOT NULL,
  category TEXT NOT NULL,
  status record_status NOT NULL DEFAULT 'pending',
  filed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  href TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL,
  village TEXT,
  district TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE residency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  chief_id UUID NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

-- RLS (prototype policies: open read/write for anon until Supabase Auth is wired)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE residency_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prototype_profiles_all" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prototype_citizens_all" ON citizens FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prototype_animals_all" ON animals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prototype_land_all" ON land_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prototype_documents_all" ON documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prototype_disputes_all" ON disputes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prototype_notifications_all" ON notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prototype_audit_all" ON audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prototype_residency_all" ON residency_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed: profiles
INSERT INTO profiles (id, email, full_name, role, village, district, chief_id, phone) VALUES
  ('c0000001-0001-4001-8001-000000000001', 'admin@vdarvs.gov.ls', 'Thabo Mokoena', 'administrator', NULL, 'Maseru', NULL, '+266 5888 1000'),
  ('c0000001-0001-4001-8001-000000000002', 'chief.masianokeng@vdarvs.gov.ls', 'Chief Letsie Ramokoatsi', 'village_chief', 'Masianokeng', 'Maseru', 'a0000001-0001-4001-8001-000000000001', '+266 5888 2001'),
  ('c0000001-0001-4001-8001-000000000003', 'staff.masianokeng@vdarvs.gov.ls', 'Mpho Seoli', 'village_staff', 'Masianokeng', 'Maseru', NULL, '+266 5888 3001'),
  ('c0000001-0001-4001-8001-000000000004', 'district.maseru@vdarvs.gov.ls', 'Lerato Khumalo', 'district_officer', NULL, 'Maseru', NULL, '+266 5888 4001'),
  ('c0000001-0001-4001-8001-000000000005', 'citizen@example.ls', 'Palesa Molapo', 'citizen', 'Masianokeng', 'Maseru', NULL, '+266 5888 5001');

-- Seed: citizens
INSERT INTO citizens (id, national_id, first_name, last_name, date_of_birth, gender, phone, email, village, community_council, district, po_box, chief_id, verification_status, status, registered_at) VALUES
  ('b0000001-0001-4001-8001-000000000001', 'LS-2001-004521', 'Palesa', 'Molapo', '1995-03-14', 'female', '+266 5888 5001', 'palesa.molapo@example.ls', 'Masianokeng', 'Maseru Central', 'Maseru', 'P.O. Box 1234', 'a0000001-0001-4001-8001-000000000001', 'verified', 'approved', now() - interval '28 days'),
  ('b0000001-0001-4001-8001-000000000002', 'LS-1988-002134', 'Thabo', 'Mokoena', '1988-07-22', 'male', '+266 5888 5012', NULL, 'Ha Tsolo', 'Maseru Central', 'Maseru', NULL, 'a0000001-0001-4001-8001-000000000002', 'verified', 'approved', now() - interval '60 days'),
  ('b0000001-0001-4001-8001-000000000003', 'LS-2003-007891', 'Lerato', 'Khumalo', '2003-11-05', 'female', '+266 5888 5023', NULL, 'Ha Ramokoatsi', 'Teyateyaneng', 'Berea', 'P.O. Box 567', 'a0000001-0001-4001-8001-000000000003', 'pending', 'pending', now() - interval '3 days'),
  ('b0000001-0001-4001-8001-000000000004', 'LS-1975-001002', 'Mpho', 'Seoli', '1975-01-18', 'male', '+266 5888 5034', NULL, 'Masianokeng', 'Maseru Central', 'Maseru', NULL, 'a0000001-0001-4001-8001-000000000001', 'verified', 'approved', now() - interval '120 days'),
  ('b0000001-0001-4001-8001-000000000005', 'LS-1999-005678', 'Karabo', 'Ntšo', '1999-09-30', 'male', '+266 5888 5045', NULL, 'Hlotse', 'Hlotse', 'Leribe', NULL, 'a0000001-0001-4001-8001-000000000001', 'unverified', 'draft', now() - interval '1 day'),
  ('b0000001-0001-4001-8001-000000000006', 'LS-1992-003456', '''Mamohato', 'Lerotholi', '1992-04-12', 'female', '+266 5888 5056', NULL, 'Maputsoe', 'Maputsoe', 'Leribe', 'P.O. Box 890', 'a0000001-0001-4001-8001-000000000001', 'verified', 'approved', now() - interval '90 days');

INSERT INTO animals (id, tag_number, species, breed, owner_id, village, district, status, registered_at) VALUES
  ('d0000001-0001-4001-8001-000000000001', 'LS-C-2024-001', 'cattle', 'Afrikaner', 'b0000001-0001-4001-8001-000000000001', 'Masianokeng', 'Maseru', 'approved', now() - interval '20 days'),
  ('d0000001-0001-4001-8001-000000000002', 'LS-S-2024-042', 'sheep', 'Merino', 'b0000001-0001-4001-8001-000000000002', 'Ha Tsolo', 'Maseru', 'approved', now() - interval '45 days'),
  ('d0000001-0001-4001-8001-000000000003', 'LS-G-2024-018', 'goat', 'Boer', 'b0000001-0001-4001-8001-000000000004', 'Masianokeng', 'Maseru', 'pending', now() - interval '10 days'),
  ('d0000001-0001-4001-8001-000000000004', 'LS-C-2024-002', 'cattle', 'Bonsmara', 'b0000001-0001-4001-8001-000000000006', 'Maputsoe', 'Leribe', 'approved', now() - interval '30 days');

INSERT INTO land_records (id, parcel_number, owner_id, village, community_council, district, land_type, size_hectares, chief_id, status, description, registered_at) VALUES
  ('e0000001-0001-4001-8001-000000000001', 'MSR-MK-001', 'b0000001-0001-4001-8001-000000000001', 'Masianokeng', 'Maseru Central', 'Maseru', 'residential', 0.25, 'a0000001-0001-4001-8001-000000000001', 'approved', 'Family homestead near the village centre', now() - interval '25 days'),
  ('e0000001-0001-4001-8001-000000000002', 'MSR-HT-014', 'b0000001-0001-4001-8001-000000000002', 'Ha Tsolo', 'Maseru Central', 'Maseru', 'agricultural', 1.5, 'a0000001-0001-4001-8001-000000000002', 'approved', NULL, now() - interval '55 days'),
  ('e0000001-0001-4001-8001-000000000003', 'BER-HR-007', 'b0000001-0001-4001-8001-000000000003', 'Ha Ramokoatsi', 'Teyateyaneng', 'Berea', 'grazing', 3.0, 'a0000001-0001-4001-8001-000000000003', 'under_review', NULL, now() - interval '5 days');

INSERT INTO documents (id, reference_number, type, title, citizen_id, village, district, status, issued_at, requested_at, approved_by) VALUES
  ('f0000001-0001-4001-8001-000000000001', 'VDARVS-RC-2024-0001', 'residency_certificate', 'Residency Certificate', 'b0000001-0001-4001-8001-000000000001', 'Masianokeng', 'Maseru', 'approved', now() - interval '5 days', now() - interval '10 days', 'Chief Letsie Ramokoatsi'),
  ('f0000001-0001-4001-8001-000000000002', 'VDARVS-LT-2024-0003', 'land_title', 'Land Title Certificate', 'b0000001-0001-4001-8001-000000000002', 'Ha Tsolo', 'Maseru', 'approved', now() - interval '15 days', now() - interval '20 days', 'Chief Motlalepula Tsolo'),
  ('f0000001-0001-4001-8001-000000000003', 'VDARVS-AP-2024-0012', 'animal_permit', 'Animal Registration Permit', 'b0000001-0001-4001-8001-000000000004', 'Masianokeng', 'Maseru', 'pending', NULL, now() - interval '2 days', NULL),
  ('f0000001-0001-4001-8001-000000000004', 'VDARVS-BR-2024-0008', 'birth_record', 'Birth Record Certificate', 'b0000001-0001-4001-8001-000000000003', 'Ha Ramokoatsi', 'Berea', 'under_review', NULL, now() - interval '3 days', NULL);

INSERT INTO disputes (id, case_number, title, description, complainant_id, respondent_name, village, district, chief_id, category, status, filed_at, resolved_at) VALUES
  ('90000001-0001-4001-8001-000000000001', 'DSP-2024-001', 'Boundary dispute between Molapo and Seoli families', 'Disagreement over the boundary line between two adjacent homesteads in Masianokeng.', 'b0000001-0001-4001-8001-000000000001', 'Mpho Seoli', 'Masianokeng', 'Maseru', 'a0000001-0001-4001-8001-000000000001', 'boundary', 'under_review', now() - interval '7 days', NULL),
  ('90000001-0001-4001-8001-000000000002', 'DSP-2024-002', 'Livestock grazing rights on communal land', 'Dispute over grazing access to communal land near Ha Tsolo.', 'b0000001-0001-4001-8001-000000000002', 'Karabo Ntšo', 'Ha Tsolo', 'Maseru', 'a0000001-0001-4001-8001-000000000002', 'livestock', 'pending', now() - interval '4 days', NULL),
  ('90000001-0001-4001-8001-000000000003', 'DSP-2023-045', 'Land inheritance dispute', 'Family dispute over inheritance of agricultural land parcel.', 'b0000001-0001-4001-8001-000000000006', 'Family Council', 'Maputsoe', 'Leribe', 'a0000001-0001-4001-8001-000000000001', 'land', 'approved', now() - interval '60 days', now() - interval '30 days');

INSERT INTO residency_requests (id, citizen_id, chief_id, status, requested_at) VALUES
  ('80000001-0001-4001-8001-000000000001', 'b0000001-0001-4001-8001-000000000003', 'a0000001-0001-4001-8001-000000000003', 'pending', now() - interval '3 days'),
  ('80000001-0001-4001-8001-000000000002', 'b0000001-0001-4001-8001-000000000005', 'a0000001-0001-4001-8001-000000000001', 'pending', now() - interval '1 day');

INSERT INTO notifications (id, user_id, title, message, type, read, href, created_at) VALUES
  ('70000001-0001-4001-8001-000000000001', 'c0000001-0001-4001-8001-000000000002', 'New residency verification request', 'Lerato Khumalo has submitted a residency verification request for Ha Ramokoatsi.', 'action', false, '/residency', now() - interval '1 day'),
  ('70000001-0001-4001-8001-000000000002', 'c0000001-0001-4001-8001-000000000002', 'Document pending approval', 'Animal Registration Permit for Mpho Seoli requires your endorsement.', 'warning', false, '/documents', now() - interval '2 days'),
  ('70000001-0001-4001-8001-000000000003', 'c0000001-0001-4001-8001-000000000003', 'New citizen registration', 'Karabo Ntšo has been registered in Hlotse, pending verification.', 'info', true, '/citizens', now() - interval '1 day'),
  ('70000001-0001-4001-8001-000000000004', 'c0000001-0001-4001-8001-000000000001', 'System audit completed', 'Monthly audit log review completed for Maseru district.', 'success', true, '/audit-logs', now() - interval '5 days');

INSERT INTO audit_logs (id, user_id, user_name, action, entity, entity_id, details, village, district, created_at) VALUES
  ('60000001-0001-4001-8001-000000000001', 'c0000001-0001-4001-8001-000000000002', 'Chief Letsie Ramokoatsi', 'APPROVE', 'citizen', 'b0000001-0001-4001-8001-000000000001', 'Approved residency verification for Palesa Molapo', 'Masianokeng', 'Maseru', now() - interval '5 days'),
  ('60000001-0001-4001-8001-000000000002', 'c0000001-0001-4001-8001-000000000003', 'Mpho Seoli', 'CREATE', 'citizen', 'b0000001-0001-4001-8001-000000000005', 'Registered new citizen Karabo Ntšo', 'Hlotse', 'Leribe', now() - interval '1 day'),
  ('60000001-0001-4001-8001-000000000003', 'c0000001-0001-4001-8001-000000000001', 'Thabo Mokoena', 'UPDATE', 'settings', 'system', 'Updated notification preferences for Maseru district', NULL, 'Maseru', now() - interval '3 days'),
  ('60000001-0001-4001-8001-000000000004', 'c0000001-0001-4001-8001-000000000002', 'Chief Letsie Ramokoatsi', 'CREATE', 'dispute', '90000001-0001-4001-8001-000000000001', 'Opened boundary dispute case DSP-2024-001', 'Masianokeng', 'Maseru', now() - interval '7 days');
