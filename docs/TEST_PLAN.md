# TEST_PLAN.md

## Levels
- Unit (zod schemas, decimal math, allocation pure fns, permission filter): `npm test` (Vitest/Jest).
- Integration (Functions + Rules against Emulator Suite): ledger idempotency, reversal, maker-checker (maker≠checker), period lock, heat negative blocked.
- E2E (Journeys A–G, Maestro/Detox web+mobile): invite→dashboard; import→approve→activate; WO→FG; cost run→approve→lock; rec→approve; dashboard drill→export; scan→operation→sync.
- Visual/a11y: tokens, contrast AA, keyboard/focus (web), touch target ≥44pt (mobile), light/dark snapshots.
- Finance UAT: every formula run against finance-approved example (MHR, labour, utility, MPV/MUV, yield, WIP, OH); pool-vs-allocated=0 gate; Invoice-0 and 514-reallocation paths.

## Data
Seed scripts with **labelled SAMPLE data only** (`sample/` prefix). No real company values. Separate emulator vs prod seeds.

## Gates
`tsc --noEmit` + `eslint` clean; Rules tests pass; coverage ≥70% on `lib/costing`, `lib/ledger`, `lib/permissions`; no success UI before server confirm (assert on E2E); audit log present for all consequential writes.
