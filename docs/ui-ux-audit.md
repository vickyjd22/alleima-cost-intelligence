# UI/UX Audit — Alleima Cost Intelligence

_Phase 1 deliverable. Produced by inspecting the repository directly. Findings are grounded in the code; items that could not be verified in the codebase are called out as such._

## 1. Current architecture and technology stack

| Area | Detail | Source |
| --- | --- | --- |
| Framework | Expo SDK ~52, React Native 0.76.5, React 18.3.1 | `package.json` |
| Routing | Expo Router ~4.0.0 (file-based), `experiments.typedRoutes: true` | `package.json`, `app.json` |
| Web | React Native Web ~0.19.13, Metro bundler, `web.output: "single"` (SPA) | `app.json` |
| Language | TypeScript ~5.3.3, `strict` + `noUncheckedIndexedAccess`, path alias `@/* → ./src/*` | `tsconfig.json` |
| State | Zustand ^5 (`src/store/session.ts`, plus a small toast store) | `src/store/session.ts`, `src/components/Toast.tsx` |
| Forms / validation | react-hook-form ^7.53 + `@hookform/resolvers`, Zod ^3.23 | `src/lib/validation.ts` |
| Money math | decimal.js ^10.4 (decimal-safe costing) | `src/lib/costing.ts` |
| Backend SDK | Firebase ^10.14 (Auth/Firestore/Storage initialised) | `src/firebase/config.ts` |
| Icons | lucide-react-native via a central `Icon` registry (~140 icons) | `src/components/Icon.tsx` |
| Charts/vector | react-native-svg, expo-linear-gradient | `src/components/ui.tsx`, `CostingPanels.tsx` |
| Tests | Vitest ^2.1 (pure-logic tests only, no render tests) | `src/lib/domain.test.ts`, `src/domain/phase3.test.ts` |
| Lint | ESLint ^8.57 extending `expo` config | `.eslintrc.js` |

**Bootstrap chain.** `expo-router/entry` → `app/_layout.tsx` (headerless `Stack`) → `app/index.tsx` redirects to `/(auth)/sign-in`. The `(auth)` and `(app)` groups are each a headerless `Stack`. App chrome (sidebar/header/tabs) is **not** in the layout — every screen wraps itself in `<AppShell>`.

**Styling model.** No CSS-in-JS or utility framework. Styling is `StyleSheet.create` in each file, reading from a single token module `src/theme/tokens.ts`. Web-only style keys (`cursor`, `outlineStyle`) are cast `as never` to satisfy RN types.

## 2. Route and screen inventory

**Auth group `app/(auth)/`**

| Route | Screen | Purpose | Styling |
| --- | --- | --- | --- |
| `/(auth)/sign-in` | `sign-in.tsx` | Primary entry. Split hero + sign-in form; 4 one-click demo accounts (management/costing/finance/operator); real email path calls Firebase but has no auth-state listener wired | New `palette` |
| `/(auth)/splash` | `splash.tsx` | Splash / onboarding | Legacy `tokens` |
| `/(auth)/verify` | `verify.tsx` | "Verify your email" notice | Legacy `tokens` |
| `/(auth)/notice` | `notice.tsx` | Generic notice + back link | Legacy `tokens` |

**App group `app/(app)/` (18 routes).** Each self-wraps in `<AppShell>` and uses `useMockLoading()` + `<Skeleton>` for a ~600 ms simulated first load.

| Route | Purpose (what the user does) |
| --- | --- |
| `overview` | Management dashboard: reconciliation/close health, 4 KPI quads, yield chart, "needs attention" list |
| `costing` | Costing Workbench — 4 tabs: Workbench (variance table, trace drawer, submit/approve maker-checker, version compare, pool-imbalance simulation), Allocation §15, Overheads §16/17, Quotation §19 (interactive sensitivity) |
| `cost-centres` | Cost-centre master, department summary, exceptions; Zod add-form validation |
| `profit-centres` | Profit-centre list + SOPIC/PC bridge reconciliation |
| `planning` | Production plans table with "Release" action |
| `work-orders` | Work orders + travellers tables; ledger-intent validation |
| `inventory` | Heats / traceability tables; ledger validation |
| `engineering` | Routes (HF/CF/U-Bend), MHR pools, capacity, rate card |
| `quality` | Inspections table, defect / cost-of-quality |
| `finance` | Reconciliation worklist (matched + invoice-0 + PC exceptions), assign owner/due |
| `approvals` | Pending approvals with maker-checker review flow |
| `exceptions` | Exception centre |
| `reports` | Analytics: yield dictionary, loss treatment, variances, cost-sheet lines, close checklist |
| `review` | Client-review landing (journeys, module catalogue, local feedback) |
| `notifications` | Inbox |
| `imports` | CSV import preview + validation |
| `integrations` | Integration / ERP connection checks |
| `admin` | Administration & audit: CAS list, policy form, master links, demo reset |
| `profile` | Account + **demo-only** role switcher |

## 3. Existing reusable components (`src/components/`)

- **Primitives (`ui.tsx`):** `Card` (default/muted/tint), `SectionHeader`, `Button` (primary/secondary/ghost/danger/success × sm/md/lg, hover+press+loading+icon), `IconButton`, `Tabs` (scrollable segmented), `EmptyState`, `ProgressBar`, `ProgressRing` (SVG), `Callout`, `Avatar`, `DeltaPill`, `SparkBars`, `BrandMark`.
- **Layout / nav:** `AppShell` (navy rail, collapsible 262→82 px, grouped nav, header with search/period/bell/avatar, breadcrumb, DEMO pill), `BottomNav` (mobile tab bar + "all workspaces" sheet, hidden ≥1024 px), `PageHeader`.
- **Data display:** `DataTable` (generic `Column<T>` — key/header/render/width/align, horizontal scroll, hover highlight, `onRowPress`, built-in empty state), `KpiCard`, `StatusChip` (dot + label, toned, never colour-only), `CostingPanels` (`CostBreakdownPanel`, `TraceabilityTimeline`, `ChartCard`), `Governance` (`AuditPanel`, `ApprovalTimeline`), `DetailDrawer` (+`KeyVal`).
- **Inputs/forms:** `FormField` (+legacy `PrimaryButton`), `SignInForm`, `Filters` (`PeriodSelector`, `SearchField`), `Stepper` (legacy).
- **Feedback/state:** `Toast` (+`ToastHost`), `Feedback` (`ConfirmDialog`, `StateView` loading/error/empty/offline), `Skeleton` (+`useMockLoading`), `DemoBanner`, `FeatureHelp`, `ExportButton` (real web CSV via Blob), `Icon` (+`ModuleIcon`).

## 4. Important business workflows

1. **Costing calculation & maker-checker approval** (`costing.tsx`): calculate → submit for review → approve + lock; self-approval blocked; a simulated ₹250 pool imbalance blocks approval (§15.3).
2. **Reconciliation & close** (`finance.tsx`, `reconciliation.ts`): SOPIC rows split into matched / Invoice-0 exceptions / unknown-profit-centre exceptions; worklist assignment.
3. **Work-order lifecycle** (`planning.tsx` → `work-orders.tsx` → `quality.tsx`): plan → release → operate/traveller → QA.
4. **Material traceability** (`inventory.tsx`): heat → movements → WO → traveller → FG.
5. **Master-data import** (`imports.tsx`, `imports.ts`): template → validate (cost-centre code `/^8204/`, duplicate detection) → fix → commit.
6. **Approvals queue** (`approvals.tsx`): submit → reject with reason → resubmit → approve, enforcing maker ≠ checker.

## 5. API and data dependencies

- **No live data layer.** Every screen reads from in-memory mocks: `src/mocks/demo.ts` (`demoDb`, `resetDemo()`), `src/data/sample.ts` (`SAMPLE_PRODUCTS`, `SAMPLE_PROFIT_CENTRES`, `KNOWN_PCS`), `src/mocks/manual.ts` (static matrices/registers). Mutations are in-memory and reset via admin.
- **Firebase is initialised but unused for data.** `getFirestore`/`getStorage` are created in `config.ts` but never read anywhere (no `getDoc`/`onSnapshot`/`collection`). `signInWithEmailAndPassword` is referenced only in `sign-in.tsx`, where the demo path is the only one that navigates. Env vars default to `'dev-placeholder'`.
- **Business-logic libraries are real and tested:** `costing.ts`, `validation.ts`, `reconciliation.ts`, `ledger.ts`, `imports.ts`, `close.ts`, `audit.ts`, `offline.ts`, and `domain/*`.

## 6. User roles and permissions

- **15 roles** (`src/lib/permissions.ts`): platformAdmin, clientAdmin, management, costing, finance, productionMgr, supervisor, operator, stores, engineering, quality, hr, sales, procurement, auditor.
- **Pure permission functions:** `canWriteCostRun`, `canApprove` (maker-checker: approver ≠ submitter and finance/management/clientAdmin), `isReadOnlyAuditor`.
- **Enforcement today is presentational only.** Access control happens at the **navigation-visibility layer** via `modulesForRoles` in `AppShell`/`BottomNav`; a role simply does not see modules it lacks. The permission functions are **not** called by any screen (only by tests). `costing.tsx` implements maker-checker with local state, not `canApprove`. Comments repeatedly note "Functions enforce in production."

## 7. Current design weaknesses

1. **Palette is generic SaaS blue.** Current `tint #2563EB` + navy `#0A1B33` reads as a standard admin template rather than Alleima's industrial, technical character. This is the single biggest gap vs. the brief.
2. **Legacy token drift.** `splash`/`verify`/`notice`/`Stepper` still use the old `tokens` object while the rest uses `palette` — inconsistent surfaces.
3. **Duplicate primitives.** Two button systems (`ui.tsx Button` vs `FormField.tsx PrimaryButton`) and two period selectors (AppShell inline vs `Filters.PeriodSelector`).
4. **No typeface actually loaded.** `fontStack` references Inter and the `expo-font` plugin is configured, but no font file is bundled — web falls back to system fonts.
5. **Non-functional affordances.** The command-search `⌘K` hint is shown but not key-bound; the notifications bell has a hardcoded "5".
6. **Permission-denied is not a state.** Deep-linking to any `(app)` route renders for the default session; unauthorised modules are only hidden from nav, not guarded.
7. **Light-only theme** despite `userInterfaceStyle: automatic` in `app.json`.
8. **Dense, text-heavy screens** (e.g. `costing.tsx` Allocation/Overheads tabs) lean on raw `Text` with section numbers; information hierarchy could be stronger.

## 8. Functional risks and implementation constraints

- **Do not change `lib/*` or `domain/*` signatures or outputs** — the Vitest suite pins exact values (MHR `200`, MPV `-15000`, yield `94.2`, maker-checker, reconciliation routing, CSV preview). A visual revamp must leave these intact.
- **Preserve token contract.** `palette`, `type`, `radius`, `spacing`, `toneColors` are consumed everywhere; rename/removal would break many files. Safe approach: **change values, keep keys**.
- **Preserve `modules.ts` registry shape** — it drives sidebar, search, and bottom nav.
- **Preserve `useSession` store API** and component prop contracts (`Button`, `DataTable` `Column<T>`, `StatusChip` tones, `KpiCard`, `Icon` `IconName`).
- **Path spaces caveat.** The project path contains spaces (`Bizsol Projects/ALLEIMA INDIA PRIVATE LIMITED`), which previously broke Metro's static web render; `web.output` is now `single` to avoid that.
- **No render tests** — visual regressions must be caught manually / in review.

## 9. Recommended redesign priorities

1. **Re-tone the design system to Alleima's industrial direction** in `tokens.ts` (deeper navy `#092D58`, technical blue `#2676C9`, cooler neutrals) — one change, propagates everywhere. _Highest impact, lowest risk._
2. **Unify legacy surfaces** (splash/verify/notice/Stepper) onto `palette`.
3. **Strengthen typographic hierarchy and whitespace** to echo Alleima's clean, structured pages; add an Alleima-style stat/overview band.
4. **Consolidate duplicate primitives** (one button, one period selector) during the production phase.
5. **Add a clearly isolated client-review prototype entry point** that showcases the new direction across representative screens without destabilising production flows.
6. **Document the system** (tokens, components, accessibility) so the revamp is maintainable.
7. _(Production phase only)_ add permission-denied states and bind the search shortcut.

> **Unverified / open questions for the client**
> - Exact official Alleima brand hex values, logo usage rules, and licensed typeface are **not** confirmed from the public site; the proposed palette is an interpretation (see `docs/ui-ux-visual-direction.md`).
> - Whether real Firebase/ERP wiring is in scope for the production phase, or remains mocked for this review.
> - Whether dark mode is required.
