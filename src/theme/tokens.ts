/**
 * Alleima Cost Intelligence — production design system.
 *
 * Direction (per client reference dashboard): premium, minimal SaaS look.
 * Light grey canvas (#F1F3F3), white elevated cards, Primary Teal (#10A99F)
 * for actions and active navigation, pale mint/cyan decorative washes, soft
 * low-opacity shadows, Inter typography. White sidebar with a solid-teal
 * active item. Blue-violet (#5474E8) is the secondary data colour.
 *
 * IMPORTANT: token KEYS are a shared contract consumed across every screen and
 * component. Re-toning changes VALUES only; keys are preserved so no consumer
 * breaks. The `appleLight`/`useAppleTheme`/`tokens` names are kept for
 * backwards compatibility with existing screens.
 */

/**
 * Typeface. Alleima's brand face is "Neurial Grotesk" (a commercial modern
 * grotesque). We can't bundle the licensed font here, so we ship the closest
 * freely-licensable grotesques — Manrope for UI/body and Space Grotesk for
 * display headings — which echo Neurial's geometric, industrial character.
 * To use the licensed font later, drop the files in and replace the first
 * family name in each stack below; nothing else changes.
 */
export const fontStack =
  "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const displayFontStack =
  "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const monoStack =
  "'SFMono-Regular', ui-monospace, 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace";

export const palette = {
  /* Brand + interaction — Primary Teal carries all interaction */
  tint: '#10A99F',
  tintPressed: '#078F88',
  tintSoft: '#E4F7F5',
  tintBorder: '#BDE8E4',
  mint: '#DDF5EE',
  cyan: '#E8F7F7',
  /* Secondary data/accent: information blue-violet (charts, 2nd series) */
  accent: '#5474E8',
  accentSoft: '#EAEFFD',
  accentBorder: '#CBD6FA',

  /* Surfaces — light grey canvas, white elevated cards */
  bg: '#F1F3F3',
  bgAlt: '#E9EDED',
  card: '#FFFFFF',
  cardMuted: '#F7F9F9',
  filled: '#F1F4F4',
  overlay: 'rgba(25, 45, 55, 0.45)',

  /* Type */
  text: '#202936',
  text2: '#606873',
  text3: '#9299A1',
  textInverse: '#FFFFFF',

  /* Lines */
  border: '#E8ECEC',
  borderStrong: '#D5DBDB',
  separator: '#ECEFEF',

  /* Semantics */
  success: '#20A65A',
  successSoft: '#E6F6EC',
  successBorder: '#B5E4C7',
  warning: '#E6A23C',
  warningSoft: '#FDF4E3',
  warningBorder: '#F4D9A4',
  error: '#E45B65',
  errorSoft: '#FCEBEC',
  errorBorder: '#F5C3C7',
  info: '#5474E8',
  infoSoft: '#EAEFFD',
  infoBorder: '#CBD6FA',
  purple: '#8855E8',
  pink: '#D84E9B',

  /* Navigation — white sidebar (per reference); `sidebar` stays a dark ink
     colour so existing shadow / toast / dark-text uses remain legible. */
  sidebar: '#202936',
  sidebarSurface: '#FAFBFB',
  sidebarDeep: '#202936',
  sidebarElevated: '#FFFFFF',
  sidebarText: '#202936',
  sidebarMuted: '#606873',
  sidebarBorder: '#ECEFEF',
  sidebarActive: '#10A99F',
  sidebarActiveBorder: '#10A99F',
  sidebarGlow: 'rgba(16, 169, 159, 0.35)',

  /* Legacy keys retained */
  dark: '#202936',
  tabBar: 'rgba(255, 255, 255, 0.96)',
  headerBg: 'rgba(245, 246, 246, 0.94)',
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
  sheet: 24,
  xl: 24,
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
  shadowColor: '#192D37',
  shadowOpacity: 0.05,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;

export const shadowPop = {
  shadowColor: '#192D37',
  shadowOpacity: 0.14,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 12 },
  elevation: 10,
} as const;

export const shadowSidebar = {
  shadowColor: '#192D37',
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

/* -------------------------------------------------------------------------- */
/* Additional system tokens (Alleima revamp, Phase 3)                         */
/* Additive only — no existing key changed.                                   */
/* -------------------------------------------------------------------------- */

/** Visible focus indicator for keyboard navigation (web). */
export const focus = {
  color: palette.tint,
  ring: '#9ADBD5',
  width: 2,
  offset: 2,
} as const;

/** Transition durations (ms). Keep motion subtle and purposeful. */
export const motion = {
  fast: 120,
  base: 180,
  slow: 260,
} as const;

/** Z-index layers — one scale to avoid stacking conflicts. */
export const zIndex = {
  base: 0,
  sidebar: 20,
  header: 30,
  bottomNav: 40,
  dropdown: 50,
  overlay: 60,
  modal: 70,
  toast: 90,
} as const;

/** Page content containers (max readable widths, px). */
export const container = {
  narrow: 720,
  content: 1080,
  wide: 1320,
  full: 1560,
} as const;

/** Responsive breakpoints (px) — mirrors the values used in AppShell. */
export const breakpoints = {
  compact: 760,
  wide: 1024,
  roomy: 1320,
} as const;

/* -------------------------------------------------------------------------- */
/* Material / depth layer (UI refresh)                                        */
/* Additive only. Richer elevation, brand gradients and glass surfaces to make */
/* the app feel premium and "material", while keeping the Alleima palette.     */
/* -------------------------------------------------------------------------- */

/** Brand gradients (consumed by LinearGradient `colors`). */
export const gradient = {
  /** Teal brand sweep. */
  brand: ['#18BDB1', '#10A99F', '#078F88'] as const,
  /** Promo / feature card: mint-teal. */
  ember: ['#56C9BC', '#10A99F'] as const,
  /** Legacy key (was dark): now a calm teal sweep, no dark surfaces. */
  steel: ['#2DB8AC', '#10A99F', '#078F88'] as const,
  /** Blue-violet secondary. */
  iron: ['#7C93F0', '#5474E8'] as const,
  teal: ['#18BDB1', '#10A99F'] as const,
  wash: ['#FFFFFF', '#F5F6F6'] as const,
  /** Pale mint decorative wash (cards' corner shapes). */
  tintWash: ['#EAF9F6', '#DDF5EE'] as const,
} as const;

/**
 * Elevation scale (Material-style). Each level is a usable RN/web shadow.
 * Shadow colour is the brand dark steel so depth reads warm, not grey.
 */
const SH = '#192D37';
export const elevation = {
  0: { shadowColor: SH, shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  1: { shadowColor: SH, shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  2: { shadowColor: SH, shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  3: { shadowColor: SH, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  4: { shadowColor: SH, shadowOpacity: 0.12, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 10 },
} as const;

/** Glass surface (frosted card) — translucent fill + hairline highlight. */
export const glass = {
  bg: 'rgba(255, 255, 255, 0.72)',
  border: 'rgba(255, 255, 255, 0.60)',
  bgDark: 'rgba(15, 35, 46, 0.55)',
  borderDark: 'rgba(255, 255, 255, 0.10)',
} as const;

/** Soft "halo" tints for icon badges and accent surfaces. */
export const halo = {
  brand: 'rgba(16, 169, 159, 0.12)',
  brandStrong: 'rgba(16, 169, 159, 0.20)',
  teal: 'rgba(84, 116, 232, 0.12)',
  success: 'rgba(32, 166, 90, 0.12)',
  warning: 'rgba(230, 162, 60, 0.14)',
  error: 'rgba(228, 91, 101, 0.12)',
} as const;
