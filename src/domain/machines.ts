/** Explicit state machines — trusted logic blocks invalid transitions, UI never decides alone. */
import type { WorkOrderStatus, CostingStatus, ReconStatus, ApprovalStatus } from './types';
import type { Role } from '../lib/permissions';

export interface TransitionDef<S extends string> {
  from: S;
  to: S;
  roles: Role[]; // at least one required
  requiresComment?: boolean;
}

function buildIndex<S extends string>(defs: TransitionDef<S>[]): Map<S, TransitionDef<S>[]> {
  const m = new Map<S, TransitionDef<S>[]>();
  for (const d of defs) {
    const l = m.get(d.from) ?? [];
    l.push(d);
    m.set(d.from, l);
  }
  return m;
}

export interface TransitionCheck {
  ok: boolean;
  reason?: string;
}

/** Generic guard: legal edge? role allowed? comment present when required? */
export function checkTransition<S extends string>(
  defs: TransitionDef<S>[], from: S, to: S, roles: Role[], comment?: string,
): TransitionCheck {
  const edges = buildIndex(defs).get(from) ?? [];
  const edge = edges.find((e) => e.to === to);
  if (!edge) return { ok: false, reason: `Transition ${from} → ${to} is not allowed.` };
  if (!roles.some((r) => edge.roles.includes(r))) {
    return { ok: false, reason: `Role not permitted for ${from} → ${to}. Required: ${edge.roles.join(', ')}.` };
  }
  if (edge.requiresComment && !comment?.trim()) {
    return { ok: false, reason: `A comment/reason is required for ${from} → ${to}.` };
  }
  return { ok: true };
}

const OPS: Role[] = ['platformAdmin', 'clientAdmin', 'management', 'productionMgr', 'supervisor'];
const FIN: Role[] = ['platformAdmin', 'clientAdmin', 'management', 'costing', 'finance'];

export const WO_MACHINE: TransitionDef<WorkOrderStatus>[] = [
  { from: 'Draft', to: 'ReadyForReview', roles: OPS },
  { from: 'ReadyForReview', to: 'Released', roles: OPS },
  { from: 'ReadyForReview', to: 'Draft', roles: OPS, requiresComment: true },
  { from: 'Released', to: 'InProgress', roles: [...OPS, 'operator'] },
  { from: 'InProgress', to: 'OnHold', roles: [...OPS, 'operator'], requiresComment: true },
  { from: 'OnHold', to: 'InProgress', roles: OPS },
  { from: 'InProgress', to: 'Completed', roles: [...OPS, 'operator'] },
  { from: 'OnHold', to: 'Completed', roles: OPS },
  { from: 'Completed', to: 'Closed', roles: OPS },
];

export const COSTING_MACHINE: TransitionDef<CostingStatus>[] = [
  { from: 'Draft', to: 'Validating', roles: FIN },
  { from: 'Validating', to: 'ReadyForCalculation', roles: FIN },
  { from: 'Validating', to: 'Draft', roles: FIN, requiresComment: true },
  { from: 'ReadyForCalculation', to: 'Calculated', roles: FIN },
  { from: 'Calculated', to: 'UnderReview', roles: FIN },
  { from: 'UnderReview', to: 'Approved', roles: ['platformAdmin', 'clientAdmin', 'management', 'finance'] },
  { from: 'UnderReview', to: 'Rejected', roles: ['platformAdmin', 'clientAdmin', 'management', 'finance'], requiresComment: true },
  { from: 'Approved', to: 'Finalized', roles: ['platformAdmin', 'clientAdmin', 'finance'] },
];

export const RECON_MACHINE: TransitionDef<ReconStatus>[] = [
  { from: 'Open', to: 'Investigating', roles: FIN },
  { from: 'Investigating', to: 'CorrectionRequested', roles: FIN, requiresComment: true },
  { from: 'CorrectionRequested', to: 'AwaitingApproval', roles: FIN },
  { from: 'AwaitingApproval', to: 'Resolved', roles: ['platformAdmin', 'clientAdmin', 'management', 'finance'] },
  { from: 'Investigating', to: 'Resolved', roles: FIN, requiresComment: true },
  { from: 'Resolved', to: 'Reconciled', roles: ['platformAdmin', 'clientAdmin', 'finance'] },
];

export const APPROVAL_MACHINE: TransitionDef<ApprovalStatus>[] = [
  { from: 'Pending', to: 'Approved', roles: ['platformAdmin', 'clientAdmin', 'management', 'finance'] },
  { from: 'Pending', to: 'Rejected', roles: ['platformAdmin', 'clientAdmin', 'management', 'finance'], requiresComment: true },
  { from: 'Pending', to: 'ChangesRequested', roles: ['platformAdmin', 'clientAdmin', 'management', 'finance'], requiresComment: true },
  { from: 'Pending', to: 'Withdrawn', roles: ['platformAdmin', 'clientAdmin', 'management', 'costing', 'finance', 'productionMgr', 'supervisor', 'stores'] },
  { from: 'Pending', to: 'Escalated', roles: ['platformAdmin', 'clientAdmin', 'management'], requiresComment: true },
];
