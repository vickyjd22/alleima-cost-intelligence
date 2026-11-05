# Manufacturing Costing ERP — Architecture Pack

Architecture for turning the existing Expo + Firebase app into a Manufacturing Cost Accounting ERP for AIPL Mehsana. **Scope: business process, screens, navigation, workflow, data, costing logic, roles.** UI and design system are out of scope; existing components and theme are reused unchanged.

| # | Deliverable | File |
|---|---|---|
| 1 | Screen inventory (81 screens, coverage vs today) | [01-screen-inventory.md](01-screen-inventory.md) |
| 2 | Navigation sitemap + Expo Router route tree | [02-navigation-sitemap.md](02-navigation-sitemap.md) |
| 3 | Role permission matrix (V / C / E / A / D / X) + approval routing | [03-role-permission-matrix.md](03-role-permission-matrix.md) |
| 4 | Firestore collections, ER diagrams, subcollections, indexes | [04-firestore-architecture.md](04-firestore-architecture.md) |
| 5 | Production sequence flow + WO / traveller state machines | [05-production-sequence.md](05-production-sequence.md) |
| 6 | Cost engine architecture (12 elements, pipeline, formulas, components) | [06-cost-engine-architecture.md](06-cost-engine-architecture.md) |
| 7 | Module dependency map + close-step dependencies | [07-module-dependency-map.md](07-module-dependency-map.md) |
| 8 | Implementation roadmap + migration path for this repo | [08-implementation-roadmap.md](08-implementation-roadmap.md) |

## What this builds on (not replaced)

- `src/domain` state machines (`WO_MACHINE`, `COSTING_MACHINE`, `RECON_MACHINE`, `APPROVAL_MACHINE`), rules register (WO / INV / COST / APR / PER), pure services, 36 passing tests.
- `src/lib` costing math (MHR, MPV, MUV, yield), validation (`/^8204/` CC rule), SOPIC reconciliation, ledger intents, D+1..D+12 close.
- `docs/DATA_MODEL.md` tenancy path and append-only ledger principles; `docs/MANUAL_COVERAGE.md` §1–§25 + Annex A–G mapping; decision register D-01..D-20.

## Architectural decisions

| ID | Decision | Reason |
|---|---|---|
| AD-1 | All business writes go through callable Cloud Functions; clients only read | One trusted place for state machines, maker-checker, period lock, idempotency |
| AD-2 | `src/domain` is shared by the app and Functions | Removes today's duplicated (and divergent) role logic in Functions |
| AD-3 | One permission matrix in code drives nav, route guard, Functions and rules tests | Nav visibility and security can't drift apart |
| AD-4 | Masters are versioned + effective-dated; transactions store the version used | History never changes when a master changes |
| AD-5 | Integer paise / grams / milli-hours; decimal.js for rate × qty; round once per line | COST-01 determinism; consolidates two numeric implementations |
| AD-6 | Cost engine is a pure `runEngine(snapshot, policy)` function | Testable, reproducible (inputsHash), and formulas swappable by `policyVersion` |
| AD-7 | Repository interface with `demo` and `firestore` implementations | Module-by-module migration without breaking the review build |
| AD-8 | Outbox `events` collection written in the business transaction | Reliable notifications, KPI refresh, future ERP sync |
| AD-9 | Add `Approved` and `Cancelled` to the WO lifecycle; add a traveller state machine | Separates approval from release (requested flow); traveller rework / inspection loop needs explicit states |

## Gaps found in the current code (fix in Sprint 1.0)

1. Functions write to `tenants/main/...`; the data model and rules expect `tenants/{t}/companies/{c}/plants/{p}/...` (F-1). The ledger is named `ledger` vs `inventoryTxns` (F-2).
2. `auditLogs` sits at the database root, so it isn't tenant-isolated (F-3).
3. No `scrap` ledger type (F-4); no `firestore.indexes.json` (F-5); heat balance stored as float kg (F-6).
4. Firestore rules give every plant user read access to all plant data, including costing and finance.
5. Functions use a pseudo-role `'checker'`, don't apply `APPROVAL_MACHINE` or the APR-02 version check, and `postLedgerTxn` ignores locked periods (PER-01).
6. Screens don't call the permission functions; authorization is nav-visibility only. The demo bypass and role switcher are still active.
7. `profit-centres.tsx` exists but isn't in the module registry.
8. Local `npm install` fails with `EACCES` (root-owned `~/.npm` and `node_modules` entries). This blocks adding dev dependencies.

## Open client decisions that gate the roadmap

Phase 1: D-01, D-02, D-03, D-04, D-05 (incl. the new Approve stage), D-06, D-07, D-08, D-14, INV-02.
Phase 2: D-09, D-10, D-11 / COST-03, D-12, D-16, D-17, inventory valuation method, admin %-on-sales policy, materiality tolerance.
Phase 3: D-13 / PER-01, D-15, D-18, D-19.
