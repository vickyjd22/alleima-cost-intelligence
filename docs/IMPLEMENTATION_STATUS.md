# IMPLEMENTATION_STATUS (Phase 2.5 update)

## Milestone A-B [x] 2026-10-14 - repo review done; shell already had collapsible sidebar, plant/period, search, breadcrumbs, DemoBanner; added FeatureHelp reusable explainer + Exception Centre route + module registry entry.

## Milestone C-G [in progress] - FeatureHelp to be mounted on all 12 features; cross-feature IDs shared; review workspace + benefits matrix + readiness docs drafted; next: mount FeatureHelp per screen, responsive spot-check, test + export.

## Phase 3 Sprint 1 [x] 2026-10-14 — domain + state machines + rules + tests
- src/domain: types, machines (WO/costing/recon/approval), rules register (12 rules, 3 need client decision), pure services (WO guards WO-01/02/03, idempotent ledger INV-01/02 + PER-01 lock guard, paise-deterministic costing COST-01/02, recon, approvals APR-01/02).
- Tests: 27 new + 9 existing = 36/36 pass; tsc clean. Docs: 9 Phase-3 files written.
- Next: wire screens to services (surface guard messages), Firestore repositories + emulator tests, E2E journey automation.
