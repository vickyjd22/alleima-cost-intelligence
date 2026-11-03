import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { KpiCard } from '../../src/components/KpiCard';
import { ChartCard } from '../../src/components/CostingPanels';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { PeriodSelector } from '../../src/components/Filters';
import { Callout, ProgressRing } from '../../src/components/ui';
import { Icon, type IconName } from '../../src/components/Icon';
import { useSession } from '../../src/store/session';
import { reconcileSopic } from '../../src/lib/reconciliation';
import { closeProgress } from '../../src/lib/close';
import { demoDb } from '../../src/mocks/demo';
import { KNOWN_PCS } from '../../src/data/sample';
import { KPI_TRIGGERS } from '../../src/mocks/manual';
import { displayFontStack, fontStack, palette, radius, type } from '../../src/theme/tokens';

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
  const quadCols = width >= 1180 ? 2 : 1;
  const periodLabel = `${period.slice(4)}/${period.slice(0, 4)}`;

  return (
    <AppShell roles={roles}>
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 28 }}>
          {/* ---- HIG large-title header ------------------------------------ */}
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <Text style={styles.eyebrow}>MANAGEMENT DASHBOARD</Text>
              <Text style={styles.largeTitle} accessibilityRole="header">
                Cost control at a glance
              </Text>
              <Text style={styles.heroSub}>
                Mehsana plant · period {periodLabel} · illustrative sample data. Triggers guide attention; they are
                not statutory limits.
              </Text>
            </View>
            <View style={styles.heroAside}>
              <PeriodSelector />
            </View>
          </View>

          {/* ---- Summary card (iOS widget style) --------------------------- */}
          <View style={styles.summary}>
            <View style={styles.summaryHead}>
              <View style={styles.summaryTitleWrap}>
                <View style={styles.summaryIcon}>
                  <Icon name="shieldCheck" size={18} color={palette.tint} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, minWidth: 160 }}>
                  <Text style={styles.summaryTitle}>Reconciliation &amp; close</Text>
                  <Text style={styles.summarySub}>Source systems tied to SOPIC before commentary is issued</Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push('/(app)/finance' as never)}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                  styles.summaryLink,
                  (pressed || hovered) && { backgroundColor: palette.tintSoft },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Open finance reconciliation"
              >
                <Text style={styles.summaryLinkT}>Open finance</Text>
                <Icon name="arrowUpRight" size={14} color={palette.tint} strokeWidth={2.2} />
              </Pressable>
            </View>

            <View style={styles.metricRow}>
              <Metric label="Matched lines" value={String(rec.matched.length)} tone="ok" icon="checkCircle" />
              <View style={styles.metricDivider} />
              <Metric label="Invoice-0 exceptions" value={String(rec.invoiceZeroExceptions.length)} tone="error" icon="alertCircle" />
              <View style={styles.metricDivider} />
              <Metric label="PCs awaiting review" value={String(rec.pcExceptions.length)} tone="warn" icon="clock" />
              <View style={styles.metricDivider} />
              <View style={styles.closeMetric}>
                <ProgressRing value={Number(pct)} size={56} stroke={6} color={palette.tint}>
                  <Text style={styles.ringT}>{pct}%</Text>
                </ProgressRing>
                <View>
                  <Text style={styles.metricLabel}>Close progress</Text>
                  <Text style={styles.metricHint}>D+1–D+2 complete</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ---- KPI families --------------------------------------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cost signals</Text>
            <View style={[styles.quads, quadCols === 2 && { flexDirection: 'row', flexWrap: 'wrap' }]}>
              {QUADS.map((q) => (
                <View key={q.title} style={[styles.quad, quadCols === 2 && { width: '48.6%' }]}>
                  <View style={styles.quadHead}>
                    <View style={styles.quadIcon}>
                      <Icon name={q.icon} size={16} color={palette.tint} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quadTitle}>{q.title}</Text>
                      <Text style={styles.quadSub}>{q.sub}</Text>
                    </View>
                  </View>
                  <View style={styles.grid}>
                    {q.cards.map(([t, v, u, s, route]) => (
                      <Pressable
                        key={t}
                        onPress={() => router.push(route as never)}
                        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                          styles.cell,
                          hovered && ({ transform: [{ translateY: -2 }] } as never),
                          pressed && { opacity: 0.9 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${t}`}
                      >
                        <KpiCard
                          title={t}
                          value={v}
                          unit={u}
                          status={s}
                          icon={ICONS[t]}
                          hint={s === 'error' ? 'Above trigger' : s === 'warn' ? 'Watch this' : undefined}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ---- Lower region --------------------------------------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flow &amp; follow-ups</Text>
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

              <View style={styles.attention}>
                <View style={styles.attentionHead}>
                  <View style={[styles.quadIcon, { backgroundColor: palette.errorSoft }]}>
                    <Icon name="bellRing" size={16} color={palette.error} strokeWidth={2} />
                  </View>
                  <Text style={styles.attentionTitle}>Needs attention</Text>
                </View>
                {[
                  { t: 'Invoice-0 exceptions', s: '2 open · finance to resolve', icon: 'fileWarning' as IconName, route: '/(app)/exceptions', tone: 'error' as const },
                  { t: 'PCs awaiting approval', s: '3 cost runs · costing owner', icon: 'checkCheck' as IconName, route: '/(app)/approvals', tone: 'warn' as const },
                  { t: 'WIP over 30 days', s: '3 lots · production review', icon: 'clock' as IconName, route: '/(app)/inventory', tone: 'warn' as const },
                ].map((a, i, arr) => (
                  <Pressable
                    key={a.t}
                    onPress={() => router.push(a.route as never)}
                    style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                      styles.attRow,
                      i < arr.length - 1 && styles.attRowBorder,
                      (pressed || hovered) && { backgroundColor: palette.cardMuted },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={a.t}
                  >
                    <View style={[styles.attIcon, { backgroundColor: a.tone === 'error' ? palette.errorSoft : palette.warningSoft }]}>
                      <Icon name={a.icon} size={15} color={a.tone === 'error' ? palette.error : palette.warning} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attT}>{a.t}</Text>
                      <Text style={styles.attS}>{a.s}</Text>
                    </View>
                    <Icon name="chevronRight" size={16} color={palette.text3} />
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => router.push('/(app)/approvals' as never)}
                  style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                    styles.attLink,
                    (pressed || hovered) && { backgroundColor: palette.tintSoft },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Review all open items"
                >
                  <Text style={styles.attLinkT}>Review all open items</Text>
                  <Icon name="arrowRight" size={14} color={palette.tint} strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>
          </View>

          <Callout tone="neutral" title="How to read this page">
            {`Triggers in the register: ${KPI_TRIGGERS.slice(0, 6).map((k) => `${k[0]} ${k[2]}`).join(' · ')}. Full register in Reports. * Conversion is gated until a cost run is approved.`}
          </Callout>
        </View>
      )}
    </AppShell>
  );
}

function Metric({ label, value, tone, icon }: { label: string; value: string; tone: 'ok' | 'warn' | 'error'; icon: IconName }) {
  const c = tone === 'ok' ? palette.success : tone === 'warn' ? palette.warning : palette.error;
  return (
    <View style={styles.metric}>
      <View style={styles.metricHead}>
        <Icon name={icon} size={14} color={c} strokeWidth={2.2} />
        <Text style={styles.metricLabel} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Hero / large title */
  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' },
  heroText: { flex: 1, minWidth: 260, gap: 6 },
  eyebrow: { ...type.caption2, color: palette.tint, letterSpacing: 1.4, fontFamily: fontStack } as never,
  largeTitle: { fontSize: 34, lineHeight: 40, fontWeight: '800', color: palette.text, letterSpacing: -1, fontFamily: displayFontStack } as never,
  heroSub: { ...type.callout, color: palette.text2, maxWidth: 760, fontFamily: fontStack } as never,
  heroAside: { alignItems: 'flex-end' },

  /* Summary widget */
  summary: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 22,
    gap: 18,
    shadowColor: palette.sidebar,
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  } as never,
  summaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  summaryTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 },
  summaryIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { ...type.title3, color: palette.text, fontFamily: displayFontStack } as never,
  summarySub: { ...type.footnote, color: palette.text2, marginTop: 2, fontFamily: fontStack } as never,
  summaryLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 36, borderRadius: radius.pill, cursor: 'pointer' } as never,
  summaryLinkT: { ...type.footnote, fontWeight: '700', color: palette.tint, fontFamily: fontStack } as never,

  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: palette.separator, paddingTop: 18 },
  metric: { flex: 1, minWidth: 120, gap: 6 },
  metricDivider: { width: 1, alignSelf: 'stretch', backgroundColor: palette.separator, marginVertical: 2 },
  metricHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricLabel: { ...type.caption1, color: palette.text2, fontFamily: fontStack, flexShrink: 1 } as never,
  metricValue: { fontSize: 26, fontWeight: '800', color: palette.text, fontVariant: ['tabular-nums'], letterSpacing: -0.5, fontFamily: displayFontStack } as never,
  metricHint: { ...type.caption1, color: palette.text3, fontFamily: fontStack } as never,
  closeMetric: { flex: 1.2, minWidth: 190, flexDirection: 'row', alignItems: 'center', gap: 12 },
  ringT: { fontSize: 12, fontWeight: '800', color: palette.tint, fontFamily: fontStack },

  /* Sections */
  section: { gap: 14 },
  sectionTitle: { ...type.title3, color: palette.text, fontFamily: displayFontStack, letterSpacing: -0.4 } as never,

  /* KPI quads */
  quads: { gap: 16 },
  quad: { backgroundColor: palette.card, borderRadius: radius.xl, borderWidth: 1, borderColor: palette.border, padding: 18, gap: 14 },
  quadHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quadIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  quadTitle: { ...type.headline, color: palette.text, fontFamily: displayFontStack } as never,
  quadSub: { ...type.caption1, color: palette.text3, marginTop: 1, fontFamily: fontStack } as never,
  grid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  cell: { flex: 1, minWidth: 150, cursor: 'pointer' } as never,

  /* Lower */
  lower: { gap: 16 },
  lowerMain: { flex: 1, minWidth: 300, cursor: 'pointer' } as never,
  attention: {
    flex: 1,
    minWidth: 300,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    shadowColor: palette.sidebar,
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  } as never,
  attentionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  attentionTitle: { ...type.headline, color: palette.text, fontFamily: displayFontStack } as never,
  attRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderRadius: radius.md, cursor: 'pointer' } as never,
  attRowBorder: { borderBottomWidth: 1, borderBottomColor: palette.separator, borderRadius: 0 },
  attIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  attT: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  attS: { ...type.caption1, color: palette.text3, marginTop: 1, fontFamily: fontStack } as never,
  attLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 8, minHeight: 36, borderRadius: radius.pill, cursor: 'pointer' } as never,
  attLinkT: { ...type.footnote, fontWeight: '700', color: palette.tint, fontFamily: fontStack } as never,
});
