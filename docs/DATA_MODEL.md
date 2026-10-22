# DATA_MODEL.md

Tenancy: `tenants/{tenantId}/companies/{companyId}/plants/{plantId}/...` — all queries plant-scoped. Write doc counts small; txns in subcollections.

## Collections (plant scope unless noted)
- `costCentres/{code}`: desc, dept/flow, type[production|service|project|reporting], owner, driver, uom, capacityBasis, pcId, glElements[], rateMethod, effectiveFrom/To, active, sourceRow
- `profitCentres/{code}`: desc, entity (8911), interimAllowed, active
- `machines/{id}` → costCentreCode, assetId, capacity, meters
- `products/{id}`: grade, gradeGroup, OD/WT/length, productType, cta/hsn, uom
- `boms/{id}`: productId, version, effectiveFrom, lines[{materialId, qty, scrapFactor}], status, approvals
- `routings/{id}`: productId/gradeGroup, ops[{seq, machineId, ccCode, stdMachineHrs, stdLabourHrs}]
- `rateTables/{type_machine|labour|utility|overhead}/{version}`: rows, effectiveFrom/To, approvals
- `workOrders/{no}`: orderId, productId, qty, status, reservations[]
- `travellers/{no}`: woNo, pass, machineId, ccCode, heatId, input{qty,kg}, output{qty,kg}, rework/reject{qty,defectCode}, costSnapshot
- `inventoryTxns/{id}`: idempotencyKey, type[receipt|issue|return|transfer|adjust|wip|fg], heatId/batch, qty/kg, location, reversalOf?, postedAt, by
- `heats/{heatId}`: materialId, origin, balance{qty,kg}, ledger refs (never negative without exception approval)
- `qualityInspections/{id}`: travellerNo, tests, defects[], disposition
- `costRuns/{id}`: plant, period, scope, inputsHash, rateVersions, results summary, status[draft|submitted|approved|locked], approvals[], rounding policy
- `reconciliations/{period}_{type}`: matches, exceptions[{kind: invoice0|pc|dispatch|...}], status
- `exceptions/{id}`: kind, ref, owner, dueDate, status, thread[]
- `periods/{yyyymm}`: locked, lockedBy/At, checklist{}
- `imports/{id}`: template, mapping, rowErrors[], previewHash, status, committedBy
- `auditLogs/{auto}`: actor, action, entity, before/after, reason, at (append-only; writes via Functions)
- `users/{uid}` (tenant scope): plants[], roles[], modules[], active

## Rules
Ledger/txn writes + approvals + locks + cost-run approve → Cloud Functions transactions only. Decimal-safe (minor units or Decimal.js), explicit rounding, inputsHash for repeatability. Aggregations (`dashboardDaily`, `ccMonthly`) via scheduled Functions; never unbounded arrays or >1MB docs.
