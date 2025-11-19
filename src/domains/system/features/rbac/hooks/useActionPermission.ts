/**
 * Action Permission Hook
 * Check if user can perform specific actions
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import { getActiveActionPermissions } from '../services/permissionDefinitionService';
import {
  canPerformAction,
  canPerformActions,
  findActionPermission,
  getPerformableActions,
} from '../utils/actionPermissions';

/**
 * Query keys
 */
export const actionPermissionKeys = {
  all: ['actionPermissions'] as const,
  active: () => [...actionPermissionKeys.all, 'active'] as const,
};

/**
 * Hook to get all active action permissions
 */
export function useActionPermissions() {
  return useQuery({
    queryKey: actionPermissionKeys.active(),
    queryFn: getActiveActionPermissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if user can perform an action
 */
export function useActionPermission(action: string) {
  const { user } = useAuth();
  const { data: actionPermissions = [], isLoading } = useActionPermissions();

  if (!user) {
    return {
      canPerform: false,
      isLoading,
      actionPermission: null,
    };
  }

  const actionPermission = findActionPermission(actionPermissions, action);
  const canPerform = canPerformAction(user.role, actionPermissions, action);

  return {
    canPerform,
    isLoading,
    actionPermission,
  };
}

/**
 * Hook to check multiple actions at once
 */
export function useActionPermissionsBatch(actions: string[]) {
  const { user } = useAuth();
  const { data: actionPermissions = [], isLoading } = useActionPermissions();

  if (!user) {
    return {
      permissions: actions.reduce((acc, action) => ({ ...acc, [action]: false }), {}),
      isLoading,
    };
  }

  const permissions = canPerformActions(user.role, actionPermissions, actions);

  return {
    permissions,
    isLoading,
  };
}

/**
 * Hook to get all actions user can perform
 */
export function usePerformableActions() {
  const { user } = useAuth();
  const { data: actionPermissions = [], isLoading } = useActionPermissions();

  if (!user) {
    return {
      actions: [],
      isLoading,
    };
  }

  const actions = getPerformableActions(user.role, actionPermissions);

  return {
    actions,
    isLoading,
  };
}
