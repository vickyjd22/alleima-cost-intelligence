# Workflow Mapping — Alleima Cost Intelligence

_Phase 4 deliverable. Maps the major cross-screen user journeys grounded in the current code. Diagrams use Mermaid. No new business rules are invented._

## Navigation model

```mermaid
flowchart LR
  entry["expo-router/entry"] --> root["app/_layout (Stack)"]
  root --> idx["app/index → Redirect"]
  idx --> signin["/(auth)/sign-in"]
  signin -- demo or Firebase --> overview["/(app)/overview"]
  overview --> rail["AppShell rail + header\n(modulesForRoles)"]
  rail --> any["Any (app) module"]
```

Chrome is provided per-screen by `AppShell`; navigation targets come from the single `modules.ts` registry, filtered by role.

## Journey A — Management overview → exception

```mermaid
flowchart LR
  A1["Overview KPIs"] --> A2["Needs-attention item"]
  A2 --> A3["Costing variance / Finance recon"]
  A3 --> A4["Exception Centre"]
  A4 --> A5["Export CSV (web)"]
```
Roles: management/auditor. Data: `reconcileSopic`, `KPI_TRIGGERS`. Reversible: read-only until export.

## Journey B — Costing calculation & maker-checker approval

```mermaid
flowchart LR
  B1["Costing · Workbench"] --> B2["Review variance lines\n(trace drawer)"]
  B2 --> B3{"Status = draft?"}
  B3 -- yes --> B4["Submit for review"]
  B4 --> B5{"Pool imbalance = 0?"}
  B5 -- "₹250 ≠ 0 (§15.3)" --> B6["Approve BLOCKED\n(toast)"]
  B5 -- "= 0" --> B7{"Approver ≠ submitter?"}
  B7 -- no --> B8["Self-approval BLOCKED"]
  B7 -- yes --> B9["Approve + lock"]
```
Logic: `machineHourRate/MPV/MUV/yieldPct` (real); maker-checker mirrors `canApprove` semantics (currently inline). Reversible: demo state resets via admin.

## Journey C — Work-order lifecycle

```mermaid
flowchart LR
  C1["Planning"] --> C2["Release plan (+audit)"]
  C2 --> C3["Work Orders & Travellers"]
  C3 --> C4["Record traveller entry\n(travellerEntrySchema)"]
  C4 --> C5["Quality inspection"]
  C5 --> C6["FG receipt"]
```
Roles: prodMgr/supervisor/operator/quality. Validation: `travellerEntrySchema`, `validateLedgerIntent`.

## Journey D — Material traceability

```mermaid
flowchart LR
  D1["Inventory · heat search"] --> D2["Movements"]
  D2 --> D3["Work order"]
  D3 --> D4["Traveller HF→CF"]
  D4 --> D5["WIP → FG → Dispatch"]
```
Mirrors the `TraceabilityTimeline` steps in `costing.tsx`.

## Journey E — Finance reconciliation & close

```mermaid
flowchart LR
  E1["Finance worklist"] --> E2{"SOPIC row"}
  E2 -- matched --> E3["Clear"]
  E2 -- "Invoice 0/blank" --> E4["Invoice-0 exception"]
  E2 -- "unknown PC" --> E5["PC exception"]
  E4 --> E6["Assign owner + due"]
  E5 --> E6
  E6 --> E7["Close checklist (closeProgress)"]
```
Logic: `reconcileSopic` (matched / invoiceZero / pcExceptions), `isPlaceholderInvoice`, `closeProgress`, `CLOSE_STEPS`.

## Journey F — Master-data import

```mermaid
flowchart LR
  F1["Imports · upload CSV"] --> F2["previewCostCentres"]
  F2 --> F3{"Valid?"}
  F3 -- "bad code / dup" --> F4["Show errors + duplicate rows"]
  F4 --> F5["Fix + re-upload"]
  F3 -- yes --> F6["Commit (mock)"]
```
Logic: `previewCostCentres` (code `/^8204/`, duplicate detection), `costCentreSchema`.

## Journey G — Approvals queue

```mermaid
flowchart LR
  G1["Approvals · pending"] --> G2["Open item (Review)"]
  G2 --> G3{"Decision"}
  G3 -- reject --> G4["Reason required → resubmit"]
  G3 -- approve --> G5{"maker ≠ checker?"}
  G5 -- no --> G6["Blocked"]
  G5 -- yes --> G7["Approved"]
```

## Role → workspace visibility

```mermaid
flowchart TB
  roles["session.roles"] --> f["modulesForRoles()"]
  f --> rail["Sidebar + search"]
  f --> bn["BottomNav"]
  note["operator: no Costing/Finance/Reports;\nauditor: read-oriented;\nadmins: Admin & Audit"]
```

## Reversibility note (safety)

All journeys operate on in-memory mocks; mutations reset via `resetDemo()`/`resetAudit()` in Admin. No production records are touched. Real writes are explicitly out of scope until the production phase and client sign-off.
