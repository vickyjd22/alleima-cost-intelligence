import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { DetailDrawer, KeyVal } from '../../src/components/DetailDrawer';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { Callout } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { palette } from '../../src/theme/tokens';
import { reconcileSopic, pcBridge } from '../../src/lib/reconciliation';
import { demoDb } from '../../src/mocks/demo';
import { SAMPLE_PROFIT_CENTRES, KNOWN_PCS } from '../../src/data/sample';

export default function ProfitCentres() {
  const { roles } = useSession();
  const loading = useMockLoading();
  const [sel, setSel] = useState<(typeof SAMPLE_PROFIT_CENTRES)[number] | null>(null);
  const rec = reconcileSopic(demoDb.sopic, KNOWN_PCS);
  const bridge = pcBridge(rec.matched);

  return (
    <AppShell roles={roles}>
      <PageHeader title="Profit Centres" sub="Entity 8911 · 514-interim postings require auditable reallocation" />
      {loading ? (
        <Skeleton />
      ) : (
        <View>
          <DataTable
            columns={[
              { key: 'code', header: 'PC', render: (r) => <Text>{r.code}</Text> },
              { key: 'entity', header: 'Entity', render: (r) => <Text>{r.entity}</Text> },
              { key: 'desc', header: 'Description', width: 240, render: (r) => <Text>{r.desc}</Text> },
              { key: 'v', header: 'SAMPLE value ₹', render: (r) => <Text>{String(bridge[r.code]?.value ?? 0)}</Text> },
              { key: 's', header: 'Status', render: (r) => <StatusChip label={r.code === '514' ? 'interim-watch' : 'active'} tone={r.code === '514' ? 'warn' : 'ok'} /> },
              { key: 'o', header: '', width: 90, render: (r) => <Text style={{ color: palette.tint, fontWeight: '700' }} onPress={() => setSel(r)}>Open</Text> },
            ]}
            rows={SAMPLE_PROFIT_CENTRES.map((r) => ({ ...r, id: r.code }))}
          />
          <View style={{ marginTop: 12 }}>
            <Callout tone="neutral" compact>Post to the correct profit centre at source. Manual 514 → 513/517 journals must carry a source reference, reason and maker/checker.</Callout>
          </View>
        </View>
      )}
      <DetailDrawer visible={sel !== null} title={sel ? `PC ${sel.code}` : ''} onClose={() => setSel(null)}>
        <KeyVal k="Entity" v={sel?.entity ?? ''} />
        <KeyVal k="SAMPLE matched value" v={`₹${bridge[sel?.code ?? '']?.value ?? 0}`} />
        <KeyVal k="Reallocations" v={sel?.code === '514' ? 'INV-1001 → 517 pending approval (mock)' : 'none open'} />
        <KeyVal k="FS bridge" v="Product-account mapping · PRManager TBD flag (SAMPLE)" />
      </DetailDrawer>
    </AppShell>
  );
}
