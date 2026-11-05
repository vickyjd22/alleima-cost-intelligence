import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { Card } from './ui';
import { fontStack, halo, palette, radius, type } from '../theme/tokens';

function PanelHead({ icon, title, hint }: { icon: IconName; title: string; hint?: string }) {
  return (
    <View style={styles.head}>
      <View style={styles.headIcon}>
        <Icon name={icon} size={16} color={palette.tint} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.headTitle}>{title}</Text>
        {hint ? <Text style={styles.headHint}>{hint}</Text> : null}
      </View>
    </View>
  );
}

export function CostBreakdownPanel({ lines }: { lines: { label: string; value: string }[] }) {
  return (
    <Card style={{ marginTop: 14 }}>
      <PanelHead icon="layers" title="Cost breakdown" hint="Every figure is traceable to its source record" />
      <View style={styles.rows}>
        {lines.map((l, i) => (
          <View key={l.label} style={[styles.row, i < lines.length - 1 && styles.rowBorder]}>
            <Text style={styles.label}>{l.label}</Text>
            <Text style={styles.val}>{l.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function TraceabilityTimeline({ steps }: { steps: string[] }) {
  return (
    <Card style={{ marginTop: 14 }}>
      <PanelHead icon="workflow" title="Traceability" hint="Source → work order → traveller → dispatch" />
      <View style={{ marginTop: 10 }}>
        {steps.map((s, i) => (
          <View key={i} style={styles.trow}>
            <View style={styles.stepCol}>
              <View style={[styles.stepDot, i === steps.length - 1 && { backgroundColor: palette.accent, borderColor: palette.accentSoft }]}>
                <Text style={styles.stepNum}>{i + 1}</Text>
              </View>
              {i < steps.length - 1 ? <View style={styles.stepLine} /> : null}
            </View>
            <Text style={styles.stepText}>{s}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function ChartCard({ title, bars, hint }: { title: string; bars: { label: string; pct: number }[]; hint?: string }) {
  return (
    <Card style={{ marginTop: 14 }}>
      <PanelHead icon="barChart" title={title} hint={hint} />
      <View style={{ marginTop: 14, gap: 12 }}>
        {bars.map((b) => (
          <View key={b.label}>
            <View style={styles.barHead}>
              <Text style={styles.barLabel}>{b.label}</Text>
              <Text style={styles.barValue}>{b.pct}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, b.pct))}%` }]} />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  headIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: halo.brand, alignItems: 'center', justifyContent: 'center' },
  headTitle: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  headHint: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  rows: { marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14, paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: palette.separator },
  label: { ...type.footnote, color: palette.text2, flex: 1, fontFamily: fontStack } as never,
  val: { ...type.footnote, color: palette.text, fontWeight: '700', textAlign: 'right', flexShrink: 1, fontFamily: fontStack } as never,
  trow: { flexDirection: 'row', gap: 10 },
  stepCol: { alignItems: 'center', width: 24 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.tintSoft,
    borderWidth: 1,
    borderColor: palette.tintBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontSize: 10, fontWeight: '700', color: palette.tint, fontFamily: fontStack },
  stepLine: { width: 1.5, flex: 1, minHeight: 18, backgroundColor: palette.border, marginVertical: 3 },
  stepText: { ...type.footnote, color: palette.text, fontFamily: fontStack, paddingTop: 3, paddingBottom: 12, flex: 1 } as never,
  barHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  barLabel: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  barValue: { ...type.caption1, color: palette.text, fontWeight: '700', fontFamily: fontStack } as never,
  track: { height: 10, backgroundColor: palette.bgAlt, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: 10, backgroundColor: palette.tint, borderRadius: radius.pill },
});
