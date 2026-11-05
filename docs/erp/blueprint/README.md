# Screen-Flow Blueprint — Manufacturing Costing Prototype

A directly-implementable blueprint for the 19 modules and the 14-step demo journey, expressed against the **existing** UI components, theme and navigation. Nothing here asks for a new application or new UI patterns — every screen is composed from components that already exist in `src/components`.

## How to read this

Each module is documented with the exact 11-field template you asked for:

1. **Screen Name** · 2. **Screen Purpose** · 3. **User Actions** · 4. **Components Required** · 5. **Navigation Flow** · 6. **Input Data Required** · 7. **Output Generated** · 8. **Demo Data Examples** · 9. **UX Recommendations** · 10. **Figma Layout Structure** · 11. **Mobile Responsiveness**

> **On "Figma Layout Structure":** I can't produce Figma files, and the project rule is to reuse the existing design system rather than invent UI. So this field is written as a **component composition map** — the arrangement of real components (`AppShell`, `PageHeader`, `Card`, `DataTable`, `Tabs`, `KpiCard`, `DetailDrawer`, `Stepper`, `ChartCard`, `StatusChip`, etc.) that a designer or engineer can lift straight into Figma or code. It is a wireframe-level layout spec, not a visual mock.

## Files

| Modules | File |
|---|---|
| 1 Executive Dashboard · 2 Product Master · 3 Cost Centre · 4 Profit Centre | [modules-01-04.md](modules-01-04.md) |
| 5 BOM · 6 Routing · 7 Standard Cost Simulator | [modules-05-07.md](modules-05-07.md) |
| 8 Work Order · 9 Traveller · 10 Production Data Capture · 11 WIP Valuation | [modules-08-11.md](modules-08-11.md) |
| 12 Allocation Engine · 13 Variance · 14 Yield & Scrap · 15 Product Profitability · 16 Customer Profitability | [modules-12-16.md](modules-12-16.md) |
| 17 Monthly Close · 18 Cost Audit Readiness · 19 Management Analytics | [modules-17-19.md](modules-17-19.md) |
| **14-step demo journey** (the guided "golden path") | [demo-journey.md](demo-journey.md) |

## Reusable components this blueprint builds on

Verified present in `src/components`:

| Component | Used for |
|---|---|
| `AppShell` | Page chrome: navy rail, header (search / period / notifications / avatar), breadcrumb, bottom nav, permission guard |
| `PageHeader` | Eyebrow + title + sub + right-action cluster on every screen |
| `Card`, `SectionHeader` | Grouping and section headers |
| `Button`, `IconButton` | Primary / secondary / ghost / danger actions (one primary per screen) |
| `DataTable` (`Column<T>`) | Every list / grid, with built-in empty state, row press, horizontal scroll |
| `Tabs` | In-screen sub-views (e.g. BOM sections, routing views) |
| `KpiCard` | Dashboard metrics with status + delta + spark |
| `StatusChip` | Status (never colour-only) |
| `DetailDrawer` + `KeyVal` | Record detail / create / edit as a sheet (compact) or dialog (wide) |
| `FormField`, `PrimaryButton` | Create / edit forms with validation |
| `Filters` (`PeriodSelector`, `SearchField`) | Period scope + search |
| `Stepper` | Wizard / workflow progress (Work Order, Monthly Close, demo journey) |
| `CostingPanels` (`CostBreakdownPanel`, `TraceabilityTimeline`, `ChartCard`) | Cost waterfalls, traceability, bar charts |
| `Governance` (`AuditPanel`, `ApprovalTimeline`) | Audit trail, maker-checker timeline |
| `ProgressRing`, `ProgressBar`, `SparkBars`, `DeltaPill` | Yield rings, close progress, trends |
| `Feedback` (`ConfirmDialog`, `StateView`) | Confirmations, loading / error / empty / offline states |
| `Skeleton` + `useMockLoading` | ~600 ms simulated load on every screen |
| `Toast` (`useToast`) | Action feedback |
| `DemoBanner` | "Sample data" marker on every demo screen |
| `ExportButton` | Real CSV export (web) |
| `FeatureHelp` | Collapsible business-explainer per screen |
| `Icon` / `ModuleIcon` | ~140-icon registry |

## Cross-cutting UX rules (apply to every module)

- **Brand + theme unchanged.** All colour / type / spacing come from `src/theme/tokens.ts` (Alleima Molten Orange `#FF5532` + Dark Steel `#0F232E`). No new colours.
- **Every screen:** `AppShell` → `PageHeader` → `DemoBanner` → content; `useMockLoading` skeleton on first load; `DataTable` empty state; `Toast` on every action; `FeatureHelp` for the business rule.
- **Demo data is deterministic** and seeded from `src/mocks/manual.ts`, `src/data/sample.ts`, `src/mocks/demo.ts` so the journey always reproduces (and resettable via `resetDemo()`).
- **Every number is traceable** — each cost figure links (drawer or row press) to its source record. Status is always a `StatusChip`, never colour alone.
- **One primary action per screen.** Secondary / ghost for the rest.
- **Responsive breakpoints** (existing): compact < 760, wide ≥ 1024, roomy ≥ 1320. Rail ⇄ bottom nav at 1024; tables scroll horizontally on compact; drawers become bottom sheets.

## Mapping to the ERP architecture

Routes, data collections and roles come from the architecture pack in `docs/erp/` (screen inventory, sitemap, permission matrix, Firestore design). This blueprint is the **screen-flow / UX layer** on top of that; the data layer stays mocked for the demo.
