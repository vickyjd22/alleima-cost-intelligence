import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { tokens } from '../../src/theme/tokens';

function Simple({ title, body, back = '/(auth)/sign-in' }: { title: string; body: string; back?: string }) {
  return (
    <View style={styles.root}>
      <Text style={styles.t}>{title}</Text>
      <Text style={styles.b}>{body}</Text>
      <Link href={back as never} style={styles.link}>
        Back to sign in
      </Link>
    </View>
  );
}

export function SplashScreen() {
  return <Simple title="Alleima Cost Intelligence" body="Loading secure workspace…" />;
}
export function OnboardingScreen() {
  return <Simple title="Welcome" body="Track material, production, cost and finance from one workspace. (Onboarding skippable.)" />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  t: { fontSize: 20, fontWeight: '800', color: tokens.color.primary },
  b: { color: tokens.color.text2, marginTop: 8, textAlign: 'center' },
  link: { color: tokens.color.primary, marginTop: 16, fontWeight: '700' },
});

export default SplashScreen;
