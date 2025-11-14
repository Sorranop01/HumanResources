/**
 * Route Guard Component
 * Protects routes based on user permissions
 */

import type { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '@/domains/system/features/auth/hooks/useAuth';
import { useRoutePermission } from '../hooks/useRoutePermission';

interface RouteGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * RouteGuard Component
 * Checks if user has permission to access current route
 * Redirects to unauthorized page if permission denied
 */
export const RouteGuard: FC<RouteGuardProps> = ({ children, fallback, redirectTo }) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const {
    canAccess,
    isLoading: permissionLoading,
    redirectPath,
  } = useRoutePermission(location.pathname);

  // Show loading state
  if (authLoading || permissionLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Spin size="large" tip="กำลังตรวจสอบสิทธิ์..." />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Not authorized
  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <Navigate to={redirectTo || redirectPath || '/unauthorized'} replace />;
  }

  // Authorized
  return <>{children}</>;
};
