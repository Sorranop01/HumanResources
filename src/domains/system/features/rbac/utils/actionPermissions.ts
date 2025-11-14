/**
 * Action Permission Utilities
 * Check if user can perform specific actions
 */

import type { Permission } from '@/shared/constants/permissions';
import type { Role } from '@/shared/constants/roles';
import type { ActionPermission } from '../types/permissionDefinitionTypes';
import { checkPermission } from './checkPermission';

/**
 * Find action permission by action name
 */
export function findActionPermission(
  actionPermissions: ActionPermission[],
  action: string
): ActionPermission | null {
  return actionPermissions.find((ap) => ap.action === action && ap.isActive) || null;
}

/**
 * Check if user can perform an action
 */
export function canPerformAction(
  role: Role,
  actionPermissions: ActionPermission[],
  action: string
): boolean {
  const actionPerm = findActionPermission(actionPermissions, action);

  if (!actionPerm) {
    // No permission defined = allow (fail-open) or deny (fail-close)?
    // For security: fail-close (deny by default)
    return false;
  }

  // Build permission string with scope
  const permissionString = actionPerm.scope
    ? (`${actionPerm.requiredPermission}:${actionPerm.scope}` as Permission)
    : actionPerm.requiredPermission;

  return checkPermission(role, actionPerm.resource, permissionString);
}

/**
 * Get all actions user can perform
 */
export function getPerformableActions(role: Role, actionPermissions: ActionPermission[]): string[] {
  return actionPermissions
    .filter((actionPerm) => {
      const permissionString = actionPerm.scope
        ? (`${actionPerm.requiredPermission}:${actionPerm.scope}` as Permission)
        : actionPerm.requiredPermission;

      return checkPermission(role, actionPerm.resource, permissionString);
    })
    .map((actionPerm) => actionPerm.action);
}

/**
 * Get actions by category
 */
export function getActionsByCategory(
  actionPermissions: ActionPermission[],
  category: string
): ActionPermission[] {
  return actionPermissions.filter((ap) => ap.category === category && ap.isActive);
}

/**
 * Batch check multiple actions
 */
export function canPerformActions(
  role: Role,
  actionPermissions: ActionPermission[],
  actions: string[]
): Record<string, boolean> {
  const result: Record<string, boolean> = {};

  for (const action of actions) {
    result[action] = canPerformAction(role, actionPermissions, action);
  }

  return result;
}
