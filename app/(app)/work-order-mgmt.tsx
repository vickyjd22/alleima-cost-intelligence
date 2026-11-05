import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { DataTable, type Column } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { Stepper } from '../../src/components/Stepper';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { Button, Card, SectionHeader } from '../../src/components/ui';
import { KpiCard } from '../../src/components/KpiCard';
import { useSession } from '../../src/store/session';
import { WORK_ORDERS, inr, lakh, type DemoWO } from '../../src/mocks/costingDemo';
import { fontStack, palette, type } from '../../src/theme/tokens';

const LIFECYCLE = ['Draft', 'Approved', 'Released', 'InProgress', 'Completed', 'Closed'] as const;
const CREATE_STEPS = ['Product & qty', 'Assign BOM', 'Assign routing', 'Review'];

function toneFor(s: DemoWO['status']): 'neutral' | 'info' | 'ok' | 'warn' {
  if (s === 'Completed' || s === 'Closed') return 'ok';
  if (s === 'InProgress' || s === 'Released') return 'info';
  if (s === 'Draft') return 'neutral';
  return 'warn';
}

export default function WorkOrderMgmt() {
  const { roles } = useSession();
  const router = useRouter();
  const toast = useToast();
  const loading = useMockLoading();
  const [open, setOpen] = useState<DemoWO | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [step, setStep] = useState(0);

  const cols: Column<DemoWO>[] = [
    { key: 'id', header: 'WO No', width: 150, render: (w) => <Text style={styles.cell}>{w.id}</Text> },
    { key: 'batch', header: 'Batch', width: 120, render: (w) => <Text style={styles.sub}>{w.batch}</Text> },
    { key: 'customer', header: 'Customer', width: 160, render: (w) => <Text style={styles.sub}>{w.customer}</Text> },
    { key: 'product', header: 'Product', width: 190, render: (w) => <Text style={styles.sub}>{w.product}</Text> },
    { key: 'qty', header: 'Qty (kg)', width: 90, align: 'right', render: (w) => <Text style={styles.cell}>{w.qty.toLocaleString('en-IN')}</Text> },
    { key: 'value', header: 'Value', width: 110, align: 'right', render: (w) => <Text style={styles.cell}>{lakh(w.value)}</Text> },
    { key: 'status', header: 'Status', width: 120, render: (w) => <StatusChip label={w.status} tone={toneFor(w.status)} /> },
  ];

  const lifecycleIndex = open ? Math.max(0, LIFECYCLE.indexOf(open.status)) : 0;

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Production"
        title="Work Orders"
        sub="Create → approve → release → produce → close. SAMPLE data."
        right={<Button label="Create work order" icon="plus" onPress={() => { setStep(0); setCreateOpen(true); }} />}
      />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <DataTable columns={cols} rows={WORK_ORDERS} onRowPress={setOpen} emptyText="No work orders" />
      )}

      <DetailDrawer visible={!!open} title={open?.id ?? ''} onClose={() => setOpen(null)}>
        {open ? (
          <View style={{ gap: 12 }}>
            <KpiCard title="Work order value" value={lakh(open.value)} icon="wallet" hint={`${open.qty.toLocaleString('en-IN')} kg · ${open.product}`} />
            <SectionHeader title="Lifecycle" description="Trusted state machine governs each transition." />
            <Stepper steps={LIFECYCLE as unknown as string[]} current={lifecycleIndex} onGo={() => undefined} />
            <View style={{ gap: 4 }}>
              <KeyVal k="Batch" v={open.batch} />
              <KeyVal k="Customer" v={open.customer} />
              <KeyVal k="Route" v={open.route} />
              <KeyVal k="Quantity" v={`${open.qty.toLocaleString('en-IN')} kg`} />
              <KeyVal k="Value" v={inr(open.value)} />
            </View>
            <View style={styles.actions}>
              {open.status === 'Draft' ? <Button label="Submit for approval" icon="checkCheck" onPress={() => toast.show('Submitted for approval (maker ≠ checker).')} /> : null}
              {open.status === 'Approved' ? <Button label="Release" icon="check" onPress={() => toast.show('Released — travellers generated (WO-01 material ready).')} /> : null}
              <Button label="Open travellers" variant="secondary" icon="clipboard" onPress={() => { setOpen(null); router.push('/(app)/traveller-tracking' as never); }} />
            </View>
          </View>
        ) : null}
      </DetailDrawer>

      <DetailDrawer visible={createOpen} title="Create work order" onClose={() => setCreateOpen(false)}>
        <Stepper steps={CREATE_STEPS} current={step} onGo={setStep} />
        <Card style={{ marginTop: 12, gap: 6 }}>
          <Text style={styles.stepTitle}>{CREATE_STEPS[step]}</Text>
          <Text style={styles.sub}>
            {step === 0 ? 'Pick product and quantity from a customer order line.' :
             step === 1 ? 'Approved, effective BOM is auto-selected (override + reason allowed).' :
             step === 2 ? 'Approved routing for the chosen flow is attached.' :
             'Review and create. Status starts at Draft.'}
          </Text>
        </Card>
        <View style={styles.wizardNav}>
          <Button label="Back" variant="ghost" onPress={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} />
          {step < CREATE_STEPS.length - 1
            ? <Button label="Next" iconRight="arrowRight" onPress={() => setStep((s) => s + 1)} />
            : <Button label="Create work order" icon="plus" onPress={() => { setCreateOpen(false); toast.show('Work order WO-2026-0317 created (SAMPLE, Draft).'); }} />}
        </View>
      </DetailDrawer>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  cell: { ...type.footnote, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  stepTitle: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  wizardNav: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
});
