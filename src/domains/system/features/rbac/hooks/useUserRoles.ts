/**
 * User Role Hooks
 * TanStack Query hooks for user-role assignment operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Role } from '@/shared/constants/roles';
import type { AssignUserRoleInput, RevokeUserRoleInput } from '../schemas/rbacSchemas';
import * as userRoleService from '../services/userRoleService';
import type { UserRoleAssignment } from '../types/rbacTypes';

// Query Keys
export const userRoleKeys = {
  all: ['userRoles'] as const,
  lists: () => [...userRoleKeys.all, 'list'] as const,
  byUser: (userId: string) => [...userRoleKeys.all, 'user', userId] as const,
  activeByUser: (userId: string) => [...userRoleKeys.all, 'user', userId, 'active'] as const,
  byRole: (role: Role) => [...userRoleKeys.all, 'role', role] as const,
  distribution: () => [...userRoleKeys.all, 'distribution'] as const,
  usersByRole: (role: Role) => [...userRoleKeys.all, 'usersByRole', role] as const,
};

/**
 * Get all user role assignments
 */
export function useUserRoleAssignments() {
  return useQuery<UserRoleAssignment[], Error>({
    queryKey: userRoleKeys.lists(),
    queryFn: userRoleService.getAllUserRoleAssignments,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get active user role assignments
 */
export function useActiveUserRoleAssignments() {
  return useQuery<UserRoleAssignment[], Error>({
    queryKey: [...userRoleKeys.lists(), 'active'],
    queryFn: userRoleService.getActiveUserRoleAssignments,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get user role assignments by user ID
 */
export function useUserRoleAssignmentsByUserId(userId: string) {
  return useQuery<UserRoleAssignment[], Error>({
    queryKey: userRoleKeys.byUser(userId),
    queryFn: () => userRoleService.getUserRoleAssignmentsByUserId(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get active user role assignment
 */
export function useActiveUserRoleAssignment(userId: string) {
  return useQuery<UserRoleAssignment | null, Error>({
    queryKey: userRoleKeys.activeByUser(userId),
    queryFn: () => userRoleService.getActiveUserRoleAssignment(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get user role assignments by role
 */
export function useUserRoleAssignmentsByRole(role: Role) {
  return useQuery<UserRoleAssignment[], Error>({
    queryKey: userRoleKeys.byRole(role),
    queryFn: () => userRoleService.getUserRoleAssignmentsByRole(role),
    enabled: !!role,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Assign user role
 */
export function useAssignUserRole() {
  const queryClient = useQueryClient();

  return useMutation<
    UserRoleAssignment,
    Error,
    {
      data: AssignUserRoleInput;
      assignedByUser: {
        id: string;
        email: string;
        displayName: string;
      };
    }
  >({
    mutationFn: ({ data, assignedByUser }) => userRoleService.assignUserRole(data, assignedByUser),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: userRoleKeys.all });
      void queryClient.invalidateQueries({
        queryKey: userRoleKeys.byUser(data.userId),
      });
      void queryClient.invalidateQueries({
        queryKey: userRoleKeys.activeByUser(data.userId),
      });
      void queryClient.invalidateQueries({
        queryKey: userRoleKeys.byRole(data.role),
      });
    },
  });
}

/**
 * Revoke user role
 */
export function useRevokeUserRole() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { data: RevokeUserRoleInput; revokedByUserId: string }>({
    mutationFn: ({ data, revokedByUserId }) =>
      userRoleService.revokeUserRole(data, revokedByUserId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: userRoleKeys.all });
      void queryClient.invalidateQueries({
        queryKey: userRoleKeys.byUser(variables.data.userId),
      });
      void queryClient.invalidateQueries({
        queryKey: userRoleKeys.activeByUser(variables.data.userId),
      });
    },
  });
}

/**
 * Update user role assignment
 */
export function useUpdateUserRoleAssignment() {
  const queryClient = useQueryClient();

  return useMutation<
    UserRoleAssignment,
    Error,
    {
      userId: string;
      newRole: Role;
      updatedByUser: {
        id: string;
        email: string;
        displayName: string;
      };
      reason?: string | undefined;
    }
  >({
    mutationFn: ({ userId, newRole, updatedByUser, reason }) =>
      userRoleService.updateUserRoleAssignment(userId, newRole, updatedByUser, reason),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: userRoleKeys.all });
      void queryClient.invalidateQueries({
        queryKey: userRoleKeys.byUser(data.userId),
      });
      void queryClient.invalidateQueries({
        queryKey: userRoleKeys.activeByUser(data.userId),
      });
      void queryClient.invalidateQueries({
        queryKey: userRoleKeys.byRole(data.role),
      });
    },
  });
}

/**
 * Permanently delete user role assignment
 */
export function usePermanentlyDeleteUserRoleAssignment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => userRoleService.permanentlyDeleteUserRoleAssignment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userRoleKeys.all });
    },
  });
}

/**
 * Get users by role
 */
export function useUsersByRole(role: Role) {
  return useQuery<string[], Error>({
    queryKey: userRoleKeys.usersByRole(role),
    queryFn: () => userRoleService.getUsersByRole(role),
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get role distribution
 */
export function useRoleDistribution() {
  return useQuery<Record<Role, number>, Error>({
    queryKey: userRoleKeys.distribution(),
    queryFn: userRoleService.getRoleDistribution,
    staleTime: 5 * 60 * 1000,
  });
}
