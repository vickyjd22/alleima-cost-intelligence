# Deliverable 2 — Navigation Sitemap

Navigation is generated from **one registry** (`src/config/modules.ts`), as it is today. The change is structural, not visual: the flat 17-module list becomes a two-level tree (module → screens). Each screen carries a permission key so nav visibility, route guards and backend authorization all read the same matrix (see `03-role-permission-matrix.md`).

## 1. Sitemap (business hierarchy)

```
Alleima Cost Intelligence
│
├── Auth (public)
│    ├── Login
│    ├── Forgot Password
│    └── Verify / Notice
│
├── Dashboard
│    ├── Executive
│    ├── Production
│    ├── Costing
│    ├── Finance
│    └── Quality
│
├── Production
│    ├── Work Orders
│    │    ├── Work Order List
│    │    ├── Create Work Order
│    │    └── Work Order Details
│    │         ├── Reservations
│    │         ├── Travellers (of this WO)
│    │         ├── Material Issues (of this WO)
│    │         ├── Inspections (of this WO)
│    │         └── Cost to date
│    ├── Travellers
│    │    ├── Traveller List
│    │    └── Traveller Details → Operations, Inspections, Heat lineage
│    ├── Production Entry (shop floor)
│    ├── Machine Tracking
│    └── Operation Tracking
│
├── Inventory
│    ├── RM Inventory
│    ├── WIP Inventory
│    ├── FG Inventory
│    ├── Material Issue (List · New · Detail)
│    ├── Material Receipt (List · New · Detail)
│    ├── Stock Reconciliation
│    ├── Heat Tracking (Heat search → Heat genealogy)
│    └── Bar Tracking
│
├── Quality
│    ├── Inspection Entry (List · New · Detail)
│    ├── Tests
│    │    ├── Hydro Test
│    │    ├── ECT Test
│    │    └── DPT Test
│    ├── Rework Entry
│    ├── Defect Tracking
│    └── Cost of Quality
│
├── Costing
│    ├── Standard Cost Setup
│    ├── Actual Cost Calculation (Runs → Run Detail)
│    │    └── Cost Rollup (per run)
│    ├── Allocation Rules
│    └── Cost Calculation Log
│
├── Variance
│    ├── Variance Dashboard
│    ├── Material Variance
│    ├── Yield Variance
│    ├── Labour Variance
│    ├── Utility Variance
│    ├── Quality Variance
│    └── Scrap Variance
│
├── Profitability
│    ├── Product
│    ├── Customer
│    ├── Order
│    └── Profit Centre
│
├── Finance
│    ├── Inventory Valuation
│    ├── Cost Reconciliation
│    ├── Financial Reconciliation
│    └── Monthly Closing
│
├── Approvals
│    ├── Approvals Queue
│    ├── Approval Details
│    └── Approval History
│
├── Reports
│    ├── Cost Sheets
│    ├── Inventory Reports
│    ├── Production Reports
│    ├── Variance Reports
│    ├── Profitability Reports
│    └── Cost Audit Reports
│
├── Masters
│    ├── Product            ├── Cost Centre
│    ├── Grade              ├── Profit Centre
│    ├── Customer           ├── Routing
│    ├── Supplier           ├── BOM
│    ├── Machine            ├── Allocation Driver
│    ├── UOM                └── Defect
│
├── Administration
│    ├── User Role Assignment
│    ├── Audit Log
│    ├── Period Management
│    ├── Imports
│    ├── Integrations
│    └── Policy & Framework (CAS, Annex E)
│
└── Personal
     ├── Exception Centre
     ├── Notifications
     └── Profile
```

## 2. Expo Router route tree

Folders under `app/(app)/` mirror the business hierarchy. Every folder gets a `_layout.tsx` (a plain `Stack`) so the existing `AppShell` stays the only chrome.

```
app/
├── _layout.tsx                      root Stack + auth-state listener (new)
├── index.tsx                        redirect: signed-in → /dashboard, else → /sign-in
├── (auth)/
│   ├── sign-in.tsx                  AUTH-01
│   ├── forgot-password.tsx          AUTH-02 (new)
│   ├── verify.tsx · notice.tsx      AUTH-04
└── (app)/
    ├── _layout.tsx                  route guard: claims → permission matrix
    ├── dashboard/   index · production · costing · finance · quality
    ├── production/
    │   ├── work-orders/   index · new · [woNo]
    │   ├── travellers/    index · [travellerNo]
    │   ├── entry.tsx · machines.tsx · operations.tsx
    ├── inventory/
    │   ├── rm · wip · fg · reconciliation · bars
    │   ├── issues/    index · new · [id]
    │   ├── receipts/  index · new · [id]
    │   └── heats/     index · [heatId]
    ├── quality/
    │   ├── inspections/  index · new · [id]
    │   ├── tests/        hydro · ect · dpt
    │   └── rework · defects · coq
    ├── costing/
    │   ├── standards · allocation-rules · log
    │   └── runs/   index · [runId] · [runId]/rollup
    ├── variance/       index · material · yield · labour · utility · quality · scrap
    ├── profitability/  product · customer · order · profit-centre
    ├── finance/        inventory-valuation · cost-reconciliation · financial-reconciliation · close
    ├── approvals/      index · history · [id]
    ├── reports/        cost-sheets · inventory · production · variance · profitability · cost-audit
    ├── masters/
    │   └── {products|grades|customers|suppliers|machines|cost-centres|profit-centres|
    │        routings|boms|allocation-drivers|uoms|defects}/  index · new · [id]
    ├── admin/          users · users/[uid] · audit-log · periods · imports · integrations · policies
    └── exceptions · notifications · profile
```

### Mapping from today's flat routes

Existing files are not deleted on day one. Each old route becomes a redirect to its new home until all links have moved. The deep-link/bookmark impact is limited because the build is pre-production.

| Existing route | New home | Migration action |
|---|---|---|
| `/(app)/overview` | `/(app)/dashboard` | move, keep redirect |
| `/(app)/costing` | `/(app)/costing/runs` (+ Allocation tab → `allocation-rules`, Quotation → `profitability/order`) | split tabs into routes |
| `/(app)/cost-centres` | `/(app)/masters/cost-centres` | move |
| `/(app)/profit-centres` | `/(app)/masters/profit-centres` + `profitability/profit-centre` | split; add the missing registry entry |
| `/(app)/planning` | `/(app)/production/work-orders` (+ `new`) | merge plan/release into the WO lifecycle |
| `/(app)/work-orders` | `/(app)/production/work-orders`, `production/travellers`, `production/entry` | split |
| `/(app)/inventory` | `/(app)/inventory/{rm,wip,fg,heats,reconciliation}` | split tabs |
| `/(app)/engineering` | `/(app)/masters/{routings,boms,machines,products}` + `costing/standards` | split tabs |
| `/(app)/quality` | `/(app)/quality/*` + `dashboard/quality` | split |
| `/(app)/finance` | `/(app)/finance/*` + `dashboard/finance` | split |
| `/(app)/approvals` | `/(app)/approvals` | keep |
| `/(app)/exceptions` · `notifications` · `profile` | unchanged | keep |
| `/(app)/reports` | `/(app)/reports/*` | split cards into routes |
| `/(app)/imports` · `integrations` · `admin` | `/(app)/admin/*` | move |
| `/(app)/review` | — | demo only, remove before go-live |

## 3. Registry structure change (data shape, not UI)

```ts
// src/config/modules.ts — proposed shape
export interface AppScreen {
  id: string;            // permission key, e.g. 'production.workOrders'
  title: string;
  route: string;         // '/(app)/production/work-orders'
  screenId: string;      // inventory ID, e.g. 'PRD-01'
}
export interface AppModule {
  id: string;            // 'production'
  title: string;
  group: ModuleGroup;
  icon: string;
  screens: AppScreen[];  // replaces the per-module `roles` array
}
// Visibility = any screen where can(claims.roles, screen.id, 'view') is true.
```

The `roles` arrays on modules are removed. Visibility comes from `src/config/permissions.ts` (the matrix), so there is one source of truth.

## 4. Primary entry and exit points (cross-module navigation)

| From | Action | To |
|---|---|---|
| Executive dashboard KPI | tap | the module screen behind that KPI (e.g. Yield → Variance / Yield) |
| Customer order (Order Profitability) | "Create WO" | Create Work Order (prefilled) |
| Work Order Details | Release | Travellers generated → Traveller Details |
| Work Order Details | Issue material | Material Issue (prefilled WO + reservation) |
| Traveller Details | Inspect | Inspection Entry (prefilled traveller + op) |
| Inspection (Reject / Rework) | disposition | Rework Entry / Defect Tracking |
| Heat Tracking | any node | WO / Traveller / Receipt / Dispatch detail |
| Cost Run Detail | line | Cost Rollup → source record (traveller op, issue, GL pool) |
| Any variance line | investigate | Annex D investigation (inline) → owner notified |
| Monthly Closing step | open | the module screen that produces the step output (e.g. D+9 → WIP Inventory) |
| Any submit action | — | Approvals Queue item for the checker |
| Notification | tap | the referenced record |
| Unauthorized deep link | — | Permission-denied state (already implemented in `AppShell`) |
