import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { DataTable, type Column } from '../../src/components/DataTable';
import { SearchField } from '../../src/components/Filters';
import { StatusChip } from '../../src/components/StatusChip';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { FormField } from '../../src/components/FormField';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { Button, Card, Tabs } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { PRODUCTS, type DemoProduct } from '../../src/mocks/costingDemo';
import { fontStack, palette, type } from '../../src/theme/tokens';

const VIEWS = ['List', 'Hierarchy'] as const;

export default function Products() {
  const { roles } = useSession();
  const router = useRouter();
  const toast = useToast();
  const loading = useMockLoading();
  const [view, setView] = useState<(typeof VIEWS)[number]>('List');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<DemoProduct | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ id: '', grade: '', od: '', wt: '', length: '' });
  const [local, setLocal] = useState<DemoProduct[]>([]);

  const rows = useMemo(() => {
    const all = [...PRODUCTS, ...local];
    const s = q.trim().toLowerCase();
    return s ? all.filter((p) => p.id.toLowerCase().includes(s) || p.grade.toLowerCase().includes(s)) : all;
  }, [q, local]);

  const groups = useMemo(() => {
    const all = [...PRODUCTS, ...local];
    const m = new Map<string, DemoProduct[]>();
    for (const p of all) { const l = m.get(p.gradeGroup) ?? []; l.push(p); m.set(p.gradeGroup, l); }
    return [...m.entries()];
  }, [local]);

  const cols: Column<DemoProduct>[] = [
    { key: 'id', header: 'Product code', width: 210, render: (p) => <Text style={styles.cell}>{p.id}</Text> },
    { key: 'grade', header: 'Grade', width: 80, render: (p) => <Text style={styles.cell}>{p.grade}</Text> },
    { key: 'group', header: 'Group', width: 130, render: (p) => <Text style={styles.sub}>{p.gradeGroup}</Text> },
    { key: 'type', header: 'Tube type', width: 100, render: (p) => <Text style={styles.sub}>{p.tubeType}</Text> },
    { key: 'dim', header: 'OD × WT', width: 110, render: (p) => <Text style={styles.sub}>{p.od} × {p.wt}</Text> },
    { key: 'uom', header: 'UOM', width: 70, render: (p) => <StatusChip label={p.uom} tone="neutral" /> },
  ];

  function clone(p: DemoProduct): void {
    setForm({ id: `${p.id}-COPY`, grade: p.grade, od: String(p.od), wt: String(p.wt), length: String(p.length) });
    setOpen(null);
    setCreateOpen(true);
  }
  function create(): void {
    if (!form.id.trim()) { toast.show('Product code is required.'); return; }
    const p: DemoProduct = {
      id: form.id.trim(), grade: form.grade || '304', gradeGroup: 'Austenitic', tubeType: 'Seamless',
      od: Number(form.od) || 0, wt: Number(form.wt) || 0, length: Number(form.length) || 6000, uom: 'kg',
    };
    setLocal((l) => [...l, p]);
    setCreateOpen(false);
    setForm({ id: '', grade: '', od: '', wt: '', length: '' });
    toast.show(`Product ${p.id} created (SAMPLE) — now usable in BOM and Routing.`);
  }

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Master data"
        title="Product Master"
        sub="Products feed BOM, Routing, Standard Cost and Work Orders. SAMPLE data."
        right={<Button label="Create product" icon="plus" onPress={() => setCreateOpen(true)} />}
      />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 14 }}>
          <Tabs tabs={VIEWS} value={view} onChange={(v) => setView(v as (typeof VIEWS)[number])} />
          {view === 'List' ? (
            <>
              <SearchField value={q} onChange={setQ} placeholder="Search products" />
              <DataTable columns={cols} rows={rows} onRowPress={setOpen} emptyText="No products" emptyHint="Create one to begin." />
            </>
          ) : (
            <View style={{ gap: 10 }}>
              {groups.map(([group, items]) => (
                <Card key={group} style={{ gap: 6 }}>
                  <Text style={styles.groupT}>{group} · {items.length}</Text>
                  {items.map((p) => (
                    <View key={p.id} style={styles.hierRow}>
                      <Text style={styles.cell}>{p.id}</Text>
                      <Text style={styles.sub}>Grade {p.grade} · {p.od}×{p.wt}</Text>
                    </View>
                  ))}
                </Card>
              ))}
            </View>
          )}
        </View>
      )}

      <DetailDrawer visible={!!open} title={open?.id ?? ''} onClose={() => setOpen(null)}>
        {open ? (
          <View style={{ gap: 4 }}>
            <KeyVal k="Grade" v={open.grade} />
            <KeyVal k="Grade group" v={open.gradeGroup} />
            <KeyVal k="Tube type" v={open.tubeType} />
            <KeyVal k="OD × WT" v={`${open.od} × ${open.wt} mm`} />
            <KeyVal k="Length" v={`${open.length} mm`} />
            <KeyVal k="UOM" v={open.uom} />
            <View style={styles.drawerActions}>
              <Button label="Build BOM" variant="secondary" icon="layers" onPress={() => { setOpen(null); router.push('/(app)/bom' as never); }} />
              <Button label="Open Routing" variant="secondary" icon="workflow" onPress={() => { setOpen(null); router.push('/(app)/routing' as never); }} />
              <Button label="Clone" variant="ghost" icon="plus" onPress={() => clone(open)} />
            </View>
          </View>
        ) : null}
      </DetailDrawer>

      <DetailDrawer visible={createOpen} title="Create product" onClose={() => setCreateOpen(false)}>
        <FormField label="Product code" value={form.id} onChange={(v) => setForm({ ...form, id: v })} placeholder="e.g. SAMPLE-TUBE-304-60" />
        <FormField label="Grade" value={form.grade} onChange={(v) => setForm({ ...form, grade: v })} placeholder="304 / 2205 / 316L" />
        <FormField label="OD (mm)" value={form.od} onChange={(v) => setForm({ ...form, od: v })} keyboard="numeric" placeholder="50.8" />
        <FormField label="WT (mm)" value={form.wt} onChange={(v) => setForm({ ...form, wt: v })} keyboard="numeric" placeholder="2.0" />
        <FormField label="Length (mm)" value={form.length} onChange={(v) => setForm({ ...form, length: v })} keyboard="numeric" placeholder="6000" />
        <Button label="Create draft" icon="plus" onPress={create} fullWidth />
      </DetailDrawer>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  cell: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
  groupT: { ...type.caption2, color: palette.tint, fontFamily: fontStack, letterSpacing: 0.8 } as never,
  hierRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: palette.separator },
  drawerActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 14 },
});
