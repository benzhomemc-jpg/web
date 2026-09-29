// Re-export shim — all types and constants now in models/
// Sample data arrays are empty — data lives in Supabase

export type {
  JobStatus, JobStatusInfo, MediaItem, CustomerAddress, BranchType,
  AssignedTechnician, Job,
} from './models/types';

export {
  JOB_STATUSES, WORKFLOW_STEPS, STATUS_PROGRESS, QUICK_ITEMS, PHOTO_SLOTS,
  FUEL_LEVELS, PROVINCES, MERCEDES_MODELS, EMPTY_ADDRESS, formatAddress,
  formatCurrency, generateJobNumber,
} from './models/constants';

// Inspection/quotation/repair types (kept here for backward compat, not in models yet)
export type InspectionResult = 'normal' | 'recommend' | 'repair' | 'urgent';
export interface InspectionItem { id: string; category: string; result: InspectionResult; note: string; dtc: string; photos: string[]; }
export interface ChecklistItem { key: string; label: string; checked: boolean; result: InspectionResult; note: string; photos: string[]; }
export interface ChecklistSystem { id: string; label: string; items: ChecklistItem[]; }
export interface DtcCode { id: string; code: string; status: 'current' | 'pending' | 'history'; detail: string; photo: string | null; }
export interface DiagnosticReport { xentryScan: boolean; dtcCodes: DtcCode[]; reportPhoto: string | null; reportAttached: boolean; }
export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'partial' | 'rejected';
export interface QuotationItem { id: string; type: 'part' | 'labor'; name: string; partNumber: string; quantity: number; partsPrice: number; laborPrice: number; discount: number; }
export type RepairStatus = 'pending' | 'in_progress' | 'done';
export interface RepairTask { id: string; description: string; technician: string; startTime: string; finishTime: string; status: RepairStatus; notes: string; beforePhotos: string[]; afterPhotos: string[]; }
export type PartAvailability = 'ordered' | 'received' | 'picked';
export interface PartItem { id: string; partNumber: string; name: string; quantity: number; price: number; availability: PartAvailability; }
export interface GalleryPhoto { id: string; category: string; src: string; timestamp: string; }
export interface TimelineEvent { id: string; time: string; label: string; detail?: string; }

export const INSPECTION_RESULTS: Record<InspectionResult, { label: string; color: string; bgColor: string }> = {
  normal: { label: 'ปกติ', color: 'text-green-400', bgColor: 'bg-green-500/15 border-green-500/30' },
  recommend: { label: 'แนะนำ', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30' },
  repair: { label: 'ต้องซ่อม', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30' },
  urgent: { label: 'เร่งด่วน', color: 'text-red-400', bgColor: 'bg-red-500/15 border-red-500/30' },
};

export const INSPECTION_CATEGORIES = ['Engine', 'Transmission', 'Suspension', 'Brake', 'Air Conditioning', 'Electrical', 'Battery', 'Tires', 'Fluids', 'Diagnostic / DTC'];

export const QUOTATION_STATUSES: Record<QuotationStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'รอเสนอราคา', color: 'text-zinc-400', bgColor: 'bg-zinc-500/15 border-zinc-500/30' },
  sent: { label: 'ส่งให้ลูกค้าแล้ว', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30' },
  approved: { label: 'อนุมัติ', color: 'text-green-400', bgColor: 'bg-green-500/15 border-green-500/30' },
  partial: { label: 'อนุมัติบางรายการ', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30' },
  rejected: { label: 'ไม่อนุมัติ', color: 'text-red-400', bgColor: 'bg-red-500/15 border-red-500/30' },
};

export const REPAIR_STATUS_INFO: Record<RepairStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'รอเริ่ม', color: 'text-zinc-400', bgColor: 'bg-zinc-500/15 border-zinc-500/30' },
  in_progress: { label: 'กำลังซ่อม', color: 'text-red-400', bgColor: 'bg-red-500/15 border-red-500/30' },
  done: { label: 'เสร็จแล้ว', color: 'text-green-400', bgColor: 'bg-green-500/15 border-green-500/30' },
};

export const PART_AVAILABILITY: Record<PartAvailability, { label: string; color: string; bgColor: string }> = {
  ordered: { label: 'รอสั่ง', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30' },
  received: { label: 'ได้รับแล้ว', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30' },
  picked: { label: 'เบิกแล้ว', color: 'text-green-400', bgColor: 'bg-green-500/15 border-green-500/30' },
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

function ci(key: string, label: string): ChecklistItem {
  return { key, label, checked: false, result: 'normal', note: '', photos: [] };
}

export const INSPECTION_SYSTEMS: ChecklistSystem[] = [
  { id: 'engine', label: 'ระบบเครื่องยนต์', items: [
    ci('engine_oil', 'ตรวจน้ำมันเครื่อง'), ci('coolant', 'ตรวจ Coolant'),
    ci('leak', 'ตรวจรอยรั่ว'), ci('engine_mount', 'Engine Mount'),
  ]},
  { id: 'transmission', label: 'ระบบเกียร์', items: [
    ci('trans_oil', 'Transmission Oil'), ci('trans_leak', 'Oil Leak'),
    ci('shift_quality', 'Shift Quality'),
  ]},
  { id: 'suspension', label: 'ช่วงล่าง', items: [
    ci('lower_arm', 'Lower Arm'), ci('control_arm', 'Control Arm'),
    ci('shock_absorber', 'Shock Absorber'), ci('ball_joint', 'Ball Joint'),
  ]},
  { id: 'brake', label: 'เบรก', items: [
    ci('front_pad', 'Front Pad'), ci('rear_pad', 'Rear Pad'),
    ci('disc', 'Disc'), ci('brake_fluid', 'Brake Fluid'),
  ]},
  { id: 'ac', label: 'ระบบแอร์', items: [
    ci('ac_cooling', 'ความเย็นแอร์'), ci('ac_refrigerant', 'น้ำยาแอร์'),
    ci('ac_filter', 'ไส้กรองแอร์'),
  ]},
  { id: 'electrical', label: 'ระบบไฟฟ้า', items: [
    ci('battery', 'แบตเตอรี่'), ci('alternator', 'หม้อแปลงไฟ'),
    ci('starter', 'มอเตอร์สตาร์ท'), ci('lights', 'ไฟหน้า/ไฟท้าย'),
  ]},
  { id: 'tires', label: 'ยางรถ', items: [
    ci('tire_wear', 'ความสึกหรือ'), ci('tire_pressure', 'แรงดันลม'),
    ci('spare_tire', 'ยางอะไหล่'),
  ]},
  { id: 'fluids', label: 'ของเหลว', items: [
    ci('engine_oil_level', 'น้ำมันเครื่อง'), ci('brake_fluid_level', 'น้ำมันเบรก'),
    ci('coolant_level', 'น้ำหล่อเย็น'), ci('washer_fluid', 'น้ำมันกระจก'),
  ]},
];

// Sample data — empty, data is in Supabase
export const sampleJobs: Job[] = [];
export const sampleInspections: InspectionItem[] = [];
export const sampleDtcCodes: DtcCode[] = [];
export const sampleDiagnostic: DiagnosticReport = { xentryScan: false, dtcCodes: [], reportPhoto: null, reportAttached: false };
export const sampleQuotationItems: QuotationItem[] = [];
export const sampleRepairTasks: RepairTask[] = [];
export const sampleParts: PartItem[] = [];
export const sampleTimeline: TimelineEvent[] = [];

// Storage functions — no-ops, data is in Supabase
export function getStoredJobs(): Job[] { return []; }
export function saveJob(_job: Job): void {}
export function getStoredJob(_jobNumber: string): Job | undefined { return undefined; }

import type { Job } from './models/types';
