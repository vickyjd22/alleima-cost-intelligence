# PHASE 2 PROMPT — Complete UI/UX Review Build (Clickable Client Review)

## 0. Phase goal (read this first)

Build the **complete, clickable UI/UX of every feature** of Alleima Cost Intelligence so the client can review direction before backend/integration work proceeds.

At the end of this phase, a reviewer can sign in as any of 4 demo roles, visit **every module**, and complete **Journeys A–G end-to-end against mock data** — with real navigation, validation, loading/empty/error/offline states, approvals, and exports. Nothing may be a dead button: every control must visibly do something (real local state change, toast, dialog, drawer, or honestly-labelled mock).

**This phase is UI/UX + mock service layer only.** No Firebase wiring, no real cost-formula sign-off, no ERP/SAP integration, no EAS builds. All consequential actions show their backend enforcement point (e.g. "Functions will approve — recorded locally for review").

Client-review success = the client answers YES to: "Is this the right product, navigation, and workflow for each role?"

## 1. Ground rules (non-negotiable)

1. Stack: Expo Router + TypeScript strict (`noUncheckedIndexedAccess`) + React Native Web. `npx tsc --noEmit`, `npx eslint src app`, `npx vitest run` stay green.
2. Design tokens ONLY from `src/theme/tokens.ts`. No new colors. Light mode first; add a working light/dark toggle only if it lands without breaking charts/tables.
3. Reuse `src/components/*` (AppShell, KpiCard, DataTable, Filters, StatusChip, Feedback, Governance, CostingPanels). New shared pieces go in `src/components/`, never inline one-offs (BottomNav, EmptyState, Toast, FormField, ExportButton, DetailDrawer).
4. **Never use expo-router `<Link asChild>`** (Radix Slot corrupts array styles on web — see IMPLEMENTATION_STATUS 2026-10-13 fix). Navigate with `useRouter().push/replace`.
5. All demo data labelled SAMPLE, from one source: `src/data/sample.ts` (+ new `src/mocks/*` per domain). Same heat/WO/traveller/invoice IDs everywhere.
6. Every data screen implements: loading skeleton (simulate 600ms on first mount), empty state, error-with-retry (a "simulate error" toggle in Imports/Admin is acceptable), offline banner on queued mobile actions, confirmation for consequential actions, toast on every commit.
7. Deterministic IDs + `idempotencyKey` shown on every mock posting so reviewers see the ledger discipline.

## 2. Global shell & navigation

- Desktop (≥900px): persistent `AppShell` sidebar (13 modules, role-filtered via `modulesForRoles`), header with plant chip (Mehsana), `PeriodSelector` (202607–202610), global search (filters current table + jumps to module), notifications bell (opens Approvals), user menu (Profile, sign out).
- Mobile (<900px): compact header + **BottomNav with 5 tabs: Overview · Production · Costing · Alerts · Profile**. Same module registry; non-tab modules reachable via a "More" sheet.
- Breadcrumbs + `PageHeader` (title, sub, actions right) on every page. Filters above tables, sticky headers on web.
- Role switching for review: Profile shows current demo role; signing in as another demo account re-renders nav (Management 13 modules · Costing 11 · Finance 6 · Operator 4: Overview/Work-Orders/Approvals/Profile).

## 3. Auth & onboarding (Journey A)

Routes in `app/(auth)/`: `splash` (brand + session check + Continue), onboarding (3 skippable slides: Track material → Control cost → Reconcile finance), `sign-in` (form + 4 demo-account buttons, password `Demo1234!`; wrong password shows error, no navigation), `verify` (resend mock with countdown), forgot/reset (email → mock "link sent" confirmation), `pending`/`denied`/`expired` screens, Profile (role/plant/period display, period switcher, sign out → back to sign-in).
Accept: invite-only copy everywhere; no public registration UI.

## 4. Module specs (build each fully)

### 4.1 Overview `/(app)/overview` (Journey F)
KPI cards (SAMPLE): Production output 1,240 t · Yield 94.2% (warn) · Conversion ₹/kg (show "—" until cost run approved — demonstrates gating) · Open exceptions 7 (error, taps to Approvals). `ChartCard` yield-by-flow bars + cost-composition bars. Panels: close progress % (from CLOSE_STEPS mock state), reconciliation status chips (SOPIC matched/Invoice-0/PC-review counts from `reconcileSopic(SAMPLE)`), open approvals (3), top variances list (tap → Costing). Drill-down: every KPI/chart segment navigates to its source screen with filter preset.

### 4.2 Costing Workbench `/(app)/costing` (Journey D)
Selectors: plant (locked Mehsana) + period + product + grade-group + cost-centre. Std-vs-actual table (Material, Machine, Labour, Utility, OH, Yield impact) with per-line variance + status chip. `CostBreakdownPanel` + `TraceabilityTimeline` + `ApprovalTimeline`. Run history list (v1 draft, v2 submitted, v3 approved/locked) with version compare (side-by-side deltas). Trace drawer per line: rate version + source txns + policy version. Actions: Validate inputs (shows completeness checklist pass/fail), Calculate (mock run with inputsHash displayed), Submit, Approve+Lock (mock, maker≠checker note). Block Approve when pool-vs-allocated ≠ 0 — include a toggleable 250-unit imbalance to demo the gate.

### 4.3 Cost Centres `/(app)/cost-centres` + Profit Centres `/(app)/profit-centres` (Journey B)
CC table: code/desc/flow/type-chip/driver/UOM/active + search + type filter + flow filter. Row → detail drawer (owner, capacity basis, PC link, GL elements, rate method, effective dates, history). Actions: New (validated form — code must start 8204), Edit, Activate/Deactivate (confirm dialog, blocked codes stay for history), "Import 127" (jumps to Imports with CC template preselected). Banner: source-master disclaimer. PC screen: 513/514/517 cards + entity 8911 chip; 514 card shows interim-posting warning + reallocation list mock; bridge totals per PC from SOPIC sample.

### 4.4 Planning `/(app)/planning`, Work Orders & Travellers `/(app)/work-orders` (Journeys C+G)
Plans table (flow/qty/state) → Release (creates WO mock with reservation lines). WO table → detail drawer (reservations, issues, travellers, QC, FG receipt checklist). Traveller entry form (mobile-first, large inputs, all fields validated by `travellerEntrySchema`; errors inline). On submit: idempotency key shown, entry queued (offline-safe toast), yield auto-computed and shown. Shop-floor mode (mobile widths): Assigned-work cards → big Start/Complete buttons → quantity steppers → scrap/rework with defect-code picker → photo/attachment placeholder → confirmation screen with reference no.

### 4.5 Inventory `/(app)/inventory` (Journey C/E)
Tabs: Stock (heat table: H-771/H-772 balances, location, status) · Movements (immutable ledger list with idempotency keys, reversal links) · Transfers · Adjustments (reason required, routes to Approvals) · Physical count (count vs book, variance post mock). Actions: Receive (GRN form + heat creation), Issue (validated, negative-balance attempt shows blocked message — demo the guard), Transfer (from/to), Reverse (creates reversal intent, original untouched). Traceability view per heat: receipt → issues → travellers → FG (timeline).

### 4.6 Engineering `/(app)/engineering` (Journey B)
Tabs: Products · BOM (version list v1/v2/v3 with effective dates, line-level scrap factors, diff view, New version = draft→submit→approve states) · Routings (op sequence with machine/CC/std-hrs) · Rate tables (MHR/labour/utility/OH versions + approval stamps). Maker-checker states visible on every version row.

### 4.7 Quality `/(app)/quality`
Inspections table (id/traveller/defect/qty/disposition chips) + Hold/Release actions (hold shows banner on WO drawer mock). Defect-code directory with process mapping. Rework-cost note per disposition (links to Costing trace drawer mock).

### 4.8 Finance `/(app)/finance` (Journey E)
SOPIC bridge table (matched / `invoice-0` / `pc-review` chips from live `reconcileSopic` on sample rows) + exception drawers (assign owner, due date, resolve mock). PC bridge totals 513/514/517 + FS bridge note (PRManager TBD flag). Close checklist D+1..D+12 with tappable checkboxes, progress %, blocked-step demo, period lock button (mock, Finance role only — others see disabled + reason). Cost-financial bridge panel (booked vs cost with difference owners).

### 4.9 Approvals `/(app)/approvals`
Queue (3 seeded: WIP adjust, 514→517 reallocation, MHR change) with maker, age, kind chip. Review → `ConfirmDialog` + reason field (required for reject) → decision recorded locally with timeline entry. Auditor role sees read-only list. Empty state after all decided + "reset demo queue" action.

### 4.10 Reports `/(app)/reports` (Journey F)
9 report cards (§4 spec list) each opening a filtered table view with pagination, sorting, column visibility toggles, and **working CSV download of the visible SAMPLE rows** (real client-side export — reviewers love this). Every chart titled/labelled with units + "view data" link.

### 4.11 Imports `/(app)/imports`
Per template (CC/PC, products, BOM, rates, heats, SOPIC, dispatch): Download template (real file), Upload (parse locally), column mapping UI, `previewCostCentres` validation (row errors, duplicates highlighted), Preview table, Commit (mock → adds to import history + audit entry). Adapter cards (ERP/SAP, SOPIC live, HR) show "Not connected — needs credentials" with contract summary link; no fake success anywhere.

### 4.12 Admin `/(app)/admin` + Profile
Users table (invite mock, role multi-select, plant scope, activate/deactivate), Roles matrix viewer (from ROLE_PERMISSION_MATRIX), Periods (open/locked chips, lock/reopen mock with Finance-only guard), Policies list (versioned), Audit log (every mock action in-session appends here — proves auditability). Profile: session facts + demo-role switch hint + sign out.

## 5. Sample-data contract (`src/mocks/*`, extends `src/data/sample.ts`)

Heats H-771 (304, 5,200 kg) / H-772 (2205, 3,100 kg); WOs WO-881/WO-882; travellers T-501/T-502; SOPIC 3 rows (1 matched INV-1001/PC514, 1 Invoice-0, 1 unknown-PC 999); inspections Q-901/Q-902; approvals AP-01..03; plans PLAN-OCT-HF/CF; periods 202607–202610. IDs identical on every screen. A `resetDemo()` restores initial state.

## 6. Build order (increments, each independently reviewable)

1. Shell + BottomNav + search/header + role filtering (all roles).
2. Auth set + Profile + demo switching.
3. Masters (CC/PC/Engineering) + detail drawers + forms.
4. Production + Inventory + Quality + shop-floor mode.
5. Costing Workbench + version compare + gates demo.
6. Finance + Approvals + close checklist + Admin/audit.
7. Reports + CSV export + Imports previews.
8. Polish: skeletons, toasts, offline, empty/error states, a11y pass (labels, focus, contrast, 44pt targets), light/dark decision.

## 7. Definition of done for client review

- `tsc`/`eslint`/`vitest` green; `build:web` exports 41+ routes, all HTTP 200 locally, zero console errors on: sign-in → demo login (all 4 roles) → every module → every primary button.
- Route audit: no dead controls; every mock labelled ("mock — Functions enforce in production").
- Review script ready (25 min): ① sign-in + roles (3) ② Overview drill-down (5) ③ WO→traveller→inventory→QC (7) ④ costing run + gate demo (5) ⑤ SOPIC exceptions + approve + close (5).

## 8. Non-goals (say explicitly in review)

Firebase Auth/Rules/Functions wiring, finance sign-off on formulas, live ERP/SOPIC/HR adapters, EAS mobile builds, prod hosting/cutover. Mock layer lives in `src/mocks/*` behind narrow functions so backend swap touches only that boundary.
