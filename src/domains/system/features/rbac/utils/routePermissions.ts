/**
 * Route Permission Utilities
 * Check if user has permission to access routes
 */

import type { Permission } from '@/shared/constants/permissions';
import type { Role } from '@/shared/constants/roles';
import type { RoutePermission } from '../types/permissionDefinitionTypes';
import { checkPermission } from './checkPermission';

/**
 * Match route pattern (supports :param syntax)
 * @example
 * matchRoute('/employees/:id', '/employees/123') => true
 * matchRoute('/employees', '/employees/123') => false
 */
export function matchRoute(pattern: string, path: string): boolean {
  // Exact match
  if (pattern === path) {
    return true;
  }

  // Convert pattern to regex
  const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)').replace(/\*/g, '.*') + '$');

  return regex.test(path);
}

/**
 * Find route permission for given path
 */
export function findRoutePermission(
  routePermissions: RoutePermission[],
  path: string
): RoutePermission | null {
  for (const routePerm of routePermissions) {
    if (matchRoute(routePerm.route, path)) {
      return routePerm;
    }
  }
  return null;
}

/**
 * Check if user has permission to access a route
 */
export function canAccessRoute(
  role: Role,
  routePermissions: RoutePermission[],
  path: string
): boolean {
  const routePerm = findRoutePermission(routePermissions, path);

  // No permission required
  if (!routePerm) {
    return true;
  }

  // Check role restriction
  if (routePerm.allowedRoles && !routePerm.allowedRoles.includes(role)) {
    return false;
  }

  // Build permission string with scope
  const permissionString = routePerm.scope
    ? (`${routePerm.requiredPermission}:${routePerm.scope}` as Permission)
    : routePerm.requiredPermission;

  return checkPermission(role, routePerm.resource, permissionString);
}

/**
 * Check if user owns the resource (for :own scope)
 */
export function checkOwnership(
  routePerm: RoutePermission,
  userId: string,
  resourceData: Record<string, unknown>
): boolean {
  if (!routePerm.checkOwnership || !routePerm.ownershipField) {
    return false;
  }

  const ownershipValue = resourceData[routePerm.ownershipField];
  return ownershipValue === userId;
}

/**
 * Check route access with ownership validation
 */
export async function canAccessRouteWithOwnership(
  role: Role,
  routePermissions: RoutePermission[],
  path: string,
  userId: string,
  resourceData?: Record<string, unknown>
): Promise<boolean> {
  const routePerm = findRoutePermission(routePermissions, path);

  if (!routePerm) {
    return true;
  }

  // Check role restriction
  if (routePerm.allowedRoles && !routePerm.allowedRoles.includes(role)) {
    return false;
  }

  // If scope is :all, check permission
  if (routePerm.scope === 'all') {
    const permission = `${routePerm.requiredPermission}:all` as Permission;
    return checkPermission(role, routePerm.resource, permission);
  }

  // If scope is :own, check both permission and ownership
  if (routePerm.scope === 'own' && resourceData) {
    const hasOwnPermission = checkPermission(
      role,
      routePerm.resource,
      `${routePerm.requiredPermission}:own` as Permission
    );

    if (!hasOwnPermission) {
      return false;
    }

    // Check if user owns the resource
    return checkOwnership(routePerm, userId, resourceData);
  }

  // Default: check base permission
  return checkPermission(role, routePerm.resource, routePerm.requiredPermission);
}

/**
 * Get redirect path if access is denied
 */
export function getRedirectPath(routePermissions: RoutePermission[], path: string): string {
  const routePerm = findRoutePermission(routePermissions, path);
  return routePerm?.redirectIfDenied || '/unauthorized';
}

/**
 * Get all accessible routes for a role
 */
export function getAccessibleRoutes(role: Role, routePermissions: RoutePermission[]): string[] {
  return routePermissions
    .filter((routePerm) => {
      // Check role restriction
      if (routePerm.allowedRoles && !routePerm.allowedRoles.includes(role)) {
        return false;
      }

      // Check permission
      const permissionString = routePerm.scope
        ? (`${routePerm.requiredPermission}:${routePerm.scope}` as Permission)
        : routePerm.requiredPermission;

      return checkPermission(role, routePerm.resource, permissionString);
    })
    .map((routePerm) => routePerm.route);
}
