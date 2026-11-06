import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { StatusChip } from '../../src/components/StatusChip';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Icon, ModuleIcon } from '../../src/components/Icon';
import { Button, Callout, Card, ProgressRing, SectionHeader } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { modules } from '../../src/config/modules';
import type { Role } from '../../src/lib/permissions';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

const FLOWS: { title: string; desc: string; route: string; icon: 'layoutDashboard' | 'clipboard' | 'packageSearch' | 'calculator' | 'scale' | 'upload' | 'hardHat' | 'checkCheck' }[] = [
  { title: 'Management overview', desc: 'Dashboard → variance → cost centre → exception → export', route: '/(app)/overview', icon: 'layoutDashboard' },
  { title: 'Work-order lifecycle', desc: 'Planning → release → operate → QA → FG receipt', route: '/(app)/planning', icon: 'clipboard' },
  { title: 'Material traceability', desc: 'Heat search → movements → WO → traveller → FG', route: '/(app)/inventory', icon: 'packageSearch' },
  { title: 'Costing calculation review', desc: 'Scope → completeness → calculate → trace → approve', route: '/(app)/costing', icon: 'calculator' },
  { title: 'Finance reconciliation + close', desc: 'Match → discrepancy → adjustment → lock', route: '/(app)/finance', icon: 'scale' },
  { title: 'Master-data import', desc: 'Template → validate → fix → commit', route: '/(app)/imports', icon: 'upload' },
  { title: 'Shop-floor mobile workflow', desc: 'Assigned work → scan → record → confirm', route: '/(app)/work-orders', icon: 'hardHat' },
  { title: 'Approval workflow', desc: 'Submit → reject with reason → resubmit → approve', route: '/(app)/approvals', icon: 'checkCheck' },
];

const DEMO_ROLES: Role[] = ['management', 'costing', 'finance', 'operator', 'auditor'];

/**
 * Alleima-style "big number" stat band (Phase 5) — echoes the reference site's
 * figure storytelling. Values describe the review build itself, not production.
 */
const STATS: { value: string; label: string }[] = [
  { value: '17', label: 'Business modules in scope' },
  { value: '15', label: 'User roles modelled' },
  { value: '8', label: 'End-to-end journeys' },
  { value: '100%', label: 'Decimal-safe costing coverage' },
];
const DECISIONS = ['D-01 roles / maker-checker', 'D-03 127 CCs + PCs', 'D-10 costing formulas', 'D-13 close sequence', 'D-16 ERP live vs import'];
const CATS = ['Missing feature', 'Incorrect flow', 'UI/UX', 'Permission', 'Calculation', 'Report', 'Integration', 'Policy decision'];

/**
 * Milestone 1 — Client Review landing: purpose, roles, modules, journeys,
 * limitations, decisions, progress checklist and local demo feedback.
 */
export default function Review() {
  const router = useRouter();
  const { roles, setSession } = useSession();
  const { width } = useWindowDimensions();
  const [done, setDone] = useState<string[]>([]);
  const [cat, setCat] = useState<string>('Missing feature');
  const [comment, setComment] = useState('');
  const [items, setItems] = useState<{ cat: string; comment: string }[]>([]);
  const [error, setError] = useState('');
  const cols = width >= 1040 ? 3 : width >= 720 ? 2 : 1;
  const progress = Math.round((done.length / FLOWS.length) * 100);

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
      <PageHeader
        eyebrow="Client review"
        title="Milestone 1 walkthrough"
        sub="Validate the proposed software against actual business expectations before the Firebase production build."
        right={<StatusChip label="v0.1.0 demo" tone="info" />}
      />
      <DemoBanner />

      <View style={[styles.statBand, { flexDirection: cols === 1 ? 'column' : 'row' }]}>
        {STATS.map((s) => (
          <View key={s.label} style={[styles.stat, cols === 1 && { width: '100%' }]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Card style={styles.progressCard}>
        <View style={styles.progressLeft}>
          <ProgressRing value={progress} size={82} stroke={8} color={palette.tint}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.ringValue}>{done.length}</Text>
              <Text style={styles.ringOf}>of {FLOWS.length}</Text>
            </View>
          </ProgressRing>
          <View style={{ flex: 1, minWidth: 170 }}>
            <Text style={styles.progressTitle}>{done.length === FLOWS.length ? 'All journeys reviewed' : 'Walkthrough progress'}</Text>
            <Text style={styles.progressSub}>
              {done.length === 0 ? 'Open a journey, then mark it reviewed.' : `${progress}% of guided journeys marked reviewed in this session.`}
            </Text>
            <View style={styles.metaRow}>
              <StatusChip label={`${DEMO_ROLES.length} roles`} tone="neutral" />
              <StatusChip label={`${modules.length} modules`} tone="neutral" />
              <StatusChip label={`${items.length} feedback`} tone={items.length ? 'info' : 'neutral'} />
            </View>
          </View>
        </View>
      </Card>

      <SectionHeader title="Demo roles" description="Tap to switch perspective — demo only, no production auth." />
      <View style={styles.chipRow}>
        {DEMO_ROLES.map((r) => {
          const on = roles.includes(r);
          return (
            <Pressable
              key={r}
              onPress={() => setSession({ roles: [r] })}
              style={[styles.chip, on && styles.chipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Switch to ${r}`}
            >
              {on ? <Icon name="check" size={12} color="#fff" strokeWidth={3} /> : null}
              <Text style={[styles.chipT, on && { color: '#fff' }]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title={`Business modules (${modules.length})`} description="Every workspace included in this review build." style={{ marginTop: 24 }} />
      <View style={styles.modGrid}>
        {modules.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => router.push(m.route as never)}
            style={({ pressed }) => [styles.mod, { width: cols === 3 ? '32%' : cols === 2 ? '48.6%' : '100%' }, pressed && { borderColor: palette.tint, backgroundColor: palette.tintSoft }]}
            accessibilityRole="button"
            accessibilityLabel={`Open ${m.title}`}
          >
            <View style={styles.modIcon}>
              <ModuleIcon id={m.id} size={16} color={palette.tint} strokeWidth={1.9} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.modT} numberOfLines={1}>{m.title}</Text>
              <Text style={styles.modS} numberOfLines={1}>{m.group}</Text>
            </View>
            <Icon name="arrowUpRight" size={14} color={palette.text3} />
          </Pressable>
        ))}
      </View>

      <SectionHeader
        title="Guided journeys"
        description="Follow each flow end to end, then mark it reviewed."
        right={<Button label="Reset" variant="ghost" size="sm" icon="refresh" onPress={() => setDone([])} disabled={done.length === 0} />}
        style={{ marginTop: 26 }}
      />
      <View style={{ gap: 8 }}>
        {FLOWS.map((f) => {
          const isDone = done.includes(f.title);
          return (
            <Card key={f.title} padded={false} style={[styles.flow, isDone && { borderColor: palette.successBorder, backgroundColor: palette.successSoft }]}>
              <Pressable onPress={() => router.push(f.route as never)} style={styles.flowMain} accessibilityRole="button" accessibilityLabel={`Open ${f.title}`}>
                <View style={[styles.flowIcon, isDone && { backgroundColor: '#FFFFFF' }]}>
                  <Icon name={f.icon} size={16} color={isDone ? palette.success : palette.tint} strokeWidth={1.9} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.flowT}>{f.title}</Text>
                  <Text style={styles.flowS} numberOfLines={2}>{f.desc}</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => toggleFlow(f.title)}
                style={[styles.check, isDone && styles.checkOn]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isDone }}
                accessibilityLabel={`Mark ${f.title} reviewed`}
              >
                <Icon name={isDone ? 'check' : 'circle'} size={13} color={isDone ? '#fff' : palette.text3} strokeWidth={2.4} />
                <Text style={[styles.checkT, isDone && { color: '#fff' }]}>{isDone ? 'Reviewed' : 'Mark reviewed'}</Text>
              </Pressable>
            </Card>
          );
        })}
      </View>

      <Callout tone="warn" title="Prototype limitations" >
        Simulated ledger, approvals, imports and integrations · demo scanner fallback · CSV export only · no live ERP connection or production writes.
      </Callout>

      <SectionHeader title="Outstanding decisions" description="See docs/PHASE_2_CLIENT_DECISIONS.md for full context." style={{ marginTop: 24 }} />
      <View style={styles.chipRow}>
        {DECISIONS.map((d) => <StatusChip key={d} label={d} tone="warn" />)}
      </View>

      <SectionHeader title="Feedback" description="Saved locally for this demo session — nothing leaves the browser." style={{ marginTop: 26 }} />
      <Card style={{ gap: 10 }}>
        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.chipRow}>
          {CATS.map((c) => {
            const on = cat === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCat(c)}
                style={[styles.chip, on && styles.chipOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={c}
              >
                <Text style={[styles.chipT, on && { color: '#fff' }]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.label, { marginTop: 6 }]}>EXPECTED BEHAVIOUR</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="What did you expect to happen?"
          placeholderTextColor={palette.text3 as never}
          style={[styles.input, error ? { borderColor: palette.error } : null]}
          multiline
          accessibilityLabel="Feedback comment"
        />
        {error ? (
          <View style={styles.errRow} accessibilityRole="alert">
            <Icon name="alertCircle" size={13} color={palette.error} />
            <Text style={styles.err}>{error}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button label="Save feedback" icon="plus" onPress={submit} />
        </View>
      </Card>
      {items.map((i, n) => (
        <Card key={n} style={{ marginTop: 8, gap: 6 }} tone="muted">
          <StatusChip label={i.cat} tone="info" />
          <Text style={styles.feedbackT}>{i.comment}</Text>
        </Card>
      ))}
      <Text style={styles.summary}>
        {items.length} feedback item(s) · {done.length}/{FLOWS.length} journeys reviewed · export available in Milestone 2 reports.
      </Text>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  statBand: {
    gap: 1,
    backgroundColor: palette.border,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  stat: { flex: 1, backgroundColor: palette.card, paddingVertical: 20, paddingHorizontal: 18, minWidth: 140 },
  statValue: { fontSize: 32, fontWeight: '800', color: palette.text, fontFamily: fontStack, letterSpacing: -0.8 },
  statLabel: { ...type.footnote, color: palette.text2, marginTop: 4, fontFamily: fontStack } as never,
  progressCard: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, flexWrap: 'wrap' },
  ringValue: { fontSize: 22, fontWeight: '800', color: palette.text, fontFamily: fontStack },
  ringOf: { fontSize: 10, color: palette.text3, fontFamily: fontStack },
  progressTitle: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  progressSub: { ...type.footnote, color: palette.text2, marginTop: 2, fontFamily: fontStack } as never,
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: palette.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: palette.card, cursor: 'pointer' } as never,
  chipOn: { backgroundColor: palette.tint, borderColor: palette.tint },
  chipT: { fontSize: 12, fontWeight: '600', color: palette.text2, fontFamily: fontStack },
  modGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mod: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.card, minWidth: 220, cursor: 'pointer' } as never,
  modIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  modT: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  modS: { ...type.caption2, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  flow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, flexWrap: 'wrap' },
  flowMain: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 220, cursor: 'pointer' } as never,
  flowIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  flowT: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  flowS: { ...type.caption1, color: palette.text2, marginTop: 1, fontFamily: fontStack } as never,
  check: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: palette.border, borderRadius: radius.sm, paddingHorizontal: 10, minHeight: 32, backgroundColor: palette.card },
  checkOn: { backgroundColor: palette.success, borderColor: palette.success },
  checkT: { fontSize: 11.5, fontWeight: '700', color: palette.text2, fontFamily: fontStack },
  label: { ...type.caption2, color: palette.text3, fontFamily: fontStack } as never,
  input: { borderWidth: 1, borderColor: palette.borderStrong, borderRadius: radius.input, padding: 11, backgroundColor: palette.card, minHeight: 74, fontSize: 14, color: palette.text, fontFamily: fontStack, textAlignVertical: 'top', outlineStyle: 'none' } as never,
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  err: { ...type.caption1, color: palette.error, fontWeight: '600', fontFamily: fontStack } as never,
  feedbackT: { ...type.footnote, color: palette.text, fontFamily: fontStack } as never,
  summary: { ...type.caption1, color: palette.text3, marginTop: 14, fontFamily: fontStack } as never,
});
