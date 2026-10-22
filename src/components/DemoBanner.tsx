import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { fontStack, palette, radius, type } from '../theme/tokens';

/** Plain-spoken demo boundary — visible wherever sample data is on screen. */
export function DemoBanner() {
  return (
    <View style={styles.bar} accessibilityRole="alert">
      <View style={styles.icon}>
        <Icon name="flask" size={16} color={palette.warning} strokeWidth={1.9} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Demo environment</Text>
        <Text style={styles.text}>
          Sample data and simulated actions — nothing posts to production ledgers, ERP or payroll.
        </Text>
      </View>
      <View style={styles.tag}>
        <Text style={styles.tagT}>DEMO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.group,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: palette.warningSoft,
    borderWidth: 1,
    borderColor: palette.warningBorder,
    marginBottom: 16,
  },
  icon: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { ...type.footnote, color: palette.warning, fontWeight: '700', fontFamily: fontStack } as never,
  text: { ...type.caption1, color: palette.text2, fontFamily: fontStack, marginTop: 1 } as never,
  tag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: palette.warning },
  tagT: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.7, fontFamily: fontStack },
});
