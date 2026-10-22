import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { ConfirmDialog } from '../../src/components/Feedback';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { FormField } from '../../src/components/FormField';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { Button, Callout, SectionHeader } from '../../src/components/ui';
import { useToast } from '../../src/components/Toast';
import { useSession } from '../../src/store/session';
import { audit } from '../../src/lib/audit';
import { demoDb, resetDemo } from '../../src/mocks/demo';
import { fontStack, palette, type } from '../../src/theme/tokens';

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
    setDetail(null);
    bump((x) => x + 1);
  }

  const pending = demoDb.approvals.filter((a) => a.status === 'pending').length;
  const selected = demoDb.approvals.find((a) => a.id === detail);

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Controls"
        title="Approvals"
        sub={`Maker-checker queue · maker and checker must differ · ${pending} pending`}
        right={<Button label="Reset demo queue" size="sm" variant="secondary" icon="refresh" onPress={() => { resetDemo(); bump((x) => x + 1); toast.show('Demo queue reset.'); }} />}
      />

      {pending === 0 && !loading ? (
        <View style={{ marginBottom: 14 }}>
          <Callout tone="ok" title="Queue clear" compact>
            All decisions recorded with reasons. Auditors see this queue read-only with the full history.
          </Callout>
        </View>
      ) : null}

      {loading ? (
        <Skeleton />
      ) : (
        <DataTable
          columns={[
            { key: 'id', header: 'ID', width: 110, render: (r) => <Text>{r.id}</Text> },
            { key: 'k', header: 'Kind', width: 210, render: (r) => <Text>{r.kind}</Text> },
            { key: 'm', header: 'Maker', width: 140, render: (r) => <Text>{r.maker}</Text> },
            { key: 's', header: 'Status', width: 130, render: (r) => <StatusChip label={r.status} tone={r.status === 'approved' ? 'ok' : r.status === 'rejected' ? 'error' : 'warn'} /> },
            { key: 'r', header: '', width: 110, render: (r) => (r.status === 'pending' ? <Button label="Review" size="sm" onPress={() => setDetail(r.id)} /> : <Button label="Open" size="sm" variant="ghost" onPress={() => setDetail(r.id)} />) },
          ]}
          rows={demoDb.approvals}
        />
      )}

      <SectionHeader title="How this control works" description="Enforced server-side in production." style={{ marginTop: 26 }} />
      <Callout tone="neutral" compact>
        Approval requires maker ≠ checker, an explicit decision and a reason on rejection. Every action writes an immutable audit entry with actor and timestamp.
      </Callout>

      <DetailDrawer visible={detail !== null} title={detail ?? ''} onClose={() => setDetail(null)}>
        <KeyVal k="Kind" v={selected?.kind ?? ''} />
        <KeyVal k="Reference" v={selected?.ref ?? ''} />
        <KeyVal k="Maker" v={selected?.maker ?? ''} />
        <KeyVal k="Status" v={selected?.status ?? ''} />
        <KeyVal k="Enforcement" v="Server checks maker ≠ checker + reason on reject" />
        {selected?.status === 'pending' ? (
          <View style={{ marginTop: 14, gap: 10 }}>
            <FormField label="Reason (required to reject)" value={reason} onChange={setReason} placeholder="e.g. rate base year wrong" />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Button label="Approve" icon="check" variant="success" onPress={() => setConfirm(selected.id)} />
              <Button label="Reject with reason" icon="x" variant="danger" onPress={() => decide(selected.id, 'rejected')} />
            </View>
          </View>
        ) : (
          <Text style={{ ...type.caption1, color: palette.text3, fontFamily: fontStack } as never}>
            This item is already {selected?.status}; history is preserved.
          </Text>
        )}
      </DetailDrawer>

      <ConfirmDialog
        visible={confirm !== null}
        title={`Approve ${confirm ?? ''}?`}
        message="Approval is enforced server-side with an audit entry. You cannot approve your own submission in production."
        confirmLabel="Approve (mock)"
        onConfirm={() => { if (confirm) decide(confirm, 'approved'); }}
        onCancel={() => setConfirm(null)}
      />
    </AppShell>
  );
}
