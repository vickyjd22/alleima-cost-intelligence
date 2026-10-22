/** D+1..D+12 monthly close checklist — tentative per manual Sec 20, confirm dependencies. */

export interface CloseStep {
  day: string;
  activity: string;
  owner: string;
  output: string;
}

export const CLOSE_STEPS: CloseStep[] = [
  { day: 'D+1–D+2', activity: 'Production, RM, WIP, sales data freeze', owner: 'Operations/SCM/Finance', output: 'Data freeze' },
  { day: 'D+3', activity: 'RM consumption + heat/bar reconciliation', owner: 'Costing/Stores', output: 'RM reconciliation' },
  { day: 'D+4', activity: 'Production + yield reconciliation', owner: 'Production/Costing', output: 'Yield report' },
  { day: 'D+5', activity: 'Machine utilization + stoppage analysis', owner: 'Production/Engineering', output: 'Capacity report' },
  { day: 'D+6', activity: 'Payroll + employee cost allocation', owner: 'HR/Finance/Costing', output: 'Labour cost' },
  { day: 'D+7', activity: 'Utilities, maintenance, consumable allocation', owner: 'Engineering/Finance', output: 'Conversion pools' },
  { day: 'D+8', activity: 'Service cost centre allocation', owner: 'Finance/Costing', output: 'Allocated service cost' },
  { day: 'D+9', activity: 'WIP valuation + ageing', owner: 'Costing', output: 'WIP statement' },
  { day: 'D+10', activity: 'Product/order profitability', owner: 'Costing/Sales', output: 'Margin report' },
  { day: 'D+11', activity: 'SOPIC + PC + product-account reconciliation', owner: 'Costing/Accounts', output: 'Reconciliation' },
  { day: 'D+12', activity: 'Management review + exception closure', owner: 'Plant/Finance', output: 'Monthly cost pack' },
];

export type StepStatus = 'pending' | 'done' | 'blocked';

export function closeProgress(status: Record<string, StepStatus>): number {
  const total = CLOSE_STEPS.length;
  const done = CLOSE_STEPS.filter((s) => status[s.day] === 'done').length;
  return Math.round((done / total) * 100);
}
