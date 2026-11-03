# Design System — Alleima Cost Intelligence

_Phase 3 deliverable. Documents the token contract, component standards, accessibility rules, and usage guidelines. Single source of truth in code: `src/theme/tokens.ts`._

## 1. Principles

1. **One source of truth.** All colour, type, spacing, radius, shadow, and layout values live in `src/theme/tokens.ts`. Screens and components never hard-code hex or magic numbers for themeable values.
2. **Change values, keep keys.** Token **keys** are a shared contract consumed across every screen. The Alleima revamp changed values only; no key was renamed or removed, so nothing broke.
3. **Industrial restraint.** One interaction blue, teal for insight, amber/red only for cost/risk/exceptions. Generous whitespace on a 4 px grid. No decorative gradients, heavy shadows, or motion.
4. **Status is never colour-only.** Every status carries an icon or text label in addition to colour (accessibility).

## 2. Design tokens

### Colour (`palette`)

| Group | Key(s) | Value |
| --- | --- | --- |
| Interaction | `tint` / `tintPressed` / `tintSoft` / `tintBorder` | `#2676C9` / `#1C5CA3` / `#E7F0FA` / `#BCD6F0` |
| Insight (accent) | `accent` / `accentSoft` / `accentBorder` | `#0E7C86` / `#E2F4F5` / `#AFE0E3` |
| Surfaces | `bg` / `bgAlt` / `card` / `cardMuted` / `filled` | `#F2F5F7` / `#E9EEF2` / `#FFFFFF` / `#F6F9FB` / `#EDF2F6` |
| Overlay | `overlay` | `rgba(6,22,44,0.52)` |
| Text | `text` / `text2` / `text3` / `textInverse` | `#13263B` / `#52677D` / `#8A9AAC` / `#FFFFFF` |
| Lines | `border` / `borderStrong` / `separator` | `#DCE3E9` / `#C7D2DC` / `#E7EDF2` |
| Success | `success` / `successSoft` / `successBorder` | `#0F8A5F` / `#E6F6EF` / `#AEE2C9` |
| Warning | `warning` / `warningSoft` / `warningBorder` | `#C6700B` / `#FBF2E4` / `#F2D6A4` |
| Error | `error` / `errorSoft` / `errorBorder` | `#C7382D` / `#FBECEA` / `#F2C3BE` |
| Info | `info` / `infoSoft` / `infoBorder` | `#2676C9` / `#E7F0FA` / `#BCD6F0` |
| Rail | `sidebar` / `sidebarDeep` / `sidebarElevated` | `#092D58` / `#061E3D` / `#123E72` |
| Rail text | `sidebarText` / `sidebarMuted` | `#E7EFF9` / `#8FA7C4` |

Use `toneColors(tone)` to resolve `{ fg, bg, border }` for `neutral | ok | warn | error | info | accent` — consumed by `StatusChip` and `Callout`.

### Typography (`type`, `fontStack`, `monoStack`)

Inter-first stack. Scale (px / weight / line-height): `display` 40/700, `largeTitle` 34/700, `title1` 28/700, `title2` 22/700, `title3` 19/600, `headline` 16/600, `body` 15/400, `callout` 14/400, `subhead` 13/400, `footnote` 12/400, `caption1` 11.5/500, `caption2` 10.5/600 (tracked, used for eyebrows/table headers), `tabLabel` 10.5/600. Use `monoStack` for figures/IDs where column alignment matters.

### Spacing, radius, shadow

- **Spacing (4 px grid):** `xxs 2, xs 4, sm 8, md 12, lg 16, xl 24, xxl 32, xxxl 48`.
- **Radius:** `sheet/xl 20, card 16, lg 14, group/md 12, input/button 11, sm 9, pill 999`.
- **Shadow:** `shadowCard` (soft, default), `shadowPop` (dialogs/popovers), `shadowSidebar`. Shadow colour is the brand navy `#092D58`.
- **Touch target:** `minTouch` 44 px minimum.

### Layout tokens (added in Phase 3)

- **`focus`** `{ color, ring, width: 2, offset: 2 }` — visible keyboard focus indicator.
- **`motion`** `{ fast 120, base 180, slow 260 }` ms.
- **`zIndex`** `base → sidebar 20 → header 30 → bottomNav 40 → dropdown 50 → overlay 60 → modal 70 → toast 90`.
- **`container`** `{ narrow 720, content 1080, wide 1320, full 1560 }` px.
- **`breakpoints`** `{ compact 760, wide 1024, roomy 1320 }` px.

## 3. Component standards (`src/components/`)

| Component | Standard |
| --- | --- |
| `Button` | Variants `primary/secondary/ghost/danger/success`, sizes `sm/md/lg`; hover, pressed, disabled (0.45 opacity), loading (spinner) states; optional leading/trailing icon; `accessibilityRole="button"` + state. **One primary per screen.** |
| `IconButton` | 44 px target minimum via `size`; tones `default/tint/inverse`; always has `accessibilityLabel`. |
| `Card` | Tones `default/muted/tint`; `padded` toggle; soft `shadowCard`; radius `card`. |
| `SectionHeader` / `PageHeader` | Eyebrow (caption2, tracked), title, description, right-aligned actions; responsive. |
| `DataTable` | Generic `Column<T>` (`key/header/render/width/align`); quiet uppercase header, hairline row separators, 52 px min row height, hover highlight, horizontal scroll contained, **built-in empty state**. |
| `StatusChip` | Dot + label, toned via `toneColors`; **never colour-only**. |
| `KpiCard` | Metric + label + delta; pressable to deep-link. |
| `Tabs` | Scrollable segmented control; selected state; keyboard focusable. |
| `Callout` | Toned banner with icon + title + body; tones `neutral/ok/warn/error/info/accent`. |
| `ConfirmDialog` (`Feedback`) | Modal with overlay (`zIndex.modal`), confirm/cancel, focus-trapped. |
| `Toast` / `ToastHost` | Transient, auto-hide 3.4 s; `zIndex.toast`. |
| `Skeleton` + `useMockLoading` | Animated pulse for loading; never a blank screen. |
| `EmptyState` | Icon + title + optional description + optional action. |
| `StateView` (`Feedback`) | `loading / error / empty / offline` presets. |
| `DemoBanner` | Amber "sample data" banner — marks non-production data clearly. |

### State coverage checklist (every data surface)

- **Loading** → `Skeleton` / `StateView('loading')`
- **Empty** → `DataTable` built-in or `EmptyState`
- **Error** → inline field error, `Callout tone="error"`, or `StateView('error')`
- **Permission-denied** → _production-phase addition_ (today handled by nav-visibility)
- **Success/confirm** → `Toast` + `ConfirmDialog`

## 4. Accessibility rules (target: WCAG 2.2 AA)

1. **Contrast** ≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI components (see contrast table in `ui-ux-visual-direction.md`).
2. **Status never colour-only** — pair with icon/label.
3. **Visible focus** — use the `focus` token for keyboard outlines; never remove focus without a replacement.
4. **Touch targets** ≥ 44 px (`minTouch`).
5. **Semantics** — `accessibilityRole` / `accessibilityLabel` / `accessibilityState` on all interactive elements (already present on `Button`, `IconButton`, nav items, checkboxes).
6. **Forms** — labels tied to inputs; errors announced via `accessibilityRole="alert"` (as in `SignInForm`/`FormField`).
7. **Full validation requires manual testing** with assistive technologies and expert review — automated checks alone are not sufficient.

## 5. Usage guidelines

- **Do** read all themeable values from `tokens.ts`. **Don't** hard-code hex, spacing, or radii.
- **Do** reuse `ui.tsx` primitives. **Don't** add a third button or a parallel period selector (consolidate the existing duplicates instead).
- **Do** keep one primary action per screen; everything else is secondary/ghost.
- **Do** use `monoStack` + right-alignment for money/variance columns.
- **Do** mark any non-production data with `DemoBanner` or a `DEMO` pill.
- **Don't** introduce a second styling system (no CSS-in-JS/utility framework).
