import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { StatusChip } from '../../src/components/StatusChip';
import { Button, Callout, Card } from '../../src/components/ui';
import { Icon, type IconName } from '../../src/components/Icon';
import { useSession } from '../../src/store/session';
import { fontStack, palette, type } from '../../src/theme/tokens';

const SYSTEMS: { title: string; status: string; tone: 'warn' | 'info'; desc: string; icon: IconName; link: string; owner: string }[] = [
  { title: 'ERP / SAP', status: 'SIMULATED — not connected', tone: 'warn', icon: 'server', desc: 'Posting and master sync · direction ERP → ACI · no invented credentials or success states.', link: '/(app)/imports', owner: 'IT' },
  { title: 'SOPIC', status: 'SIMULATED — sample bridge', tone: 'warn', icon: 'fileText', desc: 'D+1 sales feed · Invoice-0 rows are quarantined, never silently included.', link: '/(app)/finance', owner: 'Finance' },
  { title: 'HR / Payroll', status: 'OUT OF SCOPE — pending D-17', tone: 'info', icon: 'users', desc: 'Labour-rate import entry point only; no live sync or employee data.', link: '/(app)/imports', owner: 'HR' },
];

export default function Integrations() {
  const { roles } = useSession();
  const router = useRouter();
  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Platform"
        title="Integrations"
        sub="Configuration and monitoring for external systems. Every connection below is simulated unless genuinely configured."
      />
      <Callout tone="warn" title="Nothing is live yet" compact>
        Retry, sync history and error detail are demo-only. Production connections require signed contracts, credentials and a data-processing agreement.
      </Callout>
      <View style={{ gap: 10, marginTop: 14 }}>
        {SYSTEMS.map((s) => (
          <Card key={s.title} style={{ gap: 10 }}>
            <View style={styles.head}>
              <View style={[styles.icon, { backgroundColor: s.tone === 'warn' ? palette.warningSoft : palette.tintSoft }]}>
                <Icon name={s.icon} size={18} color={s.tone === 'warn' ? palette.warning : palette.tint} strokeWidth={1.9} />
              </View>
              <View style={{ flex: 1, minWidth: 160 }}>
                <Text style={styles.t}>{s.title}</Text>
                <Text style={styles.owner}>Owner: {s.owner}</Text>
              </View>
              <StatusChip label={s.status} tone={s.tone} />
            </View>
            <Text style={styles.d}>{s.desc}</Text>
            <View style={styles.footer}>
              <Text style={styles.hint}>Sync history, mapping and reconciliation status live in Finance / Imports.</Text>
              <Button label="Open" size="sm" variant="ghost" iconRight="arrowRight" onPress={() => router.push(s.link as never)} />
            </View>
          </Card>
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  icon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  t: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  owner: { ...type.caption1, color: palette.text3, marginTop: 1, fontFamily: fontStack } as never,
  d: { ...type.footnote, color: palette.text2, lineHeight: 20, fontFamily: fontStack } as never,
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: palette.separator, paddingTop: 10 },
  hint: { ...type.caption1, color: palette.text3, flex: 1, minWidth: 200, fontFamily: fontStack } as never,
});
