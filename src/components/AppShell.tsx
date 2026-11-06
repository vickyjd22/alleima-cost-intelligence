import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { elevation, fontStack, palette, radius, type } from '../theme/tokens';
import { MODULE_GROUPS, modules, modulesForRoles } from '../config/modules';
import type { Role } from '../lib/permissions';
import { useSession } from '../store/session';
import { demoDb } from '../mocks/demo';
import { BottomNav } from './BottomNav';
import { ToastHost } from './Toast';
import { Icon, ModuleIcon } from './Icon';
import { Avatar, BrandMark } from './ui';
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

type HoverState = { pressed: boolean; hovered?: boolean };

function displayName(email: string | null): string {
  const local = (email ?? 'demo@alleima.example').split('@')[0] ?? 'demo';
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
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
  const showPeriod = width >= 1240;
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
  const matches = q
    ? modules.filter((m) => m.title.toLowerCase().includes(q) || m.short.toLowerCase().includes(q)).slice(0, 7)
    : [];
  // Real count (no hardcoded badge): pending approvals in the session store.
  const pending = demoDb.approvals.filter((a) => a.status === 'pending').length;
  const name = displayName(email);

  function go(route: string): void {
    setQuery('');
    setSearchFocus(false);
    router.push(route as never);
  }
  function logout(): void {
    signOut();
    router.replace('/(auth)/sign-in' as never);
  }

  /* ------------------------------------------------------------ Search -- */
  const SearchBox = (
    <View style={[styles.searchWrap, compact && { flex: 1 }]}>
      <View style={[styles.searchField, searchFocus && styles.searchFieldFocus]}>
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
            <Icon name="x" size={13} color={palette.text2} strokeWidth={2.2} />
          </Pressable>
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
                style={({ pressed, hovered }: HoverState) => [styles.resultRow, (pressed || hovered) && { backgroundColor: palette.cardMuted }]}
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

  /* ------------------------------------------------------------ Period -- */
  const PeriodControl = (
    <View style={styles.periodTrack} accessibilityRole="tablist" accessibilityLabel="Reporting period">
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
            <Text style={[styles.periodOptT, { color: on ? palette.tintPressed : palette.text2 }]}>
              {(PERIOD_LABEL[p] ?? p).split(' ')[0]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  /* ---------------------------------------------------------- Sidebar -- */
  const NavItem = ({ id, title, route }: { id: string; title: string; route: string }) => {
    const active = activeModule?.id === id;
    return (
      <Pressable
        onPress={() => go(route)}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ selected: active }}
        style={({ pressed, hovered }: HoverState) => [
          styles.navItem,
          collapsed && styles.navItemCollapsed,
          active && styles.navItemActive,
          !active && (pressed || hovered) ? { backgroundColor: palette.filled } : null,
        ]}
      >
        <ModuleIcon id={id} size={18} color={active ? '#FFFFFF' : palette.text2} strokeWidth={active ? 2.1 : 1.8} />
        {!collapsed ? (
          <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  const FooterLink = ({ icon, label, onPress, danger }: { icon: 'settings' | 'help' | 'logOut'; label: string; onPress: () => void; danger?: boolean }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed, hovered }: HoverState) => [
        styles.footLink,
        collapsed && { justifyContent: 'center', paddingHorizontal: 0 },
        (pressed || hovered) && { backgroundColor: palette.filled },
      ]}
    >
      <Icon name={icon} size={18} color={danger ? palette.error : palette.text2} strokeWidth={1.8} />
      {!collapsed ? <Text style={[styles.footLinkT, danger && { color: palette.error }]}>{label}</Text> : null}
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.body, wide && styles.bodyWide]}>
        {wide ? (
          <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
            <View style={[styles.brandRow, collapsed && { justifyContent: 'center' }]}>
              <Pressable
                onPress={() => router.push('/(app)/overview' as never)}
                accessibilityRole="button"
                accessibilityLabel="Go to Overview"
                style={styles.brandBtn}
              >
                <BrandMark size={34} showWordmark={!collapsed} />
              </Pressable>
              {!collapsed ? (
                <Pressable
                  onPress={() => setCollapsed(true)}
                  style={styles.collapseBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Collapse navigation"
                >
                  <Icon name="panelClose" size={16} color={palette.text3} strokeWidth={1.9} />
                </Pressable>
              ) : null}
            </View>
            {collapsed ? (
              <Pressable
                onPress={() => setCollapsed(false)}
                style={[styles.collapseBtn, { alignSelf: 'center', marginBottom: 6 }]}
                accessibilityRole="button"
                accessibilityLabel="Expand navigation"
              >
                <Icon name="panelOpen" size={16} color={palette.text3} strokeWidth={1.9} />
              </Pressable>
            ) : null}

            <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
              {MODULE_GROUPS.map((group) => {
                const items = visible.filter((m) => m.group === group);
                if (!items.length) return null;
                return (
                  <View key={group} style={styles.navGroup}>
                    {collapsed ? <View style={styles.navDivider} /> : <Text style={styles.navGroupLabel}>{group.toUpperCase()}</Text>}
                    {items.map((m) => (
                      <NavItem key={m.id} id={m.id} title={m.title} route={m.route} />
                    ))}
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.sidebarFooter}>
              <FooterLink icon="settings" label="Settings" onPress={() => router.push('/(app)/profile' as never)} />
              <FooterLink icon="help" label="Help" onPress={() => router.push('/(app)/review' as never)} />
              <FooterLink icon="logOut" label="Logout" onPress={logout} danger />
            </View>
          </View>
        ) : null}

        <View style={styles.main}>
          <View style={[styles.header, compact && styles.headerCompact]}>
            {compact ? (
              <Pressable onPress={() => router.push('/(app)/overview' as never)} accessibilityRole="button" accessibilityLabel="Home">
                <BrandMark size={30} showWordmark={false} />
              </Pressable>
            ) : null}
            {SearchBox}
            <View style={styles.headerActions}>
              {showPeriod ? PeriodControl : null}
              {!compact ? (
                <View style={styles.plantPill}>
                  <Icon name="mapPin" size={14} color={palette.text2} />
                  <Text style={styles.plantPillT}>{(plantId ?? 'mehsana').replace(/^./, (c) => c.toUpperCase())}</Text>
                </View>
              ) : null}
              <Pressable
                onPress={() => router.push('/(app)/notifications' as never)}
                style={({ pressed, hovered }: HoverState) => [styles.iconCircle, (pressed || hovered) && { backgroundColor: palette.filled }]}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <Icon name="bell" size={18} color={palette.text2} strokeWidth={1.8} />
              </Pressable>
              <Pressable
                onPress={() => router.push('/(app)/approvals' as never)}
                style={({ pressed, hovered }: HoverState) => [styles.iconCircle, (pressed || hovered) && { backgroundColor: palette.filled }]}
                accessibilityRole="button"
                accessibilityLabel={pending ? `Approvals, ${pending} pending` : 'Approvals'}
              >
                <Icon name="listChecks" size={18} color={palette.text2} strokeWidth={1.8} />
                {pending > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeT}>{pending}</Text>
                  </View>
                ) : null}
              </Pressable>
              <Pressable
                onPress={() => router.push('/(app)/profile' as never)}
                accessibilityRole="button"
                accessibilityLabel="Profile"
                style={styles.userChip}
              >
                <Avatar name={name} size={34} />
                {!compact ? (
                  <View style={{ minWidth: 0, maxWidth: 170 }}>
                    <Text style={styles.userName} numberOfLines={1}>{name}</Text>
                    <Text style={styles.userEmail} numberOfLines={1}>{email ?? 'demo@alleima.example'}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
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
  bodyWide: { padding: 16, gap: 16 },

  /* Sidebar */
  sidebar: {
    width: 264,
    backgroundColor: palette.sidebarSurface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 10,
    ...elevation[2],
  } as never,
  sidebarCollapsed: { width: 76, paddingHorizontal: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 4, marginBottom: 10 },
  brandBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  collapseBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.filled },
  navScroll: { flex: 1 },
  navGroup: { marginBottom: 6 },
  navGroupLabel: { ...type.caption2, color: palette.text3, fontFamily: fontStack, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6 } as never,
  navDivider: { height: 1, backgroundColor: palette.sidebarBorder, marginVertical: 8, marginHorizontal: 10 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: radius.input,
    marginBottom: 2,
    cursor: 'pointer',
  } as never,
  navItemCollapsed: { justifyContent: 'center', paddingHorizontal: 0, minHeight: 42, marginBottom: 4 },
  navItemActive: { backgroundColor: palette.tint, shadowColor: palette.tint, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 } as never,
  navLabel: { ...type.subhead, color: palette.text2, fontFamily: fontStack, flex: 1, fontWeight: '500' } as never,
  navLabelActive: { color: '#FFFFFF', fontWeight: '600' },
  sidebarFooter: { borderTopWidth: 1, borderTopColor: palette.sidebarBorder, paddingTop: 8, marginTop: 8, gap: 2 },
  footLink: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40, paddingHorizontal: 12, borderRadius: radius.input, cursor: 'pointer' } as never,
  footLinkT: { ...type.subhead, color: palette.text2, fontFamily: fontStack, fontWeight: '500' } as never,

  /* Main + header */
  main: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 30, paddingHorizontal: 4, paddingBottom: 12 },
  headerCompact: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },

  searchWrap: { position: 'relative', flex: 1, minWidth: 0, maxWidth: 520, zIndex: 40 } as never,
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 46,
    paddingHorizontal: 16,
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    ...elevation[1],
  } as never,
  searchFieldFocus: { borderColor: palette.tint },
  searchInput: { flex: 1, minWidth: 0, fontSize: 13.5, color: palette.text, fontFamily: fontStack, paddingVertical: 8, outlineStyle: 'none' } as never,
  searchClear: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.filled },
  results: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: palette.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 6,
    ...elevation[4],
  } as never,
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: radius.input, cursor: 'pointer' } as never,
  resultIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  resultGroup: { ...type.caption1, color: palette.text3, fontFamily: fontStack } as never,
  resultEmpty: { padding: 14 },
  resultEmptyT: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,

  periodTrack: { flexDirection: 'row', backgroundColor: palette.card, borderRadius: radius.input, padding: 3, gap: 2, borderWidth: 1, borderColor: palette.border },
  periodOpt: { minWidth: 40, height: 32, paddingHorizontal: 9, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  periodOptOn: { backgroundColor: palette.tintSoft },
  periodOptT: { fontSize: 12, fontWeight: '600', fontFamily: fontStack },
  plantPill: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border },
  plantPillT: { ...type.footnote, fontWeight: '600', color: palette.text2, fontFamily: fontStack } as never,
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } as never,
  badge: { position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: palette.tint, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: palette.bg },
  badgeT: { fontSize: 10, fontWeight: '700', color: '#fff', fontFamily: fontStack },
  userChip: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46, paddingLeft: 6, paddingRight: 14, borderRadius: radius.pill, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, cursor: 'pointer', ...elevation[1] } as never,
  userName: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  userEmail: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,

  /* Content */
  scroll: { flex: 1 },
  content: { paddingHorizontal: 4, paddingBottom: 40 },
  contentCompact: { paddingHorizontal: 16, paddingBottom: 110 },
  contentInner: { width: '100%', maxWidth: 1480, alignSelf: 'center' },
});

