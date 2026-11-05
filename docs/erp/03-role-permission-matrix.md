# Deliverable 3 — Role Permission Matrix

## 1. Business personas → existing technical roles

The code already defines 15 roles (`src/lib/permissions.ts`), carried as Firebase custom claims. The matrix below is written for the 7 business personas you asked for. Each technical role maps to exactly one persona, plus a **scope restriction** where the persona is broad.

| Persona | Technical roles (claims) | Scope restriction inside the persona |
|---|---|---|
| **ADM** Admin | `platformAdmin`, `clientAdmin` | Configuration, users, masters deactivation. **No transactional posting or approval of business documents** (segregation of duties). |
| **FIN** Finance | `finance`, `hr` | `hr` limited to payroll allocation inputs (D-17 pending). |
| **CST** Costing | `costing` | — |
| **PRD** Production | `productionMgr`, `supervisor`, `operator`, `engineering` | `operator`: Production Entry, own travellers, read own WO only. `supervisor`: approves operator exceptions. `engineering`: BOM / routing / machine masters only. `productionMgr`: full persona. |
| **QUA** Quality | `quality` | — |
| **SCM** Supply chain | `stores`, `procurement`, `sales` | `stores`: inventory transactions. `procurement`: suppliers, receipts. `sales`: customers, orders, customer / order profitability (view). |
| **MGT** Management | `management` | Approver of last resort and escalation target. |
| _(overlay)_ Auditor | `auditor` | **V + X on every screen, nothing else.** Read-only by rule (`isReadOnlyAuditor`). |

## 2. Legend

| Code | Meaning |
|---|---|
| **V** | View |
| **C** | Create |
| **E** | Edit (drafts or own open records only; approved and posted records are never edited) |
| **A** | Approve (maker ≠ checker is enforced server-side, rule APR-01; stale version blocked, APR-02) |
| **D** | Delete: **drafts only**. Masters are deactivated, never hard-deleted once referenced. Posted ledger, inspection, cost-run and audit records are **never deleted** (INV-03, COST-02); they are reversed or superseded instead. |
| **X** | Export (CSV / XLSX / PDF) |
| — | No access (screen hidden, route guarded, Firestore read denied) |

## 3. Matrix

### Authentication & Administration

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| AUTH-01 Login / AUTH-02 Forgot Password | public | public | public | public | public | public | public |
| AUTH-03 User Role Assignment | VCEADX ¹ | — | — | — | — | — | V |
| SUP-04 Audit Log | VX | VX | VX | — | — | — | VX |
| SUP-05 Period Management | V | VCEA ² | V | — | — | — | VA ² |
| SUP-06 Imports | VCEX | VCEX | VCEX | — | — | VC | — |
| SUP-07 Integrations | VCEX | VX | VX | — | — | — | V |
| SUP-08 Policy & Framework (Annex E) | V | VCEA | VCE | V | V | V | VA ³ |

¹ A privileged grant (`platformAdmin`, `clientAdmin`, `finance` approve rights) needs a second admin's approval.
² Lock = FIN. Reopen = FIN request + MGT approval (D-14 pending).
³ Annex E triple approval: preparer (CST/FIN) → reviewer (FIN) → approver (MGT).

### Dashboards

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| DSH-01 Executive | V | VX | VX | — | — | — | VX |
| DSH-02 Production | V | V | VX | VX | V | V | VX |
| DSH-03 Costing | V | VX | VX | — | — | — | VX |
| DSH-04 Finance | V | VX | VX | — | — | — | VX |
| DSH-05 Quality | V | V | VX | V | VX | — | VX |

### Master Data

Pattern: the owner creates and edits drafts, the accountable persona approves, and ADM deactivates. The RACI follows manual §22.1 (BOM/Routing: Ops = R, Costing = A; Standard rates: Costing = R, Finance = A).

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| MST-01 Product | VDX | V | VCEX | V | V | V | V |
| MST-02 Grade | VDX | V | VA | V | VCEX | V | V |
| MST-03 Customer | VDX | VA | V | — | — | VCEX | V |
| MST-04 Supplier | VDX | VA | V | — | V | VCEX | V |
| MST-05 Machine | VDX | V | VA | VCEX | — | — | V |
| MST-06 Cost Centre | VDX | VA | VCEX | V | — | — | V |
| MST-07 Profit Centre | VDX | VCEX | V | — | — | — | VA |
| MST-08 Routing | VDX | V | VAX | VCEX | V | — | V |
| MST-09 BOM | VDX | V | VAX | VCEX | V | V | V |
| MST-10 Allocation Driver | VDX | VA | VCEX | — | — | — | V |
| MST-11 UOM | VDX | V | VCEX | V | V | V | — |
| MST-12 Defect | VDX | — | V | V | VCEAX ⁴ | — | V |

⁴ Within QUA, the maker and checker must be different users.

### Production

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| PRD-01 Work Order List | V | VX | VX | VX | V | V | VX |
| PRD-02 Work Order Details | V | V | V | VEAD ⁵ | V | V | VA ⁶ |
| PRD-03 Create Work Order | — | — | — | C | — | C ⁷ | — |
| PRD-04 Traveller List | V | V | VX | VX | VX | V | V |
| PRD-05 Traveller Details | V | V | V | VE | V | V | V |
| PRD-06 Production Entry | — | — | — | VCEA ⁸ | V | — | — |
| PRD-07 Machine Tracking | V | — | V | VCEX | — | — | V |
| PRD-08 Operation Tracking | V | — | VX | VX | V | — | V |

⁵ Approve WO = `productionMgr` (not the creator). Delete = Draft WOs only. Hold and cancel always need a reason (WO-02).
⁶ Escalation / override approval only.
⁷ `sales` raises the WO request from a customer order line. `productionMgr` plans and submits.
⁸ C/E = `operator`. A = `supervisor` (only for entries outside tolerance — D-06 thresholds).

### Inventory

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| INV-01 RM Inventory | V | VX | VX | V | V | VX | V |
| INV-02 WIP Inventory | V | VX | VX | VX | V | V | V |
| INV-03 FG Inventory | V | VX | VX | V | V | VX | V |
| INV-04 Material Issue | — | V | VA ⁹ | VC ¹⁰ | — | VCEDX | V |
| INV-05 Material Receipt | — | V | V | — | VA ¹¹ | VCEDX | — |
| INV-06 Stock Reconciliation | — | VAX | VX | V | — | VCEX | V |
| INV-07 Heat Tracking | V | V | VX | V | VX | VCEX | V |
| INV-08 Bar Tracking | V | — | V | V | V | VCEX | — |

⁹ Approves issues in excess of BOM quantity.
¹⁰ Raises the requisition. Stores posts the issue.
¹¹ Incoming inspection releases the QA hold on received heats.

### Quality

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| QUA-01 Inspection Entry | V | — | V | V | VCEAX ¹² | — | V |
| QUA-02 Hydro Test | V | — | V | V | VCEAX | — | — |
| QUA-03 ECT Test | V | — | V | V | VCEAX | — | — |
| QUA-04 DPT Test | V | — | V | V | VCEAX | — | — |
| QUA-05 Rework Entry | — | — | V | VE ¹³ | VCA | — | V |
| QUA-06 Defect Tracking | V | — | V | VE ¹³ | VCEX | V | VX |
| QUA-07 Cost of Quality | V | VX | VX | V | VCEX ¹⁴ | — | VX |

¹² A = final QA release (sets `qualityClear` on the traveller). A different inspector from the one who recorded the results.
¹³ Production records rework execution and root cause.
¹⁴ Manual CoQ items only (e.g. external claims). The computed CoQ is read-only.

### Cost Engine

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| CST-01 Standard Cost Setup | V | VAX | VCEDX | V | — | — | V |
| CST-02 Actual Cost Calculation | V | VAX ¹⁵ | VCEX | — | — | — | VA |
| CST-03 Cost Rollup | V | VX | VX | — | — | — | VX |
| CST-04 Allocation Rules | V | VAX | VCEDX | — | — | — | V |
| CST-05 Cost Calculation Log | VX | VX | VX | — | — | — | VX |

¹⁵ `COSTING_MACHINE`: UnderReview → Approved = FIN / MGT. Approved → Finalized = FIN only. Costing can never approve its own run.

### Variance

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| VAR-01 Variance Dashboard | — | VX | VX | V | V | V | VX |
| VAR-02 Material Variance | — | VAX | VEX | V | — | VE ¹⁶ | VX |
| VAR-03 Yield Variance | — | VAX | VEX | VE ¹⁶ | V | — | VX |
| VAR-04 Labour Variance | — | VAX | VEX | VE ¹⁶ | — | — | VX |
| VAR-05 Utility Variance | — | VAX | VEX | VE ¹⁶ | — | — | VX |
| VAR-06 Quality Variance | — | VAX | VEX | V | VE ¹⁶ | — | VX |
| VAR-07 Scrap Variance | — | VAX | VEX | VE ¹⁶ | V | — | VX |

Variance **values** are computed by the engine and cannot be edited by anyone. **E** means editing the Annex D investigation record (root cause, action, owner, due date). ¹⁶ The root-cause owner. **A** = FIN approves investigation closure.

### Profitability

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| PRF-01 Product | — | VX | VX | — | — | — | VX |
| PRF-02 Customer | — | VX | VX | — | — | V ¹⁷ | VX |
| PRF-03 Order | — | VX | VCX ¹⁸ | — | — | V ¹⁷ | VX |
| PRF-04 Profit Centre | — | VAX | VX | — | — | — | VX |

¹⁷ `sales` only. ¹⁸ C = create a quotation simulation (§19 sensitivity). It is not persisted as a cost result.

### Finance

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| FIN-01 Inventory Valuation | — | VAX | VCEX | — | — | V | VX |
| FIN-02 Cost Reconciliation | — | VAX | VCEX | — | — | — | VX |
| FIN-03 Financial Reconciliation | — | VCEAX | VEX | — | — | — | VX |
| FIN-04 Monthly Closing | V | VCEAX ¹⁹ | VE | VE | VE | VE | VAX ²⁰ |

¹⁹ FIN owns the checklist and the lock. Each persona signs off only its own D+ steps (`CLOSE_STEPS.owner`).
²⁰ D+12 management review sign-off.

### Approvals

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| APR-01 Approvals Queue | V ²¹ | VA | VA | VA | VA | VA | VA |
| APR-02 Approval Details | V ²¹ | VA | VA | VA | VA | VA | VA |
| APR-03 Approval History | VX | VX | VX | V | V | V | VX |

The queue shows only the kinds the role may decide (§4) plus the user's own submissions (withdraw allowed). ²¹ ADM decides only `role.grant` items.

### Reports

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| RPT-01 Cost Sheets | — | VX | VX | — | — | — | VX |
| RPT-02 Inventory Reports | — | VX | VX | V | — | VX | VX |
| RPT-03 Production Reports | — | V | VX | VX | V | — | VX |
| RPT-04 Variance Reports | — | VX | VX | V | V | V | VX |
| RPT-05 Profitability Reports | — | VX | VX | — | — | V ¹⁷ | VX |
| RPT-06 Cost Audit Reports | VX | VX | VX | — | — | — | VX |

### Supporting

| Screen | ADM | FIN | CST | PRD | QUA | SCM | MGT |
|---|---|---|---|---|---|---|---|
| SUP-01 Exception Centre | V | VE | VE | VE | VE | VE | VX |
| SUP-02 Notifications / SUP-03 Profile | own | own | own | own | own | own | own |

## 4. Approval routing (who checks whom)

| Approval kind | Maker | Checker | Rule refs |
|---|---|---|---|
| `workOrder.release` | PRD planner / `sales` | `productionMgr` (≠ maker) | WO-01, D-05 |
| `materialIssue.excess` | `stores` | CST | INV-02 |
| `inventory.adjustment` | `stores` | FIN | INV-03, D-08 |
| `production.entryException` | `operator` | `supervisor` | D-06 |
| `quality.release` | inspector | senior inspector (QUA) | WO-03 |
| `master.version` (BOM, routing, machine) | PRD / `engineering` | CST | §22.1 |
| `master.version` (CC, driver, UOM, product) | CST | FIN | §22.1 |
| `master.version` (PC) | FIN | MGT | — |
| `rate.version` / `standardCost.version` | CST | FIN | D-12 |
| `costRun.approve` | CST | FIN or MGT | COSTING_MACHINE, COST-02 |
| `costRun.finalize` | — | FIN | COSTING_MACHINE |
| `recon.resolution` | FIN / CST | FIN (≠ maker) or MGT | RECON_MACHINE |
| `variance.closure` | root-cause owner | FIN | Annex D |
| `period.reopen` | FIN | MGT | PER-01, D-14 |
| `policy.change` (Annex E) | CST / FIN | FIN → MGT (triple) | §22, Annex E |
| `role.grant` (privileged) | ADM | second ADM | D-01 |

Escalation: any `Pending` item older than its SLA (D-xx, not yet defined) can be `Escalated` to MGT (`APPROVAL_MACHINE`).

## 5. Enforcement architecture (three layers, one matrix)

```
src/config/permissions.ts   ← single matrix: (screenId, action) → technical roles[]
        │
        ├── Client nav + route guard     (visibility only — UX, not security)
        ├── Cloud Functions              (authoritative: every write checks can(role, screen, action)
        │                                 + maker≠checker + record version + period lock)
        └── Firestore Rules              (authoritative for reads: per-collection role checks;
                                          all business writes denied to clients)
```

The matrix file is imported by the app **and** compiled into Functions, so the two cannot drift.

### Gaps in the current code this matrix closes

| Gap | Where | Fix |
|---|---|---|
| Rules allow **any** plant user to read **everything** in the plant, including costing and finance data for operators | `firebase/firestore.rules` (`plants/{p}/{doc=**} allow read: if plantOk(p)`) | Per-collection read rules from the matrix |
| `requireRoles` uses a pseudo-role `'checker'` that is not in the `Role` union | `firebase/functions/src/index.ts` | Replace with `can(roles, 'approvals', 'approve')` + kind routing (§4) |
| Functions do not use the domain state machines (`APPROVAL_MACHINE`, etc.) or APR-02 version check | `decideApproval` | Share `src/domain` with Functions |
| `postLedgerTxn` does not check the locked period (PER-01) | Functions | Check `periods/{yyyymm}.locked` inside the transaction |
| Permission functions in `permissions.ts` are not called by screens | screens | Replace with `can()` from the matrix |
| Demo role switcher + demo-account bypass | `profile.tsx`, `sign-in.tsx` | Remove; roles come only from custom claims |
