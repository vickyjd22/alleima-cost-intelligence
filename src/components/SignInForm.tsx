import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

export function SignInForm({ onSubmit, loading }: { onSubmit: (email: string, password: string) => Promise<void>; loading: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handle(): Promise<void> {
    setError(null);
    if (!email.includes('@')) {
      setError('Enter a valid work email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    await onSubmit(email.trim(), password);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.sub}>Invite-only workspace. Contact your administrator for access.</Text>
      <Text style={styles.label}>Work email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholder="name@company.com" />
      <Text style={styles.label}>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholder="••••••••" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={handle} disabled={loading} style={[styles.btn, loading && { opacity: 0.6 }]}>
        <Text style={styles.btnText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: tokens.color.card, borderRadius: tokens.radius.card, padding: 24, borderWidth: 1, borderColor: tokens.color.border, width: '100%', maxWidth: 420 },
  title: { fontSize: 22, fontWeight: '700', color: tokens.color.text },
  sub: { color: tokens.color.text2, marginTop: 6, marginBottom: 16, fontSize: 13 },
  label: { fontSize: 12, fontWeight: '600', color: tokens.color.text, marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: tokens.color.border, borderRadius: tokens.radius.input, padding: 12, fontSize: 15, backgroundColor: '#fff' },
  error: { color: tokens.color.error, marginTop: 10, fontSize: 13 },
  btn: { backgroundColor: tokens.color.primary, borderRadius: tokens.radius.button, padding: 14, marginTop: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
