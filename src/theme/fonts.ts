import { Platform } from 'react-native';

/**
 * Web font loader.
 *
 * Alleima's brand typeface is "Neurial Grotesk" (commercial). We can't bundle
 * it, so on web we load the closest freely-licensable grotesques from Google
 * Fonts — Manrope (UI/body) and Space Grotesk (display) — to match the brand's
 * geometric, industrial character used in the report screenshots.
 *
 * On native this is a no-op; the stacks in tokens.ts fall back to the system
 * UI font, which is already the right choice for iOS/Android.
 *
 * Idempotent: safe to call on every mount; it injects the <link> tags once.
 */
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';

export function ensureBrandFonts(): void {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  if (document.getElementById('alleima-brand-fonts')) return;

  // Preconnect for faster first paint.
  const pre1 = document.createElement('link');
  pre1.rel = 'preconnect';
  pre1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(pre1);

  const pre2 = document.createElement('link');
  pre2.rel = 'preconnect';
  pre2.href = 'https://fonts.gstatic.com';
  pre2.crossOrigin = 'anonymous';
  document.head.appendChild(pre2);

  const link = document.createElement('link');
  link.id = 'alleima-brand-fonts';
  link.rel = 'stylesheet';
  link.href = GOOGLE_FONTS_HREF;
  document.head.appendChild(link);
}
