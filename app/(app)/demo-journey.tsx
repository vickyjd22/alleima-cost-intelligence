import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { PageHeader } from '../../src/components/PageHeader';
import { DemoBanner } from '../../src/components/DemoBanner';
import { Skeleton, useMockLoading } from '../../src/components/Skeleton';
import { StatusChip } from '../../src/components/StatusChip';
import { Icon, type IconName } from '../../src/components/Icon';
import { useToast } from '../../src/components/Toast';
import { Button, Callout, Card, ProgressRing, SectionHeader } from '../../src/components/ui';
import { useSession } from '../../src/store/session';
import { JOURNEY } from '../../src/mocks/costingDemo';
import { fontStack, palette, radius, type } from '../../src/theme/tokens';

export default function DemoJourney() {
  const { roles } = useSession();
  const router = useRouter();
  const toast = useToast();
  const loading = useMockLoading();
  const { width } = useWindowDimensions();
  const twoCol = width >= 980;

  const [done, setDone] = useState<number[]>([]);
  // The "active" step is the first not-yet-done step.
  const activeN = JOURNEY.find((s) => !done.includes(s.n))?.n ?? JOURNEY.length;
  const active = JOURNEY.find((s) => s.n === activeN) ?? JOURNEY[JOURNEY.length - 1]!;
  const progress = Math.round((done.length / JOURNEY.length) * 100);

  function open(route: string): void { router.push(route as never); }
  function markDone(n: number): void {
    setDone((d) => (d.includes(n) ? d : [...d, n]));
  }
  function openAndAdvance(): void {
    open(active.route);
    markDone(active.n);
    toast.show(`Step ${active.n}: ${active.title} — opened. Marked reviewed.`);
  }
  function reset(): void { setDone([]); toast.show('Journey reset.'); }

  return (
    <AppShell roles={roles}>
      <PageHeader
        eyebrow="Client demo"
        title="Guided Journey"
        sub="Walk the full costing story end to end — 14 steps, each opening a live module. SAMPLE data."
        right={<Button label="Reset" variant="ghost" icon="refresh" onPress={reset} disabled={done.length === 0} />}
      />
      <DemoBanner />

      {loading ? (
        <Skeleton lines={6} />
      ) : (
        <View style={{ gap: 16 }}>
          {/* Progress + next-step control */}
          <Card style={styles.hero}>
            <ProgressRing value={progress} size={88} stroke={9} color={progress === 100 ? palette.success : palette.tint}>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.ringN}>{done.length}</Text>
                <Text style={styles.ringOf}>of {JOURNEY.length}</Text>
              </View>
            </ProgressRing>
            <View style={{ flex: 1, minWidth: 200, gap: 8 }}>
              {progress === 100 ? (
                <>
                  <Text style={styles.heroT}>Journey complete</Text>
                  <Text style={styles.sub}>Every step reviewed. End on the Executive Dashboard to tie the numbers together.</Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <Button label="Open Executive Dashboard" icon="layoutDashboard" onPress={() => open('/(app)/dashboard')} />
                    <Button label="Restart" variant="secondary" icon="refresh" onPress={reset} />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.nextLabel}>NEXT STEP · {active.n} OF {JOURNEY.length}</Text>
                  <Text style={styles.heroT}>{active.title}</Text>
                  <Text style={styles.sub}>{active.show}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <Button label={`Open step ${active.n}`} icon={active.icon as IconName} iconRight="arrowRight" onPress={openAndAdvance} />
                    <Button label="Skip" variant="ghost" onPress={() => markDone(active.n)} />
                  </View>
                </>
              )}
            </View>
          </Card>

          <SectionHeader title="All 14 steps" description="Open any step directly, or follow them in order. Carry one product through the whole flow." />

          {/* Step list */}
          <View style={[styles.grid, twoCol && { flexDirection: 'row', flexWrap: 'wrap' }]}>
            {JOURNEY.map((s) => {
              const isDone = done.includes(s.n);
              const isActive = s.n === activeN && progress !== 100;
              return (
                <Card key={s.n} style={[styles.step, twoCol && { width: '48.8%' }, isActive && { borderColor: palette.tint }, isDone && { backgroundColor: palette.successSoft, borderColor: palette.successBorder }]}>
                  <View style={styles.stepTop}>
                    <View style={[styles.stepIcon, isDone && { backgroundColor: '#fff' }]}>
                      <Icon name={isDone ? 'check' : (s.icon as IconName)} size={16} color={isDone ? palette.success : palette.tint} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.stepN}>STEP {s.n}</Text>
                      <Text style={styles.stepTitle} numberOfLines={1}>{s.title}</Text>
                    </View>
                    {isDone ? <StatusChip label="Reviewed" tone="ok" /> : isActive ? <StatusChip label="Next" tone="info" /> : null}
                  </View>
                  <Text style={styles.stepShow} numberOfLines={2}>{s.show}</Text>
                  <View style={styles.stepFoot}>
                    <View style={styles.outputChip}>
                      <Icon name="arrowRight" size={11} color={palette.text3} />
                      <Text style={styles.outputT} numberOfLines={1}>{s.output}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Button label="Open" variant="secondary" size="sm" icon="arrowUpRight" onPress={() => open(s.route)} />
                      <Button label={isDone ? 'Done' : 'Mark'} variant={isDone ? 'ghost' : 'primary'} size="sm" icon={isDone ? 'check' : undefined} disabled={isDone} onPress={() => markDone(s.n)} />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>

          <Callout tone="info" title="How to run this for the client">
            Use “Open step” to jump straight to each live module in order. Keep the same product (clone one in step 1) as the subject throughout, so the client sees cause → effect: BOM cost → standard cost → work order → actuals → variance → margin → close → dashboard.
          </Callout>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 20, flexWrap: 'wrap' },
  ringN: { fontSize: 24, fontWeight: '800', color: palette.text, fontFamily: fontStack },
  ringOf: { fontSize: 10, color: palette.text3, fontFamily: fontStack },
  nextLabel: { ...type.caption2, color: palette.tint, letterSpacing: 1, fontFamily: fontStack } as never,
  heroT: { ...type.title3, color: palette.text, fontFamily: fontStack } as never,
  sub: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
  grid: { gap: 10 },
  step: { gap: 8, padding: 14 },
  stepTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  stepN: { ...type.caption2, color: palette.text3, letterSpacing: 0.8, fontFamily: fontStack } as never,
  stepTitle: { ...type.footnote, fontWeight: '700', color: palette.text, fontFamily: fontStack } as never,
  stepShow: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
  stepFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginTop: 2 },
  outputChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: palette.bgAlt, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4, flexShrink: 1 },
  outputT: { ...type.caption2, color: palette.text2, fontFamily: fontStack, flexShrink: 1 } as never,
});
