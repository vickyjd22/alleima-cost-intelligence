import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle } from 'react-native-svg';
import { Icon, type IconName } from './Icon';
import {
  fontStack,
  minTouch,
  palette,
  radius,
  shadowCard,
  spacing,
  toneColors,
  type,
} from '../theme/tokens';

type Tone = 'neutral' | 'ok' | 'warn' | 'error' | 'info' | 'accent';

/* ------------------------------------------------------------------ Card -- */

export function Card({
  children,
  style,
  padded = true,
  tone,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  tone?: 'default' | 'muted' | 'tint';
}) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.cardPadded,
        tone === 'muted' && { backgroundColor: palette.cardMuted },
        tone === 'tint' && { backgroundColor: palette.tintSoft, borderColor: palette.tintBorder },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* -------------------------------------------------------- Section header -- */

export function SectionHeader({
  eyebrow,
  title,
  description,
  right,
  style,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionText}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        {description ? <Text style={styles.sectionDesc}>{description}</Text> : null}
      </View>
      {right ? <View style={styles.sectionRight}>{right}</View> : null}
    </View>
  );
}

/* ---------------------------------------------------------------- Button -- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  loading,
  fullWidth,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const tone = BUTTON_TONES[variant];
  const dims = BUTTON_SIZES[size];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!(disabled || loading) }}
      style={[
        styles.btn,
        dims.box,
        { backgroundColor: tone.bg, borderColor: tone.border, opacity: disabled ? 0.45 : 1 },
        hover && !disabled ? { backgroundColor: tone.hover, borderColor: tone.hoverBorder } : null,
        pressed && !disabled ? { transform: [{ translateY: 1 }] } : null,
        fullWidth ? { alignSelf: 'stretch' } : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : icon ? (
        <Icon name={icon} size={dims.icon} color={tone.fg} strokeWidth={2} />
      ) : null}
      <Text style={[styles.btnLabel, { color: tone.fg, fontSize: dims.fontSize }]} numberOfLines={1}>
        {label}
      </Text>
      {iconRight ? <Icon name={iconRight} size={dims.icon} color={tone.fg} strokeWidth={2} /> : null}
    </Pressable>
  );
}

const BUTTON_TONES: Record<ButtonVariant, { bg: string; fg: string; border: string; hover: string; hoverBorder: string }> = {
  primary: { bg: palette.tint, fg: '#FFFFFF', border: palette.tint, hover: palette.tintPressed, hoverBorder: palette.tintPressed },
  secondary: { bg: palette.card, fg: palette.text, border: palette.borderStrong, hover: palette.cardMuted, hoverBorder: palette.borderStrong },
  ghost: { bg: 'transparent', fg: palette.text2, border: 'transparent', hover: palette.filled, hoverBorder: 'transparent' },
  danger: { bg: palette.error, fg: '#FFFFFF', border: palette.error, hover: '#B42318', hoverBorder: '#B42318' },
  success: { bg: palette.success, fg: '#FFFFFF', border: palette.success, hover: '#067647', hoverBorder: '#067647' },
};

const BUTTON_SIZES: Record<ButtonSize, { box: ViewStyle; fontSize: number; icon: number }> = {
  sm: { box: { minHeight: 34, paddingHorizontal: 12, borderRadius: radius.sm, gap: 6 }, fontSize: 12.5, icon: 15 },
  md: { box: { minHeight: minTouch, paddingHorizontal: 16, borderRadius: radius.button, gap: 8 }, fontSize: 13.5, icon: 17 },
  lg: { box: { minHeight: 50, paddingHorizontal: 20, borderRadius: radius.md, gap: 9 }, fontSize: 15, icon: 19 },
};

/* ------------------------------------------------------------ IconButton -- */

export function IconButton({
  icon,
  label,
  onPress,
  tone = 'default',
  size = 38,
  iconSize = 18,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  tone?: 'default' | 'tint' | 'inverse';
  size?: number;
  iconSize?: number;
}) {
  const [hover, setHover] = useState(false);
  const bg = tone === 'inverse' ? 'rgba(255,255,255,0.10)' : tone === 'tint' ? palette.tintSoft : palette.filled;
  const fg = tone === 'inverse' ? palette.sidebarText : tone === 'tint' ? palette.tint : palette.text2;
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.iconBtn,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        hover ? { opacity: 0.8 } : null,
      ]}
    >
      <Icon name={icon} size={iconSize} color={fg} strokeWidth={1.9} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Tabs -- */

export function Tabs({
  tabs,
  value,
  onChange,
  style,
}: {
  tabs: readonly string[];
  value: string;
  onChange: (next: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.tabsTrack}
    >
      {tabs.map((t) => {
        const active = t === value;
        return (
          <Pressable
            key={t}
            onPress={() => onChange(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, { color: active ? palette.text : palette.text2 }]} numberOfLines={1}>
              {t}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ------------------------------------------------------------- EmptyState -- */

export function EmptyState({
  icon = 'packageSearch',
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={26} color={palette.tint} strokeWidth={1.6} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDesc}>{description}</Text> : null}
      {action ? <View style={{ marginTop: 12 }}>{action}</View> : null}
    </View>
  );
}

/* --------------------------------------------------------------- Progress -- */

export function ProgressBar({ value, tone = 'tint', height = 8 }: { value: number; tone?: 'tint' | 'accent' | 'warn' | 'error' | 'success'; height?: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const color =
    tone === 'accent' ? palette.accent : tone === 'warn' ? palette.warning : tone === 'error' ? palette.error : tone === 'success' ? palette.success : palette.tint;
  return (
    <View style={[styles.progressTrack, { height, borderRadius: height / 2 }]}>
      <View style={{ width: `${pct}%`, height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

export function ProgressRing({
  value,
  size = 68,
  stroke = 7,
  color = palette.tint,
  track = palette.border,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

/* ---------------------------------------------------------------- Callout -- */

const CALLOUT_ICON: Record<Tone, IconName> = {
  neutral: 'info',
  ok: 'checkCircle',
  warn: 'triangleAlert',
  error: 'alertCircle',
  info: 'info',
  accent: 'sparkles',
};

export function Callout({
  tone = 'info',
  title,
  children,
  action,
  compact,
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  const c = toneColors(tone);
  return (
    <View style={[styles.callout, { backgroundColor: c.bg, borderColor: c.border }, compact && { paddingVertical: 10 }]}>
      <Icon name={CALLOUT_ICON[tone]} size={18} color={c.fg} strokeWidth={1.9} />
      <View style={{ flex: 1, gap: 2 }}>
        {title ? <Text style={[styles.calloutTitle, { color: c.fg }]}>{title}</Text> : null}
        {typeof children === 'string' ? <Text style={styles.calloutBody}>{children}</Text> : children}
      </View>
      {action}
    </View>
  );
}

/* ---------------------------------------------------------------- Avatar -- */

export function Avatar({ name, size = 36, tone = 'tint' }: { name?: string | null; size?: number; tone?: 'tint' | 'dark' }) {
  const initials = (name ?? 'U')
    .split(/[.\s@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tone === 'dark' ? 'rgba(255,255,255,0.12)' : palette.tint,
        },
      ]}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: Math.round(size * 0.36), fontFamily: fontStack }}>{initials || 'U'}</Text>
    </View>
  );
}

/* ------------------------------------------------------------ Delta pill -- */

export function DeltaPill({ value, tone, label }: { value: string; tone: 'up' | 'down' | 'flat'; label?: string }) {
  const positive = tone === 'up';
  const negative = tone === 'down';
  const fg = positive ? palette.success : negative ? palette.error : palette.text2;
  const bg = positive ? palette.successSoft : negative ? palette.errorSoft : palette.filled;
  return (
    <View style={[styles.delta, { backgroundColor: bg }]}>
      <Icon name={positive ? 'arrowUpRight' : negative ? 'arrowDownRight' : 'arrowRight'} size={12} color={fg} strokeWidth={2.4} />
      <Text style={[styles.deltaT, { color: fg }]}>
        {value}
        {label ? <Text style={{ color: fg, fontWeight: '500' }}> {label}</Text> : null}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------- Spark bars -- */

export function SparkBars({ values, tone = 'tint', height = 34 }: { values: number[]; tone?: 'tint' | 'accent' | 'warn'; height?: number }) {
  const max = Math.max(...values, 1);
  const color = tone === 'accent' ? palette.accent : tone === 'warn' ? palette.warning : palette.tint;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height }}>
      {values.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: Math.max(4, (v / max) * height),
            borderRadius: 3,
            backgroundColor: color,
            opacity: 0.35 + (i / Math.max(values.length - 1, 1)) * 0.65,
          }}
        />
      ))}
    </View>
  );
}

/* --------------------------------------------------------------- Brand mark -- */

export function BrandMark({ size = 36, showWordmark = true, subtitle }: { size?: number; showWordmark?: boolean; subtitle?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LinearGradient
        colors={['#3B82F6', '#2563EB', '#0D9488']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size * 0.28, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.46, fontFamily: fontStack, letterSpacing: -0.5 }}>A</Text>
      </LinearGradient>
      {showWordmark ? (
        <View>
          <Text style={{ color: palette.sidebarText, fontSize: 15.5, fontWeight: '700', fontFamily: fontStack, letterSpacing: -0.2 }}>Alleima</Text>
          <Text style={{ color: palette.sidebarMuted, fontSize: 10.5, fontWeight: '500', fontFamily: fontStack, letterSpacing: 0.5 }}>
            {subtitle ?? 'COST INTELLIGENCE'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ styles -- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadowCard,
  } as ViewStyle,
  cardPadded: { padding: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  sectionText: { flex: 1, minWidth: 180, gap: 3 },
  eyebrow: { ...type.caption2, color: palette.text3, fontFamily: fontStack } as never,
  sectionTitle: { ...type.title3, color: palette.text, fontFamily: fontStack } as never,
  sectionDesc: { ...type.subhead, color: palette.text2, fontFamily: fontStack } as never,
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 8 },
  btnLabel: { fontWeight: '600', fontFamily: fontStack, letterSpacing: -0.1 },
  iconBtn: { alignItems: 'center', justifyContent: 'center' },
  tabsTrack: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: palette.bgAlt, borderRadius: radius.md, padding: 4 },
  tab: { minHeight: 34, paddingHorizontal: 14, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  tabActive: { backgroundColor: palette.card, ...shadowCard } as ViewStyle,
  tabLabel: { ...type.footnote, fontWeight: '600', fontFamily: fontStack } as never,
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 44, paddingHorizontal: 24, gap: 6 },
  emptyIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { ...type.headline, color: palette.text, fontFamily: fontStack } as never,
  emptyDesc: { ...type.subhead, color: palette.text2, textAlign: 'center', maxWidth: 360, fontFamily: fontStack } as never,
  progressTrack: { width: '100%', backgroundColor: palette.bgAlt, overflow: 'hidden' },
  callout: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: radius.group, paddingHorizontal: 12, paddingVertical: 12 },
  calloutTitle: { ...type.footnote, fontWeight: '700', fontFamily: fontStack } as never,
  calloutBody: { ...type.footnote, color: palette.text2, fontFamily: fontStack } as never,
  avatar: { alignItems: 'center', justifyContent: 'center' },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  deltaT: { fontSize: 11.5, fontWeight: '700', fontFamily: fontStack },
});
