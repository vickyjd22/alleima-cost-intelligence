/**
 * Shared SAMPLE dataset + helpers for the costing demo modules (blueprint
 * modules 5–19). All figures are illustrative, deterministic and reproducible;
 * candidate formulas only (same policy as src/lib/costing.ts). Nothing persists.
 *
 * Kept deliberately simple: plain exported constants + pure helpers so every
 * screen draws from one consistent source and the 14-step journey lines up.
 */

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
export const inr2 = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const lakh = (n: number) => `₹${(n / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`;
export const pct = (n: number) => `${n.toFixed(1)}%`;

/* ----------------------------------------------------------------- Products */
export interface DemoProduct {
  id: string; grade: string; gradeGroup: string; tubeType: string;
  od: number; wt: number; length: number; uom: string;
}
export const PRODUCTS: DemoProduct[] = [
  { id: 'SAMPLE-TUBE-304-50', grade: '304', gradeGroup: 'Austenitic', tubeType: 'Seamless', od: 50.8, wt: 2.0, length: 6000, uom: 'kg' },
  { id: 'SAMPLE-TUBE-2205-38', grade: '2205', gradeGroup: 'Duplex', tubeType: 'Seamless', od: 38.1, wt: 2.11, length: 6000, uom: 'kg' },
  { id: 'SAMPLE-UBEND-316-25', grade: '316L', gradeGroup: 'Austenitic', tubeType: 'U-Bend', od: 25.4, wt: 1.65, length: 12000, uom: 'kg' },
];

export const GRADE_RATE: Record<string, number> = { '304': 470, '2205': 612, '316L': 548 };

/* ------------------------------------------------------------- Cost centres */
export interface DemoCC {
  code: string; name: string; hierarchy: string; type: 'production' | 'service' | 'reporting';
  pool: number; driver: string; rate: number; owner: string; util: number;
}
export const COST_CENTRES: DemoCC[] = [
  { code: '820410300', name: 'Circular Saw', hierarchy: 'Hot Flow', type: 'production', pool: 1_820_000, driver: 'Machine hours', rate: 182, owner: 'hf.lead', util: 88 },
  { code: '820410151', name: 'Hot Extrusion Press', hierarchy: 'Hot Flow', type: 'production', pool: 4_210_000, driver: 'Machine hours', rate: 204, owner: 'hf.lead', util: 86 },
  { code: '820410309', name: 'Pilgering', hierarchy: 'Cold Flow', type: 'production', pool: 2_640_000, driver: 'Machine hours', rate: 168, owner: 'cf.lead', util: 82 },
  { code: '820410352', name: 'U-Bending', hierarchy: 'U-Bending', type: 'production', pool: 1_380_000, driver: 'Machine hours', rate: 196, owner: 'ub.lead', util: 71 },
  { code: '820410335', name: 'ECT Testing', hierarchy: 'Quality', type: 'service', pool: 840_000, driver: 'Test hours', rate: 120, owner: 'qa.lead', util: 64 },
  { code: '820410600', name: 'Maintenance', hierarchy: 'Maintenance', type: 'service', pool: 1_240_000, driver: 'Machine hours', rate: 0, owner: 'maint.lead', util: 0 },
  { code: '820410700', name: 'SCM / Stores', hierarchy: 'SCM', type: 'service', pool: 690_000, driver: 'PO count', rate: 0, owner: 'scm.lead', util: 0 },
  { code: '820410800', name: 'Finance', hierarchy: 'Finance', type: 'service', pool: 1_020_000, driver: 'Revenue %', rate: 0, owner: 'fin.lead', util: 0 },
  { code: '820410205', name: 'Annealing (dept blank)', hierarchy: 'Hot Flow', type: 'production', pool: 0, driver: '—', rate: 0, owner: '—', util: 0 },
];

/* ------------------------------------------------------------ Profit centres */
export const PROFIT_CENTRES = [
  { code: '513', entity: '8911', desc: 'Standard tubes', interim: false, revenue: 24_800_000, margin: 24.1 },
  { code: '514', entity: '8911', desc: 'Interim-controlled', interim: true, revenue: 15_200_000, margin: 19.6 },
  { code: '517', entity: '8911', desc: 'U-Bend & special', interim: false, revenue: 8_200_000, margin: 27.3 },
];

/* ---------------------------------------------------------------------- BOM */
export interface BomLine { section: 'Raw Material' | 'Consumables' | 'Packaging'; material: string; qtyPerKg: number; rate: number; scrap: number }
export const BOM_LINES: BomLine[] = [
  { section: 'Raw Material', material: '304 billet', qtyPerKg: 1.08, rate: 470, scrap: 0.08 },
  { section: 'Consumables', material: 'Pickling chemicals', qtyPerKg: 0.04, rate: 180, scrap: 0 },
  { section: 'Consumables', material: 'Lubricant', qtyPerKg: 0.02, rate: 240, scrap: 0 },
  { section: 'Packaging', material: 'End caps + crate', qtyPerKg: 0.01, rate: 90, scrap: 0 },
];
export function bomCostPerKg(lines: BomLine[]): { rm: number; consumable: number; packaging: number; total: number } {
  const sum = (s: BomLine['section']) => lines.filter((l) => l.section === s).reduce((a, l) => a + l.qtyPerKg * l.rate, 0);
  const rm = sum('Raw Material'); const consumable = sum('Consumables'); const packaging = sum('Packaging');
  return { rm, consumable, packaging, total: rm + consumable + packaging };
}

/* ------------------------------------------------------------------- Routes */
export interface RouteOp { seq: number; process: string; cc: string; machineHrs: number; labourHrs: number; yield: number; setup: number }
export const ROUTES: Record<string, RouteOp[]> = {
  HF: [
    { seq: 1, process: 'Circular Saw cutting', cc: '820410300', machineHrs: 0.3, labourHrs: 0.2, yield: 99.5, setup: 1200 },
    { seq: 2, process: 'Deep Hole Drilling', cc: '820410302', machineHrs: 1.2, labourHrs: 0.4, yield: 98.5, setup: 850 },
    { seq: 3, process: 'Hot Extrusion', cc: '820410151', machineHrs: 1.0, labourHrs: 0.5, yield: 97.0, setup: 4200 },
    { seq: 4, process: 'Straightening', cc: '820410300', machineHrs: 0.5, labourHrs: 0.3, yield: 99.0, setup: 600 },
    { seq: 5, process: 'Pickling', cc: '820410300', machineHrs: 0.4, labourHrs: 0.2, yield: 99.2, setup: 400 },
    { seq: 6, process: 'Hydro Test', cc: '820410335', machineHrs: 0.3, labourHrs: 0.3, yield: 99.6, setup: 500 },
    { seq: 7, process: 'Final Inspection', cc: '820410335', machineHrs: 0.2, labourHrs: 0.4, yield: 99.8, setup: 300 },
    { seq: 8, process: 'Packing', cc: '820410300', machineHrs: 0.2, labourHrs: 0.3, yield: 100, setup: 250 },
  ],
  CF: [
    { seq: 1, process: 'Pilgering', cc: '820410309', machineHrs: 1.8, labourHrs: 0.6, yield: 96.0, setup: 3800 },
    { seq: 2, process: 'Degreasing', cc: '820410309', machineHrs: 0.4, labourHrs: 0.2, yield: 99.5, setup: 300 },
    { seq: 3, process: 'Annealing', cc: '820410309', machineHrs: 0.9, labourHrs: 0.3, yield: 98.5, setup: 1500 },
    { seq: 4, process: 'CF Straightening', cc: '820410309', machineHrs: 0.5, labourHrs: 0.3, yield: 99.2, setup: 600 },
    { seq: 5, process: 'ECT & Marking', cc: '820410335', machineHrs: 0.4, labourHrs: 0.3, yield: 99.6, setup: 500 },
    { seq: 6, process: 'Final Inspection & Packing', cc: '820410335', machineHrs: 0.3, labourHrs: 0.4, yield: 99.8, setup: 400 },
  ],
  'U-Bend': [
    { seq: 1, process: 'U-Bending', cc: '820410352', machineHrs: 2.4, labourHrs: 0.8, yield: 97.0, setup: 5100 },
    { seq: 2, process: 'SR Furnace', cc: '820410352', machineHrs: 1.1, labourHrs: 0.3, yield: 99.0, setup: 2200 },
    { seq: 3, process: 'U-Tube Hydro', cc: '820410335', machineHrs: 0.5, labourHrs: 0.3, yield: 99.5, setup: 700 },
    { seq: 4, process: 'Cutting & Deburring', cc: '820410352', machineHrs: 0.4, labourHrs: 0.3, yield: 99.6, setup: 400 },
  ],
};
export type RouteKey = keyof typeof ROUTES;
export const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

export function cumulativeYield(ops: RouteOp[]): number {
  return ops.reduce((acc, o) => acc * (o.yield / 100), 1) * 100;
}

/* ------------------------------------------------------------- Work orders */
export interface DemoWO {
  id: string; batch: string; customer: string; product: string; route: RouteKey;
  qty: number; value: number; status: 'Draft' | 'Approved' | 'Released' | 'InProgress' | 'Completed' | 'Closed';
}
export const WORK_ORDERS: DemoWO[] = [
  { id: 'WO-2026-0314', batch: 'B-304-221', customer: 'Nordic Energy AB', product: 'SAMPLE-TUBE-304-50', route: 'HF', qty: 5000, value: 3_080_000, status: 'Released' },
  { id: 'WO-2026-0315', batch: 'B-2205-118', customer: 'Gulf Petro Ltd', product: 'SAMPLE-TUBE-2205-38', route: 'CF', qty: 3200, value: 2_528_000, status: 'InProgress' },
  { id: 'WO-2026-0316', batch: 'B-316-042', customer: 'Helix Medical', product: 'SAMPLE-UBEND-316-25', route: 'U-Bend', qty: 1800, value: 1_566_000, status: 'Draft' },
  { id: 'WO-2026-0312', batch: 'B-304-219', customer: 'Nordic Energy AB', product: 'SAMPLE-TUBE-304-50', route: 'HF', qty: 4200, value: 2_587_000, status: 'Completed' },
];

/* --------------------------------------------------------------- Travellers */
export interface DemoTravellerStage { process: string; machine: string; cc: string; state: 'done' | 'current' | 'upcoming' }
export interface DemoTraveller {
  id: string; wo: string; heat: string; operator: string; flow: RouteKey;
  status: 'In Progress' | 'At Inspection' | 'Completed'; stages: DemoTravellerStage[];
}
export const TRAVELLERS: DemoTraveller[] = [
  {
    id: 'T-0314-07', wo: 'WO-2026-0314', heat: 'H-304-5521', operator: 'R. Mehta', flow: 'HF', status: 'In Progress',
    stages: [
      { process: 'Circular Saw', machine: 'SAW-02', cc: '820410300', state: 'done' },
      { process: 'Deep Hole Drilling', machine: 'DHDM-02', cc: '820410302', state: 'current' },
      { process: 'Hot Extrusion', machine: 'PRESS-151', cc: '820410151', state: 'upcoming' },
      { process: 'Straightening', machine: 'STR-04', cc: '820410300', state: 'upcoming' },
      { process: 'Hydro Test', machine: 'HYD-01', cc: '820410335', state: 'upcoming' },
      { process: 'Final Inspection', machine: 'ECT-01', cc: '820410335', state: 'upcoming' },
      { process: 'Packing', machine: 'PACK-01', cc: '820410300', state: 'upcoming' },
    ],
  },
  {
    id: 'T-0315-03', wo: 'WO-2026-0315', heat: 'H-2205-3310', operator: 'S. Khan', flow: 'CF', status: 'At Inspection',
    stages: [
      { process: 'Pilgering', machine: 'PILGER-309', cc: '820410309', state: 'done' },
      { process: 'Annealing', machine: 'ANN-02', cc: '820410309', state: 'done' },
      { process: 'ECT & Marking', machine: 'ECT-02', cc: '820410335', state: 'current' },
      { process: 'Final Inspection & Packing', machine: 'PACK-02', cc: '820410335', state: 'upcoming' },
    ],
  },
];

/* --------------------------------------------------------------- WIP stages */
export interface WipStage { stage: string; qtyKg: number; cost: number; yield: number; ageDays: number }
export const WIP_STAGES: WipStage[] = [
  { stage: 'RM issued', qtyKg: 5400, cost: 2_538_000, yield: 100, ageDays: 2 },
  { stage: 'Cutting / Drilling', qtyKg: 1200, cost: 630_000, yield: 99, ageDays: 4 },
  { stage: 'Extrusion', qtyKg: 980, cost: 712_000, yield: 96, ageDays: 9 },
  { stage: 'Finishing / Test', qtyKg: 640, cost: 520_000, yield: 97, ageDays: 18 },
  { stage: 'FG transferred', qtyKg: 420, cost: 388_000, yield: 99, ageDays: 1 },
];

/* ------------------------------------------------------- Allocation drivers */
export interface AllocationPool { cc: string; service: string; pool: number; driver: string; drivers: string[]; split: [number, number, number] }
export const ALLOCATION_POOLS: AllocationPool[] = [
  { cc: '820410335', service: 'Quality', pool: 840_000, driver: 'Test hours', drivers: ['Test hours', 'Inspections', 'Output kg'], split: [52, 33, 15] },
  { cc: '820410600', service: 'Maintenance', pool: 1_240_000, driver: 'Machine hours', drivers: ['Machine hours', 'Maintenance hours', 'Asset value'], split: [62, 28, 10] },
  { cc: '820410700', service: 'SCM / Stores', pool: 690_000, driver: 'PO count', drivers: ['PO count', 'Issue lines', 'Material value'], split: [48, 34, 18] },
  { cc: '820410800', service: 'Finance', pool: 1_020_000, driver: 'Revenue %', drivers: ['Revenue %', 'Headcount', 'Transactions'], split: [60, 25, 15] },
];
export const ALLOC_TARGETS = ['Hot Flow', 'Cold Flow', 'U-Bending'] as const;

/* ---------------------------------------------------------------- Variance */
export interface VarianceRow { type: string; key: string; std: number; actual: number; rootCauseOwner: string }
export const VARIANCES: VarianceRow[] = [
  { type: 'Material price', key: '304 billet / Nordic', std: 2_350_000, actual: 2_365_000, rootCauseOwner: 'SCM' },
  { type: 'Material usage', key: 'WO-2026-0314', std: 2_365_000, actual: 2_375_000, rootCauseOwner: 'Production' },
  { type: 'Yield', key: 'DHDM-02 / 304', std: 2_375_000, actual: 2_397_000, rootCauseOwner: 'Production' },
  { type: 'Utilization', key: 'PRESS-151', std: 2_397_000, actual: 2_389_000, rootCauseOwner: 'Production' },
  { type: 'Labour efficiency', key: 'HF line', std: 2_389_000, actual: 2_397_000, rootCauseOwner: 'Production' },
];
// bridge: standard cost of actual output → actual cost
export const STD_COST_OF_OUTPUT = 2_910_000;
export const ACTUAL_COST = 2_930_000;

/* ------------------------------------------------------------ Yield & scrap */
export const YIELD_KPIS = { planned: 95.0, actual: 94.2, scrap: 1.4, rework: 0.8, rejection: 0.6 };
export const YIELD_BY_FLOW = [
  { flow: 'HF', yield: 93.1 }, { flow: 'CF', yield: 95.4 }, { flow: 'U-Bend', yield: 97.0 },
];
export const YIELD_DRILL: Record<string, { label: string; yield: number; next?: string }[]> = {
  root: [{ label: 'HF', yield: 93.1, next: 'HF' }, { label: 'CF', yield: 95.4, next: 'CF' }, { label: 'U-Bend', yield: 97.0, next: 'UB' }],
  HF: [{ label: 'DHDM-02', yield: 91.5, next: 'DHDM' }, { label: 'PRESS-151', yield: 94.0 }, { label: 'SAW-02', yield: 99.1 }],
  DHDM: [{ label: 'SAMPLE-TUBE-304-50', yield: 90.8, next: 'cause' }],
  cause: [{ label: 'Tool wear / feed rate (CAPA open)', yield: 0 }],
  CF: [{ label: 'PILGER-309', yield: 94.8 }, { label: 'ANN-02', yield: 97.2 }],
  UB: [{ label: 'UB-01', yield: 96.5 }, { label: 'SR-FURNACE', yield: 98.9 }],
};

/* --------------------------------------------------------- Profitability */
export interface ProductProfit { product: string; gradeGroup: string; flow: RouteKey; revenue: number; material: number; conversion: number }
export const PRODUCT_PROFIT: ProductProfit[] = [
  { product: 'SAMPLE-TUBE-304-50', gradeGroup: 'Austenitic', flow: 'HF', revenue: 4_120_000, material: 2_560_000, conversion: 590_000 },
  { product: 'SAMPLE-TUBE-2205-38', gradeGroup: 'Duplex', flow: 'CF', revenue: 3_480_000, material: 1_980_000, conversion: 520_000 },
  { product: 'SAMPLE-UBEND-316-25', gradeGroup: 'Austenitic', flow: 'U-Bend', revenue: 2_260_000, material: 1_190_000, conversion: 410_000 },
];
export function margin(p: ProductProfit): number { return p.revenue - p.material - p.conversion; }
export function marginPct(p: ProductProfit): number { return p.revenue > 0 ? (margin(p) / p.revenue) * 100 : 0; }

export interface CustomerProfit { customer: string; revenue: number; material: number; conversion: number; testing: number; packing: number; logistics: number }
export const CUSTOMER_PROFIT: CustomerProfit[] = [
  { customer: 'Nordic Energy AB', revenue: 14_200_000, material: 8_600_000, conversion: 2_100_000, testing: 400_000, packing: 200_000, logistics: 500_000 },
  { customer: 'Gulf Petro Ltd', revenue: 9_800_000, material: 5_400_000, conversion: 1_500_000, testing: 280_000, packing: 160_000, logistics: 420_000 },
  { customer: 'Helix Medical', revenue: 6_400_000, material: 3_200_000, conversion: 1_250_000, testing: 520_000, packing: 140_000, logistics: 180_000 },
];
export function customerMargin(c: CustomerProfit): number {
  return c.revenue - c.material - c.conversion - c.testing - c.packing - c.logistics;
}

/* -------------------------------------------------------------- Monthly close */
export interface CloseStepDemo { id: string; name: string; owner: string; module: string }
export const CLOSE_STEPS_DEMO: CloseStepDemo[] = [
  { id: 'rm', name: 'RM Reconciliation', owner: 'Stores / Costing', module: '/(app)/inventory' },
  { id: 'heat', name: 'Heat Reconciliation', owner: 'Stores', module: '/(app)/inventory' },
  { id: 'prod', name: 'Production Reconciliation', owner: 'Production', module: '/(app)/production-capture' },
  { id: 'yield', name: 'Yield Review', owner: 'Costing', module: '/(app)/yield-scrap' },
  { id: 'alloc', name: 'Allocation Execution', owner: 'Costing', module: '/(app)/allocation' },
  { id: 'wip', name: 'WIP Valuation', owner: 'Costing', module: '/(app)/wip' },
  { id: 'profit', name: 'Profitability Run', owner: 'Costing / Sales', module: '/(app)/product-profitability' },
  { id: 'recon', name: 'Cost-Financial Reconciliation', owner: 'Finance', module: '/(app)/finance' },
  { id: 'close', name: 'Close Month (lock)', owner: 'Finance', module: '/(app)/monthly-close' },
];

/* ---------------------------------------------------- Cost audit readiness */
export interface AuditMetric { key: string; label: string; count: number }
export const AUDIT_METRICS: AuditMetric[] = [
  { key: 'bom', label: 'Missing BOM', count: 2 },
  { key: 'routing', label: 'Missing Routing', count: 1 },
  { key: 'cc', label: 'Missing / blank Cost Centres', count: 2 },
  { key: 'recon', label: 'Reconciliation exceptions', count: 2 },
  { key: 'alloc', label: 'Allocation exceptions', count: 1 },
];
export const AUDIT_TOTAL_CHECKS = 100;
export function auditScore(metrics: AuditMetric[]): number {
  const issues = metrics.reduce((a, m) => a + m.count, 0);
  return Math.max(0, Math.round(((AUDIT_TOTAL_CHECKS - issues) / AUDIT_TOTAL_CHECKS) * 100));
}

/* ------------------------------------------------- 14-step demo journey */
export interface JourneyStep {
  n: number;
  title: string;
  route: string;
  icon: string; // IconName
  show: string; // one-line "what to show"
  output: string; // what it produces for the next step
}
export const JOURNEY: JourneyStep[] = [
  { n: 1, title: 'Create Product', route: '/(app)/products', icon: 'package', show: 'Clone a sample product and save.', output: 'Product usable in BOM & Routing' },
  { n: 2, title: 'Create BOM', route: '/(app)/bom', icon: 'layers', show: 'Add material lines; watch the live cost impact.', output: 'Material cost / kg' },
  { n: 3, title: 'Create Routing', route: '/(app)/routing', icon: 'workflow', show: 'Build the HF route; reorder a step and watch yield change.', output: 'Machine/labour hours, cumulative yield' },
  { n: 4, title: 'Run Standard Cost', route: '/(app)/standard-cost', icon: 'calculator', show: 'Pick product + route + qty → cost waterfall → standard cost.', output: 'Standard cost baseline' },
  { n: 5, title: 'Create Work Order', route: '/(app)/work-order-mgmt', icon: 'clipboard', show: 'Run the create wizard → a new work order.', output: 'A released-ready work order' },
  { n: 6, title: 'Capture Production', route: '/(app)/production-capture', icon: 'scan', show: 'Record output / scrap / machine / labour.', output: 'Actuals for costing' },
  { n: 7, title: 'Track Traveller', route: '/(app)/traveller-tracking', icon: 'route', show: 'Open the timeline and advance a stage.', output: 'Execution state + heat/machine/operator' },
  { n: 8, title: 'Calculate WIP', route: '/(app)/wip', icon: 'boxes', show: 'View the pipeline: qty / cost / yield / ageing per stage.', output: 'WIP value' },
  { n: 9, title: 'Run Allocations', route: '/(app)/allocation', icon: 'sliders', show: 'Change a driver → recalculate → see the impact; gate = 0.', output: 'Allocated conversion cost' },
  { n: 10, title: 'View Variance', route: '/(app)/variance-analysis', icon: 'activity', show: 'Read the std→actual bridge; drill a variance.', output: 'Variance explanation' },
  { n: 11, title: 'Product Profitability', route: '/(app)/product-profitability', icon: 'trendingUp', show: 'Grid / Chart / Heatmap; open a margin breakdown.', output: 'Product margin' },
  { n: 12, title: 'Customer Profitability', route: '/(app)/customer-profitability', icon: 'users', show: 'Interactive margin waterfall for a customer.', output: 'Customer margin' },
  { n: 13, title: 'Close Month', route: '/(app)/monthly-close', icon: 'calendarClock', show: 'Work the checklist and lock the month.', output: 'Locked period + cost pack' },
  { n: 14, title: 'Executive Dashboard', route: '/(app)/dashboard', icon: 'layoutDashboard', show: 'See the whole month reflected in management KPIs.', output: 'The story lands' },
];

/* ------------------------------------------------ Dashboard trend series */
/** SAMPLE 6-month series for the dashboard Analytics Overview (labelled SAMPLE in UI). */
export const TREND_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
export const PRODUCTION_TREND = [380, 410, 395, 430, 445, 460]; // tonnes / month
export const YIELD_TREND = [93.6, 93.9, 94.0, 94.1, 94.0, 94.2]; // %
