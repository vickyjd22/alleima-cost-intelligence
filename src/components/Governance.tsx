import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

export interface AuditEntry {
  at: string;
  actor: string;
  action: string;
  detail?: string;
}

export function AuditPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.h}>Audit history</Text>
      {entries.length === 0 ? <Text style={styles.sub}>No entries yet.</Text> : null}
      {entries.map((e, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.dot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.action}>{e.action}</Text>
            <Text style={styles.sub}>
              {e.actor} · {e.at}
              {e.detail ? ` · ${e.detail}` : ''}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function ApprovalTimeline({ steps }: { steps: { label: string; state: 'done' | 'now' | 'todo'; by?: string }[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.h}>Approval timeline</Text>
      {steps.map((s, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.dot, s.state === 'done' && { backgroundColor: tokens.color.success }, s.state === 'now' && { backgroundColor: tokens.color.primary }]} />
          <Text style={styles.action}>
            {s.label}
            {s.by ? ` — ${s.by}` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: tokens.color.card, borderRadius: tokens.radius.card, borderWidth: 1, borderColor: tokens.color.border, padding: 16, marginTop: 12 },
  h: { fontWeight: '700', color: tokens.color.text, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.color.border, marginTop: 5 },
  action: { fontSize: 13, fontWeight: '600', color: tokens.color.text },
  sub: { fontSize: 12, color: tokens.color.text2 },
});
