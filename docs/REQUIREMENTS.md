# REQUIREMENTS.md — Alleima Cost Intelligence

Source: `Alleima_India_Cost_Accounting_Manual_Draft V1 (1).pdf` (AIPL-CAM-001 V1 Draft, FY 2026–27) + ConnectHub visual reference `ui-design.png.png`.

> Costing manual is the functional spec. UI image is visual language only.

## 1. Costing principles (Sec 1)
- Product Cost = Direct Material + Direct Conversion + Traceable Quality/Testing + Packing + Allocated Production OH ± WIP adjustments.
- WO + Traveller = primary traceability key. Segmentation: Grade Group × Product Group × Process Flow.
- Practical/achievable capacity for fixed rates; idle capacity visible, not buried.
- Hierarchy: direct trace → causal driver → benefit → reasonable proxy, documented + consistent.
- Normal vs abnormal loss separated; abnormal excluded from normal product cost when material.

## 2. Regulatory (Sec 2)
Companies Act S.148, Cost Records & Audit Rules 2014, CAS-1, CAS-2 Rev 2024, CAS-3, CAS-4 Rev 2018, CAS-5..24, CAS-25 eff 12-Feb-2026. Law prevails over policy. Annual CAS-update check required.

## 3. Architecture (Sec 3)
- L0 Company/Mehsana → L1 Flow HF/CF/H&I/U-Bend → L2 Big/Small Flow → L3 Grade Group → L4 CC/WC → L5 WO → L6 Traveller/Pass → L7 SKU → L8 Customer Order.
- Masters: Product (grade, OD/WT/length, CTA/HSN, UOM), Order, RM heat/bar (weight+length, origin), Routing (op/machine/CC/seq/std hrs), BOM (qty, scrap factor), Traveller, Quality defect codes.
- Chain: ORDER → WO → HEAT/BAR → TRAVELLER/PASS → CCs → WIP → FG → DISPATCH/SALES → PROFITABILITY.

## 4. Masters (Sec 4 + Annex H/I)
- 127 source CC records = 118× `820410xxx` + 9× special `82049NVAT,82049REVD,82049ROYLT,82049VACO,82049VAFG,82049VARM,8204ASIG,8204SCRAP,8204USAGE`. Treat as **source data to import/validate**, never hard-code.
- Each CC needs: code, desc, dept/flow, type (Production/Service/Project/Reporting), owner, driver, UOM, capacity basis, product/WO applicability, PC relation, GL elements, rate method, effective date, active flag.
- Known exceptions: `820410205` blank dept, `820410802` dept `-`, Open Annealing needs new CC, SR Furnace needs validation, HF BOM `correct CC` vs process-map mismatch.
- PCs 513/514/517: posting at source; 514-as-interim only with auditable allocation. Entity 8911 retained on all group reports.

## 5. Costing engine (Sec 5–17) — candidate formulas, finance sign-off required
- MHR = Annual Allocable Machine Cost / Practical Machine Hours. Labour Rate = Eligible Direct Cost / Practical Productive Hours. Utility Rate = Total Utility Cost / Measured Units.
- MPV = AQ×(SR−AR); MUV = (SQ−AQ)×SR; Yield Var = Actual@Std − Expected@Std.
- WIP = RM/inputs + conversion to date + consumables + allocable OH − recoveries. Ageing from last movement.
- Overheads per CAS-3/11/15; depreciation CAS-16; R&D CAS-18; royalty CAS-20; finance CAS-17 kept out of inventory; abnormal/non-cost items reconciled separately.

## 6. Reconciliation (Sec 18, 20.2)
SOPIC ↔ ledger/GST ↔ dispatch ↔ product-account/FS (`PRManager/PRMangr` TBD) ↔ PC ↔ order profitability. Invoice `0`/blank → exception register, never silently included. Cost-financial bridge monthly, finalized annually.

## 7. Close & governance (Sec 20–22, 24)
- D+1..D+12 sequence (confirm dependencies with client before enforcing).
- Maker-checker on: product master, BOM/routing, rate change, manual allocation, abnormal classification, WIP write-off, policy change.
- ERP checks: no product w/o UOM, routing w/o CC, posting to inactive CC/machine, traveller w/o WO/product/grade/heat, negative heat w/o approval, duplicate traveller, unapproved BOM, manual rate w/o log.
- Reconciliation triangle: LEDGER ↔ CCs ↔ PROD/INV/SALES must tie monthly.

## 8. Non-functional
Expo Router + TS strict + RN Web; Firebase Auth/Firestore/Functions/Storage/AppCheck/FCM/Hosting; Emulator Suite; RBAC server-enforced; immutable ledger + idempotency + reversals; decimal-safe math; versioned rates/runs; audit history; offline for approved shop-floor flows; sample data clearly labelled, never real values invented.

## 9. Acceptance gates
Finance-approved examples for every calculation; pool-vs-allocated = 0 before close; period lock enforced by Functions; exports authorized only; UAT + financial sign-off before prod migration.
