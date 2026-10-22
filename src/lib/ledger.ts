/** Immutable ledger helpers — client builds intent; Functions commit transactionally. */

export type TxnType =
  | 'receipt'
  | 'issue'
  | 'return'
  | 'transfer'
  | 'adjust'
  | 'wip'
  | 'fg';

export interface LedgerIntent {
  idempotencyKey: string;
  type: TxnType;
  plantId: string;
  heatId?: string;
  batchId?: string;
  qty: number;
  kg: number;
  locationFrom?: string;
  locationTo?: string;
  ref: string; // WO / traveller / GRN / order
  reason?: string;
  reversalOf?: string;
}

export function buildIdempotencyKey(parts: (string | number)[]): string {
  return parts.join('|').slice(0, 200);
}

export function validateLedgerIntent(t: LedgerIntent): string[] {
  const errs: string[] = [];
  if (!t.idempotencyKey) errs.push('idempotencyKey required');
  if (!t.plantId) errs.push('plantId required');
  if (!t.ref) errs.push('ref required');
  if (t.qty < 0 || t.kg < 0) errs.push('qty/kg must be >= 0');
  if (t.type === 'transfer' && (!t.locationFrom || !t.locationTo)) errs.push('transfer needs from/to');
  if (t.type === 'adjust' && !t.reason) errs.push('adjust needs reason (goes to approval)');
  return errs;
}

/** Client must never mutate a posted txn — create a reversal intent instead. */
export function reversalIntent(original: LedgerIntent, reason: string): LedgerIntent {
  return {
    ...original,
    idempotencyKey: buildIdempotencyKey(['reversal', original.idempotencyKey, Date.now()]),
    reason,
    reversalOf: original.idempotencyKey,
  };
}
