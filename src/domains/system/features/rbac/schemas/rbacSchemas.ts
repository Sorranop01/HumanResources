/**
 * Zod Schemas for RBAC
 * Runtime validation for RBAC operations
 */

import { z } from 'zod';
import { ROLES } from '@/shared/constants/roles';

// ============================================
// Basic Schemas
// ============================================

export const roleSchema = z.enum([
  ROLES.ADMIN,
  ROLES.HR,
  ROLES.MANAGER,
  ROLES.EMPLOYEE,
  ROLES.AUDITOR,
]);

export const permissionSchema = z.enum(['read', 'create', 'update', 'delete']);

export const resourceSchema = z.enum([
  'employees',
  'attendance',
  'leave-requests',
  'payroll',
  'settings',
  'users',
  'roles',
  'audit-logs',
]);

// ============================================
// Entity Schemas
// ============================================

/**
 * Role Definition Schema
 */
export const roleDefinitionSchema = z.object({
  id: z.string().min(1),
  role: roleSchema,
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  isActive: z.boolean(),
  isSystemRole: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Create Role Definition Schema
 */
export const createRoleDefinitionSchema = z.object({
  role: roleSchema,
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
});

/**
 * Update Role Definition Schema
 */
export const updateRoleDefinitionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Permission Definition Schema
 */
export const permissionDefinitionSchema = z.object({
  id: z.string().min(1),
  resource: resourceSchema,
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  permissions: z.array(permissionSchema),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Create Permission Definition Schema
 */
export const createPermissionDefinitionSchema = z.object({
  resource: resourceSchema,
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  permissions: z.array(permissionSchema).min(1),
});

/**
 * Role-Permission Assignment Schema
 */
export const rolePermissionSchema = z.object({
  id: z.string().min(1),
  roleId: z.string().min(1),
  role: roleSchema,
  resource: resourceSchema,
  permissions: z.array(permissionSchema).min(1),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Assign Role-Permission Schema
 */
export const assignRolePermissionSchema = z.object({
  role: roleSchema,
  resource: resourceSchema,
  permissions: z.array(permissionSchema).min(1),
});

/**
 * Update Role-Permission Schema
 */
export const updateRolePermissionSchema = z.object({
  permissions: z.array(permissionSchema).min(1),
  isActive: z.boolean().optional(),
});

/**
 * User-Role Assignment Schema
 */
export const userRoleAssignmentSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  userEmail: z.string().email(),
  userDisplayName: z.string().min(1).max(200),
  role: roleSchema,
  assignedBy: z.string().min(1),
  isActive: z.boolean(),
  expiresAt: z.date().optional(),
  reason: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Assign User Role Schema
 */
export const assignUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: roleSchema,
  expiresAt: z.date().optional(),
  reason: z.string().max(500).optional(),
});

/**
 * Revoke User Role Schema
 */
export const revokeUserRoleSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

/**
 * RBAC Audit Log Schema
 */
export const rbacAuditLogSchema = z.object({
  id: z.string().min(1),
  action: z.enum([
    'ROLE_ASSIGNED',
    'ROLE_REVOKED',
    'PERMISSION_GRANTED',
    'PERMISSION_REVOKED',
    'ROLE_CREATED',
    'ROLE_UPDATED',
    'ROLE_DELETED',
  ]),
  performedBy: z.string().min(1),
  performedByEmail: z.string().email(),
  targetUserId: z.string().optional(),
  targetUserEmail: z.string().email().optional(),
  role: roleSchema.optional(),
  resource: resourceSchema.optional(),
  permissions: z.array(permissionSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// ============================================
// Query/Filter Schemas
// ============================================

/**
 * RBAC Query Options Schema
 */
export const rbacQueryOptionsSchema = z.object({
  role: roleSchema.optional(),
  resource: resourceSchema.optional(),
  isActive: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

/**
 * Permission Check Schema
 */
export const permissionCheckSchema = z.object({
  role: roleSchema,
  resource: resourceSchema,
  permission: permissionSchema,
});

/**
 * Bulk Permission Check Schema
 */
export const bulkPermissionCheckSchema = z.object({
  role: roleSchema,
  checks: z.array(
    z.object({
      resource: resourceSchema,
      permission: permissionSchema,
    })
  ),
});

// ============================================
// Type Exports (inferred from schemas)
// ============================================

export type RoleDefinitionInput = z.infer<typeof roleDefinitionSchema>;
export type CreateRoleDefinitionInput = z.infer<typeof createRoleDefinitionSchema>;
export type UpdateRoleDefinitionInput = z.infer<typeof updateRoleDefinitionSchema>;

export type PermissionDefinitionInput = z.infer<typeof permissionDefinitionSchema>;
export type CreatePermissionDefinitionInput = z.infer<typeof createPermissionDefinitionSchema>;

export type RolePermissionInput = z.infer<typeof rolePermissionSchema>;
export type AssignRolePermissionInput = z.infer<typeof assignRolePermissionSchema>;
export type UpdateRolePermissionInput = z.infer<typeof updateRolePermissionSchema>;

export type UserRoleAssignmentInput = z.infer<typeof userRoleAssignmentSchema>;
export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>;
export type RevokeUserRoleInput = z.infer<typeof revokeUserRoleSchema>;

export type RBACAuditLogInput = z.infer<typeof rbacAuditLogSchema>;

export type RBACQueryOptions = z.infer<typeof rbacQueryOptionsSchema>;
export type PermissionCheckInput = z.infer<typeof permissionCheckSchema>;
export type BulkPermissionCheckInput = z.infer<typeof bulkPermissionCheckSchema>;
