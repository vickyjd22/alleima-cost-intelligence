import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { Stepper } from '../../src/components/Stepper';
import { useSession } from '../../src/store/session';
import { useToast } from '../../src/components/Toast';
import { Button, Callout, Card, SectionHeader } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { travellerEntrySchema } from '../../src/lib/validation';
import { buildIdempotencyKey, validateLedgerIntent } from '../../src/lib/ledger';
import { audit } from '../../src/lib/audit';
import { demoDb, resetDemo } from '../../src/mocks/demo';
import { fontStack, minTouch, palette, radius, type } from '../../src/theme/tokens';

export default function WorkOrders() {
  const { roles, email } = useSession();
  const toast = useToast();
  const [shop, setShop] = useState(false);
  const [step, setStep] = useState(0);
  const [trav, setTrav] = useState({ travellerNo: 'T-503', woNo: 'WO-881', pass: 'CF-2', machineId: 'PILGER-309', ccCode: '820410309', heatId: 'H-771', inputKg: '500', outputKg: '', reworkKg: '0', rejectKg: '0' });
  const [msg, setMsg] = useState<string | null>(null);

  function submitTraveller(): void {
    const parsed = travellerEntrySchema.safeParse({
      ...trav,
      inputKg: Number(trav.inputKg),
      outputKg: Number(trav.outputKg || '0'),
      reworkKg: Number(trav.reworkKg),
      rejectKg: Number(trav.rejectKg),
    });
    if (!parsed.success) {
      setMsg(`Validation: ${parsed.error.issues[0]?.message ?? 'check quantities'}`);
      return;
    }
    const errs = validateLedgerIntent({
      idempotencyKey: buildIdempotencyKey([trav.travellerNo, trav.pass, Date.now()]),
      type: 'wip',
      plantId: 'mehsana',
      heatId: trav.heatId,
      qty: 1,
      kg: Number(trav.outputKg),
      ref: trav.woNo,
    });
    if (errs.length > 0) {
      setMsg(errs.join('; '));
      return;
    }
    const y = ((Number(trav.outputKg) / Number(trav.inputKg)) * 100).toFixed(1);
    audit(email ?? 'demo', 'traveller.post', `${trav.travellerNo} yield ${y}% (mock)`);
    toast.show(`Traveller ${trav.travellerNo} queued — yield ${y}% SAMPLE. Ref ${(buildIdempotencyKey([trav.travellerNo])).slice(0, 12)}…`);
    setMsg(`Validated — ready for Functions commit (mock). Yield ${y}% SAMPLE.`);
  }

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Production"
        title="Work orders & travellers"
        sub="Journey C + G: work order → reserve → issue → traveller operations → QC / scrap → finished goods."
        right={
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button label={shop ? 'Desktop view' : 'Shop-floor mode'} size="sm" variant={shop ? 'primary' : 'secondary'} icon={shop ? 'layoutDashboard' : 'hardHat'} onPress={() => setShop(!shop)} />
            <Button label="Reset demo" size="sm" variant="ghost" icon="refresh" onPress={() => { resetDemo(); toast.show('Demo data reset.'); }} />
          </View>
        }
      />

      {shop ? (
        <Card style={{ gap: 12, marginBottom: 16 }}>
          <View style={styles.shopHead}>
            <View style={styles.shopIcon}>
              <Icon name="hardHat" size={18} color={palette.tint} strokeWidth={1.9} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shopT}>Assigned work — T-501 · WO-881 · PRESS-151</Text>
              <Text style={styles.shopS}>Large targets, minimal taps, works on a shop-floor tablet.</Text>
            </View>
            <StatusChip label="SAMPLE" tone="info" />
          </View>
          <Stepper steps={['Start operation', 'Record output', 'Scrap / rework', 'Confirm']} current={step} onGo={setStep} />
          {step === 0 ? <Text style={styles.big}>Press start to clock on to HF-3.</Text> : null}
          {step === 1 ? <Text style={styles.big}>Enter good output kg with the stepper in the full form below.</Text> : null}
          {step === 2 ? <Text style={styles.big}>Pick defect code: ECT-LINE / DIM-OD / SURFACE.</Text> : null}
          {step === 3 ? <Text style={styles.big}>Confirmation ref WIP-T-501-OK (mock). Status synced to the website.</Text> : null}
        </Card>
      ) : (
        <DataTable
          columns={[
            { key: 'id', header: 'WO', width: 130, render: (r) => <Text>{r.id}</Text> },
            { key: 'p', header: 'Product', width: 200, render: (r) => <Text>{r.product}</Text> },
            { key: 'q', header: 'Qty', render: (r) => <Text>{String(r.qty)}</Text> },
            { key: 's', header: 'Status', render: (r) => <StatusChip label={r.status} tone="info" /> },
          ]}
          rows={demoDb.workOrders}
        />
      )}

      <SectionHeader title="Traveller entry" description="Validated, idempotent and offline-safe — quantities are checked before commit." style={{ marginTop: 24 }} />
      <DataTable
        columns={[
          { key: 'id', header: 'Traveller', width: 120, render: (r) => <Text>{r.id}</Text> },
          { key: 'p', header: 'Pass', render: (r) => <Text>{r.pass}</Text> },
          { key: 'h', header: 'Heat', render: (r) => <Text>{r.heat}</Text> },
          { key: 'io', header: 'In → Out kg', width: 170, render: (r) => <Text>{`${r.inputKg} → ${r.outputKg}`}</Text> },
        ]}
        rows={demoDb.travellers}
      />

      <Card style={{ marginTop: 12, gap: 10 }}>
        <View style={styles.grid}>
          {(['travellerNo', 'woNo', 'pass', 'machineId', 'ccCode', 'heatId', 'inputKg', 'outputKg', 'reworkKg', 'rejectKg'] as const).map((k) => (
            <View key={k} style={styles.field}>
              <Text style={styles.label}>{k.toUpperCase()}</Text>
              <TextInput value={trav[k]} onChangeText={(v) => setTrav({ ...trav, [k]: v })} style={styles.input} placeholder={trav[k] === '' ? 'enter…' : undefined} placeholderTextColor={palette.text3 as never} accessibilityLabel={k} />
            </View>
          ))}
        </View>
        <Button label="Validate & queue" icon="check" onPress={submitTraveller} style={{ alignSelf: 'flex-start' }} />
        {msg ? <Callout tone={msg.startsWith('Validation') || msg.includes('Blocked') ? 'warn' : 'ok'} compact>{msg}</Callout> : null}
      </Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  shopHead: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  shopIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  shopT: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  shopS: { ...type.caption1, color: palette.text3, marginTop: 1, fontFamily: fontStack } as never,
  big: { ...type.body, color: palette.text, backgroundColor: palette.bgAlt, borderRadius: radius.sm, padding: 16, fontFamily: fontStack } as never,
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: { minWidth: 150, flex: 1 },
  label: { ...type.caption2, color: palette.text3, marginBottom: 4, fontFamily: fontStack } as never,
  input: { borderWidth: 1, borderColor: palette.border, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, minHeight: minTouch, backgroundColor: palette.card, fontSize: 14, color: palette.text, fontFamily: fontStack, outlineStyle: 'none' } as never,
});
