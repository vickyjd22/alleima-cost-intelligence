/**
 * Alleima Cost Intelligence — production design system.
 *
 * Direction: a fresh, airy teal → blue gradient theme (per client reference
 * image). A bright cyan-teal (#12B5C9) is the single confident accent — logo,
 * interaction, links, active nav, chart highlights — flowing into a sky blue
 * (#2B9BE0). A deep teal-navy (#0C2E3A) is the ink and the navigation rail.
 * Cool near-white canvas. Light, refreshing, glassy — soft gradients, generous
 * whitespace, cool slate type with cyan emphasis.
 *
 * Palette: Cyan-teal #12B5C9, Sky blue #2B9BE0, Teal-navy #0C2E3A,
 * cool greys, white.
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
  "'Manrope', 'Neurial Grotesk', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const displayFontStack =
  "'Space Grotesk', 'Neurial Grotesk', 'Manrope', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const monoStack =
  "'SFMono-Regular', ui-monospace, 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace";

export const palette = {
  /* Brand + interaction — bright cyan-teal carries all interaction */
  tint: '#12B5C9',
  tintPressed: '#0E96A8',
  tintSoft: '#E2F6F9',
  tintBorder: '#B6E8EF',
  accent: '#2B9BE0',
  accentSoft: '#E4F2FC',
  accentBorder: '#BBDDF6',

  /* Surfaces — airy near-white canvas with a cool wash */
  bg: '#F3F8FB',
  bgAlt: '#E8F1F6',
  card: '#FFFFFF',
  cardMuted: '#F5FAFC',
  filled: '#EDF4F8',
  overlay: 'rgba(12, 46, 58, 0.52)',

  /* Type — deep teal-navy ink, cool slate support */
  text: '#0E2A33',
  text2: '#51707A',
  text3: '#8BA3AC',
  textInverse: '#FFFFFF',

  /* Lines — cool grey-blue family */
  border: '#DCE7ED',
  borderStrong: '#C6D6DE',
  separator: '#E7EFF3',

  /* Semantics — kept distinct from the teal/blue brand */
  success: '#0E9F6E',
  successSoft: '#E4F7EF',
  successBorder: '#AEE6D0',
  warning: '#D98A0B',
  warningSoft: '#FCF2E0',
  warningBorder: '#F5D79B',
  error: '#E0453C',
  errorSoft: '#FCEAE9',
  errorBorder: '#F6C4C0',
  info: '#2B9BE0',
  infoSoft: '#E4F2FC',
  infoBorder: '#BBDDF6',

  /* Navigation rail — deep teal-navy, cyan active state */
  sidebar: '#0C2E3A',
  sidebarDeep: '#07212B',
  sidebarElevated: '#143E4C',
  sidebarText: '#E7F2F5',
  sidebarMuted: '#89A6B0',
  sidebarBorder: 'rgba(255, 255, 255, 0.08)',
  sidebarActive: 'rgba(18, 181, 201, 0.18)',
  sidebarActiveBorder: 'rgba(18, 181, 201, 0.45)',
  sidebarGlow: 'rgba(18, 181, 201, 0.45)',

  /* Legacy keys retained */
  dark: '#0C2E3A',
  tabBar: 'rgba(255, 255, 255, 0.96)',
  headerBg: 'rgba(243, 248, 251, 0.94)',
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
  shadowColor: '#0C2E3A',
  shadowOpacity: 0.05,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;

export const shadowPop = {
  shadowColor: '#0C2E3A',
  shadowOpacity: 0.14,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 12 },
  elevation: 10,
} as const;

export const shadowSidebar = {
  shadowColor: '#0C2E3A',
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
  ring: '#8FE0EA',
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
  /** Cyan → blue brand sweep — hero accents, primary emphasis. */
  brand: ['#1FC8D6', '#12B5C9', '#2B9BE0'] as const,
  /** Bright aqua — KPI accents, CTAs. */
  ember: ['#2FD0DC', '#12B5C9'] as const,
  /** Deep teal-navy — rails, headers, dark heroes. */
  steel: ['#143E4C', '#0C2E3A', '#07212B'] as const,
  /** Sky-blue secondary. */
  iron: ['#49ADEA', '#2B9BE0'] as const,
  /** Teal "intelligence" accent. */
  teal: ['#17C0CE', '#0E96A8'] as const,
  /** Very soft canvas wash for section backgrounds. */
  wash: ['#FFFFFF', '#F3F8FB'] as const,
  /** Soft cyan tint wash for highlighted cards. */
  tintWash: ['#EAF9FB', '#E2F6F9'] as const,
} as const;

/**
 * Elevation scale (Material-style). Each level is a usable RN/web shadow.
 * Shadow colour is the brand dark steel so depth reads warm, not grey.
 */
const SH = '#0C2E3A';
export const elevation = {
  0: { shadowColor: SH, shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  1: { shadowColor: SH, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  2: { shadowColor: SH, shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  3: { shadowColor: SH, shadowOpacity: 0.10, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 6 },
  4: { shadowColor: SH, shadowOpacity: 0.14, shadowRadius: 36, shadowOffset: { width: 0, height: 20 }, elevation: 12 },
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
  brand: 'rgba(18, 181, 201, 0.14)',
  brandStrong: 'rgba(18, 181, 201, 0.22)',
  teal: 'rgba(43, 155, 224, 0.12)',
  success: 'rgba(14, 159, 110, 0.12)',
  warning: 'rgba(198, 112, 11, 0.12)',
  error: 'rgba(198, 56, 45, 0.12)',
} as const;
