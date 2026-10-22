import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { fontStack, palette, radius, shadowPop, type } from '../theme/tokens';
import { modulesForRoles } from '../config/modules';
import type { Role } from '../lib/permissions';
import { ModuleIcon, Icon } from './Icon';

const TABS = ['overview', 'costing', 'work-orders', 'approvals', 'review'];

/** Compact tab bar with icon + label, plus an app-sheet for every workspace. */
export function BottomNav({ roles }: { roles: Role[] }) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  if (width >= 1024) return null;

  const visible = modulesForRoles(roles);
  const tabs = TABS.map((id) => visible.find((m) => m.id === id)).filter(Boolean);
  const rest = visible.filter((m) => !TABS.includes(m.id));

  return (
    <>
      <View style={styles.bar}>
        {tabs.map((m) => {
          if (!m) return null;
          const active = pathname.includes(m.id);
          return (
            <Pressable
              key={m.id}
              onPress={() => router.push(m.route as never)}
              style={({ pressed }) => [styles.tab, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel={m.title}
              accessibilityState={{ selected: active }}
            >
              <View style={[styles.iconPill, active && styles.iconPillActive]}>
                <ModuleIcon id={m.id} size={20} color={active ? palette.tint : palette.text3} strokeWidth={active ? 2.2 : 1.8} />
              </View>
              <Text style={[styles.tabLabel, { color: active ? palette.tint : palette.text3 }, active && { fontWeight: '700' }]} numberOfLines={1}>
                {m.short}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setMore(true)} style={styles.tab} accessibilityRole="button" accessibilityLabel="All workspaces">
          <View style={styles.iconPill}>
            <Icon name="menu" size={20} color={palette.text3} strokeWidth={1.8} />
          </View>
          <Text style={[styles.tabLabel, { color: palette.text3 }]}>More</Text>
        </Pressable>
      </View>

      <Modal visible={more} transparent animationType="slide" onRequestClose={() => setMore(false)}>
        <Pressable style={styles.scrim} onPress={() => setMore(false)} accessibilityLabel="Dismiss">
          <Pressable
            onPress={(e) => (e as unknown as { stopPropagation: () => void }).stopPropagation?.()}
            style={styles.sheet}
          >
            <View style={styles.grabber} />
            <View style={styles.sheetHead}>
              <View>
                <Text style={styles.sheetTitle}>All workspaces</Text>
                <Text style={styles.sheetSub}>{visible.length} modules available for your role</Text>
              </View>
              <Pressable onPress={() => setMore(false)} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
                <Icon name="x" size={16} color={palette.text2} strokeWidth={2.2} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.grid}>
                {rest.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => { setMore(false); router.push(m.route as never); }}
                    style={({ pressed }) => [styles.gridItem, pressed && { backgroundColor: palette.bgAlt }]}
                    accessibilityRole="button"
                    accessibilityLabel={m.title}
                  >
                    <View style={styles.gridIcon}>
                      <ModuleIcon id={m.id} size={20} color={palette.tint} strokeWidth={1.9} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.gridTitle} numberOfLines={1}>{m.short}</Text>
                      <Text style={styles.gridSub} numberOfLines={1}>{m.group}</Text>
                    </View>
                    <Icon name="chevronRight" size={15} color={palette.text3} />
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <Pressable onPress={() => setMore(false)} style={styles.cancel} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={styles.cancelT}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.tabBar,
    paddingTop: 6,
    paddingBottom: 16,
    paddingHorizontal: 6,
    shadowColor: '#0A1B33',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
  } as never,
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 54, gap: 2, cursor: 'pointer' } as never,
  iconPill: { width: 38, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  iconPillActive: { backgroundColor: palette.tintSoft },
  tabLabel: { ...type.tabLabel, fontFamily: fontStack, fontSize: 10 } as never,
  scrim: { flex: 1, backgroundColor: palette.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: palette.card,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 28,
    maxHeight: '82%',
    ...shadowPop,
  } as never,
  grabber: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: palette.borderStrong, marginBottom: 12 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { ...type.title3, color: palette.text, fontFamily: fontStack } as never,
  sheetSub: { ...type.footnote, color: palette.text2, fontFamily: fontStack, marginTop: 2 } as never,
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.filled, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 210,
    flexGrow: 1,
    flexBasis: '46%',
    padding: 10,
    borderRadius: radius.group,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
  },
  gridIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  gridTitle: { ...type.footnote, color: palette.text, fontWeight: '600', fontFamily: fontStack } as never,
  gridSub: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  cancel: { marginTop: 14, minHeight: 46, borderRadius: radius.button, backgroundColor: palette.filled, alignItems: 'center', justifyContent: 'center' },
  cancelT: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
});
