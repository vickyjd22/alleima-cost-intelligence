import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { DeltaPill, SparkBars } from './ui';
import { fontStack, palette, radius, shadowCard, type } from '../theme/tokens';

/**
 * KPI card: a single number with just enough context to act on. The icon
 * identifies the metric family; the delta and hint explain direction and
 * meaning without relying on colour alone.
 */
export function KpiCard({
  title,
  value,
  unit,
  status,
  hint,
  icon,
  delta,
  deltaTone,
  spark,
}: {
  title: string;
  value: string;
  unit?: string;
  status?: 'ok' | 'warn' | 'error';
  hint?: string;
  icon?: IconName;
  delta?: string;
  deltaTone?: 'up' | 'down' | 'flat';
  spark?: number[];
}) {
  const statusColor =
    status === 'ok' ? palette.success : status === 'warn' ? palette.warning : status === 'error' ? palette.error : null;
  return (
    <View style={styles.card} accessibilityRole="summary" accessibilityLabel={`${title}: ${value}${unit ? ` ${unit}` : ''}${hint ? `. ${hint}` : ''}`}>
      <View style={styles.top}>
        {icon ? (
          <View style={[styles.iconBadge, statusColor ? { backgroundColor: `${statusColor}14` } : null]}>
            <Icon name={icon} size={17} color={statusColor ?? palette.tint} strokeWidth={1.9} />
          </View>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {statusColor ? <View style={[styles.statusDot, { backgroundColor: statusColor }]} /> : null}
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {value}
          {unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>
      </View>

      <View style={styles.bottom}>
        <View style={{ flex: 1, gap: 6 }}>
          {delta ? <DeltaPill value={delta} tone={deltaTone ?? 'flat'} /> : null}
          {hint ? <Text style={styles.hint} numberOfLines={2}>{hint}</Text> : null}
        </View>
        {spark && spark.length > 1 ? (
          <View style={{ width: 74 }}>
            <SparkBars values={spark} height={30} tone={status === 'error' ? 'warn' : status === 'warn' ? 'warn' : 'tint'} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    minWidth: 168,
    flex: 1,
    gap: 10,
    ...shadowCard,
  } as never,
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBadge: { width: 30, height: 30, borderRadius: 9, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.footnote, color: palette.text2, fontWeight: '600', flex: 1, fontFamily: fontStack } as never,
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline' },
  value: { ...type.title1, color: palette.text, fontVariant: ['tabular-nums'], fontFamily: fontStack } as never,
  unit: { ...type.subhead, fontWeight: '500', color: palette.text3 } as never,
  bottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  hint: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
});
