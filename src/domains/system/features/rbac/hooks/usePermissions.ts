/**
 * Permission Hooks
 * TanStack Query hooks for permission operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Role } from '@/shared/constants/roles';
import type {
  AssignRolePermissionInput,
  CreatePermissionDefinitionInput,
  UpdateRolePermissionInput,
} from '../schemas/rbacSchemas';
import * as permissionService from '../services/permissionService';
import type { Permission } from '@/shared/constants/permissions';
import type { Resource } from '@/shared/constants/resources';
import type { PermissionDefinition, RolePermission } from '../types/rbacTypes';

// Query Keys
export const permissionKeys = {
  all: ['permissions'] as const,
  definitions: () => [...permissionKeys.all, 'definitions'] as const,
  definition: (resource: Resource) => [...permissionKeys.definitions(), resource] as const,
  rolePermissions: () => [...permissionKeys.all, 'rolePermissions'] as const,
  rolePermissionsByRole: (role: Role) => [...permissionKeys.rolePermissions(), role] as const,
  rolePermissionByRoleAndResource: (role: Role, resource: Resource) =>
    [...permissionKeys.rolePermissions(), role, resource] as const,
  accessibleResources: (role: Role) => [...permissionKeys.all, 'accessible', role] as const,
};

// ============================================
// Permission Definitions
// ============================================

/**
 * Get all permission definitions
 */
export function usePermissionDefinitions() {
  return useQuery<PermissionDefinition[], Error>({
    queryKey: permissionKeys.definitions(),
    queryFn: permissionService.getAllPermissionDefinitions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get active permission definitions
 */
export function useActivePermissionDefinitions() {
  return useQuery<PermissionDefinition[], Error>({
    queryKey: [...permissionKeys.definitions(), 'active'],
    queryFn: permissionService.getActivePermissionDefinitions,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get permission definition by resource
 */
export function usePermissionByResource(resource: Resource) {
  return useQuery<PermissionDefinition | null, Error>({
    queryKey: permissionKeys.definition(resource),
    queryFn: () => permissionService.getPermissionByResource(resource),
    enabled: !!resource,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Create permission definition
 */
export function useCreatePermissionDefinition() {
  const queryClient = useQueryClient();

  return useMutation<
    PermissionDefinition,
    Error,
    { data: CreatePermissionDefinitionInput; userId: string }
  >({
    mutationFn: ({ data, userId }) => permissionService.createPermissionDefinition(data, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: permissionKeys.definitions(),
      });
    },
  });
}

// ============================================
// Role-Permission Assignments
// ============================================

/**
 * Get all role permissions
 */
export function useAllRolePermissions() {
  return useQuery<RolePermission[], Error>({
    queryKey: permissionKeys.rolePermissions(),
    queryFn: permissionService.getAllRolePermissions,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get permissions by role
 */
export function usePermissionsByRole(role: Role) {
  return useQuery<RolePermission[], Error>({
    queryKey: permissionKeys.rolePermissionsByRole(role),
    queryFn: () => permissionService.getPermissionsByRole(role),
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get role permission by role and resource
 */
export function useRolePermissionByRoleAndResource(role: Role, resource: Resource) {
  return useQuery<RolePermission | null, Error>({
    queryKey: permissionKeys.rolePermissionByRoleAndResource(role, resource),
    queryFn: () => permissionService.getRolePermissionByRoleAndResource(role, resource),
    enabled: !!role && !!resource,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Assign role permission
 */
export function useAssignRolePermission() {
  const queryClient = useQueryClient();

  return useMutation<
    RolePermission,
    Error,
    { data: AssignRolePermissionInput; userId: string; roleId: string }
  >({
    mutationFn: ({ data, userId, roleId }) =>
      permissionService.assignRolePermission(data, userId, roleId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: permissionKeys.rolePermissions(),
      });
      void queryClient.invalidateQueries({
        queryKey: permissionKeys.rolePermissionsByRole(data.role),
      });
    },
  });
}

/**
 * Update role permission
 */
export function useUpdateRolePermission() {
  const queryClient = useQueryClient();

  return useMutation<
    RolePermission,
    Error,
    { id: string; data: UpdateRolePermissionInput; userId: string }
  >({
    mutationFn: ({ id, data, userId }) => permissionService.updateRolePermission(id, data, userId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: permissionKeys.rolePermissions(),
      });
      void queryClient.invalidateQueries({
        queryKey: permissionKeys.rolePermissionsByRole(data.role),
      });
    },
  });
}

/**
 * Revoke role permission
 */
export function useRevokeRolePermission() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { role: Role; resource: Resource; userId: string }>({
    mutationFn: ({ role, resource, userId }) =>
      permissionService.revokeRolePermission(role, resource, userId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: permissionKeys.rolePermissions(),
      });
      void queryClient.invalidateQueries({
        queryKey: permissionKeys.rolePermissionsByRole(variables.role),
      });
    },
  });
}

/**
 * Permanently delete role permission
 */
export function usePermanentlyDeleteRolePermission() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => permissionService.permanentlyDeleteRolePermission(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: permissionKeys.rolePermissions(),
      });
    },
  });
}

/**
 * Check role permission
 */
export function useCheckRolePermission(role: Role, resource: Resource, permission: Permission) {
  return useQuery<boolean, Error>({
    queryKey: [...permissionKeys.rolePermissionByRoleAndResource(role, resource), permission],
    queryFn: () => permissionService.checkRolePermission(role, resource, permission),
    enabled: !!role && !!resource && !!permission,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get accessible resources for a role
 */
export function useAccessibleResources(role: Role) {
  return useQuery<Resource[], Error>({
    queryKey: permissionKeys.accessibleResources(role),
    queryFn: () => permissionService.getAccessibleResources(role),
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
  });
}
