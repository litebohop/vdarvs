-- Role upgrade requests submitted by users after signup

CREATE TABLE role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  requested_role user_role NOT NULL,
  reason TEXT NOT NULL,
  village TEXT,
  district TEXT,
  status record_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

ALTER TABLE role_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prototype_role_requests_all" ON role_requests
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
