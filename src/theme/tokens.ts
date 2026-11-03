/**
 * Alleima Cost Intelligence — production design system.
 *
 * Direction: the OFFICIAL Alleima brand identity (Kurppa Hosk). Molten Orange
 * (#FF5532) is the single confident accent — logo, interaction, links, active
 * nav, chart highlights. Dark Steel (#0F232E) is the ink and the navigation
 * rail. Iron Red (#872823) is the deep secondary. White canvas with a Titanium
 * Grey (#E1E1E1) neutral family. Editorial, industrial, premium — thin orange
 * rules, generous whitespace, near-black type with orange emphasis.
 *
 * Brand hex per the published Alleima identity: Molten Orange #FF5532,
 * Dark Steel Blue #0F232E, Iron Red #872823, White, Titanium Grey #E1E1E1.
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
  /* Brand + interaction — Molten Orange #FF5532 carries all interaction */
  tint: '#FF5532',
  tintPressed: '#E8431F',
  tintSoft: '#FFEDE8',
  tintBorder: '#FFCFC2',
  accent: '#872823',
  accentSoft: '#F6E7E5',
  accentBorder: '#E6C3BF',

  /* Surfaces — white canvas with a soft titanium-grey wash */
  bg: '#F6F6F4',
  bgAlt: '#EDEDEA',
  card: '#FFFFFF',
  cardMuted: '#F8F8F6',
  filled: '#F0F0ED',
  overlay: 'rgba(15, 35, 46, 0.55)',

  /* Type — Dark Steel ink, calm steel-grey support */
  text: '#0F232E',
  text2: '#5A6B73',
  text3: '#93A0A6',
  textInverse: '#FFFFFF',

  /* Lines — Titanium Grey family */
  border: '#E1E1E1',
  borderStrong: '#CFCFCD',
  separator: '#ECECEA',

  /* Semantics — green/amber for status; a true red for error, kept distinct
     from the brand orange so "error" never reads as "brand accent" */
  success: '#2F8A5B',
  successSoft: '#E7F4EC',
  successBorder: '#B6E0C6',
  warning: '#C57A12',
  warningSoft: '#FBF1E1',
  warningBorder: '#F1D49C',
  error: '#C62828',
  errorSoft: '#FBE9E9',
  errorBorder: '#F0C2C2',
  info: '#0F232E',
  infoSoft: '#EBEEEF',
  infoBorder: '#C7D0D3',

  /* Navigation rail — brand Dark Steel #0F232E, orange active state */
  sidebar: '#0F232E',
  sidebarDeep: '#0A181F',
  sidebarElevated: '#1A333F',
  sidebarText: '#EAEDEE',
  sidebarMuted: '#8D9BA1',
  sidebarBorder: 'rgba(255, 255, 255, 0.08)',
  sidebarActive: 'rgba(255, 85, 50, 0.16)',
  sidebarActiveBorder: 'rgba(255, 85, 50, 0.42)',
  sidebarGlow: 'rgba(255, 85, 50, 0.45)',

  /* Legacy keys retained */
  dark: '#0F232E',
  tabBar: 'rgba(255, 255, 255, 0.96)',
  headerBg: 'rgba(246, 246, 244, 0.94)',
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
  shadowColor: '#0F232E',
  shadowOpacity: 0.05,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;

export const shadowPop = {
  shadowColor: '#0F232E',
  shadowOpacity: 0.14,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 12 },
  elevation: 10,
} as const;

export const shadowSidebar = {
  shadowColor: '#0F232E',
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
  ring: '#FFB3A1',
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
