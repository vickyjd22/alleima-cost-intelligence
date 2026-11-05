import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { PeriodSelector } from '../../src/components/Filters';
import { ChartCard } from '../../src/components/CostingPanels';
import { KpiCard } from '../../src/components/KpiCard';
import { Icon } from '../../src/components/Icon';
import { Card, ProgressRing, SectionHeader } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { YIELD_KPIS, YIELD_BY_FLOW, YIELD_DRILL } from '../../src/mocks/costingDemo';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

const LABELS: Record<string, string> = { root: 'All flows', HF: 'HF', CF: 'CF', UB: 'U-Bend', DHDM: 'DHDM-02', cause: 'Root cause' };

export default function YieldScrap() {
  const { roles } = useSession();
  const loading = useMockLoading();
  const [trail, setTrail] = useState<string[]>(['root']);
  const level = trail[trail.length - 1]!;
  const rows = YIELD_DRILL[level] ?? [];

  function drill(next?: string): void { if (next && YIELD_DRILL[next]) setTrail((t) => [...t, next]); }
  function goTo(i: number): void { setTrail((t) => t.slice(0, i + 1)); }

  return (
    <AppShell roles={roles}>
      <PageHeader eyebrow="Costing" title="Yield & Scrap Analytics" sub="Monitor yield, scrap, rework and rejection; drill Flow → Machine → Product → Root cause. SAMPLE data." right={<PeriodSelector />} />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 16 }}>
          <View style={styles.kpis}>
            <Card style={styles.yieldCard}>
              <ProgressRing value={YIELD_KPIS.actual} size={72} stroke={8} color={palette.tint}>
                <Text style={styles.ringT}>{YIELD_KPIS.actual}%</Text>
              </ProgressRing>
              <View>
                <Text style={styles.yieldLabel}>Actual yield</Text>
                <Text style={styles.yieldSub}>Plan {YIELD_KPIS.planned}% · {(YIELD_KPIS.actual - YIELD_KPIS.planned).toFixed(1)}pp</Text>
              </View>
            </Card>
            <KpiCard title="Scrap %" value={`${YIELD_KPIS.scrap}`} unit="%" status="warn" icon="ban" />
            <KpiCard title="Rework %" value={`${YIELD_KPIS.rework}`} unit="%" status="warn" icon="rotateCcw" />
            <KpiCard title="Rejection %" value={`${YIELD_KPIS.rejection}`} unit="%" status="ok" icon="xCircle" />
          </View>

          <ChartCard title="Yield by flow" bars={YIELD_BY_FLOW.map((f) => ({ label: f.flow, pct: Math.round(f.yield) }))} hint="SAMPLE" />

          <Card style={{ gap: 10 }}>
            <SectionHeader title="Drill to root cause" description="Flow → Machine → Product → Root cause" />
            <View style={styles.crumb}>
              {trail.map((t, i) => (
                <View key={t + i} style={styles.crumbItem}>
                  {i > 0 ? <Icon name="chevronRight" size={13} color={palette.text3} /> : null}
                  <Pressable onPress={() => goTo(i)} accessibilityRole="button" accessibilityLabel={`Go to ${LABELS[t] ?? t}`}>
                    <Text style={[styles.crumbT, i === trail.length - 1 && { color: palette.text, fontWeight: '700' }]}>{LABELS[t] ?? t}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
            {rows.map((r, i) => (
              <Pressable
                key={i}
                onPress={() => drill(r.next)}
                disabled={!r.next}
                style={({ pressed }) => [styles.drillRow, pressed && r.next ? { backgroundColor: palette.cardMuted } : null]}
                accessibilityRole="button"
                accessibilityLabel={r.label}
              >
                <Text style={styles.drillLabel}>{r.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {r.yield > 0 ? <Text style={styles.drillYield}>{r.yield}%</Text> : null}
                  {r.next ? <Icon name="chevronRight" size={15} color={palette.text3} /> : null}
                </View>
              </Pressable>
            ))}
          </Card>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  kpis: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  yieldCard: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, minWidth: 220, padding: 16 },
  ringT: { fontSize: 14, fontWeight: '800', color: palette.tint, fontFamily: fontStack },
  yieldLabel: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  yieldSub: { ...type.caption1, color: palette.text2, marginTop: 2, fontFamily: fontStack } as never,
  crumb: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  crumbItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  crumbT: { ...type.caption1, color: palette.tint, fontFamily: fontStack } as never,
  drillRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: palette.separator, borderRadius: radius.sm },
  drillLabel: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack, flex: 1 } as never,
  drillYield: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack, fontVariant: ['tabular-nums'] } as never,
});
