import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { KpiCard } from '../../src/components/KpiCard';
import { ChartCard } from '../../src/components/CostingPanels';
import { StatusChip } from '../../src/components/StatusChip';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { PeriodSelector } from '../../src/components/Filters';
import { PageHeader } from '../../src/components/PageHeader';
import { useSession } from '../../src/store/session';
import { reconcileSopic } from '../../src/lib/reconciliation';
import { closeProgress } from '../../src/lib/close';
import { demoDb } from '../../src/mocks/demo';
import { KNOWN_PCS } from '../../src/data/sample';
import { KPI_TRIGGERS } from '../../src/mocks/manual';
import { tokens } from '../../src/theme/tokens';

/** §23 management dashboard: controllable cost + operational drivers, 4 quadrants. */
const QUADS: { title: string; sub: string; cards: [string, string, string, 'ok' | 'warn' | 'error' | undefined, string][] }[] = [
  { title: 'RM/kg — Material', sub: 'Price + usage variance (§6.3)', cards: [['RM cost/kg', '₹512', '/kg', 'ok', '/(app)/costing'], ['MPV', '−₹15,000', '', 'warn', '/(app)/costing'], ['MUV', '−₹10,400', '', 'warn', '/(app)/costing']] },
  { title: 'Yield % — Process', sub: 'Plan vs actual (§14)', cards: [['Yield', '94.2', '%', 'warn', '/(app)/reports'], ['Rework %', '0.8', '%', 'warn', '/(app)/quality'], ['Rejection %', '0.6', '%', 'ok', '/(app)/quality']] },
  { title: 'Conv./kg — Conversion', sub: 'Machine + labour + OH (§15)', cards: [['Conv./kg', '—', '*', undefined, '/(app)/costing'], ['Loading %', '88', '%', 'ok', '/(app)/engineering'], ['Breakdown %', '6.1', '%', 'error', '/(app)/engineering']] },
  { title: 'Margin % — Commercial', sub: 'Order/customer profitability (§19)', cards: [['Order margin', '25.1', '%', 'ok', '/(app)/reports'], ['Open exceptions', '7', '', 'error', '/(app)/approvals'], ['WIP >30d', '3', 'lots', 'warn', '/(app)/inventory']] },
];

export default function Overview() {
  const router = useRouter();
  const { roles, period } = useSession();
  const loading = useMockLoading();
  const rec = reconcileSopic(demoDb.sopic, KNOWN_PCS);
  const pct = closeProgress({ 'D+1–D+2': 'done' });

  return (
    <AppShell roles={roles}>
      <PageHeader title="Management Dashboard — Mehsana (§23)" sub={`Period ${period} · SAMPLE DATA · triggers, not statutory limits`} right={<PeriodSelector />} />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View>
          <View style={styles.row}>
            <StatusChip label={`SOPIC matched ${rec.matched.length}`} tone="ok" />
            <StatusChip label={`Invoice-0 ${rec.invoiceZeroExceptions.length}`} tone="error" />
            <StatusChip label={`PC review ${rec.pcExceptions.length}`} tone="warn" />
            <StatusChip label={`Close ${pct}%`} tone="info" />
          </View>
          {QUADS.map((q) => (
            <View key={q.title} style={styles.quad}>
              <Text style={styles.qt}>{q.title}</Text>
              <Text style={styles.qs}>{q.sub}</Text>
              <View style={styles.grid}>
                {q.cards.map(([t, v, u, s, route]) => (
                  <Pressable key={t} style={styles.cell} onPress={() => router.push(route as never)}>
                    <KpiCard title={t} value={v} unit={u} status={s} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
          <Pressable onPress={() => router.push('/(app)/finance' as never)}>
            <ChartCard title="SAMPLE — Yield by flow (tap for reconciliation)" bars={[{ label: 'HF 93.1%', pct: 93 }, { label: 'CF 95.4%', pct: 95 }, { label: 'U-Bend 97.0%', pct: 97 }]} />
          </Pressable>
          <Text style={styles.note}>
            Triggers (§23): {KPI_TRIGGERS.slice(0, 6).map((k) => `${k[0]} ${k[2]}`).join(' · ')} — full register in Reports. * Conversion gated until a cost run is approved.
          </Text>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  quad: { backgroundColor: tokens.color.card, borderRadius: 16, borderWidth: 1, borderColor: tokens.color.border, padding: 12, marginBottom: 12 },
  qt: { fontSize: 15, fontWeight: '700', color: tokens.color.text },
  qs: { fontSize: 12, color: tokens.color.text2, marginBottom: 8 },
  grid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  cell: { flex: 1, minWidth: 150 },
  note: { color: tokens.color.text2, marginTop: 8, fontSize: 12 },
});
