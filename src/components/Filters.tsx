import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSession } from '../store/session';
import { Icon } from './Icon';
import { fontStack, minTouch, palette, radius, type } from '../theme/tokens';

const PERIODS = ['202607', '202608', '202609', '202610'];

/** Segmented reporting-period control with a quiet track and raised selection. */
export function PeriodSelector() {
  const { period, setSession } = useSession();
  return (
    <View style={styles.row}>
      <View style={styles.labelWrap}>
        <Icon name="calendarDays" size={14} color={palette.text2} />
        <Text style={styles.label}>PERIOD</Text>
      </View>
      <View style={styles.seg}>
        {PERIODS.map((p) => {
          const on = p === period;
          return (
            <Pressable
              key={p}
              onPress={() => setSession({ period: p })}
              accessibilityRole="button"
              accessibilityLabel={`Period ${p}`}
              accessibilityState={{ selected: on }}
              style={[styles.opt, on && styles.optOn]}
            >
              <Text style={[styles.optT, { color: on ? palette.text : palette.text2 }]}>{p.slice(4)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Search field with a leading icon and clear affordance. */
export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, focused && styles.fieldFocus]}>
      <Icon name="search" size={17} color={focused ? palette.tint : palette.text3} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder ?? 'Search'}
        placeholderTextColor={palette.text3 as never}
        style={styles.input}
        accessibilityLabel={placeholder ?? 'Search'}
        returnKeyType="search"
      />
      {value ? (
        <Pressable onPress={() => onChange('')} style={styles.clear} accessibilityRole="button" accessibilityLabel="Clear search">
          <Icon name="x" size={13} color={palette.text2} strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  labelWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { ...type.caption2, color: palette.text3, fontFamily: fontStack } as never,
  seg: { flexDirection: 'row', backgroundColor: palette.bgAlt, borderRadius: 10, padding: 3, gap: 2 },
  opt: { minHeight: 32, minWidth: minTouch, paddingHorizontal: 10, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  optOn: {
    backgroundColor: palette.card,
    shadowColor: '#0A1B33',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  } as never,
  optT: { fontSize: 12, fontWeight: '700', fontFamily: fontStack },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    minHeight: minTouch,
    minWidth: 220,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  fieldFocus: { borderColor: palette.tint, shadowColor: palette.tint, shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } } as never,
  input: { flex: 1, fontSize: 14, paddingVertical: 6, color: palette.text, fontFamily: fontStack, outlineStyle: 'none' } as never,
  clear: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.filled },
});
