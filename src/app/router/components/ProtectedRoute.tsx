import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';
import type { Role } from '@/shared/constants/roles';
import { hasRolePrivilege } from '@/shared/constants/roles';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Minimum required role to access this route
   * If not specified, any authenticated user can access
   */
  requiredRole?: Role;
  /**
   * Custom fallback element when loading
   */
  loadingElement?: ReactNode;
}

/**
 * ProtectedRoute component to guard routes that require authentication
 *
 * Features:
 * - Redirects to login if user is not authenticated
 * - Shows loading spinner while checking auth state
 * - Supports role-based access control
 * - Preserves the intended route after login via state
 */
export function ProtectedRoute({
  children,
  requiredRole,
  loadingElement,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      loadingElement ?? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Spin size="large" tip="กำลังโหลด..." />
        </div>
      )
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && !hasRolePrivilege(user.role, requiredRole)) {
    // User is authenticated but doesn't have required role
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h1>403 - ไม่มีสิทธิ์เข้าถึง</h1>
        <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
}
