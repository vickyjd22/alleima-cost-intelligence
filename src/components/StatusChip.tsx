import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontStack, radius, toneColors } from '../theme/tokens';

/** Semantic status pill: label + dot on a soft tinted surface (never colour-only). */
export function StatusChip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'ok' | 'warn' | 'error' | 'info' | 'accent' }) {
  const c = toneColors(tone);
  return (
    <View
      style={[styles.chip, { backgroundColor: c.bg, borderColor: c.border }]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
    >
      <View style={[styles.dot, { backgroundColor: c.fg }]} />
      <Text style={[styles.text, { color: c.fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 11.5, fontWeight: '600', fontFamily: fontStack },
});
