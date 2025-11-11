import { useAuth } from './useAuth';
import type { Role } from '@/shared/constants/roles';
import { hasRolePrivilege } from '@/shared/constants/roles';

interface UseRBACReturn {
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasMinRole: (minRole: Role) => boolean;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  isEmployee: boolean;
}

export function useRBAC(): UseRBACReturn {
  const { user } = useAuth();

  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  const hasMinRole = (minRole: Role): boolean => {
    if (!user) return false;
    return hasRolePrivilege(user.role, minRole);
  };

  return {
    hasRole,
    hasAnyRole,
    hasMinRole,
    isAdmin: hasRole('admin'),
    isHR: hasRole('hr') || hasRole('admin'),
    isManager: hasRole('manager') || hasRole('hr') || hasRole('admin'),
    isEmployee: !!user,
  };
}
