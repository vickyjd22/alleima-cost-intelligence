# Blueprint — Modules 12–16

---

## Module 12 — Cost Allocation Engine

**Screen Name:** Cost Allocation Engine · `/(app)/costing/allocation-rules`.

**Screen Purpose:** show allocation drivers per service cost centre and let the user change a driver, recalculate, and see the cost impact — the interactive heart of conversion costing.

**User Actions:** view drivers (Quality → test hours, Maintenance → machine hours, SCM → PO count, Utilities → kWh, Finance → revenue %); **change a driver** for a pool; **Recalculate**; see the **cost impact** (before/after per production CC); check the §15.3 gate (pool vs allocated = 0); save the rule set (approval).

**Components Required:** `PageHeader`, `DataTable` (driver matrix, editable driver column via a select), `Button` ("Recalculate", primary), `CostBreakdownPanel` or `ChartCard` (before/after impact), `DeltaPill`, `StatusChip` (gate pass/fail), `Callout` (gate), `Governance.ApprovalTimeline`, `Toast`, `FeatureHelp`.

**Navigation Flow:**
```
Allocation Engine
  Driver matrix (service CC → pool → driver):
    Quality→Test hours · Maintenance→Machine hours · SCM→PO count · Utilities→kWh · Finance→Revenue %
   ├─ Change driver (select) → Recalculate → before/after impact + DeltaPill
   ├─ Gate check (§15.3): pool collected − allocated = 0  (StatusChip pass/fail)
   └─ Save rule set → ApprovalTimeline → feeds Cost Engine / Variance / Close
```

**Input Data Required:** service CC pools, candidate drivers per pool, driver quantities per target CC, production CC list. (Demo: `DRIVER_MATRIX`, `OVERHEAD_MATRIX`.)

**Output Generated:** allocated cost per production CC; before/after impact; gate status; a saved, approved allocation rule set used by the cost engine (module relationship in `06-cost-engine-architecture.md`).

**Demo Data Examples:** Maintenance pool ₹8.4 L, driver "machine hours" → HF 62% / CF 28% / U-Bend 10%. Switch driver to "maintenance hours logged" → HF 55% / CF 33% / U-Bend 12%; impact: HF −₹0.6 L, CF +₹0.4 L. Gate = ₹0 (pass). A deliberate ₹250 imbalance demo shows gate FAIL and blocks save.

**UX Recommendations:** make the driver column a `select` directly in the `DataTable`; "Recalculate" is the single primary; show impact as a two-bar `ChartCard` (before vs after per CC) plus `DeltaPill`s. The §15.3 gate is a prominent `StatusChip` + `Callout` — when it fails, saving is disabled (reuses the existing pool-imbalance demo in `costing.tsx`).

**Figma Layout Structure:**
```
AppShell → PageHeader("Cost Allocation Engine", right: PeriodSelector) → DemoBanner
 ├ DataTable(Service CC | Pool ₹ | Driver [select] | Primary target split)
 ├ Button("Recalculate", primary) + gate StatusChip(pass/fail)
 ├ Callout(§15.3) when gate fails
 ├ ChartCard "Allocation impact" (before/after bars per production CC) + DeltaPill row
 └ Button("Save rule set") + ApprovalTimeline
```

**Mobile Responsiveness:** driver matrix scrolls horizontally; the select opens a bottom-sheet picker; impact bars stack; Recalculate pinned.

---

## Module 13 — Variance Analysis

**Screen Name:** Variance Analysis — Interactive Bridge · `/(app)/variance`.

**Screen Purpose:** show the cost bridge Standard → Material → Usage → Yield → Utilization → Actual as an interactive waterfall, with drill-down into each variance type.

**User Actions:** select period/run; read the waterfall; tap a bridge segment → that variance's detail (by CC / product / heat); open an **Annex D investigation** (root cause, action, owner, due); filter by variance type; export.

**Components Required:** `PageHeader`, **`ChartCard` as a waterfall** (bridge segments), `Tabs` or segmented (Material / Usage / Yield / Utilization / Labour / Quality / Scrap), `DataTable` (variance lines, largest adverse first), `DetailDrawer` + `FormField` (investigation), `StatusChip` (favourable/adverse, never colour-only — use up/down + label), `DeltaPill`, `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
Variance Analysis
  Interactive waterfall: Standard Cost → +/− Material → +/− Usage → +/− Yield → +/− Utilization → Actual Cost
   ├─ Segment press → variance type detail (DataTable by CC/product)
   │     └─ Line press → Annex D investigation drawer (root cause, action, owner, due)
   └─ Export (Annex D register)
```

**Input Data Required:** standard cost of actual output, actual cost, variance by type/key; investigation records. (Demo: MPV/MUV from `lib/costing`, yield from `yieldPct`, `GROUP_VARIANCES`, `VARIANCE_FORM`.)

**Output Generated:** the std→actual bridge; per-type variance lines; investigation records; Annex D CSV; feeds Close D+10/D+12.

**Demo Data Examples:** Std cost of actual output ₹29.1 L → Material −₹0.15 L (adverse) → Usage −₹0.10 L → Yield −₹0.22 L → Utilization +₹0.08 L (favourable) → **Actual ₹29.30 L**. Bridge identity checked (Σ variances = std − actual). Top adverse: Yield variance at DHDM, root cause "tool wear", owner Production, due D+8.

**UX Recommendations:** the waterfall is the required interactive element — build it from `ChartCard` bars where each segment is signed (favourable up/green, adverse down/red) with the running total. Always pair colour with an arrow + label (accessibility). Tapping a segment filters the table below. The investigation drawer reuses `FormField` with the Annex D fields.

**Figma Layout Structure:**
```
AppShell → PageHeader("Variance Analysis", right: PeriodSelector, run selector, Export) → DemoBanner
 ├ KpiCard strip: Std cost · Actual cost · Net variance (DeltaPill)
 ├ ChartCard "Cost bridge" (waterfall: Standard → Material → Usage → Yield → Utilization → Actual)
 ├ Segmented [ Material | Usage | Yield | Utilization | Labour | Quality | Scrap ]
 ├ DataTable(Key CC/Product | Std | Actual | Variance | Fav/Adv chip | Owner | Status | ▸)
 └ Investigation DetailDrawer = FormField(Annex D 11 fields) + ApprovalTimeline (closure)
```

**Mobile Responsiveness:** waterfall renders as stacked signed bars; segmented control scrolls; table collapses to Key + Variance + chevron; investigation is a bottom sheet.

---

## Module 14 — Yield & Scrap Analytics

**Screen Name:** Yield & Scrap Analytics · `/(app)/variance/yield` (+ scrap).

**Screen Purpose:** monitor Planned Yield, Actual Yield, Scrap %, Rework %, Rejection % with drill-down Flow → Machine → Product → Root Cause.

**User Actions:** view KPIs; drill Flow → Machine → Product → Root Cause (progressive `DataTable` rows / breadcrumb); filter period/flow; open a root-cause record; export.

**Components Required:** `PageHeader`, `KpiCard` (5 KPIs), `ProgressRing` (yield), `ChartCard` (yield/scrap by flow), `DataTable` (drill levels), breadcrumb (in `AppShell`/`PageHeader`), `StatusChip`, `DeltaPill`, `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
Yield & Scrap
  KPIs: Planned Yield · Actual Yield · Scrap % · Rework % · Rejection %
  Drill: Flow (HF/CF/UB) → Machine → Product → Root Cause
   (each level = DataTable; selecting a row pushes the next level + breadcrumb)
  → Export
```

**Input Data Required:** planned vs actual yield; scrap/rework/rejection qty by flow/machine/product; defect/root-cause codes. (Demo: `YIELD_DICT`, `LOSS_TREATMENT`, defect codes.)

**Output Generated:** yield/scrap KPIs and trend; drill-down path to root cause; export; feeds Variance (13) and the dashboard yield KPI.

**Demo Data Examples:** Planned yield 95% vs Actual 94.2% (−0.8pp); Scrap 1.4%; Rework 0.8%; Rejection 0.6%. Drill: HF (93.1%) → DHDM-02 (91.5%) → `SAMPLE-TUBE-304-50` (90.8%) → root cause "tool wear / feed rate". §14 6-level yield dictionary available via `FeatureHelp`.

**UX Recommendations:** KPIs as `KpiCard`s with planned-vs-actual `DeltaPill`; the big actual-yield as a `ProgressRing`. Drill-down uses a breadcrumb + replacing `DataTable` (Flow→Machine→Product→Cause) so the client literally clicks down to root cause. Scrap/rework/rejection split into normal vs abnormal per `LOSS_TREATMENT`.

**Figma Layout Structure:**
```
AppShell → PageHeader("Yield & Scrap Analytics", right: PeriodSelector, Export) → DemoBanner
 ├ KpiCard × 5 (Planned Y, Actual Y w/ProgressRing, Scrap %, Rework %, Rejection %)
 ├ ChartCard "Yield by flow" (HF/CF/UB bars)
 ├ Breadcrumb: Flow ▸ Machine ▸ Product ▸ Root cause
 └ DataTable (current drill level) with ▸ to go deeper
```

**Mobile Responsiveness:** KPI cards 1–2 up; breadcrumb wraps/scrolls; drill tables full-width; ring scales.

---

## Module 15 — Product Profitability

**Screen Name:** Product Profitability · `/(app)/profitability/product`.

**Screen Purpose:** show Revenue, Material Cost, Conversion Cost, Margin per product, in Grid, Chart and Heatmap views.

**User Actions:** switch views (`Tabs`: Grid / Chart / Heatmap); sort by margin; filter by grade group / flow; tap a product → margin breakdown; export.

**Components Required:** `PageHeader`, **`Tabs`** (Grid / Chart / Heatmap), `DataTable` (grid), `ChartCard` (bar by product), a heatmap built from a `DataTable` grid of toned cells (tone from `toneColors`), `DetailDrawer` + `CostBreakdownPanel` (margin build), `StatusChip`, `DeltaPill`, `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
Product Profitability
  Tabs [ Grid | Chart | Heatmap ]
   ├─ Grid: DataTable(Product | Revenue | Material | Conversion | Margin ₹ | Margin %)
   ├─ Chart: ChartCard margin % by product
   ├─ Heatmap: grade group × flow cells toned by margin
   └─ Row/cell press → margin breakdown drawer → "View customers" (16)
```

**Input Data Required:** per product: revenue (SOPIC), material cost, conversion cost, margin. (Demo: from finalized cost run + sample revenue.)

**Output Generated:** product margin table/chart/heatmap; margin breakdown; export; drill to customer profitability.

**Demo Data Examples:** `SAMPLE-TUBE-304-50`: Revenue ₹41.2 L, Material ₹25.6 L, Conversion ₹5.9 L, Margin ₹9.7 L (23.5%). `SAMPLE-TUBE-2205-38`: higher grade → Margin 28.1%. Heatmap: Duplex/HF green, Austenitic/CF amber.

**UX Recommendations:** three views via `Tabs`; the heatmap reuses `DataTable` cells with `toneColors` (never colour-only — show the % value in the cell too). Sort grid by margin % descending by default so the client sees best/worst instantly. Margin breakdown drawer = `CostBreakdownPanel` (Revenue − Material − Conversion = Margin).

**Figma Layout Structure:**
```
AppShell → PageHeader("Product Profitability", right: filters, Export) → DemoBanner
 ├ Tabs [ Grid | Chart | Heatmap ]
 ├ (Grid) DataTable sortable, Margin% with DeltaPill
 ├ (Chart) ChartCard margin% by product
 ├ (Heatmap) grid: rows=grade group, cols=flow, cell = tone + % label
 └ Breakdown DetailDrawer = CostBreakdownPanel(Revenue, −Material, −Conversion, =Margin)
```

**Mobile Responsiveness:** Grid is the default on phone (chart/heatmap need width); heatmap scrolls horizontally; breakdown is a bottom sheet.

---

## Module 16 — Customer Profitability

**Screen Name:** Customer Profitability — Interactive Margin Waterfall · `/(app)/profitability/customer`.

**Screen Purpose:** show customer margin as an interactive waterfall Revenue → Material → Conversion → Testing → Packing → Logistics → Margin.

**User Actions:** pick a customer; read the waterfall; tap a step → the cost detail behind it; compare customers; toggle customer vs customer group; export.

**Components Required:** `PageHeader`, customer `SearchField`/select, **`ChartCard` as the margin waterfall**, `KpiCard` (margin %), `CostBreakdownPanel` (step detail), `DataTable` (customer list with margin), `DeltaPill`, `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
Customer Profitability
  Customer list (DataTable: Customer | Revenue | Margin ₹ | Margin %)
   └─ Select customer → Margin Waterfall:
       Revenue → −Material → −Conversion → −Testing → −Packing → −Logistics → = Margin
       └─ Step press → CostBreakdownPanel detail for that element
```

**Input Data Required:** per customer: revenue, material, conversion, testing, packing, logistics, margin. (Demo: §19.1 `WATERFALL`, sample customers.)

**Output Generated:** customer margin waterfall + %, cost-to-serve detail, customer ranking, export.

**Demo Data Examples:** "Nordic Energy AB": Revenue ₹1.42 Cr → Material ₹0.86 Cr → Conversion ₹0.21 Cr → Testing ₹0.04 Cr → Packing ₹0.02 Cr → Logistics ₹0.05 Cr → **Margin ₹0.24 Cr (16.9%)**. Compare: "Gulf Petro" 21.3%.

**UX Recommendations:** this is the required interactive waterfall — same `ChartCard`-based signed-bar pattern as Variance (13), reused for consistency. Each step tappable → `CostBreakdownPanel`. Put margin % as a headline `KpiCard`. Allow customer-vs-customer compare by stacking two waterfalls on wide screens.

**Figma Layout Structure:**
```
AppShell → PageHeader("Customer Profitability", right: customer select, Export) → DemoBanner
 ├ DataTable(Customer | Revenue | Margin ₹ | Margin % | ▸)
 ├ KpiCard("Margin %", DeltaPill vs group avg)
 ├ ChartCard "Margin waterfall" (Revenue → −Material → −Conversion → −Testing → −Packing → −Logistics → Margin)
 └ Step DetailDrawer = CostBreakdownPanel for the tapped element
```

**Mobile Responsiveness:** waterfall renders as stacked signed bars; customer select is a bottom-sheet; compare mode falls back to one customer at a time with a switcher.
