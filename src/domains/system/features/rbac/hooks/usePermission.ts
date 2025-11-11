import { useAuth } from '@/shared/hooks/useAuth';
import {
  canAccess,
  checkPermission,
  getPermissions,
  type Permission,
  type Resource,
} from '../utils/checkPermission';

interface UsePermissionReturn {
  hasPermission: (resource: Resource, permission: Permission) => boolean;
  canAccessResource: (resource: Resource) => boolean;
  getResourcePermissions: (resource: Resource) => Permission[];
}

export function usePermission(): UsePermissionReturn {
  const { user } = useAuth();

  const hasPermission = (resource: Resource, permission: Permission): boolean => {
    if (!user) return false;
    return checkPermission(user.role, resource, permission);
  };

  const canAccessResource = (resource: Resource): boolean => {
    if (!user) return false;
    return canAccess(user.role, resource);
  };

  const getResourcePermissions = (resource: Resource): Permission[] => {
    if (!user) return [];
    return getPermissions(user.role, resource);
  };

  return {
    hasPermission,
    canAccessResource,
    getResourcePermissions,
  };
}
