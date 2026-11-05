import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { FormField } from '../../src/components/FormField';
import { Stepper } from '../../src/components/Stepper';
import { StatusChip } from '../../src/components/StatusChip';
import { DataTable, type Column } from '../../src/components/DataTable';
import { useToast } from '../../src/components/Toast';
import { Button, Callout, Card, SectionHeader, Tabs } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { fontStack, palette, type } from '../../src/theme/tokens';

const TABS = ['Production', 'Machine', 'Labour', 'Consumption', 'Rejection'] as const;
const FLOW = ['Select traveller', 'Record', 'Confirm'];

interface Entry { id: string; kind: string; detail: string; by: string }

export default function ProductionCapture() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Production');
  const [step, setStep] = useState(0);
  const [good, setGood] = useState('4820');
  const [scrap, setScrap] = useState('60');
  const [entries, setEntries] = useState<Entry[]>([]);

  const input = 4880;
  const balanced = Math.abs((Number(good) + Number(scrap)) - input) <= input * 0.01;

  function confirm(): void {
    const detail =
      tab === 'Production' ? `Good ${good} kg · scrap ${scrap} kg` :
      tab === 'Machine' ? 'Run 7.8 / idle 0.6 / breakdown 0.4 hrs' :
      tab === 'Labour' ? 'R. Mehta · 8.0 hrs' :
      tab === 'Consumption' ? 'Cutting fluid 12 L' :
      'Qty 20 kg · DIM-OD · rework';
    setEntries((e) => [{ id: `E-${Date.now()}`, kind: tab, detail, by: email ?? 'operator' }, ...e]);
    setStep(0);
    toast.show(`${tab} entry recorded (SAMPLE) — feeds WIP, allocation and variance.`);
  }

  const cols: Column<Entry>[] = [
    { key: 'kind', header: 'Type', width: 120, render: (e) => <StatusChip label={e.kind} tone="info" /> },
    { key: 'detail', header: 'Detail', width: 260, render: (e) => <Text style={styles.sub}>{e.detail}</Text> },
    { key: 'by', header: 'By', width: 120, render: (e) => <Text style={styles.sub}>{e.by}</Text> },
  ];

  return (
    <AppShell roles={roles}>
      <PageHeader eyebrow="Production" title="Production Data Capture" sub="Shop-floor entry that feeds the costing engine. SAMPLE data." />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 14 }}>
          <Tabs tabs={TABS} value={tab} onChange={(t) => { setTab(t as (typeof TABS)[number]); setStep(0); }} />
          {tab === 'Production' ? <Stepper steps={FLOW} current={step} onGo={setStep} /> : null}

          <Card style={{ gap: 6 }}>
            <SectionHeader title={`${tab} entry`} description="Traveller T-0314-07 · DHDM op" />
            {tab === 'Production' ? (
              <>
                <FormField label="Good output (kg)" value={good} onChange={setGood} keyboard="numeric" />
                <FormField label="Scrap (kg)" value={scrap} onChange={setScrap} keyboard="numeric" />
                <Callout tone={balanced ? 'ok' : 'warn'} title={balanced ? 'Mass balance OK' : 'Mass balance off tolerance'}>
                  {`Input ${input} kg = good ${good || 0} + scrap ${scrap || 0}. ${balanced ? 'Within ±1%.' : 'Supervisor approval required.'}`}
                </Callout>
              </>
            ) : tab === 'Machine' ? (
              <>
                <FormField label="Run hours" value="7.8" onChange={() => undefined} keyboard="numeric" />
                <FormField label="Idle hours" value="0.6" onChange={() => undefined} keyboard="numeric" />
                <FormField label="Breakdown hours" value="0.4" onChange={() => undefined} keyboard="numeric" />
              </>
            ) : tab === 'Labour' ? (
              <>
                <FormField label="Operator" value="R. Mehta" onChange={() => undefined} />
                <FormField label="Labour hours" value="8.0" onChange={() => undefined} keyboard="numeric" />
              </>
            ) : tab === 'Consumption' ? (
              <>
                <FormField label="Consumable" value="Cutting fluid" onChange={() => undefined} />
                <FormField label="Quantity (L)" value="12" onChange={() => undefined} keyboard="numeric" />
              </>
            ) : (
              <>
                <FormField label="Rejection qty (kg)" value="20" onChange={() => undefined} keyboard="numeric" />
                <FormField label="Defect code" value="DIM-OD" onChange={() => undefined} />
                <FormField label="Disposition" value="Rework" onChange={() => undefined} />
              </>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button label="Confirm entry" icon="check" onPress={confirm} />
            </View>
          </Card>

          <SectionHeader title="Recent entries" description={`${entries.length} this session`} />
          <DataTable columns={cols} rows={entries} emptyText="No entries yet" emptyHint="Confirm an entry above." />
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  sub: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
});
