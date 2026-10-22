/** Pure domain services — no React, no Firebase; fully unit-testable. */
import { checkTransition, WO_MACHINE, COSTING_MACHINE, RECON_MACHINE, APPROVAL_MACHINE } from './machines';
import type {
  WorkOrder, WorkOrderStatus, CostingRun, CostingStatus, ReconItem, ReconStatus,
  ApprovalRequest, ApprovalStatus, Movement, AuditEvent, Role,
} from './types';
import { canApprove } from '../lib/permissions';

export interface ServiceResult<T> {
  ok: boolean;
  record?: T;
  errors: string[];
  events: AuditEvent[];
}

function audit(actorUid: string, action: string, entity: string, entityId: string, detail: string): AuditEvent {
  return { id: `${entity}-${entityId}-${Date.now()}`, at: new Date().toISOString(), actorUid, action, entity, entityId, detail };
}

function stamp<T extends { updatedBy: string; updatedAt: string; version: number }>(
  r: T, actorUid: string,
): T {
  return { ...r, updatedBy: actorUid, updatedAt: new Date().toISOString(), version: r.version + 1 };
}

/* ---------------- Work orders (rules WO-01/02/03) ---------------- */

export function transitionWorkOrder(
  wo: WorkOrder, to: WorkOrderStatus, roles: Role[], actorUid: string, comment?: string,
): ServiceResult<WorkOrder> {
  const errors: string[] = [];
  const gate = checkTransition(WO_MACHINE, wo.status, to, roles, comment);
  if (!gate.ok) return { ok: false, errors: [gate.reason!], events: [] };
  if (to === 'Released' && !wo.materialReady) errors.push('Rule WO-01: material readiness is missing — open Inventory → reservation first.');
  if (to === 'Completed' && !wo.qualityClear) errors.push('Rule WO-03: quality clearance is missing — complete Quality checkpoints first.');
  if (errors.length) return { ok: false, errors, events: [] };
  const next: WorkOrder = stamp({ ...wo, status: to, holdReason: to === 'OnHold' ? (comment ?? null) : wo.holdReason }, actorUid);
  return {
    ok: true, record: next, errors: [],
    events: [audit(actorUid, `WO ${wo.status} → ${to}`, 'workOrder', wo.id, comment ?? '')],
  };
}

/* ---------------- Inventory ledger (rules INV-01/02/03) ---------------- */

export interface LedgerState {
  balances: Record<string, number>; // key: plant|location|material → qty
  posted: Record<string, Movement>; // idempotencyKey → movement
}

export const balanceKey = (plantId: string, location: string | undefined, ref: string) =>
  `${plantId}|${location ?? 'DEFAULT'}|${ref}`;

export function applyMovement(
  state: LedgerState, m: Movement, lockedPeriods: string[], period: string,
): ServiceResult<Movement & { balances: Record<string, number> }> {
  // Idempotency first (INV-01): same key → original outcome, no duplicate.
  const prior = state.posted[m.id];
  if (prior) {
    return { ok: prior.status === 'Posted', record: { ...prior, balances: state.balances }, errors: prior.status === 'Posted' ? [] : ['Previously failed — submit a correction, not a retry with changes.'], events: [] };
  }
  const errors: string[] = [];
  if (lockedPeriods.includes(period)) errors.push('Rule PER-01: period is locked — posting blocked. Raise a correction request.');
  if (m.qty <= 0) errors.push('Quantity must be greater than zero.');
  if (!m.ref) errors.push('Source reference is required.');
  if (m.type === 'transfer' && (!m.locationFrom || !m.locationTo)) errors.push('Transfer needs source and destination locations.');
  if (errors.length) {
    return { ok: false, errors, events: [audit(m.updatedBy, 'movement rejected', 'movement', m.id, errors.join('; '))] };
  }
  // Debit source for issue/transfer (INV-02: no negative stock — pending client confirmation).
  if (m.type === 'issue' || m.type === 'transfer') {
    const key = balanceKey(m.plantId, m.locationFrom, m.ref);
    const avail = state.balances[key] ?? 0;
    if (avail < m.qty) {
      return { ok: false, errors: [`Insufficient stock at ${m.locationFrom ?? 'DEFAULT'}: available ${avail}, requested ${m.qty}.`], events: [audit(m.updatedBy, 'movement blocked: insufficient stock', 'movement', m.id, key)] };
    }
    state.balances[key] = avail - m.qty;
  }
  if (m.type === 'receipt' || m.type === 'transfer' || m.type === 'fg' || m.type === 'return') {
    const key = balanceKey(m.plantId, m.locationTo ?? m.locationFrom, m.ref);
    state.balances[key] = (state.balances[key] ?? 0) + m.qty;
  }
  const posted: Movement = { ...m, status: 'Posted' };
  state.posted[m.id] = posted;
  return {
    ok: true, record: { ...posted, balances: state.balances }, errors: [],
    events: [audit(m.updatedBy, `movement posted (${m.type})`, 'movement', m.id, `${m.qty} ${m.uom} ref ${m.ref}`)],
  };
}

/* ---------------- Costing (rules COST-01/02/03) ---------------- */

export interface CostLineInput {
  component: string;
  qty: number; // in minor units of measure ×1000
  ratePaise: number; // paise per unit
  sourceRef: string;
}

/** Deterministic paise-integer costing: line = round(qty × rate / 1000), total = Σ lines. */
export function calculateCost(
  lines: CostLineInput[], policyVersion: string,
): { lines: { component: string; amountPaise: number; sourceRef: string; policyVersion: string }[]; totalPaise: number } {
  const out = lines.map((l) => ({
    component: l.component,
    amountPaise: Math.round((l.qty * l.ratePaise) / 1000),
    sourceRef: l.sourceRef,
    policyVersion,
  }));
  return { lines: out, totalPaise: out.reduce((s, l) => s + l.amountPaise, 0) };
}

export function transitionCosting(
  run: CostingRun, to: CostingStatus, roles: Role[], actorUid: string, comment?: string,
): ServiceResult<CostingRun> {
  // COST-02: Finalized is terminal — any further mutation needs a new run with lineage.
  if (run.status === 'Finalized') {
    return { ok: false, errors: ['Rule COST-02: finalized runs are immutable — create a recalculation run with lineage.'], events: [] };
  }
  const gate = checkTransition(COSTING_MACHINE, run.status, to, roles, comment);
  if (!gate.ok) return { ok: false, errors: [gate.reason!], events: [] };
  const next = stamp({ ...run, status: to }, actorUid);
  return { ok: true, record: next, errors: [], events: [audit(actorUid, `costing ${run.status} → ${to}`, 'costingRun', run.id, comment ?? '')] };
}

/* ---------------- Reconciliation ---------------- */

export function transitionRecon(
  item: ReconItem, to: ReconStatus, roles: Role[], actorUid: string, comment?: string,
): ServiceResult<ReconItem> {
  const gate = checkTransition(RECON_MACHINE, item.status, to, roles, comment);
  if (!gate.ok) return { ok: false, errors: [gate.reason!], events: [] };
  const next = stamp({ ...item, status: to }, actorUid);
  return { ok: true, record: next, errors: [], events: [audit(actorUid, `recon ${item.status} → ${to}`, 'reconItem', item.id, comment ?? '')] };
}

/* ---------------- Approvals (rules APR-01/02) ---------------- */

export function decideApproval(
  req: ApprovalRequest, decision: ApprovalStatus, roles: Role[], approverUid: string,
  currentRecordVersion: number, comment?: string,
): ServiceResult<ApprovalRequest> {
  if (!canApprove(roles, req.submitterUid, approverUid)) {
    const why = req.submitterUid === approverUid
      ? 'Rule APR-01: maker-checker — the submitter cannot approve their own request.'
      : 'Approver role lacks approval rights.';
    return { ok: false, errors: [why], events: [] };
  }
  if (currentRecordVersion !== req.recordVersion) {
    return { ok: false, errors: ['Rule APR-02: record changed since submission — request re-review before deciding.'], events: [] };
  }
  const gate = checkTransition(APPROVAL_MACHINE, req.status, decision, roles, comment);
  if (!gate.ok) return { ok: false, errors: [gate.reason!], events: [] };
  const next = stamp({ ...req, status: decision, reason: comment ?? req.reason }, approverUid);
  return { ok: true, record: next, errors: [], events: [audit(approverUid, `approval ${decision}`, 'approval', req.id, comment ?? '')] };
}
