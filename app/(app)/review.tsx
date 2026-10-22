import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { StatusChip } from '../../src/components/StatusChip';
import { DemoBanner } from '../../src/components/DemoBanner';
import { useSession } from '../../src/store/session';
import { modules } from '../../src/config/modules';
import type { Role } from '../../src/lib/permissions';
import { tokens } from '../../src/theme/tokens';

const FLOWS: { title: string; desc: string; route: string }[] = [
  { title: 'Management overview', desc: 'Dashboard → variance → cost centre → exception → export', route: '/(app)/overview' },
  { title: 'Work-order lifecycle', desc: 'Planning → release → operate → QA → FG receipt', route: '/(app)/planning' },
  { title: 'Material traceability', desc: 'Heat search → movements → WO → traveller → FG', route: '/(app)/inventory' },
  { title: 'Costing calculation review', desc: 'Scope → completeness → calculate → trace → approve', route: '/(app)/costing' },
  { title: 'Finance reconciliation + close', desc: 'Match → discrepancy → adjustment → lock', route: '/(app)/finance' },
  { title: 'Master-data import', desc: 'Template → validate → fix → commit', route: '/(app)/imports' },
  { title: 'Shop-floor mobile workflow', desc: 'Assigned work → scan → record → confirm', route: '/(app)/work-orders' },
  { title: 'Approval workflow', desc: 'Submit → reject with reason → resubmit → approve', route: '/(app)/approvals' },
];

const DEMO_ROLES: Role[] = ['management', 'costing', 'finance', 'operator', 'auditor'];
const DECISIONS = ['D-01 roles/maker-checker', 'D-03 127 CCs + PCs', 'D-10 costing formulas', 'D-13 close sequence', 'D-16 ERP live vs import'];
const CATS: string[] = ['Missing feature', 'Incorrect flow', 'UI/UX', 'Permission', 'Calculation', 'Report', 'Integration', 'Policy decision'];

/**
 * Milestone 1 — Client Review landing: purpose, roles, modules, journeys,
 * limitations, decisions, progress checklist and local demo feedback.
 */
export default function Review() {
  const router = useRouter();
  const { roles, setSession } = useSession();
  const [done, setDone] = useState<string[]>([]);
  const [cat, setCat] = useState<string>('Missing feature');
  const [comment, setComment] = useState('');
  const [items, setItems] = useState<{ cat: string; comment: string }[]>([]);
  const [error, setError] = useState('');

  function toggleFlow(t: string): void {
    setDone((d) => (d.includes(t) ? d.filter((x) => x !== t) : [...d, t]));
  }
  function submit(): void {
    if (!comment.trim()) { setError('Comment is required.'); return; }
    setItems((i) => [...i, { cat, comment: comment.trim() }]);
    setComment(''); setError('');
  }

  return (
    <AppShell roles={roles}>
      <PageHeader title="Client Review Mode — v0.1.0 demo" sub="Purpose: validate proposed software against actual business expectations before Firebase production build." />
      <DemoBanner />
      <Text style={styles.h}>Demo roles (tap to switch — demo only)</Text>
      <View style={styles.grid}>
        {DEMO_ROLES.map((r) => (
          <Pressable key={r} onPress={() => setSession({ roles: [r] })} style={[styles.chip, roles.includes(r) && styles.on]}>
            <Text style={[styles.chipT, roles.includes(r) && styles.onT]}>{r}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.h}>Business modules ({modules.length})</Text>
      <View style={styles.grid}>
        {modules.map((m) => (
          <Pressable key={m.id} onPress={() => router.push(m.route as never)} style={styles.mod}>
            <Text style={styles.modT}>{m.title}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.h}>Guided journeys + review progress ({done.length}/{FLOWS.length})</Text>
      {FLOWS.map((f) => (
        <View key={f.title} style={styles.card}>
          <Pressable onPress={() => router.push(f.route as never)}>
            <Text style={styles.t}>{f.title}</Text>
            <Text style={styles.d}>{f.desc}</Text>
          </Pressable>
          <Pressable onPress={() => toggleFlow(f.title)} style={[styles.check, done.includes(f.title) && styles.checked]}>
            <Text style={styles.checkT}>{done.includes(f.title) ? '✓ Reviewed' : 'Mark reviewed'}</Text>
          </Pressable>
        </View>
      ))}
      <Text style={styles.h}>Prototype limitations</Text>
      <Text style={styles.d}>Simulated ledger/approvals/imports/integrations; demo scanner fallback; CSV export only; no live ERP or production writes.</Text>
      <Text style={styles.h}>Outstanding decisions (see docs/PHASE_2_CLIENT_DECISIONS.md)</Text>
      <View style={styles.grid}>
        {DECISIONS.map((d) => <StatusChip key={d} label={d} tone="warn" />)}
      </View>
      <Text style={styles.h}>Feedback panel (local demo persistence)</Text>
      <View style={styles.grid}>
        {CATS.map((c) => (
          <Pressable key={c} onPress={() => setCat(c)} style={[styles.chip, cat === c && styles.on]}>
            <Text style={[styles.chipT, cat === c && styles.onT]}>{c}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput value={comment} onChangeText={setComment} placeholder="Expected behaviour…" style={styles.input} multiline />
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <Pressable onPress={submit} style={styles.primary}>
        <Text style={styles.primaryT}>Save feedback locally</Text>
      </Pressable>
      {items.map((i, n) => (
        <View key={n} style={styles.card}>
          <StatusChip label={i.cat} tone="info" />
          <Text style={styles.d}>{i.comment}</Text>
        </View>
      ))}
      <Text style={styles.d}>Summary: {items.length} item(s), {done.length}/{FLOWS.length} journeys reviewed — export via Reports CSV in Milestone 2.</Text>
    </AppShell>
  );
}
const styles = StyleSheet.create({
  h: { fontSize: 14, fontWeight: '700', color: tokens.color.text, marginVertical: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: tokens.color.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  on: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  chipT: { fontSize: 12, fontWeight: '700', color: tokens.color.text2 },
  onT: { color: '#fff' },
  mod: { backgroundColor: tokens.color.card, borderWidth: 1, borderColor: tokens.color.border, borderRadius: 10, padding: 10 },
  modT: { fontSize: 12, fontWeight: '600', color: tokens.color.text },
  card: { backgroundColor: tokens.color.card, borderWidth: 1, borderColor: tokens.color.border, borderRadius: 12, padding: 12, marginBottom: 8, gap: 6 },
  t: { fontSize: 13, fontWeight: '700', color: tokens.color.text },
  d: { fontSize: 12, color: tokens.color.text2, marginTop: 2 },
  check: { borderWidth: 1, borderColor: tokens.color.border, borderRadius: 8, padding: 8, alignItems: 'center' },
  checked: { backgroundColor: '#E7F6EC', borderColor: tokens.color.success },
  checkT: { fontSize: 12, fontWeight: '700', color: tokens.color.text2 },
  input: { borderWidth: 1, borderColor: tokens.color.border, borderRadius: tokens.radius.input, padding: 10, backgroundColor: '#fff', minHeight: 64, marginTop: 8 },
  err: { color: tokens.color.error, fontSize: 12, marginTop: 4 },
  primary: { backgroundColor: tokens.color.primary, borderRadius: tokens.radius.button, padding: 12, alignItems: 'center', marginTop: 8, marginBottom: 8 },
  primaryT: { color: '#fff', fontWeight: '700' },
});
