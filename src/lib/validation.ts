import { z } from 'zod';

/** Shared validation — client pre-check only; Functions re-validate server-side. */

export const costCentreType = z.enum(['production', 'service', 'project', 'reporting']);
export type CostCentreType = z.infer<typeof costCentreType>;

export const costCentreSchema = z.object({
  code: z.string().regex(/^8204/, 'Must start with 8204'),
  description: z.string().min(2),
  department: z.string().min(1),
  type: costCentreType,
  owner: z.string().min(1),
  driver: z.string().min(1),
  uom: z.string().min(1),
  active: z.boolean().default(true),
});

export const travellerEntrySchema = z.object({
  travellerNo: z.string().min(1),
  woNo: z.string().min(1),
  pass: z.string().min(1),
  machineId: z.string().min(1),
  ccCode: z.string().min(1),
  heatId: z.string().min(1),
  inputKg: z.number().nonnegative(),
  outputKg: z.number().nonnegative(),
  reworkKg: z.number().nonnegative().default(0),
  rejectKg: z.number().nonnegative().default(0),
  defectCode: z.string().optional(),
});

export const invoiceExceptionSchema = z.object({
  invoiceNo: z.string(),
  reason: z.enum(['blank', 'zero', 'invalid']),
});

export function isPlaceholderInvoice(no: string | null | undefined): boolean {
  if (!no) return true;
  const t = no.trim();
  return t === '' || t === '0';
}
