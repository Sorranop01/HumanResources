/**
 * useEffectiveRole Hook
 * React Query hook for fetching effective role of a user
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  type EffectiveRoleInfo,
  getEffectiveRole,
  hasActiveRoleAssignment,
} from '../services/effectiveRoleService';

/**
 * Query keys for effective role
 */
export const effectiveRoleKeys = {
  all: ['effectiveRole'] as const,
  user: (userId: string) => [...effectiveRoleKeys.all, userId] as const,
  hasAssignment: (userId: string) => [...effectiveRoleKeys.user(userId), 'hasAssignment'] as const,
};

/**
 * Hook to get effective role for a user
 */
export function useEffectiveRole(
  userId: string | undefined,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<EffectiveRoleInfo, Error> {
  return useQuery({
    queryKey: effectiveRoleKeys.user(userId || ''),
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return getEffectiveRole(userId);
    },
    enabled: !!userId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to check if user has active role assignment
 */
export function useHasActiveRoleAssignment(
  userId: string | undefined
): UseQueryResult<boolean, Error> {
  return useQuery({
    queryKey: effectiveRoleKeys.hasAssignment(userId || ''),
    queryFn: async () => {
      if (!userId) {
        return false;
      }
      return hasActiveRoleAssignment(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
