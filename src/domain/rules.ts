/** Business rules register — every rule has an ID, source, status. Unresolved rules are explicit. */

export type RuleStatus = 'Confirmed' | 'Proposed' | 'NeedsClientDecision';

export interface BusinessRule {
  id: string;
  title: string;
  description: string;
  source: string; // manual section / decision ref
  status: RuleStatus;
  owner?: string;
  question?: string; // populated when NeedsClientDecision
}

export const RULES: BusinessRule[] = [
  { id: 'WO-01', title: 'Release requires material readiness', description: 'ReadyForReview → Released only when materialReady is true.', source: 'Workflow catalogue (proposed)', status: 'Proposed' },
  { id: 'WO-02', title: 'Hold requires reason', description: 'Any transition into OnHold must carry a hold reason comment.', source: 'Exception-first UX policy (proposed)', status: 'Proposed' },
  { id: 'WO-03', title: 'Complete requires quality clearance', description: '→ Completed only when qualityClear is true.', source: 'Production execution integrity (proposed)', status: 'Proposed' },
  { id: 'INV-01', title: 'Idempotent posting', description: 'Re-submission with the same movement id returns the original outcome, never a duplicate.', source: 'DATA_INTEGRITY_STRATEGY (proposed)', status: 'Proposed' },
  { id: 'INV-02', title: 'No negative stock', description: 'Issue/transfer fails when available quantity at the source is insufficient.', source: 'Needs client confirmation: allow negative WIP?', status: 'NeedsClientDecision', owner: 'Business owner', question: 'Is negative stock ever permitted (e.g. WIP backflush)?' },
  { id: 'INV-03', title: 'Posted movements are immutable', description: 'Corrections go through reversal movements, never edits.', source: 'DATA_INTEGRITY_STRATEGY (proposed)', status: 'Proposed' },
  { id: 'COST-01', title: 'Deterministic calculation', description: 'Identical inputs + policy version always yield identical results (paise-integer math).', source: 'Phase 3 §9 (proposed)', status: 'Proposed' },
  { id: 'COST-02', title: 'Immutable approved runs', description: 'Approved/Finalized runs never mutate; recalculation creates a new run with lineage.', source: 'Phase 3 §9 (proposed)', status: 'Proposed' },
  { id: 'COST-03', title: 'Rounding rule', description: 'Half-up to paise per line; totals are sums of rounded lines.', source: 'Needs client confirmation', status: 'NeedsClientDecision', owner: 'Finance', question: 'Confirm rounding: half-up to paise per line vs per total?' },
  { id: 'APR-01', title: 'Maker-checker', description: 'Approver must differ from submitter (trusted check, not just UI).', source: 'ROLE_PERMISSION_MATRIX (confirmed pattern)', status: 'Confirmed' },
  { id: 'APR-02', title: 'Stale-version guard', description: 'Decision requires the current record version; stale requests must re-review.', source: 'Phase 3 §11 (proposed)', status: 'Proposed' },
  { id: 'PER-01', title: 'Locked period blocks postings', description: 'Movements/costing for a locked period fail with a redirect to correction workflow.', source: 'Needs client confirmation', status: 'NeedsClientDecision', owner: 'Finance', question: 'Who owns lock/reopen and is D+1..D+12 binding?' },
];

export function ruleById(id: string): BusinessRule | undefined {
  return RULES.find((r) => r.id === id);
}
