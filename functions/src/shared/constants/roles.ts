/**
 * HR System Roles
 */
export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  AUDITOR: 'auditor',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy (for permission checking)
 * Higher index = higher privilege
 */
export const ROLE_HIERARCHY: Role[] = [
  ROLES.EMPLOYEE,
  ROLES.MANAGER,
  ROLES.HR,
  ROLES.AUDITOR,
  ROLES.ADMIN,
];

/**
 * Check if role1 has higher or equal privilege than role2
 */
export function hasRolePrivilege(role1: Role, role2: Role): boolean {
  const index1 = ROLE_HIERARCHY.indexOf(role1);
  const index2 = ROLE_HIERARCHY.indexOf(role2);

  return index1 >= index2;
}

/**
 * Role labels (for UI display)
 */
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: 'ผู้ดูแลระบบ',
  [ROLES.HR]: 'ฝ่ายทรัพยากรบุคคล',
  [ROLES.MANAGER]: 'ผู้จัดการ',
  [ROLES.EMPLOYEE]: 'พนักงาน',
  [ROLES.AUDITOR]: 'ผู้ตรวจสอบ',
};
