import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { PeriodSelector } from '../../src/components/Filters';
import { ChartCard } from '../../src/components/CostingPanels';
import { KpiCard } from '../../src/components/KpiCard';
import { Card, SectionHeader, SparkBars, Tabs } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import {
  PRODUCT_PROFIT, CUSTOMER_PROFIT, PROFIT_CENTRES, COST_CENTRES,
  marginPct, customerMargin, lakh,
} from '../../src/mocks/costingDemo';
import { fontStack, palette, type } from '../../src/theme/tokens';

const CHARTS = ['Product margin', 'Customer margin', 'PC margin', 'CC utilization', 'Cost trend', 'Yield trend', 'Production trend'] as const;

export default function ManagementAnalytics() {
  const { roles } = useSession();
  const loading = useMockLoading();
  const [chart, setChart] = useState<(typeof CHARTS)[number]>('Product margin');

  const costTrend = [3.42, 3.51, 3.48, 3.55, 3.58, 3.61];
  const yieldTrend = [93.6, 93.9, 94.0, 94.1, 94.0, 94.2];
  const prodTrend = [380, 410, 395, 430, 445, 460];

  function body() {
    switch (chart) {
      case 'Product margin':
        return <ChartCard title="Margin % by product" hint="SAMPLE" bars={PRODUCT_PROFIT.map((p) => ({ label: p.product, pct: Math.round(marginPct(p)) }))} />;
      case 'Customer margin':
        return <ChartCard title="Margin % by customer" hint="SAMPLE" bars={CUSTOMER_PROFIT.map((c) => ({ label: c.customer, pct: Math.round((customerMargin(c) / c.revenue) * 100) }))} />;
      case 'PC margin':
        return <ChartCard title="Margin % by profit centre" hint="SAMPLE" bars={PROFIT_CENTRES.map((p) => ({ label: `PC ${p.code}`, pct: Math.round(p.margin) }))} />;
      case 'CC utilization':
        return <ChartCard title="Cost-centre utilization %" hint="SAMPLE" bars={COST_CENTRES.filter((c) => c.util > 0).map((c) => ({ label: c.name, pct: c.util }))} />;
      case 'Cost trend':
        return <TrendCard title="Manufacturing cost (₹ Cr)" values={costTrend} suffix="Cr" />;
      case 'Yield trend':
        return <TrendCard title="Yield %" values={yieldTrend} suffix="%" />;
      default:
        return <TrendCard title="Production (t/month)" values={prodTrend} suffix="t" />;
    }
  }

  const headline =
    chart === 'Product margin' ? { v: `${Math.round(marginPct([...PRODUCT_PROFIT].sort((a, b) => marginPct(b) - marginPct(a))[0]!))}%`, h: 'Top product margin' } :
    chart === 'Customer margin' ? { v: lakh(Math.max(...CUSTOMER_PROFIT.map(customerMargin))), h: 'Best customer margin' } :
    chart === 'PC margin' ? { v: `${Math.max(...PROFIT_CENTRES.map((p) => p.margin)).toFixed(1)}%`, h: 'Best PC margin' } :
    chart === 'CC utilization' ? { v: `${Math.round(COST_CENTRES.filter((c) => c.util > 0).reduce((a, c) => a + c.util, 0) / COST_CENTRES.filter((c) => c.util > 0).length)}%`, h: 'Avg utilization' } :
    chart === 'Cost trend' ? { v: '₹3.61 Cr', h: 'Latest month cost' } :
    chart === 'Yield trend' ? { v: '94.2%', h: 'Latest yield' } :
    { v: '460 t', h: 'Latest production' };

  return (
    <AppShell roles={roles}>
      <PageHeader eyebrow="Insights" title="Management Analytics" sub="Margin, utilization and trend charts for management. SAMPLE data." right={<PeriodSelector />} />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 14 }}>
          <Tabs tabs={CHARTS} value={chart} onChange={(c) => setChart(c as (typeof CHARTS)[number])} />
          <KpiCard title={headline.h} value={headline.v} icon="trendingUp" />
          {body()}
        </View>
      )}
    </AppShell>
  );
}

function TrendCard({ title, values, suffix }: { title: string; values: number[]; suffix: string }) {
  const last = values[values.length - 1] ?? 0;
  const first = values[0] ?? 0;
  const delta = last - first;
  return (
    <Card style={{ gap: 10 }}>
      <SectionHeader title={title} description="Last 6 months (SAMPLE)" />
      <SparkBars values={values} height={60} tone="tint" />
      <View style={styles.trendFoot}>
        <Text style={styles.sub}>6-month change</Text>
        <Text style={[styles.delta, { color: delta >= 0 ? palette.success : palette.error }]}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)} {suffix}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  trendFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sub: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  delta: { ...type.footnote, fontWeight: '800', fontFamily: fontStack } as never,
});
