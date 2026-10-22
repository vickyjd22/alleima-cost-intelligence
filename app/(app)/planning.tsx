import React from 'react';
import { View, Text } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DataTable } from '../../src/components/DataTable';
import { StatusChip } from '../../src/components/StatusChip';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { useToast } from '../../src/components/Toast';
import { Button, Callout } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { audit } from '../../src/lib/audit';
import { demoDb } from '../../src/mocks/demo';


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
              { key: 'a', header: '', width: 120, render: (r) => <Button label="Release" size="sm" variant="secondary" icon="arrowRight" onPress={() => release(r.id)} /> },
            ]}
            rows={demoDb.plans}
          />
          <View style={{ marginTop: 12 }}>
            <Callout tone="info" compact>Release creates a work order and reservation lines (mock) — continue in Work Orders.</Callout>
          </View>
        </View>
      )}
    </AppShell>
  );
}
