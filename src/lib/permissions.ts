/** Role model — must match custom claims + ROLE_PERMISSION_MATRIX.md */
export type Role =
  | 'platformAdmin'
  | 'clientAdmin'
  | 'management'
  | 'costing'
  | 'finance'
  | 'productionMgr'
  | 'supervisor'
  | 'operator'
  | 'stores'
  | 'engineering'
  | 'quality'
  | 'hr'
  | 'sales'
  | 'procurement'
  | 'auditor';

export interface SessionClaims {
  uid: string;
  plantIds: string[];
  roles: Role[];
}

export function canWriteCostRun(roles: Role[]): boolean {
  return roles.some((r) => r === 'costing' || r === 'clientAdmin' || r === 'platformAdmin');
}

/** Maker-checker: approver must differ from submitter and hold approve rights. */
export function canApprove(roles: Role[], submitterUid: string, approverUid: string): boolean {
  if (submitterUid === approverUid) return false;
  return roles.some((r) => r === 'finance' || r === 'management' || r === 'clientAdmin');
}

export function isReadOnlyAuditor(roles: Role[]): boolean {
  return roles.length === 1 && roles[0] === 'auditor';
}
