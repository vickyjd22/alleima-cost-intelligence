import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { StatusChip } from '../../src/components/StatusChip';
import { DataTable } from '../../src/components/DataTable';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { Button, Callout, Card, Tabs } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { useToast } from '../../src/components/Toast';
import { useSession } from '../../src/store/session';
import { previewCostCentres } from '../../src/lib/imports';
import { audit, auditLog } from '../../src/lib/audit';
import { fontStack, monoStack, palette, radius, type } from '../../src/theme/tokens';

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
  const [errors, setErrors] = useState(0);
  const [committed, setCommitted] = useState<string[]>([]);

  function download(): void {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const blob = new Blob([sel.text], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sel.id}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show(`${sel.name} template downloaded.`);
  }

  function runPreview(): void {
    const bad = `${sel.text}\nBAD-1,Bad Row,Hot Flow,production,machine-hrs\n820410300,Duplicate,Hot Flow,production,machine-hrs`;
    const p = previewCostCentres(sel.id === 'cc' ? bad : sel.text);
    setErrors(p.errors.length);
    setResult(`Rows ${p.rows.length} · errors ${p.errors.length} (${p.errors.map((e) => `r${e.row}: ${e.message}`).join('; ') || 'none'}) · duplicates at rows ${p.duplicates.join(',') || 'none'}`);
  }

  function commit(): void {
    audit(email ?? 'demo', 'import.commit', `${sel.id} (mock)`);
    setCommitted([...committed, `${sel.id} — ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`]);
    toast.show(`${sel.name} committed — import history + audit recorded (mock).`);
  }

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Master data"
        title="Imports & integrations"
        sub="Template → upload → map → validate → preview → approve → commit → audit. Nothing touches production masters in this demo."
      />
      {loading ? (
        <Skeleton />
      ) : (
        <View style={{ gap: 14 }}>
          <Tabs
            tabs={TEMPLATES.map((t) => t.name)}
            value={sel.name}
            onChange={(name) => {
              const next = TEMPLATES.find((t) => t.name === name);
              if (next) { setSel(next); setResult(null); setErrors(0); }
            }}
          />

          <Card style={{ gap: 12 }}>
            <View style={styles.head}>
              <View style={styles.headIcon}>
                <Icon name="upload" size={16} color={palette.tint} strokeWidth={1.9} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.h}>{sel.name} template</Text>
                <Text style={styles.sub}>Download, complete offline, then validate before committing.</Text>
              </View>
              <StatusChip label="CSV" tone="neutral" />
            </View>
            <View style={styles.codeBlock}>
              <Text style={styles.code}>{sel.text}</Text>
            </View>
            <View style={styles.row}>
              <Button label="Download template" icon="download" variant="secondary" onPress={download} />
              <Button label="Validate preview" icon="listChecks" onPress={runPreview} />
              <Button label="Commit (mock)" icon="database" variant="success" onPress={commit} />
            </View>
            {result ? (
              <Callout tone={errors > 0 ? 'warn' : 'ok'} title={errors > 0 ? 'Validation found issues' : 'Validation preview'} compact>
                {result}
              </Callout>
            ) : null}
          </Card>

          {committed.length > 0 ? (
            <View>
              <Text style={styles.h2}>Import history</Text>
              <DataTable
                columns={[
                  { key: 'c', header: 'Committed import', width: 360, render: (r) => <Text>{r.c}</Text> },
                  { key: 's', header: 'State', render: () => <StatusChip label="committed (mock)" tone="ok" /> },
                ]}
                rows={committed.map((c) => ({ id: c, c }))}
              />
            </View>
          ) : null}

          <Card style={{ gap: 10 }}>
            <View style={styles.head}>
              <View style={[styles.headIcon, { backgroundColor: palette.warningSoft }]}>
                <Icon name="plug" size={16} color={palette.warning} strokeWidth={1.9} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.h}>Adapters</Text>
                <Text style={styles.sub}>SOPIC · HR/payroll via validated import until live contracts are signed.</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <StatusChip label="ERP/SAP — not connected (needs credentials)" tone="warn" />
              <StatusChip label={`${auditLog().length} audit entries this session`} tone="neutral" />
            </View>
            <Text style={styles.sub}>No fake success states: previews surface duplicates and row-level errors before anything is committed.</Text>
          </Card>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  h: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  h2: { ...type.headline, color: palette.text, marginBottom: 10, fontFamily: fontStack } as never,
  sub: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 1 } as never,
  codeBlock: { backgroundColor: palette.bgAlt, borderRadius: radius.sm, borderWidth: 1, borderColor: palette.border, padding: 12 },
  code: { fontFamily: monoStack, fontSize: 12, lineHeight: 19, color: palette.text2 } as never,
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
