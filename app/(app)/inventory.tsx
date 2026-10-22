import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { TraceabilityTimeline } from '../../src/components/CostingPanels';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { Button, Callout, Tabs } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { buildIdempotencyKey, validateLedgerIntent } from '../../src/lib/ledger';
import { audit } from '../../src/lib/audit';
import { demoDb, type Heat } from '../../src/mocks/demo';
import { fontStack, palette, type } from '../../src/theme/tokens';

const TABS = ['Stock', 'Movements', 'Adjustments', 'Physical', 'Traceability'] as const;

const MOVEMENTS = [
  { id: 'TXN-881', type: 'issue', heat: 'H-771', kg: 250, ref: 'WO-881', key: 'issue|H-771|WO-881' },
  { id: 'TXN-882', type: 'wip', heat: 'H-771', kg: 942, ref: 'T-501', key: 'T-501|HF-3' },
  { id: 'TXN-883', type: 'reversal', heat: 'H-772', kg: 50, ref: 'reversal of TXN-870', key: 'reversal|TXN-870' },
];

export default function Inventory() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Stock');
  const [heat, setHeat] = useState<Heat | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function postIssue(): void {
    const errs = validateLedgerIntent({
      idempotencyKey: buildIdempotencyKey(['issue', 'H-771', 'WO-881', Date.now()]),
      type: 'issue',
      plantId: 'mehsana',
      heatId: 'H-771',
      qty: 2,
      kg: 250,
      locationFrom: 'RM-YARD-A',
      ref: 'WO-881',
    });
    if (errs.length > 0) {
      setMsg(errs.join('; '));
      return;
    }
    audit(email ?? 'demo', 'ledger.issue', 'H-771 → WO-881 250kg (mock)');
    toast.show('Issue posted transactionally with idempotency key (mock).');
    setMsg('Issue intent valid — Functions will post transactionally with idempotency (mock).');
  }

  function attemptOverIssue(): void {
    toast.show('Blocked: negative heat balance — needs approved exception (mock guard).');
    setMsg('Blocked: H-772 has 3,100 kg; issuing 9,999 kg requires an approved exception. Original untouched.');
  }

  return (
    <AppShell roles={roles}>
      <PageHeader title="Inventory & Traceability" sub="Immutable ledger · idempotent · reversals only, never overwrite" />
      {loading ? (
        <Skeleton />
      ) : (
        <View>
          <Tabs tabs={TABS} value={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} style={{ marginBottom: 14 }} />
          {tab === 'Stock' ? (
            <DataTable
              columns={[
                { key: 'id', header: 'Heat', render: (r) => <Text>{r.id}</Text> },
                { key: 'm', header: 'Material', width: 200, render: (r) => <Text>{r.material}</Text> },
                { key: 'kg', header: 'Kg', render: (r) => <Text>{String(r.kg)}</Text> },
                { key: 'loc', header: 'Location', render: (r) => <Text>{r.loc}</Text> },
                { key: 's', header: 'State', render: () => <StatusChip label="available" tone="ok" /> },
                { key: 'o', header: '', render: (r) => <Pressable onPress={() => setHeat(r)}><Text style={styles.link}>Trace</Text></Pressable> },
              ]}
              rows={demoDb.heats}
            />
          ) : null}
          {tab === 'Movements' ? (
            <DataTable
              columns={[
                { key: 'id', header: 'Txn', render: (r) => <Text>{r.id}</Text> },
                { key: 't', header: 'Type', render: (r) => <StatusChip label={r.type} tone={r.type === 'reversal' ? 'warn' : 'info'} /> },
                { key: 'h', header: 'Heat', render: (r) => <Text>{r.heat}</Text> },
                { key: 'kg', header: 'Kg', render: (r) => <Text>{String(r.kg)}</Text> },
                { key: 'k', header: 'Idempotency key', width: 200, render: (r) => <Text>{r.key}…</Text> },
              ]}
              rows={MOVEMENTS}
            />
          ) : null}
          {tab === 'Adjustments' ? (
            <Text style={styles.note}>Adjustments require a reason and route to Approvals (maker-checker). No silent overwrites — see Movements for reversals.</Text>
          ) : null}
          {tab === 'Physical' ? (
            <DataTable
              columns={[
                { key: 'id', header: 'Heat', render: (r) => <Text>{r.id}</Text> },
                { key: 'b', header: 'Book kg', render: (r) => <Text>{String(r.kg)}</Text> },
                { key: 'c', header: 'Count kg', render: (r) => <Text>{String(r.kg - 12)}</Text> },
                { key: 'v', header: 'Variance', render: () => <StatusChip label="−12 kg count" tone="warn" /> },
              ]}
              rows={demoDb.heats}
            />
          ) : null}
          {tab === 'Traceability' ? (
            <TraceabilityTimeline steps={['H-771 receipt GRN-441 (5,200 kg)', 'Issue 250 kg → WO-881', 'T-501 HF-3 → CF-2 (942 kg good)', 'WIP → FG → Dispatch SO-1042']} />
          ) : null}
          <View style={[styles.row, { marginTop: 16 }]}>
            <Button label="Post sample issue" icon="plus" onPress={postIssue} />
            <Button label="Attempt over-issue" icon="shieldAlert" variant="secondary" onPress={attemptOverIssue} />
          </View>
          {msg ? <View style={{ marginTop: 10 }}><Callout tone={msg.startsWith('Blocked') ? 'warn' : 'ok'} compact>{msg}</Callout></View> : null}
        </View>
      )}
      <DetailDrawer visible={heat !== null} title={heat ? `Heat ${heat.id}` : ''} onClose={() => setHeat(null)}>
        <KeyVal k="Material" v={heat?.material ?? ''} />
        <KeyVal k="Balance" v={`${heat?.kg ?? 0} kg`} />
        <KeyVal k="Location" v={heat?.loc ?? ''} />
        <KeyVal k="Genealogy" v="GRN-441 → WO-881 → T-501 → FG-2091 → SO-1042 (SAMPLE)" />
      </DetailDrawer>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  link: { color: palette.tint, fontWeight: '700', fontFamily: fontStack },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  note: { ...type.footnote, color: palette.text2, fontFamily: fontStack, lineHeight: 20 } as never,
});
