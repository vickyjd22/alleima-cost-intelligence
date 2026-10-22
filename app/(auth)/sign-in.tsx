import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/firebase/config';
import { SignInForm } from '../../src/components/SignInForm';
import { useSession } from '../../src/store/session';
import type { Role } from '../../src/lib/permissions';
import { tokens } from '../../src/theme/tokens';

/**
 * DEMO accounts for testing without Firebase keys (local mock only).
 * Production uses Firebase Auth + custom claims; remove demo bypass before release.
 */
const DEMO_PASSWORD = 'Demo1234!';
const DEMO_ACCOUNTS: { email: string; roles: Role[]; label: string }[] = [
  { email: 'demo@alleima.example', roles: ['management'], label: 'Management' },
  { email: 'costing@alleima.example', roles: ['costing'], label: 'Costing Manager' },
  { email: 'finance@alleima.example', roles: ['finance'], label: 'Finance' },
  { email: 'operator@alleima.example', roles: ['operator'], label: 'Shop-floor Operator' },
];

export default function SignIn() {
  const router = useRouter();
  const { setSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function demoLogin(email: string, roles: Role[]): void {
    setSession({ uid: `demo-${email}`, email, roles, plantIds: ['mehsana'], plantId: 'mehsana' });
    router.replace('/(app)/overview' as never);
  }

  async function onSubmit(email: string, password: string): Promise<void> {
    setLoading(true);
    setServerError(null);
    try {
      const demo = DEMO_ACCOUNTS.find((d) => d.email === email.trim().toLowerCase());
      if (demo && password === DEMO_PASSWORD) {
        demoLogin(demo.email, demo.roles);
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      // Router redirect to /(app)/overview happens after auth-state listener.
    } catch {
      setServerError('Sign-in failed. Use a demo account below, or contact your administrator.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.brand}>Alleima Cost Intelligence</Text>
      <Text style={styles.tag}>Mehsana · Cost Accounting & Manufacturing Intelligence</Text>
      <SignInForm onSubmit={onSubmit} loading={loading} />
      {serverError ? <Text style={styles.err}>{serverError}</Text> : null}
      <View style={styles.demo}>
        <Text style={styles.demoH}>Demo accounts (password: {DEMO_PASSWORD})</Text>
        {DEMO_ACCOUNTS.map((d) => (
          <Pressable key={d.email} style={styles.demoBtn} onPress={() => demoLogin(d.email, d.roles)}>
            <Text style={styles.demoT}>
              {d.label} — {d.email}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  brand: { fontSize: 24, fontWeight: '800', color: tokens.color.primary, marginBottom: 4 },
  tag: { color: tokens.color.text2, marginBottom: 20, fontSize: 13 },
  err: { color: tokens.color.error, marginTop: 12 },
  demo: { width: '100%', maxWidth: 420, marginTop: 16, backgroundColor: tokens.color.card, borderRadius: 16, borderWidth: 1, borderColor: tokens.color.border, padding: 16 },
  demoH: { fontSize: 12, fontWeight: '700', color: tokens.color.text2, marginBottom: 8 },
  demoBtn: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F1F4F9' },
  demoT: { color: tokens.color.primary, fontWeight: '700', fontSize: 13 },
});
