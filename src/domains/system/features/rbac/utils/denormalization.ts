/**
 * Denormalization Helper Utilities
 * Helpers for building denormalized data structures in RBAC
 */

import type { Permission } from '@/shared/constants/permissions';
import { PERMISSION_DESCRIPTIONS, PERMISSION_LABELS } from '@/shared/constants/permissions';
import type { Resource } from '@/shared/constants/resources';
import { RESOURCE_LABELS } from '@/shared/constants/resources';
import type { Role } from '@/shared/constants/roles';
import { ROLE_LABELS } from '@/shared/constants/roles';
import type { AvailablePermissionDetail, DenormalizedPermissionInfo } from '../types/rbacTypes';

/**
 * Build denormalized permission info for embedding in RoleDefinition
 */
export function buildDenormalizedPermissionInfo(
  resource: Resource,
  permissions: Permission[]
): DenormalizedPermissionInfo {
  return {
    resource,
    resourceName: RESOURCE_LABELS[resource] || resource,
    permissions,
  };
}

/**
 * Build available permission details for PermissionDefinition
 */
export function buildAvailablePermissionDetails(
  permissions: Permission[]
): AvailablePermissionDetail[] {
  return permissions.map((permission) => ({
    permission,
    label: PERMISSION_LABELS[permission] || permission,
    description: PERMISSION_DESCRIPTIONS[permission] || '',
  }));
}

/**
 * Get role name from role key
 */
export function getRoleName(role: Role): string {
  return ROLE_LABELS[role] || role;
}

/**
 * Get resource name from resource key
 */
export function getResourceName(resource: Resource): string {
  return RESOURCE_LABELS[resource] || resource;
}

/**
 * Get permission label from permission key
 */
export function getPermissionLabel(permission: Permission): string {
  return PERMISSION_LABELS[permission] || permission;
}

/**
 * Build permissions map for RoleDefinition from RolePermissions array
 */
export function buildPermissionsMap(
  rolePermissions: Array<{
    resource: Resource;
    permissions: Permission[];
  }>
): Record<string, DenormalizedPermissionInfo> {
  const permissionsMap: Record<string, DenormalizedPermissionInfo> = {};

  for (const rp of rolePermissions) {
    permissionsMap[rp.resource] = buildDenormalizedPermissionInfo(rp.resource, rp.permissions);
  }

  return permissionsMap;
}

/**
 * Extract permissions array from denormalized permissions map
 */
export function extractPermissionsArray(
  permissionsMap?: Record<string, DenormalizedPermissionInfo>
): Array<{ resource: Resource; resourceName: string; permissions: Permission[] }> {
  if (!permissionsMap) {
    return [];
  }

  return Object.values(permissionsMap);
}

/**
 * Check if role has permission on resource (from denormalized map)
 */
export function hasPermissionInMap(
  permissionsMap: Record<string, DenormalizedPermissionInfo> | undefined,
  resource: Resource,
  permission: Permission
): boolean {
  if (!permissionsMap || !permissionsMap[resource]) {
    return false;
  }

  return permissionsMap[resource].permissions.includes(permission);
}

/**
 * Get all resources from denormalized permissions map
 */
export function getResourcesFromMap(
  permissionsMap?: Record<string, DenormalizedPermissionInfo>
): Resource[] {
  if (!permissionsMap) {
    return [];
  }

  return Object.keys(permissionsMap) as Resource[];
}
