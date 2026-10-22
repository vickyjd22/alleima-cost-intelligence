import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { Stepper } from '../../src/components/Stepper';
import { useSession } from '../../src/store/session';
import { useToast } from '../../src/components/Toast';
import { travellerEntrySchema } from '../../src/lib/validation';
import { buildIdempotencyKey, validateLedgerIntent } from '../../src/lib/ledger';
import { audit } from '../../src/lib/audit';
import { demoDb, resetDemo } from '../../src/mocks/demo';
import { tokens } from '../../src/theme/tokens';

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
        title="Work Orders & Travellers"
        sub="Journey C + G: WO → reserve → issue → traveller ops → QC/scrap → FG"
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={() => setShop(!shop)}><Text style={styles.link}>{shop ? 'Desktop view' : 'Shop-floor mode'}</Text></Pressable>
            <Pressable onPress={() => { resetDemo(); toast.show('Demo data reset.'); }}><Text style={styles.link}>Reset demo</Text></Pressable>
          </View>
        }
      />
      {shop ? (
        <View>
          <Text style={styles.h}>Assigned work — T-501 · WO-881 · PRESS-151 (SAMPLE)</Text>
          <Stepper steps={['Start operation', 'Record output', 'Scrap / rework', 'Confirm']} current={step} onGo={setStep} />
          {step === 0 ? <Text style={styles.big}>Press Start to clock on to HF-3.</Text> : null}
          {step === 1 ? <Text style={styles.big}>Enter good output kg with the stepper in the full form below.</Text> : null}
          {step === 2 ? <Text style={styles.big}>Pick defect code: ECT-LINE / DIM-OD / SURFACE.</Text> : null}
          {step === 3 ? <Text style={styles.big}>Confirmation ref WIP-T-501-OK (mock). Status synced to website.</Text> : null}
        </View>
      ) : (
        <DataTable
          columns={[
            { key: 'id', header: 'WO', render: (r) => <Text>{r.id}</Text> },
            { key: 'p', header: 'Product', width: 200, render: (r) => <Text>{r.product}</Text> },
            { key: 'q', header: 'Qty', render: (r) => <Text>{String(r.qty)}</Text> },
            { key: 's', header: 'Status', render: (r) => <StatusChip label={r.status} tone="info" /> },
          ]}
          rows={demoDb.workOrders}
        />
      )}
      <Text style={styles.h}>Traveller entry (validated, idempotent, offline-safe)</Text>
      <DataTable
        columns={[
          { key: 'id', header: 'Traveller', render: (r) => <Text>{r.id}</Text> },
          { key: 'p', header: 'Pass', render: (r) => <Text>{r.pass}</Text> },
          { key: 'h', header: 'Heat', render: (r) => <Text>{r.heat}</Text> },
          { key: 'io', header: 'In → Out kg', render: (r) => <Text>{`${r.inputKg} → ${r.outputKg}`}</Text> },
        ]}
        rows={demoDb.travellers}
      />
      <View style={styles.grid}>
        {(['travellerNo', 'woNo', 'pass', 'machineId', 'ccCode', 'heatId', 'inputKg', 'outputKg', 'reworkKg', 'rejectKg'] as const).map((k) => (
          <View key={k} style={styles.field}>
            <Text style={styles.label}>{k}</Text>
            <TextInput value={trav[k]} onChangeText={(v) => setTrav({ ...trav, [k]: v })} style={styles.input} placeholder={trav[k] === '' ? 'enter…' : undefined} />
          </View>
        ))}
      </View>
      <Pressable style={styles.btn} onPress={submitTraveller}>
        <Text style={styles.btnT}>Validate & queue (offline-safe mock)</Text>
      </Pressable>
      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  link: { color: tokens.color.primary, fontWeight: '700' },
  h: { fontWeight: '700', color: tokens.color.text, marginTop: 16, marginBottom: 8 },
  big: { fontSize: 16, color: tokens.color.text, backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: tokens.color.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  field: { minWidth: 150, flex: 1 },
  label: { fontSize: 11, fontWeight: '700', color: tokens.color.text2, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: tokens.color.border, borderRadius: 10, padding: 14, backgroundColor: '#fff', fontSize: 16 },
  btn: { backgroundColor: tokens.color.primary, borderRadius: 10, padding: 14, marginTop: 12, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '700' },
  msg: { marginTop: 8, color: tokens.color.text },
});
