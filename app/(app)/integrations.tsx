import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { StatusChip } from '../../src/components/StatusChip';
import { useSession } from '../../src/store/session';
import { tokens } from '../../src/theme/tokens';

const SYSTEMS: { title: string; status: string; tone: 'warn' | 'info'; desc: string }[] = [
  { title: 'ERP / SAP', status: 'SIMULATED — not connected', tone: 'warn', desc: 'Posting + master sync · direction ERP→ACI · owner IT · retry available in demo only' },
  { title: 'SOPIC', status: 'SIMULATED — sample bridge', tone: 'warn', desc: 'D+1 feed · Invoice-0 rows quarantined, never silently included' },
  { title: 'HR / Payroll', status: 'OUT OF SCOPE — pending D-17', tone: 'info', desc: 'Labour-rate import entry point only; no live sync' },
];

export default function Integrations() {
  const { roles } = useSession();
  return (
    <AppShell roles={roles}>
      <PageHeader title="Integrations — configuration + monitoring" sub="All connections SIMULATED unless genuinely configured · no invented credentials or successes" />
      {SYSTEMS.map((s) => (
        <View key={s.title} style={styles.card}>
          <StatusChip label={s.status} tone={s.tone} />
          <Text style={styles.t}>{s.title}</Text>
          <Text style={styles.d}>{s.desc}</Text>
          <Text style={styles.d}>Sync history, error detail, mapping entry point and reconciliation status live in Finance/Imports. Retry here is demo-only.</Text>
        </View>
      ))}
    </AppShell>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: tokens.color.card, borderWidth: 1, borderColor: tokens.color.border, borderRadius: 12, padding: 12, marginBottom: 8, gap: 4 },
  t: { fontSize: 13, fontWeight: '700', color: tokens.color.text },
  d: { fontSize: 12, color: tokens.color.text2 },
});
