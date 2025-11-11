/**
 * Role Tag Component
 * Display role as a colored tag
 */

import { Tag } from 'antd';
import type React from 'react';
import type { Role } from '@/shared/constants/roles';
import { ROLE_LABELS, ROLES } from '@/shared/constants/roles';

interface RoleTagProps {
  role: Role;
  showLabel?: boolean | undefined;
}

const ROLE_COLORS: Record<Role, string> = {
  [ROLES.ADMIN]: 'red',
  [ROLES.HR]: 'purple',
  [ROLES.MANAGER]: 'blue',
  [ROLES.EMPLOYEE]: 'green',
  [ROLES.AUDITOR]: 'orange',
};

export const RoleTag: React.FC<RoleTagProps> = ({ role, showLabel = true }) => {
  const label = showLabel ? ROLE_LABELS[role] : role;
  const color = ROLE_COLORS[role];

  return <Tag color={color}>{label}</Tag>;
};
