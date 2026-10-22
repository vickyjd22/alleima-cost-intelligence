import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { useSession } from '../../src/store/session';
import { audit } from '../../src/lib/audit';
import { demoDb } from '../../src/mocks/demo';
import { tokens } from '../../src/theme/tokens';

export default function Planning() {
  const { roles, email } = useSession();
  const toast = useToast();
  const loading = useMockLoading();

  function release(id: string): void {
    audit(email ?? 'demo', 'plan.release', `${id} → WO created (mock)`);
    toast.show(`${id} released — WO created with material reservation (mock).`);
  }

  return (
    <AppShell roles={roles}>
      <PageHeader title="Production Planning" sub="Plan → WO release → material reservation (SAMPLE)" />
      {loading ? (
        <Skeleton />
      ) : (
        <View>
          <DataTable
            columns={[
              { key: 'p', header: 'Plan', render: (r) => <Text>{r.id}</Text> },
              { key: 'f', header: 'Flow', render: (r) => <Text>{r.flow}</Text> },
              { key: 'q', header: 'Qty (t)', render: (r) => <Text>{String(r.qty)}</Text> },
              { key: 's', header: 'State', render: (r) => <StatusChip label={r.state} tone="info" /> },
              { key: 'a', header: '', render: (r) => <Pressable onPress={() => release(r.id)}><Text style={{ color: tokens.color.primary, fontWeight: '700' }}>Release</Text></Pressable> },
            ]}
            rows={demoDb.plans}
          />
          <Text style={{ color: tokens.color.text2, fontSize: 12, marginTop: 8 }}>Release creates a WO + reservation lines (mock) — see Work Orders.</Text>
        </View>
      )}
    </AppShell>
  );
}
