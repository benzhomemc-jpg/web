/*
# Core tables for MMB Workshop

1. New Tables
- `customers` — ลูกค้า (บุคคล/นิติบุคคล) พร้อมที่อยู่ ภพ./เลขประจำตัวผู้เสียภาษี
- `vehicles` — รถของลูกค้า ผูกกับ customer_id
- `jobs` — งานซ่อม ผูกกับ vehicle และ customer ผ่าน license_plate/phone
- `staff` — พนักงาน 4 บทบาท (admin, service_advisor, workshop_supervisor, technician)
- `activity_logs` — บันทึกการเปลี่ยนแปลงสำคัญทั้งหมด
2. Security
- Enable RLS on every table
- App uses localStorage auth (no Supabase Auth), so frontend talks as `anon` role
- All policies use `TO anon, authenticated` with `USING (true)` — single-tenant shared data
3. Notes
- JSONB columns for flexible nested data (address, photos, quickItems, etc.)
- Text-based IDs for jobs (job_number) and staff (code) for human readability
- Timestamps default to now()
*/

-- === CUSTOMERS ===
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  line_id text NOT NULL DEFAULT '',
  customer_type text NOT NULL DEFAULT 'person' CHECK (customer_type IN ('person', 'company')),
  company_name text NOT NULL DEFAULT '',
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  tax_id text NOT NULL DEFAULT '',
  branch text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers" ON customers FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (name);

-- === VEHICLES ===
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  brand text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  license_plate text NOT NULL DEFAULT '',
  province text NOT NULL DEFAULT '',
  vin text NOT NULL DEFAULT '',
  chassis_code text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  engine_number text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '',
  mileage text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vehicles" ON vehicles;
CREATE POLICY "anon_select_vehicles" ON vehicles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vehicles" ON vehicles;
CREATE POLICY "anon_insert_vehicles" ON vehicles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vehicles" ON vehicles;
CREATE POLICY "anon_update_vehicles" ON vehicles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_vehicles" ON vehicles;
CREATE POLICY "anon_delete_vehicles" ON vehicles FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles (license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles (customer_id);

-- === JOBS ===
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number text NOT NULL UNIQUE,
  vehicle_model text NOT NULL DEFAULT '',
  license_plate text NOT NULL DEFAULT '',
  customer text NOT NULL DEFAULT '',
  mileage text NOT NULL DEFAULT '',
  technician text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'received',
  received_time text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  line_contact text NOT NULL DEFAULT '',
  customer_type text NOT NULL DEFAULT 'person',
  company_name text NOT NULL DEFAULT '',
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  tax_id text NOT NULL DEFAULT '',
  branch text NOT NULL DEFAULT '',
  province text NOT NULL DEFAULT '',
  vin text NOT NULL DEFAULT '',
  model_year text NOT NULL DEFAULT '',
  engine_number text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '',
  complaint text NOT NULL DEFAULT '',
  quick_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  fuel_level text NOT NULL DEFAULT '',
  valuables text NOT NULL DEFAULT '',
  condition_note text NOT NULL DEFAULT '',
  service_advisor text NOT NULL DEFAULT '',
  workshop_supervisor text NOT NULL DEFAULT '',
  assigned_technicians jsonb NOT NULL DEFAULT '[]'::jsonb,
  received_date_time text NOT NULL DEFAULT '',
  photos jsonb NOT NULL DEFAULT '{}'::jsonb,
  media jsonb NOT NULL DEFAULT '[]'::jsonb,
  customer_signature text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_jobs" ON jobs;
CREATE POLICY "anon_select_jobs" ON jobs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_jobs" ON jobs;
CREATE POLICY "anon_insert_jobs" ON jobs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_jobs" ON jobs;
CREATE POLICY "anon_update_jobs" ON jobs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_jobs" ON jobs;
CREATE POLICY "anon_delete_jobs" ON jobs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_jobs_job_number ON jobs (job_number);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_plate ON jobs (license_plate);

-- === STAFF ===
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL DEFAULT '',
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  nickname text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'technician' CHECK (role IN ('admin', 'service_advisor', 'workshop_supervisor', 'technician')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  start_date text NOT NULL DEFAULT '',
  specialties jsonb NOT NULL DEFAULT '[]'::jsonb,
  username text NOT NULL DEFAULT '',
  pin text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_staff" ON staff;
CREATE POLICY "anon_select_staff" ON staff FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_staff" ON staff;
CREATE POLICY "anon_insert_staff" ON staff FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_staff" ON staff;
CREATE POLICY "anon_update_staff" ON staff FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_staff" ON staff;
CREATE POLICY "anon_delete_staff" ON staff FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_staff_username ON staff (username);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff (role);

-- === ACTIVITY LOGS ===
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  user_id text NOT NULL DEFAULT '',
  user_name text NOT NULL DEFAULT '',
  action text NOT NULL DEFAULT '',
  entity_type text NOT NULL DEFAULT '',
  entity_id text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT ''
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activity_logs" ON activity_logs;
CREATE POLICY "anon_select_activity_logs" ON activity_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activity_logs" ON activity_logs;
CREATE POLICY "anon_insert_activity_logs" ON activity_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_activity_logs" ON activity_logs;
CREATE POLICY "anon_delete_activity_logs" ON activity_logs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs (timestamp DESC);

-- === updated_at trigger ===
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('customers', 'vehicles', 'jobs', 'staff')
  LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON %I', t, t);
      EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END
$$;
