import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { ConfirmDialog } from '../../src/components/Feedback';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { FormField } from '../../src/components/FormField';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { useSession } from '../../src/store/session';
import { audit } from '../../src/lib/audit';
import { demoDb, resetDemo } from '../../src/mocks/demo';
import { tokens } from '../../src/theme/tokens';

export default function Approvals() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState<string | null>(null);
  const [, bump] = useState(0);

  function decide(id: string, decision: 'approved' | 'rejected'): void {
    if (decision === 'rejected' && !reason.trim()) {
      toast.show('Rejection needs a reason (mock guard).');
      return;
    }
    const item = demoDb.approvals.find((a) => a.id === id);
    if (item) item.status = decision;
    audit(email ?? 'demo', `approval.${decision}`, `${id} reason: ${reason || '—'} (mock)`);
    toast.show(`${id} ${decision} — audit recorded (mock).`);
    setConfirm(null);
    setReason('');
    bump((x) => x + 1);
  }

  const pending = demoDb.approvals.filter((a) => a.status === 'pending').length;

  return (
    <AppShell roles={roles}>
      <PageHeader
        title="Approvals & Exceptions"
        sub={`Maker-checker: maker ≠ checker · ${pending} pending`}
        right={<Pressable onPress={() => { resetDemo(); bump((x) => x + 1); toast.show('Demo queue reset.'); }}><Text style={{ color: tokens.color.primary, fontWeight: '700' }}>Reset demo queue</Text></Pressable>}
      />
      {loading ? (
        <Skeleton />
      ) : (
        <DataTable
          columns={[
            { key: 'id', header: 'ID', render: (r) => <Text>{r.id}</Text> },
            { key: 'k', header: 'Kind', width: 200, render: (r) => <Text>{r.kind}</Text> },
            { key: 'm', header: 'Maker', render: (r) => <Text>{r.maker}</Text> },
            { key: 's', header: 'Status', render: (r) => <StatusChip label={r.status} tone={r.status === 'approved' ? 'ok' : r.status === 'rejected' ? 'error' : 'warn'} /> },
            { key: 'r', header: '', render: (r) => <Pressable onPress={() => setDetail(r.id)}><Text style={{ color: tokens.color.primary, fontWeight: '700' }}>Open</Text></Pressable> },
            { key: 'a', header: '', render: (r) => (r.status === 'pending' ? <Pressable onPress={() => setConfirm(r.id)}><Text style={{ color: tokens.color.primary, fontWeight: '700' }}>Review</Text></Pressable> : <Text>—</Text>) },
          ]}
          rows={demoDb.approvals}
        />
      )}
      {pending === 0 && !loading ? <Text style={{ color: tokens.color.text2, marginTop: 8 }}>Queue clear — all decisions recorded with reasons. Auditor sees this read-only with full history.</Text> : null}
      <DetailDrawer visible={detail !== null} title={detail ?? ''} onClose={() => setDetail(null)}>
        <KeyVal k="Kind" v={demoDb.approvals.find((a) => a.id === detail)?.kind ?? ''} />
        <KeyVal k="Reference" v={demoDb.approvals.find((a) => a.id === detail)?.ref ?? ''} />
        <KeyVal k="Maker" v={demoDb.approvals.find((a) => a.id === detail)?.maker ?? ''} />
        <KeyVal k="Enforcement" v="Server checks maker ≠ checker + reason on reject" />
      </DetailDrawer>
      <ConfirmDialog
        visible={confirm !== null}
        title={`Decide ${confirm ?? ''}`}
        message="Approval is enforced server-side with reason + audit. Rejection requires a reason."
        confirmLabel="Approve (mock)"
        onConfirm={() => { if (confirm) decide(confirm, 'approved'); }}
        onCancel={() => setConfirm(null)}
      />
      {confirm !== null ? (
        <View style={{ marginTop: 8 }}>
          <FormField label="Reason (required to reject)" value={reason} onChange={setReason} placeholder="e.g. rate base year wrong" />
          <Pressable onPress={() => { if (confirm) decide(confirm, 'rejected'); }}>
            <Text style={{ color: tokens.color.error, fontWeight: '700' }}>Reject with reason (mock)</Text>
          </Pressable>
        </View>
      ) : null}
    </AppShell>
  );
}
