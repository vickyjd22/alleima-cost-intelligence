import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { StatusChip } from '../../src/components/StatusChip';
import { Avatar, Button, Card, SectionHeader } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { useSession } from '../../src/store/session';
import type { Role } from '../../src/lib/permissions';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

const ALL_ROLES: Role[] = [
  'platformAdmin', 'clientAdmin', 'management', 'costing', 'finance',
  'productionMgr', 'supervisor', 'operator', 'stores', 'engineering',
  'quality', 'hr', 'sales', 'procurement', 'auditor',
];

/** Profile + demo-only role switcher. Never used as production authorization. */
export default function Profile() {
  const router = useRouter();
  const { email, roles, plantId, period, setSession, signOut } = useSession();
  const active = roles.length ? roles : ['management' as Role];

  function toggle(role: Role): void {
    const next = active.includes(role) ? active.filter((r) => r !== role) : [...active, role];
    setSession({ roles: next.length ? next : (['management'] as Role[]) });
  }

  function handleSignOut(): void {
    signOut();
    router.replace('/(auth)/sign-in' as never);
  }

  return (
    <AppShell roles={active}>
      <PageHeader
        eyebrow="Account"
        title="Profile & preferences"
        sub="Demo-only role switcher — changes navigation, actions and sample tasks. Not production authorization."
      />
      <DemoBanner />

      <Card style={styles.identity}>
        <Avatar name={email ?? 'Demo User'} size={58} />
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text style={styles.email}>{email ?? 'demo@alleima.example'}</Text>
          <Text style={styles.meta}>Plant {plantId ?? 'mehsana'} · period {period} · illustrative SAMPLE account</Text>
          <View style={styles.chipRow}>
            <StatusChip label={`${active.length} active role${active.length === 1 ? '' : 's'}`} tone="info" />
            <StatusChip label="System theme" tone="neutral" />
          </View>
        </View>
        <Button label="Sign out" icon="logOut" variant="secondary" onPress={handleSignOut} />
      </Card>

      <SectionHeader
        title="Demo role switcher"
        description="Toggle roles to preview what each team sees. At least one role stays active."
        right={<Button label="Reset" size="sm" variant="ghost" icon="refresh" onPress={() => setSession({ roles: ['management'] })} />}
        style={{ marginTop: 24 }}
      />
      <View style={styles.grid}>
        {ALL_ROLES.map((r) => {
          const on = active.includes(r);
          return (
            <Pressable
              key={r}
              onPress={() => toggle(r)}
              style={[styles.chip, on && styles.on]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Toggle ${r} role`}
            >
              {on ? <Icon name="check" size={12} color="#fff" strokeWidth={3} /> : null}
              <Text style={[styles.chipT, on && { color: '#fff' }]}>{r}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Preferences" description="Applied to this browser session only." style={{ marginTop: 24 }} />
      <Card style={{ gap: 2 }} padded={false}>
        {[
          { icon: 'calendarDays' as const, k: 'Reporting period', v: period },
          { icon: 'mapPin' as const, k: 'Plant', v: plantId ?? 'mehsana' },
          { icon: 'bell' as const, k: 'Notifications', v: 'In-app only (demo)' },
          { icon: 'shieldCheck' as const, k: 'Session', v: 'Expires when the tab closes' },
        ].map((row, i) => (
          <View key={row.k} style={[styles.prefRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: palette.separator }]}>
            <Icon name={row.icon} size={16} color={palette.text2} />
            <Text style={styles.prefK}>{row.k}</Text>
            <Text style={styles.prefV}>{row.v}</Text>
          </View>
        ))}
      </Card>
      <Pressable onPress={handleSignOut} style={styles.signOutLink}>
        <Text style={styles.signOutT}>End this demo session</Text>
      </Pressable>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  email: { ...type.title3, color: palette.text, fontFamily: fontStack } as never,
  meta: { ...type.footnote, color: palette.text2, marginTop: 2, fontFamily: fontStack } as never,
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: palette.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: palette.card, cursor: 'pointer' } as never,
  on: { backgroundColor: palette.tint, borderColor: palette.tint },
  chipT: { fontSize: 12, fontWeight: '600', color: palette.text2, fontFamily: fontStack },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 13 },
  prefK: { ...type.footnote, color: palette.text2, flex: 1, fontFamily: fontStack } as never,
  prefV: { ...type.footnote, color: palette.text, fontWeight: '600', fontFamily: fontStack } as never,
  signOutLink: { alignSelf: 'center', marginTop: 20, padding: 10 },
  signOutT: { ...type.caption1, color: palette.text3, textDecorationLine: 'underline', fontFamily: fontStack } as never,
});
