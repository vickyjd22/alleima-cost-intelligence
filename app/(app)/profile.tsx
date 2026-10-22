import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { useSession } from '../../src/store/session';
import type { Role } from '../../src/lib/permissions';
import { tokens } from '../../src/theme/tokens';

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
      <PageHeader title="Profile & Preferences" sub="Demo-only role switcher — changes navigation, actions and sample tasks. Not production authorization." />
      <DemoBanner />
      <View style={styles.card}>
        <Text style={styles.t}>Signed in as {email ?? 'demo@alleima.example'}</Text>
        <Text style={styles.d}>Plant: {plantId ?? 'mehsana'} · Period: {period} · Theme: system (light/dark via OS)</Text>
      </View>
      <Text style={styles.h}>Demo role switcher</Text>
      <View style={styles.grid}>
        {ALL_ROLES.map((r) => {
          const on = active.includes(r);
          return (
            <Pressable key={r} onPress={() => toggle(r)} style={[styles.chip, on && styles.on]}>
              <Text style={[styles.chipT, on && styles.onT]}>{r}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.btn} onPress={handleSignOut}>
        <Text style={styles.btnT}>Sign out (confirm: demo session ends)</Text>
      </Pressable>
    </AppShell>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: tokens.color.border, padding: 16, gap: 6 },
  t: { fontSize: 13, fontWeight: '700', color: tokens.color.text },
  d: { fontSize: 12, color: tokens.color.text2 },
  h: { fontSize: 14, fontWeight: '700', color: tokens.color.text, marginVertical: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: tokens.color.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  on: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  chipT: { fontSize: 12, fontWeight: '700', color: tokens.color.text2 },
  onT: { color: '#fff' },
  btn: { backgroundColor: tokens.color.error, borderRadius: 10, padding: 12, marginTop: 16, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '700' },
});
