import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppleTheme, type, radius, shadowCard, fontStack } from '../theme/tokens';

/**
 * HIG KPI card: grouped-background card, caption-2 eyebrow, title-2 numeric
 * value (tabular figures), footnote unit. Status dot + semantic hint text
 * instead of color-only meaning (accessibility).
 */
export function KpiCard({
  title,
  value,
  unit,
  status,
  hint,
}: {
  title: string;
  value: string;
  unit?: string;
  status?: 'ok' | 'warn' | 'error';
  hint?: string;
}) {
  const { palette } = useAppleTheme();
  const dotColor =
    status === 'ok' ? palette.success : status === 'warn' ? palette.warning : status === 'error' ? palette.error : null;
  return (
    <View
      style={[styles.card, { backgroundColor: palette.card, borderColor: palette.separator }]}
      accessibilityRole="summary"
      accessibilityLabel={`${title}: ${value}${unit ? ` ${unit}` : ''}${hint ? `. ${hint}` : ''}`}
    >
      <Text style={[styles.title, { color: palette.text2 }]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.value, { color: palette.text }]} maxFontSizeMultiplier={1.2}>
        {value}
        {unit ? <Text style={[styles.unit, { color: palette.text2 }]}> {unit}</Text> : null}
      </Text>
      <View style={styles.statusRow}>
        {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
        {hint ? (
          <Text style={[styles.hint, { color: palette.text2 }]} numberOfLines={2}>
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 160,
    flex: 1,
    ...shadowCard,
  } as never,
  title: { ...type.caption2, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, fontFamily: fontStack as never } as never,
  value: { ...type.title2, fontVariant: ['tabular-nums'], fontFamily: fontStack as never } as never,
  unit: { ...type.footnote, fontWeight: '400' } as never,
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, minHeight: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  hint: { ...type.footnote, flex: 1, fontFamily: fontStack as never } as never,
});
