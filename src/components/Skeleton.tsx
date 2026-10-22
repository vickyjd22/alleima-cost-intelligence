import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { palette, radius } from '../theme/tokens';

/** Simulated first-load skeleton (600 ms) for the review build. */
export function useMockLoading(ms = 600): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

/** Calm pulse placeholder — never a blank white page. */
export function Skeleton({ lines = 4 }: { lines?: number }) {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <View style={styles.card} accessibilityRole="progressbar" accessibilityLabel="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <Animated.View key={i} style={[styles.line, { width: `${94 - i * 9}%`, opacity: pulse }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.card, borderRadius: radius.card, borderWidth: 1, borderColor: palette.border, padding: 18, gap: 12 },
  line: { height: 13, borderRadius: 7, backgroundColor: palette.bgAlt },
});
