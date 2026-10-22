import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { tokens } from '../../src/theme/tokens';

export default function VerifyEmail() {
  return (
    <View style={styles.root}>
      <Text style={styles.t}>Verify your email</Text>
      <Text style={styles.b}>We sent a verification link. Open it, then return here to continue. Contact admin if you did not receive an invite.</Text>
      <Link href="/(auth)/sign-in" style={styles.link}>
        Back to sign in
      </Link>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  t: { fontSize: 20, fontWeight: '800', color: tokens.color.text },
  b: { color: tokens.color.text2, marginTop: 8, textAlign: 'center' },
  link: { color: tokens.color.primary, marginTop: 16, fontWeight: '700' },
});
