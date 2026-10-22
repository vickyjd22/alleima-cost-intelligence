import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { SearchField, PeriodSelector } from '../../src/components/Filters';
import { ChartCard } from '../../src/components/CostingPanels';
import { AuditPanel } from '../../src/components/Governance';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { ExportButton } from '../../src/components/ExportButton';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useSession } from '../../src/store/session';
import { auditLog } from '../../src/lib/audit';
import { YIELD_DICT, LOSS_TREATMENT, GROUP_VARIANCES, CRA1, RACI, COST_SHEET_LINES, CLOSE_CHECKLIST, VARIANCE_FORM } from '../../src/mocks/manual';
import { tokens } from '../../src/theme/tokens';

const TOP5: [string, string, string][] = [
  ['T-501 HF-3 ECT-LINE', '8 kg', '₹41,600'], ['T-502 CF-2 DIM-OD', '5 kg', '₹28,750'],
  ['T-488 HF-6 cutting loss', '22 kg', '₹19,800'], ['T-495 CF-4 anneal scale', '14 kg', '₹15,400'],
  ['T-490 UB DPT reject', '3 pcs', '₹11,200'],
];

const REPORTS = [
  { id: 'annexA', title: 'Annex A — Standard Product Cost Sheet (14 lines)', rows: COST_SHEET_LINES.map((l) => [l, 'std', 'actual', 'var']), head: ['element', 'std', 'actual', 'variance'] },
  { id: 'annexB', title: 'Annex B — Monthly Close Checklist (18 items)', rows: CLOSE_CHECKLIST.map((c) => [c, 'pending']), head: ['item', 'status'] },
  { id: 'annexD', title: 'Annex D — Variance Investigation Form', rows: VARIANCE_FORM.map((f) => [f, 'SO-1042 · MPV −₹15,000 · owner costing.mgr']), head: ['field', 'sample entry'] },
  { id: 'yield', title: '§14 Yield dictionary + top-5 losses', rows: [...YIELD_DICT.map(([m, d]) => [m, d]), ...TOP5.map(([w, q, v]) => [`LOSS ${w}`, `${q} · ${v}`])], head: ['measure', 'definition'] },
  { id: 'group', title: '§23.2 Group variance categories (10)', rows: GROUP_VARIANCES.map((g) => [g, 'period + total']), head: ['category', 'columns'] },
  { id: 'cra1', title: '§21.1 CRA-1 readiness matrix (13 areas)', rows: CRA1.map(([a, r, f]) => [a, r, f]), head: ['area', 'record', 'frequency'] },
  { id: 'raci', title: '§22.1 RACI', rows: RACI.map(([a, o, c, f, q, s, m]) => [a, o, c, f, q, s, m]), head: ['activity', 'ops', 'costing', 'finance', 'quality', 'scm', 'mgmt'] },
  { id: 'loss', title: '§14.2 Loss treatment', rows: LOSS_TREATMENT.map(([l, t]) => [l, t]), head: ['loss', 'treatment'] },
  { id: 'audit', title: 'Approval + audit history export', rows: auditLog().map((a) => [a.at, a.actor, a.action, a.detail]), head: ['at', 'actor', 'action', 'detail'] },
];

export default function Reports() {
  const { roles } = useSession();
  const loading = useMockLoading();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<(typeof REPORTS)[number] | null>(null);
  const rows = REPORTS.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell roles={roles}>
      <PageHeader title="Reports & Analytics (§14/§20/§21/§22/§23 + Annexes)" sub="Every chart titled + unit-labelled with a route to underlying data" right={<PeriodSelector />} />
      <SearchField value={q} onChange={setQ} placeholder="Search reports…" />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ marginTop: 12 }}>
          {rows.map((r) => (
            <View key={r.id} style={styles.card}>
              <Pressable style={{ flex: 1 }} onPress={() => setOpen(r)}>
                <Text style={styles.t}>• {r.title} ({r.rows.length} rows)</Text>
              </Pressable>
              <ExportButton filename={`${r.id}-sample.csv`} headers={r.head} rows={r.rows} />
            </View>
          ))}
        </View>
      )}
      <ChartCard title="Top-5 yield losses by value — SAMPLE (§14.3)" bars={[{ label: 'T-501 ₹41.6k', pct: 100 }, { label: 'T-502 ₹28.8k', pct: 69 }, { label: 'T-488 ₹19.8k', pct: 48 }, { label: 'T-495 ₹15.4k', pct: 37 }, { label: 'T-490 ₹11.2k', pct: 27 }]} />
      <Text style={styles.note}>Persistent yield variance triggers BOM/routing/standard review — never just an accounting adjustment (§14.3). Variance signs per approved group logic; manual reclassification separately evidenced (§20.3).</Text>
      <AuditPanel entries={auditLog().slice(0, 5).map((a) => ({ at: a.at, actor: a.actor, action: a.action, detail: a.detail }))} />
      <DetailDrawer visible={open !== null} title={open?.title ?? ''} onClose={() => setOpen(null)}>
        <KeyVal k="Rows" v={String(open?.rows.length ?? 0)} />
        <KeyVal k="Source" v="Cost runs + ledger + SOPIC + masters (mock)" />
        <KeyVal k="Reproducibility" v="Frozen source data + versioned rates (§21.2)" />
      </DetailDrawer>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: tokens.color.border, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  t: { color: tokens.color.text, fontWeight: '600', flex: 1 },
  note: { color: tokens.color.text2, fontSize: 12, marginTop: 8 },
});
