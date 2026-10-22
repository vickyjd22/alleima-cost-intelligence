/** Offline-safe queue for approved shop-floor flows (traveller ops, QC). Persist + retry; server confirms before success UI. */

export interface QueuedOp {
  key: string;
  kind: 'traveller' | 'qc' | 'ledger';
  payload: Record<string, unknown>;
  createdAt: number;
  tries: number;
}

const mem: QueuedOp[] = [];

export function enqueue(op: Omit<QueuedOp, 'createdAt' | 'tries'>): QueuedOp {
  const full: QueuedOp = { ...op, createdAt: Date.now(), tries: 0 };
  mem.push(full);
  try {
    localStorage.setItem('aci-queue', JSON.stringify(mem));
  } catch {
    /* native: AsyncStorage wiring in hardening sprint */
  }
  return full;
}

export function pendingOps(): QueuedOp[] {
  return [...mem];
}

export function dequeue(key: string): void {
  const i = mem.findIndex((o) => o.key === key);
  if (i >= 0) mem.splice(i, 1);
}
