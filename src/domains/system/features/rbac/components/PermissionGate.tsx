/**
 * Permission Gate Component
 * Conditionally renders children based on action permission
 */

import type { FC, ReactNode } from 'react';
import { useActionPermission } from '../hooks/useActionPermission';

interface PermissionGateProps {
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * PermissionGate Component
 * Shows children only if user has permission to perform the action
 */
export const PermissionGate: FC<PermissionGateProps> = ({ action, children, fallback }) => {
  const { canPerform, isLoading } = useActionPermission(action);

  // Don't render anything while loading (avoid flash)
  if (isLoading) {
    return null;
  }

  // Not authorized
  if (!canPerform) {
    return fallback ? <>{fallback}</> : null;
  }

  // Authorized
  return <>{children}</>;
};
