// === Core domain types for MMB Workshop ===

export type JobStatus =
  | 'received'
  | 'inspecting'
  | 'pending'
  | 'parts'
  | 'repairing'
  | 'qc'
  | 'ready'
  | 'closed';

export interface JobStatusInfo {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  dotColor: string;
}

export interface MediaItem {
  id: string;
  jobId: string;
  category: string;
  mediaType: 'photo' | 'video';
  fileName: string;
  createdAt: string;
  createdBy: string;
  localUrl: string;
}

export interface CustomerAddress {
  addressLine: string;
  moo: string;
  soi: string;
  road: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

export type BranchType = 'headquarters' | 'branch';

export interface AssignedTechnician {
  name: string;
  role: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  vehicleModel: string;
  licensePlate: string;
  customer: string;
  mileage: string;
  technician: string;
  status: JobStatus;
  receivedTime: string;
  phone?: string;
  lineContact?: string;
  customerType?: 'person' | 'company';
  companyName?: string;
  address?: CustomerAddress;
  taxId?: string;
  branch?: BranchType;
  province?: string;
  vin?: string;
  modelYear?: string;
  engineNumber?: string;
  color?: string;
  complaint?: string;
  quickItems?: string[];
  fuelLevel?: string;
  valuables?: string;
  conditionNote?: string;
  serviceAdvisor?: string;
  workshopSupervisor?: string;
  assignedTechnicians?: AssignedTechnician[];
  receivedDateTime?: string;
  photos?: Record<string, string>;
  media?: MediaItem[];
  customerSignature?: string;
}

// --- Customer ---

export interface Customer {
  id: string;
  name: string;
  phone: string;
  lineId: string;
  customerType: 'person' | 'company';
  companyName: string;
  address: CustomerAddress;
  taxId: string;
  branch: BranchType | '';
  createdAt: string;
}

// --- Vehicle ---

export interface Vehicle {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  licensePlate: string;
  province: string;
  vin: string;
  chassisCode: string;
  year: string;
  engineNumber: string;
  color: string;
  mileage: string;
  createdAt: string;
}

// --- Staff ---

export type StaffRole = 'admin' | 'service_advisor' | 'workshop_supervisor' | 'technician';
export type StaffStatus = 'active' | 'suspended' | 'inactive';

export interface Staff {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  startDate: string;
  specialties?: string[];
  username?: string;
  pin?: string;
  createdAt: string;
}

// --- Activity Log ---

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
}

// --- Parts Requisition ---

export type RequisitionStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'WAITING_ISSUE'
  | 'ISSUED'
  | 'RECEIVED'
  | 'REJECTED'
  | 'OUT_OF_STOCK'
  | 'CANCELLED';

export interface RequisitionStatusInfo {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
}

export interface RequisitionLineItem {
  id: string;
  partNumber: string;
  partName: string;
  partPhoto: string;
  quantity: number;
  unit: string;
  note: string;
}

export interface StatusChange {
  from: RequisitionStatus;
  to: RequisitionStatus;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  note: string;
}

export interface PartsRequisition {
  id: string;
  requisitionNumber: string;
  jobNumber: string;
  vehicleModel: string;
  licensePlate: string;
  requestedBy: string;
  requestedByName: string;
  status: RequisitionStatus;
  items: RequisitionLineItem[];
  statusHistory: StatusChange[];
  createdAt: string;
  updatedAt: string;
}

// --- Workshop Info ---

export interface WorkshopInfo {
  name: string;
  nameEn: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phone: string;
  line: string;
  email: string;
  website: string;
  taxId: string;
  branchNumber: string;
  logo: string;
}

// --- Job Number Config ---

export interface JobNumberConfig {
  prefix: string;
  includeYY: boolean;
  includeMM: boolean;
  runningDigits: number;
  resetRule: 'none' | 'monthly' | 'yearly';
  lastNumber: number;
  lastResetMonth: string;
  lastResetYear: string;
}

// --- Job Status Config ---

export interface JobStatusConfig {
  id: string;
  internalId: string;
  label: string;
  enabled: boolean;
  order: number;
}

// --- Repair Category ---

export interface RepairCategory {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

// --- Notification Config ---

export interface NotificationConfig {
  newJob: boolean;
  customerApproval: boolean;
  partsArrived: boolean;
  repairComplete: boolean;
  waitingQc: boolean;
  qcPassed: boolean;
  readyDelivery: boolean;
}

// --- User Session ---

export interface UserSession {
  id: string;
  staffId: string;
  name: string;
  nickname: string;
  username: string;
  role: StaffRole;
  loginAt: string;
}
