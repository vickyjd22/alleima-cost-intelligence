import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { StatusChip } from '../../src/components/StatusChip';
import { Button, Card } from '../../src/components/ui';
import { Icon, type IconName } from '../../src/components/Icon';
import { useSession } from '../../src/store/session';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

const NOTIFS = [
  { t: 'Costing run CR-2026-10 needs review', s: 'Costing · submitted by costing team', tone: 'warn', route: '/(app)/costing', when: '12m' },
  { t: 'WO-1042 operation 30 awaiting QA', s: 'Production · in-process inspection', tone: 'info', route: '/(app)/work-orders', when: '48m' },
  { t: 'SOPIC Invoice-0 exception (3 rows)', s: 'Finance · never silently included', tone: 'error', route: '/(app)/finance', when: '2h' },
  { t: 'Adjustment ADJ-07 rejected — reason required', s: 'Approvals · returned for correction', tone: 'error', route: '/(app)/approvals', when: '4h' },
  { t: 'Import CC-master completed (partial)', s: 'Imports · 2 row errors fixed', tone: 'ok', route: '/(app)/imports', when: '1d' },
] as const;

const TONE_ICON: Record<string, IconName> = { warn: 'triangleAlert', info: 'info', error: 'alertCircle', ok: 'checkCircle' };

export default function Notifications() {
  const router = useRouter();
  const { roles } = useSession();
  const [read, setRead] = useState<string[]>(['Import CC-master completed (partial)']);
  const unread = NOTIFS.filter((n) => !read.includes(n.t)).length;

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        sub={`${unread} unread · sample notifications. Tap a card to open the related record with context.`}
        right={<Button label="Mark all read" variant="secondary" size="sm" icon="checkCheck" onPress={() => setRead(NOTIFS.map((n) => n.t))} disabled={unread === 0} />}
      />
      <View style={{ gap: 8 }}>
        {NOTIFS.map((n) => {
          const isRead = read.includes(n.t);
          const tone = n.tone as 'warn' | 'info' | 'error' | 'ok';
          const color = tone === 'error' ? palette.error : tone === 'warn' ? palette.warning : tone === 'ok' ? palette.success : palette.tint;
          const bg = tone === 'error' ? palette.errorSoft : tone === 'warn' ? palette.warningSoft : tone === 'ok' ? palette.successSoft : palette.tintSoft;
          return (
            <Card key={n.t} padded={false} style={!isRead ? { borderLeftWidth: 3, borderLeftColor: color } : undefined}>
              <Pressable
                onPress={() => { setRead((r) => (r.includes(n.t) ? r : [...r, n.t])); router.push(n.route as never); }}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: palette.cardMuted }]}
                accessibilityRole="button"
                accessibilityLabel={n.t}
              >
                <View style={[styles.icon, { backgroundColor: bg }]}>
                  <Icon name={TONE_ICON[n.tone] ?? 'info'} size={17} color={color} strokeWidth={1.9} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.t, !isRead && { fontWeight: '700' }]} numberOfLines={2}>{n.t}</Text>
                    <Text style={styles.when}>{n.when}</Text>
                  </View>
                  <Text style={styles.s} numberOfLines={1}>{n.s}</Text>
                </View>
                {!isRead ? <View style={[styles.dot, { backgroundColor: palette.tint }]} /> : <Icon name="chevronRight" size={15} color={palette.text3} />}
              </Pressable>
            </Card>
          );
        })}
      </View>
      <View style={styles.footer}>
        <StatusChip label="Demo inbox · nothing is pushed to a live system" tone="neutral" />
        <Pressable onPress={() => router.push('/(app)/profile' as never)}>
          <Text style={styles.link}>Manage preferences in Profile</Text>
        </Pressable>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, borderRadius: radius.card },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  t: { ...type.footnote, color: palette.text, fontWeight: '600', flex: 1, fontFamily: fontStack } as never,
  when: { ...type.caption2, color: palette.text3, fontFamily: fontStack, marginTop: 2 } as never,
  s: { ...type.caption1, color: palette.text2, marginTop: 2, fontFamily: fontStack } as never,
  dot: { width: 8, height: 8, borderRadius: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 16, flexWrap: 'wrap' },
  link: { ...type.caption1, color: palette.tint, fontWeight: '600', fontFamily: fontStack } as never,
});
