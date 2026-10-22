# Domain Model

Entities in src/domain/types.ts: WorkOrder (7 states), CostingRun (8), ReconItem (6), ApprovalRequest (6), Movement ledger (5), AuditEvent. Each has stable id, audit metadata (actor/timestamp/version), status, relationships via refs (WO id, heat id, snapshot ref). No generic record blobs; no unbounded arrays.
