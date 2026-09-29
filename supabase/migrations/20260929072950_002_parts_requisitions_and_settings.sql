/*
# Parts requisition tables + app settings

1. New Tables
- `parts_requisitions` — ใบเบิกอะไหล่ ผูกกับ job_number
- `requisition_items` — รายการอะไหล่ในแต่ละใบเบิก (part_number, part_name, quantity, unit, photo, note)
- `requisition_status_history` — ประวัติการเปลี่ยนสถานะของใบเบิก
- `app_settings` — ตารางเก็บค่าตั้งค่าต่างๆ (key-value, JSONB)
2. Security
- Enable RLS on every table
- `TO anon, authenticated` with `USING (true)` — single-tenant shared data
3. Notes
- requisition_status_history references parts_requisitions via FK
- Status values: DRAFT, PENDING_APPROVAL, APPROVED, WAITING_ISSUE, ISSUED, RECEIVED, REJECTED, OUT_OF_STOCK, CANCELLED
*/

-- === PARTS REQUISITIONS ===
CREATE TABLE IF NOT EXISTS parts_requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_number text NOT NULL UNIQUE,
  job_number text NOT NULL DEFAULT '',
  vehicle_model text NOT NULL DEFAULT '',
  license_plate text NOT NULL DEFAULT '',
  requested_by text NOT NULL DEFAULT '',
  requested_by_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE parts_requisitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_parts_requisitions" ON parts_requisitions;
CREATE POLICY "anon_select_parts_requisitions" ON parts_requisitions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_parts_requisitions" ON parts_requisitions;
CREATE POLICY "anon_insert_parts_requisitions" ON parts_requisitions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_parts_requisitions" ON parts_requisitions;
CREATE POLICY "anon_update_parts_requisitions" ON parts_requisitions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_parts_requisitions" ON parts_requisitions;
CREATE POLICY "anon_delete_parts_requisitions" ON parts_requisitions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_req_job_number ON parts_requisitions (job_number);
CREATE INDEX IF NOT EXISTS idx_req_status ON parts_requisitions (status);
CREATE INDEX IF NOT EXISTS idx_req_number ON parts_requisitions (requisition_number);

-- === REQUISITION ITEMS ===
CREATE TABLE IF NOT EXISTS requisition_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id uuid NOT NULL REFERENCES parts_requisitions(id) ON DELETE CASCADE,
  part_number text NOT NULL DEFAULT '',
  part_name text NOT NULL DEFAULT '',
  part_photo text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'ชิ้น',
  note text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE requisition_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_req_items" ON requisition_items;
CREATE POLICY "anon_select_req_items" ON requisition_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_req_items" ON requisition_items;
CREATE POLICY "anon_insert_req_items" ON requisition_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_req_items" ON requisition_items;
CREATE POLICY "anon_update_req_items" ON requisition_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_req_items" ON requisition_items;
CREATE POLICY "anon_delete_req_items" ON requisition_items FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_req_items_requisition ON requisition_items (requisition_id);

-- === REQUISITION STATUS HISTORY ===
CREATE TABLE IF NOT EXISTS requisition_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id uuid NOT NULL REFERENCES parts_requisitions(id) ON DELETE CASCADE,
  from_status text NOT NULL DEFAULT '',
  to_status text NOT NULL DEFAULT '',
  changed_by text NOT NULL DEFAULT '',
  changed_by_name text NOT NULL DEFAULT '',
  changed_at timestamptz NOT NULL DEFAULT now(),
  note text NOT NULL DEFAULT ''
);

ALTER TABLE requisition_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_req_history" ON requisition_status_history;
CREATE POLICY "anon_select_req_history" ON requisition_status_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_req_history" ON requisition_status_history;
CREATE POLICY "anon_insert_req_history" ON requisition_status_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_req_history" ON requisition_status_history;
CREATE POLICY "anon_delete_req_history" ON requisition_status_history FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_req_history_requisition ON requisition_status_history (requisition_id);

-- === APP SETTINGS (key-value JSONB) ===
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON app_settings;
CREATE POLICY "anon_select_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON app_settings;
CREATE POLICY "anon_insert_settings" ON app_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON app_settings;
CREATE POLICY "anon_update_settings" ON app_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON app_settings;
CREATE POLICY "anon_delete_settings" ON app_settings FOR DELETE
  TO anon, authenticated USING (true);

-- === updated_at triggers for new tables ===
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('parts_requisitions')
  LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON %I', t, t);
      EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END
$$;
