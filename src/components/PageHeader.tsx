import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useAppleTheme, type, fontStack } from '../theme/tokens';

/**
 * HIG page header: iOS large-title style. Title uses Title1/LargeTitle with
 * tight tracking; description is a secondary-label subhead. Never truncates
 * the primary action (`right`) — it wraps below on narrow screens.
 */
export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  const { palette } = useAppleTheme();
  const { width } = useWindowDimensions();
  const large = width >= 900;
  return (
    <View style={styles.wrap} accessibilityRole="header">
      <View style={styles.textWrap}>
        <Text
          style={[styles.title, large ? styles.large : styles.compact, { color: palette.text }]}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {sub ? (
          <Text style={[styles.sub, { color: palette.text2 }]} maxFontSizeMultiplier={1.3}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  textWrap: { flex: 1, minWidth: 200 },
  title: { fontFamily: fontStack as never, letterSpacing: -0.4 } as never,
  large: { ...type.title1 } as never,
  compact: { ...type.title2 } as never,
  sub: { ...type.subhead, marginTop: 4, fontFamily: fontStack as never } as never,
  right: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
});
