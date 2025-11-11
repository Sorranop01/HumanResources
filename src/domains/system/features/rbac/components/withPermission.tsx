/**
 * Permission HOCs (Higher-Order Components)
 * Wrap components with permission checks
 */

import type React from 'react';
import { Navigate } from 'react-router-dom';
import type { Role } from '@/shared/constants/roles';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import type { Permission, Resource } from '../utils/checkPermission';

interface WithPermissionOptions {
  resource: Resource;
  permission: Permission;
  redirectTo?: string | undefined;
  fallback?: React.ComponentType | undefined;
}

/**
 * HOC that protects a component with permission check
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  options: WithPermissionOptions
): React.FC<P> {
  return function PermissionProtectedComponent(props: P) {
    const { hasPermission } = usePermission();

    if (!hasPermission(options.resource, options.permission)) {
      if (options.redirectTo) {
        return <Navigate to={options.redirectTo} replace />;
      }

      if (options.fallback) {
        const FallbackComponent = options.fallback;
        return <FallbackComponent />;
      }

      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don&apos;t have permission to access this resource.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

interface WithMultiPermissionOptions {
  permissions: Array<{
    resource: Resource;
    permission: Permission;
  }>;
  requireAll?: boolean | undefined;
  redirectTo?: string | undefined;
  fallback?: React.ComponentType | undefined;
}

/**
 * HOC that protects a component with multiple permission checks
 */
export function withMultiPermission<P extends object>(
  Component: React.ComponentType<P>,
  options: WithMultiPermissionOptions
): React.FC<P> {
  return function MultiPermissionProtectedComponent(props: P) {
    const { hasPermission } = usePermission();

    const hasAllPermissions = options.permissions.every((p) =>
      hasPermission(p.resource, p.permission)
    );

    const hasAnyPermission = options.permissions.some((p) =>
      hasPermission(p.resource, p.permission)
    );

    const shouldRender = options.requireAll ? hasAllPermissions : hasAnyPermission;

    if (!shouldRender) {
      if (options.redirectTo) {
        return <Navigate to={options.redirectTo} replace />;
      }

      if (options.fallback) {
        const FallbackComponent = options.fallback;
        return <FallbackComponent />;
      }

      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You don&apos;t have the required permissions to access this resource.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

interface WithRoleOptions {
  roles: Role[];
  requireAll?: boolean | undefined;
  redirectTo?: string | undefined;
  fallback?: React.ComponentType | undefined;
}

/**
 * HOC that protects a component with role check
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleOptions
): React.FC<P> {
  return function RoleProtectedComponent(props: P) {
    const { user } = useAuth();

    if (!user) {
      if (options.redirectTo) {
        return <Navigate to={options.redirectTo} replace />;
      }

      return <Navigate to="/login" replace />;
    }

    const hasRole = options.roles.includes(user.role);

    if (!hasRole) {
      if (options.redirectTo) {
        return <Navigate to={options.redirectTo} replace />;
      }

      if (options.fallback) {
        const FallbackComponent = options.fallback;
        return <FallbackComponent />;
      }

      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You don&apos;t have the required role to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

interface WithResourceAccessOptions {
  resource: Resource;
  redirectTo?: string | undefined;
  fallback?: React.ComponentType | undefined;
}

/**
 * HOC that protects a component with resource access check
 */
export function withResourceAccess<P extends object>(
  Component: React.ComponentType<P>,
  options: WithResourceAccessOptions
): React.FC<P> {
  return function ResourceAccessProtectedComponent(props: P) {
    const { canAccessResource } = usePermission();

    if (!canAccessResource(options.resource)) {
      if (options.redirectTo) {
        return <Navigate to={options.redirectTo} replace />;
      }

      if (options.fallback) {
        const FallbackComponent = options.fallback;
        return <FallbackComponent />;
      }

      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don&apos;t have access to this resource.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * UnauthorizedPage component (can be used as fallback)
 */
export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this resource. Please contact your
            administrator if you believe this is an error.
          </p>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
