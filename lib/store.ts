// Re-export shim — types and constants now in models/
export type {
  Customer, Vehicle, Staff, StaffRole, StaffStatus, ActivityLog,
  WorkshopInfo, JobNumberConfig, JobStatusConfig, RepairCategory,
  NotificationConfig, CustomerAddress, BranchType,
} from './models/types';

export {
  STAFF_ROLES, STAFF_STATUSES, TECHNICIAN_SPECIALTIES,
  DEFAULT_WORKSHOP_INFO, DEFAULT_JOB_NUMBER_CONFIG, DEFAULT_JOB_STATUSES,
  DEFAULT_REPAIR_CATEGORIES, DEFAULT_NOTIFICATIONS, EMPTY_ADDRESS,
  formatAddress,
} from './models/constants';

// Settings functions — these still use localStorage for now
// (settings migration to Supabase is a future task)

const SETTINGS_KEY = 'mmb_settings';
const JOB_NUMBER_KEY = 'mmb_job_number_config';
const JOB_STATUSES_KEY = 'mmb_job_statuses';
const REPAIR_CATEGORIES_KEY = 'mmb_repair_categories';
const NOTIFICATIONS_KEY = 'mmb_notifications';

function readObject<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeObject<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

function readJson<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeJson<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// Workshop Info
export function getWorkshopInfo() {
  return readObject(SETTINGS_KEY, {
    name: 'MMB WORKSHOP', nameEn: 'MMB WORKSHOP SERVICE MANAGEMENT',
    address: '', subDistrict: '', district: '', province: '', postalCode: '',
    phone: '', line: '', email: '', website: '', taxId: '', branchNumber: '', logo: '',
  });
}

export function saveWorkshopInfo(info: import('./models/types').WorkshopInfo): void {
  writeObject(SETTINGS_KEY, info);
}

// Job Number Config
export function getJobNumberConfig(): import('./models/types').JobNumberConfig {
  return readObject<import('./models/types').JobNumberConfig>(JOB_NUMBER_KEY, {
    prefix: 'MMB', includeYY: true, includeMM: true, runningDigits: 4,
    resetRule: 'monthly', lastNumber: 0, lastResetMonth: '', lastResetYear: '',
  });
}

export function saveJobNumberConfig(config: import('./models/types').JobNumberConfig): void {
  writeObject(JOB_NUMBER_KEY, config);
}

export function generateConfiguredJobNumber(): string {
  const config = getJobNumberConfig();
  const now = new Date();
  const yy = String(now.getFullYear() + 543 - 2500).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  let shouldReset = false;
  if (config.resetRule === 'monthly' && config.lastResetMonth !== `${yy}${mm}`) shouldReset = true;
  else if (config.resetRule === 'yearly' && config.lastResetYear !== yy) shouldReset = true;
  let nextNum = shouldReset ? 1 : config.lastNumber + 1;
  const parts = [config.prefix, '-'];
  if (config.includeYY) parts.push(yy);
  if (config.includeMM) parts.push(mm);
  parts.push(String(nextNum).padStart(config.runningDigits, '0'));
  saveJobNumberConfig({ ...config, lastNumber: nextNum, lastResetMonth: `${yy}${mm}`, lastResetYear: yy });
  return parts.join('');
}

// Job Statuses
export function getJobStatuses() {
  const stored = readJson<import('./models/types').JobStatusConfig>(JOB_STATUSES_KEY);
  return stored.length > 0 ? stored.sort((a, b) => a.order - b.order) : [
    { id: 's1', internalId: 'RECEIVED', label: 'รับรถ', enabled: true, order: 0 },
    { id: 's2', internalId: 'INSPECTION', label: 'ตรวจเช็ก', enabled: true, order: 1 },
    { id: 's3', internalId: 'QUOTATION', label: 'เสนอราคา', enabled: true, order: 2 },
    { id: 's4', internalId: 'WAITING_APPROVAL', label: 'รออนุมัติ', enabled: true, order: 3 },
    { id: 's5', internalId: 'WAITING_PARTS', label: 'รออะไหล่', enabled: true, order: 4 },
    { id: 's6', internalId: 'REPAIRING', label: 'กำลังซ่อม', enabled: true, order: 5 },
    { id: 's7', internalId: 'QC', label: 'QC', enabled: true, order: 6 },
    { id: 's8', internalId: 'READY_DELIVERY', label: 'พร้อมส่งมอบ', enabled: true, order: 7 },
    { id: 's9', internalId: 'CLOSED', label: 'ปิด JOB', enabled: true, order: 8 },
  ];
}

export function saveJobStatuses(statuses: import('./models/types').JobStatusConfig[]): void {
  writeJson(JOB_STATUSES_KEY, statuses);
}

// Repair Categories
export function getRepairCategories() {
  const stored = readJson<import('./models/types').RepairCategory>(REPAIR_CATEGORIES_KEY);
  return stored.length > 0 ? stored.sort((a, b) => a.order - b.order) : [
    { id: 'rc1', label: 'เครื่องยนต์', enabled: true, order: 0 },
    { id: 'rc2', label: 'เกียร์', enabled: true, order: 1 },
    { id: 'rc3', label: 'ช่วงล่าง', enabled: true, order: 2 },
    { id: 'rc4', label: 'เบรก', enabled: true, order: 3 },
    { id: 'rc5', label: 'ระบบไฟฟ้า', enabled: true, order: 4 },
    { id: 'rc6', label: 'ระบบปรับอากาศ', enabled: true, order: 5 },
    { id: 'rc7', label: 'Diagnostic', enabled: true, order: 6 },
    { id: 'rc8', label: 'แบตเตอรี่', enabled: true, order: 7 },
    { id: 'rc9', label: 'Hybrid / EV', enabled: true, order: 8 },
    { id: 'rc10', label: 'ยาง', enabled: true, order: 9 },
    { id: 'rc11', label: 'เช็กระยะ', enabled: true, order: 10 },
    { id: 'rc12', label: 'ตัวถัง', enabled: true, order: 11 },
    { id: 'rc13', label: 'อื่นๆ', enabled: true, order: 12 },
  ];
}

export function saveRepairCategories(categories: import('./models/types').RepairCategory[]): void {
  writeJson(REPAIR_CATEGORIES_KEY, categories);
}

// Notifications
export function getNotificationConfig() {
  return readObject(NOTIFICATIONS_KEY, {
    newJob: true, customerApproval: true, partsArrived: true, repairComplete: true,
    waitingQc: true, qcPassed: true, readyDelivery: true,
  });
}

export function saveNotificationConfig(config: import('./models/types').NotificationConfig): void {
  writeObject(NOTIFICATIONS_KEY, config);
}

// Activity log — now a no-op, data goes to Supabase via controllers
export function getActivityLogs(): import('./models/types').ActivityLog[] { return []; }
export function addActivityLog(_log: Omit<import('./models/types').ActivityLog, 'id' | 'timestamp'>): void {}

// Backup / Export — stubs for now
export interface BackupData {
  appName: string; version: string; createdAt: string;
  customers: import('./models/types').Customer[];
  vehicles: import('./models/types').Vehicle[];
  jobs: import('./models/types').Job[];
  staff: import('./models/types').Staff[];
  settings: import('./models/types').WorkshopInfo;
  jobNumberConfig: import('./models/types').JobNumberConfig;
  jobStatuses: import('./models/types').JobStatusConfig[];
  repairCategories: import('./models/types').RepairCategory[];
  notifications: import('./models/types').NotificationConfig;
  activityLogs: import('./models/types').ActivityLog[];
  partsRequisitions?: unknown[];
}

export function createBackup(): BackupData {
  return {
    appName: 'MMB Workshop', version: '2.0', createdAt: new Date().toISOString(),
    customers: [], vehicles: [], jobs: [], staff: [],
    settings: getWorkshopInfo(), jobNumberConfig: getJobNumberConfig(),
    jobStatuses: getJobStatuses(), repairCategories: getRepairCategories(),
    notifications: getNotificationConfig(), activityLogs: [],
  };
}

export function restoreBackup(_data: BackupData): void {}
export function validateBackup(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.appName === 'MMB Workshop' && typeof d.version === 'string';
}

export function checkDataIntegrity(): { label: string; count: number }[] { return []; }

// Migration — no-op, data is in Supabase
export function migrateData(): void {}

// Relationship helpers — stubs
export function getAllJobs(): import('./models/types').Job[] { return []; }
export function getJobByNumber(_jobNumber: string): import('./models/types').Job | undefined { return undefined; }
export function getCustomers(): import('./models/types').Customer[] { return []; }
export function getCustomerById(_id: string): import('./models/types').Customer | undefined { return undefined; }
export function saveCustomer(_customer: import('./models/types').Customer): void {}
export function findCustomerByPhone(_phone: string): import('./models/types').Customer | undefined { return undefined; }
export function getVehicles(): import('./models/types').Vehicle[] { return []; }
export function getVehicleById(_id: string): import('./models/types').Vehicle | undefined { return undefined; }
export function saveVehicle(_vehicle: import('./models/types').Vehicle): void {}
export function findVehicleByPlate(_plate: string): import('./models/types').Vehicle | undefined { return undefined; }
export function getStaff(): import('./models/types').Staff[] { return []; }
export function getStaffById(_id: string): import('./models/types').Staff | undefined { return undefined; }
export function saveStaff(_staff: import('./models/types').Staff): void {}
export function getStaffByRole(_role: import('./models/types').StaffRole): import('./models/types').Staff[] { return []; }
export function getActiveStaffByRole(_role: import('./models/types').StaffRole): import('./models/types').Staff[] { return []; }
export function getJobsForCustomer(_name: string): import('./models/types').Job[] { return []; }
export function getJobsForVehiclePlate(_plate: string): import('./models/types').Job[] { return []; }
export function getVehiclesForCustomer(_customer: import('./models/types').Customer): import('./models/types').Vehicle[] { return []; }
export function getCustomerForVehicle(_vehicle: import('./models/types').Vehicle): import('./models/types').Customer | undefined { return undefined; }
export function getLastServiceDate(_jobs: import('./models/types').Job[]): string { return '-'; }
