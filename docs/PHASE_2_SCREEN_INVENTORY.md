# PHASE_2_SCREEN_INVENTORY.md — route map (41 web routes exported)

| # | Route | Module § | Roles | Status |
|---|---|---|---|---|
| 1 | /(auth)/splash | 7.1 | all | Implemented — Demo |
| 2 | /(auth)/sign-in | 7.1 | all | Implemented — Demo |
| 3 | /(auth)/verify | 7.1 | all | Implemented — Demo |
| 4 | /(auth)/notice | 7.1 pending/denied/expired | all | Implemented — Demo |
| 5 | /(app)/overview | 7.2 | all | Implemented — Demo |
| 6 | /(app)/cost-centres | 7.3 | no-operator | Implemented — Demo |
| 7 | /(app)/profit-centres | 7.3 | no-operator | Implemented — Demo |
| 8 | /(app)/planning | 7.4 | planners | Implemented — Demo |
| 9 | /(app)/work-orders | 7.4+7.5 | all | Implemented — Demo |
| 10 | /(app)/inventory | 7.6 | ops+finance | Implemented — Demo |
| 11 | /(app)/engineering | 7.7 | eng/mgmt | Implemented — Demo |
| 12 | /(app)/quality | 7.8 | quality/ops | Implemented — Demo |
| 13 | /(app)/costing | 7.9 | costing/finance | Implemented — Demo |
| 14 | /(app)/finance | 7.10 | finance/mgmt | Implemented — Demo |
| 15 | /(app)/approvals | 7.11 | all | Implemented — Demo |
| 16 | /(app)/reports | 7.12 | no-operator | Implemented — Demo |
| 17 | /(app)/imports | 7.13 | admins/data | Implemented — Demo |
| 18 | /(app)/integrations | 7.14 | admins | NEW this milestone |
| 19 | /(app)/admin | 7.15 | admins | Implemented — Demo |
| 20 | /(app)/notifications | 7.16 | all | NEW this milestone |
| 21 | /(app)/profile | 7.1/7.16 | all | Implemented — Demo |
| 22 | /(app)/review | §13 review mode | all | NEW this milestone |

Every screen: purpose header, SAMPLE data, search/filter/sort/pagination where listed, validation, loading/empty/error/denied states, back navigation via shell, no inert controls.
