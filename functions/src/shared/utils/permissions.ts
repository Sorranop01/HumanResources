/**
 * RBAC Permission Checking Utilities
 * Used by Cloud Functions to validate user permissions
 */

import { getFirestore } from 'firebase-admin/firestore';

/**
 * Check if user has specific permission for a resource
 * @param userId - User ID to check
 * @param resource - Resource name (e.g., 'employees', 'leave', 'payroll')
 * @param permission - Permission to check (e.g., 'create', 'read', 'update', 'delete', 'read:all', 'read:own')
 * @returns Promise<boolean> - True if user has permission
 */
export async function checkPermission(
  userId: string,
  resource: string,
  permission: string
): Promise<boolean> {
  const db = getFirestore();
  try {
    // Get user document to find their role
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return false;
    }

    const userData = userDoc.data();
    if (!userData || !userData.role) {
      return false;
    }

    const userRole = userData.role;

    // Get role permissions
    const rolePermissionsDoc = await db.collection('rolePermissions').doc(userRole).get();

    if (!rolePermissionsDoc.exists) {
      return false;
    }

    const rolePermissions = rolePermissionsDoc.data();
    if (!rolePermissions || !rolePermissions.permissions) {
      return false;
    }

    // Check if resource exists in permissions
    const resourcePermissions = rolePermissions.permissions[resource];
    if (!resourcePermissions) {
      return false;
    }

    // Check if permission is granted
    // Handle both simple permissions (e.g., 'create') and scoped permissions (e.g., 'read:all')
    if (typeof resourcePermissions === 'object' && resourcePermissions[permission] === true) {
      return true;
    }

    // If checking for a scoped permission like 'read:all', also check base permission 'read'
    if (permission.includes(':')) {
      const [basePermission] = permission.split(':');
      if (
        basePermission &&
        typeof resourcePermissions === 'object' &&
        resourcePermissions[basePermission] === true
      ) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get user's permission scope for a specific resource and action
 * @param userId - User ID to check
 * @param resource - Resource name
 * @param action - Action (e.g., 'read', 'update')
 * @returns Promise<'all' | 'own' | null> - Permission scope or null if no permission
 */
export async function getPermissionScope(
  userId: string,
  resource: string,
  action: string
): Promise<'all' | 'own' | null> {
  try {
    // Check for :all scope
    const hasAll = await checkPermission(userId, resource, `${action}:all`);
    if (hasAll) {
      return 'all';
    }

    // Check for :own scope
    const hasOwn = await checkPermission(userId, resource, `${action}:own`);
    if (hasOwn) {
      return 'own';
    }

    // Check for base permission (defaults to 'all' if no scope specified)
    const hasBase = await checkPermission(userId, resource, action);
    if (hasBase) {
      return 'all';
    }

    return null;
  } catch (error) {
    console.error('Error getting permission scope:', error);
    return null;
  }
}

/**
 * Check if user has any of the specified permissions (OR logic)
 * @param userId - User ID to check
 * @param resource - Resource name
 * @param permissions - Array of permissions to check
 * @returns Promise<boolean> - True if user has at least one permission
 */
export async function hasAnyPermission(
  userId: string,
  resource: string,
  permissions: string[]
): Promise<boolean> {
  const checks = await Promise.all(
    permissions.map((permission) => checkPermission(userId, resource, permission))
  );

  return checks.some((hasPermission) => hasPermission);
}

/**
 * Check if user has all of the specified permissions (AND logic)
 * @param userId - User ID to check
 * @param resource - Resource name
 * @param permissions - Array of permissions to check
 * @returns Promise<boolean> - True if user has all permissions
 */
export async function hasAllPermissions(
  userId: string,
  resource: string,
  permissions: string[]
): Promise<boolean> {
  const checks = await Promise.all(
    permissions.map((permission) => checkPermission(userId, resource, permission))
  );

  return checks.every((hasPermission) => hasPermission);
}

/**
 * Get all permissions for a user
 * @param userId - User ID to check
 * @returns Promise<Record<string, Record<string, boolean>>> - All permissions
 */
export async function getUserPermissions(
  userId: string
): Promise<Record<string, Record<string, boolean>>> {
  const db = getFirestore();
  try {
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return {};
    }

    const userData = userDoc.data();
    if (!userData || !userData.role) {
      return {};
    }

    const rolePermissionsDoc = await db.collection('rolePermissions').doc(userData.role).get();

    if (!rolePermissionsDoc.exists) {
      return {};
    }

    const rolePermissions = rolePermissionsDoc.data();
    return rolePermissions?.permissions || {};
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return {};
  }
}
