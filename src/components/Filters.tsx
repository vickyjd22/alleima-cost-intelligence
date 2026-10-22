import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useAppleTheme, type, radius, minTouch, fontStack } from '../theme/tokens';
import { useSession } from '../store/session';

const PERIODS = ['202607', '202608', '202609', '202610'];

/** HIG segmented period control: system-fill track, 44pt options, selected card. */
export function PeriodSelector() {
  const { palette } = useAppleTheme();
  const { period, setSession } = useSession();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: palette.text2 }]}>PERIOD</Text>
      <View style={[styles.seg, { backgroundColor: palette.filled }]}>
        {PERIODS.map((p) => {
          const on = p === period;
          return (
            <Pressable
              key={p}
              onPress={() => setSession({ period: p })}
              accessibilityRole="button"
              accessibilityLabel={`Period ${p}`}
              accessibilityState={{ selected: on }}
              style={[styles.opt, on ? { backgroundColor: palette.card, ...styles.shadow } : null]}
            >
              <Text style={[styles.optT, { color: on ? palette.text : palette.text2 }]}>{p.slice(4)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** HIG search field: system-fill, 10pt corners, clear button, 44pt row. */
export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { palette } = useAppleTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, { backgroundColor: palette.filled }, focused ? { borderColor: palette.tint, borderWidth: 1.5 } : null]}>
      <Text style={[styles.glyph, { color: palette.text2 }]}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder ?? 'Search'}
        placeholderTextColor={palette.text3 as never}
        style={[styles.input, { color: palette.text }]}
        accessibilityLabel={placeholder ?? 'Search'}
        returnKeyType="search"
      />
      {value ? (
        <Pressable onPress={() => onChange('')} style={styles.clear} accessibilityRole="button" accessibilityLabel="Clear search">
          <Text style={[styles.clearT, { color: palette.text2 }]}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  label: { ...type.caption2, letterSpacing: 0.4, fontFamily: fontStack as never } as never,
  seg: { flexDirection: 'row', borderRadius: radius.input, padding: 2, gap: 2 },
  opt: { minHeight: minTouch - 8, minWidth: minTouch, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  shadow: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  optT: { fontSize: 13, fontWeight: '600' },
  field: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.input, paddingHorizontal: 10, minHeight: minTouch, gap: 6, minWidth: 200 },
  glyph: { fontSize: 15 },
  input: { flex: 1, fontSize: 17, paddingVertical: 6, outlineStyle: 'none' } as never,
  clear: { minWidth: 28, minHeight: 28, alignItems: 'center', justifyContent: 'center' },
  clearT: { fontSize: 12, fontWeight: '700' },
});
