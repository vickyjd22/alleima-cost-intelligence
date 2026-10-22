import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { tokens } from '../theme/tokens';

export function Stepper({ steps, current, onGo }: { steps: string[]; current: number; onGo: (i: number) => void }) {
  return (
    <View style={styles.row}>
      {steps.map((s, i) => (
        <Pressable key={s} onPress={() => onGo(i)} style={[styles.step, i === current ? styles.now : null, i < current ? styles.done : null]}>
          <Text style={[styles.t, i === current ? styles.nowT : null]}>
            {i + 1}. {s}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginVertical: 12 },
  step: { borderWidth: 1, borderColor: tokens.color.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  done: { backgroundColor: '#E7F6EC', borderColor: '#E7F6EC' },
  now: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  t: { fontSize: 12, fontWeight: '700', color: tokens.color.text2 },
  nowT: { color: '#fff' },
});
