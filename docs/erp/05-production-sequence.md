# Deliverable 5 — Production Module Sequence Flow

End-to-end flow: **Create WO → Approve → Release → Issue RM → Traveller → Operations → Quality → WIP → FG → Cost Calculation → Profitability**.

Every state change goes through a Cloud Function that calls the shared domain service (`src/domain/services.ts`). That service checks the transition against the state machine (`checkTransition`), applies the business rules (WO-01/02/03, INV-01/02/03, PER-01, APR-01/02) and returns audit events. The Function then commits the record, ledger and audit entries in **one Firestore transaction**.

## 1. State machines involved

### Work order — proposed change to `WO_MACHINE`

You asked for a separate **Approve** step before Release. The existing machine goes straight from `ReadyForReview` to `Released`. The proposal adds an `Approved` state so that approval (maker-checker) and release (material readiness, WO-01) are separate gates.

```mermaid
stateDiagram-v2
    [*] --> Draft : createWorkOrder
    Draft --> ReadyForReview : submit
    ReadyForReview --> Draft : send back, reason required
    ReadyForReview --> Approved : approve, checker differs from maker
    Approved --> Released : release, WO-01 materialReady
    Released --> InProgress : first operation started
    InProgress --> OnHold : hold, reason required WO-02
    OnHold --> InProgress : resume
    InProgress --> Completed : WO-03 qualityClear, all travellers closed
    OnHold --> Completed : supervisor override with reason
    Completed --> Closed : FG received, costed in a finalized run
    Draft --> Cancelled : cancel, reason required
    Approved --> Cancelled : cancel, reason required
```

Code impact: add `'Approved' | 'Cancelled'` to `WorkOrderStatus`, add the edges to `WO_MACHINE`, update `phase3.test.ts`. **Needs D-05 confirmation.**

### Traveller — new `TRAVELLER_MACHINE`

```mermaid
stateDiagram-v2
    [*] --> Created : releaseWorkOrder
    Created --> InProgress : first op started
    InProgress --> AtInspection : op with inspection gate completed
    AtInspection --> InProgress : Accept, next op
    AtInspection --> Rework : Rework disposition
    Rework --> AtInspection : rework op completed, re-inspect
    AtInspection --> OnHold : Hold disposition
    OnHold --> AtInspection : hold released
    AtInspection --> Completed : final inspection Accept, qualityClear
    InProgress --> Completed : last op done, no gate pending
    Completed --> Closed : FG posted
    AtInspection --> Closed : Reject of full lot, scrap posted
```

## 2. Detailed interaction diagram

```mermaid
sequenceDiagram
    autonumber
    actor SAL as Sales (SCM)
    actor PLN as Production Mgr / Planner
    actor CHK as Production Mgr (checker)
    actor STR as Stores (SCM)
    actor OPR as Operator
    actor SUP as Supervisor
    actor QA as Quality Inspector
    actor CST as Costing
    actor FIN as Finance
    participant APP as App (Expo)
    participant FN as Cloud Functions
    participant DOM as Domain services
    participant DB as Firestore

    Note over SAL,DB: 1. Create work order
    SAL->>APP: Customer order line, request WO
    PLN->>APP: Create WO, product, qty, due date
    APP->>FN: createWorkOrder(orderLine, productId, qty)
    FN->>DB: read product, BOM and routing Approved and effective on plannedStart
    alt No approved BOM or routing
        FN-->>APP: error, master not approved
    else Masters valid
        FN->>DOM: build requirements = BOM lines x qty, incl. scrap factor
        FN->>DB: tx write workOrders/woNo Draft + requirements + auditLogs
        FN-->>APP: woNo
    end

    Note over PLN,DB: 2. Approve work order
    PLN->>APP: Submit for review
    APP->>FN: transitionWorkOrder(woNo, ReadyForReview)
    FN->>DOM: checkTransition WO_MACHINE
    FN->>DB: tx update WO + create approvals kind workOrder.release, targetVersion
    FN->>DB: notification to productionMgr
    CHK->>APP: Open approval, approve
    APP->>FN: decideApproval(approvalId, Approved, reason)
    FN->>DOM: decideApproval, APR-01 maker differs, APR-02 version current
    FN->>DB: tx approval Approved + WO Approved + auditLogs

    Note over STR,DB: 3. Reserve material, then release
    STR->>APP: Reserve heats against requirements
    APP->>FN: reserveMaterial(woNo, heatId, kgG)
    FN->>DB: tx check heat qaStatus Released and free balance
    FN->>DB: write reservations, set materialReady when requirements covered
    PLN->>APP: Release WO
    APP->>FN: releaseWorkOrder(woNo)
    FN->>DOM: transitionWorkOrder Approved to Released, WO-01
    alt materialReady false
        FN-->>APP: Rule WO-01 blocked, open reservations
    else ready
        FN->>DB: tx WO Released
        FN->>DB: create travellers per heat or pass, operations seeded from routing snapshot with std values
        FN->>DB: event workOrder.released, notify supervisor
    end

    Note over STR,DB: 4. Issue raw material
    STR->>APP: Issue slip against reservation
    APP->>FN: postMaterialIssue(woNo, lines)
    FN->>DB: read periods/yyyymm
    alt Period locked
        FN-->>APP: Rule PER-01 blocked
    else open
        FN->>DOM: applyMovement issue RM-store to WIP, INV-01 idempotent, INV-02 no negative
        alt Issue exceeds BOM requirement
            FN->>DB: materialIssues PendingApproval + approvals kind materialIssue.excess to Costing
        else within BOM
            FN->>DB: tx inventoryTxns issue + inventory balances + heats balance + materialIssues Posted
            FN->>DB: traveller input kgG updated
        end
    end

    Note over OPR,DB: 5. Operation tracking (repeat per routing op)
    OPR->>APP: Scan traveller, start op on machine
    APP->>FN: recordOperation(travellerNo, seq, start, machineId)
    FN->>DB: tx op InProgress, traveller InProgress, WO InProgress on first op
    OPR->>APP: Complete op, output kg, scrap kg, hours
    APP->>FN: recordOperation(travellerNo, seq, complete, quantities)
    FN->>DOM: validate travellerEntrySchema, mass balance input = output + scrap within tolerance
    alt Outside tolerance D-06
        FN->>DB: approvals kind production.entryException
        SUP->>APP: approve or send back
    end
    FN->>DB: tx op Completed + inventoryTxns wip stage transfer at std cost
    FN->>DB: inventoryTxns scrap for scrap kg to SCRAP location
    FN->>DB: machineLogs run hours accumulate

    Note over QA,DB: 6. Quality inspection (at inspection-gate ops and final)
    QA->>APP: Record test, hydro or ECT or DPT or visual
    APP->>FN: recordInspection(travellerNo, seq, testType, results, defects)
    FN->>DB: tx qualityInspections + traveller AtInspection
    alt Accept
        FN->>DB: traveller InProgress, next op
    else Rework
        FN->>DB: insert rework op into traveller operations, traveller Rework
    else Reject
        FN->>DB: inventoryTxns scrap for rejected kg, defect recorded for CoQ
    else Hold
        FN->>DB: traveller OnHold + exceptions
    end
    QA->>APP: Final release, second inspector
    APP->>FN: releaseQuality(travellerNo)
    FN->>DB: traveller qualityClear true, certRef EN 10204 3.2

    Note over PLN,DB: 7. WIP update and finished goods
    FN->>DB: on final op complete, inventoryTxns fg WIP to FG store + FG balance
    FN->>DB: traveller Completed then Closed
    PLN->>APP: Complete WO
    APP->>FN: transitionWorkOrder(woNo, Completed)
    FN->>DOM: WO-03 qualityClear and all travellers Closed
    FN->>DB: tx WO Completed + event fg.received

    Note over CST,DB: 8. Cost calculation (period close D+8 to D+10)
    CST->>APP: Create cost run for period
    APP->>FN: runCostCalculation(period, scope)
    FN->>DB: snapshot inputs, inputsHash, rate versions
    FN->>DOM: collect, allocate, absorb, roll up, variances, see Deliverable 6
    FN->>DB: costPools, allocations, costCalculations lines, variances, status Calculated
    alt pool vs allocated not zero, section 15.3 gate
        FN-->>APP: run blocked from submit, gate failed
    else gate passed
        CST->>APP: Submit run
        FIN->>APP: Approve run, FIN differs from CST
        APP->>FN: transitionCosting(runId, Approved) then Finalized
        FN->>DB: run immutable, COST-02
    end

    Note over CST,DB: 9. Profitability
    FN->>DB: on Finalized, join cost lines with customer order NSR from SOPIC
    FN->>DB: profitability by order, customer, product, PC + kpiSnapshots
    FN->>DB: WO Closed for WOs fully costed
```

## 3. Step → data → rule summary

| # | Step | Function | Writes | Rules / gates |
|---|---|---|---|---|
| 1 | Create WO | `createWorkOrder` | `workOrders` (Draft), `requirements` | Approved, effective BOM + routing |
| 2 | Approve | `transitionWorkOrder`, `decideApproval` | `approvals`, WO → Approved | APR-01, APR-02, WO_MACHINE |
| 3 | Release | `reserveMaterial`, `releaseWorkOrder` | `reservations`, WO → Released, `travellers` + `operations` | WO-01, heat QA released |
| 4 | Issue RM | `postMaterialIssue` | `materialIssues`, `inventoryTxns` (issue), `inventory`, `heats` | INV-01, INV-02, PER-01, excess → approval |
| 5 | Operations | `recordOperation` | `operations`, `inventoryTxns` (wip, scrap), `machineLogs` | mass balance, D-06 tolerance, supervisor approval |
| 6 | Quality | `recordInspection`, `releaseQuality`, `createRework` | `qualityInspections`, traveller status, scrap txns | disposition rules, two-person release |
| 7 | WIP → FG | (inside `recordOperation` final op), `transitionWorkOrder` | `inventoryTxns` (fg), WO → Completed | WO-03 |
| 8 | Cost calc | `runCostCalculation`, `transitionCosting` | `costPools`, `allocations`, `costCalculations`, `variances` | COST-01/02/03, §15.3 gate, COSTING_MACHINE |
| 9 | Profitability | trigger on run Finalized | `profitability`, `kpiSnapshots`, WO → Closed | uses finalized runs only |

## 4. Events (in-process today, per `INTEGRATION_CONTRACTS.md`)

`workOrder.created`, `workOrder.approved`, `workOrder.released`, `movement.posted`, `operation.completed`, `inspection.recorded`, `quality.released`, `fg.received`, `costing.calculated`, `costing.finalized`, `approval.decided`, `recon.resolved`, `period.locked`.

Each event drives notifications, KPI snapshot refresh, and (later) ERP outbound sync. Events are written in the same transaction as the business change, as documents in `events/{id}` (outbox pattern), so retries never lose or duplicate them.

## 5. Open points that block exact implementation

| Ref | Question | Affects step |
|---|---|---|
| D-05 | Confirm the Approve stage and the cancel policy for released WOs | 1–3 |
| D-06 | Mass-balance tolerance per op and inspection gates per routing op | 5–6 |
| D-07 | Traveller granularity: one per heat, per bar bundle, or per pilger pass? | 3, 5 |
| D-08 | Is WIP transferred per op at standard (proposed) or only at FG? | 5, 7 |
| D-09 | Rework cost treatment: absorbed into product or charged to CoQ (internal failure)? | 6, 8 |
| INV-02 | Is negative WIP ever allowed (backflush)? | 4, 5 |
