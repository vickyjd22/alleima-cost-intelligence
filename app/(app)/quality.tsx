import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { CostBreakdownPanel } from '../../src/components/CostingPanels';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { useSession } from '../../src/store/session';
import { audit } from '../../src/lib/audit';
import { demoDb, type Inspection } from '../../src/mocks/demo';
import { COQ } from '../../src/mocks/manual';
import { tokens } from '../../src/theme/tokens';

const DEFECTS = [
  { id: 'ECT-LINE', code: 'ECT-LINE', process: 'ECT & Marking 820410335', action: 'rework → retest' },
  { id: 'DIM-OD', code: 'DIM-OD', process: 'Pilgering 820410309', action: 'reject → scrap credit' },
  { id: 'SURFACE', code: 'SURFACE', process: 'Pickling 820410307', action: 'rework → repickle' },
];

export default function Quality() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [sel, setSel] = useState<Inspection | null>(null);

  function hold(id: string): void {
    audit(email ?? 'demo', 'qc.hold', `${id} (mock)`);
    toast.show('QC hold placed — mapped to originating process for rework cost (mock).');
  }

  return (
    <AppShell roles={roles}>
      <PageHeader title="Quality & Cost of Quality (§12, CAS-21)" sub="Prevention + Appraisal + Internal + External failure — abnormal portions never embedded" />
      {loading ? (
        <Skeleton lines={5} />
      ) : (
        <View>
          <CostBreakdownPanel lines={[
            { label: 'Prevention (SAMPLE)', value: '₹84,000 — planning, qualification, training' },
            { label: 'Appraisal (SAMPLE)', value: '₹312,000 — 100% ECT + hydro, lab, DPT, TPI' },
            { label: 'Internal failure (SAMPLE)', value: '₹96,500 — rework, sorting, retest' },
            { label: 'External failure (SAMPLE)', value: '₹12,000 — claims handling' },
          ]} />
          <Text style={styles.h}>Certification tracker (customer-specific cost drivers, §12)</Text>
          <DataTable columns={[{ key: 'o', header: 'Order', render: (r) => <Text>{r.o}</Text> }, { key: 't', header: 'Testing', width: 200, render: (r) => <Text>{r.t}</Text> }, { key: 'c', header: 'Certification', width: 200, render: (r) => <Text>{r.c}</Text> }, { key: 's', header: '', render: (r) => <StatusChip label={r.s} tone={r.s === 'tagged' ? 'info' : 'warn'} /> }]} rows={[{ id: 'SO-1042', o: 'SO-1042', t: '100% ECT + hydro', c: 'EN 10204/3.2', s: 'tagged' }, { id: 'SO-1043', o: 'SO-1043', t: 'Hydro only', c: 'EN 10204/3.1', s: 'tagged' }, { id: 'SO-1044', o: 'SO-1044', t: 'Customer-scope TPI', c: '3.2 + TPI', s: 'pending cert' }]} />
          <Text style={styles.h}>Inspections — rework stays visible against originating process/defect</Text>
          <DataTable
            columns={[
              { key: 'id', header: 'Inspection', render: (r) => <Text>{r.id}</Text> },
              { key: 't', header: 'Traveller', render: (r) => <Text>{r.traveller}</Text> },
              { key: 'c', header: 'Defect', render: (r) => <Text>{r.code}</Text> },
              { key: 'q', header: 'Qty', render: (r) => <Text>{String(r.qty)}</Text> },
              { key: 'd', header: 'Disposition', render: (r) => <StatusChip label={r.disp} tone={r.disp === 'reject' ? 'error' : 'warn'} /> },
              { key: 'a', header: '', render: (r) => <Pressable onPress={() => setSel(r)}><Text style={styles.link}>Open</Text></Pressable> },
            ]}
            rows={demoDb.inspections}
          />
          <Text style={styles.h}>Defect → originating process → recovery (§12.3)</Text>
          <DataTable
            columns={[
              { key: 'c', header: 'Code', render: (r) => <Text>{r.code}</Text> },
              { key: 'p', header: 'Originating process', width: 240, render: (r) => <Text>{r.process}</Text> },
              { key: 'a', header: 'Action + recovery', width: 220, render: (r) => <Text>{r.action}</Text> },
            ]}
            rows={DEFECTS}
          />
          <Text style={styles.note}>CoQ classes (§12.1): {COQ.map((c) => c[0]).join(' · ')}. Customer-mandated special testing is tagged to order profitability (§19.2 Quality dimension).</Text>
        </View>
      )}
      <DetailDrawer visible={sel !== null} title={sel?.id ?? ''} onClose={() => setSel(null)}>
        <KeyVal k="Traveller" v={sel?.traveller ?? ''} />
        <KeyVal k="Defect" v={sel?.code ?? ''} />
        <KeyVal k="Qty" v={String(sel?.qty ?? '')} />
        <KeyVal k="Disposition" v={sel?.disp ?? ''} />
        <KeyVal k="Cost trail" v="originating process → defect → qty → cost → recovery → root cause (§12.3)" />
        <Pressable style={styles.btn} onPress={() => { if (sel) hold(sel.id); setSel(null); }}>
          <Text style={styles.btnT}>Place QC hold (mock)</Text>
        </Pressable>
      </DetailDrawer>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  h: { fontWeight: '700', color: tokens.color.text, marginTop: 16, marginBottom: 8 },
  link: { color: tokens.color.primary, fontWeight: '700' },
  note: { color: tokens.color.text2, fontSize: 12, marginTop: 8 },
  btn: { backgroundColor: tokens.color.primary, borderRadius: 10, padding: 12, marginTop: 12, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '700' },
});
