import type { Role } from '@/shared/constants/roles';
import { ROLES } from '@/shared/constants/roles';

/**
 * Base permission operations
 */
export type BasePermission = 'read' | 'create' | 'update' | 'delete';

/**
 * Context-based permission scope
 */
export type PermissionScope = 'own' | 'all';

/**
 * Permission with context (e.g., 'read:own', 'read:all', 'update:own', 'update:all')
 */
export type ContextualPermission = `${BasePermission}:${PermissionScope}`;

/**
 * All permission types (base + contextual)
 * Examples:
 * - 'read' - Can read all data
 * - 'read:own' - Can read only own data
 * - 'read:all' - Explicitly can read all data
 * - 'update:own' - Can update only own data
 * - 'update:all' - Can update all data
 */
export type Permission = BasePermission | ContextualPermission;

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
 * Note: Use context-based permissions (e.g., 'read:own', 'read:all') for fine-grained access control
 */
const PERMISSION_MATRIX: Record<Role, Partial<Record<Resource, Permission[]>>> = {
  [ROLES.ADMIN]: {
    employees: ['read:all', 'create', 'update:all', 'delete'],
    attendance: ['read:all', 'create', 'update:all', 'delete'],
    'leave-requests': ['read:all', 'create', 'update:all', 'delete'],
    payroll: ['read:all', 'create', 'update:all', 'delete'],
    settings: ['read:all', 'create', 'update:all', 'delete'],
    users: ['read:all', 'create', 'update:all', 'delete'],
    roles: ['read:all', 'create', 'update:all', 'delete'],
    'audit-logs': ['read:all'],
  },
  [ROLES.HR]: {
    employees: ['read:all', 'create', 'update:all'],
    attendance: ['read:all', 'update:all'],
    'leave-requests': ['read:all', 'update:all'],
    payroll: ['read:all', 'create', 'update:all'],
    settings: ['read:all'],
    users: ['read:all'],
    roles: ['read:all'],
    'audit-logs': ['read:all'],
  },
  [ROLES.MANAGER]: {
    employees: ['read:all'],
    attendance: ['read:all', 'update:all'],
    'leave-requests': ['read:all', 'update:all'],
    settings: ['read:all'],
  },
  [ROLES.EMPLOYEE]: {
    employees: ['read:own'],
    attendance: ['read:own', 'create'],
    'leave-requests': ['read:own', 'create'],
  },
  [ROLES.AUDITOR]: {
    employees: ['read:all'],
    attendance: ['read:all'],
    'leave-requests': ['read:all'],
    payroll: ['read:all'],
    'audit-logs': ['read:all'],
  },
};

/**
 * Parse a permission string into base permission and scope
 * Examples:
 * - 'read' -> { base: 'read', scope: 'all' }
 * - 'read:own' -> { base: 'read', scope: 'own' }
 * - 'read:all' -> { base: 'read', scope: 'all' }
 */
function parsePermission(permission: Permission): { base: BasePermission; scope: PermissionScope } {
  if (permission.includes(':')) {
    const [base, scope] = permission.split(':') as [BasePermission, PermissionScope];
    return { base, scope };
  }
  // If no scope specified, default to 'all'
  return { base: permission as BasePermission, scope: 'all' };
}

/**
 * Check if a role has permission to perform an operation on a resource
 *
 * @param role - The user's role
 * @param resource - The resource to check permission for
 * @param permission - The permission to check (e.g., 'read', 'read:own', 'update:all')
 *
 * Permission matching logic:
 * - If user has 'read:all', they can access both own and all data
 * - If user has 'read:own', they can only access own data
 * - If user has 'read' (no context), it's treated as 'read:all'
 *
 * @returns true if the role has the permission, false otherwise
 */
export function checkPermission(role: Role, resource: Resource, permission: Permission): boolean {
  const rolePermissions = PERMISSION_MATRIX[role];

  if (!rolePermissions) {
    return false;
  }

  const resourcePermissions = rolePermissions[resource];

  if (!resourcePermissions) {
    return false;
  }

  // Exact match
  if (resourcePermissions.includes(permission)) {
    return true;
  }

  // Parse the requested permission
  const { base: requestedBase, scope: requestedScope } = parsePermission(permission);

  // Check if role has the base permission (without context) or 'all' scope
  for (const rolePermission of resourcePermissions) {
    const { base: roleBase, scope: roleScope } = parsePermission(rolePermission);

    // Base permission must match
    if (roleBase !== requestedBase) {
      continue;
    }

    // If role has 'all' scope, they can access everything (including 'own')
    if (roleScope === 'all') {
      return true;
    }

    // If role has 'own' scope, they can only access if requested scope is 'own'
    if (roleScope === 'own' && requestedScope === 'own') {
      return true;
    }
  }

  return false;
}

/**
 * Check if user can access a resource (has at least read permission)
 *
 * @param role - The user's role
 * @param resource - The resource to check access for
 * @returns true if the role has read permission (any scope)
 */
export function canAccess(role: Role, resource: Resource): boolean {
  return checkPermission(role, resource, 'read:own') || checkPermission(role, resource, 'read:all');
}

/**
 * Get all permissions for a role on a resource
 */
export function getPermissions(role: Role, resource: Resource): Permission[] {
  return PERMISSION_MATRIX[role]?.[resource] || [];
}

/**
 * Check if a role has permission with 'own' scope (can only access own data)
 *
 * @param role - The user's role
 * @param resource - The resource to check
 * @param basePermission - The base permission (e.g., 'read', 'update')
 * @returns true if the role has 'own' scope permission
 */
export function hasOwnScopePermission(
  role: Role,
  resource: Resource,
  basePermission: BasePermission
): boolean {
  return checkPermission(role, resource, `${basePermission}:own` as ContextualPermission);
}

/**
 * Check if a role has permission with 'all' scope (can access all data)
 *
 * @param role - The user's role
 * @param resource - The resource to check
 * @param basePermission - The base permission (e.g., 'read', 'update')
 * @returns true if the role has 'all' scope permission
 */
export function hasAllScopePermission(
  role: Role,
  resource: Resource,
  basePermission: BasePermission
): boolean {
  return checkPermission(role, resource, `${basePermission}:all` as ContextualPermission);
}

/**
 * Get the permission scope for a role on a resource and base permission
 *
 * @param role - The user's role
 * @param resource - The resource to check
 * @param basePermission - The base permission
 * @returns 'all' | 'own' | null (if no permission)
 */
export function getPermissionScope(
  role: Role,
  resource: Resource,
  basePermission: BasePermission
): PermissionScope | null {
  if (hasAllScopePermission(role, resource, basePermission)) {
    return 'all';
  }
  if (hasOwnScopePermission(role, resource, basePermission)) {
    return 'own';
  }
  return null;
}
