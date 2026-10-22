import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppleTheme, type, radius, minTouch, fontStack } from '../theme/tokens';

export interface FeatureHelpProps {
  purpose: string; who: string; inputs: string; process: string; outputs: string;
  dependencies: string; controls: string; exceptions: string; benefit: string;
  measurement: string; limitations: string;
}

/** HIG disclosure group: 44pt tappable header, grouped card, caption eyebrows. */
export function FeatureHelp(p: FeatureHelpProps) {
  const { palette } = useAppleTheme();
  const [open, setOpen] = useState(false);
  const rows: [string, string][] = [
    ['Purpose', p.purpose], ['Who uses it', p.who], ['Inputs', p.inputs],
    ['Process', p.process], ['Outputs', p.outputs], ['Dependencies', p.dependencies],
    ['Controls', p.controls], ['Exceptions', p.exceptions],
    ['Intended benefit', p.benefit], ['How to measure', p.measurement], ['Limitations', p.limitations],
  ];
  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.separator }]}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel="Business guide"
        accessibilityState={{ expanded: open }}
        style={styles.head}
      >
        <Text style={[styles.glyph, { color: palette.tint }]}>ⓘ</Text>
        <Text style={[styles.title, { color: palette.tint }]}>
          Why this feature exists — business guide
        </Text>
        <Text style={[styles.chev, { color: palette.text2 }]}>{open ? '▾' : '▸'}</Text>
      </Pressable>
      {open ? (
        <View style={[styles.body, { borderTopColor: palette.separator }]}>
          {rows.map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={[styles.k, { color: palette.text2 }]}>{k.toUpperCase()}</Text>
              <Text style={[styles.v, { color: palette.text }]}>{v}</Text>
            </View>
          ))}
          <Text style={[styles.demo, { color: palette.text2 }]}>
            All figures on this screen are illustrative SAMPLE data, not approved corporate metrics.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.card, marginBottom: 12, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: minTouch, paddingHorizontal: 12 },
  glyph: { fontSize: 17 },
  title: { ...type.callout, fontWeight: '600', flex: 1, fontFamily: fontStack as never } as never,
  chev: { fontSize: 14 },
  body: { paddingHorizontal: 12, paddingBottom: 12, paddingTop: 8, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
  row: { gap: 2 },
  k: { ...type.caption2, letterSpacing: 0.4, fontFamily: fontStack as never } as never,
  v: { ...type.subhead, fontFamily: fontStack as never } as never,
  demo: { ...type.caption1, fontStyle: 'italic', marginTop: 4, fontFamily: fontStack as never } as never,
});
