/** In-session audit log — every mock action appends here; Admin reads it. */

export interface AuditRecord {
  at: string;
  actor: string;
  action: string;
  detail: string;
}

const log: AuditRecord[] = [
  { at: '2026-10-13 09:00', actor: 'system', action: 'seed.load', detail: 'SAMPLE dataset' },
];

export function audit(actor: string, action: string, detail: string): void {
  log.unshift({ at: new Date().toISOString().slice(0, 16).replace('T', ' '), actor, action, detail });
}

export function auditLog(): AuditRecord[] {
  return [...log];
}

export function resetAudit(): void {
  log.length = 0;
  log.push({ at: '2026-10-13 09:00', actor: 'system', action: 'seed.load', detail: 'SAMPLE dataset' });
}
