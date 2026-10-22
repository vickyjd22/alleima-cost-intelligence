/**
 * Apple HIG-aligned design tokens (light theme only — Dark Mode is out of scope).
 * - Tint: system blue; grouped backgrounds; semantic label/separator colors.
 * - Type scale follows SF Pro roles (largeTitle … caption2) with web fallback stack.
 * - Touch targets: min 44pt (see `hitSlop` / `minTouch`).
 * Backwards-compatible `tokens` export (light values) is kept so existing
 * screens keep working; new/updated components should use `useAppleTheme()`.
 */

export const fontStack =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Inter, Roboto, sans-serif";

export const appleLight = {
  tint: '#007AFF',
  tintPressed: '#0062CC',
  accent: '#5AC8FA',
  bg: '#F2F2F7', // systemGroupedBackground
  card: '#FFFFFF', // secondarySystemGroupedBackground
  filled: 'rgba(120,120,128,0.12)', // systemFill / search field
  text: '#000000', // label
  text2: 'rgba(60,60,67,0.6)', // secondaryLabel
  text3: 'rgba(60,60,67,0.3)', // tertiaryLabel
  border: '#E5E5EA', // separator (opaque equivalent)
  separator: 'rgba(60,60,67,0.12)',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  dark: '#1C1C1E',
  tabBar: 'rgba(249,249,249,0.94)', // translucent tab bar / sidebar
  headerBg: 'rgba(242,242,247,0.94)',
} as const;

export type ApplePalette = typeof appleLight;

/** Light-only palette hook (Dark Mode out of scope). Kept as a hook so callers stay unchanged. */
export function useAppleTheme(): { palette: ApplePalette } {
  return { palette: appleLight };
}

/** HIG type roles (pt). Use `weight` per role; Dynamic Type scales via `allowFontScaling` default. */
export const type = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, lineHeight: 41 },
  title1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  title2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  title3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 24 },
  headline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 17, fontWeight: '400' as const, lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: '400' as const, lineHeight: 21 },
  subhead: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption1: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: '600' as const, lineHeight: 13 },
  tabLabel: { fontSize: 10, fontWeight: '500' as const, lineHeight: 12 },
} as const;

export const radius = { sheet: 16, card: 12, group: 10, input: 10, button: 10, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Minimum accessible touch target (HIG: 44×44 pt). */
export const minTouch = 44;

/** Subtle iOS-style card shadow (use sparingly — deference). */
export const shadowCard = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

/** Backwards-compatible export (light values + legacy keys). */
export const tokens = {
  color: {
    primary: appleLight.tint,
    primaryPressed: appleLight.tintPressed,
    accent: appleLight.accent,
    bg: appleLight.bg,
    card: appleLight.card,
    text: appleLight.text,
    text2: appleLight.text2,
    border: appleLight.border,
    success: appleLight.success,
    warning: appleLight.warning,
    error: appleLight.error,
    dark: appleLight.dark,
  },
  radius: { card: radius.card, input: radius.input, button: radius.button },
  spacing,
  fontStack,
  minTouch,
} as const;

export type Tokens = typeof tokens;
