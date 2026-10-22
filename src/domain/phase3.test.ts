/** Phase 3 domain tests — state machines, guards, idempotency, determinism, maker-checker. */
import { describe, it, expect } from 'vitest';
import { transitionWorkOrder, applyMovement, calculateCost, transitionCosting, transitionRecon, decideApproval, balanceKey, type LedgerState } from './services';
import type { WorkOrder, Movement, ApprovalRequest, CostingRun, ReconItem } from './types';

const wo = (over: Partial<WorkOrder> = {}): WorkOrder => ({
  id: 'WO-1', plantId: 'mehsana', productId: 'P-316L', grade: '316L', plannedQty: 1000, uom: 'kg',
  status: 'Draft', materialReady: false, qualityClear: false, holdReason: null,
  createdBy: 'u1', createdAt: '2026-10-01', updatedBy: 'u1', updatedAt: '2026-10-01', version: 1, ...over,
});

const mov = (over: Partial<Movement> = {}): Movement => ({
  id: 'MV-1', plantId: 'mehsana', type: 'issue', qty: 100, uom: 'kg',
  locationFrom: 'RM-STORE', ref: 'WO-1', status: 'Draft',
  createdBy: 'u1', createdAt: '2026-10-01', updatedBy: 'u1', updatedAt: '2026-10-01', version: 1, ...over,
});

describe('work-order machine', () => {
  it('Draft → ReadyForReview allowed for supervisor', () => {
    const r = transitionWorkOrder(wo(), 'ReadyForReview', ['supervisor'], 'u2');
    expect(r.ok).toBe(true);
    expect(r.record!.status).toBe('ReadyForReview');
    expect(r.events).toHaveLength(1);
  });
  it('Draft → Released rejected (illegal edge)', () => {
    const r = transitionWorkOrder(wo(), 'Released', ['productionMgr'], 'u2');
    expect(r.ok).toBe(false);
  });
  it('Release blocked without material readiness (WO-01)', () => {
    const r = transitionWorkOrder(wo({ status: 'ReadyForReview' }), 'Released', ['productionMgr'], 'u2');
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('WO-01');
  });
  it('Release succeeds when material ready', () => {
    const r = transitionWorkOrder(wo({ status: 'ReadyForReview', materialReady: true }), 'Released', ['productionMgr'], 'u2');
    expect(r.ok).toBe(true);
  });
  it('Hold requires reason (WO-02)', () => {
    const r = transitionWorkOrder(wo({ status: 'InProgress' }), 'OnHold', ['supervisor'], 'u2');
    expect(r.ok).toBe(false);
  });
  it('Hold with reason records holdReason', () => {
    const r = transitionWorkOrder(wo({ status: 'InProgress' }), 'OnHold', ['supervisor'], 'u2', 'tool breakage');
    expect(r.ok).toBe(true);
    expect(r.record!.holdReason).toBe('tool breakage');
  });
  it('Complete blocked without quality clearance (WO-03)', () => {
    const r = transitionWorkOrder(wo({ status: 'InProgress' }), 'Completed', ['operator'], 'u9');
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('WO-03');
  });
  it('operator cannot release (role guard)', () => {
    const r = transitionWorkOrder(wo({ status: 'ReadyForReview', materialReady: true }), 'Released', ['operator'], 'u9');
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('Role not permitted');
  });
  it('auditor cannot transition anything', () => {
    const r = transitionWorkOrder(wo(), 'ReadyForReview', ['auditor'], 'uA');
    expect(r.ok).toBe(false);
  });
});

describe('inventory ledger', () => {
  const stocked = (): LedgerState => ({
    balances: { [balanceKey('mehsana', 'RM-STORE', 'WO-1')]: 500 },
    posted: {},
  });
  it('issue posts and decrements balance', () => {
    const r = applyMovement(stocked(), mov(), [], '202610');
    expect(r.ok).toBe(true);
    expect(r.record!.balances[balanceKey('mehsana', 'RM-STORE', 'WO-1')]).toBe(400);
  });
  it('idempotent retry returns original, no double-debit (INV-01)', () => {
    const s = stocked();
    const m = mov();
    applyMovement(s, m, [], '202610');
    const r2 = applyMovement(s, { ...m }, [], '202610');
    expect(r2.ok).toBe(true);
    expect(r2.record!.balances[balanceKey('mehsana', 'RM-STORE', 'WO-1')]).toBe(400);
  });
  it('insufficient stock blocked (INV-02)', () => {
    const r = applyMovement(stocked(), mov({ qty: 9999 }), [], '202610');
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('Insufficient stock');
  });
  it('locked period blocks posting (PER-01)', () => {
    const r = applyMovement(stocked(), mov(), ['202609'], '202609');
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('locked');
  });
  it('transfer without locations rejected', () => {
    const r = applyMovement(stocked(), mov({ type: 'transfer', locationFrom: undefined, locationTo: undefined }), [], '202610');
    expect(r.ok).toBe(false);
  });
  it('zero quantity rejected', () => {
    const r = applyMovement(stocked(), mov({ qty: 0 }), [], '202610');
    expect(r.ok).toBe(false);
  });
});

describe('costing determinism', () => {
  const lines = [
    { component: 'material', qty: 1000, ratePaise: 25075, sourceRef: 'GRN-1' },
    { component: 'labour', qty: 2000, ratePaise: 3050, sourceRef: 'TS-9' },
  ];
  it('identical inputs give identical totals (COST-01)', () => {
    const a = calculateCost(lines, 'v3');
    const b = calculateCost(lines, 'v3');
    expect(a.totalPaise).toBe(b.totalPaise);
    expect(a.totalPaise).toBe(25075 + 6100);
  });
  it('half-up rounding boundary', () => {
    const r = calculateCost([{ component: 'x', qty: 1, ratePaise: 1500, sourceRef: 'S' }], 'v3');
    expect(r.lines[0]!.amountPaise).toBe(2); // 1.5 → 2
  });
  it('zero quantity yields zero', () => {
    const r = calculateCost([{ component: 'x', qty: 0, ratePaise: 9999, sourceRef: 'S' }], 'v3');
    expect(r.totalPaise).toBe(0);
  });
  it('finalized run is immutable (COST-02)', () => {
    const run: CostingRun = { id: 'C-1', plantId: 'mehsana', period: '202610', policyVersion: 'v3', status: 'Finalized', inputRef: 'snap-1', createdBy: 'u1', createdAt: 'x', updatedBy: 'u1', updatedAt: 'x', version: 3 };
    const r = transitionCosting(run, 'UnderReview', ['finance'], 'u2', 'fix');
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('COST-02');
  });
  it('Approved → Finalized is the legal terminal step', () => {
    const run: CostingRun = { id: 'C-1', plantId: 'mehsana', period: '202610', policyVersion: 'v3', status: 'Approved', inputRef: 'snap-1', createdBy: 'u1', createdAt: 'x', updatedBy: 'u1', updatedAt: 'x', version: 3 };
    expect(transitionCosting(run, 'Finalized', ['finance'], 'u2').ok).toBe(true);
  });
  it('Calculated → UnderReview allowed', () => {
    const run: CostingRun = { id: 'C-1', plantId: 'mehsana', period: '202610', policyVersion: 'v3', status: 'Calculated', inputRef: 'snap-1', createdBy: 'u1', createdAt: 'x', updatedBy: 'u1', updatedAt: 'x', version: 3 };
    expect(transitionCosting(run, 'UnderReview', ['costing'], 'u2').ok).toBe(true);
  });
});

describe('reconciliation + approvals', () => {
  const recon = (status: ReconItem['status'] = 'Open'): ReconItem => ({
    id: 'R-1', plantId: 'mehsana', period: '202610', status, createdBy: 'u1', createdAt: 'x', updatedBy: 'u1', updatedAt: 'x', version: 1,
  });
  it('Open → Resolved directly rejected', () => {
    expect(transitionRecon(recon(), 'Resolved', ['finance'], 'u2', 'ok').ok).toBe(false);
  });
  it('CorrectionRequested needs comment', () => {
    expect(transitionRecon(recon('Investigating'), 'CorrectionRequested', ['finance'], 'u2').ok).toBe(false);
  });
  const apr = (over: Partial<ApprovalRequest> = {}): ApprovalRequest => ({
    id: 'A-1', plantId: 'mehsana', kind: 'adjust', status: 'Pending', submitterUid: 'maker1', recordVersion: 4, createdBy: 'maker1', createdAt: 'x', updatedBy: 'maker1', updatedAt: 'x', version: 1, ...over,
  });
  it('maker cannot approve own request (APR-01)', () => {
    const r = decideApproval(apr(), 'Approved', ['finance'], 'maker1', 4, 'ok');
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('APR-01');
  });
  it('stale version blocked (APR-02)', () => {
    const r = decideApproval(apr(), 'Approved', ['finance'], 'checker2', 5, 'ok');
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('APR-02');
  });
  it('valid checker approval succeeds with audit', () => {
    const r = decideApproval(apr(), 'Approved', ['finance'], 'checker2', 4, 'verified');
    expect(r.ok).toBe(true);
    expect(r.record!.status).toBe('Approved');
    expect(r.events).toHaveLength(1);
  });
  it('reject without reason blocked, with reason ok', () => {
    expect(decideApproval(apr(), 'Rejected', ['finance'], 'checker2', 4).ok).toBe(false);
    expect(decideApproval(apr(), 'Rejected', ['finance'], 'checker2', 4, 'wrong qty').ok).toBe(true);
  });
});
