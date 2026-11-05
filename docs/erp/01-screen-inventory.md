# Deliverable 1 — Screen Inventory

Scope: Manufacturing Cost Accounting ERP for AIPL Mehsana (tube & pipe — HF, CF, U-Bend flows).
Grounding: existing routes in `app/(app)/*`, domain services in `src/domain/*`, manual AIPL-CAM-001 coverage in `docs/MANUAL_COVERAGE.md`.

**Coverage legend (column "Today")**
- **Exists** — a screen already implements the core behaviour (on demo data).
- **Partial** — behaviour lives inside a broader existing screen (tab / card / drawer) and must be split out.
- **New** — no implementation yet.

**Persona codes:** ADM Admin · FIN Finance · CST Costing · PRD Production · QUA Quality · SCM Supply chain (stores / procurement / sales) · MGT Management. Full role mapping is in `03-role-permission-matrix.md`.

Every master and transactional entity follows one screen pattern: **List** (`index`), **Detail / Edit** (`[id]`), **Create** (`new`). Detail and create are listed separately only where the business process requires it, for example Create Work Order.

---

## 1. Authentication (AUTH)

| ID | Screen | Route | Owner | Key actions | Today | Data / trusted service |
|---|---|---|---|---|---|---|
| AUTH-01 | Login | `/(auth)/sign-in` | All | Email + password sign-in, plant selection when the user has more than one plant | **Exists** (`sign-in.tsx`; demo bypass must be removed) | Firebase Auth; custom claims `roles[]`, `plantIds[]` |
| AUTH-02 | Forgot Password | `/(auth)/forgot-password` | All | Request a reset link; generic confirmation that does not reveal whether an account exists | **New** | `sendPasswordResetEmail` |
| AUTH-03 | User Role Assignment | `/(app)/admin/users` + `[uid]` | ADM | Invite user, assign roles + plants, deactivate. Privileged grants go through maker-checker | **Partial** (`profile.tsx` demo role switcher, `admin.tsx`) | Function `setUserAccess` → `users`, custom claims, `auditLogs` |
| AUTH-04 | Verify / Notice | `/(auth)/verify`, `/(auth)/notice` | All | Invite acceptance, account-disabled notice | **Exists** | — |

## 2. Dashboards (DSH)

| ID | Screen | Route | Owner | Key content | Today | Data |
|---|---|---|---|---|---|---|
| DSH-01 | Executive Dashboard | `/(app)/dashboard` | MGT | §23 KPIs (Material / Process / Conversion / Commercial), close progress, reconciliation health, top exceptions | **Exists** (`overview.tsx`) | `kpiSnapshots/{period}`, `periods`, `reconciliations` |
| DSH-02 | Production Dashboard | `/(app)/dashboard/production` | PRD | WO status funnel, WIP ageing 30/60/90, machine loading & breakdown % (§9.4), yield by flow | **New** | `workOrders`, `travellers`, `machineLogs`, `kpiSnapshots` |
| DSH-03 | Costing Dashboard | `/(app)/dashboard/costing` | CST | Cost-run status, pool-vs-allocated gate, cost/kg by flow & grade group, top variances | **Partial** (costing workbench header) | `costCalculations`, `allocations`, `variances` |
| DSH-04 | Finance Dashboard | `/(app)/dashboard/finance` | FIN | Close D+1..D+12 status, SOPIC bridge, Invoice-0 register, inventory valuation, under/over-absorption | **Partial** (`finance.tsx`) | `periods`, `reconciliations`, `inventoryValuations` |
| DSH-05 | Quality Dashboard | `/(app)/dashboard/quality` | QUA | First-pass yield, rejection / rework %, defect Pareto, CoQ (4 classes, CAS-21), cert backlog | **Partial** (`quality.tsx`) | `qualityInspections`, `defects`, `coqSnapshots` |

## 3. Master Data (MST)

All masters are **effective-dated and versioned**. A change creates a new version in `Draft`, and the version must be approved before it becomes effective. Approved versions are never edited. Deleting a master means deactivating it (`active=false`). Hard delete is allowed only for drafts that nothing references.

| ID | Screen | Route | Owner | Key fields / rules | Today | Collection |
|---|---|---|---|---|---|---|
| MST-01 | Product Master | `/(app)/masters/products` | CST | Product ID, grade, grade group, OD/WT/length, product type, CTA/HSN, UOM, default flow | **Partial** (`engineering.tsx` Products & BOM) | `products` |
| MST-02 | Grade Master | `/(app)/masters/grades` | QUA | Grade (304, 2205…), grade group (7 groups §19.2), chemistry / spec reference, density for kg↔m | **New** | `grades` |
| MST-03 | Customer Master | `/(app)/masters/customers` | SCM | Customer code, group, ERP ref, credit / incoterms (reference only), default PC | **New** | `customers` |
| MST-04 | Supplier Master | `/(app)/masters/suppliers` | SCM | Supplier code, approved-vendor status, origin (heat origin), ERP ref | **New** | `suppliers` |
| MST-05 | Machine Master | `/(app)/masters/machines` | PRD | Machine ID, CC code, asset ID, installed / practical capacity (CAS-2), meters | **Partial** (`engineering.tsx` Machines) | `machines` |
| MST-06 | Cost Centre Master | `/(app)/masters/cost-centres` | CST | `8204…` code (zod rule), type (production / service / project / reporting), dept, owner, driver, UOM, PC link, GL elements | **Exists** (`cost-centres.tsx`, 127 rows) | `costCenters` |
| MST-07 | Profit Centre Master | `/(app)/masters/profit-centres` | FIN | PC 513/514/517, entity 8911, interim-posting allowed (514) | **Exists** (`profit-centres.tsx`, not yet in the nav registry) | `profitCenters` |
| MST-08 | Routing Master | `/(app)/masters/routings` | PRD | Flow (HF / CF / U-Bend), ops `{seq, process, ccCode, machineId, stdMachineHrs, stdLabourHrs, stdYield%}` | **Partial** (`engineering.tsx` Routes) | `routings` + `ops` subcollection |
| MST-09 | BOM Master | `/(app)/masters/boms` | PRD | Product, version, input material / grade, input kg per output kg, scrap factor, recovery value | **Partial** (`engineering.tsx`) | `boms` + `lines` subcollection |
| MST-10 | Allocation Driver Master | `/(app)/masters/allocation-drivers` | CST | §15.2 pool → primary / secondary driver, driver UOM, source of quantity | **Partial** (Costing → Allocation tab, `DRIVER_MATRIX`) | `allocationDrivers` |
| MST-11 | UOM Master | `/(app)/masters/uoms` | CST | UOM, conversions (kg ↔ m via grade density + OD/WT, pcs) | **New** | `uoms` |
| MST-12 | Defect Master | `/(app)/masters/defects` | QUA | Defect code (ECT-LINE, DIM-OD, SURFACE…), category, detecting test, default disposition, CoQ class | **New** | `defects` |

## 4. Production (PRD)

| ID | Screen | Route | Owner | Key actions | Today | Trusted service |
|---|---|---|---|---|---|---|
| PRD-01 | Work Order List | `/(app)/production/work-orders` | PRD | Filter by status / product / customer order / period, ageing | **Exists** (`work-orders.tsx` table) | read `workOrders` |
| PRD-02 | Work Order Details | `/(app)/production/work-orders/[woNo]` | PRD | Status timeline, BOM / routing snapshot, reservations, travellers, issues, inspections, cost-to-date. Transitions: submit, approve, release, hold, complete, close | **Partial** (drawer in `work-orders.tsx`) | `transitionWorkOrder` (domain) via Function `transitionWorkOrder` |
| PRD-03 | Create Work Order | `/(app)/production/work-orders/new` | PRD | From customer order line: product, qty / kg, due date. Approved BOM + routing auto-selected (effective on start date), with override and reason | **Partial** (`planning.tsx` plan → release) | Function `createWorkOrder` |
| PRD-04 | Traveller List | `/(app)/production/travellers` | PRD | By WO / heat / machine / status / current op | **Exists** (`work-orders.tsx` travellers table) | read `travellers` |
| PRD-05 | Traveller Details | `/(app)/production/travellers/[travellerNo]` | PRD | Op-by-op input / output qty + kg, scrap, rework, machine & labour hours, inspections, heat lineage | **Partial** | read `travellers/{no}/operations` |
| PRD-06 | Production Entry | `/(app)/production/entry` | PRD (operator) | Shop-floor flow: scan traveller → start op → record output / scrap → confirm. Supervisor approves exceptions | **Partial** (`work-orders.tsx` stepper) | Function `recordOperation` (validates `travellerEntrySchema`) |
| PRD-07 | Machine Tracking | `/(app)/production/machines` | PRD | Machine log: run / idle / changeover / breakdown (mech / elec) hours, reason codes, meter readings | **New** | `machineLogs` |
| PRD-08 | Operation Tracking | `/(app)/production/operations` | PRD | Cross-traveller view of ops by CC / machine / shift: std vs actual hours, yield per op | **New** | collection-group query on `operations` |

## 5. Inventory (INV)

| ID | Screen | Route | Owner | Key actions | Today | Trusted service |
|---|---|---|---|---|---|---|
| INV-01 | RM Inventory | `/(app)/inventory/rm` | SCM | Balance by material / grade / heat / location, qty + kg, landed value | **Partial** (`inventory.tsx` Stock) | read `inventoryBalances` |
| INV-02 | WIP Inventory | `/(app)/inventory/wip` | PRD | WIP by WO / traveller / stage (last completed op), value at cost to stage, ageing 30/60/90 (§13) | **Partial** | read `inventoryBalances` (location type WIP) |
| INV-03 | FG Inventory | `/(app)/inventory/fg` | SCM | FG by product / order / heat, QA-released flag, cert status | **Partial** | read `inventoryBalances` |
| INV-04 | Material Issue | `/(app)/inventory/issues` (+`new`, `[id]`) | SCM | Issue slip against WO reservation (heat / bar specific). Excess over BOM needs approval | **Partial** (ledger validation only) | Function `postMaterialIssue` → `inventoryTxns` |
| INV-05 | Material Receipt | `/(app)/inventory/receipts` (+`new`, `[id]`) | SCM | GRN against PO / supplier, heat + mill cert, incoming QA hold → accept | **New** | Function `postReceipt` |
| INV-06 | Stock Reconciliation | `/(app)/inventory/reconciliation` | SCM | Physical vs book by heat / bar; adjustment proposals need approval (`adjust` needs a reason) | **Partial** (`inventory.tsx` Physical) | Function `proposeAdjustment` → approval → `postLedgerTxn` |
| INV-07 | Heat Tracking | `/(app)/inventory/heats/[heatId]` | SCM | Heat genealogy: receipt → issues → WO → travellers → FG → dispatch (§3 chain, §6) | **Exists** (`inventory.tsx` Trace) | read `heats`, `inventoryTxns` |
| INV-08 | Bar Tracking | `/(app)/inventory/bars` | SCM | Bar / length-level stock within a heat (length + weight, §6), cut-piece remnants | **New** | `heats/{heatId}/bars` |

## 6. Quality (QUA)

| ID | Screen | Route | Owner | Key actions | Today | Trusted service |
|---|---|---|---|---|---|---|
| QUA-01 | Inspection Entry | `/(app)/quality/inspections` (+`new`, `[id]`) | QUA | Stage / final inspection (visual, dimensional) per traveller op; disposition Accept / Rework / Reject / Hold | **Partial** (`quality.tsx` inspections table) | Function `recordInspection` |
| QUA-02 | Hydro Test | `/(app)/quality/tests/hydro` | QUA | Test pressure, hold time, result per piece / lot; U-Tube hydro (CC 820410354) | **New** | `qualityInspections` (`testType=hydro`) |
| QUA-03 | ECT Test | `/(app)/quality/tests/ect` | QUA | 100% ECT (CC 820410335), calibration ref, defect marks → defect code | **New** | `testType=ect` |
| QUA-04 | DPT Test | `/(app)/quality/tests/dpt` | QUA | Dye-penetrant result, indication type, location | **New** | `testType=dpt` |
| QUA-05 | Rework Entry | `/(app)/quality/rework` | QUA | Rework order from a disposition: inserted op(s), re-inspection required, rework cost captured | **New** | Function `createRework` → traveller ops |
| QUA-06 | Defect Tracking | `/(app)/quality/defects` | QUA | Defect register: code, process, root cause, CAPA, recovery (§12) | **Partial** (`quality.tsx`) | `qualityInspections.defects`, CAPA tracked in `exceptions` |
| QUA-07 | Cost of Quality | `/(app)/quality/coq` | QUA / CST | 4-class CoQ (prevention, appraisal, internal failure, external failure), CAS-21 | **Partial** (`quality.tsx` CoQ panel) | computed by cost engine → `coqSnapshots` |

## 7. Cost Engine (CST)

| ID | Screen | Route | Owner | Key actions | Today | Trusted service |
|---|---|---|---|---|---|---|
| CST-01 | Standard Cost Setup | `/(app)/costing/standards` | CST | Versioned standard rates (machine / labour / utility / OH per CC), std material cost per kg by grade, std yield per routing op. Effective dates, approval (D-12) | **Partial** (Engineering rate card, Costing version compare) | `rateTables`, `standardCosts` |
| CST-02 | Actual Cost Calculation | `/(app)/costing/runs` + `[runId]` | CST | Create run (period, scope) → validate completeness → calculate → submit → approve → finalize (`COSTING_MACHINE`) | **Exists** (`costing.tsx` Workbench; maker-checker on demo) | Function `runCostCalculation` |
| CST-03 | Cost Rollup | `/(app)/costing/runs/[runId]/rollup` | CST | Drill-down op → traveller → WO → product (per kg), by element (Annex A 14 lines), trace to source | **Partial** (trace drawer) | `costCalculations/{runId}/lines` |
| CST-04 | Allocation Rules | `/(app)/costing/allocation-rules` | CST | Service → production CC allocation (§15), pool definitions (8 pools), sequence, gate pool-vs-allocated = 0 | **Partial** (Costing → Allocation tab) | `allocationRules`, results in `allocations` |
| CST-05 | Cost Calculation Log | `/(app)/costing/log` | CST | Immutable run history: inputsHash, policy / rate versions, who / when, lineage (recalculation of…) | **New** | `costCalculations` (read-only) + `auditLogs` |

## 8. Variance (VAR)

Each variance screen supports an **Annex D investigation record** (root cause, corrective action, owner, due date, closure). The owner persona is the one accountable for the root cause.

| ID | Screen | Route | Owner | Content | Today |
|---|---|---|---|---|---|
| VAR-01 | Variance Dashboard | `/(app)/variance` | CST | Total variance bridge std → actual by element, period trend, top 10, open investigations | **Partial** (Costing workbench variance table) |
| VAR-02 | Material Variance | `/(app)/variance/material` | CST (root cause SCM) | MPV (price) and MUV (usage) by grade / heat / supplier | **Partial** (MPV / MUV calcs exist) |
| VAR-03 | Yield Variance | `/(app)/variance/yield` | CST (root cause PRD) | Yield variance by flow / op / grade; §14 6-level yield dictionary | **Partial** (Reports yield) |
| VAR-04 | Labour Variance | `/(app)/variance/labour` | CST (root cause PRD) | Rate + efficiency, normal vs abnormal idle (§8.4) | **New** |
| VAR-05 | Utility Variance | `/(app)/variance/utility` | CST (root cause PRD) | kWh / gas / water: price + usage vs norm (§10) | **New** |
| VAR-06 | Quality Variance | `/(app)/variance/quality` | CST (root cause QUA) | Actual vs standard CoQ, rework cost, rejection cost | **New** |
| VAR-07 | Scrap Variance | `/(app)/variance/scrap` | CST (root cause PRD) | Std vs actual scrap %, net of recovery; normal vs abnormal (§14.2) | **New** |

All variances are persisted in `variances` by the cost engine. No variance screen computes values on the client.

## 9. Profitability (PRF)

| ID | Screen | Route | Owner | Content | Today |
|---|---|---|---|---|---|
| PRF-01 | Product Profitability | `/(app)/profitability/product` | CST | §19.1 waterfall per product / grade / size / flow | **Partial** (Reports margin card) |
| PRF-02 | Customer Profitability | `/(app)/profitability/customer` | CST (SCM view) | Margin by customer / group, cost-to-serve (S&D) | **New** |
| PRF-03 | Order Profitability | `/(app)/profitability/order` | CST (SCM view) | Order-level: NSR − RM − conversion − quality − packing − S&D = contribution. Quote vs actual | **Partial** (Costing → Quotation tab) |
| PRF-04 | Profit Centre Profitability | `/(app)/profitability/profit-centre` | FIN | PC 513/514/517 result, tied to SOPIC / PC bridge | **Partial** (`profit-centres.tsx` bridge) |

## 10. Finance (FIN)

| ID | Screen | Route | Owner | Key actions | Today |
|---|---|---|---|---|---|
| FIN-01 | Inventory Valuation | `/(app)/finance/inventory-valuation` | FIN | RM / WIP / FG valuation at period end (method per decision), NRV check, ageing provision | **Partial** (WIP statement) |
| FIN-02 | Cost Reconciliation | `/(app)/finance/cost-reconciliation` | CST | Pools collected = allocated = absorbed + under/over-absorption; GL (by CC) ↔ cost pools | **Partial** (pool gate demo) |
| FIN-03 | Financial Reconciliation | `/(app)/finance/financial-reconciliation` | FIN | §18 6-layer bridge SOPIC → ledger → PC → product account → dispatch → costing; Invoice-0 / PC exceptions (`RECON_MACHINE`) | **Exists** (`finance.tsx`) |
| FIN-04 | Monthly Closing | `/(app)/finance/close` | FIN | D+1..D+12 (11 steps) + Annex B 18 checks, step owners sign off, period lock / reopen | **Partial** (finance checklist + admin lock) |

## 11. Approvals (APR)

| ID | Screen | Route | Owner | Content | Today |
|---|---|---|---|---|---|
| APR-01 | Approvals Queue | `/(app)/approvals` | All (own items) | Pending items assigned to the user's role, by kind (WO release, excess issue, stock adjustment, master version, rate version, cost run, recon resolution, period reopen, role grant) | **Exists** |
| APR-02 | Approval Details | `/(app)/approvals/[id]` | Approver | Record snapshot at the submitted version, diff vs current, approve / reject / request changes with reason (APR-01, APR-02) | **Partial** (review drawer) |
| APR-03 | Approval History | `/(app)/approvals/history` | All | Decided items, filters by kind / decision / actor / period | **New** |

## 12. Reports (RPT)

| ID | Screen | Route | Owner | Content | Today |
|---|---|---|---|---|---|
| RPT-01 | Cost Sheets | `/(app)/reports/cost-sheets` | CST | Annex A 14-line cost sheet (Std / Actual / Variance / Comment) per product / WO / order | **Partial** (Reports Annex A) |
| RPT-02 | Inventory Reports | `/(app)/reports/inventory` | SCM | Stock statement, heat / bar reconciliation, movement register, ageing | **New** |
| RPT-03 | Production Reports | `/(app)/reports/production` | PRD | Output by flow / CC / machine, yield, utilization (§9.4 KPIs), WO completion | **New** |
| RPT-04 | Variance Reports | `/(app)/reports/variance` | CST | Annex D register, variance by element / CC / product, trend | **Partial** |
| RPT-05 | Profitability Reports | `/(app)/reports/profitability` | CST | All §19.2 dimensions, period comparison | **Partial** |
| RPT-06 | Cost Audit Reports | `/(app)/reports/cost-audit` | FIN | CRA-1 13-area readiness (§21), CAS compliance references, audit-trail extract | **Partial** (Reports CRA-1 matrix) |

## 13. Supporting screens (keep from the existing app)

These are not in the requested list but already exist and support the processes above. They are kept.

| ID | Screen | Route | Today | Purpose |
|---|---|---|---|---|
| SUP-01 | Exception Centre | `/(app)/exceptions` | Exists | Cross-module exceptions (Invoice-0, missing CC, negative stock attempt, gate failures) with owner / due date |
| SUP-02 | Notifications | `/(app)/notifications` | Exists | Per-user inbox driven by domain events |
| SUP-03 | Profile | `/(app)/profile` | Exists | Account, plant switch. **Remove the demo role switcher in production.** |
| SUP-04 | Audit Log | `/(app)/admin/audit-log` | Partial (`admin.tsx` feed) | Append-only trail: actor, action, entity, before / after, reason (§21.2) |
| SUP-05 | Period Management | `/(app)/admin/periods` | Partial (`admin.tsx` lock) | Open / lock / reopen periods (reopen needs approval, D-14) |
| SUP-06 | Imports | `/(app)/admin/imports` | Exists (`imports.tsx`) | Master-data CSV import: validate → fix → commit (uses `previewCostCentres`) |
| SUP-07 | Integrations | `/(app)/admin/integrations` | Exists (`integrations.tsx`) | ERP / SAP, SOPIC, HR adapter status and sync logs (D-16) |
| SUP-08 | Policy & Framework | `/(app)/admin/policies` | Partial (`admin.tsx` CAS list, Annex E form) | CAS reference, Annex E policy change requests (triple approval) |
| — | Client Review | `/(app)/review` | Exists | **Demo-only. Retire before production.** |

## Totals

| Group | Screens | Exists | Partial | New |
|---|---:|---:|---:|---:|
| Authentication | 4 | 2 | 1 | 1 |
| Dashboards | 5 | 1 | 3 | 1 |
| Master Data | 12 | 2 | 5 | 5 |
| Production | 8 | 2 | 4 | 2 |
| Inventory | 8 | 1 | 5 | 2 |
| Quality | 7 | 0 | 3 | 4 |
| Cost Engine | 5 | 1 | 3 | 1 |
| Variance | 7 | 0 | 3 | 4 |
| Profitability | 4 | 0 | 3 | 1 |
| Finance | 4 | 1 | 3 | 0 |
| Approvals | 3 | 1 | 1 | 1 |
| Reports | 6 | 0 | 4 | 2 |
| Supporting | 8 | 5 | 3 | 0 |
| **Total** | **81** | **16** | **41** | **24** |

"Exists" still means **demo data**. Every screen needs its repository switched from `demoDb` / `manual.ts` to Firestore (see `08-implementation-roadmap.md`).
