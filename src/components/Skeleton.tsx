import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppleTheme, radius } from '../theme/tokens';

/** Simulated first-load skeleton (600ms) for review build. */
export function useMockLoading(ms = 600): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

/** HIG loading placeholder: grouped card with system-fill rows. */
export function Skeleton({ lines = 4 }: { lines?: number }) {
  const { palette } = useAppleTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.separator }]} accessibilityRole="progressbar" accessibilityLabel="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={[styles.line, { width: `${92 - i * 9}%`, backgroundColor: palette.filled }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10 },
  line: { height: 14, borderRadius: 7 },
});
