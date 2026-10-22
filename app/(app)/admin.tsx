import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { AuditPanel } from '../../src/components/Governance';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { FormField, PrimaryButton } from '../../src/components/FormField';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { ConfirmDialog } from '../../src/components/Feedback';
import { Button, Callout, Card, ProgressBar, SectionHeader } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { CLOSE_STEPS, closeProgress } from '../../src/lib/close';
import { audit, auditLog, resetAudit } from '../../src/lib/audit';
import { resetDemo } from '../../src/mocks/demo';
import { CAS_LIST, POLICY_FORM, MASTER_LINKS, ERP_CHECKS, PRIORITIES } from '../../src/mocks/manual';
import { useSession } from '../../src/store/session';
import { fontStack, palette, type } from '../../src/theme/tokens';

const USERS = [
  { id: 'demo@alleima.example', roles: 'management', plants: 'mehsana', state: 'active' },
  { id: 'costing@alleima.example', roles: 'costing', plants: 'mehsana', state: 'active' },
  { id: 'finance@alleima.example', roles: 'finance', plants: 'mehsana', state: 'active' },
  { id: 'operator@alleima.example', roles: 'operator', plants: 'mehsana', state: 'active' },
];

export default function Admin() {
  const { roles, plantId, period, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [locked, setLocked] = useState(false);
  const [askLock, setAskLock] = useState(false);
  const [policy, setPolicy] = useState(false);
  const [pReason, setPReason] = useState('');
  const [, bump] = useState(0);
  const pct = closeProgress({ 'D+1–D+2': 'done' });
  const canLock = roles.some((r) => r === 'finance' || r === 'clientAdmin' || r === 'platformAdmin');

  function toggleLock(): void {
    setLocked(!locked);
    audit(email ?? 'demo', locked ? 'period.reopen' : 'period.lock', `${period} (mock)`);
    toast.show(locked ? 'Period reopened (mock — Finance only in production).' : 'Period locked (mock — Functions enforce in production).');
    setAskLock(false);
    bump((x) => x + 1);
  }

  function submitPolicy(): void {
    if (!pReason.trim()) {
      toast.show('Reason for change is required (Annex E).');
      return;
    }
    audit(email ?? 'demo', 'policy.change', `${pReason} (mock — needs Costing+Finance+Management)`);
    toast.show('Policy change request submitted for triple approval (mock).');
    setPolicy(false);
    setPReason('');
    bump((x) => x + 1);
  }

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Governance"
        title="Administration & compliance"
        sub={`Plant ${plantId ?? '—'} · period ${period} · close ${pct}%. Policy and law: the law prevails over any internal policy.`}
      />
      {loading ? (
        <Skeleton lines={5} />
      ) : (
        <View style={{ gap: 22 }}>
          <Card style={{ gap: 12 }}>
            <View style={styles.periodHead}>
              <View style={[styles.periodIcon, { backgroundColor: locked ? palette.warningSoft : palette.successSoft }]}>
                <Icon name={locked ? 'lock' : 'calendarDays'} size={18} color={locked ? palette.warning : palette.success} strokeWidth={1.9} />
              </View>
              <View style={{ flex: 1, minWidth: 180 }}>
                <Text style={styles.periodTitle}>Period {period} — {locked ? 'locked' : 'open'}</Text>
                <Text style={styles.periodSub}>{CLOSE_STEPS.length} close steps tracked · close {pct}%</Text>
              </View>
              <StatusChip label={locked ? 'Locked' : 'Open'} tone={locked ? 'warn' : 'ok'} />
            </View>
            <ProgressBar value={Number(pct)} />
            <View style={styles.actions}>
              <Button
                label={locked ? 'Request reopen' : 'Lock period'}
                icon={locked ? 'key' : 'lock'}
                variant={locked ? 'secondary' : 'primary'}
                onPress={() => (canLock ? setAskLock(true) : toast.show('Only Finance/ClientAdmin can lock periods.'))}
              />
              <Button label="Policy change request" icon="fileText" variant="secondary" onPress={() => setPolicy(true)} />
              <Button
                label="Reset demo data"
                icon="refresh"
                variant="ghost"
                onPress={() => { resetDemo(); resetAudit(); audit('demo', 'seed.reset', 'SAMPLE dataset restored'); bump((x) => x + 1); toast.show('Demo data + audit reset.'); }}
              />
            </View>
            {!canLock ? <Text style={styles.hint}>Your current demo roles cannot lock periods. Switch to Finance or Client Admin in Profile to test it.</Text> : null}
          </Card>

          <View>
            <SectionHeader title="Users" description="Invite-only workspace — no self-registration." />
            <DataTable
              columns={[
                { key: 'id', header: 'Email', width: 250, render: (r) => <Text>{r.id}</Text> },
                { key: 'r', header: 'Roles', width: 160, render: (r) => <Text>{r.roles}</Text> },
                { key: 'p', header: 'Plants', render: (r) => <Text>{r.plants}</Text> },
                { key: 's', header: 'State', render: () => <StatusChip label="active" tone="ok" /> },
              ]}
              rows={USERS}
            />
          </View>

          <View>
            <SectionHeader title="Regulatory framework" description="§2 — the law prevails over policy. Applicable cost accounting standards." />
            <DataTable columns={[{ key: 'c', header: 'Standard', width: 200, render: (r) => <Text>{r.code}</Text> }, { key: 'n', header: 'Application', width: 420, render: (r) => <Text>{r.name}</Text> }]} rows={CAS_LIST.map(([code, name], i) => ({ id: `cas${i}`, code, name }))} />
          </View>

          <View>
            <SectionHeader title="Master-data relationships" description="§24.1 — every master must link to the records it drives." />
            <DataTable columns={[{ key: 'm', header: 'Master', width: 170, render: (r) => <Text>{r.master}</Text> }, { key: 'l', header: 'Must link to', width: 430, render: (r) => <Text>{r.link}</Text> }]} rows={MASTER_LINKS.map(([master, link], i) => ({ id: `ml${i}`, master, link }))} />
            <View style={{ marginTop: 12, gap: 8 }}>
              <Callout tone="info" title="ERP checks (§24.2)" compact>
                <View style={{ gap: 4 }}>
                  {ERP_CHECKS.map((c) => (
                    <Text key={c} style={styles.bullet}>• {c}</Text>
                  ))}
                </View>
              </Callout>
              <Text style={styles.hint}>Triangle (§24.3): financial ledger ↔ cost centres ↔ production / inventory / sales — proven every close.</Text>
            </View>
          </View>

          <View>
            <SectionHeader title="Immediate priorities" description="§25 — next actions agreed for the build." />
            <Card padded={false}>
              {PRIORITIES.map((p, i) => (
                <View key={p} style={[styles.prioRow, i < PRIORITIES.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.separator }]}>
                  <View style={styles.prioNum}>
                    <Text style={styles.prioNumT}>{i + 1}</Text>
                  </View>
                  <Text style={styles.prioT}>{p}</Text>
                </View>
              ))}
            </Card>
          </View>

          <AuditPanel entries={auditLog().map((a) => ({ at: a.at, actor: a.actor, action: a.action, detail: a.detail }))} />
        </View>
      )}

      <ConfirmDialog visible={askLock} title={locked ? 'Reopen period?' : 'Lock period?'} message="Period locks are enforced by Functions in production. This records the intent locally for review." confirmLabel={locked ? 'Reopen (mock)' : 'Lock (mock)'} onConfirm={toggleLock} onCancel={() => setAskLock(false)} />
      <DetailDrawer visible={policy} title="Cost policy change request (Annex E)" onClose={() => setPolicy(false)}>
        {POLICY_FORM.slice(0, 6).map((f) => <KeyVal key={f} k={f} v="—" />)}
        <FormField label="Reason for change (required)" value={pReason} onChange={setPReason} placeholder="e.g. CAS-2 Rev 2024 capacity update" />
        <PrimaryButton label="Submit for triple approval (mock)" onPress={submitPolicy} />
      </DetailDrawer>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  periodHead: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  periodIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  periodTitle: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  periodSub: { ...type.caption1, color: palette.text3, marginTop: 1, fontFamily: fontStack } as never,
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  hint: { ...type.caption1, color: palette.text3, fontFamily: fontStack } as never,
  bullet: { ...type.caption1, color: palette.text2, fontFamily: fontStack, lineHeight: 18 } as never,
  prioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  prioNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  prioNumT: { fontSize: 10.5, fontWeight: '800', color: palette.tint, fontFamily: fontStack },
  prioT: { ...type.footnote, color: palette.text, flex: 1, fontFamily: fontStack } as never,
});
