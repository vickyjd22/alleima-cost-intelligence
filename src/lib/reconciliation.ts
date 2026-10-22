import { isPlaceholderInvoice } from './validation';

export interface SopicRow {
  invoiceNo: string;
  date: string;
  customerId: string;
  orderNo: string;
  productId: string;
  productAccount: string;
  qty: number;
  netWeight: number;
  value: number;
  profitCentre: string;
}

export interface RecResult {
  matched: SopicRow[];
  invoiceZeroExceptions: SopicRow[];
  pcExceptions: SopicRow[];
  totals: { rows: number; value: number; weight: number };
}

/**
 * SOPIC → ledger/GST bridge (pure function, tested).
 * - Blank/0 invoice numbers go to exception register, never silently matched.
 * - Unknown PC goes to pcExceptions for Finance review.
 */
export function reconcileSopic(rows: SopicRow[], knownPcs: string[]): RecResult {
  const matched: SopicRow[] = [];
  const invoiceZeroExceptions: SopicRow[] = [];
  const pcExceptions: SopicRow[] = [];
  let value = 0;
  let weight = 0;
  for (const r of rows) {
    if (isPlaceholderInvoice(r.invoiceNo)) {
      invoiceZeroExceptions.push(r);
      continue;
    }
    if (!knownPcs.includes(r.profitCentre)) {
      pcExceptions.push(r);
      continue;
    }
    matched.push(r);
    value += r.value;
    weight += r.netWeight;
  }
  return { matched, invoiceZeroExceptions, pcExceptions, totals: { rows: rows.length, value, weight } };
}

export function pcBridge(rows: SopicRow[]): Record<string, { value: number; weight: number; count: number }> {
  const out: Record<string, { value: number; weight: number; count: number }> = {};
  for (const r of rows) {
    const cur = out[r.profitCentre] ?? { value: 0, weight: 0, count: 0 };
    cur.value += r.value;
    cur.weight += r.netWeight;
    cur.count += 1;
    out[r.profitCentre] = cur;
  }
  return out;
}
