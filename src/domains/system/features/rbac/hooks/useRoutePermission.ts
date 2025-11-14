/**
 * Route Permission Hook
 * Check if user can access specific routes
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import { getActiveRoutePermissions } from '../services/permissionDefinitionService';
import { canAccessRoute, findRoutePermission, getRedirectPath } from '../utils/routePermissions';

/**
 * Query keys
 */
export const routePermissionKeys = {
  all: ['routePermissions'] as const,
  active: () => [...routePermissionKeys.all, 'active'] as const,
};

/**
 * Hook to get all active route permissions
 */
export function useRoutePermissions() {
  return useQuery({
    queryKey: routePermissionKeys.active(),
    queryFn: getActiveRoutePermissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if user can access a route
 */
export function useRoutePermission(path: string) {
  const { user } = useAuth();
  const { data: routePermissions = [] } = useRoutePermissions();

  if (!user) {
    return {
      canAccess: false,
      isLoading: false,
      routePermission: null,
      redirectPath: '/login',
    };
  }

  const routePermission = findRoutePermission(routePermissions, path);
  const canAccess = canAccessRoute(user.role, routePermissions, path);
  const redirectPath = canAccess ? undefined : getRedirectPath(routePermissions, path);

  return {
    canAccess,
    isLoading: false,
    routePermission,
    redirectPath,
  };
}

/**
 * Hook to check current route permission
 */
export function useCurrentRoutePermission() {
  const { user } = useAuth();
  const { data: routePermissions = [] } = useRoutePermissions();

  // Get current path from window.location
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  if (!user) {
    return {
      canAccess: false,
      isLoading: false,
      routePermission: null,
      redirectPath: '/login',
    };
  }

  const routePermission = findRoutePermission(routePermissions, currentPath);
  const canAccess = canAccessRoute(user.role, routePermissions, currentPath);
  const redirectPath = canAccess ? undefined : getRedirectPath(routePermissions, currentPath);

  return {
    canAccess,
    isLoading: false,
    routePermission,
    redirectPath,
    currentPath,
  };
}
