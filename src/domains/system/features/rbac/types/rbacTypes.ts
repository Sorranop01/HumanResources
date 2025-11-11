/**
 * RBAC Type Definitions
 * Defines types for Role-Based Access Control system
 */

import type { Timestamp } from 'firebase/firestore';
import type { Role } from '@/shared/constants/roles';
import type { Permission, Resource } from '../utils/checkPermission';

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
 * Role definition (extended from basic role)
 */
export interface RoleDefinition extends BaseRBACEntity {
  role: Role;
  name: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean; // Cannot be deleted/modified if true
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
}

/**
 * Role-Permission assignment
 */
export interface RolePermission extends BaseRBACEntity {
  roleId: string;
  role: Role;
  resource: Resource;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
}

export interface RolePermissionFirestore {
  id: string;
  roleId: string;
  role: Role;
  resource: Resource;
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
