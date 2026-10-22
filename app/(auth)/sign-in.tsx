import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/firebase/config';
import { SignInForm } from '../../src/components/SignInForm';
import { useSession } from '../../src/store/session';
import type { Role } from '../../src/lib/permissions';
import { Icon, type IconName } from '../../src/components/Icon';
import { BrandMark, Callout } from '../../src/components/ui';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

/**
 * DEMO accounts for testing without Firebase keys (local mock only).
 * Production uses Firebase Auth + custom claims; remove demo bypass before release.
 */
const DEMO_PASSWORD = 'Demo1234!';
const DEMO_ACCOUNTS: { email: string; roles: Role[]; label: string; blurb: string; icon: IconName }[] = [
  { email: 'demo@alleima.example', roles: ['management'], label: 'Management', blurb: 'Plant-wide view', icon: 'briefcase' },
  { email: 'costing@alleima.example', roles: ['costing'], label: 'Costing Manager', blurb: 'Runs & variances', icon: 'calculator' },
  { email: 'finance@alleima.example', roles: ['finance'], label: 'Finance', blurb: 'Reconciliation & close', icon: 'landmark' },
  { email: 'operator@alleima.example', roles: ['operator'], label: 'Shop-floor Operator', blurb: 'Confirmations', icon: 'hardHat' },
];

const VALUE_PROPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'shieldCheck', title: 'Source-to-ledger traceability', text: 'Every cost line links back to its work order and dispatch record.' },
  { icon: 'barChart', title: 'Variance that explains itself', text: 'Price, usage, yield and conversion movements in plain language.' },
  { icon: 'users', title: 'Role-based control', text: 'Operators confirm, costing reviews, finance reconciles — all audited.' },
];

export default function SignIn() {
  const router = useRouter();
  const { setSession } = useSession();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const split = width >= 980;

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
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.frame, split && { flexDirection: 'row' }]}>
        {split ? (
          <LinearGradient colors={['#0B1F3A', '#0A1B33', '#0C2B4A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.glowA} />
            <View style={styles.glowB} />
            <BrandMark size={40} />
            <View style={{ flex: 1, justifyContent: 'center', gap: 10, paddingVertical: 34 }}>
              <View style={styles.badge}>
                <Icon name="sparkles" size={12} color="#93C5FD" />
                <Text style={styles.badgeT}>MANUFACTURING COST INTELLIGENCE</Text>
              </View>
              <Text style={styles.heroTitle}>Every tonne.{'\n'}Every cost. Explained.</Text>
              <Text style={styles.heroSub}>
                Alleima Mehsana&apos;s cost accounting workspace — from melt to dispatch, reconciled and audit-ready.
              </Text>
            </View>
            <View style={{ gap: 14 }}>
              {VALUE_PROPS.map((v) => (
                <View key={v.title} style={styles.prop}>
                  <View style={styles.propIcon}>
                    <Icon name={v.icon} size={16} color="#93C5FD" strokeWidth={1.9} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.propT}>{v.title}</Text>
                    <Text style={styles.propS}>{v.text}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.heroFoot}>
              <View style={styles.liveDot} />
              <Text style={styles.heroFootT}>Illustrative SAMPLE environment · no production data</Text>
            </View>
          </LinearGradient>
        ) : null}

        <View style={styles.panel}>
          {!split ? (
            <View style={styles.mobileBrand}>
              <BrandMark size={34} showWordmark={false} />
              <View>
                <Text style={styles.mobileT}>Alleima</Text>
                <Text style={styles.mobileS}>COST INTELLIGENCE</Text>
              </View>
            </View>
          ) : null}

          <SignInForm onSubmit={onSubmit} loading={loading} />
          {serverError ? (
            <View style={{ width: '100%', maxWidth: 420, marginTop: 12 }}>
              <Callout tone="error" title="Could not sign in">{serverError}</Callout>
            </View>
          ) : null}

          <View style={styles.demo}>
            <View style={styles.demoHead}>
              <View style={styles.demoIcon}>
                <Icon name="userCheck" size={15} color={palette.tint} strokeWidth={1.9} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoH}>Explore a role</Text>
                <Text style={styles.demoS}>One click, no password · demo accounts use {DEMO_PASSWORD}</Text>
              </View>
            </View>
            <View style={styles.demoGrid}>
              {DEMO_ACCOUNTS.map((d) => (
                <Pressable
                  key={d.email}
                  style={({ pressed }) => [styles.demoBtn, pressed && { borderColor: palette.tint, backgroundColor: palette.tintSoft }]}
                  onPress={() => demoLogin(d.email, d.roles)}
                  accessibilityRole="button"
                  accessibilityLabel={`Sign in as ${d.label}`}
                >
                  <View style={styles.demoBtnIcon}>
                    <Icon name={d.icon} size={16} color={palette.tint} strokeWidth={1.9} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.demoLabel}>{d.label}</Text>
                    <Text style={styles.demoBlurb} numberOfLines={1}>{d.blurb}</Text>
                  </View>
                  <Icon name="arrowRight" size={14} color={palette.text3} />
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.legal}>Invite-only workspace · By signing in you accept the demo terms of use.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 22 },
  frame: {
    width: '100%',
    maxWidth: 1120,
    backgroundColor: palette.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    shadowColor: '#0A1B33',
    shadowOpacity: 0.12,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  } as never,
  hero: { width: '48%', padding: 38, overflow: 'hidden', justifyContent: 'space-between', minHeight: 620 },
  glowA: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(37,99,235,0.22)', top: -90, right: -100 },
  glowB: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(13,148,136,0.18)', bottom: -80, left: -70 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(147,197,253,0.12)', borderWidth: 1, borderColor: 'rgba(147,197,253,0.25)', marginBottom: 4 },
  badgeT: { fontSize: 9.5, fontWeight: '800', color: '#BFDBFE', letterSpacing: 0.9, fontFamily: fontStack },
  heroTitle: { fontSize: 40, lineHeight: 46, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1.4, fontFamily: fontStack },
  heroSub: { fontSize: 14.5, lineHeight: 22, color: '#B9C7DA', maxWidth: 360, marginTop: 4, fontFamily: fontStack },
  prop: { flexDirection: 'row', gap: 11, alignItems: 'flex-start' },
  propIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  propT: { fontSize: 13.5, fontWeight: '700', color: '#E7EEF8', fontFamily: fontStack },
  propS: { fontSize: 12, lineHeight: 17, color: '#93A6BE', marginTop: 2, fontFamily: fontStack },
  heroFoot: { flexDirection: 'row', alignItems: 'center', gap: 7, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.10)', paddingTop: 16, marginTop: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' },
  heroFootT: { fontSize: 11, color: '#8496AD', fontFamily: fontStack },

  panel: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 34, gap: 0, backgroundColor: palette.card },
  mobileBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', marginBottom: 20 },
  mobileT: { fontSize: 17, fontWeight: '800', color: palette.text, letterSpacing: -0.3, fontFamily: fontStack },
  mobileS: { fontSize: 9.5, fontWeight: '700', color: palette.text3, letterSpacing: 1.1, fontFamily: fontStack },

  demo: { width: '100%', maxWidth: 420, marginTop: 22, borderTopWidth: 1, borderTopColor: palette.separator, paddingTop: 18 },
  demoHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  demoIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  demoH: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  demoS: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  demoBtn: { width: '48.5%', minWidth: 160, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.card, cursor: 'pointer' } as never,
  demoBtnIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: palette.bgAlt, alignItems: 'center', justifyContent: 'center' },
  demoLabel: { ...type.caption1, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  demoBlurb: { ...type.caption2, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  legal: { ...type.caption2, color: palette.text3, textAlign: 'center', marginTop: 18, fontFamily: fontStack } as never,
});
