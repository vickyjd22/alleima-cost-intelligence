import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { CostBreakdownPanel } from '../../src/components/CostingPanels';
import { ApprovalTimeline } from '../../src/components/Governance';
import { Icon } from '../../src/components/Icon';
import { useToast } from '../../src/components/Toast';
import { Button, Card, DeltaPill, SectionHeader, Tabs } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { BOM_LINES, bomCostPerKg, inr2, type BomLine } from '../../src/mocks/costingDemo';
import { fontStack, palette, type } from '../../src/theme/tokens';

const SECTIONS = ['Raw Material', 'Consumables', 'Packaging'] as const;

export default function Bom() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const { width } = useWindowDimensions();
  const twoCol = width >= 1040;

  const [lines, setLines] = useState<BomLine[]>(BOM_LINES);
  const [section, setSection] = useState<(typeof SECTIONS)[number]>('Raw Material');

  const base = useMemo(() => bomCostPerKg(BOM_LINES), []);
  const cost = useMemo(() => bomCostPerKg(lines), [lines]);
  const delta = cost.total - base.total;

  function adjust(idx: number, field: 'qtyPerKg' | 'rate', dir: 1 | -1): void {
    setLines((ls) => ls.map((l, i) => {
      if (i !== idx) return l;
      if (field === 'qtyPerKg') return { ...l, qtyPerKg: Math.max(0, +(l.qtyPerKg + dir * 0.01).toFixed(3)) };
      return { ...l, rate: Math.max(0, l.rate + dir * 10) };
    }));
  }
  function save(): void {
    toast.show(`BOM v-next saved at ${inr2(cost.total)}/kg (SAMPLE — submitted for approval).`);
  }

  const sectionLines = lines.map((l, i) => ({ l, i })).filter(({ l }) => l.section === section);

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Master data"
        title="BOM Management"
        sub="Versioned bill of material with a live cost-impact panel. SAMPLE data, candidate costs."
      />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={[styles.layout, twoCol && { flexDirection: 'row', alignItems: 'flex-start' }]}>
          <View style={[styles.editor, twoCol && { flex: 2 }]}>
            <Tabs tabs={SECTIONS} value={section} onChange={(s) => setSection(s as (typeof SECTIONS)[number])} />
            <Card style={{ marginTop: 12, gap: 8 }}>
              <SectionHeader title={section} description="Adjust quantity or rate to see the cost impact instantly." />
              {sectionLines.map(({ l, i }) => (
                <View key={i} style={styles.lineRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.mat}>{l.material}</Text>
                    <Text style={styles.sub}>{l.qtyPerKg} /kg × {inr2(l.rate)}{l.scrap ? ` · scrap ${(l.scrap * 100).toFixed(0)}%` : ''}</Text>
                  </View>
                  <View style={styles.stepGroup}>
                    <Text style={styles.stepLabel}>qty</Text>
                    <Pressable style={styles.step} onPress={() => adjust(i, 'qtyPerKg', -1)} accessibilityRole="button" accessibilityLabel={`Decrease ${l.material} qty`}><Icon name="minus" size={13} color={palette.text2} strokeWidth={2.4} /></Pressable>
                    <Pressable style={styles.step} onPress={() => adjust(i, 'qtyPerKg', 1)} accessibilityRole="button" accessibilityLabel={`Increase ${l.material} qty`}><Icon name="plus" size={13} color={palette.text2} strokeWidth={2.4} /></Pressable>
                    <Text style={styles.stepLabel}>rate</Text>
                    <Pressable style={styles.step} onPress={() => adjust(i, 'rate', -1)} accessibilityRole="button" accessibilityLabel={`Decrease ${l.material} rate`}><Icon name="minus" size={13} color={palette.text2} strokeWidth={2.4} /></Pressable>
                    <Pressable style={styles.step} onPress={() => adjust(i, 'rate', 1)} accessibilityRole="button" accessibilityLabel={`Increase ${l.material} rate`}><Icon name="plus" size={13} color={palette.text2} strokeWidth={2.4} /></Pressable>
                  </View>
                  <Text style={styles.lineCost}>{inr2(l.qtyPerKg * l.rate)}</Text>
                </View>
              ))}
            </Card>
          </View>

          <View style={[styles.impact, twoCol && { flex: 1 }]}>
            <Card style={{ gap: 6 }}>
              <SectionHeader title="Live cost impact" description="Updates on every edit." />
              <View style={styles.impactHead}>
                <View>
                  <Text style={styles.impactValue}>{inr2(cost.total)}</Text>
                  <Text style={styles.sub}>per kg · BOM version cost</Text>
                </View>
                <DeltaPill value={`${delta >= 0 ? '+' : ''}${inr2(delta)}`} tone={delta > 0.01 ? 'up' : delta < -0.01 ? 'down' : 'flat'} label="vs v1" />
              </View>
            </Card>
            <CostBreakdownPanel
              lines={[
                { label: 'Raw material', value: inr2(cost.rm) },
                { label: 'Consumables', value: inr2(cost.consumable) },
                { label: 'Packaging', value: inr2(cost.packaging) },
                { label: 'BOM cost / kg', value: inr2(cost.total) },
              ]}
            />
            <ApprovalTimeline
              steps={[
                { label: 'Prepared by Engineering/Production', by: email ?? 'production', state: 'done' },
                { label: 'Reviewed by Costing', by: 'costing', state: 'now' },
                { label: 'Approved + effective', by: 'costing', state: 'todo' },
              ]}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button label="Save version" icon="download" onPress={save} />
            </View>
          </View>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  layout: { gap: 16 },
  editor: {},
  impact: { gap: 0 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: palette.separator, flexWrap: 'wrap' },
  mat: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  stepGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepLabel: { ...type.caption2, color: palette.text3, fontFamily: fontStack, marginLeft: 4 } as never,
  step: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.filled, alignItems: 'center', justifyContent: 'center' },
  lineCost: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack, minWidth: 80, textAlign: 'right' } as never,
  impactHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  impactValue: { fontSize: 26, fontWeight: '800', color: palette.text, fontFamily: fontStack, letterSpacing: -0.5 },
});
