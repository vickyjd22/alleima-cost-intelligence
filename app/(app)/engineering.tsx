import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { TraceabilityTimeline } from '../../src/components/CostingPanels';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { ExportButton } from '../../src/components/ExportButton';
import { Tabs } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { SAMPLE_PRODUCTS } from '../../src/data/sample';
import { HF_ROUTE, CF_ROUTE, UB_ROUTE, MHR_POOL, CAPACITY, UTIL_KPIS, UTILITIES, CONSUMABLES, RATE_CARD } from '../../src/mocks/manual';
import { fontStack, palette, type } from '../../src/theme/tokens';

const TABS = ['Products & BOM', 'Routes §5', 'Machines §9', 'Utilities §10', 'Consumables §11', 'Rate register'] as const;
const BOM_VERSIONS = [
  { id: 'BOM-304-v3', product: 'SAMPLE-TUBE-304-50', version: 'v3', from: '2026-10-01', state: 'approved' },
  { id: 'BOM-304-v2', product: 'SAMPLE-TUBE-304-50', version: 'v2', from: '2026-07-01', state: 'approved' },
  { id: 'BOM-304-v4', product: 'SAMPLE-TUBE-304-50', version: 'v4-draft', from: '—', state: 'draft' },
];
const RATE_CYCLE = ['Freeze annual assumptions + practical capacity', 'Prepare std MHR + labour rates', 'Load into ERP/costing model', 'Pilot costing per grade group + flow', 'Approve (Costing + Finance)', 'Monitor actual-vs-std monthly', 'Reforecast on major change — never retrospective'];

export default function Engineering() {
  const { roles } = useSession();
  const loading = useMockLoading();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Products & BOM');
  const [bom, setBom] = useState<(typeof BOM_VERSIONS)[number] | null>(null);

  return (
    <AppShell roles={roles}>
      <PageHeader
        title="Engineering & Masters"
        sub="§5 routes · §7 BOM/routing/standards · §9 machines/capacity · §10 utilities · §11 consumables"
        right={<ExportButton filename="rate-card-annexC-sample.csv" headers={['cc', 'process', 'driver']} rows={RATE_CARD.map((r) => [r[0], r[1], r[2]])} />}
      />
      <Tabs tabs={TABS} value={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} style={{ marginBottom: 14 }} />
      {loading ? (
        <Skeleton lines={5} />
      ) : (
        <View>
          {tab === 'Products & BOM' ? (
            <View>
              <DataTable columns={[{ key: 'id', header: 'Product', width: 220, render: (r) => <Text>{r.id}</Text> }, { key: 'g', header: 'Grade', render: (r) => <Text>{r.grade}</Text> }, { key: 'gg', header: 'Grade group', render: (r) => <Text>{r.gradeGroup}</Text> }, { key: 'uom', header: 'UOM', render: (r) => <Text>{r.uom}</Text> }, { key: 'bom', header: 'BOM', render: () => <StatusChip label="v3 approved" tone="ok" /> }]} rows={SAMPLE_PRODUCTS.map((p) => ({ ...p }))} />
              <Text style={styles.h}>BOM versions (§6.4 maker-checker, §7.3 no retrospective change)</Text>
              <DataTable columns={[{ key: 'id', header: 'BOM', render: (r) => <Text>{r.id}</Text> }, { key: 'f', header: 'Effective', render: (r) => <Text>{r.from}</Text> }, { key: 's', header: 'State', render: (r) => <StatusChip label={r.state} tone={r.state === 'approved' ? 'ok' : 'warn'} /> }, { key: 'o', header: '', render: (r) => <Pressable onPress={() => setBom(r)}><Text style={styles.link}>Diff</Text></Pressable> }]} rows={BOM_VERSIONS} />
              <Text style={styles.h}>Rate-setting cycle (§7.3)</Text>
              {RATE_CYCLE.map((s, i) => <Text key={s} style={styles.li}>{i + 7}. {s}</Text>)}
              <Text style={styles.note}>Std build-up (§7.1): Std RM + process material + machine + labour + consumables + other direct + alloc prod OH + primary packing. Separate HF/Big/Small rates, grade-group-specific.</Text>
            </View>
          ) : null}
          {tab === 'Routes §5' ? (
            <View>
              <Text style={styles.h}>Hot Flow — 12 ops (step 8 Open Annealing: NEW CC required)</Text>
              <DataTable columns={[{ key: 's', header: '#', render: (r) => <Text>{String(r.seq)}</Text> }, { key: 'p', header: 'Process', width: 260, render: (r) => <Text>{r.proc}</Text> }, { key: 'c', header: 'CC', render: (r) => <Text>{r.cc}</Text> }, { key: 'f', header: '', render: (r) => (r.cc.includes('NEW') ? <StatusChip label="master-data exception" tone="error" /> : <StatusChip label="mapped" tone="ok" />) }]} rows={HF_ROUTE.map(([seq, proc, cc]) => ({ id: `hf${seq}`, seq, proc, cc }))} />
              <Text style={styles.h}>Cold Flow — 9 ops</Text>
              <DataTable columns={[{ key: 's', header: '#', render: (r) => <Text>{String(r.seq)}</Text> }, { key: 'p', header: 'Process', width: 260, render: (r) => <Text>{r.proc}</Text> }, { key: 'c', header: 'CC', render: (r) => <Text>{r.cc}</Text> }]} rows={CF_ROUTE.map(([seq, proc, cc]) => ({ id: `cf${seq}`, seq, proc, cc }))} />
              <Text style={styles.h}>U-Bending — 8 ops (SR Furnace: validate dedicated CC)</Text>
              <TraceabilityTimeline steps={UB_ROUTE.map(([p, c]) => `${p} → ${c}`)} />
            </View>
          ) : null}
          {tab === 'Machines §9' ? (
            <View>
              <Text style={styles.h}>MHR = Annual Allocable Machine Cost ÷ Practical Machine Hours (§9.1)</Text>
              <DataTable columns={[{ key: 'i', header: 'Include in pool', width: 220, render: (r) => <Text>{r.inc}</Text> }, { key: 't', header: 'Treatment', width: 340, render: (r) => <Text>{r.tr}</Text> }]} rows={MHR_POOL.map(([inc, tr], i) => ({ id: `m${i}`, inc, tr }))} />
              <Text style={styles.h}>Capacity ladder — idle kept visible, not buried (§9.3, CAS-2 Rev 2024)</Text>
              <DataTable columns={[{ key: 'c', header: 'Concept', width: 200, render: (r) => <Text>{r.cap}</Text> }, { key: 'p', header: 'Policy', width: 380, render: (r) => <Text>{r.pol}</Text> }]} rows={CAPACITY.map(([cap, pol], i) => ({ id: `c${i}`, cap, pol }))} />
              <Text style={styles.h}>Utilization KPIs (§9.4)</Text>
              <DataTable columns={[{ key: 'k', header: 'KPI', width: 200, render: (r) => <Text>{r.kpi}</Text> }, { key: 'f', header: 'Formula', width: 320, render: (r) => <Text>{r.formula}</Text> }]} rows={UTIL_KPIS.map(([kpi, formula], i) => ({ id: `u${i}`, kpi, formula }))} />
            </View>
          ) : null}
          {tab === 'Utilities §10' ? (
            <View>
              <Text style={styles.h}>Utility Rate = Total Utility Cost ÷ Measured/Equivalent Units (§10.1)</Text>
              <DataTable columns={[{ key: 'u', header: 'Utility', render: (r) => <Text>{r.util}</Text> }, { key: 'p', header: 'Preferred driver', width: 240, render: (r) => <Text>{r.pref}</Text> }, { key: 'f', header: 'Fallback', width: 240, render: (r) => <Text>{r.fb}</Text> }]} rows={UTILITIES.map(([util, pref, fb], i) => ({ id: `ut${i}`, util, pref, fb }))} />
              <Text style={styles.note}>CONTROL: technical estimates validated against meter readings; norm changes need engineering approval.</Text>
            </View>
          ) : null}
          {tab === 'Consumables §11' ? (
            <View>
              <DataTable columns={[{ key: 'c', header: 'Category', width: 240, render: (r) => <Text>{r.cat}</Text> }, { key: 't', header: 'Treatment', width: 340, render: (r) => <Text>{r.tr}</Text> }]} rows={CONSUMABLES.map(([cat, tr], i) => ({ id: `cs${i}`, cat, tr }))} />
              <Text style={styles.h}>Spares & maintenance KPIs (§11.3)</Text>
              <Text style={styles.li}>Maintenance cost/ton · Breakdown hrs · MTBF/MTTR · PM compliance · Emergency purchase value · Consumable usage variance (SAMPLE: PM compliance 91%, MTBF 412h)</Text>
              <Text style={styles.note}>HF/CF/H&I items: glass powder, inserts, guide pads, mandrels, liners, dies, pilger dies, oils, cut-off wheels, gases — controlled by operation × product group.</Text>
            </View>
          ) : null}
          {tab === 'Rate register' ? (
            <View>
              <Text style={styles.h}>Cost Centre Rate Card (Annex C shape — rates pending finance approval)</Text>
              <DataTable columns={[{ key: 'c', header: 'CC', render: (r) => <Text>{r.cc}</Text> }, { key: 'p', header: 'Process', width: 200, render: (r) => <Text>{r.proc}</Text> }, { key: 'd', header: 'Driver', width: 200, render: (r) => <Text>{r.drv}</Text> }, { key: 'r', header: 'Rate', render: () => <StatusChip label="pending approval" tone="warn" /> }]} rows={RATE_CARD.map(([cc, proc, drv]) => ({ id: cc, cc, proc, drv }))} />
            </View>
          ) : null}
        </View>
      )}
      <DetailDrawer visible={bom !== null} title={bom?.id ?? ''} onClose={() => setBom(null)}>
        <KeyVal k="Product" v={bom?.product ?? ''} />
        <KeyVal k="Change vs prior" v="Glass powder 4.0 → 4.2 kg/t · yield factor unchanged (SAMPLE)" />
        <KeyVal k="Approval" v="Engineering maker · Operations + Costing checkers (mock)" />
      </DetailDrawer>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  h: { ...type.headline, color: palette.text, marginTop: 20, marginBottom: 10, fontFamily: fontStack } as never,
  li: { ...type.footnote, color: palette.text, paddingVertical: 3, fontFamily: fontStack } as never,
  link: { color: palette.tint, fontWeight: '700', fontFamily: fontStack },
  note: { ...type.caption1, color: palette.text2, marginTop: 10, lineHeight: 18, fontFamily: fontStack } as never,
});
