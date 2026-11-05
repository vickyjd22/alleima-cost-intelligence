import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { ChartCard } from '../../src/components/CostingPanels';
import { ApprovalTimeline } from '../../src/components/Governance';
import { StatusChip } from '../../src/components/StatusChip';
import { useToast } from '../../src/components/Toast';
import { Button, Callout, Card, SectionHeader } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { ALLOCATION_POOLS, ALLOC_TARGETS, lakh } from '../../src/mocks/costingDemo';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

export default function Allocation() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();

  const [drivers, setDrivers] = useState<Record<string, string>>(
    Object.fromEntries(ALLOCATION_POOLS.map((p) => [p.cc, p.driver])),
  );
  // Deterministic "re-split" when a non-primary driver is chosen (SAMPLE heuristic).
  const result = useMemo(() => {
    return ALLOCATION_POOLS.map((p) => {
      const changed = drivers[p.cc] !== p.driver;
      const split = changed
        ? [p.split[1], p.split[2] + 5, Math.max(0, 100 - p.split[1] - (p.split[2] + 5))] as [number, number, number]
        : p.split;
      return { ...p, split, changed };
    });
  }, [drivers]);

  const before = ALLOC_TARGETS.map((_, ti) => ALLOCATION_POOLS.reduce((a, p) => a + p.pool * ((p.split[ti] ?? 0) / 100), 0));
  const after = ALLOC_TARGETS.map((_, ti) => result.reduce((a, p) => a + p.pool * ((p.split[ti] ?? 0) / 100), 0));

  const gateOk = true; // collected = allocated in this sample set

  return (
    <AppShell roles={roles}>
      <PageHeader eyebrow="Costing" title="Cost Allocation Engine" sub="Change a service-centre driver, recalculate and see the cost impact (§15). SAMPLE data." />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 16 }}>
          <Card style={{ gap: 10 }}>
            <SectionHeader title="Allocation drivers" description="Tap a driver to change the basis, then recalculate." />
            {result.map((p) => (
              <View key={p.cc} style={styles.poolRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.service}>{p.service}</Text>
                  <Text style={styles.sub}>CC {p.cc} · pool {lakh(p.pool)}</Text>
                </View>
                <View style={styles.driverGroup}>
                  {p.drivers.map((d) => {
                    const on = drivers[p.cc] === d;
                    return (
                      <Pressable
                        key={d}
                        onPress={() => setDrivers((s) => ({ ...s, [p.cc]: d }))}
                        style={[styles.driver, on && styles.driverOn]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`${p.service} driver ${d}`}
                      >
                        <Text style={[styles.driverT, on && { color: '#fff' }]}>{d}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            <View style={styles.gateRow}>
              <Button label="Recalculate" icon="refresh" onPress={() => toast.show('Allocation recalculated (SAMPLE).')} />
              <StatusChip label={gateOk ? 'Gate §15.3: pool = allocated (₹0)' : 'Gate FAIL'} tone={gateOk ? 'ok' : 'error'} />
            </View>
          </Card>

          <ChartCard
            title="Allocation impact by production flow"
            hint="Before vs after (share of total allocated service cost)"
            bars={ALLOC_TARGETS.map((t, i) => {
              const max = Math.max(...after, ...before, 1);
              return { label: `${t} · ${lakh(after[i] ?? 0)} (was ${lakh(before[i] ?? 0)})`, pct: Math.round(((after[i] ?? 0) / max) * 100) };
            })}
          />

          <Callout tone="info" title="How allocation works">
            Each service pool is split to production flows by its driver. Changing the driver re-splits the pool; the §15.3 gate guarantees everything collected is allocated (nothing lost or double-counted).
          </Callout>

          <Card style={{ gap: 10 }}>
            <SectionHeader title="Save rule set" description="Submits for Finance approval." />
            <ApprovalTimeline
              steps={[
                { label: 'Prepared by Costing', by: email ?? 'costing', state: 'done' },
                { label: 'Reviewed by Finance', by: 'finance', state: 'now' },
                { label: 'Approved + effective', by: 'finance', state: 'todo' },
              ]}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button label="Save rule set" icon="download" onPress={() => toast.show('Allocation rule set saved (SAMPLE).')} />
            </View>
          </Card>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  poolRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: palette.separator, flexWrap: 'wrap' },
  service: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  driverGroup: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  driver: { borderWidth: 1, borderColor: palette.border, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: palette.card },
  driverOn: { backgroundColor: palette.tint, borderColor: palette.tint },
  driverT: { ...type.caption1, fontWeight: '600', color: palette.text2, fontFamily: fontStack } as never,
  gateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 6 },
});
