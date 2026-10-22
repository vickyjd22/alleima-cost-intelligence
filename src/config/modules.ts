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
  { id: 'costing', title: 'Costing Workbench', short: 'Costing', route: '/(app)/costing', icon: 'Calculator', roles: NO_OPERATOR, mobileTab: true, group: 'Workspace' },
  { id: 'cost-centres', title: 'Cost & Profit Centres', short: 'Centres', route: '/(app)/cost-centres', icon: 'Building2', roles: NO_OPERATOR, group: 'Workspace' },
  { id: 'planning', title: 'Production Planning', short: 'Planning', route: '/(app)/planning', icon: 'CalendarClock', roles: ['platformAdmin','clientAdmin','management','productionMgr','supervisor','costing','finance','auditor'], group: 'Operations' },
  { id: 'work-orders', title: 'Work Orders & Travellers', short: 'Work orders', route: '/(app)/work-orders', icon: 'ClipboardList', roles: ALL, mobileTab: true, group: 'Operations' },
  { id: 'inventory', title: 'Inventory & Traceability', short: 'Inventory', route: '/(app)/inventory', icon: 'Boxes', roles: ['platformAdmin','clientAdmin','management','costing','finance','productionMgr','supervisor','stores','quality','engineering','auditor'], group: 'Operations' },
  { id: 'engineering', title: 'Engineering & Masters', short: 'Engineering', route: '/(app)/engineering', icon: 'DraftingCompass', roles: ['platformAdmin','clientAdmin','management','costing','finance','engineering','auditor'], group: 'Operations' },
  { id: 'quality', title: 'Quality', short: 'Quality', route: '/(app)/quality', icon: 'BadgeCheck', roles: ['platformAdmin','clientAdmin','management','quality','productionMgr','supervisor','costing','auditor'], group: 'Operations' },
  { id: 'finance', title: 'Finance & Reconciliation', short: 'Finance', route: '/(app)/finance', icon: 'Scale', roles: ['platformAdmin','clientAdmin','management','costing','finance','auditor'], group: 'Finance & control' },
  { id: 'approvals', title: 'Approvals & Exceptions', short: 'Approvals', route: '/(app)/approvals', icon: 'ListChecks', roles: ALL, mobileTab: true, group: 'Finance & control' },
  { id: 'exceptions', title: 'Exception Centre', short: 'Exceptions', route: '/(app)/exceptions', icon: 'Siren', roles: ALL, group: 'Finance & control' },
  { id: 'reports', title: 'Reports & Analytics', short: 'Reports', route: '/(app)/reports', icon: 'BarChart3', roles: NO_OPERATOR, group: 'Insights & admin' },
  { id: 'review', title: 'Client Review', short: 'Review', route: '/(app)/review', icon: 'Presentation', roles: ALL, mobileTab: true, group: 'Insights & admin' },
  { id: 'notifications', title: 'Notifications', short: 'Inbox', route: '/(app)/notifications', icon: 'Bell', roles: ALL, group: 'Insights & admin' },
  { id: 'imports', title: 'Imports & Integrations', short: 'Imports', route: '/(app)/imports', icon: 'Upload', roles: ['platformAdmin','clientAdmin','costing','finance','stores','auditor'], group: 'Insights & admin' },
  { id: 'integrations', title: 'Integrations', short: 'Integrations', route: '/(app)/integrations', icon: 'Plug', roles: ['platformAdmin','clientAdmin','costing','finance','auditor'], group: 'Insights & admin' },
  { id: 'admin', title: 'Administration & Audit', short: 'Admin', route: '/(app)/admin', icon: 'ShieldCheck', roles: ['platformAdmin','clientAdmin','finance','auditor'], group: 'Insights & admin' },
];

export function modulesForRoles(roles: Role[]): AppModule[] {
  return modules.filter((m) => m.roles.some((r) => roles.includes(r)));
}
