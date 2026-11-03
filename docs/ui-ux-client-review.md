# Client Review & Approval — Alleima Cost Intelligence UI/UX Revamp

_Phase 6 deliverable. Written in business terms for the client review meeting. This is the approval gate: the full production migration (Phase 7) does **not** begin until the items in the checklist below are signed off._

## 1. What is changing visually

The application keeps all of its existing capabilities. What changes is the **look and feel**, re-tuned to Alleima's industrial, technical, premium character:

- **A deeper, industrial navy** (`#092D58`) frames the app in the navigation rail, replacing the previous brighter navy.
- **A single confident "technical blue"** (`#2676C9`) now carries all interaction (buttons, links, selection), replacing the generic SaaS blue.
- **A cooler, airier canvas** (`#F2F5F7`) with calm slate secondary text (`#52677D`) and hairline borders (`#DCE3E9`) — more whitespace, less visual noise.
- **Stronger figure storytelling** — the review hub opens with an Alleima-style "big number" stat band, echoing the reference site's presentation of headline figures.
- **Restrained colour discipline** — status colours (amber/red/green) are reserved for cost, risk, and exceptions, and are never used as the only signal.

Because every screen reads its colours, spacing, and type from one source of truth (`src/theme/tokens.ts`), this re-tone propagates consistently across all 17 modules at once.

> **Important:** the palette is an **interpretation** of Alleima's public visual character, not verified official brand tokens. See `docs/ui-ux-visual-direction.md`. We need the client to confirm or supply the official brand values before the production phase.

## 2. Why the changes improve usability

- **Clearer hierarchy** — larger, calmer section headings and quieter eyebrows make dense cost/finance screens easier to scan.
- **One interaction colour** — users learn that "blue means you can act on it," reducing cognitive load.
- **Meaningful colour** — because colour is reserved for status, exceptions and risks stand out immediately.
- **Consistent components** — the same table, card, button, and status chip behave identically everywhere, so the tool feels like one product, not a collection of screens.
- **Accessible by default** — higher contrast, visible keyboard focus, 44 px touch targets, and status that never relies on colour alone.

## 3. How navigation and workflows work

- A **collapsible navy rail** groups modules into Workspace / Operations / Finance & control / Insights & admin. On tablet/phone it becomes a **bottom nav** with a "more" sheet.
- The header carries **search, period selector, notifications, and profile**, plus a breadcrumb and a clear **DEMO** marker.
- Workflows are unchanged in logic — costing approval (maker-checker), reconciliation & close, work-order lifecycle, traceability, imports, and the approvals queue all behave as before. See `docs/ui-ux-workflow-mapping.md` for the journey diagrams.

## 4. How the redesign benefits each role

| Role | Benefit |
| --- | --- |
| Management | Faster read of the overview stat band + KPI quads; exceptions surface clearly |
| Costing | Cleaner variance tables and trace drawer; one obvious primary action per step |
| Finance | Reconciliation worklist is easier to triage; close checklist reads at a glance |
| Production / supervisor | Simpler work-order + traveller entry on tablet/phone |
| Operator | Focused mobile view with only the relevant workspaces |
| Auditor | Quiet, high-contrast, read-oriented presentation of audit trails and approvals |
| Admin | Consistent admin/audit surfaces; demo reset clearly separated |

## 5. Which screens are in the prototype

The **entire existing app** renders in the new direction (one shared design system), so every module is reviewable. The guided prototype hub (`/(app)/review`) highlights eight representative end-to-end journeys:

1. Management overview → variance → cost centre → exception → export
2. Work-order lifecycle (plan → release → operate → QA → FG)
3. Material traceability (heat → movements → WO → traveller → FG)
4. Costing calculation review (scope → calculate → trace → approve)
5. Finance reconciliation + close (match → discrepancy → adjust → lock)
6. Master-data import (template → validate → fix → commit)
7. Shop-floor mobile workflow (assigned work → record → confirm)
8. Approval workflow (submit → reject with reason → resubmit → approve)

## 6. Which interactions are functional demonstrations (not live)

- All data is **in-memory sample data** — no live Firebase/Firestore or ERP connection.
- Costing submit/approve, approvals, planning release, and imports **mutate demo state only** and reset via Admin.
- CSV **export works** (web, real file download); the scanner has a demo fallback.
- Sign-in's demo accounts navigate; the real-email Firebase path is initialised but not wired to an auth listener in this build.

These limitations are surfaced in-app via the amber `DemoBanner`, a `DEMO` pill, and SAMPLE labels on calculations.

## 7. Which backend integrations remain unchanged

Nothing in the data/logic layer was changed by this revamp. Preserved intact and verified by the passing test suite:

- Costing math (`machineHourRate`, `materialPriceVariance`, `materialUsageVariance`, `yieldPct`).
- Validation (`costCentreSchema` `/^8204/`, `travellerEntrySchema`, `isPlaceholderInvoice`).
- Reconciliation routing, ledger intent, CSV import preview, close progress, audit log.
- The 15-role model and maker-checker rule.

## 8. Known limitations and unresolved questions

- Palette/typeface are an **interpretation**, pending official Alleima brand confirmation.
- No live auth/data — effectively a front-end review build.
- Permission-denied on direct deep-links is not yet a guarded state (today unauthorised modules are hidden from nav).
- Legacy splash/verify/notice screens inherit the new palette via the compatibility token object but have not been individually redesigned.
- Duplicate primitives (two buttons, two period selectors) remain; consolidation is a production-phase task.

## 9. Accessibility & responsive considerations

- Target **WCAG 2.2 AA**. Computed contrast for the core pairs meets AA/AAA (see `ui-ux-visual-direction.md`); full validation with assistive technology is a Phase 8 task.
- Visible keyboard focus, 44 px targets, status never colour-only, semantic roles/labels on interactive elements.
- Responsive at `compact 760 / wide 1024 / roomy 1320` breakpoints: rail ⇄ bottom nav, reflowing grids, contained horizontal table scroll.

## 10. Approval checklist

Please review each item and mark approved / changes requested:

- [ ] **Brand & visual direction** — navy `#092D58`, technical blue `#2676C9`, canvas `#F2F5F7` (or supply official brand values)
- [ ] **Navigation & information architecture** — rail groups, search, bottom nav
- [ ] **Dashboard & reporting layouts** — overview stat band + KPI quads, reports
- [ ] **Table & form behavior** — DataTable, validation messaging, empty/error states
- [ ] **User-role workflows** — costing approval, reconciliation, work orders, approvals
- [ ] **Mobile & tablet behavior** — bottom nav, reflow, touch targets
- [ ] **Business terminology** — labels, module names, section numbering (§1/§15/§16/§17/§19)
- [ ] **Missing requirements** — anything expected but not present (list in review feedback)
- [ ] **Outstanding client decisions** — items in §8 and the `❓` list in the screen spec

## 11. How to run the review version

```bash
npm install          # if not already installed
npm run web          # starts Expo for web; open the printed localhost URL
```

Then sign in with a one-click demo account on the sign-in screen and open **Client Review** in the left rail (or go directly to `/(app)/review`). No command-line interaction is needed to navigate the prototype.

Optional checks:

```bash
npm run typecheck    # TypeScript (passes)
npm test             # Vitest unit tests (36 passing)
```

---

**Stop gate:** the production UI migration (Phase 7) begins only after the checklist above is approved and the open questions in §8 are answered.
