import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, useWindowDimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAppleTheme, type, radius, minTouch, fontStack } from '../theme/tokens';
import { modulesForRoles } from '../config/modules';
import type { Role } from '../lib/permissions';

const TABS = ['review', 'overview', 'work-orders', 'costing', 'approvals'];

/**
 * HIG tab bar (compact width): translucent bar, 5 tabs + More, 10pt labels,
 * 49pt+ height, 44pt targets, selected = tint. "More" is an iOS-style
 * action sheet (rounded, cancel button, scrim dismiss).
 */
export function BottomNav({ roles }: { roles: Role[] }) {
  const { palette } = useAppleTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  if (width >= 900) return null;
  const visible = modulesForRoles(roles);
  const tabs = visible.filter((m) => TABS.includes(m.id));
  const rest = visible.filter((m) => !TABS.includes(m.id));

  return (
    <View style={[styles.bar, { backgroundColor: palette.tabBar, borderTopColor: palette.separator }, styles.shadow]}>
      {tabs.map((m) => {
        const active = pathname.includes(m.id);
        const color = active ? palette.tint : palette.text2;
        return (
          <Pressable
            key={m.id}
            onPress={() => router.push(m.route as never)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel={m.title}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.glyph, { color }]}>{m.title.charAt(0)}</Text>
            <Text style={[styles.tabT, { color }]} numberOfLines={1}>{m.title.split(' ')[0]}</Text>
            {active ? <View style={[styles.dot, { backgroundColor: palette.tint }]} /> : <View style={styles.dot} />}
          </Pressable>
        );
      })}
      <Pressable onPress={() => setMore(true)} style={styles.tab} accessibilityRole="button" accessibilityLabel="More modules">
        <Text style={[styles.glyph, { color: palette.text2 }]}>···</Text>
        <Text style={[styles.tabT, { color: palette.text2 }]}>More</Text>
        <View style={styles.dot} />
      </Pressable>
      <Modal visible={more} transparent animationType="slide" onRequestClose={() => setMore(false)}>
        <Pressable style={styles.scrim} onPress={() => setMore(false)} accessibilityLabel="Dismiss">
          <Pressable onPress={(e) => (e as unknown as { stopPropagation: () => void }).stopPropagation?.()} style={[styles.sheet, { backgroundColor: palette.card }]}>
            <View style={[styles.grabber, { backgroundColor: palette.separator }]} />
            <Text style={[styles.h, { color: palette.text }]}>All modules</Text>
            {rest.map((m) => (
              <Pressable
                key={m.id}
                onPress={() => { setMore(false); router.push(m.route as never); }}
                style={[styles.row, { borderBottomColor: palette.separator }]}
                accessibilityRole="button"
                accessibilityLabel={m.title}
              >
                <Text style={[styles.rowT, { color: palette.text }]}>{m.title}</Text>
                <Text style={[styles.chev, { color: palette.text2 }]}>›</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setMore(false)} style={[styles.cancel, { backgroundColor: palette.filled }]} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={[styles.cancelT, { color: palette.tint }]}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    paddingBottom: 20, // home-indicator safe area
    paddingHorizontal: 4,
  },
  shadow: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52, minWidth: minTouch, gap: 2 },
  glyph: { fontSize: 18, fontWeight: '600', height: 22 },
  tabT: { ...type.tabLabel, fontFamily: fontStack as never } as never,
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8, maxHeight: '75%' },
  grabber: { width: 36, height: 5, borderRadius: 2.5, alignSelf: 'center', marginBottom: 10 },
  h: { ...type.title3, marginBottom: 8, fontFamily: fontStack as never } as never,
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: minTouch, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 6 },
  rowT: { ...type.callout, fontFamily: fontStack as never } as never,
  chev: { fontSize: 20, fontWeight: '400' },
  cancel: { marginTop: 12, borderRadius: radius.button, minHeight: minTouch, alignItems: 'center', justifyContent: 'center' },
  cancelT: { ...type.headline, fontFamily: fontStack as never } as never,
});
