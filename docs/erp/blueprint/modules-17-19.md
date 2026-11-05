# Blueprint — Modules 17–19

---

## Module 17 — Monthly Cost Close

**Screen Name:** Monthly Cost Close — Checklist Workflow · `/(app)/finance/close`.

**Screen Purpose:** run the month-end close as a checklist workflow with a progress tracker: RM reconciliation → heat → production → yield → allocation → WIP valuation → profitability → cost-financial reconciliation → close month.

**User Actions:** open the period; work each step in order; mark a step **done** (owner sign-off); open the module behind a step (e.g. Allocation → module 12); see the **progress tracker** advance; **lock month** when all steps are done (reopen needs approval).

**Components Required:** `PageHeader`, **`Stepper`** (or a checklist `DataTable` with status), `ProgressRing`/`ProgressBar` (progress tracker), `Card` per step with owner + output + `StatusChip`, `Button` ("Mark done", "Lock month" primary), `ConfirmDialog` (lock), `Governance.ApprovalTimeline` (reopen), `Callout`, `Toast`, `FeatureHelp`.

**Navigation Flow:**
```
Monthly Cost Close (period selected)
  Progress tracker (ProgressRing: n/9 steps)
  Steps (checklist, in order):
   1 RM Reconciliation        → Inventory (11/INV)
   2 Heat Reconciliation      → Heat tracking
   3 Production Reconciliation→ Travellers/Production (9/10)
   4 Yield Review             → Yield & Scrap (14)
   5 Allocation Execution     → Allocation Engine (12)
   6 WIP Valuation            → WIP (11)
   7 Profitability Run        → Product/Customer Profitability (15/16)
   8 Cost-Financial Reconciliation → Financial reconciliation
   9 Close Month (lock)       → ConfirmDialog → period locked
```

**Input Data Required:** period; per step: status (pending/done/blocked), owner, output. (Demo: `CLOSE_STEPS` / `closeProgress`, `CLOSE_CHECKLIST` 18-item Annex B.)

**Output Generated:** close progress %, signed-off steps, a locked period, the monthly cost pack; feeds the Executive Dashboard close-health widget.

**Demo Data Examples:** `CLOSE_STEPS` D+1..D+12 mapped to the 9 business steps; progress 4/9 = 44%; step 5 "Allocation Execution" blocked until the §15.3 gate passes (links to module 12); owners per `CLOSE_STEPS.owner`. Lock guarded to Finance.

**UX Recommendations:** the brief's 9 steps map onto `CLOSE_STEPS` (group D+ days into the 9 business steps). Use `Stepper` for the sequence + a `ProgressRing` tracker. Each step card: owner, output, status chip, and a "Open" button that jumps to the module that produces it — so close is a true orchestration screen. "Lock month" is disabled until all steps are done and opens a `ConfirmDialog`; reopen routes through `ApprovalTimeline`.

**Figma Layout Structure:**
```
AppShell → PageHeader("Monthly Cost Close", right: PeriodSelector) → DemoBanner
 ├ Progress Card: ProgressRing(n/9) + "4 of 9 steps complete" + period chip
 ├ Checklist (9 step Cards, ordered):
 │    [status chip] Step name | owner | output | Button("Open module") | Button("Mark done")
 ├ Callout(blocked) when a prerequisite gate fails (e.g. allocation gate)
 └ Button("Lock month", primary, disabled until 9/9) + ApprovalTimeline(reopen)
```

**Mobile Responsiveness:** step cards stack (already vertical); progress ring on top; "Open module" and "Mark done" are full-width stacked buttons; lock pinned at bottom.

---

## Module 18 — Cost Audit Readiness

**Screen Name:** Cost Audit Readiness Dashboard · `/(app)/reports/cost-audit`.

**Screen Purpose:** show audit readiness: missing BOM / routing / cost centres, reconciliation and allocation exceptions, and an overall readiness score.

**User Actions:** view the readiness score; open each metric → the list of offending records; resolve/assign an exception; re-check (score updates); export the readiness report (CRA-1).

**Components Required:** `PageHeader`, **`ProgressRing`** (readiness score), `KpiCard` (each metric with count + status), `DataTable` (offending records per metric), `StatusChip`, `Button` ("Re-check", "Assign"), `DetailDrawer` (exception detail), `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
Cost Audit Readiness
  Readiness score (ProgressRing, e.g. 92%)
  Metrics (KpiCard each → DataTable of records):
   Missing BOM · Missing Routing · Missing Cost Centres · Reconciliation Exceptions · Allocation Exceptions
   ├─ Metric press → list of offending records → open the master/exception to fix
   └─ Re-check → score recomputes → Toast
  → Export CRA-1 readiness report
```

**Input Data Required:** counts of products without BOM/routing, CCs missing/blank, open reconciliation and allocation exceptions; total records for the % base. (Demo: `CC_EXCEPTIONS`, `reconcileSopic`, `CRA1`.)

**Output Generated:** a readiness score and the exact gaps to close; links to fix each; CRA-1 report CSV; feeds management confidence before cost audit.

**Demo Data Examples:** Score **92%**. Missing BOM 2 (`SAMPLE-TUBE-2205-38` draft, 1 other); Missing Routing 1; Missing Cost Centres 2 (`820410205` blank dept, SR Furnace CC unvalidated); Reconciliation exceptions 2 (Invoice-0); Allocation exceptions 1 (gate ₹250). Fixing the two CC exceptions moves the score to 96%.

**UX Recommendations:** the readiness score is the hero (`ProgressRing`, large, coloured by band). Each metric is a `KpiCard` whose count is a live link to the offending list — so the client can watch the score climb as they resolve items (ties the demo together). CRA-1 export reuses `ExportButton`.

**Figma Layout Structure:**
```
AppShell → PageHeader("Cost Audit Readiness", right: Export) → DemoBanner
 ├ Hero Card: ProgressRing(92%) + "Audit readiness" + band StatusChip (Good/At risk)
 ├ KpiCard × 5 (Missing BOM, Missing Routing, Missing CC, Recon exceptions, Allocation exceptions) — each pressable
 ├ (on press) DataTable of offending records + Button("Fix" → opens the master/exception)
 └ Button("Re-check", ghost)
```

**Mobile Responsiveness:** ring on top; metric cards 1–2 up; offending lists full-width; "Fix" navigates to the relevant module.

---

## Module 19 — Management Analytics

**Screen Name:** Management Analytics · `/(app)/reports` (analytics view) / `/(app)/dashboard` deep charts.

**Screen Purpose:** management-level charts: product margin, customer margin, profit-centre margin, cost-centre utilization, cost trend, yield trend, production trend.

**User Actions:** switch chart (`Tabs`/segmented); change period range; drill a chart series → the underlying module; export each chart's data.

**Components Required:** `PageHeader`, **`Tabs`/segmented** (chart selector), `ChartCard` (bar), `SparkBars`/`ProgressBar` (trends), `KpiCard` (headline per chart), `DataTable` (underlying data), `PeriodSelector`, `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
Management Analytics
  Segmented [ Product margin | Customer margin | PC margin | CC utilization | Cost trend | Yield trend | Production trend ]
   ├─ each → ChartCard + underlying DataTable
   └─ Series press → drill to module (15 / 16 / 4 / 3 / 13 / 14 / production)
  → Export per chart
```

**Input Data Required:** margin by product/customer/PC; CC utilization; cost / yield / production time series. (Demo: aggregates from the finalized run + sample trends.)

**Output Generated:** management charts + trends; drill paths; per-chart CSV; the analytical layer feeding the Executive Dashboard.

**Demo Data Examples:** Product margin top 5 (304 tube 23.5%…); Customer margin (Nordic 16.9%, Gulf Petro 21.3%); PC margin (513 / 514 / 517); CC utilization (HF 88%, CF 82%, U-Bend 71%); cost trend 6-month `SparkBars`; yield trend 94.1→94.2%; production trend kg/month.

**UX Recommendations:** reuse `ChartCard` for all bar charts and `SparkBars` for trends — no new chart library needed for the demo. A segmented control switches chart; each chart has a headline `KpiCard` and a drill link to its source module so analytics isn't a dead end. Keep period range in the header (`PeriodSelector`).

**Figma Layout Structure:**
```
AppShell → PageHeader("Management Analytics", right: PeriodSelector, Export) → DemoBanner
 ├ Segmented chart selector (scrollable)
 ├ KpiCard (headline for the selected chart) + DeltaPill vs prior period
 ├ ChartCard (selected chart) — bars, or SparkBars for trend charts
 └ DataTable (underlying series) with ▸ drill to source module
```

**Mobile Responsiveness:** segmented scrolls; one chart per screen full-width; trends as `SparkBars`; underlying table scrolls.
