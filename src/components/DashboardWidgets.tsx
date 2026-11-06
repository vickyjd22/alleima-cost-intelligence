import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Svg, Circle, Defs, LinearGradient, Line, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { Icon, type IconName } from './Icon';
import { Avatar } from './ui';
import { elevation, fontStack, palette, radius, type } from '../theme/tokens';

type Hover = { pressed: boolean; hovered?: boolean };

/** Avatar tints used for people (matches the varied avatars in the reference). */
export const PERSON_COLORS = [palette.tint, palette.accent, palette.purple, palette.pink, palette.warning, palette.success];
export const personColor = (name: string): string => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PERSON_COLORS[h % PERSON_COLORS.length]!;
};

/* ------------------------------------------------------------------ Card -- */

/**
 * White elevated dashboard card. `wash` adds the pale-mint corner shape seen on
 * the reference KPI / timer cards.
 */
export function DashCard({
  children,
  style,
  wash,
  onPress,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  wash?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const body = (
    <>
      {wash ? (
        <>
          <View pointerEvents="none" style={styles.washA} />
          <View pointerEvents="none" style={styles.washB} />
        </>
      ) : null}
      {children}
    </>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ hovered }: Hover) => [styles.card, hovered && ({ transform: [{ translateY: -2 }] } as never), style]}
      >
        {body}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{body}</View>;
}

export function CardTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.titleRow}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

/* ---------------------------------------------------------------- Metric -- */

export function MetricTile({
  icon,
  label,
  value,
  sub,
  subTone = 'muted',
  onPress,
  children,
}: {
  icon: IconName;
  label: string;
  value: string;
  sub?: string;
  subTone?: 'muted' | 'success' | 'warning' | 'error';
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  const subColor = subTone === 'success' ? palette.success : subTone === 'warning' ? palette.warning : subTone === 'error' ? palette.error : palette.text2;
  return (
    <DashCard wash onPress={onPress} accessibilityLabel={`${label}: ${value}`} style={styles.metric}>
      <View style={styles.metricHead}>
        <View style={styles.metricIcon}>
          <Icon name={icon} size={18} color={palette.tint} strokeWidth={1.9} />
        </View>
        <Text style={styles.metricLabel} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={styles.metricValue} numberOfLines={1}>{value}</Text>
      {children}
      {sub ? <Text style={[styles.metricSub, { color: subColor }]} numberOfLines={2}>{sub}</Text> : null}
    </DashCard>
  );
}

export function AvatarGroup({ names, max = 4 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <View style={styles.avatarGroup} accessibilityLabel={`${names.length} people`}>
      {shown.map((n, i) => (
        <View key={n + i} style={[styles.avatarRing, i > 0 && { marginLeft: -6 }]}>
          <Avatar name={n} size={30} color={personColor(n)} />
        </View>
      ))}
      {extra > 0 ? (
        <View style={[styles.avatarRing, { marginLeft: -6 }]}>
          <View style={styles.more}><Text style={styles.moreT}>+{extra}</Text></View>
        </View>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------- Person row -- */

export function PersonRow({
  name,
  title,
  meta,
  link,
  time,
  onPress,
  last,
}: {
  name: string;
  title: string;
  meta?: string;
  link?: string;
  time?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${name}. ${title}`}
      style={({ hovered }: Hover) => [styles.person, !last && styles.personBorder, hovered && onPress ? { backgroundColor: palette.cardMuted } : null]}
    >
      <Avatar name={name} size={36} color={personColor(name)} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.personName} numberOfLines={1}>{name}</Text>
        <Text style={styles.personTitle} numberOfLines={1}>
          {title}
          {link ? <Text style={styles.personLink}> {link}</Text> : null}
        </Text>
        {meta || time ? <Text style={styles.personMeta} numberOfLines={1}>{[meta, time].filter(Boolean).join(' · ')}</Text> : null}
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Chart -- */

/** Catmull-Rom → cubic Bézier smoothing. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const TICKS = 5;
const niceMax = (v: number) => Math.ceil(v / 100) * 100;

/**
 * Combo chart: bars on the left axis, a smooth line (with soft area) on the
 * right axis. Redraws to fit its container width (no distortion on resize).
 */
export function ComboChart({
  labels,
  bars,
  line,
  barName,
  lineName,
  height = 250,
}: {
  labels: string[];
  bars: number[];
  line: number[];
  barName: string;
  lineName: string;
  height?: number;
}) {
  const [w, setW] = useState(560);
  const onLayout = (e: LayoutChangeEvent) => setW(Math.max(280, Math.floor(e.nativeEvent.layout.width)));

  const padL = 38, padR = 44, padT = 14, padB = 28;
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const n = Math.max(labels.length, 1);
  const slot = innerW / n;
  const barW = Math.min(34, slot * 0.5);

  const barMax = niceMax(Math.max(...bars, 1));
  const lMinRaw = Math.min(...line);
  const lMaxRaw = Math.max(...line);
  const lMin = Math.floor(lMinRaw - 1);
  const lMax = Math.ceil(lMaxRaw + 1);

  const yBar = (v: number) => padT + innerH - (v / barMax) * innerH;
  const yLine = (v: number) => padT + innerH - ((v - lMin) / Math.max(lMax - lMin, 1)) * innerH;
  const xAt = (i: number) => padL + slot * i + slot / 2;

  const pts = line.map((v, i) => ({ x: xAt(i), y: yLine(v) }));
  const linePath = smoothPath(pts);
  const areaPath = pts.length > 1 ? `${linePath} L ${pts[pts.length - 1]!.x} ${padT + innerH} L ${pts[0]!.x} ${padT + innerH} Z` : '';

  return (
    <View onLayout={onLayout} style={{ width: '100%' }}>
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: '#A8B6F6' }]} /><Text style={styles.legendT}>{barName}</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: palette.tint }]} /><Text style={styles.legendT}>{lineName}</Text></View>
      </View>
      <Svg width={w} height={height} accessibilityLabel={`${barName} and ${lineName} chart`}>
        <Defs>
          <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.success} stopOpacity="0.22" />
            <Stop offset="1" stopColor={palette.success} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* horizontal grid + both axes */}
        {Array.from({ length: TICKS + 1 }).map((_, i) => {
          const y = padT + (innerH / TICKS) * i;
          const bv = Math.round(barMax - (barMax / TICKS) * i);
          const lv = (lMax - ((lMax - lMin) / TICKS) * i).toFixed(1);
          return (
            <React.Fragment key={i}>
              <Line x1={padL} x2={padL + innerW} y1={y} y2={y} stroke={palette.border} strokeDasharray="3 4" strokeWidth={1} />
              <SvgText x={padL - 8} y={y + 3.5} fontSize={10.5} fill={palette.text3} textAnchor="end" fontFamily={fontStack}>{bv}</SvgText>
              <SvgText x={padL + innerW + 8} y={y + 3.5} fontSize={10.5} fill={palette.text3} textAnchor="start" fontFamily={fontStack}>{lv}</SvgText>
            </React.Fragment>
          );
        })}
        {/* vertical grid */}
        {labels.map((_, i) => (
          <Line key={`v${i}`} x1={padL + slot * i} x2={padL + slot * i} y1={padT} y2={padT + innerH} stroke={palette.separator} strokeDasharray="3 4" strokeWidth={1} />
        ))}
        <Line x1={padL + innerW} x2={padL + innerW} y1={padT} y2={padT + innerH} stroke={palette.separator} strokeDasharray="3 4" strokeWidth={1} />

        {/* bars */}
        {bars.map((v, i) => (
          <Rect key={`b${i}`} x={xAt(i) - barW / 2} y={yBar(v)} width={barW} height={Math.max(padT + innerH - yBar(v), 0)} rx={5} fill="#A8B6F6" />
        ))}

        {/* area + smooth line + points */}
        {areaPath ? <Path d={areaPath} fill="url(#areaFill)" /> : null}
        {linePath ? <Path d={linePath} fill="none" stroke={palette.success} strokeWidth={2} strokeLinecap="round" /> : null}
        {pts.map((p, i) => (
          <Circle key={`p${i}`} cx={p.x} cy={p.y} r={4} fill={palette.tint} stroke="#fff" strokeWidth={2} />
        ))}

        {/* x labels */}
        {labels.map((l, i) => (
          <SvgText key={`l${i}`} x={xAt(i)} y={height - 8} fontSize={11} fill={palette.text2} textAnchor="middle" fontFamily={fontStack}>{l}</SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    overflow: 'hidden',
    ...elevation[2],
  } as never,
  washA: { position: 'absolute', right: -50, bottom: -70, width: 220, height: 150, borderRadius: 110, backgroundColor: palette.mint, opacity: 0.75 },
  washB: { position: 'absolute', right: -90, bottom: -40, width: 200, height: 140, borderRadius: 100, backgroundColor: palette.cyan, opacity: 0.9 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  cardTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700', color: palette.text, fontFamily: fontStack, letterSpacing: -0.2 } as never,
  cardSub: { ...type.caption1, color: palette.text3, marginTop: 2, fontFamily: fontStack } as never,

  metric: { flex: 1, minWidth: 150, gap: 6, minHeight: 138, padding: 16 },
  metricHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metricIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { ...type.subhead, fontWeight: '500', color: palette.text2, fontFamily: fontStack, flex: 1 } as never,
  metricValue: { fontSize: 30, lineHeight: 36, fontWeight: '700', color: palette.text, fontFamily: fontStack, letterSpacing: -0.8, fontVariant: ['tabular-nums'] } as never,
  metricSub: { ...type.caption1, fontWeight: '600', fontFamily: fontStack, marginTop: 'auto' } as never,

  avatarGroup: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  avatarRing: { borderWidth: 2, borderColor: palette.card, borderRadius: 16 },
  more: { width: 30, height: 30, borderRadius: 15, backgroundColor: palette.filled, alignItems: 'center', justifyContent: 'center' },
  moreT: { fontSize: 10, fontWeight: '700', color: palette.text2, fontFamily: fontStack },

  person: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4, borderRadius: radius.sm, cursor: 'pointer' } as never,
  personBorder: { borderBottomWidth: 1, borderBottomColor: palette.separator },
  personName: { fontSize: 13, fontWeight: '600', color: palette.text, fontFamily: fontStack } as never,
  personTitle: { ...type.caption1, color: palette.text2, fontFamily: fontStack, marginTop: 1 } as never,
  personLink: { color: palette.tint, fontWeight: '600' },
  personMeta: { ...type.caption1, color: palette.text3, fontFamily: fontStack, marginTop: 2 } as never,

  legend: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 12, height: 8, borderRadius: 3 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendT: { ...type.caption1, color: palette.text2, fontFamily: fontStack } as never,
});
