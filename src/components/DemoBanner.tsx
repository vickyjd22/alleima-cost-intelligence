import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppleTheme, type, radius, fontStack } from '../theme/tokens';

/** Persistent demo-mode indicator: HIG footnote banner, tinted fill, always visible. */
export function DemoBanner() {
  const { palette } = useAppleTheme();
  return (
    <View style={[styles.bar, { backgroundColor: palette.filled }]} accessibilityRole="alert">
      <View style={[styles.chip, { backgroundColor: palette.warning }]}>
        <Text style={styles.chipT}>DEMO</Text>
      </View>
      <Text style={[styles.text, { color: palette.text }]} numberOfLines={2}>
        Sample data · simulated actions — nothing posts to production ledgers or ERP.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.group,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  chip: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  chipT: { ...type.caption2, color: '#fff', fontFamily: fontStack as never } as never,
  text: { ...type.footnote, flex: 1, fontFamily: fontStack as never } as never,
});
