import type {
  Job, Customer, Vehicle, Staff, ActivityLog,
  PartsRequisition, RequisitionLineItem, RequisitionStatus,
} from './types';

async function dbCall<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ action, payload }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error || `Database request failed (${response.status})`);
  }
  return body as T;
}

// ============================================================
// JOBS
// ============================================================

export async function fetchJobs(): Promise<Job[]> {
  return dbCall<Job[]>('jobs:list');
}

export async function fetchJobByNumber(jobNumber: string): Promise<Job | null> {
  return dbCall<Job | null>('jobs:get', { jobNumber });
}

export async function insertJob(job: Job): Promise<Job | null> {
  return dbCall<Job | null>('jobs:insert', { job });
}

export async function updateJob(jobNumber: string, updates: Partial<Job>): Promise<Job | null> {
  return dbCall<Job | null>('jobs:update', { jobNumber, updates });
}

// ============================================================
// CUSTOMERS
// ============================================================

export async function fetchCustomers(): Promise<Customer[]> {
  return dbCall<Customer[]>('customers:list');
}

export async function fetchCustomerById(id: string): Promise<Customer | null> {
  return dbCall<Customer | null>('customers:get', { id });
}

export async function insertCustomer(customer: Customer): Promise<Customer | null> {
  return dbCall<Customer | null>('customers:insert', { customer });
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  return dbCall<Customer | null>('customers:update', { id, updates });
}

export async function deleteCustomer(id: string): Promise<void> {
  await dbCall('customers:delete', { id });
}

// ============================================================
// VEHICLES
// ============================================================

export async function fetchVehicles(): Promise<Vehicle[]> {
  return dbCall<Vehicle[]>('vehicles:list');
}

export async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  return dbCall<Vehicle | null>('vehicles:get', { id });
}

export async function fetchVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
  return dbCall<Vehicle[]>('vehicles:byCustomer', { customerId });
}

export async function insertVehicle(vehicle: Vehicle): Promise<Vehicle | null> {
  return dbCall<Vehicle | null>('vehicles:insert', { vehicle });
}

export async function updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
  return dbCall<Vehicle | null>('vehicles:update', { id, updates });
}

export async function deleteVehicle(id: string): Promise<void> {
  await dbCall('vehicles:delete', { id });
}

// ============================================================
// STAFF
// ============================================================

export async function fetchStaff(): Promise<Staff[]> {
  return dbCall<Staff[]>('staff:list');
}

export async function fetchStaffByUsername(username: string): Promise<Staff | null> {
  return dbCall<Staff | null>('staff:byUsername', { username });
}

export async function fetchStaffByRole(role: Staff['role']): Promise<Staff[]> {
  return dbCall<Staff[]>('staff:byRole', { role });
}

export async function insertStaff(staff: Staff): Promise<Staff | null> {
  return dbCall<Staff | null>('staff:insert', { staff });
}

export async function updateStaff(id: string, updates: Partial<Staff>): Promise<Staff | null> {
  return dbCall<Staff | null>('staff:update', { id, updates });
}

export async function deleteStaff(id: string): Promise<void> {
  await dbCall('staff:delete', { id });
}

// ============================================================
// ACTIVITY LOGS
// ============================================================

export async function fetchActivityLogs(limit = 100): Promise<ActivityLog[]> {
  return dbCall<ActivityLog[]>('activity:list', { limit });
}

export async function insertActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
  await dbCall('activity:insert', { log });
}

// ============================================================
// PARTS REQUISITIONS
// MongoDB stores items + statusHistory inside the requisition document.
// ============================================================

export async function fetchRequisitionsForJob(jobNumber: string): Promise<PartsRequisition[]> {
  return dbCall<PartsRequisition[]>('requisitions:list', { jobNumber });
}

export async function fetchAllRequisitions(): Promise<PartsRequisition[]> {
  return dbCall<PartsRequisition[]>('requisitions:list');
}

export async function fetchRequisitionById(id: string): Promise<PartsRequisition | null> {
  return dbCall<PartsRequisition | null>('requisitions:get', { id });
}

export async function insertRequisition(
  requisitionNumber: string,
  jobNumber: string,
  vehicleModel: string,
  licensePlate: string,
  requestedBy: string,
  requestedByName: string,
  items: Omit<RequisitionLineItem, 'id'>[],
): Promise<PartsRequisition | null> {
  return dbCall<PartsRequisition | null>('requisitions:insert', {
    requisitionNumber,
    jobNumber,
    vehicleModel,
    licensePlate,
    requestedBy,
    requestedByName,
    items,
  });
}

export async function updateRequisitionStatusDb(
  id: string,
  newStatus: RequisitionStatus,
  changedBy: string,
  changedByName: string,
  note = '',
): Promise<PartsRequisition | null> {
  return dbCall<PartsRequisition | null>('requisitions:updateStatus', {
    id,
    newStatus,
    changedBy,
    changedByName,
    note,
  });
}

// ============================================================
// APP SETTINGS
// ============================================================

export async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  const result = await dbCall<{ found: boolean; value?: T }>('settings:get', { key });
  return result.found ? (result.value as T) : fallback;
}

export async function saveSetting<T>(key: string, value: T): Promise<void> {
  await dbCall('settings:save', { key, value });
}


// ============================================================
// BACKUP / RESTORE
// ============================================================

export interface DatabaseBackupPayload {
  appName: string;
  version: string;
  createdAt: string;
  customers: Customer[];
  vehicles: Vehicle[];
  jobs: Job[];
  staff: Staff[];
  activityLogs: ActivityLog[];
  partsRequisitions: PartsRequisition[];
  appSettings?: Array<{ key: string; value: unknown }>;
}

export async function fetchDatabaseBackup(): Promise<DatabaseBackupPayload> {
  return dbCall<DatabaseBackupPayload>('backup:export');
}

export async function restoreDatabaseBackup(data: DatabaseBackupPayload): Promise<void> {
  await dbCall('backup:restore', { data });
}
