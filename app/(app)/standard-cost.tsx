import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { CostBreakdownPanel, ChartCard } from '../../src/components/CostingPanels';
import { ApprovalTimeline } from '../../src/components/Governance';
import { KpiCard } from '../../src/components/KpiCard';
import { FeatureHelp } from '../../src/components/FeatureHelp';
import { useToast } from '../../src/components/Toast';
import { Button, Card, SectionHeader, Tabs, DeltaPill } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { useSession } from '../../src/store/session';
import { SAMPLE_PRODUCTS } from '../../src/data/sample';
import { machineHourRate, yieldPct } from '../../src/lib/costing';
import { displayFontStack, fontStack, palette, radius, type } from '../../src/theme/tokens';

/**
 * Standard Cost Simulator (blueprint module 7).
 *
 * Interactive what-if costing: pick product / grade / quantity / route and the
 * material, consumable, labour, machine, utility and overhead elements build
 * into a cost waterfall and a final standard cost, recalculating instantly.
 *
 * SAMPLE data + candidate formulas only (same policy as src/lib/costing.ts) —
 * machine element uses the real machineHourRate(), yield uses the real
 * yieldPct(); other per-kg rates are illustrative sample constants so the
 * simulation is deterministic and reproducible. Nothing is persisted.
 */

const ROUTES = ['HF', 'CF', 'U-Bend'] as const;
type RouteKey = (typeof ROUTES)[number];

/** Per-route process profile (SAMPLE). machineHrsPer1000kg + practical-hour pool feed the real MHR. */
const ROUTE_PROFILE: Record<RouteKey, {
  label: string;
  machineHrsPer1000kg: number;
  annualMachinePool: number; // ₹/yr allocable to the machine CC (SAMPLE)
  practicalHours: number; // practical machine hours/yr (SAMPLE, CAS-2)
  labourPerKg: number; // ₹/kg (SAMPLE)
  utilityPerKg: number; // ₹/kg (SAMPLE)
  overheadPerKg: number; // ₹/kg (SAMPLE)
  consumablePerKg: number; // ₹/kg (SAMPLE)
  setupCost: number; // ₹ one-off per batch (SAMPLE)
  stdYield: number; // % good output (SAMPLE)
}> = {
  HF: { label: 'Hot Flow', machineHrsPer1000kg: 1.3, annualMachinePool: 12_000_000, practicalHours: 6000, labourPerKg: 9, utilityPerKg: 14, overheadPerKg: 22, consumablePerKg: 18, setupCost: 42_000, stdYield: 94.2 },
  CF: { label: 'Cold Flow', machineHrsPer1000kg: 1.8, annualMachinePool: 9_600_000, practicalHours: 5200, labourPerKg: 12, utilityPerKg: 17, overheadPerKg: 24, consumablePerKg: 21, setupCost: 38_000, stdYield: 95.4 },
  'U-Bend': { label: 'U-Bending', machineHrsPer1000kg: 2.4, annualMachinePool: 7_200_000, practicalHours: 4200, labourPerKg: 16, utilityPerKg: 19, overheadPerKg: 28, consumablePerKg: 24, setupCost: 51_000, stdYield: 97.0 },
};

/** Per-grade base metal rate ₹/kg (SAMPLE). */
const GRADE_RATE: Record<string, number> = { '304': 470, '2205': 612 };

/** Current approved standard ₹/kg per product (SAMPLE) — the baseline we compare against. */
const CURRENT_STANDARD: Record<string, number> = {
  'SAMPLE-TUBE-304-50': 616,
  'SAMPLE-TUBE-2205-38': 790,
};

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const inr2 = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function StandardCostSimulator() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const { width } = useWindowDimensions();
  const twoCol = width >= 1040;

  const [productId, setProductId] = useState(SAMPLE_PRODUCTS[0]!.id);
  const [route, setRoute] = useState<RouteKey>('HF');
  const [qty, setQty] = useState(5000);
  const [qtyText, setQtyText] = useState('5000');

  const product = SAMPLE_PRODUCTS.find((p) => p.id === productId) ?? SAMPLE_PRODUCTS[0]!;

  const calc = useMemo(() => {
    const p = ROUTE_PROFILE[route];
    const q = Math.max(0, qty);
    const metalRate = GRADE_RATE[product.grade] ?? 470;

    // Material: good output needs more input because of yield loss (real yieldPct()).
    const yieldFraction = Number(yieldPct(p.stdYield, 100)) / 100; // normalise the sample yield %
    const inputKg = yieldFraction > 0 ? q / yieldFraction : q;
    const materialTotal = inputKg * metalRate;

    // Machine: real MHR × machine hours for this batch.
    const machineHrs = (q / 1000) * p.machineHrsPer1000kg;
    const mhr = Number(machineHourRate({ annualAllocableCost: p.annualMachinePool, practicalHours: p.practicalHours }));
    const machineTotal = mhr * machineHrs;

    const consumableTotal = q * p.consumablePerKg;
    const labourTotal = q * p.labourPerKg;
    const utilityTotal = q * p.utilityPerKg;
    const overheadTotal = q * p.overheadPerKg + p.setupCost; // setup amortised across the batch

    const total = materialTotal + consumableTotal + labourTotal + machineTotal + utilityTotal + overheadTotal;
    const perKg = q > 0 ? total / q : 0;

    const elements = [
      { key: 'Material', total: materialTotal, icon: 'package' as const },
      { key: 'Consumable', total: consumableTotal, icon: 'flask' as const },
      { key: 'Labour', total: labourTotal, icon: 'users' as const },
      { key: 'Machine', total: machineTotal, icon: 'factory' as const },
      { key: 'Utility', total: utilityTotal, icon: 'zap' as const },
      { key: 'Overhead', total: overheadTotal, icon: 'layers' as const },
    ];

    return { perKg, total, elements, mhr, machineHrs, inputKg, yieldPctValue: p.stdYield };
  }, [route, qty, product.grade]);

  const current = CURRENT_STANDARD[productId] ?? 0;
  const deltaPerKg = calc.perKg - current;
  const deltaTone: 'up' | 'down' | 'flat' = deltaPerKg > 0.5 ? 'up' : deltaPerKg < -0.5 ? 'down' : 'flat';

  const maxElement = Math.max(...calc.elements.map((e) => e.total), 1);
  const waterfallBars = calc.elements.map((e) => ({
    label: `${e.key} ${inr(e.total)}`,
    pct: Math.round((e.total / maxElement) * 100),
  }));
  const breakdownLines = [
    ...calc.elements.map((e) => ({ label: `${e.key} cost`, value: inr2(e.total) })),
    { label: 'Total standard cost (batch)', value: inr2(calc.total) },
    { label: `Standard cost per kg (${product.uom})`, value: inr2(calc.perKg) },
  ];

  function setQtyFromText(t: string): void {
    setQtyText(t);
    const n = Number(t.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(n)) setQty(n);
  }
  function stepQty(delta: number): void {
    const n = Math.max(0, qty + delta);
    setQty(n);
    setQtyText(String(n));
  }
  function saveVersion(): void {
    toast.show(`Standard v-next saved for ${productId} @ ${inr2(calc.perKg)}/kg (SAMPLE — submitted for Finance approval).`);
  }

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Costing"
        title="Standard Cost Simulator"
        sub="Pick product, grade, quantity and route — the cost waterfall recalculates instantly. Candidate formulas, SAMPLE data."
      />
      <DemoBanner />

      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={[styles.layout, twoCol && { flexDirection: 'row', alignItems: 'flex-start' }]}>
          {/* ---- Inputs ------------------------------------------------- */}
          <Card style={[styles.inputs, twoCol && { width: 340 }]}>
            <SectionHeader title="Inputs" description="Change any input to recalculate." />

            <Text style={styles.label}>PRODUCT</Text>
            <View style={styles.pickGroup}>
              {SAMPLE_PRODUCTS.map((p) => {
                const on = p.id === productId;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setProductId(p.id)}
                    style={[styles.pick, on && styles.pickOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={p.id}
                  >
                    <Text style={[styles.pickT, on && styles.pickTOn]} numberOfLines={1}>{p.id}</Text>
                    <Text style={[styles.pickS, on && styles.pickSOn]}>Grade {p.grade} · {p.gradeGroup}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.readRow}>
              <View style={styles.readCell}>
                <Text style={styles.label}>GRADE</Text>
                <Text style={styles.readVal}>{product.grade}</Text>
              </View>
              <View style={styles.readCell}>
                <Text style={styles.label}>GROUP</Text>
                <Text style={styles.readVal}>{product.gradeGroup}</Text>
              </View>
              <View style={styles.readCell}>
                <Text style={styles.label}>UOM</Text>
                <Text style={styles.readVal}>{product.uom}</Text>
              </View>
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>QUANTITY (kg)</Text>
            <View style={styles.qtyRow}>
              <Pressable onPress={() => stepQty(-500)} style={styles.step} accessibilityRole="button" accessibilityLabel="Decrease quantity">
                <Icon name="minus" size={16} color={palette.text2} strokeWidth={2.4} />
              </Pressable>
              <TextInput
                value={qtyText}
                onChangeText={setQtyFromText}
                keyboardType="numeric"
                style={styles.qtyInput}
                accessibilityLabel="Quantity in kg"
              />
              <Pressable onPress={() => stepQty(500)} style={styles.step} accessibilityRole="button" accessibilityLabel="Increase quantity">
                <Icon name="plus" size={16} color={palette.text2} strokeWidth={2.4} />
              </Pressable>
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>ROUTE</Text>
            <Tabs tabs={ROUTES} value={route} onChange={(r) => setRoute(r as RouteKey)} style={{ marginTop: 6 }} />
            <Text style={styles.routeHint}>
              {ROUTE_PROFILE[route].label} · MHR {inr2(calc.mhr)}/hr · {calc.machineHrs.toFixed(1)} machine hrs · std yield {calc.yieldPctValue}%
            </Text>

            <View style={{ marginTop: 14 }}>
              <FeatureHelp
                purpose="Simulate a product's standard cost before committing a new standard, so Costing can see the full build-up and the delta versus the current approved standard."
                who="Costing prepares; Finance reviews and approves the resulting standard version."
                inputs="Product, grade, batch quantity and process route."
                process="Material is grossed up for yield loss; the machine element uses the real machine-hour rate (pool ÷ practical hours); consumable, labour, utility and overhead apply per-kg rates with setup amortised across the batch."
                outputs="Per-element cost, a cost waterfall, final standard cost per kg and per batch, and the delta versus the current standard."
                dependencies="BOM (material), Routing (machine/labour hours, yield) and the rate tables per cost centre."
                controls="Saving a version submits for Finance approval under maker-checker; approved standards become effective-dated and immutable."
                exceptions="A route with an unvalidated cost centre, or a product with no approved BOM/routing, blocks a real save."
                benefit="Faster, traceable standard-setting and clear what-if analysis for quoting and cost control."
                measurement="Delta vs current standard; variance of actuals against the approved standard once production runs."
                limitations="Candidate formulas and SAMPLE rates only — not approved accounting rules; Finance sign-off is required before use."
              />
            </View>
          </Card>

          {/* ---- Output ------------------------------------------------- */}
          <View style={[styles.output, twoCol && { flex: 1 }]}>
            <KpiCard
              title="Standard cost per kg"
              value={inr2(calc.perKg)}
              status={deltaTone === 'up' ? 'warn' : deltaTone === 'down' ? 'ok' : undefined}
              icon="calculator"
              hint={current ? `Current approved standard ${inr2(current)}/kg` : 'No current standard on record'}
            />
            <View style={styles.deltaRow}>
              <DeltaPill
                value={`${deltaPerKg >= 0 ? '+' : ''}${inr2(deltaPerKg)}/kg`}
                tone={deltaTone}
                label="vs current standard"
              />
              <Text style={styles.batchTotal}>Batch total {inr2(calc.total)} · {qty.toLocaleString('en-IN')} kg</Text>
            </View>

            <ChartCard title="Cost waterfall" hint="Element contribution to the standard cost (SAMPLE)" bars={waterfallBars} />

            <CostBreakdownPanel lines={breakdownLines} />

            <Card style={{ marginTop: 14, gap: 12 }}>
              <SectionHeader title="Save as standard version" description="Submits for Finance approval (maker ≠ checker). SAMPLE — nothing is persisted." />
              <ApprovalTimeline
                steps={[
                  { label: 'Prepared by Costing', by: email ?? 'costing', state: 'done' },
                  { label: 'Reviewed by Finance', by: 'finance', state: 'now' },
                  { label: 'Approved + effective', by: 'finance', state: 'todo' },
                ]}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button label="Save standard version" icon="download" onPress={saveVersion} />
              </View>
            </Card>
          </View>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  layout: { gap: 16 },
  inputs: { gap: 10, padding: 18 },
  output: { gap: 0 },

  label: { ...type.caption2, color: palette.text3, fontFamily: fontStack, letterSpacing: 0.8 } as never,

  pickGroup: { gap: 8 },
  pick: { borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: palette.card } as never,
  pickOn: { borderColor: palette.tint, backgroundColor: palette.tintSoft },
  pickT: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  pickTOn: { color: palette.tintPressed },
  pickS: { ...type.caption1, color: palette.text3, marginTop: 1, fontFamily: fontStack } as never,
  pickSOn: { color: palette.tintPressed },

  readRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  readCell: { flex: 1, backgroundColor: palette.bgAlt, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 8 },
  readVal: { ...type.footnote, fontWeight: '700', color: palette.text, marginTop: 3, fontFamily: fontStack } as never,

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  step: { width: 40, height: 44, borderRadius: radius.input, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.filled, alignItems: 'center', justifyContent: 'center' },
  qtyInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    borderRadius: radius.input,
    paddingHorizontal: 12,
    fontSize: 17,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'center',
    fontFamily: displayFontStack,
    fontVariant: ['tabular-nums'],
    outlineStyle: 'none',
  } as never,

  routeHint: { ...type.caption1, color: palette.text2, marginTop: 8, fontFamily: fontStack } as never,

  deltaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 10 },
  batchTotal: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
});
