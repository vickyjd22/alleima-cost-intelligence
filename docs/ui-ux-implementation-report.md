# UI/UX Implementation Report — Phases 7 & 8

_Production implementation of the approved Alleima-inspired direction, plus QA results. Companion to the Phase 1–6 docs in this folder._

## 1. What was implemented (Phase 7)

The design-system re-tone (the Alleima palette in `src/theme/tokens.ts`) was applied in Phase 3 and propagates to every screen because all themeable values read from that one module. Phase 7 completed the direction across the app and closed the gaps the audit identified:

| # | Change | Files | Why |
| --- | --- | --- | --- |
| 1 | **Brand mark re-toned** to technical-blue→navy→teal gradient | `src/components/ui.tsx` (`BrandMark`) | Logo still used the old blue/teal; now matches the Alleima palette |
| 2 | **Sign-in hero re-toned** to the new navy gradient + accent glyph colour | `app/(auth)/sign-in.tsx` | The auth entry is the first brand impression |
| 3 | **Visible keyboard focus** added to `Button`, `IconButton`, `FormField`, `SearchField` using the new `focus` token | `src/components/ui.tsx`, `FormField.tsx`, `Filters.tsx` | Accessibility (WCAG 2.2 — visible focus) |
| 4 | **Button consolidation** — legacy `PrimaryButton` now delegates to the canonical `Button`; one button implementation, one visual language. API unchanged | `src/components/FormField.tsx` | Removes the duplicate-primitive drift noted in the audit |
| 5 | **Stepper re-toned** onto tokens (success pill + check for done, interaction blue for current); removed hardcoded hex | `src/components/Stepper.tsx` | Was on the legacy `tokens` object with raw hex |
| 6 | **Permission-denied guarded state** — deep-linking a route the role can't access now renders a denied screen instead of the body | `src/components/PermissionDenied.tsx` (new), `src/components/AppShell.tsx` | Closes the documented access-control gap (presentational; server rules remain authoritative) |
| 7 | **Hardcoded shadow hex → tokens** (old navy `#0A1B33` → `palette.sidebar`) | `AppShell.tsx`, `BottomNav.tsx`, `Toast.tsx`, `SignInForm.tsx`, `Filters.tsx` | Full single-source-of-truth consistency |

### Explicitly preserved (unchanged)

- All business logic in `src/lib/*` and `src/domain/*` (costing math, validation, reconciliation, ledger, imports, close, audit) — signatures and outputs untouched.
- The token **contract** (every `palette`/`type`/`radius`/`spacing`/`toneColors` key) — values changed, keys preserved.
- The `modules.ts` nav registry shape, the `useSession` store API, and all component prop contracts (`Button`, `DataTable` `Column<T>`, `StatusChip` tones, `PrimaryButton`, `Stepper`, `PeriodSelector`).
- All routes, the demo-auth flow, and the role-visibility model.

## 2. QA results (Phase 8 — actually run)

| Check | Command | Result |
| --- | --- | --- |
| Type checking | `npm run typecheck` | **Pass** — no errors |
| Unit/logic tests | `npm test` | **Pass — 36/36** (`domain.test.ts` 9, `phase3.test.ts` 27) |
| Lint | `npm run lint` | **Pass** — 0 errors, 0 warnings |
| Production web build | `npm run build:web` | **Pass** — bundled to `dist/` (2283 modules, 3.71 MB JS), no errors |
| Dev server (web) | `npm run web` | **Pass** — HTTP 200, title renders, no bundler errors |

### Checks not run (environmental limitations — reported honestly)

- **Native builds (iOS/Android/EAS):** not run in this environment; web is the verified target.
- **Automated accessibility audit / assistive-technology testing:** not run. Contrast was computed for the core pairs (see `ui-ux-visual-direction.md`) and meets AA/AAA, but full WCAG 2.2 AA validation requires manual testing with screen readers and expert review.
- **Automated keyboard-navigation and browser-console runtime checks:** focus states were implemented and the build is clean, but an interactive manual pass in a browser is still recommended before sign-off.
- **Render/component tests:** the suite is pure-logic only; no component render tests exist, so visual regressions are caught by build + manual review, not automated snapshots.

## 3. Regression findings

- No test regressions (36/36 still pass; logic untouched).
- No type or lint regressions.
- The palette change is value-only; no consumer broke. Legacy screens (`splash`/`verify`/`notice`) inherit the new palette automatically via the `tokens` compatibility object.

## 4. Remaining technical debt

- **Two period selectors** still coexist (`AppShell` inline + `Filters.PeriodSelector`). Both now share tokens/focus, so they look identical; a future pass could extract one shared component.
- **Legacy `tokens` object** is still used by `splash`/`verify`/`notice`. It maps to the new palette, so they're on-brand, but a future pass could migrate them to `palette` directly and redesign them as full screens.
- **No render tests** — consider adding component tests if the UI continues to grow.
- **Inter font not bundled** — web uses system fallback; bundling Inter via `expo-font` would guarantee pixel consistency.
- **No live data/auth** — still a front-end review build; real Firebase/ERP wiring is a separate workstream.

## 5. Deployment & rollback considerations

- **Deploy (web):** `npm run build:web` → deploy `dist/` to Firebase Hosting (or the approved host), per `README.md` / `firebase.json`.
- **Config caveat:** `app.json` keeps `web.output: "single"` (SPA). Do **not** revert to `"static"` while the project path contains spaces — the Node SSR render step fails on it (documented during initial setup).
- **Rollback:** all Phase 7 changes are isolated to the theme token values and presentational components; reverting the relevant commits restores the previous look with zero data/logic impact. Because business logic was never touched, a UI rollback carries no data risk.
- **Env:** no secrets added or logged. Firebase config still falls back to `dev-placeholder` when `.env` is absent.

## 6. Files created / modified in Phase 7

**Created**
- `src/components/PermissionDenied.tsx`
- `docs/ui-ux-implementation-report.md` (this file)

**Modified**
- `src/components/ui.tsx` — BrandMark gradient; focus states on Button/IconButton
- `src/components/FormField.tsx` — PrimaryButton → delegates to Button; input focus ring
- `src/components/Filters.tsx` — focus ring; shadow token
- `src/components/Stepper.tsx` — re-toned onto palette
- `src/components/AppShell.tsx` — permission guard; shadow tokens
- `src/components/BottomNav.tsx`, `Toast.tsx`, `SignInForm.tsx` — shadow tokens
- `app/(auth)/sign-in.tsx` — hero gradient + accent colours + shadow token
