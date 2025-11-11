/**
 * useUserRoleManagement Hook
 * React Query hooks for managing user role assignments
 */

import { type UseQueryResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Role } from '@/shared/constants/roles';
import {
  assignUserRole,
  getUserRoleAssignmentsByUserId,
  revokeUserRole,
} from '../services/userRoleService';
import type { UserRoleAssignment } from '../types/rbacTypes';
import { effectiveRoleKeys } from './useEffectiveRole';
import { userRoleKeys } from './useUserRoles';

/**
 * Hook to get user role assignments by user ID
 */
export function useUserRoleAssignmentsByUserId(
  userId: string | undefined
): UseQueryResult<UserRoleAssignment[], Error> {
  return useQuery({
    queryKey: [...userRoleKeys.assignments(), 'user', userId || ''] as const,
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return getUserRoleAssignmentsByUserId(userId);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to assign role to user
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      userEmail: string;
      userDisplayName: string;
      role: Role;
      assignedByUserId: string;
      expiresAt?: Date;
      reason?: string;
    }) => {
      return assignUserRole(
        {
          userId: params.userId,
          role: params.role,
          expiresAt: params.expiresAt,
          reason: params.reason,
        },
        {
          id: params.assignedByUserId,
          email: '', // Will be fetched in service
          displayName: '', // Will be fetched in service
        },
        {
          email: params.userEmail,
          displayName: params.userDisplayName,
        }
      );
    },
    onSuccess: (_data, variables) => {
      message.success('มอบหมายบทบาทสำเร็จ');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: userRoleKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: effectiveRoleKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      message.error(`ไม่สามารถมอบหมายบทบาทได้: ${error.message}`);
    },
  });
}

/**
 * Hook to revoke role assignment
 */
export function useRevokeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userId: string; revokedByUserId: string; reason?: string }) => {
      return revokeUserRole(
        {
          userId: params.userId,
          reason: params.reason,
        },
        params.revokedByUserId
      );
    },
    onSuccess: (_data, variables) => {
      message.success('ยกเลิกการมอบหมายบทบาทสำเร็จ');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: userRoleKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: effectiveRoleKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      message.error(`ไม่สามารถยกเลิกการมอบหมายบทบาทได้: ${error.message}`);
    },
  });
}
