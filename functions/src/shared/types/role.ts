/**
 * Role Definition Types
 * For roleDefinitions collection
 */

import type { Timestamp } from 'firebase-admin/firestore';

export interface RoleDefinition {
  id: string;
  role: string; // Unique role key (e.g., 'admin', 'custom_role')
  name: string; // Display name (e.g., 'ผู้ดูแลระบบ')
  description: string;
  isSystemRole: boolean; // true = cannot be deleted/renamed
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

export interface CreateRoleInput {
  role: string;
  name: string;
  description: string;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}
