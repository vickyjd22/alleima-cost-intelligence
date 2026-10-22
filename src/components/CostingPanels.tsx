import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

export function CostBreakdownPanel({ lines }: { lines: { label: string; value: string }[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.h}>Cost breakdown</Text>
      {lines.map((l) => (
        <View key={l.label} style={styles.row}>
          <Text style={styles.label}>{l.label}</Text>
          <Text style={styles.val}>{l.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function TraceabilityTimeline({ steps }: { steps: string[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.h}>Traceability</Text>
      {steps.map((s, i) => (
        <View key={i} style={styles.trow}>
          <View style={styles.dot} />
          <Text style={styles.label}>{s}</Text>
        </View>
      ))}
    </View>
  );
}

export function ChartCard({ title, bars }: { title: string; bars: { label: string; pct: number }[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.h}>{title}</Text>
      {bars.map((b) => (
        <View key={b.label} style={{ marginTop: 8 }}>
          <Text style={styles.label}>{b.label}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, b.pct))}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: tokens.color.card, borderRadius: tokens.radius.card, borderWidth: 1, borderColor: tokens.color.border, padding: 16, marginTop: 12 },
  h: { fontWeight: '700', color: tokens.color.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F4F9' },
  trow: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.color.primary },
  label: { fontSize: 12, color: tokens.color.text2 },
  val: { fontSize: 13, fontWeight: '700', color: tokens.color.text },
  track: { height: 8, backgroundColor: '#EEF0FF', borderRadius: 4, marginTop: 4 },
  fill: { height: 8, backgroundColor: tokens.color.primary, borderRadius: 4 },
});
