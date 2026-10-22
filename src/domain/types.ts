/** Phase 3 typed domain entities. Source of truth: Firestore (production) / demo store (review build). */
import type { Role } from '../lib/permissions';

export interface AuditMeta {
  createdBy: string;
  createdAt: string; // ISO
  updatedBy: string;
  updatedAt: string;
  version: number;
}

export type WorkOrderStatus =
  | 'Draft' | 'ReadyForReview' | 'Released' | 'InProgress' | 'OnHold' | 'Completed' | 'Closed';

export interface WorkOrder extends AuditMeta {
  id: string;
  plantId: string;
  productId: string;
  grade: string;
  plannedQty: number;
  uom: string;
  status: WorkOrderStatus;
  materialReady: boolean;
  qualityClear: boolean;
  holdReason?: string | null;
}

export type CostingStatus =
  | 'Draft' | 'Validating' | 'ReadyForCalculation' | 'Calculated'
  | 'UnderReview' | 'Approved' | 'Rejected' | 'Finalized';

export interface CostingRun extends AuditMeta {
  id: string;
  plantId: string;
  period: string;
  policyVersion: string;
  status: CostingStatus;
  inputRef: string; // snapshot reference
}

export type ReconStatus =
  | 'Open' | 'Investigating' | 'CorrectionRequested' | 'AwaitingApproval' | 'Resolved' | 'Reconciled';

export interface ReconItem extends AuditMeta {
  id: string;
  plantId: string;
  period: string;
  status: ReconStatus;
}

export type ApprovalStatus =
  | 'Pending' | 'Approved' | 'Rejected' | 'ChangesRequested' | 'Withdrawn' | 'Escalated';

export interface ApprovalRequest extends AuditMeta {
  id: string;
  plantId: string;
  kind: string;
  status: ApprovalStatus;
  submitterUid: string;
  recordVersion: number;
  reason?: string | null;
}

export type MovementStatus = 'Draft' | 'Pending' | 'Posted' | 'Failed' | 'Reversed';

export interface Movement extends AuditMeta {
  id: string; // stable idempotency key
  plantId: string;
  type: 'receipt' | 'issue' | 'return' | 'transfer' | 'adjust' | 'wip' | 'fg';
  qty: number;
  uom: string;
  locationFrom?: string;
  locationTo?: string;
  heatId?: string;
  ref: string;
  status: MovementStatus;
  reason?: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actorUid: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
}

export type { Role };
