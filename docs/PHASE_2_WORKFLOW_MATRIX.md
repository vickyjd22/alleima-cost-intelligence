# PHASE_2_WORKFLOW_MATRIX.md — flows A–H demo paths

| Flow | Start | Steps (screens) | End state | Status |
|---|---|---|---|---|
| A Work-order lifecycle | planning → work-orders | create → release → stepper operate → QA → FG receipt | WO complete, inventory +Δ | Demo OK |
| B Traceability | inventory | heat search → movements → WO → traveller → FG genealogy | backward+forward shown | Demo OK |
| C Costing run | costing | scope → completeness → resolve → calculate → trace → submit → approve/reject | status + dashboard update | Demo OK |
| D Reconciliation+close | finance | match → discrepancy → adjustment → approve → checklist → lock preview → lock | audit entry | Demo OK |
| E Mgmt drill-down | overview | KPI → CC → WO → exception → export CSV | report exported | Demo OK |
| F Master import | imports | template → upload → map → validate → fix → commit → record | history + record | Demo OK (simulated) |
| G Mobile shop-floor | work-orders (mobile) | assigned work → scan fallback → record → validation → confirm | status update | Demo OK |
| H Rejection/resubmit | approvals | submit → reject+reason → notify → correct → resubmit → approve | full history | Demo OK |

Shared `src/mocks/demo.ts` `demoDb` + `resetDemo()` keeps cross-module state consistent and deterministic.
