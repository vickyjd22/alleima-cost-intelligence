import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { displayFontStack, fontStack, palette, type } from '../theme/tokens';

/**
 * Page header: an eyebrow for context, a confident title, a plain-language
 * description, and one clear action cluster. Text never truncates the action;
 * on narrow screens the actions wrap underneath.
 */
export function PageHeader({
  title,
  sub,
  right,
  eyebrow,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
  eyebrow?: string;
}) {
  const { width } = useWindowDimensions();
  const large = width >= 900;
  return (
    <View style={styles.wrap} accessibilityRole="header">
      <View style={styles.textWrap}>
        {eyebrow ? (
          <View style={styles.eyebrowPill}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
          </View>
        ) : null}
        <Text style={[styles.title, large ? styles.large : styles.compact]} accessibilityRole="header">
          {title}
        </Text>
        {sub ? (
          <Text style={styles.sub} maxFontSizeMultiplier={1.3}>
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
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  textWrap: { flex: 1, minWidth: 240, gap: 8 },
  eyebrowPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: palette.tintSoft, borderWidth: 1, borderColor: palette.tintBorder, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  eyebrowDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: palette.tint },
  eyebrow: { ...type.caption2, color: palette.tintPressed, fontFamily: fontStack, letterSpacing: 0.9 } as never,
  title: { fontFamily: displayFontStack, color: palette.text, letterSpacing: -0.7 } as never,
  large: { ...type.title1 } as never,
  compact: { ...type.title2 } as never,
  sub: { ...type.body, color: palette.text2, fontFamily: fontStack, maxWidth: 820 } as never,
  right: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
});
