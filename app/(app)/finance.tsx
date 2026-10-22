import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { PeriodSelector } from '../../src/components/Filters';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { FormField, PrimaryButton } from '../../src/components/FormField';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { ExportButton } from '../../src/components/ExportButton';
import { CLOSE_STEPS } from '../../src/lib/close';
import { reconcileSopic, type SopicRow } from '../../src/lib/reconciliation';
import { audit } from '../../src/lib/audit';
import { demoDb } from '../../src/mocks/demo';
import { KNOWN_PCS } from '../../src/data/sample';
import { ABNORMAL_ITEMS } from '../../src/mocks/manual';
import { Card } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { useSession } from '../../src/store/session';
import { fontStack, palette, type } from '../../src/theme/tokens';

type Row = SopicRow & { id: string };

// §18.4 six reconciliation layers [layer, source, outcome, state]
const LAYERS: [string, string, string, 'ok' | 'warn' | 'error'][] = [
  ['Sales value + invoice population', 'SOPIC / sales register', 'Totals, CN/DN, cancellations, cut-off → sales ledger', 'ok'],
  ['Invoice number integrity', 'SOPIC / billing register', 'Blank/0/invalid → exception register before closure', 'error'],
  ['Profit Centre (513/514/517)', 'Financial ledger / SAP', 'Correct PC; manual reallocations identified + approved', 'warn'],
  ['Product account / FS mapping', 'Product master + PRManager/PRMangr (TBD)', 'Mapping reconciled; ERP definitions confirmed by mgmt', 'warn'],
  ['Dispatch to sales', 'Dispatch advice / SOPIC / ledger', 'Qty + net weight vs invoiced; timing diffs documented', 'ok'],
  ['Costing to financial result', 'Costing model / financial ledger', 'Bridge via stock, non-cost + other items', 'ok'],
];

export default function Finance() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [done, setDone] = useState<Record<string, boolean>>({ 'D+1–D+2': true });
  const [exc, setExc] = useState<Row | null>(null);
  const [owner, setOwner] = useState('');
  const [due, setDue] = useState('');
  const rec = reconcileSopic(demoDb.sopic, KNOWN_PCS);
  const all: Row[] = [...rec.matched, ...rec.invoiceZeroExceptions, ...rec.pcExceptions].map((r, i) => ({ ...r, id: `${r.invoiceNo}-${i}` }));

  function resolve(): void {
    if (!owner.trim()) {
      toast.show('Assign an owner before resolving (mock).');
      return;
    }
    audit(email ?? 'demo', 'rec.resolve', `${exc?.invoiceNo} owner ${owner} due ${due || '—'} (mock)`);
    toast.show(`Exception assigned to ${owner} (mock).`);
    setExc(null);
    setOwner('');
    setDue('');
  }

  return (
    <AppShell roles={roles}>
      <PageHeader title="Finance & Reconciliation (§18)" sub="Financial Profit = Cost Profit + excluded income − excluded expenses ± stock diff ± other items (§18.2)" right={<PeriodSelector />} />
      {loading ? (
        <Skeleton lines={5} />
      ) : (
        <View>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <ExportButton filename="annexG-rec-sample.csv" headers={['layer', 'source', 'outcome']} rows={LAYERS.map(([l, s, o]) => [l, s, o])} />
          </View>
          <Text style={styles.h}>Six-layer SOPIC bridge (§18.4, Annex G)</Text>
          <DataTable
            columns={[
              { key: 'l', header: 'Layer', width: 220, render: (r) => <Text>{r.layer}</Text> },
              { key: 's', header: 'Primary source', width: 220, render: (r) => <Text>{r.src}</Text> },
              { key: 'o', header: 'Control / outcome', width: 320, render: (r) => <Text>{r.out}</Text> },
              { key: 't', header: '', render: (r) => <StatusChip label={r.tone === 'ok' ? 'reconciled' : r.tone === 'warn' ? 'open items' : 'exceptions'} tone={r.tone} /> },
            ]}
            rows={LAYERS.map(([layer, src, out, tone], i) => ({ id: `L${i}`, layer, src, out, tone }))}
          />
          <Text style={styles.h}>Invoice population — matched {rec.matched.length}, Invoice-0 {rec.invoiceZeroExceptions.length}, PC exceptions {rec.pcExceptions.length}</Text>
          <DataTable
            columns={[
              { key: 'inv', header: 'Invoice', render: (r) => <Text>{r.invoiceNo}</Text> },
              { key: 'pc', header: 'PC', render: (r) => <Text>{r.profitCentre}</Text> },
              { key: 'v', header: 'Value', render: (r) => <Text>{String(r.value)}</Text> },
              { key: 'd', header: 'Dispatch wt', render: (r) => <Text>{String(r.netWeight)}</Text> },
              { key: 's', header: 'State', render: (r) => (r.invoiceNo === '0' ? <StatusChip label="invoice-0" tone="error" /> : r.profitCentre === '999' ? <StatusChip label="pc-review" tone="warn" /> : <StatusChip label="matched" tone="ok" />) },
              { key: 'a', header: '', render: (r) => (r.invoiceNo === '0' || r.profitCentre === '999' ? <Pressable onPress={() => setExc(r)}><Text style={styles.link}>Investigate</Text></Pressable> : <Text>—</Text>) },
            ]}
            rows={all}
          />
          <Text style={styles.h}>Abnormal / non-cost bridge items (§17.5 — never in normal cost)</Text>
          <DataTable columns={[{ key: 'i', header: 'Item', width: 220, render: (r) => <Text>{r.item}</Text> }, { key: 't', header: 'Treatment', width: 380, render: (r) => <Text>{r.tr}</Text> }]} rows={ABNORMAL_ITEMS.map(([item, tr], i) => ({ id: `n${i}`, item, tr }))} />
          <Text style={styles.h}>Close checklist D+1..D+12 + Annex B evidence</Text>
          <Card padded={false} style={{ marginTop: 10 }}>
            {CLOSE_STEPS.map((s, i) => {
              const on = !!done[s.day];
              return (
                <Pressable
                  key={s.day}
                  onPress={() => setDone({ ...done, [s.day]: !done[s.day] })}
                  style={[styles.closeRow, i < CLOSE_STEPS.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.separator }]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${s.day}: ${s.activity}`}
                >
                  <View style={[styles.checkbox, on && { backgroundColor: palette.success, borderColor: palette.success }]}>
                    {on ? <Icon name="check" size={12} color="#fff" strokeWidth={3} /> : null}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.step}>{s.day} — {s.activity}</Text>
                    <Text style={styles.stepSub}>{s.owner} → {s.output}</Text>
                  </View>
                  <StatusChip label={on ? 'done' : 'open'} tone={on ? 'ok' : 'neutral'} />
                </Pressable>
              );
            })}
          </Card>
        </View>
      )}
      <DetailDrawer visible={exc !== null} title={`Exception ${exc?.invoiceNo ?? ''}`} onClose={() => setExc(null)}>
        <KeyVal k="Order" v={exc?.orderNo ?? ''} />
        <KeyVal k="Value" v={String(exc?.value ?? '')} />
        <KeyVal k="Resolution path" v={exc?.invoiceNo === '0' ? 'Billing doc / cancellation / credit note / posting doc (Annex G)' : 'PC mapping + approved reallocation with source ref'} />
        <FormField label="Owner" value={owner} onChange={setOwner} placeholder="e.g. finance.exec" />
        <FormField label="Due date" value={due} onChange={setDue} placeholder="2026-10-20" />
        <PrimaryButton label="Assign + resolve (mock)" onPress={resolve} />
      </DetailDrawer>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  h: { ...type.headline, color: palette.text, marginTop: 20, marginBottom: 10, fontFamily: fontStack } as never,
  step: { ...type.footnote, color: palette.text, fontWeight: '600', fontFamily: fontStack } as never,
  stepSub: { ...type.caption1, color: palette.text3, marginTop: 2, fontFamily: fontStack } as never,
  link: { color: palette.tint, fontWeight: '700', fontFamily: fontStack },
  closeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: palette.borderStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.card },
});
