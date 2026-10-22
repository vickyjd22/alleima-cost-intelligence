import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { StatusChip } from '../../src/components/StatusChip';
import { DataTable } from '../../src/components/DataTable';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { useSession } from '../../src/store/session';
import { previewCostCentres } from '../../src/lib/imports';
import { audit, auditLog } from '../../src/lib/audit';
import { tokens } from '../../src/theme/tokens';

const TEMPLATES = [
  { id: 'cc', name: 'Cost centres (127)', text: 'code,description,department,type,driver\n820410300,Circular Saw,Hot Flow,production,machine-hrs' },
  { id: 'pc', name: 'Profit centres', text: 'code,entity,desc\n513,8911,PC 513\n514,8911,PC 514' },
  { id: 'heats', name: 'Heats / opening stock', text: 'heat,material,kg,loc\nH-771,Billet 304,5200,RM-YARD-A' },
  { id: 'sopic', name: 'SOPIC sales', text: 'invoiceNo,date,customer,order,value,pc\nINV-1001,2026-10-05,C-01,SO-1042,980000,514' },
];

export default function Imports() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [sel, setSel] = useState(TEMPLATES[0]!);
  const [result, setResult] = useState<string | null>(null);
  const [committed, setCommitted] = useState<string[]>([]);

  function download(): void {
    const blob = new Blob([sel.text], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sel.id}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function runPreview(): void {
    const bad = `${sel.text}\nBAD-1,Bad Row,Hot Flow,production,machine-hrs\n820410300,Duplicate,Hot Flow,production,machine-hrs`;
    const p = previewCostCentres(sel.id === 'cc' ? bad : sel.text);
    setResult(`rows ${p.rows.length} · errors ${p.errors.length} (${p.errors.map((e) => `r${e.row}: ${e.message}`).join('; ') || 'none'}) · duplicates at rows ${p.duplicates.join(',') || 'none'}`);
  }

  function commit(): void {
    audit(email ?? 'demo', 'import.commit', `${sel.id} (mock)`);
    setCommitted([...committed, `${sel.id} — ${new Date().toISOString().slice(0, 16)}`]);
    toast.show(`${sel.name} committed — import history + audit recorded (mock).`);
  }

  return (
    <AppShell roles={roles}>
      <PageHeader title="Imports & Integrations" sub="Template → upload → map → validate → preview → approve → commit → audit" />
      {loading ? (
        <Skeleton />
      ) : (
        <View>
          <View style={styles.tabs}>
            {TEMPLATES.map((t) => (
              <Pressable key={t.id} onPress={() => { setSel(t); setResult(null); }} style={[styles.tab, sel.id === t.id ? styles.on : null]}>
                <Text style={[styles.tabT, sel.id === t.id ? styles.onT : null]}>{t.name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.h}>{sel.name} template</Text>
            <Text style={styles.code}>{sel.text}</Text>
            <View style={styles.row}>
              <Pressable style={styles.btn} onPress={download}><Text style={styles.btnT}>Download template</Text></Pressable>
              <Pressable style={styles.btn} onPress={runPreview}><Text style={styles.btnT}>Validate preview</Text></Pressable>
              <Pressable style={[styles.btn, styles.btn2]} onPress={commit}><Text style={styles.btnT}>Commit (mock)</Text></Pressable>
            </View>
            {result ? <Text style={{ marginTop: 8 }}>{result}</Text> : null}
          </View>
          {committed.length > 0 ? (
            <DataTable columns={[{ key: 'c', header: 'Import history', width: 320, render: (r) => <Text>{r.c}</Text> }]} rows={committed.map((c) => ({ id: c, c }))} />
          ) : null}
          <View style={styles.card}>
            <Text style={styles.h}>Adapters</Text>
            <StatusChip label="ERP/SAP — not connected (needs creds)" tone="warn" />
            <Text style={styles.sub}>SOPIC · HR/payroll via validated import until live contracts signed. No fake success states. {auditLog().length} audit entries this session.</Text>
          </View>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  tab: { borderWidth: 1, borderColor: tokens.color.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff' },
  on: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  tabT: { fontSize: 12, fontWeight: '700', color: tokens.color.text2 },
  onT: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: tokens.color.border, padding: 16, marginTop: 12 },
  h: { fontWeight: '700', color: tokens.color.text },
  code: { fontSize: 12, color: tokens.color.text2, marginTop: 8 },
  sub: { color: tokens.color.text2, fontSize: 12, marginTop: 8 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 },
  btn: { backgroundColor: tokens.color.primary, borderRadius: 10, padding: 12 },
  btn2: { backgroundColor: tokens.color.dark },
  btnT: { color: '#fff', fontWeight: '700' },
});
