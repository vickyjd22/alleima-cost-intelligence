# Screen Specification — Alleima Cost Intelligence

_Phase 4 deliverable. One row per screen, grounded in the current code. Data sources are the in-memory mocks (`demoDb`, `sample.ts`, `manual.ts`) unless noted. Business rules are **not** invented; ambiguities are flagged `❓ client`._

## Legend

- **Roles** use the 15-role model in `src/lib/permissions.ts`; visibility is driven by `modulesForRoles` (role ∩ module.roles).
- **States** = Loading (`useMockLoading`+`Skeleton`), Empty (`DataTable`/`EmptyState`), Error, Success.
- All `(app)` screens share the `AppShell` chrome (navy rail, header with search/period/notifications/avatar, breadcrumb, DEMO pill) and `BottomNav` on <1024 px.

## Auth screens

| Screen | Route | Purpose | Roles | Key inputs / validation | States | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Sign-in | `/(auth)/sign-in` | Enter the workspace | Public | Email/password (client-validated); 4 one-click demo accounts | Loading (submit), Error (`Callout`) | Real email → Firebase (no auth-listener wired); demo path navigates. ❓ client: real auth in scope? |
| Splash | `/(auth)/splash` | Loading / onboarding | Public | — | — | Legacy styling (compat `tokens`, auto-inherits new palette) |
| Verify | `/(auth)/verify` | Email-verification notice | Public | — | — | Static |
| Notice | `/(auth)/notice` | Generic notice | Public | — | — | Static |

## Application screens

### Workspace

**Overview** — `/(app)/overview`
- **Purpose/benefit:** single management picture of cost + close health for the period.
- **Roles:** all.
- **Shows:** reconciliation/close health card, 4 KPI quads (Material / Process / Conversion / Commercial), yield chart, "needs attention" list.
- **Actions:** KPI cards deep-link to modules; period switch (header).
- **Data:** `reconcileSopic(demoDb.sopic, KNOWN_PCS)`, `closeProgress`, `KPI_TRIGGERS`.
- **States:** Loading skeleton; lists have empty states.
- **Responsive:** quads reflow 4→2→1; rail → bottom nav <1024.

**Costing Workbench** — `/(app)/costing`
- **Purpose:** calculate, trace, and approve cost runs.
- **Roles:** all except `operator`.
- **Shows:** 4 tabs — Workbench (variance table, per-line trace drawer, status chips for SAMPLE MHR/MPV/MUV/Yield, version compare), Allocation §15, Overheads §16/17, Quotation §19 (interactive sensitivity).
- **Actions:** Submit for review; Approve + lock (maker-checker, self-approval blocked, ₹250 pool-imbalance simulation blocks approve §15.3); compare versions; adjust quotation inputs.
- **Validation/logic:** `machineHourRate`, `materialPriceVariance`, `materialUsageVariance`, `yieldPct` (real, tested).
- **States:** Loading skeleton; disabled buttons + toast for blocked actions.
- **Notes:** calcs labelled SAMPLE; approval is presentational (comment: "Functions enforce in production").

**Cost & Profit Centres** — `/(app)/cost-centres`
- **Purpose:** maintain CC master; see dept summary + exceptions.
- **Roles:** all except `operator`.
- **Validation:** `costCentreSchema` — code must match `/^8204/`, required description/department/type/owner/driver/uom.
- **States:** table empty state; inline form errors.

**Profit Centres** — `/(app)/profit-centres`
- **Purpose:** PC list + SOPIC/PC bridge reconciliation. **Roles:** all except `operator`. **Data:** `pcBridge`, `SAMPLE_PROFIT_CENTRES`.

### Operations

| Screen | Route | Purpose | Roles | Actions / logic |
| --- | --- | --- | --- | --- |
| Production Planning | `/(app)/planning` | Plan → release | mgmt/prodMgr/supervisor/costing/finance/admins/auditor | "Release" plan (+audit) |
| Work Orders & Travellers | `/(app)/work-orders` | WO + traveller records | all | `validateLedgerIntent`, `travellerEntrySchema` |
| Inventory & Traceability | `/(app)/inventory` | Heat → movement → WO → traveller → FG | mgmt/costing/finance/prodMgr/supervisor/stores/quality/engineering/auditor/admins | ledger validation |
| Engineering & Masters | `/(app)/engineering` | Routes, MHR pools, capacity, rate card | mgmt/costing/finance/engineering/auditor/admins | reads `manual.ts`, `SAMPLE_PRODUCTS` |
| Quality | `/(app)/quality` | Inspections, defects, COQ | mgmt/quality/prodMgr/supervisor/costing/auditor/admins | — |

### Finance & control

| Screen | Route | Purpose | Roles | Actions / logic |
| --- | --- | --- | --- | --- |
| Finance & Reconciliation | `/(app)/finance` | Match → discrepancy → adjust → lock | mgmt/costing/finance/auditor/admins | `reconcileSopic` worklist; assign owner/due |
| Approvals & Exceptions | `/(app)/approvals` | Submit → reject → resubmit → approve | all | maker-checker (maker ≠ checker), mutates `demoDb.approvals` |
| Exception Centre | `/(app)/exceptions` | Triage exceptions | all | invoice-0 / unknown-PC routing |

### Insights & admin

| Screen | Route | Purpose | Roles |
| --- | --- | --- | --- |
| Reports & Analytics | `/(app)/reports` | Yield dictionary, loss treatment, variances, cost-sheet, close checklist | all except operator |
| Client Review | `/(app)/review` | Prototype hub: journeys, module catalogue, feedback | all |
| Notifications | `/(app)/notifications` | Inbox | all |
| Imports & Integrations | `/(app)/imports` | CSV template → validate → fix → commit | admins/costing/finance/stores/auditor |
| Integrations | `/(app)/integrations` | ERP/connection checks | admins/costing/finance/auditor |
| Administration & Audit | `/(app)/admin` | CAS list, policy, master links, demo reset | platformAdmin/clientAdmin/finance/auditor |
| Profile | `/(app)/profile` | Account + **demo-only** role switcher | all |

## Cross-cutting requirements

- **Loading:** every `(app)` screen shows a skeleton for ~600 ms (`useMockLoading`).
- **Empty:** every table falls back to `EmptyState`.
- **Error:** inline field errors + `Callout`/`StateView`; no global error boundary today (no network layer).
- **Permission-denied:** ❓ **gap** — deep-linking any route renders for the default session; today only nav hides unauthorised modules. Recommend a guarded denied state in the production phase.
- **Responsive:** breakpoints `compact 760 / wide 1024 / roomy 1320`.
- **Accessibility:** roles/labels present on interactive elements; target WCAG 2.2 AA (full validation in Phase 8).

## Open questions for client (`❓`)

1. Is real Firebase auth + Firestore wiring in scope, or does the review build stay mocked?
2. Should unauthorised deep-links show a permission-denied screen (vs. redirect to overview)?
3. Are the costing formulas (§1/§15/§16/§17/§19) finance-approved, or still candidates?
4. Confirm the 15-role model and each module's role visibility.
5. Is dark mode required?
