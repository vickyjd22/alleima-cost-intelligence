# Blueprint — Modules 5–7

---

## Module 5 — BOM Management

**Screen Name:** BOM Management — List → Create/Version → Cost Summary · `/(app)/masters/boms`.

**Screen Purpose:** maintain versioned bills of material (Raw Material / Consumables / Packaging) with a live cost-impact panel, so the client sees material cost change as they edit.

**User Actions:** search BOM list; **Create BOM** (pick product, add lines); add/remove/edit lines in the three sections; **Save version** (creates a new version, submits for approval); open **Version History** and diff; view **Cost Summary**; watch the **Live Cost Impact** panel recalc as lines change; export.

**Components Required:** `PageHeader`, `DataTable` (BOM list + line tables), `Tabs` (Raw Material / Consumables / Packaging), `DetailDrawer`/full route for create, `FormField`, `Button` (+ Line / Save version), `CostBreakdownPanel` (cost summary), a live-impact `Card` (right rail), `StatusChip` (Draft/Approved/Superseded), `Governance.ApprovalTimeline`, `ConfirmDialog`, `Toast`, `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
BOM List
 ├─ + Create BOM → pick Product → BOM editor
 │     Tabs: [ Raw Material | Consumables | Packaging ]
 │     + Add line (material/grade, qty/output kg, scrap factor, recovery)
 │     Live Cost Impact panel updates on every edit
 │     → Save version → ApprovalTimeline → Toast
 ├─ Row press → BOM detail → Version History (diff v(n-1) vs v(n)) + Cost Summary
 └─ "Use in Work Order" → Work Order (module 8)
```
Screen-flow required by brief: **BOM List → Create BOM → Version History → Cost Summary** (all present above).

**Input Data Required:** product; per line: material/grade, qty per output kg, scrap factor, recovery rate, section (RM/consumable/packaging); grade prices (standard cost).

**Output Generated:** a versioned BOM; computed material cost; BOM version cost; version diff; the cost usable by Standard Cost (7) and Work Order (8); CSV.

**Demo Data Examples:** BOM for `SAMPLE-TUBE-304-50`: RM = 304 billet 1.08 kg/kg output (scrap factor 0.08); Consumables = pickling chemicals, lubricant; Packaging = end caps, crate. Version v1 → v2 (RM ratio 1.08 → 1.06 after yield improvement). Live impact: material cost ₹528/kg → ₹521/kg.

**UX Recommendations:** the **Live Cost Impact** panel is the demo "wow" — pin it to the right on wide screens (sticky `Card`) and recalc instantly (`lib/costing` material cost). Show the three sections as `Tabs` with per-section subtotals; the Cost Summary is a `CostBreakdownPanel` (RM / consumables / packaging / total). Version history uses a two-column diff with changed lines highlighted via `StatusChip` (added/changed/removed).

**Figma Layout Structure:**
```
AppShell → PageHeader("BOM Management", right: PeriodSelector, + Create) → DemoBanner
List: DataTable(Product | Version | Status | Mtl cost/kg | Effective | ▸)
Editor (wide = two columns):
  Left (flex 2):  Tabs[ RM | Consumables | Packaging ]
                   → DataTable(line | material | qty/kg | scrap | recovery | ✎ | ✕) + Button("+ Add line")
  Right (flex 1, sticky): "Live Cost Impact" Card
                   → CostBreakdownPanel(RM, Consumables, Packaging, = Version cost/kg)
                   → DeltaPill vs previous version
  Footer: Button("Save version", primary) + ApprovalTimeline
Version History: DataTable(Version | By | Date | Cost/kg | Status) + diff drawer
```

**Mobile Responsiveness:** the live-impact panel moves **below** the line editor (not sticky) and stays visible as a summary card; tabs scroll; add-line opens a bottom-sheet form.

---

## Module 6 — Routing Management

**Screen Name:** Routing Designer · `/(app)/masters/routings`.

**Screen Purpose:** design a process route as an ordered sequence of operations; for each node show CC, machine hours, labour hours, yield, setup cost; support rearranging, inserting and removing processes.

**User Actions:** pick product/flow; **add / insert / remove** a process node; **reorder** nodes (move up/down — and drag where supported); edit a node's CC / machine hrs / labour hrs / yield / setup cost; save version; view routed cost; export.

**Components Required:** `PageHeader`, `Tabs` (HF / CF / U-Bend), an ordered node list built from `Card` rows + `IconButton` (up / down / insert / delete), node editor `DetailDrawer` + `FormField`, cumulative-yield `ChartCard`, `StatusChip`, `Toast`, `FeatureHelp`.

> **Drag-and-drop note:** true pointer drag-and-drop isn't in the current component set, and the rule is not to invent new UI patterns. The blueprint delivers the same capability with **move-up / move-down / insert-above / remove** controls on each node (works on web and touch, and is accessible). If the client specifically wants pointer dragging, that's a scoped new interaction to add to the design system — flagged, not assumed.

**Navigation Flow:**
```
Routing List → pick Product + Flow → Route Designer
  Ordered nodes: RM → Circular Saw → Band Saw → DHDM → Extrusion → Straightening
                  → Pickling → Hydro Test → Inspection → Packing
  Node row actions: ↑ ↥(insert above) ✎(edit) ✕(remove)  ↓
  Node press → editor drawer (CC, machine hrs, labour hrs, yield %, setup cost)
  → Save version → Toast
  → "Use in Standard Cost" (7) / "Assign to Work Order" (8)
```

**Input Data Required:** product / grade group, flow; per node: process name, CC code, machine hrs, labour hrs, std yield %, setup cost, inspection-gate flag.

**Output Generated:** an ordered, versioned routing; cumulative yield; total std machine/labour hours; the routing consumed by Standard Cost (7) and Work Order (8).

**Demo Data Examples:** HF route from `HF_ROUTE` (Circular Saw 820410300, Bandsaw 820410301, DHDM 820410302, … Final Inspection 820410306, Packing 820410308 — 12 ops). CF route `CF_ROUTE` (9 ops). U-Bend `UB_ROUTE` (U-Bending 820410352, SR Furnace "validate CC", Hydro 820410354). Node example: DHDM — CC 820410302, 1.2 machine hrs, 0.4 labour hrs, yield 98.5%, setup ₹850.

**UX Recommendations:** render the route as a **vertical timeline of node Cards** (reuses the `TraceabilityTimeline` visual language) with inline hours/yield and a reorder control cluster. Show a **cumulative yield** read-out at the bottom (e.g. 12 ops → 93.1% compounded) so reordering/removing a step visibly changes it. Flag ops missing a CC (SR Furnace) with a warn chip.

**Figma Layout Structure:**
```
AppShell → PageHeader("Routing Designer", right: Flow tabs, Save version) → DemoBanner
 ├ Tabs [ HF | CF | U-Bend ]
 ├ Node list (vertical): Card per op =
 │    [seq] Process name | CC chip | ⏱ machine hrs | 👷 labour hrs | yield% | setup ₹ | [↑ ↥ ✎ ✕ ↓]
 │    connector line between cards (TraceabilityTimeline styling)
 ├ Button("+ Insert process") at the end
 └ Summary bar: cumulative yield % (ProgressBar) · total machine hrs · total labour hrs · total setup
NodeEditor DetailDrawer = FormField(Process, CC, Machine hrs, Labour hrs, Yield %, Setup cost) + inspection-gate toggle
```

**Mobile Responsiveness:** node cards are already vertical; the action cluster wraps to a second line; reorder via up/down buttons (touch-friendly, ≥44 px); summary bar becomes a stacked set of chips.

---

## Module 7 — Standard Cost Simulator

**Screen Name:** Standard Cost Simulator · `/(app)/costing/standards` (simulator view).

**Screen Purpose:** interactive what-if costing — pick product / grade / quantity / route and see material, consumable, labour, machine, utility and overhead cost build into a cost waterfall and a final standard cost, recalculating instantly.

**User Actions:** select Product, Grade, Quantity, Route; adjust any input (± steppers or fields); watch instant recalculation; compare against the current standard; save as a new standard version (CST maker → FIN checker); export the cost sheet.

**Components Required:** `PageHeader`, input `Card` (`FormField` + segmented route picker + ± `IconButton`s), `CostBreakdownPanel` (element lines), `ChartCard` used as a **cost waterfall**, `KpiCard` (final std cost/kg), `DeltaPill` (vs current standard), `Button` (Save version), `Governance.ApprovalTimeline`, `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
Standard Cost Simulator
  Inputs: Product · Grade · Quantity · Route(from module 6)
   → instant recalc →
  Output: Cost Waterfall (Material → Consumable → Labour → Machine → Utility → Overhead → Std Cost)
   → Save as standard version (ApprovalTimeline)
   → "Create Work Order with this standard" (module 8)
```

**Input Data Required:** product, grade, quantity, selected routing; BOM (material + consumable), CC rates (machine/labour/utility/OH), yield. (Demo: `lib/costing` MHR + material cost + yield; `RATE_CARD`.)

**Output Generated:** per-element cost, cost waterfall, final standard cost/kg and per batch, delta vs current standard, a saved standard version, Annex A cost sheet CSV.

**Demo Data Examples:** Product `SAMPLE-TUBE-304-50`, grade 304, qty 5,000 kg, HF route → Material ₹512/kg, Consumable ₹18, Labour ₹9, Machine ₹41 (MHR), Utility ₹14, Overhead ₹22 → **Std cost ₹616/kg**; batch ₹30,80,000. Change qty to 10,000 kg → machine/kg drops (setup amortised) → ₹611/kg (instant).

**UX Recommendations:** this is the headliner interactive screen — put inputs in a left `Card` and the waterfall + final cost in the right, recalc on every keystroke/step (debounced). Use `ChartCard` bars as the waterfall (each element as a bar; final as a highlighted total). Always show the **delta vs current standard** so the simulation has meaning. Keep "Save version" as the single primary action.

**Figma Layout Structure:**
```
AppShell → PageHeader("Standard Cost Simulator", right: Export) → DemoBanner
 (wide = two columns)
 Left Card "Inputs":
   FormField(Product picker) · FormField(Grade) · FormField(Quantity, numeric, ± IconButtons) · Route segmented(HF/CF/UB)
 Right (flex):
   KpiCard("Standard cost / kg", value ₹616, DeltaPill vs current)
   ChartCard "Cost waterfall" (bars: Material, Consumable, Labour, Machine, Utility, Overhead, = Std cost)
   CostBreakdownPanel (same lines, numeric, traceable)
   Button("Save as standard version", primary) + ApprovalTimeline
```

**Mobile Responsiveness:** inputs stack above the output; waterfall bars are full-width; the final cost `KpiCard` pins visually at the top of the output; ± steppers are 44 px.
