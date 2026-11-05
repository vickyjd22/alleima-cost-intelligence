import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { StatusChip } from '../../src/components/StatusChip';
import { Icon } from '../../src/components/Icon';
import { ExportButton } from '../../src/components/ExportButton';
import { useToast } from '../../src/components/Toast';
import { Button, Card, ProgressRing, SectionHeader } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { AUDIT_METRICS, auditScore, type AuditMetric } from '../../src/mocks/costingDemo';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

const DETAIL: Record<string, string[]> = {
  bom: ['SAMPLE-UBEND-316-25 — no approved BOM', 'SAMPLE-TUBE-2205-38 — BOM draft only'],
  routing: ['SAMPLE-UBEND-316-25 — routing missing SR Furnace CC'],
  cc: ['820410205 — department blank (§4.5)', 'SR Furnace — cost centre unvalidated'],
  recon: ['INV-0 (invoice blank) — SO-1043', 'Unknown PC 999 — SO-1044'],
  alloc: ['Allocation gate imbalance ₹250 (demo)'],
};

export default function AuditReadiness() {
  const { roles } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [metrics, setMetrics] = useState<AuditMetric[]>(AUDIT_METRICS);
  const [open, setOpen] = useState<string | null>(null);

  const score = auditScore(metrics);
  const band = score >= 95 ? 'ok' : score >= 85 ? 'warn' : 'error';

  function resolveOne(key: string): void {
    setMetrics((ms) => ms.map((m) => (m.key === key ? { ...m, count: Math.max(0, m.count - 1) } : m)));
    toast.show('Exception resolved (SAMPLE) — readiness recalculated.');
  }

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Reports"
        title="Cost Audit Readiness"
        sub="Gaps to close before cost audit, with a live readiness score. SAMPLE data."
        right={<ExportButton filename="cra1-readiness.csv" headers={['Metric', 'Open']} rows={metrics.map((m) => [m.label, m.count])} />}
      />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 16 }}>
          <Card style={styles.hero}>
            <ProgressRing value={score} size={96} stroke={9} color={band === 'ok' ? palette.success : band === 'warn' ? palette.warning : palette.error}>
              <Text style={styles.scoreN}>{score}%</Text>
            </ProgressRing>
            <View style={{ flex: 1, minWidth: 180 }}>
              <Text style={styles.heroT}>Audit readiness</Text>
              <Text style={styles.sub}>{metrics.reduce((a, m) => a + m.count, 0)} open items across {metrics.length} checks. Resolve items to raise the score.</Text>
              <View style={{ marginTop: 8 }}>
                <StatusChip label={band === 'ok' ? 'Audit ready' : band === 'warn' ? 'At risk' : 'Not ready'} tone={band} />
              </View>
            </View>
          </Card>

          <SectionHeader title="Readiness metrics" description="Tap a metric to see the offending records." />
          <View style={styles.grid}>
            {metrics.map((m) => (
              <Pressable key={m.key} onPress={() => setOpen(open === m.key ? null : m.key)} style={styles.metric} accessibilityRole="button" accessibilityLabel={m.label}>
                <View style={styles.metricHead}>
                  <Text style={styles.metricN}>{m.count}</Text>
                  <StatusChip label={m.count === 0 ? 'Clear' : 'Open'} tone={m.count === 0 ? 'ok' : 'warn'} />
                </View>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <View style={styles.metricFoot}>
                  <Text style={styles.metricLink}>{open === m.key ? 'Hide' : 'View records'}</Text>
                  <Icon name={open === m.key ? 'chevronDown' : 'chevronRight'} size={14} color={palette.tint} />
                </View>
              </Pressable>
            ))}
          </View>

          {open ? (
            <Card style={{ gap: 8 }}>
              <SectionHeader title={metrics.find((m) => m.key === open)?.label ?? ''} description="Offending records (SAMPLE)" />
              {(DETAIL[open] ?? []).map((d, i) => (
                <View key={i} style={styles.recRow}>
                  <Icon name="triangleAlert" size={14} color={palette.warning} />
                  <Text style={styles.recT}>{d}</Text>
                </View>
              ))}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
                <Button label="Resolve one (demo)" variant="secondary" size="sm" icon="check" disabled={(metrics.find((m) => m.key === open)?.count ?? 0) === 0} onPress={() => resolveOne(open)} />
              </View>
            </Card>
          ) : null}
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 20, flexWrap: 'wrap' },
  scoreN: { fontSize: 22, fontWeight: '800', color: palette.text, fontFamily: fontStack },
  heroT: { ...type.title3, color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  grid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metric: { flex: 1, minWidth: 180, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: radius.card, padding: 16, gap: 6 },
  metricHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricN: { fontSize: 28, fontWeight: '800', color: palette.text, fontFamily: fontStack },
  metricLabel: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
  metricFoot: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metricLink: { ...type.caption1, fontWeight: '700', color: palette.tint, fontFamily: fontStack } as never,
  recRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: palette.separator },
  recT: { ...type.footnote, color: palette.text, fontFamily: fontStack, flex: 1 } as never,
});
