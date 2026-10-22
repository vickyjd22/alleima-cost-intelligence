import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { SearchField, PeriodSelector } from '../../src/components/Filters';
import { StatusChip } from '../../src/components/StatusChip';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { FormField, PrimaryButton } from '../../src/components/FormField';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { ExportButton } from '../../src/components/ExportButton';
import { useToast } from '../../src/components/Toast';
import { Button, Callout } from '../../src/components/ui';
import { palette } from '../../src/theme/tokens';
import { useSession } from '../../src/store/session';
import { costCentreSchema } from '../../src/lib/validation';
import { audit } from '../../src/lib/audit';
import { CC_MASTER, CC_DEPT_SUMMARY, CC_EXCEPTIONS, type CCRow, type CCType } from '../../src/mocks/manual';

const TYPES: ('all' | CCType)[] = ['all', 'production', 'service', 'project', 'reporting'];
const TONE = { all: 'neutral', production: 'info', service: 'neutral', project: 'warn', reporting: 'error' } as const;

export default function CostCentres() {
  const router = useRouter();
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [q, setQ] = useState('');
  const [type, setType] = useState<(typeof TYPES)[number]>('all');
  const [showExc, setShowExc] = useState(false);
  const [detail, setDetail] = useState<CCRow | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', department: 'Hot Flow', type: 'production', owner: '', driver: 'machine-hrs' });
  const [err, setErr] = useState<string | null>(null);

  const counts = TYPES.slice(1).map((t) => ({ t, n: CC_MASTER.filter((r) => r.type === t).length }));
  const rows = CC_MASTER.filter(
    (r) => (type === 'all' || r.type === type) && (r.code + r.desc + r.dept).toLowerCase().includes(q.toLowerCase()),
  ).map((r) => ({ ...r, id: r.code }));

  function create(): void {
    const parsed = costCentreSchema.safeParse({ ...form, uom: 'hr', active: true });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? 'Check fields');
      return;
    }
    setErr(null);
    setShowNew(false);
    audit(email ?? 'demo', 'cc.create', `${form.code} (mock — needs Costing+Finance+Operations approval)`);
    toast.show(`CC ${form.code} drafted — §4.6 approval required before ERP activation (mock).`);
  }

  return (
    <AppShell roles={roles}>
      <PageHeader
        title={`Cost Centres — ${CC_MASTER.length} source records (Annexure H)`}
        sub="§4: listing is the source population, not an approval. Classify before allocating (§4.6)."
        right={<PeriodSelector />}
      />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {counts.map((c) => (
              <StatusChip key={c.t} label={`${c.t} ${c.n}`} tone={TONE[c.t]} />
            ))}
            <Button label={`${showExc ? 'Hide' : 'Show'} ${CC_EXCEPTIONS.length} master-data exceptions`} size="sm" variant="ghost" icon="triangleAlert" onPress={() => setShowExc(!showExc)} />
          </View>
          {showExc ? (
            <DataTable columns={[{ key: 'c', header: 'Code', render: (r) => <Text>{r.code}</Text> }, { key: 'i', header: 'Exception — reconcile before manual is effective', width: 420, render: (r) => <Text>{r.issue}</Text> }]} rows={CC_EXCEPTIONS.map((e) => ({ ...e, id: e.code }))} />
          ) : null}
          <View style={{ flexDirection: 'row', gap: 8, marginVertical: 12, flexWrap: 'wrap' }}>
            {TYPES.map((t) => (
              <Pressable key={t} onPress={() => setType(t)} accessibilityRole="button" accessibilityState={{ selected: type === t }} accessibilityLabel={`Filter ${t}`} style={{ cursor: 'pointer' } as never}>
                <StatusChip label={t} tone={type === t ? 'info' : 'neutral'} />
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <SearchField value={q} onChange={setQ} placeholder="Search 127 codes…" />
            <ExportButton filename="cc-master-127-sample.csv" headers={['code', 'desc', 'dept', 'type', 'driver']} rows={rows.map((r) => [r.code, r.desc, r.dept, r.type, r.driver])} />
            <Button label="New cost centre" size="sm" icon="plus" onPress={() => setShowNew(true)} />
            <Button label="Import" size="sm" variant="secondary" icon="upload" onPress={() => router.push('/(app)/imports' as never)} />
          </View>
          <DataTable
            columns={[
              { key: 'code', header: 'Code', render: (r) => <Text>{r.code}</Text> },
              { key: 'desc', header: 'Description', width: 220, render: (r) => <Text>{r.desc}</Text> },
              { key: 'dept', header: 'Dept / Flow', render: (r) => <Text>{r.dept}</Text> },
              { key: 'type', header: 'Type', render: (r) => <StatusChip label={r.type} tone={TONE[r.type]} /> },
              { key: 'driver', header: 'Driver', render: (r) => <Text>{r.driver}</Text> },
              { key: 'open', header: '', render: (r) => <Pressable onPress={() => setDetail(r)}><Text style={{ color: palette.tint, fontWeight: '700' }}>Open</Text></Pressable> },
            ]}
            rows={rows}
          />
          <View style={{ marginTop: 12 }}>
            <Callout tone="neutral" compact>
              §4.5 initial treatment by department: {CC_DEPT_SUMMARY.slice(0, 7).map((d) => `${d[0]} ${d[1]}`).join(' · ')} — full table in export. Reporting codes never enter product cost without policy approval.
            </Callout>
          </View>
        </View>
      )}
      <DetailDrawer visible={detail !== null} title={detail?.code ?? ''} onClose={() => setDetail(null)}>
        <KeyVal k="Description" v={detail?.desc ?? ''} />
        <KeyVal k="Department / Flow" v={detail?.dept ?? ''} />
        <KeyVal k="Type (§4)" v={detail?.type ?? ''} />
        <KeyVal k="Primary driver" v={detail?.driver ?? ''} />
        <KeyVal k="UOM" v={detail?.uom ?? ''} />
        <KeyVal k="Approval chain (§4.5)" v="Code → Desc → Flow → Type → Owner → Driver → UOM → Capacity → WO applicability → PC → GL → Rate method → Effective date → ERP status" />
        <KeyVal k="Activation (§4.6)" v="Owner + purpose + driver + capacity + fixed/variable treatment approved before standard costing" />
      </DetailDrawer>
      <DetailDrawer visible={showNew} title="New cost centre (§4.6)" onClose={() => setShowNew(false)}>
        <FormField label="Code (8204…)" value={form.code} onChange={(v) => setForm({ ...form, code: v })} error={err} placeholder="8204103xx" />
        <FormField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="e.g. Open Annealing" />
        <FormField label="Owner" value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder="Cost owner" />
        <PrimaryButton label="Create draft (mock)" onPress={create} />
      </DetailDrawer>
    </AppShell>
  );
}
