import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from './Icon';
import { Button, Card } from './ui';
import { fontStack, palette, type } from '../theme/tokens';

/**
 * Permission-denied guarded state (Phase 7).
 *
 * Closes the gap noted in the audit: deep-linking directly to a route the
 * current role cannot access previously rendered the screen anyway. The shell
 * now renders this instead of the screen body when the active module is not in
 * the role's visible set. This is a presentational guard for the review build;
 * server-side rules (Firebase Functions) remain the authoritative check in
 * production.
 */
export function PermissionDenied({ moduleTitle }: { moduleTitle?: string }) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <View style={styles.icon}>
          <Icon name="lock" size={26} color={palette.warning} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>You don’t have access to this workspace</Text>
        <Text style={styles.body}>
          {moduleTitle ? `“${moduleTitle}” is` : 'This workspace is'} restricted for your current role. If you
          believe you should have access, contact your administrator. Authorization is enforced
          server-side in production.
        </Text>
        <View style={styles.actions}>
          <Button label="Go to Overview" icon="layoutDashboard" onPress={() => router.replace('/(app)/overview' as never)} />
          <Button label="Switch role (demo)" variant="secondary" icon="users" onPress={() => router.push('/(app)/profile' as never)} />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  card: { maxWidth: 480, width: '100%', alignItems: 'center', gap: 8, padding: 28 },
  icon: { width: 56, height: 56, borderRadius: 16, backgroundColor: palette.warningSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { ...type.title3, color: palette.text, textAlign: 'center', fontFamily: fontStack } as never,
  body: { ...type.subhead, color: palette.text2, textAlign: 'center', maxWidth: 400, fontFamily: fontStack, marginBottom: 12 } as never,
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
});
