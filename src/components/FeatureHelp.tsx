import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { fontStack, minTouch, palette, radius, type } from '../theme/tokens';

export interface FeatureHelpProps {
  purpose: string; who: string; inputs: string; process: string; outputs: string;
  dependencies: string; controls: string; exceptions: string; benefit: string;
  measurement: string; limitations: string;
}

/** Expandable "why this exists" guide for client walkthroughs. */
export function FeatureHelp(p: FeatureHelpProps) {
  const [open, setOpen] = useState(false);
  const rows: [string, string][] = [
    ['Purpose', p.purpose], ['Who uses it', p.who], ['Inputs', p.inputs],
    ['Process', p.process], ['Outputs', p.outputs], ['Dependencies', p.dependencies],
    ['Controls', p.controls], ['Exceptions', p.exceptions],
    ['Intended benefit', p.benefit], ['How to measure', p.measurement], ['Limitations', p.limitations],
  ];
  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel="Business guide"
        accessibilityState={{ expanded: open }}
        style={styles.head}
      >
        <View style={styles.icon}>
          <Icon name="book" size={16} color={palette.tint} strokeWidth={1.9} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Why this feature exists</Text>
          <Text style={styles.sub}>Business context, controls and limitations</Text>
        </View>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={16} color={palette.text3} />
      </Pressable>
      {open ? (
        <View style={styles.body}>
          {rows.map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={styles.k}>{k.toUpperCase()}</Text>
              <Text style={styles.v}>{v}</Text>
            </View>
          ))}
          <Text style={styles.demo}>All figures on this screen are illustrative SAMPLE data, not approved corporate metrics.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: palette.border, borderRadius: radius.card, marginBottom: 14, overflow: 'hidden', backgroundColor: palette.card },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: minTouch, paddingHorizontal: 14, paddingVertical: 6 },
  icon: { width: 30, height: 30, borderRadius: 9, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  body: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: palette.separator },
  row: { gap: 2 },
  k: { ...type.caption2, color: palette.text3, fontFamily: fontStack } as never,
  v: { ...type.footnote, color: palette.text, fontFamily: fontStack } as never,
  demo: { ...type.caption1, color: palette.text3, fontStyle: 'italic', marginTop: 2, fontFamily: fontStack } as never,
});
