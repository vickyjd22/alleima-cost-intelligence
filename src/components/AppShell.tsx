import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, useWindowDimensions, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useAppleTheme, type, radius, minTouch, fontStack } from '../theme/tokens';
import { modules, modulesForRoles } from '../config/modules';
import type { Role } from '../lib/permissions';
import { useSession } from '../store/session';
import { BottomNav } from './BottomNav';
import { ToastHost } from './Toast';
import { DemoBanner } from './DemoBanner';

const PERIODS = ['202607', '202608', '202609', '202610'];
const PLANTS = ['mehsana'];

/**
 * HIG app shell.
 * - Regular width: iPad-style translucent sidebar (sectioned, 44pt rows,
 *   selected pill) + grouped content background.
 * - Compact: inline navigation bar (back chevron space, large-title handled
 *   per-screen by PageHeader) + iOS tab bar (BottomNav).
 * - Global search is an iOS search field (rounded, systemFill, cancel on
 *   focus); plant/period are segmented-style 44pt controls.
 * - Web: keyboard-focusable rows with visible tint outline; no `Link asChild`.
 */
export function AppShell({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { palette } = useAppleTheme();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const router = useRouter();
  const { email, plantId, period, setSession } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const visible = modulesForRoles(roles);
  const wide = width >= 900;

  const crumbs = pathname.split('/').filter(Boolean).map((c) => c.replace(/[()]/g, ''));
  const q = query.trim().toLowerCase();
  const matches = q ? modules.filter((m) => m.title.toLowerCase().includes(q)).slice(0, 6) : [];

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <DemoBanner />
      <View style={styles.body}>
        {wide ? (
          <View
            style={[
              styles.sidebar,
              collapsed && styles.collapsed,
              { backgroundColor: palette.tabBar, borderRightColor: palette.separator },
              styles.sidebarShadow,
            ]}
          >
            <Pressable
              onPress={() => router.push('/(app)/overview' as never)}
              style={styles.brandRow}
              accessibilityRole="button"
              accessibilityLabel="Go to Overview"
            >
              <Text style={[styles.brandDot, { backgroundColor: palette.tint }]}>A</Text>
              {collapsed ? null : <Text style={[styles.brand, { color: palette.text }]}>Alleima</Text>}
            </Pressable>
            <Pressable
              onPress={() => setCollapsed((c) => !c)}
              style={styles.collapseBtn}
              accessibilityRole="button"
              accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Text style={[styles.collapseT, { color: palette.text2 }]}>{collapsed ? '›' : '‹'}</Text>
            </Pressable>
            <Text style={[styles.section, { color: palette.text2 }]}>{collapsed ? '···' : 'WORKSPACE'}</Text>
            {visible.map((m) => {
              const active = pathname.startsWith(m.route.replace('(app)', ''));
              return (
                <Pressable
                  key={m.id}
                  onPress={() => router.push(m.route as never)}
                  accessibilityRole="button"
                  accessibilityLabel={m.title}
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.link,
                    active ? { backgroundColor: palette.filled } : null,
                    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as never) : null,
                  ]}
                >
                  <Text style={[styles.linkGlyph, { color: active ? palette.tint : palette.text2 }]}>
                    {m.title.charAt(0)}
                  </Text>
                  {collapsed ? null : (
                    <Text style={[styles.linkText, { color: active ? palette.text : palette.text2 }, active ? styles.linkActive : null]} numberOfLines={1}>
                      {m.title}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <View style={styles.main}>
          <View style={[styles.header, { backgroundColor: palette.card, borderColor: palette.separator }]}>
            <Text style={[styles.crumb, { color: palette.text2 }]} numberOfLines={1}>
              {['Home', ...crumbs].join('  ›  ')}
            </Text>
            <View style={styles.headerRow}>
              <View style={styles.searchWrap}>
                <View style={[styles.searchField, { backgroundColor: palette.filled }, searchFocus ? { borderColor: palette.tint, borderWidth: 1.5 } : null]}>
                  <Text style={[styles.searchGlyph, { color: palette.text2 }]}>⌕</Text>
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    onFocus={() => setSearchFocus(true)}
                    onBlur={() => setSearchFocus(false)}
                    placeholder="Search"
                    placeholderTextColor={palette.text3 as never}
                    style={[styles.search, { color: palette.text }]}
                    accessibilityLabel="Search modules"
                    returnKeyType="search"
                  />
                  {query ? (
                    <Pressable onPress={() => setQuery('')} style={styles.clear} accessibilityRole="button" accessibilityLabel="Clear search">
                      <Text style={[styles.clearT, { color: palette.text2 }]}>✕</Text>
                    </Pressable>
                  ) : null}
                </View>
                {matches.length ? (
                  <View style={[styles.results, { backgroundColor: palette.card, borderColor: palette.separator }]}>
                    {matches.map((m) => (
                      <Pressable key={m.id} onPress={() => { setQuery(''); router.push(m.route as never); }} style={styles.resultRow} accessibilityRole="button" accessibilityLabel={m.title}>
                        <Text style={[styles.resultT, { color: palette.text }]}>{m.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
              <View style={[styles.segment, { backgroundColor: palette.filled }]} accessibilityRole="tablist" accessibilityLabel="Period">
                {PERIODS.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setSession({ period: p })}
                    accessibilityRole="button"
                    accessibilityLabel={`Period ${p}`}
                    accessibilityState={{ selected: period === p }}
                    style={[styles.segOpt, period === p ? { backgroundColor: palette.card, ...styles.segShadow } : null]}
                  >
                    <Text style={[styles.segT, { color: period === p ? palette.text : palette.text2 }]}>{p.slice(4)}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.headerBtns}>
                {PLANTS.map((p) => (
                  <Pressable key={p} onPress={() => setSession({ plantId: p })} style={[styles.pill, { borderColor: palette.separator, backgroundColor: palette.card }]} accessibilityRole="button" accessibilityLabel={`Plant ${p}`}>
                    <Text style={[styles.pillT, { color: palette.text }]}>{p}</Text>
                  </Pressable>
                ))}
                <Pressable onPress={() => router.push('/(app)/notifications' as never)} style={[styles.iconBtn, { backgroundColor: palette.filled }]} accessibilityRole="button" accessibilityLabel="Notifications">
                  <Text style={[styles.iconT, { color: palette.text }]}>🔔</Text>
                </Pressable>
                <Pressable onPress={() => router.push('/(app)/profile' as never)} style={[styles.iconBtn, { backgroundColor: palette.filled }]} accessibilityRole="button" accessibilityLabel="Profile">
                  <Text style={[styles.iconT, { color: palette.text }]} numberOfLines={1}>{email ? email.charAt(0).toUpperCase() : 'U'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
          {children}
        </View>
      </View>
      <BottomNav roles={roles} />
      <ToastHost />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 264,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  sidebarShadow: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 2, height: 0 } },
  collapsed: { width: 76 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, minHeight: minTouch, paddingHorizontal: 8 },
  brandDot: { width: 30, height: 30, borderRadius: 8, color: '#fff', textAlign: 'center', fontWeight: '700', lineHeight: 30, fontSize: 16 },
  brand: { ...type.title3, fontFamily: fontStack as never } as never,
  collapseBtn: { minHeight: minTouch, justifyContent: 'center', paddingHorizontal: 8 },
  collapseT: { fontSize: 20, fontWeight: '600' },
  section: { ...type.caption2, letterSpacing: 0.6, paddingHorizontal: 12, marginTop: 8, marginBottom: 4, fontFamily: fontStack as never } as never,
  link: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: minTouch, paddingHorizontal: 12, borderRadius: radius.group },
  linkGlyph: { width: 22, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  linkText: { ...type.callout, fontFamily: fontStack as never } as never,
  linkActive: { fontWeight: '600' },
  main: { flex: 1, padding: 16, minWidth: 0 },
  header: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.card, padding: 12, marginBottom: 12, gap: 10 },
  crumb: { ...type.caption1, fontFamily: fontStack as never } as never,
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  searchWrap: { position: 'relative', flex: 1, minWidth: 180, zIndex: 10 },
  searchField: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.input, paddingHorizontal: 10, minHeight: 36, gap: 6 },
  searchGlyph: { fontSize: 15 },
  search: { flex: 1, fontSize: 17, paddingVertical: 6, outlineStyle: 'none' } as never,
  clear: { minWidth: minTouch - 16, minHeight: minTouch - 16, alignItems: 'center', justifyContent: 'center' },
  clearT: { fontSize: 12, fontWeight: '700' },
  results: { position: 'absolute', top: 42, left: 0, right: 0, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.group, overflow: 'hidden' },
  resultRow: { paddingHorizontal: 12, minHeight: minTouch, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(120,120,128,0.15)' },
  resultT: { ...type.callout, fontFamily: fontStack as never } as never,
  segment: { flexDirection: 'row', borderRadius: radius.input, padding: 2, gap: 2 },
  segOpt: { minHeight: 32, minWidth: minTouch, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  segShadow: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segT: { fontSize: 13, fontWeight: '600' },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.pill, paddingHorizontal: 12, minHeight: 32, justifyContent: 'center' },
  pillT: { fontSize: 13, fontWeight: '600' },
  iconBtn: { width: minTouch, height: minTouch, borderRadius: minTouch / 2, alignItems: 'center', justifyContent: 'center' },
  iconT: { fontSize: 15, fontWeight: '700' },
});
