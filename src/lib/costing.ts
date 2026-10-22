import Decimal from 'decimal.js';

/**
 * Decimal-safe candidate calculations.
 * NOT approved accounting rules — run only with finance-approved examples + versioned rates.
 */

export interface MhrInput {
  annualAllocableCost: string | number;
  practicalHours: string | number;
}

export function machineHourRate({ annualAllocableCost, practicalHours }: MhrInput): string {
  const cost = new Decimal(annualAllocableCost);
  const hrs = new Decimal(practicalHours);
  if (hrs.lte(0)) throw new Error('practicalHours must be > 0');
  return cost.div(hrs).toDecimalPlaces(4).toString();
}

export function materialPriceVariance(aq: string | number, stdRate: string | number, actualRate: string | number): string {
  return new Decimal(aq).mul(new Decimal(stdRate).minus(new Decimal(actualRate))).toDecimalPlaces(2).toString();
}

export function materialUsageVariance(sq: string | number, aq: string | number, stdRate: string | number): string {
  return new Decimal(sq).minus(new Decimal(aq)).mul(new Decimal(stdRate)).toDecimalPlaces(2).toString();
}

export function yieldPct(goodQty: string | number, inputQty: string | number): string {
  const input = new Decimal(inputQty);
  if (input.lte(0)) return '0';
  return new Decimal(goodQty).div(input).mul(100).toDecimalPlaces(2).toString();
}
