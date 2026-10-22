import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { StatusChip } from '../../src/components/StatusChip';
import { FeatureHelp } from '../../src/components/FeatureHelp';
import { Button, Card, EmptyState } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { useSession } from '../../src/store/session';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

interface Ex { id: string; cat: string; sev: 'Critical' | 'High' | 'Medium' | 'Low'; record: string; owner: string; status: string; impact: string; next: string; }

const SEED: Ex[] = [
  { id: 'EXC-101', cat: 'Missing costing rate', sev: 'Critical', record: 'WO-2026-1041 / MHR pool', owner: 'Costing', status: 'Open', impact: 'Costing run blocked for CC-3210', next: 'Open Costing → resolve rate version, rerun preview' },
  { id: 'EXC-102', cat: 'Material shortage', sev: 'High', record: 'WO-2026-1042 / BAR-316L-80', owner: 'Stores', status: 'Open', impact: 'Work order cannot release', next: 'Open Inventory → check reservation, transfer or raise PO request' },
  { id: 'EXC-103', cat: 'Incomplete inspection', sev: 'High', record: 'HEAT-H7841 / EN 10204 3.1', owner: 'Quality', status: 'Assigned', impact: 'FG receipt on hold', next: 'Open Quality → complete checkpoint, attach cert' },
  { id: 'EXC-104', cat: 'Work order on hold', sev: 'Medium', record: 'WO-2026-1039', owner: 'Supervisor', status: 'On hold', impact: 'Downstream operation idle', next: 'Open Work Orders → review hold reason, resume or escalate' },
  { id: 'EXC-105', cat: 'Unexplained cost variance', sev: 'High', record: 'COST-202610 / Grade 316L', owner: 'Costing', status: 'Investigating', impact: 'Std vs actual +4.8% (SAMPLE)', next: 'Open Costing → variance tab, trace to material/labour source' },
  { id: 'EXC-106', cat: 'Unmatched reconciliation record', sev: 'Medium', record: 'SOPIC bridge / Invoice-0', owner: 'Finance', status: 'Open', impact: 'Period close checklist item blocked', next: 'Open Finance → investigate bridge row, assign owner' },
  { id: 'EXC-107', cat: 'Approval overdue (demo >48h)', sev: 'Medium', record: 'APR-2214 / Stock adjustment', owner: 'Finance', status: 'Escalated', impact: 'Adjustment awaiting checker', next: 'Open Approvals → approve / reject with reason' },
  { id: 'EXC-108', cat: 'Integration sync failure (demo)', sev: 'Low', record: 'INT-ERP / D+1 sync', owner: 'IT', status: 'Open', impact: 'Stale SOPIC snapshot', next: 'Open Integrations → inspect error, simulated retry' },
];

const SEV_TONE = { Critical: 'error', High: 'warn', Medium: 'info', Low: 'neutral' } as const;

export default function Exceptions() {
  const { roles } = useSession();
  const [items, setItems] = useState(SEED);
  const [filter, setFilter] = useState('All');
  const list = items.filter((e) => filter === 'All' || e.sev === filter || e.status === filter);
  const open = items.filter((i) => !i.status.startsWith('Resolved')).length;
  const resolve = (id: string) => setItems((p) => p.map((e) => (e.id === id ? { ...e, status: 'Resolved (demo)' } : e)));

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Operations"
        title="Exception centre"
        sub={`${open} open across production, quality, costing and finance. Every problem states what is affected, who owns it, and the next step.`}
      />
      <FeatureHelp purpose="Give every role one queue for blocked/incomplete work so nothing hides in disconnected reports." who="Supervisors, Stores, Quality, Costing, Finance, Management." inputs="Detection rules + record links (demo thresholds)." process="Detect → assign owner → guide to source → correct → re-validate → resolve with history." outputs="Resolved exception + audit history + unblocked downstream step." dependencies="Recorded work orders, inventory moves, costing inputs." controls="Only permitted roles resolve; corrections validated, never silent overwrites." exceptions="Missing/inconsistent data routes to the source record with a corrective action." benefit="Earlier visibility of blockers; clearer ownership; faster period close." measurement="Time to resolve; % exceptions resolved within demo SLA; unresolved count by severity. Baseline required." limitations="Severities and SLA thresholds are demo placeholders pending business confirmation." />

      <View style={styles.filters}>
        {['All', 'Critical', 'High', 'Open', 'Resolved (demo)'].map((f) => {
          const on = filter === f;
          return (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.pill, on && styles.on]} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`Filter ${f}`}>
              <Text style={[styles.pillT, on && { color: '#fff' }]}>{f}</Text>
            </Pressable>
          );
        })}
        <Text style={styles.count}>{list.length} shown</Text>
      </View>

      <View style={{ gap: 8 }}>
        {list.length === 0 ? <EmptyState icon="checkCircle" title="Nothing in this filter" description="Switch filters to see other exceptions." /> : null}
        {list.map((e) => {
          const resolved = e.status.startsWith('Resolved');
          return (
            <Card key={e.id} padded={false} style={resolved ? { opacity: 0.75 } : undefined}>
              <View style={styles.card}>
                <View style={styles.top}>
                  <View style={[styles.sevIcon, { backgroundColor: e.sev === 'Critical' ? palette.errorSoft : e.sev === 'High' ? palette.warningSoft : palette.tintSoft }]}>
                    <Icon name={e.sev === 'Critical' ? 'siren' : e.sev === 'High' ? 'triangleAlert' : 'info'} size={16} color={e.sev === 'Critical' ? palette.error : e.sev === 'High' ? palette.warning : palette.tint} strokeWidth={1.9} />
                  </View>
                  <View style={{ flex: 1, minWidth: 180 }}>
                    <Text style={styles.id}>{e.id} · {e.cat}</Text>
                    <Text style={styles.sub}>Record: {e.record}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    <StatusChip label={e.sev} tone={SEV_TONE[e.sev]} />
                    <StatusChip label={e.status} tone={resolved ? 'ok' : e.status === 'Open' ? 'warn' : 'info'} />
                  </View>
                </View>
                <View style={styles.grid}>
                  <Info k="Owner" v={e.owner} />
                  <Info k="Business impact" v={e.impact} />
                  <Info k="Next step" v={e.next} />
                </View>
                {!resolved ? (
                  <View style={styles.actions}>
                    <Button label="Mark resolved" size="sm" icon="check" variant="secondary" onPress={() => resolve(e.id)} />
                  </View>
                ) : (
                  <View style={styles.doneRow}>
                    <Icon name="checkCircle" size={14} color={palette.success} />
                    <Text style={styles.done}>Resolved — history preserved in this demo session.</Text>
                  </View>
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </AppShell>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoK}>{k.toUpperCase()}</Text>
      <Text style={styles.infoV}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 7, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' },
  pill: { borderWidth: 1, borderColor: palette.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: palette.card, cursor: 'pointer' } as never,
  on: { backgroundColor: palette.tint, borderColor: palette.tint },
  pillT: { fontSize: 12, fontWeight: '600', color: palette.text2, fontFamily: fontStack },
  count: { ...type.caption1, color: palette.text3, marginLeft: 'auto', fontFamily: fontStack } as never,
  card: { padding: 14, gap: 10 },
  top: { flexDirection: 'row', gap: 9, alignItems: 'center', flexWrap: 'wrap' },
  sevIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  id: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.caption1, color: palette.text3, marginTop: 1, fontFamily: fontStack } as never,
  grid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  info: { flex: 1, minWidth: 150, backgroundColor: palette.bgAlt, borderRadius: 8, padding: 9, gap: 2 },
  infoK: { ...type.caption2, color: palette.text3, fontFamily: fontStack } as never,
  infoV: { ...type.caption1, color: palette.text, fontFamily: fontStack } as never,
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  done: { ...type.caption1, color: palette.success, fontWeight: '600', fontFamily: fontStack } as never,
});
