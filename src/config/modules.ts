import type { Role } from '../lib/permissions';

export type ModuleGroup = 'Workspace' | 'Operations' | 'Finance & control' | 'Insights & admin';

/** Single module registry — sidebar + command search + bottom nav render from this. */
export interface AppModule {
  id: string;
  title: string;
  route: string;
  icon: string; // lucide icon name
  roles: Role[];
  mobileTab?: boolean;
  group: ModuleGroup;
  short: string; // compact labels for tabs/cards
}

const ALL: Role[] = [
  'platformAdmin',
  'clientAdmin',
  'management',
  'costing',
  'finance',
  'productionMgr',
  'supervisor',
  'operator',
  'stores',
  'engineering',
  'quality',
  'hr',
  'sales',
  'procurement',
  'auditor',
];

const NO_OPERATOR: Role[] = ALL.filter((r) => r !== 'operator');

export const MODULE_GROUPS: ModuleGroup[] = ['Workspace', 'Operations', 'Finance & control', 'Insights & admin'];

export const modules: AppModule[] = [
  { id: 'overview', title: 'Overview', short: 'Overview', route: '/(app)/overview', icon: 'LayoutDashboard', roles: ALL, mobileTab: true, group: 'Workspace' },
  { id: 'demo-journey', title: 'Guided Journey', short: 'Journey', route: '/(app)/demo-journey', icon: 'Presentation', roles: ALL, group: 'Workspace' },
  { id: 'costing', title: 'Costing Workbench', short: 'Costing', route: '/(app)/costing', icon: 'Calculator', roles: NO_OPERATOR, mobileTab: true, group: 'Workspace' },
  { id: 'standard-cost', title: 'Standard Cost Simulator', short: 'Std cost', route: '/(app)/standard-cost', icon: 'Calculator', roles: ['platformAdmin','clientAdmin','management','costing','finance','engineering','auditor'], group: 'Workspace' },
  { id: 'products', title: 'Product Master', short: 'Products', route: '/(app)/products', icon: 'Package', roles: ['platformAdmin','clientAdmin','management','costing','finance','engineering','quality','sales','auditor'], group: 'Workspace' },
  { id: 'bom', title: 'BOM Management', short: 'BOM', route: '/(app)/bom', icon: 'Layers', roles: ['platformAdmin','clientAdmin','management','costing','finance','engineering','productionMgr','auditor'], group: 'Workspace' },
  { id: 'routing', title: 'Routing Designer', short: 'Routing', route: '/(app)/routing', icon: 'Workflow', roles: ['platformAdmin','clientAdmin','management','costing','finance','engineering','productionMgr','auditor'], group: 'Workspace' },
  { id: 'allocation', title: 'Cost Allocation Engine', short: 'Allocation', route: '/(app)/allocation', icon: 'Sliders', roles: ['platformAdmin','clientAdmin','management','costing','finance','auditor'], group: 'Workspace' },
  { id: 'cost-centres', title: 'Cost & Profit Centres', short: 'Centres', route: '/(app)/cost-centres', icon: 'Building2', roles: NO_OPERATOR, group: 'Workspace' },
  { id: 'planning', title: 'Production Planning', short: 'Planning', route: '/(app)/planning', icon: 'CalendarClock', roles: ['platformAdmin','clientAdmin','management','productionMgr','supervisor','costing','finance','auditor'], group: 'Operations' },
  { id: 'work-orders', title: 'Work Orders & Travellers', short: 'Work orders', route: '/(app)/work-orders', icon: 'ClipboardList', roles: ALL, mobileTab: true, group: 'Operations' },
  { id: 'inventory', title: 'Inventory & Traceability', short: 'Inventory', route: '/(app)/inventory', icon: 'Boxes', roles: ['platformAdmin','clientAdmin','management','costing','finance','productionMgr','supervisor','stores','quality','engineering','auditor'], group: 'Operations' },
  { id: 'engineering', title: 'Engineering & Masters', short: 'Engineering', route: '/(app)/engineering', icon: 'DraftingCompass', roles: ['platformAdmin','clientAdmin','management','costing','finance','engineering','auditor'], group: 'Operations' },
  { id: 'quality', title: 'Quality', short: 'Quality', route: '/(app)/quality', icon: 'BadgeCheck', roles: ['platformAdmin','clientAdmin','management','quality','productionMgr','supervisor','costing','auditor'], group: 'Operations' },
  { id: 'work-order-mgmt', title: 'Work Order Management', short: 'WO mgmt', route: '/(app)/work-order-mgmt', icon: 'ClipboardList', roles: ['platformAdmin','clientAdmin','management','productionMgr','supervisor','costing','finance','sales','auditor'], group: 'Operations' },
  { id: 'traveller-tracking', title: 'Traveller Tracking', short: 'Travellers', route: '/(app)/traveller-tracking', icon: 'Route', roles: ['platformAdmin','clientAdmin','management','productionMgr','supervisor','operator','quality','costing','auditor'], group: 'Operations' },
  { id: 'production-capture', title: 'Production Data Capture', short: 'Capture', route: '/(app)/production-capture', icon: 'ScanLine', roles: ['platformAdmin','clientAdmin','management','productionMgr','supervisor','operator','quality'], group: 'Operations' },
  { id: 'wip', title: 'WIP Valuation', short: 'WIP', route: '/(app)/wip', icon: 'Boxes', roles: ['platformAdmin','clientAdmin','management','costing','finance','productionMgr','auditor'], group: 'Operations' },
  { id: 'finance', title: 'Finance & Reconciliation', short: 'Finance', route: '/(app)/finance', icon: 'Scale', roles: ['platformAdmin','clientAdmin','management','costing','finance','auditor'], group: 'Finance & control' },
  { id: 'approvals', title: 'Approvals & Exceptions', short: 'Approvals', route: '/(app)/approvals', icon: 'ListChecks', roles: ALL, mobileTab: true, group: 'Finance & control' },
  { id: 'exceptions', title: 'Exception Centre', short: 'Exceptions', route: '/(app)/exceptions', icon: 'Siren', roles: ALL, group: 'Finance & control' },
  { id: 'variance-analysis', title: 'Variance Analysis', short: 'Variance', route: '/(app)/variance-analysis', icon: 'Activity', roles: ['platformAdmin','clientAdmin','management','costing','finance','productionMgr','quality','auditor'], group: 'Finance & control' },
  { id: 'monthly-close', title: 'Monthly Cost Close', short: 'Close', route: '/(app)/monthly-close', icon: 'CalendarClock', roles: ['platformAdmin','clientAdmin','management','costing','finance','auditor'], group: 'Finance & control' },
  { id: 'reports', title: 'Reports & Analytics', short: 'Reports', route: '/(app)/reports', icon: 'BarChart3', roles: NO_OPERATOR, group: 'Insights & admin' },
  { id: 'product-profitability', title: 'Product Profitability', short: 'Product P&L', route: '/(app)/product-profitability', icon: 'TrendingUp', roles: ['platformAdmin','clientAdmin','management','costing','finance','sales','auditor'], group: 'Insights & admin' },
  { id: 'customer-profitability', title: 'Customer Profitability', short: 'Customer P&L', route: '/(app)/customer-profitability', icon: 'Users', roles: ['platformAdmin','clientAdmin','management','costing','finance','sales','auditor'], group: 'Insights & admin' },
  { id: 'yield-scrap', title: 'Yield & Scrap Analytics', short: 'Yield', route: '/(app)/yield-scrap', icon: 'Gauge', roles: ['platformAdmin','clientAdmin','management','costing','finance','productionMgr','quality','auditor'], group: 'Insights & admin' },
  { id: 'audit-readiness', title: 'Cost Audit Readiness', short: 'Audit', route: '/(app)/audit-readiness', icon: 'ShieldCheck', roles: ['platformAdmin','clientAdmin','management','costing','finance','auditor'], group: 'Insights & admin' },
  { id: 'management-analytics', title: 'Management Analytics', short: 'Analytics', route: '/(app)/management-analytics', icon: 'PieChart', roles: ['platformAdmin','clientAdmin','management','costing','finance','sales','auditor'], group: 'Insights & admin' },
  { id: 'review', title: 'Client Review', short: 'Review', route: '/(app)/review', icon: 'Presentation', roles: ALL, mobileTab: true, group: 'Insights & admin' },
  { id: 'notifications', title: 'Notifications', short: 'Inbox', route: '/(app)/notifications', icon: 'Bell', roles: ALL, group: 'Insights & admin' },
  { id: 'imports', title: 'Imports & Integrations', short: 'Imports', route: '/(app)/imports', icon: 'Upload', roles: ['platformAdmin','clientAdmin','costing','finance','stores','auditor'], group: 'Insights & admin' },
  { id: 'integrations', title: 'Integrations', short: 'Integrations', route: '/(app)/integrations', icon: 'Plug', roles: ['platformAdmin','clientAdmin','costing','finance','auditor'], group: 'Insights & admin' },
  { id: 'admin', title: 'Administration & Audit', short: 'Admin', route: '/(app)/admin', icon: 'ShieldCheck', roles: ['platformAdmin','clientAdmin','finance','auditor'], group: 'Insights & admin' },
];

export function modulesForRoles(roles: Role[]): AppModule[] {
  return modules.filter((m) => m.roles.some((r) => roles.includes(r)));
}
