import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { AuditPanel } from '../../src/components/Governance';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { FormField, PrimaryButton } from '../../src/components/FormField';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { ConfirmDialog } from '../../src/components/Feedback';
import { CLOSE_STEPS, closeProgress } from '../../src/lib/close';
import { audit, auditLog, resetAudit } from '../../src/lib/audit';
import { resetDemo } from '../../src/mocks/demo';
import { CAS_LIST, POLICY_FORM, MASTER_LINKS, ERP_CHECKS, PRIORITIES } from '../../src/mocks/manual';
import { useSession } from '../../src/store/session';

const USERS = [
  { id: 'demo@alleima.example', roles: 'management', plants: 'mehsana', state: 'active' },
  { id: 'costing@alleima.example', roles: 'costing', plants: 'mehsana', state: 'active' },
  { id: 'finance@alleima.example', roles: 'finance', plants: 'mehsana', state: 'active' },
  { id: 'operator@alleima.example', roles: 'operator', plants: 'mehsana', state: 'active' },
];

export default function Admin() {
  const { roles, plantId, period, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [locked, setLocked] = useState(false);
  const [askLock, setAskLock] = useState(false);
  const [policy, setPolicy] = useState(false);
  const [pReason, setPReason] = useState('');
  const [, bump] = useState(0);
  const pct = closeProgress({ 'D+1–D+2': 'done' });
  const canLock = roles.some((r) => r === 'finance' || r === 'clientAdmin' || r === 'platformAdmin');

  function toggleLock(): void {
    setLocked(!locked);
    audit(email ?? 'demo', locked ? 'period.reopen' : 'period.lock', `${period} (mock)`);
    toast.show(locked ? 'Period reopened (mock — Finance only in production).' : 'Period locked (mock — Functions enforce in production).');
    setAskLock(false);
    bump((x) => x + 1);
  }

  function submitPolicy(): void {
    if (!pReason.trim()) {
      toast.show('Reason for change is required (Annex E).');
      return;
    }
    audit(email ?? 'demo', 'policy.change', `${pReason} (mock — needs Costing+Finance+Management)`);
    toast.show('Policy change request submitted for triple approval (mock).');
    setPolicy(false);
    setPReason('');
    bump((x) => x + 1);
  }

  return (
    <AppShell roles={roles}>
      <PageHeader title="Administration, Audit & Compliance" sub={`Plant ${plantId ?? '—'} · period ${period} · close ${pct}%`} />
      {loading ? (
        <Skeleton lines={5} />
      ) : (
        <View>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Users (invite-only)</Text>
          <DataTable
            columns={[
              { key: 'id', header: 'Email', width: 220, render: (r) => <Text>{r.id}</Text> },
              { key: 'r', header: 'Roles', render: (r) => <Text>{r.roles}</Text> },
              { key: 's', header: 'State', render: () => <StatusChip label="active" tone="ok" /> },
            ]}
            rows={USERS}
          />
          <Text style={{ fontWeight: '700', marginTop: 16, marginBottom: 8 }}>Regulatory framework (§2 — law prevails over policy)</Text>
          <DataTable columns={[{ key: 'c', header: 'Standard', width: 200, render: (r) => <Text>{r.code}</Text> }, { key: 'n', header: 'Application', width: 360, render: (r) => <Text>{r.name}</Text> }]} rows={CAS_LIST.map(([code, name], i) => ({ id: `cas${i}`, code, name }))} />
          <Text style={{ fontWeight: '700', marginTop: 16, marginBottom: 8 }}>Master-data relationships (§24.1) + ERP checks (§24.2)</Text>
          <DataTable columns={[{ key: 'm', header: 'Master', width: 160, render: (r) => <Text>{r.master}</Text> }, { key: 'l', header: 'Must link to', width: 400, render: (r) => <Text>{r.link}</Text> }]} rows={MASTER_LINKS.map(([master, link], i) => ({ id: `ml${i}`, master, link }))} />
          {ERP_CHECKS.map((c) => <Text key={c} style={{ fontSize: 12, color: '#172033', paddingVertical: 1 }}>• {c}</Text>)}
          <Text style={{ color: '#667085', fontSize: 12, marginTop: 6 }}>Triangle (§24.3): FINANCIAL LEDGER ↔ COST CENTRES ↔ PRODUCTION / INVENTORY / SALES — proven every close.</Text>
          <Text style={{ fontWeight: '700', marginTop: 16, marginBottom: 8 }}>Immediate priorities (§25)</Text>
          {PRIORITIES.map((p, i) => <Text key={p} style={{ fontSize: 12, color: '#172033', paddingVertical: 1 }}>{i + 1}. {p}</Text>)}
          <Text style={{ fontWeight: '700', marginTop: 16, marginBottom: 8 }}>Period {period} — {locked ? 'LOCKED' : 'OPEN'} (close steps tracked: {CLOSE_STEPS.length})</Text>
          <Pressable onPress={() => (canLock ? setAskLock(true) : toast.show('Only Finance/ClientAdmin can lock periods.'))}>
            <Text style={{ color: '#4F46E5', fontWeight: '700' }}>{locked ? 'Request reopen (mock)' : 'Lock period (mock)'} {!canLock ? '(no permission for your role)' : ''}</Text>
          </Pressable>
          <Pressable onPress={() => setPolicy(true)}>
            <Text style={{ color: '#4F46E5', fontWeight: '700', marginTop: 8 }}>New cost policy change request (Annex E)</Text>
          </Pressable>
          <Pressable onPress={() => { resetDemo(); resetAudit(); audit('demo', 'seed.reset', 'SAMPLE dataset restored'); bump((x) => x + 1); toast.show('Demo data + audit reset.'); }}>
            <Text style={{ color: '#4F46E5', fontWeight: '700', marginTop: 8 }}>Reset demo data</Text>
          </Pressable>
          <AuditPanel entries={auditLog().map((a) => ({ at: a.at, actor: a.actor, action: a.action, detail: a.detail }))} />
        </View>
      )}
      <ConfirmDialog visible={askLock} title={locked ? 'Reopen period?' : 'Lock period?'} message="Period locks are enforced by Functions in production. This records the intent locally for review." confirmLabel={locked ? 'Reopen (mock)' : 'Lock (mock)'} onConfirm={toggleLock} onCancel={() => setAskLock(false)} />
      <DetailDrawer visible={policy} title="Cost policy change request (Annex E)" onClose={() => setPolicy(false)}>
        {POLICY_FORM.slice(0, 6).map((f) => <KeyVal key={f} k={f} v="—" />)}
        <FormField label="Reason for change (required)" value={pReason} onChange={setPReason} placeholder="e.g. CAS-2 Rev 2024 capacity update" />
        <PrimaryButton label="Submit for triple approval (mock)" onPress={submitPolicy} />
      </DetailDrawer>
    </AppShell>
  );
}
