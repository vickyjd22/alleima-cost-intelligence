/**
 * Trusted backend operations — deploy with `firebase deploy --only functions`.
 * All financial postings, approvals, reversals and period locks execute here,
 * never in the client. Firestore Rules deny direct writes to these paths.
 */
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

admin.initializeApp();
const db = admin.firestore();

function requireRoles(ctxRoles: string[], allowed: string[], uid: string, makerUid?: string): void {
  if (makerUid && makerUid === uid && allowed.includes('checker')) {
    throw new HttpsError('permission-denied', 'Maker cannot approve own item.');
  }
  if (!ctxRoles.some((r) => allowed.includes(r))) {
    throw new HttpsError('permission-denied', 'Insufficient role.');
  }
}

interface Claims { roles?: string[]; plantIds?: string[] }

/** Idempotent inventory posting with transactional balance check. */
export const postLedgerTxn = onCall(async (req) => {
  const claims = (req.auth?.token ?? {}) as Claims;
  requireRoles(claims.roles ?? [], ['stores', 'finance', 'clientAdmin', 'platformAdmin'], req.auth?.uid ?? '');
  const { idempotencyKey, plantId, heatId, kg, type } = req.data as Record<string, unknown>;
  if (typeof idempotencyKey !== 'string' || typeof plantId !== 'string') {
    throw new HttpsError('invalid-argument', 'idempotencyKey + plantId required');
  }
  if (!((claims.plantIds ?? []) as string[]).includes(plantId)) {
    throw new HttpsError('permission-denied', 'Plant not authorized');
  }
  const ref = db.doc(`tenants/main/ledger/${String(idempotencyKey)}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return; // idempotent replay
    if (typeof heatId === 'string' && typeof kg === 'number' && (type === 'issue' || type === 'transfer')) {
      const heat = await tx.get(db.doc(`tenants/main/heats/${heatId}`));
      const bal = Number((heat.data() as { kg?: number } | undefined)?.kg ?? 0);
      if (bal - kg < 0) throw new HttpsError('failed-precondition', 'Negative heat balance blocked');
      tx.set(db.doc(`tenants/main/heats/${heatId}`), { kg: bal - kg }, { merge: true });
    }
    tx.set(ref, { ...req.data, by: req.auth?.uid, at: admin.firestore.FieldValue.serverTimestamp() });
  });
  await db.collection('auditLogs').add({ actor: req.auth?.uid, action: 'ledger.post', at: admin.firestore.FieldValue.serverTimestamp(), detail: String(idempotencyKey) });
  return { ok: true };
});

/** Maker-checker approval with reason + audit. */
export const decideApproval = onCall(async (req) => {
  const claims = (req.auth?.token ?? {}) as Claims;
  const { approvalId, decision, reason, makerUid } = req.data as { approvalId: string; decision: 'approved' | 'rejected'; reason: string; makerUid: string };
  requireRoles(claims.roles ?? [], ['finance', 'management', 'clientAdmin', 'checker'], req.auth?.uid ?? '', makerUid);
  if (!approvalId || !reason) throw new HttpsError('invalid-argument', 'approvalId + reason required');
  await db.doc(`tenants/main/approvals/${approvalId}`).set(
    { decision, reason, checker: req.auth?.uid, at: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true },
  );
  await db.collection('auditLogs').add({ actor: req.auth?.uid, action: `approval.${decision}`, at: admin.firestore.FieldValue.serverTimestamp(), detail: approvalId });
  return { ok: true };
});

/** Period lock — Finance/ClientAdmin only. */
export const lockPeriod = onCall(async (req) => {
  const claims = (req.auth?.token ?? {}) as Claims;
  requireRoles(claims.roles ?? [], ['finance', 'clientAdmin'], req.auth?.uid ?? '');
  const { period } = req.data as { period: string };
  if (!period) throw new HttpsError('invalid-argument', 'period required');
  await db.doc(`tenants/main/periods/${period}`).set({ locked: true, lockedBy: req.auth?.uid, at: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  return { ok: true };
});
