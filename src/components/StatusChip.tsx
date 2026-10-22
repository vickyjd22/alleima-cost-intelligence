import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppleTheme, type, radius, fontStack } from '../theme/tokens';

/** HIG status pill: tinted system-fill background + semantic label color. Never color-only (label text carries meaning). */
export function StatusChip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'ok' | 'warn' | 'error' | 'info' }) {
  const { palette } = useAppleTheme();
  const fg =
    tone === 'ok'
      ? palette.success
      : tone === 'warn'
        ? palette.warning
        : tone === 'error'
          ? palette.error
          : tone === 'info'
            ? palette.tint
            : palette.text2;
  return (
    <View style={[styles.chip, { backgroundColor: palette.filled }]} accessibilityRole="text" accessibilityLabel={`Status: ${label}`}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { ...type.caption1, fontWeight: '600', fontFamily: fontStack as never } as never,
});
