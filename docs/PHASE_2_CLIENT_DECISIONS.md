# PHASE_2_CLIENT_DECISIONS.md — decision register (proposed ≠ approved)

| ID | Question | Why it matters | Proposed demo behaviour | Owner | Status |
|---|---|---|---|---|---|
| D-01 | Final role definitions + maker-checker pairs | AuthZ enforcement | 15 roles, mock guard; production in Functions/Rules | Client Admin | Proposed |
| D-02 | Plant/Org hierarchy (Mehsana-only?) | Scope + filters | Single plant `mehsana` | Plant Head | Proposed |
| D-03 | 127 CCs + PCs 513/514/517 final | Masters + postings | Source data to import, exceptions flagged | Finance | Requires Confirmation |
| D-04 | Flow/route defs (HF/CF/H&I/UB, Big/Small) | Routing/costing | A§5 routes; missing-CC flags | Engineering | Requires Confirmation |
| D-05 | WO lifecycle + hold/cancel policy | Production control | Release/hold/complete mock | Prod Mgr | Proposed |
| D-06 | Traveller thresholds (qty limits, inspection gates) | Validation | Clearly labelled demo limits | Quality | Requires Confirmation |
| D-07 | Heat/batch traceability depth | Compliance | Lot→WO→traveller→FG demo chain | Stores/Quality | Proposed |
| D-08 | Ledger posting + reversal rules | Audit | Simulated posts, reversal flow; real posts in Functions only | Finance | Requires Confirmation |
| D-09 | Scrap/rework/abnormal treatment | Product cost | CAS-guided demo split, abnormal separate | Costing/Finance | Requires Confirmation |
| D-10 | Cost formulas (MHR/labour/utility/OH/yield) | Calculation correctness | Illustrative formulas, finance sign-off required | Costing/Finance | Requires Confirmation |
| D-11 | Std vs actual, UOM, rounding, currency (INR) | Meaning of numbers | Decimal-safe, INR, documented assumptions | Finance | Requires Confirmation |
| D-12 | Rate effective dates + approval authority | Versioning | Version compare demo; approve in Functions | Costing | Proposed |
| D-13 | Reconciliation rules + D+1..D+12 binding | Close discipline | D+1..D+12 checklist demo | Finance | Requires Confirmation |
| D-14 | Period lock/reopen owners | Control | Role-guarded mock lock | Finance/Admin | Requires Confirmation |
| D-15 | Reports/exports required | Scope | 9 reports + CSV; Excel/print entry points | Management | Requires Confirmation |
| D-16 | ERP/SAP/SOPIC/HR live vs import MVP | Integration | Simulated statuses, no fake success | IT/Finance | Requires Confirmation |
| D-17 | HR/payroll scope | Module boundary | Excluded pending confirmation | HR | Requires Confirmation |
| D-18 | Audit retention | Compliance | In-session log demo; server retention TBD | Admin | Proposed |
| D-19 | Offline requirements | Shop-floor | Queue stub for approved flows | Production/IT | Requires Confirmation |
| D-20 | Brand tokens final | Design sign-off | Indigo `#4F46E5` proposal | Founder | Proposed |

No proposed interpretation is treated as approved business rule. Nothing posts to real ledgers in demo.
