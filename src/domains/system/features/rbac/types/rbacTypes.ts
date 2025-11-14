/**
 * RBAC Type Definitions
 * Defines types for Role-Based Access Control system
 */

import type { Timestamp } from 'firebase/firestore';
import type { Permission } from '@/shared/constants/permissions';
import type { Resource } from '@/shared/constants/resources';
import type { Role } from '@/shared/constants/roles';

/**
 * Base RBAC entity
 */
export interface BaseRBACEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
}

/**
 * Denormalized Permission Info (for embedding in RoleDefinition)
 */
export interface DenormalizedPermissionInfo {
  resource: Resource;
  resourceName: string;
  permissions: Permission[];
}

/**
 * Role definition (extended from basic role)
 */
export interface RoleDefinition extends BaseRBACEntity {
  role: Role;
  name: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean; // Cannot be deleted/modified if true

  // ✅ Denormalized permissions map for quick access
  permissions?: Record<string, DenormalizedPermissionInfo>;
}

/**
 * Available Permission Detail (for PermissionDefinition)
 */
export interface AvailablePermissionDetail {
  permission: Permission;
  label: string;
  description: string;
}

/**
 * Permission definition for a resource
 */
export interface PermissionDefinition extends BaseRBACEntity {
  resource: Resource;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;

  // ✅ Denormalized available permissions with labels
  availablePermissions?: AvailablePermissionDetail[];
}

/**
 * Role-Permission assignment
 */
export interface RolePermission extends BaseRBACEntity {
  roleId: string;
  role: Role;
  roleName: string; // ✅ Denormalized role name

  resource: Resource;
  resourceName: string; // ✅ Denormalized resource name

  permissions: Permission[];
  isActive: boolean;
}

/**
 * User-Role assignment (for special cases)
 */
export interface UserRoleAssignment extends BaseRBACEntity {
  userId: string;
  userEmail: string;
  userDisplayName: string;
  role: Role;
  assignedBy: string;
  isActive: boolean;
  expiresAt?: Date | undefined;
  reason?: string | undefined;
}

/**
 * Audit log for RBAC changes
 */
export interface RBACAuditLog {
  id: string;
  action:
    | 'ROLE_ASSIGNED'
    | 'ROLE_REVOKED'
    | 'PERMISSION_GRANTED'
    | 'PERMISSION_REVOKED'
    | 'ROLE_CREATED'
    | 'ROLE_UPDATED'
    | 'ROLE_DELETED'
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'USER_DELETED';
  performedBy: string;
  performedByEmail: string;
  targetUserId?: string | undefined;
  targetUserEmail?: string | undefined;
  role?: Role | undefined;
  resource?: Resource | undefined;
  permissions?: Permission[] | undefined;
  metadata?: Record<string, unknown> | undefined;
  timestamp: Date;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

// ============================================
// Firestore Document Types (with Timestamp)
// ============================================

export interface RoleDefinitionFirestore {
  id: string;
  role: Role;
  name: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean;
  permissions?: Record<string, DenormalizedPermissionInfo>; // ✅ Denormalized
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
}

export interface PermissionDefinitionFirestore {
  id: string;
  resource: Resource;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  availablePermissions?: AvailablePermissionDetail[]; // ✅ Denormalized
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
}

export interface RolePermissionFirestore {
  id: string;
  roleId: string;
  role: Role;
  roleName: string; // ✅ Denormalized
  resource: Resource;
  resourceName: string; // ✅ Denormalized
  permissions: Permission[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
}

export interface UserRoleAssignmentFirestore {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  role: Role;
  assignedBy: string;
  isActive: boolean;
  expiresAt?: Timestamp | undefined;
  reason?: string | undefined;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
}

export interface RBACAuditLogFirestore {
  id: string;
  action:
    | 'ROLE_ASSIGNED'
    | 'ROLE_REVOKED'
    | 'PERMISSION_GRANTED'
    | 'PERMISSION_REVOKED'
    | 'ROLE_CREATED'
    | 'ROLE_UPDATED'
    | 'ROLE_DELETED'
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'USER_DELETED';
  performedBy: string;
  performedByEmail: string;
  targetUserId?: string | undefined;
  targetUserEmail?: string | undefined;
  role?: Role | undefined;
  resource?: Resource | undefined;
  permissions?: Permission[] | undefined;
  metadata?: Record<string, unknown> | undefined;
  timestamp: Timestamp;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

// ============================================
// Helper Types
// ============================================

/**
 * Permission summary for a role
 */
export interface RolePermissionSummary {
  role: Role;
  roleName: string;
  totalResources: number;
  permissions: {
    resource: Resource;
    resourceName: string;
    permissions: Permission[];
  }[];
}

/**
 * User permission context
 */
export interface UserPermissionContext {
  userId: string;
  role: Role;
  permissions: Map<Resource, Permission[]>;
  hasFullAccess: boolean; // Admin
}

/**
 * RBAC statistics
 */
export interface RBACStatistics {
  totalRoles: number;
  totalActiveRoles: number;
  totalPermissions: number;
  totalUserAssignments: number;
  roleDistribution: {
    role: Role;
    count: number;
  }[];
}
