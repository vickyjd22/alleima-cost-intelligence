# Blueprint — Modules 1–4

Each field follows the required deliverable template. Layout is a composition of existing components.

---

## Module 1 — Executive Dashboard

**Screen Name:** Executive Dashboard · route `/(app)/dashboard` (today `overview.tsx`).

**Screen Purpose:** one-glance management picture of cost, margin and health for the selected period; the entry point for every drill-down.

**User Actions:**
- Switch period (`PeriodSelector`).
- Tap any KPI to drill into its module (Cost Centres, Products, Profit Centres, Customers).
- Tap a "needs attention" row to open the exception.
- Export the dashboard summary (CSV).

**Components Required:** `AppShell`, `PageHeader`, `DemoBanner`, large-title hero (already built), summary `Card` (reconciliation + close `ProgressRing`), `KpiCard` grid, `ChartCard` (yield by flow), needs-attention `Card` with pressable rows, `Callout`, `Skeleton`, `ExportButton`.

**Navigation Flow:**
```
Dashboard
 ├─ KPI "Manufacturing cost / Cost/kg"  → Cost Centres (3) / Standard Cost Simulator (7)
 ├─ KPI "Gross margin / Profitability"  → Product Profitability (15) → Customer Profitability (16)
 ├─ KPI "Yield"                         → Yield & Scrap Analytics (14)
 ├─ KPI "Variances"                     → Variance Analysis (13)
 ├─ KPI "WIP / Inventory"               → WIP Valuation (11)
 ├─ KPI "Capacity utilization"          → Cost Centres (3) / Production dashboard
 └─ Needs-attention row                 → Exception Centre / Approvals / Monthly Close (17)
```

**Input Data Required:** selected period; KPI values; reconciliation + close status; exception list. (Demo: `reconcileSopic`, `closeProgress`, `KPI_TRIGGERS`.)

**Output Generated:** rendered KPI set; navigation into the drill-down module; CSV export of the summary.

**Demo Data Examples:**
- Revenue ₹ 4.82 Cr · Manufacturing cost ₹ 3.61 Cr · Gross margin 25.1% · Yield 94.2% · WIP ₹ 42.0 L · Inventory ₹ 1.18 Cr · Open variances 7 · Capacity 88%.
- Widget tiles: Material (RM/kg ₹512, PV −₹15,000, UV −₹10,400), Process (Yield 94.2%, Rework 0.8%, Rejection 0.6%), Conversion (Loading 88%, Breakdown 6.1%), Commercial (Order margin 25.1%, Open exceptions 7, WIP > 30d 3 lots).

**UX Recommendations:** keep the four KPI families (Material / Process / Conversion / Commercial) as the existing quad grid; one orange primary ("Open Monthly Close"); status always via `StatusChip`; the stat band uses the display font. Add a top strip of nine headline widgets (Revenue, Mfg Cost, Gross Margin, Yield, Inventory, WIP, Profitability, Variances, Capacity) as `KpiCard`s that reflow 9→2→1.

**Figma Layout Structure (component map):**
```
AppShell
 └ Scroll (gap 28)
   ├ Hero: eyebrow "MANAGEMENT DASHBOARD" + largeTitle + sub + PeriodSelector (right)
   ├ Widget band: KpiCard × 9  (row wrap; 3–4 up on wide, 2 on tablet, 1 on phone)
   ├ Summary Card: shieldCheck icon + "Reconciliation & close" + ProgressRing + 3 Metric cells + "Open finance" link
   ├ Section "Cost signals": 4 quad Cards, each = quad head + KpiCard × 3
   ├ Section "Flow & follow-ups": [ ChartCard yield-by-flow ] [ Needs-attention Card: 3 pressable rows + "Review all" ]
   └ Callout "How to read this page" (triggers register)
```

**Mobile Responsiveness:** widgets and quads collapse to one column; `PeriodSelector` wraps under the title; rail → bottom nav; chart + attention stack vertically; tap targets ≥ 44 px.

---

## Module 2 — Product Master

**Screen Name:** Product Master — List + Detail/Create drawer · `/(app)/masters/products`.

**Screen Purpose:** maintain the product catalogue that BOM, Routing, Standard Cost and Work Orders consume; support create, edit, clone and a grade-group hierarchy view.

**User Actions:** search/filter; **Create Product**; **Edit**; **Clone** (prefill a new draft from an existing product); toggle List ⇄ Hierarchy (`Tabs`); open a product → jump to its BOM / Routing; export.

**Components Required:** `PageHeader`, `Tabs` (List / Hierarchy), `SearchField`, `DataTable`, `StatusChip`, `DetailDrawer` + `FormField` + `PrimaryButton`, `Button` (Clone, ghost), `ConfirmDialog` (deactivate), `Toast`, `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
Product Master (List)
 ├─ + Create   → Create drawer → save → Toast → row appears → "Build BOM" CTA
 ├─ Row press  → Detail drawer (fields + "Open BOM" / "Open Routing" / Clone / Deactivate)
 └─ Hierarchy tab → Grade group → Grade → Products (expandable rows)
```

**Input Data Required:** Product Code, Description, Grade, Grade Group, Tube Type, OD, WT, Length, UOM. (Grade list from `grades`; UOM from `uoms`.)

**Output Generated:** a product usable immediately in BOM (5) and Routing (6); hierarchy view; CSV.

**Demo Data Examples:** `SAMPLE-TUBE-304-50` (grade 304, Austenitic, OD 50.8, WT 2.0, length 6000 mm, kg); `SAMPLE-TUBE-2205-38` (2205, Duplex, OD 38.1, WT 2.11). Grade groups: Austenitic / Duplex / Super Duplex / High Nickel / Super Alloys / High-Alloy Austenitic / Ferritic-Martensitic (§19.2).

**UX Recommendations:** Clone is the fastest demo path — one tap prefills a new draft with "-COPY" code. Validate OD/WT/length as positive numbers (`FormField` numeric). Show "Used in N BOMs / M routings" in the detail drawer so the client sees master→transaction linkage.

**Figma Layout Structure:**
```
AppShell → PageHeader("Product Master", right: + Create, Export) → DemoBanner
 ├ Tabs [ List | Hierarchy ]
 ├ (List)  SearchField + DataTable(columns: Code, Description, Grade, Group, OD×WT, UOM, Status, ▸)
 └ (Hierarchy) nested Card list: Group → Grade → Product rows
DetailDrawer("Product") = FormField ×9 (grouped: identity / dimensions) + PrimaryButton("Save") + Button("Clone", ghost)
```

**Mobile Responsiveness:** table shows Code + Description + chevron on phone (other columns scroll); drawer becomes a bottom sheet; form fields full-width single column.

---

## Module 3 — Cost Centre Management

**Screen Name:** Cost & Profit Centres — Cost Centre view · `/(app)/masters/cost-centres` (today `cost-centres.tsx`, 127 rows).

**Screen Purpose:** show the organisational costing structure (pools, drivers, resource rates, owners) and, on drill-in, each centre's monthly cost, allocation logic and utilization.

**User Actions:** filter by type (production / service / project / reporting) and department; search; open a Cost Centre → detail drawer; **Create** draft CC (zod `/^8204/` rule); view department summary (§4.5); review exceptions (blank department, missing CC); export.

**Components Required:** `PageHeader`, `Filters`, `DataTable`, `StatusChip`, `DetailDrawer` + `KeyVal` + `CostBreakdownPanel` + `ChartCard`, `FormField`, `Callout` (exceptions), `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
Cost Centres (grouped by hierarchy: Hot Flow / Cold Flow / U-Bending / Quality / SCM / Maintenance / Finance / HR)
 ├─ Row press → Detail drawer: Pool · Driver · Resource rate · Owner
 │                 + Monthly cost (CostBreakdownPanel)
 │                 + Allocation logic (KeyVal: driver → targets)
 │                 + Resource utilization (ChartCard: loading / idle / breakdown %)
 ├─ Dept summary → §4.5 table (dept, #CCs, treatment)
 └─ Exceptions → Callout + rows (820410205 blank dept, 820410802 '–')
```

**Input Data Required:** CC code, description, department/flow, type, owner, driver, UOM, PC link, GL elements, rate method; monthly cost pool; utilization (machine logs).

**Output Generated:** CC master view; per-CC cost + allocation + utilization; department summary; exception list; CSV.

**Demo Data Examples:** `820410300` Circular Saw (Hot Flow, production, machine-hrs); `820410151` Hot Extrusion Press; `820410335` ECT (Quality); dept summary Cold Flow 37 / Hot Flow 22 / Finance 11 / TM21-HX 11; exceptions `820410205` (dept blank), `820410802` (dept '–'). Driver matrix §15.2.

**UX Recommendations:** group the table by the 8-node hierarchy using `DataTable` section rows; show resource rate in mono/tabular; the detail drawer is where "clicking a Cost Centre shows monthly cost + allocation + utilization" is satisfied — put those three in stacked panels. Flag exception CCs with a warn `StatusChip` inline.

**Figma Layout Structure:**
```
AppShell → PageHeader("Cost & Profit Centres", right: PeriodSelector, + Create, Export) → DemoBanner
 ├ Filters: type segmented + SearchField
 ├ DataTable (grouped): CC code | Description | Dept/Flow | Type chip | Driver | Rate | Owner | ▸
 ├ Callout(warn) "5 exceptions need confirmation" → expands to rows
 └ SectionHeader "Department summary (§4.5)" → small DataTable
DetailDrawer("820410300 · Circular Saw") =
  KeyVal(Pool, Driver, Resource rate, Owner, PC)
  + CostBreakdownPanel(monthly cost lines)
  + KeyVal(Allocation: driver → target CCs)
  + ChartCard(Utilization: Loading / Idle / Breakdown %)
```

**Mobile Responsiveness:** table collapses to CC code + type chip + chevron; drawer bottom-sheet with the three panels stacked and scrollable.

---

## Module 4 — Profit Centre Management

**Screen Name:** Profit Centre Management · `/(app)/masters/profit-centres` (+ `/(app)/profitability/profit-centre`).

**Screen Purpose:** maintain PCs 513 / 514 / 517 and visualise the PC → Products → Customers → Revenue → Profitability chain, including 514 interim-posting control.

**User Actions:** open a PC; **Create** PC draft (FIN maker → MGT checker); view the relationship chain; open the 514 interim-posting control; drill into PC profitability; view SOPIC/PC bridge; export.

**Components Required:** `PageHeader`, `DataTable`, `DetailDrawer` + `KeyVal`, `TraceabilityTimeline` (used as the PC→…→Profitability chain), `ChartCard`, `StatusChip`, `Callout` (514 interim), `Governance.ApprovalTimeline`, `ExportButton`.

**Navigation Flow:**
```
Profit Centres (513, 514, 517)
 ├─ Row press → Detail drawer: entity 8911, interim-allowed, active
 │                + Relationship chain (TraceabilityTimeline):
 │                  Profit Centre → Products → Customers → Revenue → Profitability
 ├─ "514 interim" → Callout + control (interim postings list)
 └─ "View profitability" → Profit Centre Profitability (module 15/16 family)
```

**Input Data Required:** PC code, entity (8911), interim-allowed flag, active; linked products, customers, revenue (SOPIC), computed profitability.

**Output Generated:** PC master; the visual PC→Product→Customer→Revenue→Profitability relationship; interim-posting control for 514; PC bridge; CSV.

**Demo Data Examples:** PC 513 (standard), PC 514 "interim-controlled", PC 517; entity 8911; `KNOWN_PCS = ['513','514','517']`; PC bridge from `pcBridge`; unknown-PC exceptions surfaced.

**UX Recommendations:** render the required visual chain with `TraceabilityTimeline` (5 nodes), so the client sees the exact "PC ↓ Products ↓ Customers ↓ Revenue ↓ Profitability" flow. Keep 514's interim control behind a clearly-labelled `Callout`. Deactivation never deletes.

**Figma Layout Structure:**
```
AppShell → PageHeader("Profit Centre Management", right: + Create) → DemoBanner
 ├ DataTable: PC code | Description | Entity | Interim? chip | Active | ▸
 └ (optional) ChartCard "Revenue by PC"
DetailDrawer("PC 514") =
  KeyVal(Entity 8911, Interim allowed: Yes, Active)
  + TraceabilityTimeline([ "Profit Centre 514", "Products (n)", "Customers (n)", "Revenue ₹…", "Profitability ₹… / %" ])
  + Callout(info) "Interim postings" + small list
  + ApprovalTimeline (FIN → MGT)
```

**Mobile Responsiveness:** chain timeline is vertical by default (already stacks); table collapses to PC + interim chip; drawer bottom-sheet.
