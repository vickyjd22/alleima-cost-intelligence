# PHASE_2_GAP_ANALYSIS.md — existing app vs Phase 2 master prompt (2026-10-14)

Verified against repo: Expo 52 + Router 4 + RN 0.76 + Web static export, 17 app routes, 17 shared components, typed libs, vitest 9/9.

## Covered already
Auth (splash/sign-in/verify/notice/profile/sign-out), Overview drill-downs, CC/PC masters (127-row Annexure H), Planning + WO/traveller stepper, Inventory 5-tab + traceability, Engineering 6-tab, Quality + CoQ, Costing 4-tab + compare, Finance 6-layer bridge + close, Approvals maker-checker mock, Reports 9 types + CSV, Imports 4 templates, Admin + audit + demo reset, BottomNav mobile, Toast/Drawer/Skeleton/Export, demo mode banner + reset.

## Gaps found → fixed in this milestone
1. No dedicated Client Review landing (`review`) — ADDED.
2. No standalone Notifications inbox — ADDED (`notifications`).
3. Integrations merged into Imports; prompt requires separate workspace — ADDED (`integrations`).
4. No explicit Travellers list route (inside work-orders only) — covered via work-orders stepper + trace; documented as grouped workspace per §7 ("group related functions").
5. Phase-2 exact doc names missing — ADDED all five + traceability.

## Explicitly deferred (not dead buttons — labelled in UI)
Real Firebase writes, ERP/SAP live sync, HR/payroll scope, camera hardware scan (demo fallback), Excel/print (CSV MVP + entry points).
