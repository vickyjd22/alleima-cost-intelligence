import type { Role } from '../lib/permissions';

/** Single module registry — sidebar (web) + bottom nav (mobile) render from this. */
export interface AppModule {
  id: string;
  title: string;
  route: string;
  icon: string; // lucide icon name
  roles: Role[];
  mobileTab?: boolean;
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

export const modules: AppModule[] = [
  { id: 'overview', title: 'Overview', route: '/(app)/overview', icon: 'LayoutDashboard', roles: ALL, mobileTab: true },
  { id: 'costing', title: 'Costing Workbench', route: '/(app)/costing', icon: 'Calculator', roles: NO_OPERATOR, mobileTab: true },
  { id: 'cost-centres', title: 'Cost & Profit Centres', route: '/(app)/cost-centres', icon: 'Building2', roles: NO_OPERATOR },
  { id: 'planning', title: 'Production Planning', route: '/(app)/planning', icon: 'CalendarClock', roles: ['platformAdmin','clientAdmin','management','productionMgr','supervisor','costing','finance','auditor'] },
  { id: 'work-orders', title: 'Work Orders & Travellers', route: '/(app)/work-orders', icon: 'ClipboardList', roles: ALL, mobileTab: true },
  { id: 'inventory', title: 'Inventory & Traceability', route: '/(app)/inventory', icon: 'Boxes', roles: ['platformAdmin','clientAdmin','management','costing','finance','productionMgr','supervisor','stores','quality','engineering','auditor'] },
  { id: 'engineering', title: 'Engineering & Masters', route: '/(app)/engineering', icon: 'DraftingCompass', roles: ['platformAdmin','clientAdmin','management','costing','finance','engineering','auditor'] },
  { id: 'quality', title: 'Quality', route: '/(app)/quality', icon: 'BadgeCheck', roles: ['platformAdmin','clientAdmin','management','quality','productionMgr','supervisor','costing','auditor'] },
  { id: 'finance', title: 'Finance & Reconciliation', route: '/(app)/finance', icon: 'Scale', roles: ['platformAdmin','clientAdmin','management','costing','finance','auditor'] },
  { id: 'review', title: 'Client Review', route: '/(app)/review', icon: 'Presentation', roles: ALL, mobileTab: true },
  { id: 'notifications', title: 'Notifications', route: '/(app)/notifications', icon: 'Bell', roles: ALL },
  { id: 'approvals', title: 'Approvals & Exceptions', route: '/(app)/approvals', icon: 'ListChecks', roles: ALL, mobileTab: true },
  { id: 'exceptions', title: 'Exception Centre', route: '/(app)/exceptions', icon: 'Siren', roles: ALL },
  { id: 'reports', title: 'Reports & Analytics', route: '/(app)/reports', icon: 'BarChart3', roles: NO_OPERATOR },
  { id: 'imports', title: 'Imports & Integrations', route: '/(app)/imports', icon: 'Upload', roles: ['platformAdmin','clientAdmin','costing','finance','stores','auditor'] },
  { id: 'integrations', title: 'Integrations', route: '/(app)/integrations', icon: 'Plug', roles: ['platformAdmin','clientAdmin','costing','finance','auditor'] },
  { id: 'admin', title: 'Administration & Audit', route: '/(app)/admin', icon: 'ShieldCheck', roles: ['platformAdmin','clientAdmin','finance','auditor'] },
];

export function modulesForRoles(roles: Role[]): AppModule[] {
  return modules.filter((m) => m.roles.some((r) => roles.includes(r)));
}
