'use client';

import { supabase, isSupabaseConfigured } from './supabase-client';
import { addActivityLog as addActivityLogLocal } from './store';
import { getCurrentUser } from './auth';
import type { Job } from './jobs';

// --- Helpers ---

function jobToRow(job: Job): Record<string, unknown> {
  return {
    job_number: job.jobNumber,
    vehicle_model: job.vehicleModel || '',
    license_plate: job.licensePlate || '',
    customer: job.customer || '',
    mileage: job.mileage || '',
    technician: job.technician || '',
    status: job.status,
    received_time: job.receivedTime || '',
    phone: job.phone || '',
    line_contact: job.lineContact || '',
    customer_type: job.customerType || 'person',
    company_name: job.companyName || '',
    address: job.address || {},
    tax_id: job.taxId || '',
    branch: job.branch || '',
    province: job.province || '',
    vin: job.vin || '',
    model_year: job.modelYear || '',
    engine_number: job.engineNumber || '',
    color: job.color || '',
    complaint: job.complaint || '',
    quick_items: job.quickItems || [],
    fuel_level: job.fuelLevel || '',
    valuables: job.valuables || '',
    condition_note: job.conditionNote || '',
    service_advisor: job.serviceAdvisor || '',
    workshop_supervisor: job.workshopSupervisor || '',
    assigned_technicians: job.assignedTechnicians || [],
    received_date_time: job.receivedDateTime || '',
    photos: job.photos || {},
    media: job.media || [],
    customer_signature: job.customerSignature || '',
  };
}

function rowToJob(row: Record<string, unknown>): Job {
  return {
    id: String(row.id || ''),
    jobNumber: String(row.job_number || ''),
    vehicleModel: String(row.vehicle_model || ''),
    licensePlate: String(row.license_plate || ''),
    customer: String(row.customer || ''),
    mileage: String(row.mileage || ''),
    technician: String(row.technician || ''),
    status: (row.status as Job['status']) || 'received',
    receivedTime: String(row.received_time || ''),
    phone: String(row.phone || '') || undefined,
    lineContact: String(row.line_contact || '') || undefined,
    customerType: (row.customer_type as 'person' | 'company') || undefined,
    companyName: String(row.company_name || '') || undefined,
    address: (row.address as Job['address']) || undefined,
    taxId: String(row.tax_id || '') || undefined,
    branch: (row.branch as Job['branch']) || undefined,
    province: String(row.province || '') || undefined,
    vin: String(row.vin || '') || undefined,
    modelYear: String(row.model_year || '') || undefined,
    engineNumber: String(row.engine_number || '') || undefined,
    color: String(row.color || '') || undefined,
    complaint: String(row.complaint || '') || undefined,
    quickItems: (row.quick_items as string[]) || undefined,
    fuelLevel: String(row.fuel_level || '') || undefined,
    valuables: String(row.valuables || '') || undefined,
    conditionNote: String(row.condition_note || '') || undefined,
    serviceAdvisor: String(row.service_advisor || '') || undefined,
    workshopSupervisor: String(row.workshop_supervisor || '') || undefined,
    assignedTechnicians: (row.assigned_technicians as Job['assignedTechnicians']) || undefined,
    receivedDateTime: String(row.received_date_time || '') || undefined,
    photos: (row.photos as Job['photos']) || undefined,
    media: (row.media as Job['media']) || undefined,
    customerSignature: String(row.customer_signature || '') || undefined,
  };
}

// --- Jobs ---

export async function fetchJobs(): Promise<Job[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchJobs:', error); return []; }
  return (data || []).map(rowToJob);
}

export async function fetchJobByNumber(jobNumber: string): Promise<Job | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('job_number', jobNumber)
    .maybeSingle();
  if (error) { console.error('fetchJobByNumber:', error); return null; }
  return data ? rowToJob(data) : null;
}

export async function insertJob(job: Job): Promise<Job | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobToRow(job))
    .select('*')
    .maybeSingle();
  if (error) { console.error('insertJob:', error); return null; }
  return data ? rowToJob(data) : null;
}

export async function updateJob(jobNumber: string, updates: Partial<Job>): Promise<Job | null> {
  if (!isSupabaseConfigured) return null;
  const row: Record<string, unknown> = {};
  if (updates.customer !== undefined) row.customer = updates.customer;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.lineContact !== undefined) row.line_contact = updates.lineContact;
  if (updates.customerType !== undefined) row.customer_type = updates.customerType;
  if (updates.companyName !== undefined) row.company_name = updates.companyName;
  if (updates.address !== undefined) row.address = updates.address;
  if (updates.taxId !== undefined) row.tax_id = updates.taxId;
  if (updates.branch !== undefined) row.branch = updates.branch;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.complaint !== undefined) row.complaint = updates.complaint;
  if (updates.fuelLevel !== undefined) row.fuel_level = updates.fuelLevel;
  if (updates.valuables !== undefined) row.valuables = updates.valuables;
  if (updates.conditionNote !== undefined) row.condition_note = updates.conditionNote;
  if (updates.quickItems !== undefined) row.quick_items = updates.quickItems;
  if (updates.serviceAdvisor !== undefined) row.service_advisor = updates.serviceAdvisor;
  if (updates.workshopSupervisor !== undefined) row.workshop_supervisor = updates.workshopSupervisor;
  if (updates.assignedTechnicians !== undefined) row.assigned_technicians = updates.assignedTechnicians;
  if (updates.photos !== undefined) row.photos = updates.photos;
  if (updates.media !== undefined) row.media = updates.media;
  if (updates.customerSignature !== undefined) row.customer_signature = updates.customerSignature;
  if (updates.mileage !== undefined) row.mileage = updates.mileage;
  if (updates.technician !== undefined) row.technician = updates.technician;

  if (Object.keys(row).length === 0) return null;

  const { data, error } = await supabase
    .from('jobs')
    .update(row)
    .eq('job_number', jobNumber)
    .select('*')
    .maybeSingle();
  if (error) { console.error('updateJob:', error); return null; }
  return data ? rowToJob(data) : null;
}

// --- Staff ---

export interface StaffRow {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  nickname: string;
  phone: string;
  role: string;
  status: string;
  start_date: string;
  specialties: string[];
  username: string;
  pin: string;
  created_at: string;
}

export async function fetchStaff(): Promise<StaffRow[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchStaff:', error); return []; }
  return (data || []) as unknown as StaffRow[];
}

export async function fetchStaffByUsername(username: string): Promise<StaffRow | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  if (error) { console.error('fetchStaffByUsername:', error); return null; }
  return (data as unknown as StaffRow) || null;
}

export async function insertStaff(staff: Omit<StaffRow, 'id' | 'created_at'>): Promise<StaffRow | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('staff')
    .insert(staff)
    .select('*')
    .maybeSingle();
  if (error) { console.error('insertStaff:', error); return null; }
  return (data as unknown as StaffRow) || null;
}

export async function updateStaff(id: string, updates: Partial<StaffRow>): Promise<StaffRow | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('staff')
    .update(updates)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) { console.error('updateStaff:', error); return null; }
  return (data as unknown as StaffRow) || null;
}

export async function deleteStaff(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) { console.error('deleteStaff:', error); return false; }
  return true;
}

// --- Activity Logs ---

export interface ActivityLogRow {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
}

export async function fetchActivityLogs(limit: number = 100): Promise<ActivityLogRow[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  if (error) { console.error('fetchActivityLogs:', error); return []; }
  return (data || []) as unknown as ActivityLogRow[];
}

export async function insertActivityLog(log: Omit<ActivityLogRow, 'id' | 'timestamp'>): Promise<void> {
  addActivityLogLocal({
    userId: log.user_id,
    userName: log.user_name,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    description: log.description,
  });
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('activity_logs').insert({
    user_id: log.user_id,
    user_name: log.user_name,
    action: log.action,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    description: log.description,
  });
  if (error) console.error('insertActivityLog:', error);
}

// --- Parts Requisitions ---

export interface RequisitionRow {
  id: string;
  requisition_number: string;
  job_number: string;
  vehicle_model: string;
  license_plate: string;
  requested_by: string;
  requested_by_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RequisitionItemRow {
  id: string;
  requisition_id: string;
  part_number: string;
  part_name: string;
  part_photo: string;
  quantity: number;
  unit: string;
  note: string;
  sort_order: number;
}

export interface RequisitionHistoryRow {
  id: string;
  requisition_id: string;
  from_status: string;
  to_status: string;
  changed_by: string;
  changed_by_name: string;
  changed_at: string;
  note: string;
}

export async function fetchRequisitionsForJob(jobNumber: string): Promise<RequisitionRow[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('parts_requisitions')
    .select('*')
    .eq('job_number', jobNumber)
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchRequisitionsForJob:', error); return []; }
  return (data || []) as unknown as RequisitionRow[];
}

export async function fetchAllRequisitions(): Promise<RequisitionRow[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('parts_requisitions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchAllRequisitions:', error); return []; }
  return (data || []) as unknown as RequisitionRow[];
}

export async function fetchRequisitionById(id: string): Promise<{
  req: RequisitionRow;
  items: RequisitionItemRow[];
  history: RequisitionHistoryRow[];
} | null> {
  if (!isSupabaseConfigured) return null;
  const [reqRes, itemsRes, historyRes] = await Promise.all([
    supabase.from('parts_requisitions').select('*').eq('id', id).maybeSingle(),
    supabase.from('requisition_items').select('*').eq('requisition_id', id).order('sort_order', { ascending: true }),
    supabase.from('requisition_status_history').select('*').eq('requisition_id', id).order('changed_at', { ascending: true }),
  ]);
  if (reqRes.error || !reqRes.data) { console.error('fetchRequisitionById:', reqRes.error); return null; }
  return {
    req: reqRes.data as unknown as RequisitionRow,
    items: (itemsRes.data || []) as unknown as RequisitionItemRow[],
    history: (historyRes.data || []) as unknown as RequisitionHistoryRow[],
  };
}

export async function insertRequisition(
  requisitionNumber: string,
  jobNumber: string,
  vehicleModel: string,
  licensePlate: string,
  items: { part_number: string; part_name: string; part_photo: string; quantity: number; unit: string; note: string }[],
): Promise<RequisitionRow | null> {
  if (!isSupabaseConfigured) return null;
  const user = getCurrentUser();
  const { data: reqData, error: reqError } = await supabase
    .from('parts_requisitions')
    .insert({
      requisition_number: requisitionNumber,
      job_number: jobNumber,
      vehicle_model: vehicleModel,
      license_plate: licensePlate,
      requested_by: user?.staffId ?? '',
      requested_by_name: user?.nickname ?? '',
      status: 'DRAFT',
    })
    .select('*')
    .maybeSingle();
  if (reqError || !reqData) { console.error('insertRequisition:', reqError); return null; }

  const reqId = (reqData as unknown as RequisitionRow).id;
  if (items.length > 0) {
    const itemRows = items.map((it, i) => ({
      requisition_id: reqId,
      part_number: it.part_number,
      part_name: it.part_name,
      part_photo: it.part_photo,
      quantity: it.quantity,
      unit: it.unit,
      note: it.note,
      sort_order: i,
    }));
    const { error: itemsError } = await supabase.from('requisition_items').insert(itemRows);
    if (itemsError) console.error('insertRequisition items:', itemsError);
  }

  const { error: histError } = await supabase.from('requisition_status_history').insert({
    requisition_id: reqId,
    from_status: 'DRAFT',
    to_status: 'DRAFT',
    changed_by: user?.staffId ?? '',
    changed_by_name: user?.nickname ?? '',
    note: 'สร้างใบเบิก',
  });
  if (histError) console.error('insertRequisition history:', histError);

  await insertActivityLog({
    user_id: user?.staffId ?? 'system',
    user_name: user?.nickname ?? 'System',
    action: `สร้างใบเบิกอะไหล่ ${requisitionNumber}`,
    entity_type: 'parts_requisition',
    entity_id: reqId,
    description: `JOB ${jobNumber} — ${items.length} รายการ`,
  });

  return reqData as unknown as RequisitionRow;
}

export async function updateRequisitionStatus(
  id: string,
  newStatus: string,
  note: string = '',
): Promise<RequisitionRow | null> {
  if (!isSupabaseConfigured) return null;
  const user = getCurrentUser();

  const { data: current } = await supabase
    .from('parts_requisitions')
    .select('status, requisition_number')
    .eq('id', id)
    .maybeSingle();
  const fromStatus = (current as Record<string, unknown> | null)?.status as string ?? 'DRAFT';
  const reqNumber = (current as Record<string, unknown> | null)?.requisition_number as string ?? '';

  const { data, error } = await supabase
    .from('parts_requisitions')
    .update({ status: newStatus })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) { console.error('updateRequisitionStatus:', error); return null; }

  await supabase.from('requisition_status_history').insert({
    requisition_id: id,
    from_status: fromStatus,
    to_status: newStatus,
    changed_by: user?.staffId ?? 'system',
    changed_by_name: user?.nickname ?? 'System',
    note,
  });

  await insertActivityLog({
    user_id: user?.staffId ?? 'system',
    user_name: user?.nickname ?? 'System',
    action: `เปลี่ยนสถานะใบเบิก ${reqNumber}`,
    entity_type: 'parts_requisition',
    entity_id: id,
    description: `${fromStatus} → ${newStatus}${note ? ` (${note})` : ''}`,
  });

  return data as unknown as RequisitionRow;
}

// --- App Settings ---

export async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  if (!isSupabaseConfigured) return fallback;
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error || !data) return fallback;
  return (data as Record<string, unknown>).value as T;
}

export async function saveSetting<T>(key: string, value: T): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value: value as unknown as Record<string, unknown> });
  if (error) console.error('saveSetting:', error);
}
