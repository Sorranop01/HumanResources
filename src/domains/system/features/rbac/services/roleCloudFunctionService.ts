/**
 * Role Cloud Function Service
 * Handles role operations via Cloud Functions (admin-only privileged writes)
 *
 * Per docs/standards/07-firestore-data-modeling-ai.md:
 * "Privileged write (admin-only, cross-user) → Cloud Functions"
 */

import type { Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/shared/lib/firebase';

// ===================================
// Types
// ===================================

type RoleTimestamp = Timestamp | Date | string | null;

export interface RoleDefinition {
  id: string;
  role: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: RoleTimestamp;
  updatedAt: RoleTimestamp;
}

export interface CreateRoleInput {
  role: string;
  name: string;
  description: string;
}

export interface UpdateRoleInput {
  roleId: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface DeleteRoleInput {
  roleId: string;
}

export interface ListRolesInput {
  includeInactive?: boolean;
  systemOnly?: boolean;
  customOnly?: boolean;
}

// ===================================
// Cloud Functions
// ===================================

const createRoleFn = httpsCallable<
  CreateRoleInput,
  {
    success: boolean;
    roleId: string;
    role: RoleDefinition;
  }
>(functions, 'createRole');

const updateRoleFn = httpsCallable<
  UpdateRoleInput,
  {
    success: boolean;
    roleId: string;
    message: string;
  }
>(functions, 'updateRole');

const deleteRoleFn = httpsCallable<
  DeleteRoleInput,
  {
    success: boolean;
    roleId: string;
    message: string;
  }
>(functions, 'deleteRole');

const listRolesFn = httpsCallable<
  ListRolesInput,
  {
    success: boolean;
    roles: RoleDefinition[];
    count: number;
  }
>(functions, 'listRoles');

// ===================================
// Service Functions
// ===================================

/**
 * Create a new custom role
 */
export async function createRole(input: CreateRoleInput): Promise<RoleDefinition> {
  const result = await createRoleFn(input);

  if (!result.data.success) {
    throw new Error('Failed to create role');
  }

  return result.data.role;
}

/**
 * Update an existing custom role
 */
export async function updateRole(input: UpdateRoleInput): Promise<void> {
  const result = await updateRoleFn(input);

  if (!result.data.success) {
    throw new Error('Failed to update role');
  }
}

/**
 * Delete a custom role
 */
export async function deleteRole(roleId: string): Promise<void> {
  const result = await deleteRoleFn({ roleId });

  if (!result.data.success) {
    throw new Error('Failed to delete role');
  }
}

/**
 * List all roles (with optional filters)
 */
export async function listRoles(input?: ListRolesInput): Promise<RoleDefinition[]> {
  const result = await listRolesFn(input || {});

  if (!result.data.success) {
    throw new Error('Failed to list roles');
  }

  return result.data.roles;
}

/**
 * Get all roles (wrapper for listRoles)
 */
export async function getAllRoles(): Promise<RoleDefinition[]> {
  return listRoles();
}

/**
 * Get active roles only
 */
export async function getActiveRoles(): Promise<RoleDefinition[]> {
  return listRoles({ includeInactive: false });
}

/**
 * Get custom roles only (non-system)
 */
export async function getCustomRoles(): Promise<RoleDefinition[]> {
  return listRoles({ customOnly: true });
}

/**
 * Get system roles only
 */
export async function getSystemRoles(): Promise<RoleDefinition[]> {
  return listRoles({ systemOnly: true });
}
