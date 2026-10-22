import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { Card } from './ui';
import { fontStack, palette, type } from '../theme/tokens';

export interface AuditEntry {
  at: string;
  actor: string;
  action: string;
  detail?: string;
}

export function AuditPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <Card style={{ marginTop: 14 }}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Icon name="fileText" size={16} color={palette.tint} strokeWidth={1.9} />
        </View>
        <Text style={styles.h}>Audit history</Text>
      </View>
      {entries.length === 0 ? <Text style={styles.sub}>No entries recorded in this session.</Text> : null}
      {entries.map((e, i) => (
        <View key={i} style={[styles.row, i < entries.length - 1 && styles.rowBorder]}>
          <View style={styles.dot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.action}>{e.action}</Text>
            <Text style={styles.sub}>{e.actor} · {e.at}{e.detail ? ` · ${e.detail}` : ''}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

export function ApprovalTimeline({ steps }: { steps: { label: string; state: 'done' | 'now' | 'todo'; by?: string }[] }) {
  return (
    <Card style={{ marginTop: 14 }}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Icon name="checkCheck" size={16} color={palette.tint} strokeWidth={1.9} />
        </View>
        <Text style={styles.h}>Approval timeline</Text>
      </View>
      <View style={{ marginTop: 8 }}>
        {steps.map((s, i) => {
          const done = s.state === 'done';
          const now = s.state === 'now';
          return (
            <View key={i} style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  done && { backgroundColor: palette.success, borderColor: palette.success },
                  now && { backgroundColor: palette.card, borderColor: palette.tint, borderWidth: 2 },
                ]}
              >
                {done ? <Icon name="check" size={10} color="#fff" strokeWidth={3} /> : null}
                {now ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: palette.tint }} /> : null}
              </View>
              {i < steps.length - 1 ? <View style={[styles.connector, done && { backgroundColor: palette.successBorder }]} /> : null}
              <View style={{ flex: 1, paddingBottom: 12 }}>
                <Text style={[styles.action, now && { color: palette.tint }]}>{s.label}</Text>
                {s.by ? <Text style={styles.sub}>{s.by}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 6 },
  headIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  h: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: palette.separator },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.tint, marginTop: 6 },
  action: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.caption1, color: palette.text2, fontFamily: fontStack, marginTop: 2 } as never,
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  connector: { position: 'absolute', left: 9.5, top: 20, bottom: 0, width: 1.5, backgroundColor: palette.border },
});
