import type { JobStatus, JobStatusInfo, RequisitionStatus, RequisitionStatusInfo, StaffRole, StaffStatus } from './types';

export const JOB_STATUSES: Record<JobStatus, JobStatusInfo> = {
  received: { label: 'รับรถแล้ว', shortLabel: 'รับรถ', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30', dotColor: 'bg-blue-500' },
  inspecting: { label: 'กำลังตรวจเช็ก', shortLabel: 'ตรวจเช็ก', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/30', dotColor: 'bg-cyan-500' },
  pending: { label: 'รออนุมัติ', shortLabel: 'รออนุมัติ', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30', dotColor: 'bg-amber-500' },
  parts: { label: 'รออะไหล่', shortLabel: 'รออะไหล่', color: 'text-violet-400', bgColor: 'bg-violet-500/10 border-violet-500/30', dotColor: 'bg-violet-500' },
  repairing: { label: 'กำลังซ่อม', shortLabel: 'กำลังซ่อม', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/30', dotColor: 'bg-red-500' },
  qc: { label: 'QC', shortLabel: 'QC', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30', dotColor: 'bg-emerald-500' },
  ready: { label: 'พร้อมส่งมอบ', shortLabel: 'พร้อมส่งมอบ', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/30', dotColor: 'bg-green-500' },
  closed: { label: 'ปิด JOB', shortLabel: 'ปิด JOB', color: 'text-zinc-400', bgColor: 'bg-zinc-500/10 border-zinc-500/30', dotColor: 'bg-zinc-500' },
};

export const WORKFLOW_STEPS: JobStatus[] = ['received', 'inspecting', 'pending', 'parts', 'repairing', 'qc', 'ready', 'closed'];

export const STATUS_PROGRESS: Record<JobStatus, number> = {
  received: 10, inspecting: 25, pending: 40, parts: 55, repairing: 70, qc: 88, ready: 100, closed: 100,
};

export const REQUISITION_STATUSES: Record<RequisitionStatus, RequisitionStatusInfo> = {
  DRAFT: { label: 'ฉบับร่าง', color: 'text-zinc-400', bgColor: 'bg-zinc-500/15 border-zinc-500/30', dotColor: 'bg-zinc-500' },
  PENDING_APPROVAL: { label: 'รออนุมัติ', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30', dotColor: 'bg-amber-500' },
  APPROVED: { label: 'อนุมัติแล้ว', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30', dotColor: 'bg-blue-500' },
  WAITING_ISSUE: { label: 'รอจ่าย', color: 'text-cyan-400', bgColor: 'bg-cyan-500/15 border-cyan-500/30', dotColor: 'bg-cyan-500' },
  ISSUED: { label: 'จ่ายแล้ว', color: 'text-green-400', bgColor: 'bg-green-500/15 border-green-500/30', dotColor: 'bg-green-500' },
  RECEIVED: { label: 'รับแล้ว', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30', dotColor: 'bg-emerald-500' },
  REJECTED: { label: 'ปฏิเสธ', color: 'text-red-400', bgColor: 'bg-red-500/15 border-red-500/30', dotColor: 'bg-red-500' },
  OUT_OF_STOCK: { label: 'ไม่มีของ', color: 'text-orange-400', bgColor: 'bg-orange-500/15 border-orange-500/30', dotColor: 'bg-orange-500' },
  CANCELLED: { label: 'ยกเลิก', color: 'text-zinc-500', bgColor: 'bg-zinc-600/15 border-zinc-600/30', dotColor: 'bg-zinc-600' },
};

export const STAFF_ROLES: Record<StaffRole, string> = {
  admin: 'Admin',
  service_advisor: 'Service Advisor',
  workshop_supervisor: 'Workshop Supervisor',
  technician: 'Technician',
};

export const STAFF_STATUSES: Record<StaffStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: 'ใช้งาน', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/30' },
  suspended: { label: 'พักงาน', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30' },
  inactive: { label: 'ปิดการใช้งาน', color: 'text-zinc-400', bgColor: 'bg-zinc-500/10 border-zinc-500/30' },
};

export const TECHNICIAN_SPECIALTIES = [
  'Diagnostic', 'Engine', 'Transmission', 'Suspension', 'Brake',
  'Electrical', 'Air Conditioning', 'Hybrid / EV', 'General Repair',
];

export const QUICK_ITEMS = [
  'Service A', 'Service B', 'เครื่องยนต์', 'เกียร์', 'ช่วงล่าง', 'เบรก',
  'แอร์', 'ระบบไฟฟ้า', 'ไฟเตือน', 'เสียงผิดปกติ', 'อื่นๆ',
];

export const PHOTO_SLOTS = [
  { key: 'front', label: 'หน้ารถ' }, { key: 'rear', label: 'หลังรถ' },
  { key: 'left', label: 'ด้านซ้าย' }, { key: 'right', label: 'ด้านขวา' },
  { key: 'interior', label: 'ภายในรถ' }, { key: 'dashboard', label: 'หน้าปัด / เลขไมล์' },
  { key: 'engine', label: 'ห้องเครื่อง' }, { key: 'damage', label: 'เพิ่มรูปตำหนิ' },
];

export const FUEL_LEVELS = ['E', '1/4', '1/2', '3/4', 'F'];

export const PROVINCES = [
  'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'นครปฐม',
  'ชลบุรี', 'ระยอง', 'เชียงใหม่', 'เชียงราย', 'ภูเก็ต',
  'ขอนแก่น', 'นครราชสีมา', 'สุราษฎร์ธานี', 'สงขลา', 'อื่นๆ',
];

export const MERCEDES_MODELS = [
  'A-Class (W177)', 'C-Class (W206)', 'E-Class (W214)', 'S-Class (W223)',
  'GLA (H247)', 'GLB (X247)', 'GLC (X254)', 'GLE (V167)', 'GLS (X167)',
  'CLA (C118)', 'CLS (C257)', 'EQS (V295)', 'EQE (V294)',
  'AMG GT (R190)', 'AMG C 43', 'AMG E 53', 'AMG G 63', 'V-Class (W447)', 'อื่นๆ',
];

export const EMPTY_ADDRESS = {
  addressLine: '', moo: '', soi: '', road: '',
  subDistrict: '', district: '', province: '', postalCode: '',
};

export const DEFAULT_WORKSHOP_INFO = {
  name: 'MMB WORKSHOP', nameEn: 'MMB WORKSHOP SERVICE MANAGEMENT',
  address: '', subDistrict: '', district: '', province: '', postalCode: '',
  phone: '', line: '', email: '', website: '', taxId: '', branchNumber: '', logo: '',
};

export const DEFAULT_JOB_NUMBER_CONFIG = {
  prefix: 'MMB', includeYY: true, includeMM: true, runningDigits: 4,
  resetRule: 'monthly' as const, lastNumber: 0, lastResetMonth: '', lastResetYear: '',
};

export const DEFAULT_JOB_STATUSES = [
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

export const DEFAULT_REPAIR_CATEGORIES = [
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

export const DEFAULT_NOTIFICATIONS = {
  newJob: true, customerApproval: true, partsArrived: true, repairComplete: true,
  waitingQc: true, qcPassed: true, readyDelivery: true,
};

export const PHOTO_CATEGORIES = [
  { key: 'intake', label: 'รับรถ' }, { key: 'inspection', label: 'ตรวจเช็ก' },
  { key: 'before', label: 'ก่อนซ่อม' }, { key: 'during', label: 'ระหว่างซ่อม' },
  { key: 'parts', label: 'อะไหล่' }, { key: 'after', label: 'หลังซ่อม' },
  { key: 'qc', label: 'QC' }, { key: 'delivery', label: 'ส่งมอบ' },
];

export const QC_CHECKLIST = [
  { key: 'repair_complete', label: 'งานซ่อมครบ' },
  { key: 'no_fault_code', label: 'ไม่มี Fault Code ที่เกี่ยวข้อง' },
  { key: 'fluid_checked', label: 'Fluid levels checked' },
  { key: 'no_warning_lights', label: 'No warning lights' },
  { key: 'road_test', label: 'Road test completed' },
  { key: 'no_abnormal_noise', label: 'No abnormal noise' },
  { key: 'no_leaks', label: 'No leaks' },
  { key: 'vehicle_cleaned', label: 'Vehicle cleaned' },
  { key: 'tools_removed', label: 'Tools/items removed from vehicle' },
];

// Note: INSPECTION_SYSTEMS is exported from lib/jobs.ts for backward compat
// (it needs ChecklistItem type with full fields)

// --- Requisition transitions ---

export type TransitionRole = 'technician' | 'workshop_supervisor' | 'admin' | 'store';

const TRANSITIONS: Record<RequisitionStatus, Partial<Record<TransitionRole, RequisitionStatus[]>>> = {
  DRAFT: { technician: ['PENDING_APPROVAL', 'CANCELLED'], admin: ['PENDING_APPROVAL', 'CANCELLED'] },
  PENDING_APPROVAL: { workshop_supervisor: ['APPROVED', 'REJECTED'], admin: ['APPROVED', 'REJECTED'] },
  APPROVED: { workshop_supervisor: ['WAITING_ISSUE'], admin: ['WAITING_ISSUE'] },
  WAITING_ISSUE: { admin: ['ISSUED', 'OUT_OF_STOCK'] },
  ISSUED: { technician: ['RECEIVED'], admin: ['RECEIVED'] },
  RECEIVED: {},
  REJECTED: { technician: ['DRAFT'], admin: ['DRAFT'] },
  OUT_OF_STOCK: { admin: ['WAITING_ISSUE', 'CANCELLED'] },
  CANCELLED: {},
};

export function getAllowedTransitions(status: RequisitionStatus, role: string): RequisitionStatus[] {
  const roleKey = role as TransitionRole;
  return TRANSITIONS[status]?.[roleKey] ?? [];
}

// --- Permission definitions ---

export type PermissionArea =
  | 'dashboard' | 'jobs' | 'job_detail' | 'new_job' | 'customers' | 'vehicles'
  | 'inspection' | 'quotation' | 'repair' | 'parts' | 'parts_requisition' | 'qc' | 'delivery'
  | 'staff' | 'service_advisor_page' | 'foreman_page' | 'technicians_page'
  | 'workshop_info' | 'job_numbering' | 'job_statuses' | 'repair_categories' | 'notifications'
  | 'doc_intake' | 'doc_quotation' | 'doc_repair_order' | 'doc_qc' | 'doc_delivery'
  | 'database' | 'synology' | 'backup' | 'activity_log' | 'export_data' | 'about';

export const ROLE_PERMISSIONS: Record<StaffRole, Set<PermissionArea>> = {
  admin: new Set<PermissionArea>([
    'dashboard', 'jobs', 'job_detail', 'new_job', 'customers', 'vehicles',
    'inspection', 'quotation', 'repair', 'parts', 'parts_requisition', 'qc', 'delivery',
    'staff', 'service_advisor_page', 'foreman_page', 'technicians_page',
    'workshop_info', 'job_numbering', 'job_statuses', 'repair_categories', 'notifications',
    'doc_intake', 'doc_quotation', 'doc_repair_order', 'doc_qc', 'doc_delivery',
    'database', 'synology', 'backup', 'activity_log', 'export_data', 'about',
  ]),
  service_advisor: new Set<PermissionArea>([
    'dashboard', 'jobs', 'job_detail', 'new_job', 'customers', 'vehicles',
    'doc_intake', 'doc_quotation', 'doc_delivery', 'quotation', 'delivery', 'about',
  ]),
  workshop_supervisor: new Set<PermissionArea>([
    'dashboard', 'jobs', 'job_detail', 'inspection', 'repair', 'parts', 'parts_requisition', 'qc',
    'technicians_page', 'doc_repair_order', 'doc_qc', 'about',
  ]),
  technician: new Set<PermissionArea>([
    'dashboard', 'jobs', 'job_detail', 'repair', 'parts', 'parts_requisition', 'about',
  ]),
};

export const SLUG_TO_PERMISSION: Record<string, PermissionArea> = {
  'staff': 'staff', 'service-advisor': 'service_advisor_page', 'foreman': 'foreman_page',
  'technicians': 'technicians_page', 'workshop-info': 'workshop_info',
  'job-numbering': 'job_numbering', 'job-statuses': 'job_statuses',
  'repair-categories': 'repair_categories', 'notifications': 'notifications',
  'doc-intake': 'doc_intake', 'doc-quotation': 'doc_quotation',
  'doc-repair-order': 'doc_repair_order', 'doc-qc': 'doc_qc', 'doc-delivery': 'doc_delivery',
  'database': 'database', 'synology': 'synology', 'backup': 'backup',
  'activity-log': 'activity_log', 'export-data': 'export_data', 'about': 'about',
};

// --- Helpers ---

export function formatAddress(a: import('./types').CustomerAddress | undefined): string {
  if (!a) return '';
  const parts = [a.addressLine, a.moo ? `หมู่ ${a.moo}` : '', a.soi ? `ซอย ${a.soi}` : '', a.road ? `ถนน ${a.road}` : '', a.subDistrict, a.district, a.province, a.postalCode].filter(Boolean);
  return parts.join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function generateJobNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear() + 543 - 2500).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 900) + 100);
  return `MMB-${yy}${mm}${dd}${random}`;
}
