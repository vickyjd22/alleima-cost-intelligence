# MANUAL_COVERAGE.md — AIPL-CAM-001 §/Annexure → app screen (client review aid)

Every manual section has a visible home in the review build. Formulas are candidate/SAMPLE until finance sign-off.

| Manual | App location | What the client sees |
|---|---|---|
| §1 Philosophy + formula | Costing header + Allocation tab | Product-cost equation, causal hierarchy, no-available-cost rule |
| §2 Regulatory (CAS-1..25) | Admin → framework table | 20-row CAS reference, law-prevails note, CAS-2/CAS-25 update flags |
| §3 Architecture L0–L8 + chain | Costing trace timeline, Inventory traceability, Work Orders | ORDER→WO→HEAT→TRAVELLER→CC→WIP→FG→SALES→PROFITABILITY on every flow |
| §4 CC/PC + Annex H (127) | Cost Centres (full 127 master, 4-type filter, §4.5 dept summary, 5 exceptions, §4.6 create) · Profit Centres (513/514/517, entity 8911, 514 interim drawer) | Their exact codes, blank-dept + missing-CC exceptions, interim-posting control |
| §5 HF/CF/U-Bend routes | Engineering → Routes tab | 12+9+8 operations with CCs; Open Annealing + SR Furnace flagged |
| §6 Material + heat/bar | Inventory (Stock/Movements/Physical/Trace), WO traveller validation | Landed-cost policy, length+weight, negative-balance guard, MPV/MUV in Costing |
| §7 BOM/routing/std cost | Engineering → Products & BOM + Rate register; Costing workbench | Versions + diff, §7.1 build-up, §7.3 7-step cycle, Annex C rate card shape |
| §8 Labour | Costing workbench labour line (OT traced, idle split) | Direct/indirect, §8.3 rate formula, §8.4 normal vs abnormal idle |
| §9 Machine/capacity | Engineering → Machines tab | MHR formula + 7-item pool, 5-level capacity ladder, 6 utilization KPIs |
| §10 Utilities | Engineering → Utilities tab | 7-utility driver matrix, utility-rate formula, meter-vs-norm control |
| §11 Consumables/maint. | Engineering → Consumables tab | 5 categories, HF/CF/H&I item list, MTBF/MTTR + PM KPIs |
| §12 Quality + CAS-21 | Quality | 4-class CoQ panel, EN 10204/3.2 + 100% ECT cert tracker, defect→process→recovery |
| §13 WIP/traveller | Inventory (Traceability, WIP), Work Orders | WIP model components, traveller control fields, 30/60/90 ageing bands |
| §14 Yield/loss | Reports (dictionary + top-5 + loss table), Costing yield line | 6-level yield dictionary, 6 loss treatments, yield variance, review-trigger rule |
| §15 Allocation | Costing → Allocation tab | 8-pool driver matrix, HF/Big/Small pools, pool-vs-allocated gate demo |
| §16 Overheads | Costing → Overheads tab | 10-category matrix, admin-fixed policy, %‑on‑sales discipline |
| §17 Other costs | Costing → Overheads tab; Finance bridge | Depreciation/royalty/CAS-17 notes, 6 abnormal/non-cost items kept out |
| §18 Reconciliation | Finance (6-layer bridge, Annex G export, equation header, abnormal bridge, close checklist) | SOPIC→ledger→PC→product-account→dispatch→costing layers, Invoice-0 register |
| §19 Profitability | Costing → Quotation tab; Reports margin card | 7-step waterfall, 7 dimensions, interactive sensitivity calculator |
| §20 Close D+1..D+12 | Finance checklist, Admin period lock, Reports Annex B | 11 close steps + 18-item Annex B, owner + outputs, lock guard by role |
| §21 CRA-1/audit | Reports CRA-1 matrix; Admin audit feed; Imports history | 13-area readiness, §21.2 trail standard (preparer/reviewer/reason/source) |
| §22 RACI/maker-checker | Reports RACI viewer; Approvals (maker≠checker, reject-reason); Admin policy form | 10-activity RACI, 7 maker-checker rules enforced in mocks |
| §23 KPIs/dashboard | Overview (4 quadrants: Material/Process/Conversion/Commercial) | 12 KPIs with §23 triggers, yield-by-flow chart |
| §24 Governance/ERP | Admin (master links, 8 ERP checks, triangle) + validation lib | 8 relationships, 8 blocking checks, LEDGER↔CC↔PROD/SALES triangle |
| §25 Priorities | Admin priorities list; exceptions surfaced per screen | 8 priorities traceable to CC exceptions, pool gate, heat rec, PC bridge |
| Annex A cost sheet | Reports Annex A card (14 lines) + CSV | Full Std/Actual/Variance/Comment shape |
| Annex D variance form | Reports Annex D card (11 fields, sample entry) | Investigation record shape with owner/due/closure |
| Annex E policy change | Admin policy drawer (Annex E fields, triple approval) | Full change-request workflow mock |
| Annex F source map | Imports adapter cards + docs/REQUIREMENTS | Every source → costing use mapping |
| Annex G reconciliation | Finance export `annexG-rec-sample.csv` + 6-layer table | Template fields incl. PRManager TBD flag |

Open client confirmations needed (manual §FINAL APPROVAL): final CC master, capacity, rates, inventory method, abnormal policy, UOM/CTA, ERP/PRManager definitions.
