/**
 * Role Hooks
 * TanStack Query hooks for role operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Role } from '@/shared/constants/roles';
import type { CreateRoleDefinitionInput, UpdateRoleDefinitionInput } from '../schemas/rbacSchemas';
import * as roleService from '../services/roleService';
import type { RoleDefinition } from '../types/rbacTypes';

// Query Keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters?: string) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  byType: (role: Role) => [...roleKeys.all, 'type', role] as const,
};

/**
 * Get all roles
 */
export function useRoles() {
  return useQuery<RoleDefinition[], Error>({
    queryKey: roleKeys.lists(),
    queryFn: roleService.getAllRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get active roles
 */
export function useActiveRoles() {
  return useQuery<RoleDefinition[], Error>({
    queryKey: roleKeys.list('active'),
    queryFn: roleService.getActiveRoles,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get role by ID
 */
export function useRole(id: string) {
  return useQuery<RoleDefinition | null, Error>({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleService.getRoleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get role by type
 */
export function useRoleByType(role: Role) {
  return useQuery<RoleDefinition | null, Error>({
    queryKey: roleKeys.byType(role),
    queryFn: () => roleService.getRoleByType(role),
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation<RoleDefinition, Error, { data: CreateRoleDefinitionInput; userId: string }>({
    mutationFn: ({ data, userId }) => roleService.createRole(data, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

/**
 * Update role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation<
    RoleDefinition,
    Error,
    { id: string; data: UpdateRoleDefinitionInput; userId: string }
  >({
    mutationFn: ({ id, data, userId }) => roleService.updateRole(id, data, userId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.all });
      void queryClient.invalidateQueries({
        queryKey: roleKeys.detail(data.id),
      });
    },
  });
}

/**
 * Delete role (soft delete)
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; userId: string }>({
    mutationFn: ({ id, userId }) => roleService.deleteRole(id, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

/**
 * Permanently delete role
 */
export function usePermanentlyDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => roleService.permanentlyDeleteRole(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

/**
 * Toggle role status
 */
export function useToggleRoleStatus() {
  const queryClient = useQueryClient();

  return useMutation<RoleDefinition, Error, { id: string; userId: string }>({
    mutationFn: ({ id, userId }) => roleService.toggleRoleStatus(id, userId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: roleKeys.all });
      void queryClient.invalidateQueries({
        queryKey: roleKeys.detail(data.id),
      });
    },
  });
}
