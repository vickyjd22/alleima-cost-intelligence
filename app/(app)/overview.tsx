import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { KpiCard } from '../../src/components/KpiCard';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { PeriodSelector } from '../../src/components/Filters';
import { StatusChip } from '../../src/components/StatusChip';
import { Button, Callout, ProgressRing } from '../../src/components/ui';
import { Icon, type IconName } from '../../src/components/Icon';
import {
  AvatarGroup, CardTitle, ComboChart, DashCard, MetricTile, PersonRow,
} from '../../src/components/DashboardWidgets';
import { useSession } from '../../src/store/session';
import { reconcileSopic } from '../../src/lib/reconciliation';
import { CLOSE_STEPS, closeProgress, type StepStatus } from '../../src/lib/close';
import { auditLog } from '../../src/lib/audit';
import { demoDb } from '../../src/mocks/demo';
import { KNOWN_PCS } from '../../src/data/sample';
import { KPI_TRIGGERS } from '../../src/mocks/manual';
import {
  AUDIT_METRICS, PRODUCTION_TREND, PRODUCT_PROFIT, TREND_MONTHS, WIP_STAGES, WORK_ORDERS, YIELD_TREND,
  auditScore, lakh, margin,
} from '../../src/mocks/costingDemo';
import { elevation, fontStack, gradient, palette, radius, type } from '../../src/theme/tokens';

type Kpi = [string, string, string, 'ok' | 'warn' | 'error' | undefined, string];

const QUADS: { title: string; sub: string; icon: IconName; cards: Kpi[] }[] = [
  {
    title: 'Material', sub: 'RM/kg · price and usage variance', icon: 'package',
    cards: [
      ['RM cost/kg', '₹512', '/kg', 'ok', '/(app)/costing'],
      ['Price variance', '−₹15,000', '', 'warn', '/(app)/costing'],
      ['Usage variance', '−₹10,400', '', 'warn', '/(app)/costing'],
    ],
  },
  {
    title: 'Process', sub: 'Yield plan versus actual', icon: 'gauge',
    cards: [
      ['Yield', '94.2', '%', 'warn', '/(app)/reports'],
      ['Rework', '0.8', '%', 'warn', '/(app)/quality'],
      ['Rejection', '0.6', '%', 'ok', '/(app)/quality'],
    ],
  },
  {
    title: 'Conversion', sub: 'Machine, labour and overhead', icon: 'factory',
    cards: [
      ['Conv./kg', '—', '*', undefined, '/(app)/costing'],
      ['Loading', '88', '%', 'ok', '/(app)/engineering'],
      ['Breakdown', '6.1', '%', 'error', '/(app)/engineering'],
    ],
  },
  {
    title: 'Commercial', sub: 'Order and customer profitability', icon: 'trendingUp',
    cards: [
      ['Order margin', '25.1', '%', 'ok', '/(app)/reports'],
      ['Open exceptions', '7', '', 'error', '/(app)/approvals'],
      ['WIP over 30d', '3', 'lots', 'warn', '/(app)/inventory'],
    ],
  },
];

const ICONS: Record<string, IconName> = {
  'RM cost/kg': 'package', 'Price variance': 'scale', 'Usage variance': 'scale', Yield: 'gauge',
  Rework: 'rotateCcw', Rejection: 'ban', 'Conv./kg': 'factory', Loading: 'activity', Breakdown: 'wrench',
  'Order margin': 'trendingUp', 'Open exceptions': 'alertCircle', 'WIP over 30d': 'clock',
};

/** Content width ≈ window minus the floating sidebar + gutters on wide screens. */
function contentWidth(width: number): number {
  return width >= 1024 ? width - 264 - 16 * 3 : width - 32;
}

export default function Overview() {
  const router = useRouter();
  const { roles, period } = useSession();
  const { width } = useWindowDimensions();
  const loading = useMockLoading();
  const go = (r: string) => router.push(r as never);

  const cw = contentWidth(width);
  const threeCol = cw >= 1000;
  const twoCol = cw >= 640;
  /** `flex: 1` only when cards sit side by side; in a column it collapses their height. */
  const rowFill = twoCol ? styles.fill : null;

  /* ---- real data ------------------------------------------------------- */
  const rec = reconcileSopic(demoDb.sopic, KNOWN_PCS);
  const doneMap: Record<string, StepStatus> = { 'D+1–D+2': 'done' };
  const closePct = closeProgress(doneMap);
  const nextStep = CLOSE_STEPS.find((s) => doneMap[s.day] !== 'done') ?? CLOSE_STEPS[CLOSE_STEPS.length - 1]!;
  const nextIdx = CLOSE_STEPS.indexOf(nextStep) + 1;

  const openWOs = WORK_ORDERS.filter((w) => w.status !== 'Closed' && w.status !== 'Completed');
  const inProgress = WORK_ORDERS.filter((w) => w.status === 'InProgress').length;
  const revenue = PRODUCT_PROFIT.reduce((a, p) => a + p.revenue, 0);
  const totalMargin = PRODUCT_PROFIT.reduce((a, p) => a + margin(p), 0);
  const marginPctTotal = revenue > 0 ? (totalMargin / revenue) * 100 : 0;
  const pendingApprovals = demoDb.approvals.filter((a) => a.status === 'pending');
  const readiness = auditScore(AUDIT_METRICS);
  const openAudit = AUDIT_METRICS.reduce((a, m) => a + m.count, 0);
  const wipOver30 = WIP_STAGES.filter((s) => s.ageDays > 30).length;
  const activity = auditLog().slice(0, 4);
  const periodLabel = `${period.slice(4)}/${period.slice(0, 4)}`;

  const ringRow = (value: number, color: string, label: string) => (
    <View style={styles.ringCol}>
      <ProgressRing value={value} size={104} stroke={11} color={color} track={palette.filled}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.ringLabel}>{label}</Text>
          <Text style={styles.ringValue}>{value}%</Text>
        </View>
      </ProgressRing>
    </View>
  );

  return (
    <AppShell roles={roles}>
      {loading ? (
        <Skeleton lines={8} />
      ) : (
        <View style={{ gap: 20 }}>
          {/* ---- Page header ------------------------------------------- */}
          <View style={styles.pageHead}>
            <View style={{ flex: 1, minWidth: 240 }}>
              <Text style={styles.h1} accessibilityRole="header">Dashboard</Text>
              <Text style={styles.sub}>
                Cost control at a glance for Mehsana plant · period {periodLabel}. Illustrative SAMPLE data.
              </Text>
            </View>
            <View style={styles.headActions}>
              {width < 1240 ? <PeriodSelector /> : null}
              <Button label="New work order" icon="plus" onPress={() => go('/(app)/work-order-mgmt')} />
            </View>
          </View>

          {/* ---- KPI cards --------------------------------------------- */}
          <View style={styles.kpiRow}>
            <MetricTile
              icon="clipboard" label="Work orders" value={String(openWOs.length)}
              sub={`${inProgress} in progress`} subTone="success" onPress={() => go('/(app)/work-order-mgmt')}
            />
            <MetricTile
              icon="trendingUp" label="Gross margin" value={`${marginPctTotal.toFixed(1)}%`}
              sub={`${lakh(totalMargin)} on ${lakh(revenue)} revenue`} subTone="success" onPress={() => go('/(app)/product-profitability')}
            />
            <MetricTile
              icon="listChecks" label="Approvals" value={String(pendingApprovals.length)}
              onPress={() => go('/(app)/approvals')}
              sub={pendingApprovals.length ? 'Awaiting review' : 'All clear'}
              subTone={pendingApprovals.length ? 'warning' : 'success'}
            >
              {pendingApprovals.length ? <AvatarGroup names={pendingApprovals.map((a) => a.maker)} /> : null}
            </MetricTile>
            <MetricTile
              icon="shieldCheck" label="Audit score" value={`${readiness}%`}
              sub={openAudit ? `${openAudit} open items to close` : 'Audit ready'} subTone={openAudit ? 'warning' : 'success'}
              onPress={() => go('/(app)/audit-readiness')}
            />
          </View>

          {/* ---- Analytics + Approvals + Activity ---------------------- */}
          <View style={[styles.row, threeCol && { flexDirection: 'row', alignItems: 'stretch' }]}>
            <DashCard style={threeCol ? { flex: 2.2 } : null}>
              <CardTitle title="Analytics Overview" subtitle="Production and yield, last 6 months (SAMPLE)" />
              <ComboChart
                labels={TREND_MONTHS}
                bars={PRODUCTION_TREND}
                line={YIELD_TREND}
                barName="Production (t)"
                lineName="Yield (%)"
              />
            </DashCard>

            <View style={[styles.pair, !threeCol && twoCol && { flexDirection: 'row' }, threeCol && { flex: 2.2, flexDirection: 'row' }]}>
              <DashCard style={rowFill}>
                <CardTitle title="Approvals queue" subtitle="Waiting for review" />
                {pendingApprovals.length === 0 ? (
                  <Text style={styles.empty}>No approvals waiting.</Text>
                ) : (
                  pendingApprovals.slice(0, 4).map((a, i, arr) => (
                    <PersonRow
                      key={a.id}
                      name={a.maker}
                      title={a.kind}
                      meta={`${a.ref} · pending`}
                      last={i === arr.length - 1}
                      onPress={() => go('/(app)/approvals')}
                    />
                  ))
                )}
              </DashCard>

              <DashCard style={rowFill}>
                <CardTitle title="Recent Activity" subtitle="Latest recorded actions" />
                {activity.length === 0 ? (
                  <Text style={styles.empty}>No activity recorded yet.</Text>
                ) : (
                  activity.map((e, i, arr) => (
                    <PersonRow
                      key={`${e.at}-${i}`}
                      name={e.actor}
                      title={e.action}
                      link={e.detail}
                      time={e.at}
                      last={i === arr.length - 1}
                      onPress={() => go('/(app)/admin')}
                    />
                  ))
                )}
              </DashCard>
            </View>
          </View>

          {/* ---- Promo + Progress + Next close step ------------------- */}
          <View style={[styles.row, twoCol && { flexDirection: 'row', alignItems: 'stretch', flexWrap: 'wrap' }]}>
            <LinearGradient colors={gradient.ember} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.promo, twoCol && { flex: 1, minWidth: 260 }]}>
              <View pointerEvents="none" style={styles.promoShapeA} />
              <View pointerEvents="none" style={styles.promoShapeB} />
              <Text style={styles.promoTitle}>Guided Journey</Text>
              <Text style={styles.promoText}>
                Walk the 14-step costing story, from product master to the executive dashboard, with live data at every step.
              </Text>
              <Pressable
                onPress={() => go('/(app)/demo-journey')}
                accessibilityRole="button"
                accessibilityLabel="Start guided journey"
                style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [styles.promoBtn, hovered && { opacity: 0.92 }]}
              >
                <Text style={styles.promoBtnT}>Start journey</Text>
                <Icon name="arrowRight" size={15} color={palette.tintPressed} strokeWidth={2.2} />
              </Pressable>
            </LinearGradient>

            <DashCard style={twoCol ? { flex: 1, minWidth: 300 } : null}>
              <CardTitle title="Close & readiness" subtitle="Current period progress" />
              <View style={styles.rings}>
                <View style={{ alignItems: 'center', gap: 10 }}>
                  {ringRow(closePct, palette.tint, 'Close')}
                  <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: palette.tint }]} /><Text style={styles.legendT}>Month close</Text></View>
                </View>
                <View style={{ alignItems: 'center', gap: 10 }}>
                  {ringRow(readiness, palette.purple, 'Audit')}
                  <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: palette.purple }]} /><Text style={styles.legendT}>Audit readiness</Text></View>
                </View>
              </View>
            </DashCard>

            <DashCard wash style={twoCol ? { flex: 1, minWidth: 300 } : null}>
              <CardTitle title="Next close step" subtitle={`Step ${nextIdx} of ${CLOSE_STEPS.length} · ${nextStep.owner}`} />
              <Text style={styles.bigStep}>{nextStep.day}</Text>
              <Text style={styles.stepName} numberOfLines={2}>{nextStep.activity}</Text>
              <View style={styles.ctrlRow}>
                <Pressable onPress={() => go('/(app)/monthly-close')} accessibilityRole="button" accessibilityLabel="Open monthly close" style={styles.ctrl}>
                  <Icon name="arrowUpRight" size={18} color={palette.tintPressed} strokeWidth={2.2} />
                </Pressable>
                <Pressable onPress={() => go('/(app)/finance')} accessibilityRole="button" accessibilityLabel="Open finance reconciliation" style={styles.ctrl}>
                  <Icon name="scale" size={18} color={palette.tintPressed} strokeWidth={2} />
                </Pressable>
                <Pressable onPress={() => go('/(app)/allocation')} accessibilityRole="button" accessibilityLabel="Open cost allocation" style={styles.ctrl}>
                  <Icon name="sliders" size={18} color={palette.tintPressed} strokeWidth={2} />
                </Pressable>
              </View>
            </DashCard>
          </View>

          {/* ---- Reconciliation snapshot (existing) ------------------- */}
          <DashCard>
            <CardTitle
              title="Reconciliation & close health"
              subtitle="Source systems tied to SOPIC before commentary is issued"
              right={<Button label="Open finance" variant="secondary" size="sm" icon="arrowUpRight" onPress={() => go('/(app)/finance')} />}
            />
            <View style={styles.reconRow}>
              <ReconStat label="SOPIC matched" value={rec.matched.length} tone="ok" />
              <ReconStat label="Invoice-0 exceptions" value={rec.invoiceZeroExceptions.length} tone="error" onPress={() => go('/(app)/exceptions')} />
              <ReconStat label="PCs awaiting review" value={rec.pcExceptions.length} tone="warn" onPress={() => go('/(app)/finance')} />
              <ReconStat label="WIP lots over 30d" value={wipOver30} tone={wipOver30 ? 'warn' : 'ok'} onPress={() => go('/(app)/wip')} />
            </View>
          </DashCard>

          {/* ---- Cost signals (existing KPI families) ----------------- */}
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionT}>Cost signals</Text>
            <View style={[styles.quads, cw >= 1000 && { flexDirection: 'row', flexWrap: 'wrap' }]}>
              {QUADS.map((q) => (
                <DashCard key={q.title} style={[styles.quad, cw >= 1000 && { width: '48.9%' }]}>
                  <View style={styles.quadHead}>
                    <View style={styles.quadIcon}><Icon name={q.icon} size={16} color={palette.tint} strokeWidth={2} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardT}>{q.title}</Text>
                      <Text style={styles.cardS}>{q.sub}</Text>
                    </View>
                  </View>
                  <View style={styles.grid}>
                    {q.cards.map(([t, v, u, s, route]) => (
                      <Pressable
                        key={t}
                        onPress={() => go(route)}
                        style={styles.cell}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${t}`}
                      >
                        <KpiCard title={t} value={v} unit={u} status={s} icon={ICONS[t]} hint={s === 'error' ? 'Above trigger' : s === 'warn' ? 'Watch this' : undefined} />
                      </Pressable>
                    ))}
                  </View>
                </DashCard>
              ))}
            </View>
          </View>

          <Callout tone="neutral" title="How to read this page">
            {`Triggers in the register: ${KPI_TRIGGERS.slice(0, 6).map((k) => `${k[0]} ${k[2]}`).join(' · ')}. Full register in Reports. * Conversion is gated until a cost run is approved. Trend charts and KPI values are SAMPLE data.`}
          </Callout>
        </View>
      )}
    </AppShell>
  );
}

function ReconStat({ label, value, tone, onPress }: { label: string; value: number; tone: 'ok' | 'warn' | 'error'; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value}`}
      style={styles.reconCell}
    >
      <Text style={styles.reconLabel}>{label}</Text>
      <View style={styles.reconValRow}>
        <Text style={styles.reconValue}>{value}</Text>
        <StatusChip label={value === 0 && tone !== 'ok' ? 'Clear' : tone === 'ok' ? 'OK' : tone === 'warn' ? 'Review' : 'Open'} tone={value === 0 && tone !== 'ok' ? 'ok' : tone} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '700', color: palette.text, letterSpacing: -0.8, fontFamily: fontStack } as never,
  sub: { ...type.callout, color: palette.text2, marginTop: 4, fontFamily: fontStack } as never,
  headActions: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 1, maxWidth: '100%' },

  kpiRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  row: { gap: 16 },
  pair: { gap: 16 },
  fill: { flex: 1 },
  empty: { ...type.footnote, color: palette.text3, fontFamily: fontStack, paddingVertical: 12 } as never,

  /* promo */
  promo: { borderRadius: radius.card, padding: 22, overflow: 'hidden', gap: 8, minHeight: 190, justifyContent: 'center', ...elevation[3] } as never,
  promoShapeA: { position: 'absolute', right: -40, bottom: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.12)' },
  promoShapeB: { position: 'absolute', right: 40, top: -50, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.10)' },
  promoTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3, fontFamily: fontStack } as never,
  promoText: { ...type.subhead, color: 'rgba(255,255,255,0.88)', maxWidth: 320, fontFamily: fontStack } as never,
  promoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: radius.input, paddingHorizontal: 16, minHeight: 42, marginTop: 8, cursor: 'pointer' } as never,
  promoBtnT: { fontSize: 13.5, fontWeight: '600', color: palette.tintPressed, fontFamily: fontStack },

  /* rings */
  rings: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingVertical: 4 },
  ringCol: { alignItems: 'center' },
  ringLabel: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  ringValue: { fontSize: 19, fontWeight: '700', color: palette.text, fontFamily: fontStack, fontVariant: ['tabular-nums'] } as never,
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  legendT: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,

  /* next step */
  bigStep: { fontSize: 38, lineHeight: 44, fontWeight: '700', color: palette.text, letterSpacing: -1, fontFamily: fontStack, textAlign: 'center', fontVariant: ['tabular-nums'] } as never,
  stepName: { ...type.footnote, color: palette.text2, textAlign: 'center', fontFamily: fontStack, marginTop: 2 } as never,
  ctrlRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 14 },
  ctrl: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } as never,

  /* recon */
  reconRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  reconCell: { flex: 1, minWidth: 170, backgroundColor: palette.cardMuted, borderRadius: radius.input, padding: 14, gap: 8, cursor: 'pointer' } as never,
  reconLabel: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  reconValRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  reconValue: { fontSize: 24, fontWeight: '700', color: palette.text, fontFamily: fontStack, fontVariant: ['tabular-nums'] } as never,

  /* cost signals */
  sectionT: { fontSize: 18, lineHeight: 24, fontWeight: '600', color: palette.text, letterSpacing: -0.3, fontFamily: fontStack } as never,
  quads: { gap: 16 },
  quad: { gap: 14 },
  quadHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quadIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  cardT: { fontSize: 15, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  cardS: { ...type.caption1, color: palette.text3, marginTop: 1, fontFamily: fontStack } as never,
  grid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  cell: { flex: 1, minWidth: 150, cursor: 'pointer' } as never,
});

