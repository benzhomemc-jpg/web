// Re-export shim — parts requisition now lives in models/ and controllers/
export type {
  RequisitionStatus, RequisitionStatusInfo, RequisitionLineItem,
  StatusChange, PartsRequisition,
} from './models/types';

export {
  REQUISITION_STATUSES, getAllowedTransitions,
} from './models/constants';

export type { TransitionRole } from './models/constants';

// Storage functions — now stubs, data is in Supabase
export function getAllRequisitions(): import('./models/types').PartsRequisition[] { return []; }
export function getRequisitionById(_id: string): import('./models/types').PartsRequisition | undefined { return undefined; }
export function getRequisitionsForJob(_jobNumber: string): import('./models/types').PartsRequisition[] { return []; }
export function saveRequisition(_req: import('./models/types').PartsRequisition): void {}
export function updateRequisitionStatus(_id: string, _newStatus: import('./models/types').RequisitionStatus, _note?: string): import('./models/types').PartsRequisition | null { return null; }
export function createRequisition(_jobNumber: string, _vehicleModel: string, _licensePlate: string, _items: Omit<import('./models/types').RequisitionLineItem, 'id'>[]): import('./models/types').PartsRequisition {
  throw new Error('Use useCreateRequisition() hook instead');
}

export function generateRequisitionNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear() + 543 - 2500).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 900) + 100);
  return `PR-${yy}${mm}${dd}-${random}`;
}
