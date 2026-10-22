import { describe, it, expect } from 'vitest';
import { machineHourRate, materialPriceVariance, materialUsageVariance, yieldPct } from './costing';
import { travellerEntrySchema, isPlaceholderInvoice } from './validation';
import { reconcileSopic } from './reconciliation';
import { canApprove } from './permissions';
import { validateLedgerIntent, buildIdempotencyKey } from './ledger';
import { previewCostCentres } from './imports';

describe('costing (finance-approved examples required in UAT)', () => {
  it('MHR = cost / practical hrs', () => {
    expect(machineHourRate({ annualAllocableCost: 1200000, practicalHours: 6000 })).toBe('200');
  });
  it('MPV/MUV signs', () => {
    expect(materialPriceVariance(1000, 520, 535)).toBe('-15000');
    expect(materialUsageVariance(980, 1000, 520)).toBe('-10400');
  });
  it('yield', () => {
    expect(yieldPct(942, 1000)).toBe('94.2');
  });
});

describe('validation', () => {
  it('flags Invoice 0/blank', () => {
    expect(isPlaceholderInvoice('0')).toBe(true);
    expect(isPlaceholderInvoice('')).toBe(true);
    expect(isPlaceholderInvoice('INV-1')).toBe(false);
  });
  it('rejects bad traveller', () => {
    const r = travellerEntrySchema.safeParse({ travellerNo: '', woNo: 'W', pass: 'P', machineId: 'M', ccCode: 'C', heatId: 'H', inputKg: -1, outputKg: 5 });
    expect(r.success).toBe(false);
  });
});

describe('SOPIC reconciliation', () => {
  it('routes Invoice-0 + unknown PC to exceptions', () => {
    const rec = reconcileSopic(
      [
        { invoiceNo: 'INV-1', date: 'd', customerId: 'c', orderNo: 'o', productId: 'p', productAccount: 'pa', qty: 1, netWeight: 10, value: 100, profitCentre: '514' },
        { invoiceNo: '0', date: 'd', customerId: 'c', orderNo: 'o', productId: 'p', productAccount: 'pa', qty: 1, netWeight: 5, value: 50, profitCentre: '514' },
        { invoiceNo: 'INV-3', date: 'd', customerId: 'c', orderNo: 'o', productId: 'p', productAccount: 'pa', qty: 1, netWeight: 7, value: 70, profitCentre: '999' },
      ],
      ['513', '514', '517'],
    );
    expect(rec.matched.length).toBe(1);
    expect(rec.invoiceZeroExceptions.length).toBe(1);
    expect(rec.pcExceptions.length).toBe(1);
  });
});

describe('maker-checker', () => {
  it('blocks self-approval', () => {
    expect(canApprove(['finance'], 'u1', 'u1')).toBe(false);
    expect(canApprove(['finance'], 'u1', 'u2')).toBe(true);
  });
});

describe('ledger + imports', () => {
  it('requires reason for adjust', () => {
    const errs = validateLedgerIntent({ idempotencyKey: buildIdempotencyKey(['a']), type: 'adjust', plantId: 'mehsana', qty: 1, kg: 1, ref: 'R' });
    expect(errs.length).toBeGreaterThan(0);
  });
  it('detects bad CC + duplicates', () => {
    const p = previewCostCentres('code,description\nBAD-1,x\n820410300,y\n820410300,z');
    expect(p.errors.length).toBe(1);
    expect(p.duplicates).toEqual([4]);
  });
});
