import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import {
  fontStack,
  palette,
  radius,
  shadowSidebar,
  type,
} from '../theme/tokens';
import { MODULE_GROUPS, modules, modulesForRoles } from '../config/modules';
import type { Role } from '../lib/permissions';
import { useSession } from '../store/session';
import { BottomNav } from './BottomNav';
import { ToastHost } from './Toast';
import { Icon, ModuleIcon } from './Icon';
import { Avatar, BrandMark, IconButton } from './ui';
import { PermissionDenied } from './PermissionDenied';

/** Routes that are always reachable regardless of role. */
const ALWAYS_ALLOWED = ['overview', 'profile'];

const PERIODS = ['202607', '202608', '202609', '202610'];
const PERIOD_LABEL: Record<string, string> = {
  '202607': 'Jul 2026',
  '202608': 'Aug 2026',
  '202609': 'Sep 2026',
  '202610': 'Oct 2026',
};

function roleLabel(roles: Role[]): string {
  if (!roles.length) return 'Guest';
  return roles[0]!.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

export function AppShell({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const router = useRouter();
  const { email, plantId, period, setSession, signOut } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const wide = width >= 1024;
  const compact = width < 760;
  const roomy = width >= 1320;
  const visible = modulesForRoles(roles);

  const activeModule = visible.find((m) => pathname.includes(m.id));
  // Permission guard: a route that maps to a real module the current role
  // cannot see renders a denied state instead of the screen body.
  const routeModule = modules.find((m) => pathname.includes(m.id));
  const denied =
    !!routeModule &&
    !ALWAYS_ALLOWED.includes(routeModule.id) &&
    !visible.some((m) => m.id === routeModule.id);
  const q = query.trim().toLowerCase();
  const matches = q ? modules.filter((m) => m.title.toLowerCase().includes(q) || m.short.toLowerCase().includes(q)).slice(0, 7) : [];

  function go(route: string): void {
    setQuery('');
    setSearchFocus(false);
    router.push(route as never);
  }

  const SearchBox = (
    <View style={[styles.searchWrap, searchFocus && styles.searchWrapFocus, compact && { flex: 1 }]}>
      <View style={[styles.searchField, searchFocus && { borderColor: palette.tint, backgroundColor: palette.card }]}>
        <Icon name="search" size={17} color={palette.text3} strokeWidth={2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setTimeout(() => setSearchFocus(false), 120)}
          placeholder={compact ? 'Search' : 'Search modules and workspaces'}
          placeholderTextColor={palette.text3 as never}
          style={styles.searchInput}
          accessibilityLabel="Search modules"
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search" style={styles.searchClear}>
            <Icon name="x" size={14} color={palette.text2} strokeWidth={2.2} />
          </Pressable>
        ) : !compact ? (
          <View style={styles.kbd}>
            <Text style={styles.kbdT}>{Platform.OS === 'web' ? 'Ctrl K' : '⌘ K'}</Text>
          </View>
        ) : null}
      </View>
      {searchFocus && query ? (
        <View style={styles.results}>
          {matches.length === 0 ? (
            <View style={styles.resultEmpty}>
              <Text style={styles.resultEmptyT}>No workspace matches “{query.trim()}”</Text>
            </View>
          ) : (
            matches.map((m) => (
              <Pressable
                key={m.id}
                onPress={() => go(m.route)}
                style={({ pressed }) => [styles.resultRow, pressed && { backgroundColor: palette.bgAlt }]}
                accessibilityRole="button"
                accessibilityLabel={m.title}
              >
                <View style={styles.resultIcon}>
                  <ModuleIcon id={m.id} size={16} color={palette.tint} strokeWidth={1.9} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultTitle}>{m.title}</Text>
                  <Text style={styles.resultGroup}>{m.group}</Text>
                </View>
                <Icon name="arrowUpRight" size={15} color={palette.text3} />
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );

  const PeriodControl = (
    <View style={styles.periodWrap} accessibilityRole="tablist" accessibilityLabel="Reporting period">
      <View style={styles.periodLabel}>
        <Icon name="calendarDays" size={14} color={palette.text2} />
        {roomy ? <Text style={styles.periodLabelT}>{PERIOD_LABEL[period] ?? period}</Text> : null}
      </View>
      <View style={styles.periodTrack}>
        {PERIODS.map((p) => {
          const on = p === period;
          return (
            <Pressable
              key={p}
              onPress={() => setSession({ period: p })}
              accessibilityRole="button"
              accessibilityLabel={`Period ${PERIOD_LABEL[p]}`}
              accessibilityState={{ selected: on }}
              style={[styles.periodOpt, on && styles.periodOptOn]}
            >
              <Text style={[styles.periodOptT, { color: on ? palette.text : palette.text2 }]}>{p.slice(4)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        {wide ? (
          <View style={[styles.sidebar, collapsed ? styles.sidebarCollapsed : null, styles.sidebarShadow]}>
            <View style={[styles.brandRow, collapsed && { justifyContent: 'center' }]}>
              <Pressable
                onPress={() => router.push('/(app)/overview' as never)}
                accessibilityRole="button"
                accessibilityLabel="Go to Overview"
                style={[styles.brandBtn, collapsed && { paddingHorizontal: 0 }]}
              >
                <BrandMark size={36} showWordmark={!collapsed} onDark />
              </Pressable>
            </View>

            <Pressable
              onPress={() => setCollapsed((c) => !c)}
              style={styles.collapseBtn}
              accessibilityRole="button"
              accessibilityLabel={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              <Icon name={collapsed ? 'panelOpen' : 'panelClose'} size={17} color={palette.sidebarMuted} strokeWidth={1.9} />
            </Pressable>

            <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
              {MODULE_GROUPS.map((group) => {
                const items = visible.filter((m) => m.group === group);
                if (!items.length) return null;
                return (
                  <View key={group} style={styles.navGroup}>
                    {collapsed ? (
                      <View style={styles.navDivider} />
                    ) : (
                      <Text style={styles.navGroupLabel}>{group.toUpperCase()}</Text>
                    )}
                    {items.map((m) => {
                      const active = activeModule?.id === m.id;
                      return (
                        <Pressable
                          key={m.id}
                          onPress={() => go(m.route)}
                          accessibilityRole="button"
                          accessibilityLabel={m.title}
                          accessibilityState={{ selected: active }}
                          style={({ pressed }) => [
                            styles.navItem,
                            collapsed && styles.navItemCollapsed,
                            active && styles.navItemActive,
                            pressed && !active && { backgroundColor: 'rgba(255,255,255,0.05)' },
                          ]}
                        >
                          {active ? <View style={styles.navAccent} /> : null}
                          <ModuleIcon
                            id={m.id}
                            size={18}
                            color={active ? '#FFFFFF' : palette.sidebarMuted}
                            strokeWidth={active ? 2.1 : 1.8}
                          />
                          {!collapsed ? (
                            <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
                              {m.title}
                            </Text>
                          ) : null}
                          {!collapsed && active ? <View style={styles.navDot} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>

            <View style={[styles.sidebarFooter, collapsed && styles.sidebarFooterCollapsed]}>
              {!collapsed ? (
                <View style={styles.demoRow}>
                  <View style={styles.demoDot} />
                  <Text style={styles.demoT}>Demo workspace · sample data</Text>
                </View>
              ) : null}
              <Pressable
                onPress={() => router.push('/(app)/profile' as never)}
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                style={[styles.userCard, collapsed && { justifyContent: 'center', paddingHorizontal: 0 }]}
              >
                <Avatar name={email ?? 'Demo User'} size={collapsed ? 32 : 34} tone="dark" />
                {!collapsed ? (
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.userEmail} numberOfLines={1}>{email ?? 'demo@alleima.example'}</Text>
                    <Text style={styles.userRole} numberOfLines={1}>{roleLabel(roles)} · {plantId ?? 'mehsana'}</Text>
                  </View>
                ) : null}
                {!collapsed ? (
                  <IconButton
                    icon="logOut"
                    label="Sign out"
                    tone="inverse"
                    size={30}
                    iconSize={15}
                    onPress={() => {
                      signOut();
                      router.replace('/(auth)/sign-in' as never);
                    }}
                  />
                ) : null}
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.main}>
          <View style={[styles.header, compact && styles.headerCompact]}>
            <View style={[styles.headerTop, compact && { width: '100%' }]}>
              {compact ? (
                <Pressable onPress={() => router.push('/(app)/overview' as never)} accessibilityRole="button" accessibilityLabel="Home" style={{ marginRight: 4 }}>
                  <BrandMark size={32} showWordmark={false} />
                </Pressable>
              ) : (
                <View style={styles.crumbWrap}>
                  <Text style={styles.crumbHome}>Workspace</Text>
                  <Icon name="chevronRight" size={13} color={palette.text3} />
                  <Text style={styles.crumbCurrent} numberOfLines={1}>{activeModule?.short ?? 'Overview'}</Text>
                  <View style={styles.demoPill}>
                    <View style={styles.demoPillDot} />
                    <Text style={styles.demoPillT}>DEMO</Text>
                  </View>
                </View>
              )}

              {compact ? (
                <View style={styles.mobileBrand}>
                  <Text style={styles.mobileBrandT}>Alleima</Text>
                  <Text style={styles.mobileBrandS}>Cost Intelligence</Text>
                </View>
              ) : null}

              {!compact ? SearchBox : null}

              <View style={styles.headerActions}>
                {compact ? null : PeriodControl}
                {roomy ? (
                  <View style={styles.plantPill}>
                    <Icon name="mapPin" size={14} color={palette.text2} />
                    <Text style={styles.plantPillT}>Mehsana</Text>
                  </View>
                ) : null}
                <View style={styles.bellWrap}>
                  <IconButton icon="bell" label="Notifications" onPress={() => router.push('/(app)/notifications' as never)} />
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeT}>5</Text>
                  </View>
                </View>
                <Pressable onPress={() => router.push('/(app)/profile' as never)} accessibilityRole="button" accessibilityLabel="Profile" style={styles.avatarBtn}>
                  <Avatar name={email ?? 'Demo User'} size={34} />
                </Pressable>
              </View>
            </View>

            {compact ? (
              <View style={styles.headerMobileRow}>
                {SearchBox}
                {PeriodControl}
              </View>
            ) : null}
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.content, compact && styles.contentCompact]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentInner}>
              {denied ? <PermissionDenied moduleTitle={routeModule?.title} /> : children}
            </View>
          </ScrollView>
        </View>
      </View>
      <BottomNav roles={roles} />
      <ToastHost />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 262,
    backgroundColor: palette.sidebar,
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 12,
    ...shadowSidebar,
  } as never,
  sidebarShadow: { zIndex: 20 },
  sidebarCollapsed: { width: 82, paddingHorizontal: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 4 },
  brandBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 2 },
  collapseBtn: {
    alignSelf: 'flex-end',
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  navScroll: { flex: 1, marginTop: 4 },
  navGroup: { marginBottom: 8 },
  navGroupLabel: {
    ...type.caption2,
    color: palette.sidebarMuted,
    fontFamily: fontStack,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    opacity: 0.85,
  } as never,
  navDivider: { height: 1, backgroundColor: palette.sidebarBorder, marginVertical: 8, marginHorizontal: 10 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 9,
    marginBottom: 2,
    position: 'relative',
    cursor: 'pointer',
  } as never,
  navItemCollapsed: { justifyContent: 'center', paddingHorizontal: 0, minHeight: 42, marginBottom: 4 },
  navItemActive: { backgroundColor: palette.sidebarActive, borderWidth: 1, borderColor: palette.sidebarActiveBorder },
  navAccent: { position: 'absolute', left: -1, top: 9, bottom: 9, width: 3, borderRadius: 2, backgroundColor: palette.tint },
  navLabel: { ...type.subhead, color: palette.sidebarMuted, fontFamily: fontStack, flex: 1, fontWeight: '500' } as never,
  navLabelActive: { color: '#FFFFFF', fontWeight: '600' },
  navDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: palette.tint },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: palette.sidebarBorder,
    paddingTop: 10,
    marginTop: 8,
    gap: 8,
  },
  sidebarFooterCollapsed: { alignItems: 'center' },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  demoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FDB022' },
  demoT: { ...type.caption1, color: palette.sidebarMuted, fontFamily: fontStack } as never,
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: palette.sidebarBorder,
    cursor: 'pointer',
  } as never,
  userEmail: { ...type.footnote, color: palette.sidebarText, fontWeight: '600', fontFamily: fontStack } as never,
  userRole: { ...type.caption1, color: palette.sidebarMuted, fontFamily: fontStack, marginTop: 1 } as never,

  main: { flex: 1, minWidth: 0 },
  header: {
    backgroundColor: palette.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 10,
    zIndex: 30,
  },
  headerCompact: { paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  crumbWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, minWidth: 110 },
  crumbHome: { ...type.footnote, color: palette.text3, fontFamily: fontStack, fontWeight: '500' } as never,
  crumbCurrent: { ...type.footnote, color: palette.text, fontFamily: fontStack, fontWeight: '600' } as never,
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: palette.warningSoft,
    borderWidth: 1,
    borderColor: palette.warningBorder,
  },
  demoPillDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: palette.warning },
  demoPillT: { fontSize: 9.5, fontWeight: '800', color: palette.warning, letterSpacing: 0.6, fontFamily: fontStack },

  searchWrap: { flex: 1, minWidth: 130, maxWidth: 420, position: 'relative', zIndex: 40 },
  searchWrapFocus: { zIndex: 60 },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  searchInput: { flex: 1, fontSize: 13.5, paddingVertical: 6, color: palette.text, fontFamily: fontStack, outlineStyle: 'none' } as never,
  searchClear: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.filled },
  kbd: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.bgAlt },
  kbdT: { fontSize: 10, color: palette.text3, fontWeight: '600', fontFamily: fontStack },
  results: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: palette.card,
    borderRadius: radius.group,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 6,
    shadowColor: palette.sidebar,
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  } as never,
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 8, cursor: 'pointer' } as never,
  resultIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { ...type.footnote, color: palette.text, fontWeight: '600', fontFamily: fontStack } as never,
  resultGroup: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  resultEmpty: { padding: 14 },
  resultEmptyT: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,

  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  plantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
  },
  plantPillT: { ...type.caption1, color: palette.text2, fontWeight: '600', fontFamily: fontStack } as never,
  bellWrap: { position: 'relative' },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 1,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: palette.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: palette.card,
  },
  bellBadgeT: { color: '#fff', fontSize: 8.5, fontWeight: '800', fontFamily: fontStack },
  avatarBtn: { borderRadius: 999, cursor: 'pointer' } as never,

  periodWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  periodLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 2 },
  periodLabelT: { ...type.caption1, color: palette.text2, fontWeight: '600', fontFamily: fontStack } as never,
  periodTrack: { flexDirection: 'row', backgroundColor: palette.bgAlt, borderRadius: 9, padding: 3, gap: 2 },
  periodOpt: { minWidth: 32, height: 28, paddingHorizontal: 7, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  periodOptOn: { backgroundColor: palette.card, shadowColor: palette.sidebar, shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 } as never,
  periodOptT: { fontSize: 11.5, fontWeight: '700', fontFamily: fontStack },

  headerMobileRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mobileBrand: { flex: 1, justifyContent: 'center' },
  mobileBrandT: { ...type.headline, color: palette.text, fontFamily: fontStack, letterSpacing: -0.2 } as never,
  mobileBrandS: { ...type.caption1, color: palette.text3, fontFamily: fontStack, letterSpacing: 0.3 } as never,

  scroll: { flex: 1 },
  content: { paddingHorizontal: 28, paddingTop: 22, paddingBottom: 40, alignItems: 'center' },
  contentCompact: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 104 },
  contentInner: { width: '100%', maxWidth: 1380 },
});
