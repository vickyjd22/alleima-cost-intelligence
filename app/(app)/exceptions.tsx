import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { StatusChip } from '../../src/components/StatusChip';
import { FeatureHelp } from '../../src/components/FeatureHelp';
import { useSession } from '../../src/store/session';

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

export default function Exceptions() {
  const { roles } = useSession();
  const [items, setItems] = useState(SEED);
  const [filter, setFilter] = useState('All');
  const list = items.filter((e) => filter === 'All' || e.sev === filter || e.status === filter);
  const resolve = (id: string) => setItems((p) => p.map((e) => (e.id === id ? { ...e, status: 'Resolved (demo)' } : e)));

  return (
    <AppShell roles={roles}>
      <PageHeader title="Exception Centre" sub="Exception-first operations: every problem explains what was detected, what is affected, who owns it and the next corrective step. Demo thresholds only — real tolerances need client approval." />
      <FeatureHelp purpose="Give every role one queue for blocked/incomplete work so nothing hides in disconnected reports." who="Supervisors, Stores, Quality, Costing, Finance, Management." inputs="Detection rules + record links (demo thresholds)." process="Detect → assign owner → guide to source → correct → re-validate → resolve with history." outputs="Resolved exception + audit history + unblocked downstream step." dependencies="Recorded work orders, inventory moves, costing inputs." controls="Only permitted roles resolve; corrections validated, never silent overwrites." exceptions="Missing/inconsistent data routes to the source record with a corrective action." benefit="Earlier visibility of blockers; clearer ownership; faster period close." measurement="Time to resolve; % exceptions resolved within demo SLA; unresolved count by severity. Baseline required." limitations="Severities and SLA thresholds are demo placeholders pending business confirmation." />
      <View style={styles.filters}>
        {['All', 'Critical', 'High', 'Open', 'Resolved (demo)'].map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.pill, filter === f && styles.on]}>
            <Text style={[styles.pillT, filter === f && styles.onT]}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView>
        {list.map((e) => (
          <View key={e.id} style={styles.card}>
            <View style={styles.top}>
              <Text style={styles.id}>{e.id} · {e.cat}</Text>
              <StatusChip label={e.sev} tone={e.sev === 'Critical' ? 'error' : e.sev === 'High' ? 'warn' : 'info'} />
            </View>
            <Text style={styles.sub}>Record: {e.record} · Owner: {e.owner} · Status: {e.status}</Text>
            <Text style={styles.sub}>Business impact: {e.impact}</Text>
            <Text style={styles.sub}>Recommended next step: {e.next}</Text>
            {e.status !== 'Resolved (demo)' ? (
              <Pressable onPress={() => resolve(e.id)} style={styles.btn} accessibilityRole="button">
                <Text style={styles.btnT}>Mark resolved (demo)</Text>
              </Pressable>
            ) : <Text style={styles.done}>✓ Resolved — history preserved in demo session.</Text>}
          </View>
        ))}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  pill: { borderWidth: 1, borderColor: '#DDE1FB', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff' },
  on: { backgroundColor: '#3B46C4', borderColor: '#3B46C4' },
  pillT: { fontSize: 12, fontWeight: '700', color: '#3B46C4' },
  onT: { color: '#fff' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E4E7F2', borderRadius: 12, padding: 12, marginBottom: 10 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  id: { fontSize: 14, fontWeight: '800', color: '#141A33' },
  sub: { fontSize: 12, color: '#4A5578', marginTop: 2 },
  btn: { marginTop: 8, backgroundColor: '#3B46C4', borderRadius: 8, padding: 10, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '800', fontSize: 13 },
  done: { marginTop: 8, fontSize: 12, color: '#1C7A3D', fontWeight: '700' },
});
