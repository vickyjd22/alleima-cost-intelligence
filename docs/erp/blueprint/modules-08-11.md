# Blueprint — Modules 8–11

---

## Module 8 — Work Order Module

**Screen Name:** Work Orders — List → Create wizard → Detail · `/(app)/production/work-orders`.

**Screen Purpose:** create and run work orders through the lifecycle Create → Assign Routing → Assign BOM → Release → Production → Close, showing WO number, batch, customer, quantity and value.

**User Actions:** search/filter list; **Create Work Order** (wizard: product & qty → assign BOM → assign routing → review → create); **Release** (WO-01 material-ready gate); mark **In Production**; **Hold** (reason required); **Close**; open detail (travellers, issues, inspections, cost-to-date).

**Components Required:** `PageHeader`, `DataTable`, `StatusChip`, **`Stepper`** (Create / lifecycle), `DetailDrawer` or full detail route, `FormField`, `Button` (Release/Hold/Close), `ConfirmDialog`, `Governance.ApprovalTimeline`, `KpiCard` (WO value), `Toast`, `FeatureHelp`.

**Navigation Flow:**
```
Work Order List
 ├─ + Create → Stepper:
 │     1 Product & Qty  →  2 Assign BOM  →  3 Assign Routing  →  4 Review  →  Create
 ├─ Row press → WO Detail
 │     lifecycle Stepper: Draft → Approved → Released → InProgress → Completed → Closed
 │     actions: Release (WO-01), Hold (reason), Complete (WO-03), Close
 │     tabs/sections: Reservations · Travellers · Material Issues · Inspections · Cost-to-date
 └─ Release → generates Travellers (module 9)
```
Brief flow — **Create WO → Assign Routing → Assign BOM → Release → Production → Close** — maps to the wizard + lifecycle stepper above.

**Input Data Required:** customer order line (or stock), product, quantity, due date; BOM version; routing version. Status/lifecycle from `WO_MACHINE`.

**Output Generated:** a Work Order (number, batch, customer, qty, value); released travellers; the production shell for data capture (10); cost-to-date.

**Demo Data Examples:** WO `WO-2026-0314`, batch `B-304-221`, customer "Nordic Energy AB", qty 5,000 kg, value ₹30,80,000, product `SAMPLE-TUBE-304-50`, BOM v2, HF routing. Status demo: Draft → Released.

**UX Recommendations:** reuse `Stepper` for both the create wizard and the lifecycle (it already supports current/done states). Gate Release visibly: if material isn't reserved, the Release button is disabled with a `Toast`/`Callout` explaining WO-01. Show WO value as a `KpiCard` in the detail header. Hold always opens a reason `FormField` (WO-02).

**Figma Layout Structure:**
```
AppShell → PageHeader("Work Orders", right: PeriodSelector, + Create) → DemoBanner
List: DataTable(WO No | Batch | Customer | Product | Qty | Value | Status chip | ▸)
Create (route or drawer): Stepper[Product&Qty | BOM | Routing | Review] + FormField set per step + Button("Create")
Detail: PageHeader(WO No + status chip) + KpiCard(Value) + lifecycle Stepper
        + SectionHeader per section (Reservations / Travellers / Issues / Inspections / Cost-to-date) each a DataTable
        + action bar: Button(Release primary | Hold ghost | Complete | Close) + ApprovalTimeline
```

**Mobile Responsiveness:** wizard is one step per screen with Back/Next; list collapses to WO No + status + chevron; detail sections stack; action bar sticks to the bottom above the nav.

---

## Module 9 — Traveller Tracking

**Screen Name:** Traveller Tracking · `/(app)/production/travellers` + `[travellerNo]`.

**Screen Purpose:** manufacturing-execution demo — show a traveller's status, current / previous / upcoming process, heat number, machine, operator, as a visual timeline.

**User Actions:** filter travellers (by WO / heat / machine / status); open a traveller → visual timeline; step the demo forward (advance to next process) to show live movement; jump to the inspection or production entry for the current op.

**Components Required:** `PageHeader`, `DataTable`, `StatusChip`, **`TraceabilityTimeline`** (the required visual timeline), `KeyVal` (heat / machine / operator), `Stepper` (current stage marker), `Button` ("Advance stage" demo), `Toast`, `FeatureHelp`.

**Navigation Flow:**
```
Traveller List
 └─ Row press → Traveller Detail
      Visual Timeline (TraceabilityTimeline): previous ✓ → CURRENT ◉ → upcoming ○ ...
      Header: Traveller status chip · Heat no · Machine · Operator
      "Advance stage" (demo) → timeline moves → Toast
      "Inspect current op" → Quality (module 10/Quality)
      "Record output" → Production Entry (module 10)
```

**Input Data Required:** traveller no, WO, heat id, flow, ordered operations with status (done/current/upcoming), current machine, operator. (Demo: `demoDb.travellers`.)

**Output Generated:** a visual execution timeline; current-stage context; entry points to capture/inspect; status progression.

**Demo Data Examples:** Traveller `T-0314-07`, WO `WO-2026-0314`, Heat `H-304-5521`, flow HF; stages: Circular Saw ✓ → Band Saw ✓ → DHDM ◉ (current, machine DHDM-02, operator "R. Mehta") → Extrusion ○ → Straightening ○ → … Packing ○. Status: In Progress.

**UX Recommendations:** `TraceabilityTimeline` already renders a numbered vertical timeline with a highlighted final node — extend its usage so the **current** node is accented (orange) and done nodes show a check, upcoming nodes muted. Put Heat / Machine / Operator as a `KeyVal` strip under the status. The "Advance stage" button makes the demo feel alive without a backend.

**Figma Layout Structure:**
```
AppShell → PageHeader("Traveller Tracking", right: Filters) → DemoBanner
List: DataTable(Traveller | WO | Heat | Flow | Current op | Status chip | ▸)
Detail: header Card = status chip + KeyVal(Heat, Machine, Operator, WO)
        + TraceabilityTimeline(ops, with done/current/upcoming styling)
        + Button("Advance stage", primary, demo) + Button("Record output" / "Inspect", ghost)
```

**Mobile Responsiveness:** timeline is vertical (native fit); KeyVal strip wraps to two rows; list shows Traveller + current op + chevron.

---

## Module 10 — Production Data Capture

**Screen Name:** Production Data Capture — Entry / Machine Utilization / Labour / Consumption / Rejection · `/(app)/production/entry` (+ sub-tabs).

**Screen Purpose:** capture the shop-floor data that feeds the costing engine: production output, machine utilization, labour allocation, consumption, rejections.

**User Actions:** pick traveller + operation; record **Production Entry** (good output, scrap); record **Machine Utilization** (run/idle/breakdown hrs); record **Labour Allocation** (operator, hours); record **Consumption** (material/consumable qty); record **Rejection** (qty, defect code); confirm (supervisor approval if outside tolerance).

**Components Required:** `PageHeader`, **`Tabs`** (Production / Machine / Labour / Consumption / Rejection), `FormField`, `DataTable` (recent entries), `StatusChip`, `Stepper` (shop-floor flow: scan → record → confirm), `ConfirmDialog`, `Toast`, `FeatureHelp`.

**Navigation Flow:**
```
Production Data Capture (Tabs)
 ├─ Production Entry : select traveller/op → good kg, scrap kg → confirm
 ├─ Machine Utilization : machine → run / idle / changeover / breakdown hrs → save
 ├─ Labour Allocation : operator → hours by op/CC → save
 ├─ Consumption Entry : material/consumable → qty issued → save
 └─ Rejection Entry : qty → defect code → disposition → save
 (each save → Toast → feeds WIP (11), Allocation (12), Variance (13), Yield (14))
```

**Input Data Required:** traveller/op; good output kg, scrap kg; machine hours split; operator + labour hours; consumption qty; rejection qty + defect code + disposition. Validation `travellerEntrySchema`.

**Output Generated:** production records that drive costing: WIP movement, machine/labour/utility actuals, consumption, scrap/rejection — the inputs the cost engine (12) consumes.

**Demo Data Examples:** Traveller `T-0314-07`, DHDM op: good 4,820 kg, scrap 60 kg; machine DHDM-02 run 7.8 / idle 0.6 / breakdown 0.4 hrs; operator "R. Mehta" 8.0 hrs; consumption cutting fluid 12 L; rejection 20 kg defect `DIM-OD`, disposition Rework.

**UX Recommendations:** shop-floor UX = big fields, few per screen, the `Stepper` (scan → record → confirm) exactly as today's work-order stepper. Numeric keypads for quantities. Show a mass-balance hint (input = output + scrap) and warn (not block) when off by more than tolerance → supervisor approval (`ConfirmDialog`). Recent entries in a small `DataTable` for confidence.

**Figma Layout Structure:**
```
AppShell → PageHeader("Production Data Capture") → DemoBanner
 ├ Tabs[ Production | Machine | Labour | Consumption | Rejection ]
 ├ Stepper[ Select traveller | Record | Confirm ]  (Production tab)
 ├ Card(form): FormField set per tab (numeric)
 ├ mass-balance Callout (Production/Rejection tabs)
 ├ Button("Confirm entry", primary)
 └ DataTable "Recent entries" (op | qty | by | time | status chip)
```

**Mobile Responsiveness:** this is the most mobile-critical module — single-column big-input forms, 44 px+ targets, numeric keyboards, tabs scroll, Confirm pinned to bottom. Works on a shop-floor tablet/phone.

---

## Module 11 — WIP Valuation

**Screen Name:** WIP Valuation — Visual Manufacturing Pipeline · `/(app)/inventory/wip`.

**Screen Purpose:** value work-in-progress along the pipeline RM → Process 1 → Process 2 → Process 3 → FG, showing per-stage quantity, cost, yield and ageing.

**User Actions:** select period/flow; view the pipeline; tap a stage → stage detail (lots, cost build-up, ageing bands 30/60/90); drill a lot → its traveller; export WIP statement.

**Components Required:** `PageHeader`, **`TraceabilityTimeline`/`ChartCard`** as the pipeline, per-stage `Card` with `KeyVal` + `ProgressRing` (yield) + `StatusChip` (ageing), `DataTable` (lots at stage), `ExportButton`, `FeatureHelp`.

**Navigation Flow:**
```
WIP Valuation
  Pipeline: RM → Process 1 → Process 2 → Process 3 → FG  (each a stage card/node)
   ├─ Stage press → Stage detail: Qty · Cost · Yield · Ageing (lots DataTable)
   └─ Lot press → Traveller (module 9)
  → "Export WIP statement" (CSV)
```

**Input Data Required:** per stage: qty (kg), cost to stage, yield %, ageing (days); lots at each stage with their WO/traveller. (Demo: derived from travellers + std cost.)

**Output Generated:** WIP value by stage and total; yield per stage; ageing distribution; WIP statement CSV (close step D+9).

**Demo Data Examples:** RM ₹0 (0 d) → Cutting 1,200 kg ₹6.3 L yield 99% (4 d) → Extrusion 980 kg ₹7.1 L yield 96% (9 d) → Finishing 640 kg ₹5.2 L yield 97% (18 d) → FG (transferred). WIP total ₹18.6 L; 3 lots > 30 d flagged.

**UX Recommendations:** render the pipeline as a horizontal row of stage `Card`s on wide (connected like the KPI quads) and a vertical `TraceabilityTimeline` on compact. Each stage card: qty + cost (mono) + yield `ProgressRing` + ageing `StatusChip` (green < 30, amber 30–60, red > 60). Tapping expands the lot table. This directly satisfies "display per stage: Qty / Cost / Yield / Ageing".

**Figma Layout Structure:**
```
AppShell → PageHeader("WIP Valuation", right: PeriodSelector, Export) → DemoBanner
 ├ KpiCard strip: WIP total · >30d lots · avg ageing · blended yield
 ├ Pipeline (wide: row of 5 stage Cards with connectors; compact: TraceabilityTimeline)
 │    Stage Card = title + Qty + Cost(mono) + ProgressRing(yield) + ageing StatusChip
 └ Stage detail (on press): DataTable(Lot | WO | Qty | Cost | Age days | ▸)
```

**Mobile Responsiveness:** pipeline switches to the vertical timeline; stage cards stack; lot tables scroll horizontally; `ProgressRing` scales down.
