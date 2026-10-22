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
import { useSession } from '../../src/store/session';
import { buildIdempotencyKey, validateLedgerIntent } from '../../src/lib/ledger';
import { audit } from '../../src/lib/audit';
import { demoDb, type Heat } from '../../src/mocks/demo';
import { tokens } from '../../src/theme/tokens';

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
          <View style={styles.tabs}>
            {TABS.map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t ? styles.on : null]}>
                <Text style={[styles.tabT, tab === t ? styles.onT : null]}>{t}</Text>
              </Pressable>
            ))}
          </View>
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
          <View style={styles.row}>
            <Pressable style={styles.btn} onPress={postIssue}><Text style={styles.btnT}>Post SAMPLE issue (mock)</Text></Pressable>
            <Pressable style={[styles.btn, styles.btn2]} onPress={attemptOverIssue}><Text style={styles.btnT}>Attempt over-issue (blocked)</Text></Pressable>
          </View>
          {msg ? <Text style={styles.msg}>{msg}</Text> : null}
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
  tabs: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  tab: { borderWidth: 1, borderColor: tokens.color.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff' },
  on: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  tabT: { fontSize: 12, fontWeight: '700', color: tokens.color.text2 },
  onT: { color: '#fff' },
  link: { color: tokens.color.primary, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 },
  btn: { backgroundColor: tokens.color.primary, borderRadius: 10, padding: 12 },
  btn2: { backgroundColor: tokens.color.dark },
  btnT: { color: '#fff', fontWeight: '700' },
  msg: { marginTop: 8, color: tokens.color.text },
  note: { color: tokens.color.text2, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: tokens.color.border },
});
