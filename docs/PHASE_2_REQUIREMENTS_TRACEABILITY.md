# PHASE_2_REQUIREMENTS_TRACEABILITY.md (extract — full matrix in docs/REQUIREMENTS.md + MANUAL_COVERAGE.md)

| Req | Description | Role | Module | Route | Status | Confirm? |
|---|---|---|---|---|---|---|
| R-AUTH | Sign-in/invite/verify/reset/denied/profile/theme/sign-out | all | 7.1/7.16 | (auth)/*, profile | Implemented — Demo | Invite-only policy (D-01) |
| R-EXEC | Mgmt dashboard + drill-downs | mgmt | 7.2 | overview | Implemented — Demo | Trigger limits |
| R-MASTER | 127 CCs, PCs, products, rates, periods | admins | 7.3 | cost-centres, profit-centres, engineering | Implemented — Demo | D-03 |
| R-PLAN | WO create/release/hold/complete | prod | 7.4 | planning, work-orders | Implemented — Demo | D-05 |
| R-TRAV | Traveller ops + validation | operator | 7.5 | work-orders | Implemented — Demo | D-06 |
| R-INV | Receipt/issue/transfer/WIP/FG/trace | stores | 7.6 | inventory | Implemented — Demo | D-07/D-08 |
| R-ENG | BOM/routing/ECR/impact | eng | 7.7 | engineering | Implemented — Demo | D-04 |
| R-QUAL | Inspections/NCR/hold/release | quality | 7.8 | quality | Implemented — Demo | D-06 |
| R-COST | Costing runs + variance + approval | costing | 7.9 | costing | Implemented — Demo | D-10/D-11 |
| R-FIN | Reconciliation + close + lock | finance | 7.10 | finance | Implemented — Demo | D-13/D-14 |
| R-APPR | Maker-checker approvals | all | 7.11 | approvals | Implemented — Demo | D-01 |
| R-REP | 9 reports + CSV export | mgmt | 7.12 | reports | Implemented — Demo | D-15 |
| R-IMP | Import validate/commit | admins | 7.13 | imports | Implemented — Demo (simulated) | — |
| R-INT | ERP/SOPIC/HR monitoring | admins | 7.14 | integrations | Implemented — Demo (simulated) | D-16 |
| R-ADMIN | Users/audit/reset | admins | 7.15 | admin | Implemented — Demo | D-18 |
| R-NOTIF | Inbox + preferences | all | 7.16 | notifications | Implemented — Demo | — |
| R-REVIEW | Review mode + feedback + guides | all | §13 | review | Implemented — Demo | — |

Nothing marked production-ready on UI alone. Financial sign-off + UAT gate before prod migration.
