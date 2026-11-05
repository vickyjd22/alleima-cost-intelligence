import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { PeriodSelector } from '../../src/components/Filters';
import { StatusChip } from '../../src/components/StatusChip';
import { KpiCard } from '../../src/components/KpiCard';
import { Icon } from '../../src/components/Icon';
import { Button, Card, ProgressRing } from '../../src/components/ui';
import { ExportButton } from '../../src/components/ExportButton';
import { useSession } from '../../src/store/session';
import { WIP_STAGES, inr, lakh, type WipStage } from '../../src/mocks/costingDemo';
import { fontStack, palette, type } from '../../src/theme/tokens';

function ageTone(d: number): 'ok' | 'warn' | 'error' { return d <= 30 ? 'ok' : d <= 60 ? 'warn' : 'error'; }

export default function Wip() {
  const { roles } = useSession();
  const loading = useMockLoading();
  const { width } = useWindowDimensions();
  const row = width >= 980;
  const [sel, setSel] = useState<WipStage | null>(null);

  const total = WIP_STAGES.reduce((a, s) => a + s.cost, 0);
  const over30 = WIP_STAGES.filter((s) => s.ageDays > 30).length;
  const avgAge = Math.round(WIP_STAGES.reduce((a, s) => a + s.ageDays, 0) / WIP_STAGES.length);
  const blended = Math.round(WIP_STAGES.reduce((a, s) => a + s.yield, 0) / WIP_STAGES.length);

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Inventory"
        title="WIP Valuation"
        sub="Value work-in-progress across the manufacturing pipeline. SAMPLE data."
        right={<View style={{ flexDirection: 'row', gap: 8 }}><PeriodSelector /><ExportButton
          filename="wip-sample.csv"
          headers={['Stage', 'Qty kg', 'Cost', 'Yield %', 'Age days']}
          rows={WIP_STAGES.map((s) => [s.stage, s.qtyKg, s.cost, s.yield, s.ageDays])}
        /></View>}
      />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 16 }}>
          <View style={styles.kpis}>
            <KpiCard title="WIP total" value={lakh(total)} icon="boxes" />
            <KpiCard title="Lots > 30 days" value={String(over30)} status={over30 > 0 ? 'warn' : 'ok'} icon="clock" />
            <KpiCard title="Avg ageing" value={`${avgAge}d`} icon="timer" />
            <KpiCard title="Blended yield" value={`${blended}%`} icon="gauge" />
          </View>

          <View style={[styles.pipe, row && { flexDirection: 'row' }]}>
            {WIP_STAGES.map((s, i) => (
              <React.Fragment key={s.stage}>
                <Card style={[styles.stage, sel?.stage === s.stage && { borderColor: palette.tint }]}>
                  <Text style={styles.stageName} numberOfLines={1}>{s.stage}</Text>
                  <ProgressRing value={s.yield} size={56} stroke={6} color={palette.tint}>
                    <Text style={styles.ringT}>{s.yield}%</Text>
                  </ProgressRing>
                  <Text style={styles.stageQty}>{s.qtyKg.toLocaleString('en-IN')} kg</Text>
                  <Text style={styles.stageCost}>{lakh(s.cost)}</Text>
                  <StatusChip label={`${s.ageDays}d`} tone={ageTone(s.ageDays)} />
                  <Button label="Detail" variant="ghost" size="sm" onPress={() => setSel(sel?.stage === s.stage ? null : s)} />
                </Card>
                {row && i < WIP_STAGES.length - 1 ? (
                  <View style={styles.connector}><Icon name="chevronRight" size={16} color={palette.text3} /></View>
                ) : null}
              </React.Fragment>
            ))}
          </View>

          {sel ? (
            <Card style={{ gap: 6 }}>
              <Text style={styles.detailT}>{sel.stage} · lot detail</Text>
              <View style={styles.detailRow}><Text style={styles.sub}>Quantity</Text><Text style={styles.detailV}>{sel.qtyKg.toLocaleString('en-IN')} kg</Text></View>
              <View style={styles.detailRow}><Text style={styles.sub}>Cost to stage</Text><Text style={styles.detailV}>{inr(sel.cost)}</Text></View>
              <View style={styles.detailRow}><Text style={styles.sub}>Yield</Text><Text style={styles.detailV}>{sel.yield}%</Text></View>
              <View style={styles.detailRow}><Text style={styles.sub}>Ageing</Text><Text style={styles.detailV}>{sel.ageDays} days</Text></View>
            </Card>
          ) : null}
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  kpis: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  pipe: { gap: 10, alignItems: 'stretch' },
  stage: { flex: 1, minWidth: 150, alignItems: 'center', gap: 6, padding: 14 },
  stageName: { ...type.caption1, fontWeight: '700', color: palette.text, textAlign: 'center', fontFamily: fontStack } as never,
  ringT: { fontSize: 12, fontWeight: '800', color: palette.tint, fontFamily: fontStack },
  stageQty: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  stageCost: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  connector: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  detailT: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: palette.separator },
  sub: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
  detailV: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
});
