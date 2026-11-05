import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { DataTable, type Column } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { KeyVal } from '../../src/components/DetailDrawer';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { Icon } from '../../src/components/Icon';
import { useToast } from '../../src/components/Toast';
import { Button, Card, SectionHeader } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { TRAVELLERS, type DemoTraveller } from '../../src/mocks/costingDemo';
import { fontStack, palette, type } from '../../src/theme/tokens';

export default function TravellerTracking() {
  const { roles } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [sel, setSel] = useState<DemoTraveller>(TRAVELLERS[0]!);
  const [local, setLocal] = useState<DemoTraveller[]>(TRAVELLERS);

  function advance(): void {
    setLocal((ls) => ls.map((t) => {
      if (t.id !== sel.id) return t;
      const ci = t.stages.findIndex((s) => s.state === 'current');
      if (ci < 0 || ci >= t.stages.length - 1) return t;
      const stages = t.stages.map((s, i) => {
        if (i === ci) return { ...s, state: 'done' as const };
        if (i === ci + 1) return { ...s, state: 'current' as const };
        return s;
      });
      const next = { ...t, stages };
      setSel(next);
      return next;
    }));
    toast.show('Traveller advanced to the next process (SAMPLE).');
  }

  const current = local.find((t) => t.id === sel.id) ?? sel;
  const cols: Column<DemoTraveller>[] = [
    { key: 'id', header: 'Traveller', width: 120, render: (t) => <Text style={styles.cell}>{t.id}</Text> },
    { key: 'wo', header: 'WO', width: 140, render: (t) => <Text style={styles.sub}>{t.wo}</Text> },
    { key: 'heat', header: 'Heat', width: 120, render: (t) => <Text style={styles.sub}>{t.heat}</Text> },
    { key: 'flow', header: 'Flow', width: 80, render: (t) => <StatusChip label={t.flow} tone="neutral" /> },
    { key: 'cur', header: 'Current op', width: 170, render: (t) => <Text style={styles.sub}>{t.stages.find((s) => s.state === 'current')?.process ?? '—'}</Text> },
    { key: 'status', header: 'Status', width: 120, render: (t) => <StatusChip label={t.status} tone={t.status === 'Completed' ? 'ok' : t.status === 'At Inspection' ? 'warn' : 'info'} /> },
  ];

  return (
    <AppShell roles={roles}>
      <PageHeader eyebrow="Production" title="Traveller Tracking" sub="Manufacturing execution: current, previous and upcoming process on a visual timeline. SAMPLE data." />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 14 }}>
          <DataTable columns={cols} rows={local} onRowPress={setSel} emptyText="No travellers" />

          <Card style={{ gap: 12 }}>
            <View style={styles.head}>
              <View style={{ flex: 1, minWidth: 180 }}>
                <Text style={styles.travId}>{current.id}</Text>
                <Text style={styles.sub}>{current.wo} · {current.flow} flow</Text>
              </View>
              <StatusChip label={current.status} tone={current.status === 'Completed' ? 'ok' : current.status === 'At Inspection' ? 'warn' : 'info'} />
            </View>
            <View style={styles.kvRow}>
              <KeyVal k="Heat number" v={current.heat} />
              <KeyVal k="Operator" v={current.operator} />
            </View>

            <SectionHeader title="Process timeline" description="Previous ✓ · current ◉ · upcoming ○" />
            <View style={{ marginTop: 4 }}>
              {current.stages.map((s, i) => {
                const done = s.state === 'done'; const now = s.state === 'current';
                return (
                  <View key={i} style={styles.trow}>
                    <View style={styles.col}>
                      <View style={[styles.dot, done && styles.dotDone, now && styles.dotNow]}>
                        {done ? <Icon name="check" size={11} color="#fff" strokeWidth={3} /> : now ? <View style={styles.pulse} /> : null}
                      </View>
                      {i < current.stages.length - 1 ? <View style={[styles.line, done && { backgroundColor: palette.successBorder }]} /> : null}
                    </View>
                    <View style={{ flex: 1, paddingBottom: 14 }}>
                      <Text style={[styles.stageT, now && { color: palette.tint, fontWeight: '800' }]}>{s.process}</Text>
                      <Text style={styles.sub}>{s.machine} · CC {s.cc}{now ? ' · in progress' : done ? ' · complete' : ''}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button label="Advance stage" icon="chevronRight" onPress={advance} />
            </View>
          </Card>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  cell: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  travId: { ...type.title3, color: palette.text, fontFamily: fontStack } as never,
  kvRow: { gap: 2 },
  trow: { flexDirection: 'row', gap: 12 },
  col: { alignItems: 'center', width: 24 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.card, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: palette.success, borderColor: palette.success },
  dotNow: { borderColor: palette.tint, borderWidth: 2 },
  pulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.tint },
  line: { width: 1.5, flex: 1, minHeight: 16, backgroundColor: palette.border, marginVertical: 2 },
  stageT: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
});
