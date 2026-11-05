import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { DataTable, type Column } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { KpiCard } from '../../src/components/KpiCard';
import { ExportButton } from '../../src/components/ExportButton';
import { Card, DeltaPill, SectionHeader } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { CUSTOMER_PROFIT, customerMargin, lakh, inr, type CustomerProfit } from '../../src/mocks/costingDemo';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

export default function CustomerProfitability() {
  const { roles } = useSession();
  const loading = useMockLoading();
  const [sel, setSel] = useState<CustomerProfit>(CUSTOMER_PROFIT[0]!);

  const mPct = (c: CustomerProfit) => (c.revenue > 0 ? (customerMargin(c) / c.revenue) * 100 : 0);
  const avg = CUSTOMER_PROFIT.reduce((a, c) => a + mPct(c), 0) / CUSTOMER_PROFIT.length;

  const steps: { label: string; amount: number; sign: 1 | -1 }[] = [
    { label: 'Revenue', amount: sel.revenue, sign: 1 },
    { label: '− Material', amount: sel.material, sign: -1 },
    { label: '− Conversion', amount: sel.conversion, sign: -1 },
    { label: '− Testing', amount: sel.testing, sign: -1 },
    { label: '− Packing', amount: sel.packing, sign: -1 },
    { label: '− Logistics', amount: sel.logistics, sign: -1 },
  ];
  const maxAmt = Math.max(...steps.map((s) => s.amount), 1);

  const cols: Column<CustomerProfit & { id: string }>[] = [
    { key: 'c', header: 'Customer', width: 180, render: (c) => <Text style={styles.cell}>{c.customer}</Text> },
    { key: 'rev', header: 'Revenue', width: 120, align: 'right', render: (c) => <Text style={styles.sub}>{lakh(c.revenue)}</Text> },
    { key: 'm', header: 'Margin', width: 120, align: 'right', render: (c) => <Text style={styles.cell}>{lakh(customerMargin(c))}</Text> },
    { key: 'pct', header: 'Margin %', width: 110, render: (c) => <StatusChip label={`${mPct(c).toFixed(1)}%`} tone={mPct(c) >= 20 ? 'ok' : mPct(c) >= 15 ? 'warn' : 'error'} /> },
  ];

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Profitability"
        title="Customer Profitability"
        sub="Interactive margin waterfall per customer. Select a row to update the waterfall. SAMPLE data."
        right={<ExportButton filename="customer-profitability.csv" headers={['Customer', 'Revenue', 'Margin', 'Margin %']} rows={CUSTOMER_PROFIT.map((c) => [c.customer, c.revenue, customerMargin(c), mPct(c).toFixed(1)])} />}
      />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 16 }}>
          <DataTable columns={cols} rows={CUSTOMER_PROFIT.map((c) => ({ ...c, id: c.customer }))} onRowPress={setSel} emptyText="No customers" />

          <View style={styles.kpis}>
            <KpiCard title={`${sel.customer} — margin`} value={lakh(customerMargin(sel))} icon="trendingUp" status={mPct(sel) >= 20 ? 'ok' : 'warn'} />
            <Card style={styles.pctCard}>
              <Text style={styles.pctValue}>{mPct(sel).toFixed(1)}%</Text>
              <Text style={styles.sub}>margin</Text>
              <DeltaPill value={`${mPct(sel) - avg >= 0 ? '+' : ''}${(mPct(sel) - avg).toFixed(1)}pp`} tone={mPct(sel) - avg >= 0 ? 'up' : 'down'} label="vs avg" />
            </Card>
          </View>

          <Card style={{ gap: 10 }}>
            <SectionHeader title="Margin waterfall" description="Revenue → costs → margin" />
            {steps.map((s) => (
              <View key={s.label} style={styles.bar}>
                <View style={styles.barHead}>
                  <Text style={styles.barLabel}>{s.label}</Text>
                  <Text style={[styles.barValue, { color: s.sign > 0 ? palette.text : palette.text2 }]}>{s.sign < 0 ? '−' : ''}{inr(s.amount)}</Text>
                </View>
                <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(3, (s.amount / maxAmt) * 100)}%`, backgroundColor: s.sign > 0 ? palette.tint : palette.borderStrong }]} /></View>
              </View>
            ))}
            <View style={styles.marginFinal}>
              <Text style={styles.marginFinalLabel}>= Margin</Text>
              <Text style={styles.marginFinalValue}>{inr(customerMargin(sel))} · {mPct(sel).toFixed(1)}%</Text>
            </View>
          </Card>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  cell: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
  kpis: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  pctCard: { flex: 1, minWidth: 160, gap: 4, padding: 16 },
  pctValue: { fontSize: 30, fontWeight: '800', color: palette.text, fontFamily: fontStack, letterSpacing: -0.6 },
  bar: { gap: 5 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  barLabel: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  barValue: { ...type.caption1, fontWeight: '700', fontFamily: fontStack } as never,
  track: { height: 10, backgroundColor: palette.bgAlt, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: 10, borderRadius: radius.pill },
  marginFinal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 12, marginTop: 4 },
  marginFinalLabel: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  marginFinalValue: { ...type.headline, fontWeight: '800', color: palette.tint, fontFamily: fontStack } as never,
});
