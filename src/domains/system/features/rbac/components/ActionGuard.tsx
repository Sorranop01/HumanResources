/**
 * Action Guard Component
 * Higher-order component that wraps elements with action permission check
 */

import type { FC, ReactElement } from 'react';
import { cloneElement } from 'react';
import { useActionPermission } from '../hooks/useActionPermission';

interface ActionGuardProps {
  action: string;
  children: ReactElement;
  disableIfUnauthorized?: boolean;
  hideIfUnauthorized?: boolean;
}

/**
 * ActionGuard Component
 * Wraps UI elements and disables/hides them based on action permission
 *
 * @example
 * <ActionGuard action="create_employee" disableIfUnauthorized>
 *   <Button>Create Employee</Button>
 * </ActionGuard>
 */
export const ActionGuard: FC<ActionGuardProps> = ({
  action,
  children,
  disableIfUnauthorized = false,
  hideIfUnauthorized = false,
}) => {
  const { canPerform, isLoading } = useActionPermission(action);

  // Don't render while loading
  if (isLoading) {
    return null;
  }

  // Hide if unauthorized
  if (!canPerform && hideIfUnauthorized) {
    return null;
  }

  // Disable if unauthorized
  if (!canPerform && disableIfUnauthorized) {
    return cloneElement(children, {
      disabled: true,
      title: 'คุณไม่มีสิทธิ์ทำการนี้',
    });
  }

  return children;
};
