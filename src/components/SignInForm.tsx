import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from './Icon';
import { Button } from './ui';
import { fontStack, palette, radius, type } from '../theme/tokens';

export function SignInForm({ onSubmit, loading }: { onSubmit: (email: string, password: string) => Promise<void>; loading: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<'email' | 'password' | null>(null);

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
      <View style={[styles.field, focus === 'email' && styles.fieldFocus]}>
        <Icon name="mail" size={16} color={focus === 'email' ? palette.tint : palette.text3} />
        <TextInput
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocus('email')}
          onBlur={() => setFocus(null)}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="name@company.com"
          placeholderTextColor={palette.text3 as never}
          style={styles.input}
          accessibilityLabel="Work email"
        />
      </View>

      <Text style={styles.label}>Password</Text>
      <View style={[styles.field, focus === 'password' && styles.fieldFocus]}>
        <Icon name="lock" size={16} color={focus === 'password' ? palette.tint : palette.text3} />
        <TextInput
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocus('password')}
          onBlur={() => setFocus(null)}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor={palette.text3 as never}
          onSubmitEditing={() => void handle()}
          style={styles.input}
          accessibilityLabel="Password"
        />
        <Pressable onPress={() => setShow((s) => !s)} accessibilityRole="button" accessibilityLabel={show ? 'Hide password' : 'Show password'} hitSlop={8}>
          <Icon name={show ? 'eyeOff' : 'eye'} size={16} color={palette.text3} />
        </Pressable>
      </View>

      {error ? (
        <View style={styles.err} accessibilityRole="alert">
          <Icon name="alertCircle" size={14} color={palette.error} />
          <Text style={styles.errT}>{error}</Text>
        </View>
      ) : null}

      <Button label={loading ? 'Signing in…' : 'Sign in'} onPress={() => void handle()} loading={loading} size="lg" style={{ marginTop: 18 }} />
      <View style={styles.secure}>
        <Icon name="shieldCheck" size={13} color={palette.text3} />
        <Text style={styles.secureT}>Encrypted session · Role-based access · Audit logged</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.card, borderRadius: radius.sheet, padding: 26, borderWidth: 1, borderColor: palette.border, width: '100%', maxWidth: 420, shadowColor: palette.sidebar, shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } } as never,
  title: { ...type.title2, color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.footnote, color: palette.text2, marginTop: 6, marginBottom: 18, fontFamily: fontStack } as never,
  label: { ...type.footnote, fontWeight: '600', color: palette.text, marginTop: 12, marginBottom: 6, fontFamily: fontStack } as never,
  field: { flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: palette.borderStrong, borderRadius: radius.input, paddingHorizontal: 12, minHeight: 46, backgroundColor: palette.card },
  fieldFocus: { borderColor: palette.tint, shadowColor: palette.tint, shadowOpacity: 0.14, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } } as never,
  input: { flex: 1, fontSize: 14.5, color: palette.text, paddingVertical: 8, fontFamily: fontStack, outlineStyle: 'none' } as never,
  err: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 12, padding: 10, borderRadius: 9, backgroundColor: palette.errorSoft, borderWidth: 1, borderColor: palette.errorBorder },
  errT: { ...type.caption1, color: palette.error, fontWeight: '600', flex: 1, fontFamily: fontStack } as never,
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 16 },
  secureT: { ...type.caption2, color: palette.text3, fontFamily: fontStack } as never,
});
