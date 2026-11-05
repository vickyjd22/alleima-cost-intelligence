import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { PeriodSelector } from '../../src/components/Filters';
import { DataTable, type Column } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { KpiCard } from '../../src/components/KpiCard';
import { DetailDrawer } from '../../src/components/DetailDrawer';
import { FormField } from '../../src/components/FormField';
import { useToast } from '../../src/components/Toast';
import { Button, Card, DeltaPill, SectionHeader } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { VARIANCES, STD_COST_OF_OUTPUT, ACTUAL_COST, inr, lakh, type VarianceRow } from '../../src/mocks/costingDemo';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

export default function VarianceAnalysis() {
  const { roles } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [open, setOpen] = useState<VarianceRow | null>(null);

  // Signed variances: favourable = std > actual for the segment.
  const segments = VARIANCES.map((v) => ({ ...v, delta: v.std - v.actual }));
  const net = STD_COST_OF_OUTPUT - ACTUAL_COST;
  const maxAbs = Math.max(...segments.map((s) => Math.abs(s.delta)), 1);

  const cols: Column<VarianceRow & { id: string }>[] = [
    { key: 'type', header: 'Variance', width: 150, render: (v) => <Text style={styles.cell}>{v.type}</Text> },
    { key: 'key', header: 'Key', width: 180, render: (v) => <Text style={styles.sub}>{v.key}</Text> },
    { key: 'std', header: 'Standard', width: 120, align: 'right', render: (v) => <Text style={styles.sub}>{inr(v.std)}</Text> },
    { key: 'actual', header: 'Actual', width: 120, align: 'right', render: (v) => <Text style={styles.sub}>{inr(v.actual)}</Text> },
    { key: 'var', header: 'Variance', width: 140, align: 'right', render: (v) => {
      const d = v.std - v.actual;
      return <StatusChip label={`${d >= 0 ? 'Fav' : 'Adv'} ${inr(Math.abs(d))}`} tone={d >= 0 ? 'ok' : 'error'} />;
    } },
    { key: 'owner', header: 'Root-cause owner', width: 130, render: (v) => <Text style={styles.sub}>{v.rootCauseOwner}</Text> },
  ];

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Costing"
        title="Variance Analysis"
        sub="Interactive bridge from standard to actual cost. Tap a segment to drill in. SAMPLE data."
        right={<PeriodSelector />}
      />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 16 }}>
          <View style={styles.kpis}>
            <KpiCard title="Std cost of output" value={lakh(STD_COST_OF_OUTPUT)} icon="scale" />
            <KpiCard title="Actual cost" value={lakh(ACTUAL_COST)} icon="wallet" />
            <KpiCard title="Net variance" value={`${net >= 0 ? '+' : ''}${inr(net)}`} status={net >= 0 ? 'ok' : 'error'} icon="activity" hint={net >= 0 ? 'Favourable' : 'Adverse'} />
          </View>

          <Card style={{ gap: 10 }}>
            <SectionHeader title="Cost bridge" description="Standard → variances → Actual. Tap a bar for the detail." />
            <BridgeBar label="Standard cost of output" value={lakh(STD_COST_OF_OUTPUT)} pct={100} tone="neutral" />
            {segments.map((s) => (
              <Pressable key={s.type} onPress={() => setOpen(s)} accessibilityRole="button" accessibilityLabel={`${s.type} variance detail`}>
                <BridgeBar
                  label={`${s.delta >= 0 ? '▲ fav' : '▼ adv'} ${s.type}`}
                  value={`${s.delta >= 0 ? '+' : '−'}${inr(Math.abs(s.delta))}`}
                  pct={Math.round((Math.abs(s.delta) / maxAbs) * 100)}
                  tone={s.delta >= 0 ? 'ok' : 'error'}
                />
              </Pressable>
            ))}
            <BridgeBar label="Actual cost" value={lakh(ACTUAL_COST)} pct={100} tone="info" />
          </Card>

          <SectionHeader title="Variance lines" description="Largest adverse first in production." />
          <DataTable columns={cols} rows={segments.map((s) => ({ ...s, id: s.type }))} onRowPress={(r) => setOpen(r)} emptyText="No variances" />
        </View>
      )}

      <DetailDrawer visible={!!open} title={open ? `${open.type} variance` : ''} onClose={() => setOpen(null)}>
        {open ? (
          <View style={{ gap: 12 }}>
            <View style={styles.drawerHead}>
              <Text style={styles.sub}>{open.key}</Text>
              <DeltaPill value={`${open.std - open.actual >= 0 ? '+' : '−'}${inr(Math.abs(open.std - open.actual))}`} tone={open.std - open.actual >= 0 ? 'down' : 'up'} label={open.std - open.actual >= 0 ? 'favourable' : 'adverse'} />
            </View>
            <SectionHeader title="Annex D investigation" description="Record the root cause and corrective action." />
            <FormField label="Root cause" value="Tool wear / feed rate" onChange={() => undefined} />
            <FormField label="Corrective action" value="Replace tooling; tighten feed-rate SOP" onChange={() => undefined} />
            <FormField label="Owner" value={open.rootCauseOwner} onChange={() => undefined} />
            <FormField label="Due date" value="2026-11-02" onChange={() => undefined} />
            <Button label="Save & assign" icon="check" onPress={() => { setOpen(null); toast.show('Investigation assigned (SAMPLE).'); }} fullWidth />
          </View>
        ) : null}
      </DetailDrawer>
    </AppShell>
  );
}

function BridgeBar({ label, value, pct, tone }: { label: string; value: string; pct: number; tone: 'neutral' | 'ok' | 'error' | 'info' }) {
  const color = tone === 'ok' ? palette.success : tone === 'error' ? palette.error : tone === 'info' ? palette.tint : palette.text3;
  return (
    <View style={styles.bar}>
      <View style={styles.barHead}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={[styles.barValue, { color }]}>{value}</Text>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(3, pct)}%`, backgroundColor: color }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  kpis: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  cell: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
  bar: { gap: 5 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  barLabel: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  barValue: { ...type.caption1, fontWeight: '700', fontFamily: fontStack } as never,
  track: { height: 10, backgroundColor: palette.bgAlt, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: 10, borderRadius: radius.pill },
  drawerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
});
