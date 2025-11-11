import type { Role } from '@/shared/constants/roles';
import { ROLES } from '@/shared/constants/roles';

/**
 * Permission types for different operations
 */
export type Permission = 'read' | 'create' | 'update' | 'delete';

/**
 * Resource types in the system
 */
export type Resource =
  | 'employees'
  | 'attendance'
  | 'leave-requests'
  | 'payroll'
  | 'settings'
  | 'users'
  | 'roles'
  | 'audit-logs';

/**
 * Permission matrix: Role -> Resource -> Permissions
 */
const PERMISSION_MATRIX: Record<Role, Partial<Record<Resource, Permission[]>>> = {
  [ROLES.ADMIN]: {
    employees: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update', 'delete'],
    'leave-requests': ['read', 'create', 'update', 'delete'],
    payroll: ['read', 'create', 'update', 'delete'],
    settings: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete'],
    roles: ['read', 'create', 'update', 'delete'],
    'audit-logs': ['read'],
  },
  [ROLES.HR]: {
    employees: ['read', 'create', 'update'],
    attendance: ['read', 'update'],
    'leave-requests': ['read', 'update'],
    payroll: ['read', 'create', 'update'],
    settings: ['read'],
    users: ['read'],
    roles: ['read'],
    'audit-logs': ['read'],
  },
  [ROLES.MANAGER]: {
    employees: ['read'],
    attendance: ['read', 'update'],
    'leave-requests': ['read', 'update'],
    settings: ['read'],
  },
  [ROLES.EMPLOYEE]: {
    employees: ['read'],
    attendance: ['read', 'create'],
    'leave-requests': ['read', 'create'],
  },
  [ROLES.AUDITOR]: {
    employees: ['read'],
    attendance: ['read'],
    'leave-requests': ['read'],
    payroll: ['read'],
    'audit-logs': ['read'],
  },
};

/**
 * Check if a role has permission to perform an operation on a resource
 */
export function checkPermission(
  role: Role,
  resource: Resource,
  permission: Permission
): boolean {
  const rolePermissions = PERMISSION_MATRIX[role];

  if (!rolePermissions) {
    return false;
  }

  const resourcePermissions = rolePermissions[resource];

  if (!resourcePermissions) {
    return false;
  }

  return resourcePermissions.includes(permission);
}

/**
 * Check if user can access a resource (has at least read permission)
 */
export function canAccess(role: Role, resource: Resource): boolean {
  return checkPermission(role, resource, 'read');
}

/**
 * Get all permissions for a role on a resource
 */
export function getPermissions(role: Role, resource: Resource): Permission[] {
  return PERMISSION_MATRIX[role]?.[resource] || [];
}
