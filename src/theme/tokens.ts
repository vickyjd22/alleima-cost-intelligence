/**
 * Alleima Cost Intelligence — production design system.
 *
 * Direction: calm, high-contrast "operator console" clarity for a finance and
 * manufacturing audience. A deep steel-navy navigation rail frames a bright,
 * airy canvas. One confident blue carries interaction; teal marks intelligence;
 * amber/red are reserved for cost, risk and exceptions.
 *
 * The `appleLight`/`useAppleTheme` names are kept for backwards compatibility
 * with existing screens — values now map to the production palette below.
 */

export const fontStack =
  "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const monoStack =
  "'SFMono-Regular', ui-monospace, 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace";

export const palette = {
  /* Brand + interaction */
  tint: '#2563EB',
  tintPressed: '#1D4ED8',
  tintSoft: '#EAF1FF',
  tintBorder: '#C7D9FF',
  accent: '#0D9488',
  accentSoft: '#E6FBF7',
  accentBorder: '#B6EFE7',

  /* Surfaces */
  bg: '#F4F6FA',
  bgAlt: '#EDF1F7',
  card: '#FFFFFF',
  cardMuted: '#F8FAFC',
  filled: '#F1F5F9',
  overlay: 'rgba(10, 20, 38, 0.48)',

  /* Type */
  text: '#101828',
  text2: '#475467',
  text3: '#98A2B3',
  textInverse: '#FFFFFF',

  /* Lines */
  border: '#E4E9F2',
  borderStrong: '#D3DBE8',
  separator: '#EDF1F7',

  /* Semantics */
  success: '#079455',
  successSoft: '#E9FBF2',
  successBorder: '#B7EBCF',
  warning: '#DC6803',
  warningSoft: '#FFF6E8',
  warningBorder: '#FBDBA7',
  error: '#D92D20',
  errorSoft: '#FEF0EF',
  errorBorder: '#F9C6C2',
  info: '#1570EF',
  infoSoft: '#EFF8FF',
  infoBorder: '#C6E0FF',

  /* Navigation rail */
  sidebar: '#0A1B33',
  sidebarDeep: '#071427',
  sidebarElevated: '#12294A',
  sidebarText: '#E7EEF9',
  sidebarMuted: '#8FA6C4',
  sidebarBorder: 'rgba(255, 255, 255, 0.08)',
  sidebarActive: 'rgba(255, 255, 255, 0.10)',
  sidebarActiveBorder: 'rgba(255, 255, 255, 0.16)',
  sidebarGlow: 'rgba(37, 99, 235, 0.35)',

  /* Legacy keys retained */
  dark: '#0A1B33',
  tabBar: 'rgba(255, 255, 255, 0.94)',
  headerBg: 'rgba(244, 246, 250, 0.92)',
} as const;

export type Palette = typeof palette;

/** Backwards-compatible palette alias (screens still call `useAppleTheme`). */
export const appleLight = palette;
export type ApplePalette = Palette;

/** Light-only palette hook. Kept as a hook so callers stay unchanged. */
export function useAppleTheme(): { palette: Palette } {
  return { palette };
}

/** Type scale (px). Tight headings, comfortable body, tabular numerics. */
export const type = {
  display: { fontSize: 40, fontWeight: '700' as const, lineHeight: 46, letterSpacing: -0.8 },
  largeTitle: { fontSize: 34, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.6 },
  title1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.5 },
  title2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.3 },
  title3: { fontSize: 19, fontWeight: '600' as const, lineHeight: 25, letterSpacing: -0.2 },
  headline: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  callout: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  subhead: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  footnote: { fontSize: 12, fontWeight: '400' as const, lineHeight: 17 },
  caption1: { fontSize: 11.5, fontWeight: '500' as const, lineHeight: 16 },
  caption2: { fontSize: 10.5, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.5 },
  tabLabel: { fontSize: 10.5, fontWeight: '600' as const, lineHeight: 13 },
} as const;

export const radius = {
  sheet: 20,
  xl: 20,
  card: 16,
  lg: 14,
  group: 12,
  md: 12,
  input: 11,
  button: 11,
  sm: 9,
  pill: 999,
} as const;

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

/** Minimum accessible touch target. */
export const minTouch = 44;

export const shadowCard = {
  shadowColor: '#0A1B33',
  shadowOpacity: 0.05,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;

export const shadowPop = {
  shadowColor: '#0A1B33',
  shadowOpacity: 0.14,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 12 },
  elevation: 10,
} as const;

export const shadowSidebar = {
  shadowColor: '#0A1B33',
  shadowOpacity: 0.18,
  shadowRadius: 24,
  shadowOffset: { width: 6, height: 0 },
  elevation: 12,
} as const;

/** Backwards-compatible legacy export. */
export const tokens = {
  color: {
    primary: palette.tint,
    primaryPressed: palette.tintPressed,
    accent: palette.accent,
    bg: palette.bg,
    card: palette.card,
    text: palette.text,
    text2: palette.text2,
    text3: palette.text3,
    border: palette.border,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    dark: palette.dark,
  },
  radius: { card: radius.card, input: radius.input, button: radius.button },
  spacing,
  fontStack,
  monoStack,
  minTouch,
} as const;

export type Tokens = typeof tokens;

/** Soft tinted surfaces for status chips/callouts. */
export function toneColors(tone: 'neutral' | 'ok' | 'warn' | 'error' | 'info' | 'accent') {
  switch (tone) {
    case 'ok':
      return { fg: palette.success, bg: palette.successSoft, border: palette.successBorder };
    case 'warn':
      return { fg: palette.warning, bg: palette.warningSoft, border: palette.warningBorder };
    case 'error':
      return { fg: palette.error, bg: palette.errorSoft, border: palette.errorBorder };
    case 'info':
      return { fg: palette.info, bg: palette.infoSoft, border: palette.infoBorder };
    case 'accent':
      return { fg: palette.accent, bg: palette.accentSoft, border: palette.accentBorder };
    default:
      return { fg: palette.text2, bg: palette.filled, border: palette.border };
  }
}
