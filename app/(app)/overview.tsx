import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { KpiCard } from '../../src/components/KpiCard';
import { ChartCard } from '../../src/components/CostingPanels';
import { StatusChip } from '../../src/components/StatusChip';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { PeriodSelector } from '../../src/components/Filters';
import { PageHeader } from '../../src/components/PageHeader';
import { Card, Callout, ProgressRing } from '../../src/components/ui';
import { Icon, type IconName } from '../../src/components/Icon';
import { useSession } from '../../src/store/session';
import { reconcileSopic } from '../../src/lib/reconciliation';
import { closeProgress } from '../../src/lib/close';
import { demoDb } from '../../src/mocks/demo';
import { KNOWN_PCS } from '../../src/data/sample';
import { KPI_TRIGGERS } from '../../src/mocks/manual';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

type Kpi = [string, string, string, 'ok' | 'warn' | 'error' | undefined, string];

const QUADS: { title: string; sub: string; icon: IconName; cards: Kpi[] }[] = [
  {
    title: 'Material',
    sub: 'RM/kg · price and usage variance',
    icon: 'package',
    cards: [
      ['RM cost/kg', '₹512', '/kg', 'ok', '/(app)/costing'],
      ['Price variance', '−₹15,000', '', 'warn', '/(app)/costing'],
      ['Usage variance', '−₹10,400', '', 'warn', '/(app)/costing'],
    ],
  },
  {
    title: 'Process',
    sub: 'Yield plan versus actual',
    icon: 'gauge',
    cards: [
      ['Yield', '94.2', '%', 'warn', '/(app)/reports'],
      ['Rework', '0.8', '%', 'warn', '/(app)/quality'],
      ['Rejection', '0.6', '%', 'ok', '/(app)/quality'],
    ],
  },
  {
    title: 'Conversion',
    sub: 'Machine, labour and overhead',
    icon: 'factory',
    cards: [
      ['Conv./kg', '—', '*', undefined, '/(app)/costing'],
      ['Loading', '88', '%', 'ok', '/(app)/engineering'],
      ['Breakdown', '6.1', '%', 'error', '/(app)/engineering'],
    ],
  },
  {
    title: 'Commercial',
    sub: 'Order and customer profitability',
    icon: 'trendingUp',
    cards: [
      ['Order margin', '25.1', '%', 'ok', '/(app)/reports'],
      ['Open exceptions', '7', '', 'error', '/(app)/approvals'],
      ['WIP over 30d', '3', 'lots', 'warn', '/(app)/inventory'],
    ],
  },
];

const ICONS: Record<string, IconName> = {
  'RM cost/kg': 'package',
  'Price variance': 'scale',
  'Usage variance': 'scale',
  Yield: 'gauge',
  Rework: 'rotateCcw',
  Rejection: 'ban',
  'Conv./kg': 'factory',
  Loading: 'activity',
  Breakdown: 'wrench',
  'Order margin': 'trendingUp',
  'Open exceptions': 'alertCircle',
  'WIP over 30d': 'clock',
};

export default function Overview() {
  const router = useRouter();
  const { roles, period } = useSession();
  const { width } = useWindowDimensions();
  const loading = useMockLoading();
  const rec = reconcileSopic(demoDb.sopic, KNOWN_PCS);
  const pct = closeProgress({ 'D+1–D+2': 'done' });
  const twoCol = width >= 1180;

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Management dashboard"
        title="Cost control at a glance"
        sub={`Mehsana plant · period ${period} · illustrative SAMPLE data. Triggers guide attention; they are not statutory limits.`}
        right={<PeriodSelector />}
      />

      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 18 }}>
          <Card style={styles.health}>
            <View style={styles.healthHead}>
              <View style={styles.healthIcon}>
                <Icon name="shieldCheck" size={18} color={palette.tint} strokeWidth={1.9} />
              </View>
              <View style={{ flex: 1, minWidth: 180 }}>
                <Text style={styles.healthTitle}>Reconciliation & close</Text>
                <Text style={styles.healthSub}>Source systems tied to SOPIC before commentary is issued</Text>
              </View>
              <View style={styles.healthChips}>
                <StatusChip label={`SOPIC matched ${rec.matched.length}`} tone="ok" />
                <StatusChip label={`Invoice-0 ${rec.invoiceZeroExceptions.length}`} tone="error" />
                <StatusChip label={`PC review ${rec.pcExceptions.length}`} tone="warn" />
              </View>
            </View>
            <View style={styles.healthStats}>
              <HealthStat label="Matched lines" value={String(rec.matched.length)} tone="ok" />
              <HealthStat label="Invoice-0 exceptions" value={String(rec.invoiceZeroExceptions.length)} tone="error" />
              <HealthStat label="PCs awaiting review" value={String(rec.pcExceptions.length)} tone="warn" />
              <View style={styles.closeStat}>
                <ProgressRing value={Number(pct)} size={54} stroke={6} color={palette.tint}>
                  <Text style={styles.ringT}>{pct}%</Text>
                </ProgressRing>
                <View>
                  <Text style={styles.statLabel}>Close progress</Text>
                  <Text style={styles.statHint}>D+1–D+2 complete</Text>
                </View>
              </View>
            </View>
          </Card>

          <View style={[styles.quads, twoCol && { flexDirection: 'row', flexWrap: 'wrap' }]}>
            {QUADS.map((q) => (
              <View key={q.title} style={[styles.quad, twoCol && { width: '48.9%' }]}>
                <View style={styles.quadHead}>
                  <View style={styles.quadIcon}>
                    <Icon name={q.icon} size={16} color={palette.tint} strokeWidth={1.9} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.qt}>{q.title}</Text>
                    <Text style={styles.qs}>{q.sub}</Text>
                  </View>
                </View>
                <View style={styles.grid}>
                  {q.cards.map(([t, v, u, s, route]) => (
                    <Pressable
                      key={t}
                      onPress={() => router.push(route as never)}
                      style={({ pressed }) => [styles.cell, pressed && { opacity: 0.85 }]}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${t}`}
                    >
                      <KpiCard title={t} value={v} unit={u} status={s} icon={ICONS[t]} hint={s === 'error' ? 'Above trigger' : s === 'warn' ? 'Watch this' : undefined} />
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.lower, twoCol && { flexDirection: 'row', alignItems: 'flex-start' }]}>
            <Pressable
              onPress={() => router.push('/(app)/finance' as never)}
              style={styles.lowerMain}
              accessibilityRole="button"
              accessibilityLabel="Open finance reconciliation"
            >
              <ChartCard
                title="Yield by flow"
                hint="SAMPLE — tap for reconciliation"
                bars={[
                  { label: 'HF 93.1%', pct: 93 },
                  { label: 'CF 95.4%', pct: 95 },
                  { label: 'U-Bend 97.0%', pct: 97 },
                ]}
              />
            </Pressable>

            <Card style={styles.attention}>
              <View style={styles.attentionHead}>
                <View style={[styles.quadIcon, { backgroundColor: palette.errorSoft }]}>
                  <Icon name="bellRing" size={16} color={palette.error} strokeWidth={1.9} />
                </View>
                <Text style={styles.qt}>Needs attention</Text>
              </View>
              {[
                { t: 'Invoice-0 exceptions', s: '2 open · finance to resolve', icon: 'fileWarning' as IconName, route: '/(app)/exceptions' },
                { t: 'PCs awaiting approval', s: '3 cost runs · costing owner', icon: 'checkCheck' as IconName, route: '/(app)/approvals' },
                { t: 'WIP over 30 days', s: '3 lots · production review', icon: 'clock' as IconName, route: '/(app)/inventory' },
              ].map((a) => (
                <Pressable
                  key={a.t}
                  onPress={() => router.push(a.route as never)}
                  style={({ pressed }) => [styles.attRow, pressed && { backgroundColor: palette.cardMuted }]}
                  accessibilityRole="button"
                  accessibilityLabel={a.t}
                >
                  <Icon name={a.icon} size={16} color={palette.text2} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attT}>{a.t}</Text>
                    <Text style={styles.attS}>{a.s}</Text>
                  </View>
                  <Icon name="chevronRight" size={15} color={palette.text3} />
                </Pressable>
              ))}
              <Pressable onPress={() => router.push('/(app)/approvals' as never)} style={styles.attLink}>
                <Text style={styles.attLinkT}>Review all open items</Text>
                <Icon name="arrowRight" size={14} color={palette.tint} />
              </Pressable>
            </Card>
          </View>

          <Callout tone="neutral" title="How to read this page">
            {`Triggers in the register: ${KPI_TRIGGERS.slice(0, 6).map((k) => `${k[0]} ${k[2]}`).join(' · ')}. Full register in Reports. * Conversion is gated until a cost run is approved.`}
          </Callout>
        </View>
      )}
    </AppShell>
  );
}

function HealthStat({ label, value, tone }: { label: string; value: string; tone: 'ok' | 'warn' | 'error' }) {
  const c = tone === 'ok' ? palette.success : tone === 'warn' ? palette.warning : palette.error;
  return (
    <View style={styles.stat}>
      <View style={styles.statHead}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c }} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  health: { padding: 18, gap: 14 },
  healthHead: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  healthIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  healthTitle: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  healthSub: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  healthChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  healthStats: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: palette.separator, paddingTop: 12 },
  stat: { flex: 1, minWidth: 130, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: palette.bgAlt },
  statHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  statValue: { ...type.title3, fontVariant: ['tabular-nums'], marginTop: 4, fontFamily: fontStack } as never,
  statHint: { ...type.caption1, color: palette.text3, fontFamily: fontStack } as never,
  closeStat: { flex: 1, minWidth: 200, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: palette.tintSoft },
  ringT: { fontSize: 12, fontWeight: '800', color: palette.tint, fontFamily: fontStack },
  quads: { gap: 14 },
  quad: { backgroundColor: palette.card, borderRadius: radius.card, borderWidth: 1, borderColor: palette.border, padding: 14, gap: 12 },
  quadHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  quadIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  qt: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  qs: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  grid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  cell: { flex: 1, minWidth: 150 },
  lower: { gap: 14 },
  lowerMain: { flex: 1, minWidth: 300 },
  attention: { flex: 1, minWidth: 300, padding: 16, marginTop: 14 },
  attentionHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 6 },
  attRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10, paddingHorizontal: 6, borderRadius: radius.sm, borderBottomWidth: 1, borderBottomColor: palette.separator },
  attT: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  attS: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  attLink: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 12, paddingHorizontal: 6 },
  attLinkT: { ...type.footnote, fontWeight: '700', color: palette.tint, fontFamily: fontStack } as never,
});
