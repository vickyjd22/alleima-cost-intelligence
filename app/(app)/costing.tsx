import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { PeriodSelector } from '../../src/components/Filters';
import { StatusChip } from '../../src/components/StatusChip';
import { CostBreakdownPanel, TraceabilityTimeline } from '../../src/components/CostingPanels';
import { ApprovalTimeline } from '../../src/components/Governance';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { useSession } from '../../src/store/session';
import { machineHourRate, materialPriceVariance, materialUsageVariance, yieldPct } from '../../src/lib/costing';
import { audit } from '../../src/lib/audit';
import { DRIVER_MATRIX, OVERHEAD_MATRIX, ABNORMAL_ITEMS, WATERFALL, PROFIT_DIMS } from '../../src/mocks/manual';
import { tokens } from '../../src/theme/tokens';

/** Costing: §7/§15 workbench · §15 allocation · §16/§17 overheads · §19 quotation. Candidate math, SAMPLE only. */
const TABS = ['Workbench', 'Allocation §15', 'Overheads §16/17', 'Quotation §19'] as const;

const VERSIONS = [
  { id: 'v3', label: 'v3 approved/locked', rm: 520000, conv: 214400, status: 'approved' },
  { id: 'v2', label: 'v2 submitted', rm: 518000, conv: 216100, status: 'submitted' },
  { id: 'v1', label: 'v1 draft', rm: 515000, conv: 219800, status: 'draft' },
];
const LINES = [
  { id: 'rm', el: 'Standard RM (SAMPLE)', std: '₹ 520,000', act: '₹ 535,000', var: '−₹15,000 MPV', tone: 'warn' as const, trace: 'Rate version LAB-2026-10 · 1,000 kg @ ₹520 std vs ₹535 landed · Source: GRN-441 + SOPIC-10' },
  { id: 'mc', el: 'Machine (SAMPLE)', std: '₹ 200.00/hr × 6000', act: '₹ 204.10/hr × 5980', var: '+2.0%', tone: 'warn' as const, trace: 'MHR version MHR-2026-10 · Practical hrs 6,000 · CAS-2 Rev 2024' },
  { id: 'lb', el: 'Direct labour (SAMPLE)', std: '1,180 hrs × rate', act: '1,205 hrs · OT 22h traced', var: '+2.1%', tone: 'warn' as const, trace: 'Rate = eligible direct cost ÷ practical productive hrs (§8.3) · OT assigned to WO-881' },
  { id: 'yl', el: 'Yield impact 94.2% (SAMPLE)', std: '980 kg expected', act: '942 kg good', var: '−38 kg MUV', tone: 'error' as const, trace: 'Traveller T-501 HF-3 · ECT-LINE 8kg · Plan yield 98%' },
  { id: 'oh', el: 'Overheads (SAMPLE)', std: 'allocated', act: 'allocated', var: 'pool Δ ₹0', tone: 'ok' as const, trace: 'Driver matrix §15.2 · Service pools via CAS-13 benefit basis' },
];

export default function Costing() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Workbench');
  const [status, setStatus] = useState<'draft' | 'submitted' | 'approved'>('draft');
  const [compare, setCompare] = useState(false);
  const [imbalance, setImbalance] = useState(false);
  const [trace, setTrace] = useState<(typeof LINES)[number] | null>(null);
  const [metal, setMetal] = useState(520);
  const [yld, setYld] = useState(94);
  const [fx, setFx] = useState(83.5);
  const [conv, setConv] = useState(214);
  const mhr = machineHourRate({ annualAllocableCost: 1200000, practicalHours: 6000 });

  function submit(): void {
    setStatus('submitted');
    audit(email ?? 'demo', 'costrun.submit', 'SAMPLE run submitted');
    toast.show('Cost run submitted for review (mock — Functions enforce in production).');
  }
  function approve(): void {
    if (imbalance) {
      toast.show('Blocked: pool-vs-allocated = ₹250 ≠ 0. Resolve before close (§15.3).');
      return;
    }
    setStatus('approved');
    audit(email ?? 'demo', 'costrun.approve', 'SAMPLE run approved + locked');
    toast.show('Approved + locked (mock).');
  }

  const quote = Math.round(metal / (yld / 100) + conv + 12 + 8 + (fx - 83.5) * 40);
  const sens: [string, number][] = [
    ['Metal +10%', Math.round(metal * 1.1 / (yld / 100) + conv + 20 + (fx - 83.5) * 40)],
    ['Yield −2pp', Math.round(metal / ((yld - 2) / 100) + conv + 20 + (fx - 83.5) * 40)],
    ['FX +5%', Math.round(metal / (yld / 100) + conv + 20 + (fx * 1.05 - 83.5) * 40)],
  ];

  return (
    <AppShell roles={roles}>
      <PageHeader title="Costing Workbench" sub="§1 formula: RM + Conversion + Quality/Testing + Packing + Prod OH ± WIP" right={<PeriodSelector />} />
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t ? styles.on : null]}>
            <Text style={[styles.tabT, tab === t ? styles.onT : null]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <Skeleton lines={5} />
      ) : tab === 'Workbench' ? (
        <View>
          <View style={styles.row}>
            <StatusChip label={`SAMPLE MHR ${mhr}/hr`} tone="info" />
            <StatusChip label={`MPV ${materialPriceVariance(1000, 520, 535)}`} tone="warn" />
            <StatusChip label={`MUV ${materialUsageVariance(980, 1000, 520)}`} tone="warn" />
            <StatusChip label={`Yield ${yieldPct(942, 1000)}%`} tone="ok" />
            <StatusChip label={status} tone={status === 'approved' ? 'ok' : 'neutral'} />
            <Pressable onPress={() => setCompare(!compare)}><Text style={styles.link}>{compare ? 'Hide' : 'Compare'} v3 vs v2</Text></Pressable>
          </View>
          {compare ? (
            <DataTable columns={[{ key: 'v', header: 'Version', render: (r) => <Text>{r.label}</Text> }, { key: 'rm', header: 'RM ₹', render: (r) => <Text>{String(r.rm)}</Text> }, { key: 'c', header: 'Conv ₹', render: (r) => <Text>{String(r.conv)}</Text> }, { key: 't', header: 'Total ₹', render: (r) => <Text>{String(r.rm + r.conv)}</Text> }]} rows={VERSIONS} />
          ) : null}
          <DataTable
            columns={[
              { key: 'el', header: 'Element', width: 200, render: (r) => <Text>{r.el}</Text> },
              { key: 's', header: 'Standard', render: (r) => <Text>{r.std}</Text> },
              { key: 'a', header: 'Actual', render: (r) => <Text>{r.act}</Text> },
              { key: 'v', header: 'Variance', render: (r) => <StatusChip label={r.var} tone={r.tone} /> },
              { key: 't', header: 'Trace', render: (r) => <Pressable onPress={() => setTrace(r)}><Text style={styles.link}>Inspect</Text></Pressable> },
            ]}
            rows={LINES}
          />
          <CostBreakdownPanel lines={[{ label: 'Idle labour (SAMPLE)', value: 'Normal 64h in rate · abnormal 18h excluded (§8.4)' }, { label: 'Idle capacity (SAMPLE)', value: 'Practical 6,000h · actual 5,640h · idle visible (§9.3)' }, { label: 'inputsHash', value: 'a91f…c2 (SAMPLE)' }]} />
          <TraceabilityTimeline steps={['ORDER SO-1042', 'WO-881 → HEAT H-771', 'Traveller T-501 HF→CF', 'WIP → FG → Dispatch']} />
          <ApprovalTimeline steps={[{ label: 'Calculate (Costing)', state: 'done', by: 'costing.mgr' }, { label: 'Submit for review', state: status === 'draft' ? 'now' : 'done' }, { label: 'Approve + lock (Finance)', state: status === 'approved' ? 'done' : 'todo' }]} />
          <View style={styles.row}>
            <Pressable style={styles.btn} onPress={submit}><Text style={styles.btnT}>Submit (mock)</Text></Pressable>
            <Pressable style={[styles.btn, styles.btn2]} onPress={approve}><Text style={styles.btnT}>Approve + lock (mock)</Text></Pressable>
          </View>
        </View>
      ) : tab === 'Allocation §15' ? (
        <View>
          <Text style={styles.h}>Conversion = Machine + Direct Labour + Consumables + Other Direct + Prod OH (§15.1)</Text>
          <DataTable columns={[{ key: 'p', header: 'Cost pool', width: 180, render: (r) => <Text>{r.pool}</Text> }, { key: 'a', header: 'Primary driver', width: 240, render: (r) => <Text>{r.pri}</Text> }, { key: 'b', header: 'Secondary', width: 240, render: (r) => <Text>{r.sec}</Text> }]} rows={DRIVER_MATRIX.map(([pool, pri, sec], i) => ({ id: `d${i}`, pool, pri, sec }))} />
          <CostBreakdownPanel lines={[{ label: 'HF/Big/Small flow pools', value: imbalance ? 'allocated − source = ₹250 — INVESTIGATE (§15.3)' : 'allocated − source = ₹0 ✓' }, { label: 'Ledger → CC → product bridge', value: 'variance bridge present (mock)' }]} />
          <Pressable onPress={() => setImbalance(!imbalance)}><Text style={styles.link}>{imbalance ? 'Clear' : 'Simulate'} ₹250 pool imbalance (blocks Approve)</Text></Pressable>
          <Text style={styles.note}>Hierarchy (§1): direct traceability → causal driver → benefit received → reasonable proxy, documented + consistent. No cost allocated merely because it is available.</Text>
        </View>
      ) : tab === 'Overheads §16/17' ? (
        <View>
          <DataTable columns={[{ key: 'c', header: 'Category', width: 200, render: (r) => <Text>{r.cat}</Text> }, { key: 'a', header: 'Preferred assignment', width: 380, render: (r) => <Text>{r.asn}</Text> }]} rows={OVERHEAD_MATRIX.map(([cat, asn], i) => ({ id: `o${i}`, cat, asn }))} />
          <Text style={styles.note}>Admin overhead treated as fixed; production-related admin distinguished from corporate (§16.2). Avoid %‑on‑sales where an operational driver exists (CAS discipline).</Text>
          <Text style={styles.h}>Abnormal & non-cost items — kept OUT of normal cost (§17.5, CAS-17 bridge for finance cost)</Text>
          <DataTable columns={[{ key: 'i', header: 'Item', width: 220, render: (r) => <Text>{r.item}</Text> }, { key: 't', header: 'Treatment', width: 360, render: (r) => <Text>{r.tr}</Text> }]} rows={ABNORMAL_ITEMS.map(([item, tr], i) => ({ id: `a${i}`, item, tr }))} />
        </View>
      ) : (
        <View>
          <Text style={styles.h}>Quotation costing (§19.3) — std material + route yield/conversion + customer specifics</Text>
          {([['Metal rate ₹/kg', metal, setMetal, 10], ['Yield %', yld, setYld, 1], ['FX ₹/$', fx, setFx, 0.5], ['Conversion ₹/kg', conv, setConv, 5]] as const).map(([label, v, set, step]) => (
            <View key={label} style={styles.qrow}>
              <Text style={styles.qlabel}>{label}: {v}</Text>
              <View style={styles.qbtns}>
                <Pressable onPress={() => set(Number((v - step).toFixed(2)))} style={styles.qbtn}><Text style={styles.qbtnT}>−</Text></Pressable>
                <Pressable onPress={() => set(Number((v + step).toFixed(2)))} style={styles.qbtn}><Text style={styles.qbtnT}>+</Text></Pressable>
              </View>
            </View>
          ))}
          <CostBreakdownPanel lines={[{ label: 'Indicative price ₹/kg (SAMPLE)', value: `₹${quote}` }, ...sens.map(([k, val]) => ({ label: `${k} (SAMPLE)`, value: `₹${val}` }))]} />
          <Text style={styles.h}>Margin waterfall (§19.1)</Text>
          <Text style={styles.li}>{WATERFALL.join('  ')}</Text>
          <Text style={styles.h}>Profitability dimensions (§19.2)</Text>
          {PROFIT_DIMS.map(([d, v]) => <Text key={d} style={styles.li}>• {d}: {v}</Text>)}
          <Text style={styles.note}>Customer specifics (dimensions, 100% ECT/hydro, EN 10204/3.2, special packing, tolerances) feed this template — never hidden in a generic rate. Freight/commission only when relevant to the decision.</Text>
        </View>
      )}
      <DetailDrawer visible={trace !== null} title={trace?.el ?? ''} onClose={() => setTrace(null)}>
        <KeyVal k="Calculation trace" v={trace?.trace ?? ''} />
        <KeyVal k="Policy" v="Manual driver matrix · CAS-2/CAS-6/CAS-7" />
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
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' },
  link: { color: tokens.color.primary, fontWeight: '700', fontSize: 13 },
  btn: { backgroundColor: tokens.color.primary, borderRadius: 10, padding: 12 },
  btn2: { backgroundColor: tokens.color.dark },
  btnT: { color: '#fff', fontWeight: '700' },
  h: { fontWeight: '700', color: tokens.color.text, marginTop: 16, marginBottom: 8 },
  li: { fontSize: 13, color: tokens.color.text, paddingVertical: 2 },
  note: { color: tokens.color.text2, fontSize: 12, marginTop: 8 },
  qrow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: tokens.color.border, padding: 10, marginBottom: 8 },
  qlabel: { fontWeight: '700', color: tokens.color.text },
  qbtns: { flexDirection: 'row', gap: 8 },
  qbtn: { backgroundColor: tokens.color.bg, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: tokens.color.border },
  qbtnT: { fontWeight: '800', fontSize: 16, color: tokens.color.primary },
});
