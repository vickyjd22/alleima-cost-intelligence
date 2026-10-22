import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { SearchField, PeriodSelector } from '../../src/components/Filters';
import { ChartCard } from '../../src/components/CostingPanels';
import { AuditPanel } from '../../src/components/Governance';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { ExportButton } from '../../src/components/ExportButton';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { Callout, Card, EmptyState, SectionHeader } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { useSession } from '../../src/store/session';
import { auditLog } from '../../src/lib/audit';
import { YIELD_DICT, LOSS_TREATMENT, GROUP_VARIANCES, CRA1, RACI, COST_SHEET_LINES, CLOSE_CHECKLIST, VARIANCE_FORM } from '../../src/mocks/manual';
import { fontStack, palette, type } from '../../src/theme/tokens';

const TOP5: [string, string, string][] = [
  ['T-501 HF-3 ECT-LINE', '8 kg', '₹41,600'], ['T-502 CF-2 DIM-OD', '5 kg', '₹28,750'],
  ['T-488 HF-6 cutting loss', '22 kg', '₹19,800'], ['T-495 CF-4 anneal scale', '14 kg', '₹15,400'],
  ['T-490 UB DPT reject', '3 pcs', '₹11,200'],
];

const REPORTS = [
  { id: 'annexA', title: 'Annex A — Standard Product Cost Sheet', rows: COST_SHEET_LINES.map((l) => [l, 'std', 'actual', 'var']), head: ['element', 'std', 'actual', 'variance'] },
  { id: 'annexB', title: 'Annex B — Monthly Close Checklist', rows: CLOSE_CHECKLIST.map((c) => [c, 'pending']), head: ['item', 'status'] },
  { id: 'annexD', title: 'Annex D — Variance Investigation Form', rows: VARIANCE_FORM.map((f) => [f, 'SO-1042 · MPV −₹15,000 · owner costing.mgr']), head: ['field', 'sample entry'] },
  { id: 'yield', title: '§14 Yield dictionary + top-5 losses', rows: [...YIELD_DICT.map(([m, d]) => [m, d]), ...TOP5.map(([w, q, v]) => [`LOSS ${w}`, `${q} · ${v}`])], head: ['measure', 'definition'] },
  { id: 'group', title: '§23.2 Group variance categories', rows: GROUP_VARIANCES.map((g) => [g, 'period + total']), head: ['category', 'columns'] },
  { id: 'cra1', title: '§21.1 CRA-1 readiness matrix', rows: CRA1.map(([a, r, f]) => [a, r, f]), head: ['area', 'record', 'frequency'] },
  { id: 'raci', title: '§22.1 Responsibility matrix (RACI)', rows: RACI.map(([a, o, c, f, q, s, m]) => [a, o, c, f, q, s, m]), head: ['activity', 'ops', 'costing', 'finance', 'quality', 'scm', 'mgmt'] },
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
      <PageHeader
        eyebrow="Analytics"
        title="Reports & annexes"
        sub="Every chart is titled and unit-labelled, with a route back to the underlying records."
        right={<PeriodSelector />}
      />

      <View style={styles.toolbar}>
        <SearchField value={q} onChange={setQ} placeholder="Search reports…" />
        <Text style={styles.count}>{rows.length} of {REPORTS.length} reports</Text>
      </View>

      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 8 }}>
          {rows.length === 0 ? (
            <EmptyState icon="fileSearch" title="No matching reports" description="Try a different term, or clear the search." />
          ) : null}
          {rows.map((r) => (
            <Card key={r.id} padded={false}>
              <View style={styles.row}>
                <Pressable style={styles.rowMain} onPress={() => setOpen(r)} accessibilityRole="button" accessibilityLabel={r.title}>
                  <View style={styles.icon}>
                    <Icon name="fileText" size={16} color={palette.tint} strokeWidth={1.9} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.t} numberOfLines={1}>{r.title}</Text>
                    <Text style={styles.s}>{r.rows.length} rows · SAMPLE</Text>
                  </View>
                  <Icon name="chevronRight" size={15} color={palette.text3} />
                </Pressable>
                <ExportButton filename={`${r.id}-sample.csv`} headers={r.head} rows={r.rows} />
              </View>
            </Card>
          ))}
        </View>
      )}

      <SectionHeader title="Top-5 yield losses by value" description="SAMPLE (§14.3) — persistent variance triggers BOM, routing and standard review." style={{ marginTop: 24 }} />
      <ChartCard title="Yield losses" hint="₹ value, descending" bars={[{ label: 'T-501 ₹41.6k', pct: 100 }, { label: 'T-502 ₹28.8k', pct: 69 }, { label: 'T-488 ₹19.8k', pct: 48 }, { label: 'T-495 ₹15.4k', pct: 37 }, { label: 'T-490 ₹11.2k', pct: 27 }]} />
      <View style={{ marginTop: 14 }}>
        <Callout tone="neutral" compact>
          Variance signs follow approved group logic; manual reclassification is separately evidenced (§20.3). Never adjust only in accounting — fix the source standard.
        </Callout>
      </View>
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
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  count: { ...type.caption1, color: palette.text3, fontFamily: fontStack } as never,
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, flexWrap: 'wrap' },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 220, cursor: 'pointer' } as never,
  icon: { width: 32, height: 32, borderRadius: 9, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  t: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  s: { ...type.caption1, color: palette.text3, marginTop: 1, fontFamily: fontStack } as never,
});
