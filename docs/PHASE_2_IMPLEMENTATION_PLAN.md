# PHASE_2_IMPLEMENTATION_PLAN.md — milestones (this build)

1. ✅ Inspect repo + preserve working code (no restart).
2. ✅ Gap analysis vs master prompt.
3. ✅ Write 5 Phase-2 docs + traceability + role matrix check.
4. ✅ Add `review` (Client Review Mode), `notifications` inbox, `integrations` workspace; register in `src/config/modules.ts`.
5. ✅ Verify: `tsc --noEmit`, `vitest run`, `eslint`, `expo export --platform web`; fix errors.
6. ✅ Update IMPLEMENTATION_STATUS + TEST_PLAN results; demo reset + DEMO banners retained.

Service boundaries (integration-ready): `src/lib/` (costing, ledger, reconciliation, close, imports, permissions, validation, offline, audit) + `src/firebase/config.ts` behind typed interfaces; screens use `src/mocks/demo.ts` only. No production Firebase writes in demo.
