/**
 * Permission Guard Component
 * Protects components based on permissions
 */

import type React from 'react';
import type { Role } from '@/shared/constants/roles';
import { usePermission } from '../hooks/usePermission';
import type { Permission, Resource } from '../utils/checkPermission';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: Resource;
  permission: Permission;
  fallback?: React.ReactNode | undefined;
  requireAll?: boolean | undefined; // If true, require all permissions
}

/**
 * Component that renders children only if user has permission
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  permission,
  fallback = null,
}) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(resource, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface MultiPermissionGuardProps {
  children: React.ReactNode;
  permissions: Array<{
    resource: Resource;
    permission: Permission;
  }>;
  requireAll?: boolean | undefined; // If true, require all permissions
  fallback?: React.ReactNode | undefined;
}

/**
 * Component that renders children only if user has multiple permissions
 */
export const MultiPermissionGuard: React.FC<MultiPermissionGuardProps> = ({
  children,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const { hasPermission } = usePermission();

  const hasAllPermissions = permissions.every((p) => hasPermission(p.resource, p.permission));

  const hasAnyPermission = permissions.some((p) => hasPermission(p.resource, p.permission));

  const shouldRender = requireAll ? hasAllPermissions : hasAnyPermission;

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RoleGuardProps {
  children: React.ReactNode;
  roles: Role[];
  requireAll?: boolean | undefined;
  fallback?: React.ReactNode | undefined;
}

/**
 * Component that renders children only if user has specific role(s)
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  requireAll = false,
  fallback = null,
}) => {
  const { useAuth } = require('@/shared/hooks/useAuth');
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const hasRole = roles.includes(user.role);

  if (requireAll) {
    // For requireAll, user must have all roles (not practical, but kept for consistency)
    if (!hasRole) {
      return <>{fallback}</>;
    }
  } else {
    // For requireAny (default), user must have at least one role
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

interface ResourceAccessGuardProps {
  children: React.ReactNode;
  resource: Resource;
  fallback?: React.ReactNode | undefined;
}

/**
 * Component that renders children only if user can access resource
 */
export const ResourceAccessGuard: React.FC<ResourceAccessGuardProps> = ({
  children,
  resource,
  fallback = null,
}) => {
  const { canAccessResource } = usePermission();

  if (!canAccessResource(resource)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
