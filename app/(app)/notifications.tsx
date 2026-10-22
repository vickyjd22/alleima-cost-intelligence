import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { StatusChip } from '../../src/components/StatusChip';
import { useSession } from '../../src/store/session';
import { tokens } from '../../src/theme/tokens';

const NOTIFS = [
  ['Costing run CR-2026-10 needs review', 'costing · submitted by costing team', 'warn', '/(app)/costing'],
  ['WO-1042 operation 30 awaiting QA', 'production · in-process inspection', 'info', '/(app)/work-orders'],
  ['SOPIC Invoice-0 exception (3 rows)', 'finance · never silently included', 'error', '/(app)/finance'],
  ['Adjustment ADJ-07 rejected — reason required', 'approvals · returned for correction', 'error', '/(app)/approvals'],
  ['Import CC-master completed (partial)', 'imports · 2 row errors fixed', 'ok', '/(app)/imports'],
] as const;

export default function Notifications() {
  const router = useRouter();
  const { roles } = useSession();
  return (
    <AppShell roles={roles}>
      <PageHeader title="Notifications — demo inbox" sub="SAMPLE notifications · tap to open the related record with context" />
      {NOTIFS.map(([t, s, tone, r]) => (
        <Pressable key={t} style={styles.card} onPress={() => router.push(r as never)}>
          <StatusChip label={tone === 'ok' ? 'Read' : 'Unread'} tone={tone as 'ok' | 'warn' | 'error' | 'info'} />
          <Text style={styles.t}>{t}</Text>
          <Text style={styles.d}>{s}</Text>
        </Pressable>
      ))}
      <Text style={styles.d}>Preferences live in Profile. Demo only — nothing is pushed to a live system.</Text>
    </AppShell>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: tokens.color.card, borderWidth: 1, borderColor: tokens.color.border, borderRadius: 12, padding: 12, marginBottom: 8, gap: 4 },
  t: { fontSize: 13, fontWeight: '700', color: tokens.color.text },
  d: { fontSize: 12, color: tokens.color.text2 },
});
