import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { DataTable, type Column } from '../../src/components/DataTable';
import { ChartCard, CostBreakdownPanel } from '../../src/components/CostingPanels';
import { StatusChip } from '../../src/components/StatusChip';
import { DetailDrawer } from '../../src/components/DetailDrawer';
import { ExportButton } from '../../src/components/ExportButton';
import { Card, Tabs } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { PRODUCT_PROFIT, margin, marginPct, lakh, inr, type ProductProfit } from '../../src/mocks/costingDemo';
import { fontStack, palette, radius, type, toneColors } from '../../src/theme/tokens';

const VIEWS = ['Grid', 'Chart', 'Heatmap'] as const;

function marginTone(m: number): 'ok' | 'warn' | 'error' { return m >= 25 ? 'ok' : m >= 18 ? 'warn' : 'error'; }

export default function ProductProfitability() {
  const { roles } = useSession();
  const loading = useMockLoading();
  const [view, setView] = useState<(typeof VIEWS)[number]>('Grid');
  const [open, setOpen] = useState<ProductProfit | null>(null);

  const sorted = [...PRODUCT_PROFIT].sort((a, b) => marginPct(b) - marginPct(a));

  const cols: Column<ProductProfit & { id: string }>[] = [
    { key: 'p', header: 'Product', width: 200, render: (p) => <Text style={styles.cell}>{p.product}</Text> },
    { key: 'rev', header: 'Revenue', width: 110, align: 'right', render: (p) => <Text style={styles.sub}>{lakh(p.revenue)}</Text> },
    { key: 'mat', header: 'Material', width: 110, align: 'right', render: (p) => <Text style={styles.sub}>{lakh(p.material)}</Text> },
    { key: 'conv', header: 'Conversion', width: 110, align: 'right', render: (p) => <Text style={styles.sub}>{lakh(p.conversion)}</Text> },
    { key: 'margin', header: 'Margin', width: 110, align: 'right', render: (p) => <Text style={styles.cell}>{lakh(margin(p))}</Text> },
    { key: 'pct', header: 'Margin %', width: 110, render: (p) => <StatusChip label={`${marginPct(p).toFixed(1)}%`} tone={marginTone(marginPct(p))} /> },
  ];

  const groups = [...new Set(PRODUCT_PROFIT.map((p) => p.gradeGroup))];
  const flows = [...new Set(PRODUCT_PROFIT.map((p) => p.flow))];

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Profitability"
        title="Product Profitability"
        sub="Revenue, material, conversion and margin by product. SAMPLE data."
        right={<ExportButton filename="product-profitability.csv" headers={['Product', 'Revenue', 'Material', 'Conversion', 'Margin', 'Margin %']} rows={sorted.map((p) => [p.product, p.revenue, p.material, p.conversion, margin(p), marginPct(p).toFixed(1)])} />}
      />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 14 }}>
          <Tabs tabs={VIEWS} value={view} onChange={(v) => setView(v as (typeof VIEWS)[number])} />

          {view === 'Grid' ? (
            <DataTable columns={cols} rows={sorted.map((p) => ({ ...p, id: p.product }))} onRowPress={setOpen} emptyText="No data" />
          ) : view === 'Chart' ? (
            <ChartCard title="Margin % by product" bars={sorted.map((p) => ({ label: p.product, pct: Math.round(marginPct(p)) }))} hint="SAMPLE" />
          ) : (
            <Card style={{ gap: 8 }}>
              <View style={styles.hmHead}>
                <Text style={[styles.hmCorner]}>Group \ Flow</Text>
                {flows.map((f) => <Text key={f} style={styles.hmCol}>{f}</Text>)}
              </View>
              {groups.map((g) => (
                <View key={g} style={styles.hmRow}>
                  <Text style={styles.hmRowLabel}>{g}</Text>
                  {flows.map((f) => {
                    const p = PRODUCT_PROFIT.find((x) => x.gradeGroup === g && x.flow === f);
                    if (!p) return <View key={f} style={[styles.hmCell, { backgroundColor: palette.bgAlt }]}><Text style={styles.hmEmpty}>—</Text></View>;
                    const c = toneColors(marginTone(marginPct(p)) === 'ok' ? 'ok' : marginTone(marginPct(p)) === 'warn' ? 'warn' : 'error');
                    return <View key={f} style={[styles.hmCell, { backgroundColor: c.bg, borderColor: c.border }]}><Text style={[styles.hmPct, { color: c.fg }]}>{marginPct(p).toFixed(0)}%</Text></View>;
                  })}
                </View>
              ))}
            </Card>
          )}
        </View>
      )}

      <DetailDrawer visible={!!open} title={open?.product ?? ''} onClose={() => setOpen(null)}>
        {open ? (
          <CostBreakdownPanel
            lines={[
              { label: 'Revenue', value: inr(open.revenue) },
              { label: '− Material', value: inr(open.material) },
              { label: '− Conversion', value: inr(open.conversion) },
              { label: `= Margin (${marginPct(open).toFixed(1)}%)`, value: inr(margin(open)) },
            ]}
          />
        ) : null}
      </DetailDrawer>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  cell: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
  hmHead: { flexDirection: 'row', gap: 6 },
  hmCorner: { ...type.caption2, color: palette.text3, flex: 2, fontFamily: fontStack } as never,
  hmCol: { ...type.caption2, color: palette.text3, flex: 1, textAlign: 'center', fontFamily: fontStack } as never,
  hmRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  hmRowLabel: { ...type.caption1, color: palette.text, flex: 2, fontWeight: '600', fontFamily: fontStack } as never,
  hmCell: { flex: 1, borderRadius: radius.sm, borderWidth: 1, borderColor: 'transparent', paddingVertical: 12, alignItems: 'center' },
  hmPct: { ...type.footnote, fontWeight: '800', fontFamily: fontStack } as never,
  hmEmpty: { ...type.footnote, color: palette.text3, fontFamily: fontStack } as never,
});
