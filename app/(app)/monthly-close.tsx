import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { PeriodSelector } from '../../src/components/Filters';
import { StatusChip } from '../../src/components/StatusChip';
import { ConfirmDialog } from '../../src/components/Feedback';
import { Icon } from '../../src/components/Icon';
import { useToast } from '../../src/components/Toast';
import { Button, Callout, Card, ProgressRing } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { CLOSE_STEPS_DEMO } from '../../src/mocks/costingDemo';
import { fontStack, palette, type } from '../../src/theme/tokens';

export default function MonthlyClose() {
  const { roles } = useSession();
  const router = useRouter();
  const toast = useToast();
  const loading = useMockLoading();
  const [done, setDone] = useState<string[]>(['rm', 'heat', 'prod', 'yield']);
  const [confirm, setConfirm] = useState(false);
  const [locked, setLocked] = useState(false);

  const total = CLOSE_STEPS_DEMO.length;
  const progress = Math.round((done.length / total) * 100);
  const allDone = done.length === total - (locked ? 0 : 1); // all but the lock step
  const nextIndex = CLOSE_STEPS_DEMO.findIndex((s) => !done.includes(s.id));

  function markDone(id: string): void {
    setDone((d) => (d.includes(id) ? d : [...d, id]));
    toast.show('Step signed off.');
  }

  return (
    <AppShell roles={roles}>
      <PageHeader eyebrow="Finance" title="Monthly Cost Close" sub="Checklist workflow with a progress tracker. SAMPLE data." right={<PeriodSelector />} />
      <DemoBanner />
      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 16 }}>
          <Card style={styles.progress}>
            <ProgressRing value={progress} size={82} stroke={8} color={locked ? palette.success : palette.tint}>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.ringN}>{done.length}</Text>
                <Text style={styles.ringOf}>of {total}</Text>
              </View>
            </ProgressRing>
            <View style={{ flex: 1, minWidth: 180 }}>
              <Text style={styles.progressT}>{locked ? 'Period locked' : `${progress}% complete`}</Text>
              <Text style={styles.sub}>{locked ? 'No further postings allowed (PER-01).' : 'Work each step in order, then lock the month.'}</Text>
            </View>
            {locked ? <StatusChip label="Locked" tone="ok" /> : null}
          </Card>

          {CLOSE_STEPS_DEMO.map((s, i) => {
            const isDone = done.includes(s.id);
            const isLock = s.id === 'close';
            const isNext = i === nextIndex;
            return (
              <Card key={s.id} style={[styles.step, isNext && !isDone && { borderColor: palette.tint }]}>
                <View style={[styles.stepIcon, isDone && { backgroundColor: palette.successSoft }]}>
                  <Icon name={isDone ? 'check' : isLock ? 'lock' : 'circle'} size={15} color={isDone ? palette.success : isLock ? palette.warning : palette.text3} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.stepName}>{i + 1}. {s.name}</Text>
                  <Text style={styles.sub}>{s.owner}</Text>
                </View>
                <View style={styles.stepActions}>
                  {!isLock ? <Button label="Open" variant="secondary" size="sm" icon="arrowUpRight" onPress={() => router.push(s.module as never)} /> : null}
                  {isLock
                    ? <Button label="Lock month" size="sm" icon="lock" disabled={!allDone || locked} onPress={() => setConfirm(true)} />
                    : <Button label={isDone ? 'Done' : 'Mark done'} variant={isDone ? 'ghost' : 'primary'} size="sm" icon={isDone ? 'check' : undefined} disabled={isDone} onPress={() => markDone(s.id)} />}
                </View>
              </Card>
            );
          })}

          {!allDone && !locked ? (
            <Callout tone="warn" title="Lock is gated">Complete all preceding steps before locking the period.</Callout>
          ) : null}
        </View>
      )}

      <ConfirmDialog
        visible={confirm}
        title="Lock the period?"
        message="Locking blocks all further postings for this period. Reopening requires Finance request + Management approval."
        confirmLabel="Lock month"
        onCancel={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); setDone((d) => [...new Set([...d, 'close'])]); setLocked(true); toast.show('Period locked (SAMPLE).'); }}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, flexWrap: 'wrap' },
  ringN: { fontSize: 22, fontWeight: '800', color: palette.text, fontFamily: fontStack },
  ringOf: { fontSize: 10, color: palette.text3, fontFamily: fontStack },
  progressT: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, flexWrap: 'wrap' },
  stepIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: palette.filled, alignItems: 'center', justifyContent: 'center' },
  stepName: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  stepActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
