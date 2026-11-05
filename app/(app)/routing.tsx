import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { StatusChip } from '../../src/components/StatusChip';
import { Icon } from '../../src/components/Icon';
import { useToast } from '../../src/components/Toast';
import { Button, Card, ProgressBar, SectionHeader, Tabs } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { ROUTES, ROUTE_KEYS, cumulativeYield, inr, type RouteKey, type RouteOp } from '../../src/mocks/costingDemo';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

export default function Routing() {
  const { roles } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [flow, setFlow] = useState<RouteKey>('HF');
  const [ops, setOps] = useState<RouteOp[]>(ROUTES.HF!);

  function switchFlow(f: RouteKey): void { setFlow(f); setOps(ROUTES[f]!); }
  function move(idx: number, dir: -1 | 1): void {
    setOps((o) => {
      const t = idx + dir;
      if (t < 0 || t >= o.length) return o;
      const next = [...o];
      [next[idx], next[t]] = [next[t]!, next[idx]!];
      return next.map((op, i) => ({ ...op, seq: i + 1 }));
    });
  }
  function remove(idx: number): void {
    setOps((o) => o.filter((_, i) => i !== idx).map((op, i) => ({ ...op, seq: i + 1 })));
    toast.show('Process removed — cumulative yield recalculated.');
  }
  function insert(idx: number): void {
    setOps((o) => {
      const next = [...o];
      next.splice(idx + 1, 0, { seq: 0, process: 'New process', cc: '—', machineHrs: 0.5, labourHrs: 0.3, yield: 99, setup: 500 });
      return next.map((op, i) => ({ ...op, seq: i + 1 }));
    });
  }

  const cumYield = cumulativeYield(ops);
  const totalMachine = ops.reduce((a, o) => a + o.machineHrs, 0);
  const totalLabour = ops.reduce((a, o) => a + o.labourHrs, 0);
  const totalSetup = ops.reduce((a, o) => a + o.setup, 0);

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Master data"
        title="Routing Designer"
        sub="Design the process route; reorder, insert or remove steps and watch cumulative yield change. SAMPLE data."
        right={<Button label="Save version" icon="download" onPress={() => toast.show(`${flow} routing v-next saved (SAMPLE).`)} />}
      />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 14 }}>
          <Tabs tabs={ROUTE_KEYS} value={flow} onChange={(f) => switchFlow(f as RouteKey)} />

          <View style={{ gap: 8 }}>
            {ops.map((op, i) => (
              <Card key={`${op.seq}-${op.process}`} style={styles.node}>
                <View style={styles.seq}><Text style={styles.seqT}>{op.seq}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.proc} numberOfLines={1}>{op.process}</Text>
                  <View style={styles.meta}>
                    <StatusChip label={`CC ${op.cc}`} tone={op.cc === '—' ? 'warn' : 'neutral'} />
                    <Text style={styles.metaT}>⏱ {op.machineHrs}h</Text>
                    <Text style={styles.metaT}>👷 {op.labourHrs}h</Text>
                    <Text style={styles.metaT}>yield {op.yield}%</Text>
                    <Text style={styles.metaT}>setup {inr(op.setup)}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Pressable style={styles.act} onPress={() => move(i, -1)} accessibilityRole="button" accessibilityLabel="Move up"><Icon name="arrowUp" size={14} color={palette.text2} strokeWidth={2.2} /></Pressable>
                  <Pressable style={styles.act} onPress={() => move(i, 1)} accessibilityRole="button" accessibilityLabel="Move down"><Icon name="arrowDown" size={14} color={palette.text2} strokeWidth={2.2} /></Pressable>
                  <Pressable style={styles.act} onPress={() => insert(i)} accessibilityRole="button" accessibilityLabel="Insert below"><Icon name="plus" size={14} color={palette.tint} strokeWidth={2.2} /></Pressable>
                  <Pressable style={styles.act} onPress={() => remove(i)} accessibilityRole="button" accessibilityLabel="Remove"><Icon name="x" size={14} color={palette.error} strokeWidth={2.2} /></Pressable>
                </View>
              </Card>
            ))}
          </View>

          <Card style={{ gap: 10 }}>
            <SectionHeader title="Route summary" description={`${ops.length} operations`} />
            <View style={styles.sumRow}>
              <Summary label="Cumulative yield" value={`${cumYield.toFixed(1)}%`} />
              <Summary label="Machine hrs" value={`${totalMachine.toFixed(1)}`} />
              <Summary label="Labour hrs" value={`${totalLabour.toFixed(1)}`} />
              <Summary label="Total setup" value={inr(totalSetup)} />
            </View>
            <ProgressBar value={cumYield} />
          </Card>
        </View>
      )}
    </AppShell>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.sumCell}>
      <Text style={styles.sumLabel}>{label}</Text>
      <Text style={styles.sumValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  node: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, flexWrap: 'wrap' },
  seq: { width: 28, height: 28, borderRadius: 14, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  seqT: { ...type.caption1, fontWeight: '800', color: palette.tint, fontFamily: fontStack } as never,
  proc: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' },
  metaT: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  actions: { flexDirection: 'row', gap: 6 },
  act: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.card, alignItems: 'center', justifyContent: 'center' },
  sumRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  sumCell: { flex: 1, minWidth: 110, backgroundColor: palette.bgAlt, borderRadius: radius.sm, padding: 10 },
  sumLabel: { ...type.caption2, color: palette.text3, fontFamily: fontStack } as never,
  sumValue: { ...type.title3, color: palette.text, marginTop: 3, fontFamily: fontStack, fontVariant: ['tabular-nums'] } as never,
});
