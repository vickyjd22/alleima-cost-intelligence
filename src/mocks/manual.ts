/**
 * Manual data pack — AIPL-CAM-001 §/Annexure reference content (SAMPLE review build).
 * Cost-centre master = the 127-row Annexure H source listing; classification per §4.5.
 * Nothing here is an approval — master-data governance (§4.6) applies.
 */

// ── Annexure H: 127-row source listing [code, description, department] ──
const RAW: [string, string, string][] = [
  ['820410111', 'PU MEHSANA', 'PU MEHSANA'], ['820410122', 'PURCHASE DEPARTMENT', 'SCM'],
  ['820410131', 'HR ,IR, & ADMIN', 'HR-IR-Admin'], ['820410132', 'T-BAS Implementation', 'Finance'],
  ['820410151', 'PRESS', 'Hot Flow'], ['820410171', 'Mechanical Maintenance', 'Maintenance'],
  ['820410172', 'SMT MAINTENANCE OTHE', 'Maintenance'], ['820410181', 'ENVIRONMENT SAFETY', 'EHS'],
  ['820410191', 'COMMON', 'SCM'], ['820410192', 'COMMON', 'SCM'],
  ['820410201', 'New Projects', 'Cold Flow'], ['820410202', 'I & T Charges', 'New Project'],
  ['820410203', 'Continuos Improvemen', 'Continuous Improvement'], ['820410204', 'Demerger Cost', 'Demerger Cost'],
  ['820410205', 'Mayur Project', ''], ['820410257', 'Solar Projects', 'Cold Flow'],
  ['820410258', 'PM 305 Building Ext', 'Cold Flow'], ['820410259', 'CSR - Mehsana', 'CSR - Mehsana'],
  ['820410260', 'PEACOCK-Building', 'Cold Flow'], ['820410261', 'PEACOCK-Infrastructu', 'Cold Flow'],
  ['820410262', 'PEACOCK-Media', 'Cold Flow'], ['820410263', 'PEACOCK-DEGREASING', 'Cold Flow'],
  ['820410264', 'PEACOCK-Electric', 'Cold Flow'], ['820410265', 'PEACOCK-Machines', 'Cold Flow'],
  ['820410266', 'PEACOCK-Services', 'Cold Flow'], ['820410267', 'Annealing CF-(TM21)', 'TM21-HX'],
  ['820410268', 'Straightening CFTM21', 'TM21-HX'], ['820410269', 'Polishing CF-(TM21)', 'TM21-HX'],
  ['820410270', 'Hydro CF-(TM21)', 'TM21-HX'], ['820410271', 'ECT-Marking & PMI CF', 'TM21-HX'],
  ['820410272', 'Cutting & Deburring', 'TM21-HX'], ['820410273', 'Final inspection & P', 'TM21-HX'],
  ['820410274', 'TWIN PILGER CF-(TM22', 'TM22-H&I'], ['820410275', 'DEGREASING & WELDING', 'TM22-H&I'],
  ['820410276', 'Intermediate Annealing CF-(TM22)-Peacock', 'TM22-H&I'], ['820410277', 'DRAWING CF-(TM22)', 'TM22-H&I'],
  ['820410278', 'FINAL ANNEALING CF', 'TM22-H&I'], ['820410279', 'FINISHING LINE CF', 'TM22-H&I'],
  ['820410280', 'INSPECTION CF-(TM22)', 'TM22-H&I'], ['820410282', 'Rebranding cost', 'PU MEHSANA'],
  ['820410283', 'INDIRECT PURCHASE', 'Indirect Purchase'], ['820410284', 'Packing CF-(TM21)', 'TM21-HX'],
  ['820410285', 'Packing CF-(TM22)', 'TM22-H&I'], ['820410286', 'UT Machine (TM21)', 'TM21-HX'],
  ['820410288', 'TM21(PEACOCK PROJECT', 'TM21-HX'], ['820410289', 'TM22(PEACOCK PROJECT', 'TM22-H&I'],
  ['820410290', 'SCR60 Pilger mill', 'TM21-HX'], ['820410291', 'SUB-CONTRACT-STRAIGHTENING', 'Cold Flow'],
  ['820410292', 'SUB-CONTRACT-UT', 'Cold Flow'], ['820410293', 'SUB-CONTRACT-POLISHING', 'Cold Flow'],
  ['820410300', 'Circular Saw', 'Hot Flow'], ['820410301', 'Band saws', 'Hot Flow'],
  ['820410302', 'Deep Hole Drilling M', 'Hot Flow'], ['820410303', 'Turning outsourced', 'Hot Flow'],
  ['820410304', 'End phasing in house', 'Hot Flow'], ['820410305', 'Deglassing', 'Hot Flow'],
  ['820410306', 'HF Finishing and ins', 'Hot Flow'], ['820410307', 'Pickling', 'Hot Flow'],
  ['820410308', 'HF Testing, marking', 'Hot Flow'], ['820410309', 'Pilgering', 'Cold Flow'],
  ['820410310', 'CF Annealing', 'Cold Flow'], ['820410311', 'CF Finishing', 'Cold Flow'],
  ['820410312', 'CF Non Destructive T', 'Cold Flow'], ['820410313', 'CF Inspection & Pack', 'Cold Flow'],
  ['820410314', 'Bar peeling outsourc', 'SCM'], ['820410315', 'Dispatch outsourced', 'SCM'],
  ['820410316', 'U-bending outsourced', 'U-Bend'], ['820410317', 'Cold flow outsourced', 'Cold Flow'],
  ['820410318', 'Finance', 'Finance'], ['820410319', 'Stores', 'SCM'],
  ['820410320', 'Communication', 'HR-IR-Admin'], ['820410321', 'Cutting -End Cut', 'Hot Flow'],
  ['820410322', 'Cutting -Fix Length', 'Hot Flow'], ['820410323', 'Passivation', 'Hot Flow'],
  ['820410324', 'Marking Hollow for C', 'Cold Flow'], ['820410325', 'Marking CF', 'Cold Flow'],
  ['820410326', 'Hydro Testing', 'Hot Flow'], ['820410327', 'Bevelling-HF', 'Hot Flow'],
  ['820410328', 'Stabilisation Heat', 'Cold Flow'], ['820410329', 'EDDY Current Testing', 'Cold Flow'],
  ['820410330', 'Bio-Metallic', 'HR-IR-Admin'], ['820410331', 'Cutting -Fix Length', 'Cold Flow'],
  ['820410332', 'Cutting -End Cut CF', 'Cold Flow'], ['820410333', 'Deburring-CF', 'Cold Flow'],
  ['820410334', 'Aneal Pickle -CF', 'Cold Flow'], ['820410335', 'EC Test & Marking', 'Cold Flow'],
  ['820410336', 'Hydro Testing-CF', 'Cold Flow'], ['820410337', 'Passivation-Cf', 'Cold Flow'],
  ['820410338', 'Packing -CF', 'Cold Flow'], ['820410339', 'Waiting After Mark', 'Hot Flow'],
  ['820410340', 'Load Plate', 'SCM'], ['820410341', 'UT-Tesitng-HF', 'Hot Flow'],
  ['820410342', 'UT-Tesitng-CF', 'Cold Flow'], ['820410343', 'Polishing-CF', 'Cold Flow'],
  ['820410344', 'Marking & Packing HF', 'Hot Flow'], ['820410349', 'Straightening- Cold', 'Cold Flow'],
  ['820410350', 'Straightening- Hot', 'Hot Flow'], ['820410351', 'U-LEG CUT & DEBURING', 'U-Bend'],
  ['820410352', 'U-BENDING', 'U-Bend'], ['820410353', 'U-STRESS RELIEVE', 'U-Bend'],
  ['820410354', 'U-HYDRO TEST', 'U-Bend'], ['820410355', 'U-FINAL INSPECTION', 'U-Bend'],
  ['820410356', 'U-PACKING', 'U-Bend'], ['820410357', 'U-PICKLING', 'U-Bend'],
  ['820410411', 'HF ID Boroscopy', 'Hot Flow'], ['820410412', 'CF ID Boroscopy', 'Cold Flow'],
  ['820410413', 'HF-OD ID Polishing', 'Hot Flow'], ['820410414', 'CF - ID OD Polishing', 'Cold Flow'],
  ['820410415', 'QUALITY', 'Quality'], ['820410416', 'HF-Polishing', 'Hot Flow'],
  ['820410450', 'COLD FINISHING', 'Cold Flow'], ['820410451', 'PM305 – Pilgering', 'PM 305'],
  ['820410452', 'PM305 – Degreasing', 'PM 305'], ['820410801', 'SMT TECHNICAL', 'Quality'],
  ['820410802', 'SMT MEDTECH', '-'], ['820410810', 'SMT MEHSANA LOGISTIC', 'SCM'],
  ['820410820', 'SMT Logistics CIF', 'SCM'], ['820410822', 'Mehsana Distribiutio', 'Finance'],
  ['82049NVAT', 'CST-LBT NONVATABLE', 'Finance'], ['82049REVD', 'Revenue discount', 'Finance'],
  ['82049ROYLT', 'Royalty', 'Finance'], ['82049VACO', 'Variance Consum', 'Finance'],
  ['82049VAFG', 'Variance FG', 'Finance'], ['82049VARM', 'Variances Raw Matrl', 'SCM'],
  ['8204ASIG', 'A&S INTGRP', 'Finance'], ['8204SCRAP', 'SCRAP SALE', 'Finance'],
  ['8204USAGE', 'Planned Utilisation', 'Finance'],
];

const SPECIAL = new Set(['82049NVAT', '82049REVD', '82049ROYLT', '82049VACO', '82049VAFG', '82049VARM', '8204ASIG', '8204SCRAP', '8204USAGE']);
const PROD_DEPTS = new Set(['Hot Flow', 'Cold Flow', 'TM21-HX', 'TM22-H&I', 'U-Bend', 'PM 305']);
const SPECIAL_DEPTS = new Set(['CSR - Mehsana', '-', '', 'Indirect Purchase', 'Continuous Improvement', 'Demerger Cost', 'New Project']);

export type CCType = 'production' | 'service' | 'project' | 'reporting';
export interface CCRow { code: string; desc: string; dept: string; type: CCType; driver: string; uom: string }

export const CC_MASTER: CCRow[] = RAW.map(([code, desc, dept]) => {
  let type: CCType = 'service';
  if (SPECIAL.has(code)) type = 'reporting';
  else if (PROD_DEPTS.has(dept)) type = 'production';
  else if (SPECIAL_DEPTS.has(dept)) type = 'project';
  const driver = type === 'production' ? (dept === 'U-Bend' ? 'machine-hrs/pieces' : 'machine-hrs/output') : type === 'service' ? 'transactions/hours' : 'n/a';
  return { code, desc, dept: dept === '' ? '(blank — confirm)' : dept, type, driver, uom: type === 'reporting' || type === 'project' ? 'n/a' : 'hr' };
});

export const CC_EXCEPTIONS = [
  { code: '820410205', issue: 'Department blank — management confirmation required (§4.5)' },
  { code: '820410802', issue: "Department '–' — management confirmation required (§4.5)" },
  { code: 'Open Annealing', issue: 'HF step 8 — new/validated CC required (§5.1)' },
  { code: 'SR Furnace', issue: 'U-Bend — validate dedicated CC (§5.3)' },
  { code: 'HF BOM', issue: "Process-map vs 'correct CC' differences — reconcile before effective (§4.1)" },
];

// §4.5 department summary [dept, codes, treatment]
export const CC_DEPT_SUMMARY: [string, number, string][] = [
  ['Cold Flow', 37, 'Production/process pool'], ['Hot Flow', 22, 'Production/process pool'],
  ['Finance', 11, 'Service/support pool'], ['TM21-HX', 11, 'Production/process pool'],
  ['SCM', 10, 'Service/support pool'], ['TM22-H&I', 9, 'Production/process pool'],
  ['U-Bend', 8, 'Production/process pool'], ['HR-IR-Admin', 3, 'Service/support pool'],
  ['PU MEHSANA', 2, 'Service/support pool'], ['Quality', 2, 'Service/support pool'],
  ['PM 305', 2, 'Production/process pool'], ['Maintenance', 2, 'Service/support pool'],
  ['CSR - Mehsana', 1, 'Special/project — classify'], ['-', 1, 'Special/project — classify'],
  ['(Blank)', 1, 'Special/project — classify'], ['EHS', 1, 'Service/support pool'],
  ['Indirect Purchase', 1, 'Special/project — classify'], ['Continuous Improvement', 1, 'Special/project — classify'],
  ['Demerger Cost', 1, 'Special/project — classify'], ['New Project', 1, 'Special/project — classify'],
];

// §5 routes [seq, process, cc]
export const HF_ROUTE: [number, string, string][] = [
  [1, 'Circular Saw cutting', '820410300'], [2, 'Bandsaw cutting', '820410301'],
  [3, 'Deep Hole Drilling', '820410302'], [4, 'End radiusing / billet cleaning', '820410304'],
  [5, 'Hot Extrusion Press', '820410151'], [6, 'HF Straightening', '820410306'],
  [7, 'HF Cutting & Deburring', '820410306'], [8, 'Open Annealing', 'NEW CC required'],
  [9, 'Pickling / Deglassing', '820410307'], [10, 'Hydro Test', '820410326'],
  [11, 'HF Final Inspection', '820410306'], [12, 'Marking, Final Release & Packing', '820410308'],
];
export const CF_ROUTE: [number, string, string][] = [
  [1, 'Pilgering', '820410309'], [2, 'Degreasing', '820410275'], [3, 'Annealing', '820410310'],
  [4, 'CF Straightening', '820410349'], [5, 'CF Cutting / Deburring', '820410331 / 820410333'],
  [6, 'Pickling', '820410334'], [7, 'Straight Tube Hydro Testing', '820410336'],
  [8, 'Eddy Current Testing & Marking', '820410335'], [9, 'Final Inspection & Packing', '820410273'],
];
export const UB_ROUTE: [string, string][] = [
  ['U-Bending', '820410352'], ['SR Furnace', 'Validate dedicated CC'],
  ['U-Tube Hydro Testing', '820410354'], ['Cutting & Deburring', '820410351'],
  ['Pickling', '820410357'], ['Dye Penetrant Testing', '820410353'],
  ['Final Inspection', '820410355'], ['Marking & Packing', '820410356'],
];

// §15.2 driver matrix [pool, primary, secondary]
export const DRIVER_MATRIX: [string, string, string][] = [
  ['Machine fixed cost', 'Practical machine hours', 'Installed capacity / asset base'],
  ['Machine variable cost', 'Machine hours / output', 'kWh or process consumption'],
  ['Direct labour', 'Direct labour hours', 'Output kg / pieces'],
  ['Consumables', 'Actual issue quantity', 'Standard consumption × output'],
  ['Quality testing', 'Test hours / samples / lots', 'Output quantity'],
  ['Maintenance', 'Machine-specific hours/work orders', 'Machine hours'],
  ['Common production OH', 'Machine hours or conversion hours', 'Output kg'],
  ['Service departments', 'Benefit received / activity driver', 'Headcount / transactions'],
];

// §16.4 overhead matrix [category, assignment]
export const OVERHEAD_MATRIX: [string, string][] = [
  ['Factory supervision', 'Direct cost centre / labour hours'], ['Production depreciation', 'Asset/machine cost centre'],
  ['Common utilities', 'Measured usage / technical norm'], ['Plant insurance', 'Asset base / insured value'],
  ['Quality department', 'Test hours / lots / samples'], ['Engineering', 'Engineering hours / projects / WO'],
  ['SCM / stores', 'Transactions / issues / receipts / weight'], ['Administration', 'Relevant cost centre / appropriate fixed pool'],
  ['Sales promotion', 'Direct customer/product; otherwise sales value'], ['Freight outward', 'Actual shipment / weight / distance / customer order'],
];

// §14.1 yield dictionary [measure, definition]
export const YIELD_DICT: [string, string][] = [
  ['Input yield', 'Good output ÷ input quantity'], ['Process yield', 'Output after specified process ÷ input to that process'],
  ['Traveller yield', 'Good traveller output ÷ traveller input'], ['Theoretical yield', 'Engineering/theoretical expected yield'],
  ['Plan yield', 'Approved standard/plan yield'], ['Actual yield', 'Actual good output versus relevant input'],
];

// §14.2 loss treatment [loss, treatment]
export const LOSS_TREATMENT: [string, string][] = [
  ['Normal process loss', 'Included in normal cost through approved yield/standard'],
  ['Normal scrap with recovery', 'Credit recovery to relevant cost (approved policy)'],
  ['Rework within normal limits', 'Included in process cost; tracked separately'],
  ['Abnormal rejection / loss', 'Excluded from normal product cost; reported separately'],
  ['Supplier shortfall', 'Supplier variance/claim — not manufacturing loss'],
  ['Customer-specific rejection', 'Trace to customer/order + originating process'],
];

// §2 CAS reference [code, name]
export const CAS_LIST: [string, string][] = [
  ['CAS-1', 'Classification of cost'], ['CAS-2 (Rev 2024)', 'Capacity determination'],
  ['CAS-3', 'Production & operation overheads'], ['CAS-4 (Rev 2018)', 'Cost of production'],
  ['CAS-6 (Rev 2017)', 'Material cost'], ['CAS-7 (Rev 2017)', 'Employee cost'],
  ['CAS-8', 'Utilities'], ['CAS-9', 'Packing material cost'], ['CAS-11', 'Administrative overheads'],
  ['CAS-12', 'Repairs & maintenance'], ['CAS-13', 'Service cost centres'], ['CAS-15', 'Selling & distribution'],
  ['CAS-16', 'Depreciation & amortization'], ['CAS-17', 'Interest & financing charges'],
  ['CAS-18', 'R&D'], ['CAS-20', 'Royalty & technical know-how'], ['CAS-21', 'Quality control'],
  ['CAS-22', 'Manufacturing cost'], ['CAS-24', 'Revenue in cost statements'], ['CAS-25 (eff 12-Feb-2026)', 'Valuation of inventory'],
];

// §23 KPIs [kpi, basis, trigger]
export const KPI_TRIGGERS: [string, string, string][] = [
  ['RM cost/kg', 'RM cost ÷ good output kg', '±3% vs standard'], ['Yield %', 'Good output ÷ input', '±2pp vs standard'],
  ['Conversion cost/kg', 'Conversion cost ÷ good output kg', '±5% vs standard'], ['Machine loading %', 'Productive ÷ available hrs', 'Below plan by >10%'],
  ['Breakdown %', 'Breakdown ÷ available hrs', '>5% or trend worsening'], ['Rework %', 'Rework ÷ processed', 'Above approved norm'],
  ['Rejection %', 'Reject ÷ processed', 'Above approved norm'], ['WIP ageing', 'Days since last movement', '>30/60/90 day bands'],
  ['Consumable variance', 'Actual vs standard', '±5%'], ['Energy/ton', 'Utility cost ÷ production ton', '±5%'],
  ['Order margin', 'Net realization − full relevant cost', 'Below approved floor'], ['Cost pool reconciliation', 'Allocated − source cost', 'Must equal zero'],
];

// §22.1 RACI [activity, Ops, Costing, Finance, Quality, SCM, Mgmt]
export const RACI: [string, string, string, string, string, string, string][] = [
  ['BOM / Routing', 'R', 'A', 'C', 'C', 'C', 'I'], ['Standard rates', 'C', 'R', 'A', 'I', 'C', 'I'],
  ['RM valuation', 'C', 'R', 'A', 'I', 'R', 'I'], ['Production quantity', 'R', 'A/C', 'I', 'C', 'I', 'I'],
  ['Yield / rejection', 'R', 'A', 'I', 'R', 'I', 'I'], ['Cost-centre allocation', 'C', 'R', 'A', 'I', 'C', 'I'],
  ['WIP valuation', 'C', 'R', 'A', 'C', 'C', 'I'], ['Monthly cost close', 'C', 'R', 'A', 'C', 'C', 'I'],
  ['Annual cost policy', 'C', 'R', 'A', 'C', 'C', 'A'], ['Cost audit support', 'C', 'R', 'A', 'C', 'C', 'A'],
];

// §21.1 CRA-1 matrix [area, record, frequency]
export const CRA1: [string, string, string][] = [
  ['Material receipts/issues/balances', 'RM heat/bar stock + ERP inventory', 'Monthly'],
  ['Employee cost', 'Payroll + CC allocation', 'Monthly'], ['Utilities', 'Meter/utility ledger + allocation', 'Monthly'],
  ['Packing', 'BOM + actual issue', 'Monthly'], ['Direct expenses', 'WO/vendor/project records', 'Monthly'],
  ['Overheads', 'CC ledger + allocation matrix', 'Monthly'], ['Depreciation', 'Asset register + CC mapping', 'Monthly/quarterly'],
  ['Quality cost', 'QC/test/rework reports', 'Monthly'], ['R&D', 'Project register / CC', 'Monthly'],
  ['Production quantity', 'Production/traveller reports', 'Daily/monthly'], ['WIP/FG', 'WIP + inventory reports', 'Month-end'],
  ['Sales realization', 'Sales/GST reports', 'Monthly'], ['Reconciliation', 'Cost vs financial accounts', 'Monthly/annual'],
];

// Annex A — 14-line cost sheet
export const COST_SHEET_LINES = ['Raw Material', 'Process Material / Chemicals', 'Machine Cost', 'Direct Labour', 'Consumables', 'Quality / Testing', 'Other Direct Cost', 'Production Overheads', 'Primary Packing', 'Total Production Cost', 'Selling & Distribution', 'Total Cost of Sales', 'Net Sales Realisation', 'Margin'];

// Annex B — 18-item close checklist
export const CLOSE_CHECKLIST = ['RM receipt/issue/balance reconciled', 'Heat/bar stock reconciled', 'Production quantity reconciled', 'Traveller/WIP movement reconciled', 'Yield and rejection report reviewed', 'Machine utilization reviewed', 'Utility consumption reconciled', 'Payroll allocation posted', 'Maintenance and consumables posted', 'Quality cost posted', 'Service cost centre allocations completed', 'Overhead allocation completed', 'WIP valuation completed', 'FG valuation completed', 'Sales realization reconciled', 'Product/customer profitability generated', 'Cost-financial reconciliation completed', 'Variance exceptions assigned'];

// Annex C — rate card [cc, process, driver]
export const RATE_CARD: [string, string, string][] = [
  ['820410300', 'Circular Saw', 'Machine hour'], ['820410301', 'Bandsaw', 'Machine hour'],
  ['820410302', 'DHDM', 'Machine hour'], ['820410304', 'End Facing', 'Machine hour'],
  ['820410151', 'Hot Extrusion Press', 'Machine hour / output'], ['820410309', 'Pilgering', 'Machine hour'],
  ['820410310', 'Annealing', 'Machine hour / gas / kWh'], ['820410335', 'ECT & Marking', 'Machine hour / test hours'],
  ['820410336', 'Hydro Testing', 'Test hours / pieces'], ['820410352', 'U-Bending', 'Machine hour / piece'],
];

// Annex D — variance form fields
export const VARIANCE_FORM = ['Period', 'Cost centre / product', 'Variance type (Material/Yield/Labour/Machine/Utility/Quality/OH)', 'Standard', 'Actual', 'Variance value', 'Root cause', 'Corrective action', 'Owner', 'Due date', 'Closure status'];

// Annex E — policy change fields
export const POLICY_FORM = ['Policy / standard affected', 'Reason for change', 'CAS / legal reference', 'Financial impact', 'Operational impact', 'Effective date', 'Prepared by', 'Reviewed by', 'Approved by'];

// §19.1 margin waterfall steps
export const WATERFALL = ['Net Sales Realization', '− RM', '− Conversion', '− Quality/Testing', '− Packing', '− S&D/Logistics', '= Order Contribution / Margin'];

// §19.2 profitability dimensions [dimension, view]
export const PROFIT_DIMS: [string, string][] = [
  ['Product', 'Product ID / grade / size'], ['Grade group', 'Austenitic / Duplex / Super Duplex / High Nickel / Super Alloys / High Alloy Austenitic / Ferritic-Martensitic'],
  ['Flow', 'HF / CF / H&I / U-Bending'], ['Customer', 'Customer code + group'],
  ['Order', 'Customer order / line / WO'], ['Route', 'Process route / passes'], ['Quality', 'Special testing / rejection / rework'],
];

// §23.2 group variance categories
export const GROUP_VARIANCES = ['Cost Variance', 'Utilization Variance', 'Price Variances', 'Production Variances', 'Stock Variances', 'Scrap', 'Other Indirect Cost', 'Variances and COGS', 'Actual Gross Profit', 'Administration Costs'];

// §17.5 abnormal / non-cost items [item, treatment]
export const ABNORMAL_ITEMS: [string, string][] = [
  ['Penalties / statutory fines', 'Non-cost / reconciliation item'], ['Abnormal wastage', 'Separate abnormal cost'],
  ['Abnormal idle capacity', 'Separate disclosure / reconciliation'], ['Prior-period errors', 'Separate reconciliation unless attributable'],
  ['CSR', 'Separate treatment per policy'], ['Non-operating income', 'Separate from operating cost/revenue'],
];

// §9.2 MHR pool [include, treatment]
export const MHR_POOL: [string, string][] = [
  ['Depreciation', 'Costing depreciation / CAS-16'], ['Power / utilities', 'Measured or technically estimated'],
  ['Repairs & maintenance', 'Machine/CC where traceable'], ['Consumables', 'Direct or process pool'],
  ['Indirect labour', 'Where economically appropriate'], ['Insurance / property', 'Asset/service benefit'],
  ['Other machine overhead', 'If causal and material'],
];

// §9.3 capacity ladder [concept, policy]
export const CAPACITY: [string, string][] = [
  ['Installed', 'Engineering/asset maximum'], ['Practical/achievable', 'Installed less unavoidable interruptions'],
  ['Normal', 'Average over representative periods'], ['Actual utilization', 'Actual ÷ relevant capacity'],
  ['Idle', 'Available but unused — analysed separately'],
];

// §9.4 utilization KPIs
export const UTIL_KPIS: [string, string][] = [
  ['Availability %', 'Available ÷ scheduled hrs'], ['Loading %', 'Productive machine hrs ÷ available'],
  ['Changeover %', 'Changeover ÷ available'], ['Breakdown %', 'Mech + elec stoppage ÷ available'],
  ['Yield %', 'Good output ÷ input'], ['Rate variance', 'Actual conversion/unit vs standard'],
];

// §10 utilities [utility, preferred, fallback]
export const UTILITIES: [string, string, string][] = [
  ['Electricity', 'Metered kWh by machine/area', 'Rated load × hrs × load factor'],
  ['Gas / fuel', 'Metered quantity', 'Technical norm × production'], ['Water', 'Metered quantity', 'Process norm / volume'],
  ['Compressed air', 'Metered / compressor load', 'Machine hrs / rated demand'], ['Nitrogen / Argon', 'Metered consumption', 'Std per unit/ton'],
  ['Industrial gases', 'Actual issue / usage', 'Approved technical norm'], ['Effluent / treatment', 'Treatment volume', 'Production/process volume'],
];

// §11.1 consumable categories [category, treatment]
export const CONSUMABLES: [string, string][] = [
  ['Direct process consumable', 'Trace to operation/product where feasible'],
  ['Common process consumable', 'Allocate by issue qty / machine hrs / output'],
  ['Tooling (identifiable usage)', 'Charge to machine/process; tool-life standards'],
  ['General stores', 'Allocate by benefit/usage'], ['Spares', 'Charge to machine/CC; capital spares per policy'],
];

// §12.1 cost of quality [type, examples]
export const COQ: [string, string][] = [
  ['Prevention', 'Quality planning, qualification, training'], ['Appraisal', 'Inspection, lab, ECT, hydro, DPT, TPI'],
  ['Internal failure', 'Rework, sorting, retesting, reprocessing'], ['External failure', 'Warranty/claims/returns (where applicable)'],
];

// §24.1 master relationships [master, must link to]
export const MASTER_LINKS: [string, string][] = [
  ['Product', 'Grade + size + UOM + grade group + type'], ['BOM', 'Product + effective date + operation'],
  ['Routing', 'Product/grade group + process + machine/CC'], ['Cost centre', 'GL accounts + activity + driver + owner'],
  ['Machine', 'Asset + cost centre + capacity + meter'], ['Traveller', 'WO + product + heat + route'],
  ['Customer order', 'Customer + product + qty + price + requirements'], ['Quality code', 'Process + defect + disposition'],
];

// §24.2 ERP checks
export const ERP_CHECKS = ['No active product without valid costing UOM', 'No active routing without cost centre', 'No production posting against inactive machine/CC', 'No traveller without WO/product/grade/heat', 'No negative heat/bar stock without approved adjustment', 'No duplicate traveller number', 'No unapproved BOM version in current production', 'No manual rate override without approval log'];

// §25 priorities
export const PRIORITIES = ['Reconcile process-map CCs with BOM correct-CC (HF straightening/cutting/pickling, Open Annealing)', 'Formalize Big/Small/Hot Flow pool boundaries', 'Controlled standard-rate register (machine/labour/consumable)', 'Single yield dictionary (plan/theoretical/actual/traveller/product)', 'Integrate defect codes with process + rework cost', 'Heat/bar-level RM reconciliation as month-end control', 'Monthly cost-financial reconciliation with owner + tracker', 'Customer/order profitability from order/WIP/dispatch/sales'];
