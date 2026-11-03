import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon } from './Icon';
import { fontStack, minTouch, palette, radius, type } from '../theme/tokens';

/**
 * Compact step pills. Re-toned onto the Alleima palette (Phase 7) — completed
 * steps read as a quiet success pill with a check; the current step uses the
 * interaction blue. API unchanged.
 */
export function Stepper({ steps, current, onGo }: { steps: string[]; current: number; onGo: (i: number) => void }) {
  return (
    <View style={styles.row}>
      {steps.map((s, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <Pressable
            key={s}
            onPress={() => onGo(i)}
            accessibilityRole="button"
            accessibilityLabel={`Step ${i + 1}: ${s}`}
            accessibilityState={{ selected: now }}
            style={[styles.step, done && styles.done, now && styles.now]}
          >
            {done ? (
              <Icon name="check" size={13} color={palette.success} strokeWidth={2.6} />
            ) : (
              <Text style={[styles.index, now && styles.indexNow]}>{i + 1}</Text>
            )}
            <Text style={[styles.t, now && styles.nowT, done && styles.doneT]}>{s}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginVertical: 12 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    minHeight: 36,
    minWidth: minTouch,
    backgroundColor: palette.card,
  },
  done: { backgroundColor: palette.successSoft, borderColor: palette.successBorder },
  now: { backgroundColor: palette.tint, borderColor: palette.tint },
  index: { ...type.caption2, color: palette.text3, fontFamily: fontStack } as never,
  indexNow: { color: '#fff' },
  t: { fontSize: 12, fontWeight: '700', color: palette.text2, fontFamily: fontStack },
  nowT: { color: '#fff' },
  doneT: { color: palette.success },
});
