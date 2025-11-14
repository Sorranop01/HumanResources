import { z } from 'zod';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { RESOURCES } from '@/shared/constants/resources';
import { ROLES } from '@/shared/constants/roles';

/**
 * Shared Denormalized Reference Schemas
 *
 * These schemas represent denormalized data that appears in multiple places
 * across the system. Using shared schemas ensures consistency and reduces duplication.
 *
 * @module shared/schemas/denormalized
 */

// ============================================
// User References (Denormalized)
// ============================================

/**
 * Denormalized User Reference
 * Use when you need to store basic user info without full user object
 */
export const DenormalizedUserRefSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1).max(200),
});

export type DenormalizedUserRef = z.infer<typeof DenormalizedUserRefSchema>;

// ============================================
// Department References (Denormalized)
// ============================================

/**
 * Denormalized Department Reference (Minimal)
 * Use for lightweight department references
 */
export const DenormalizedDepartmentRefSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
});

export type DenormalizedDepartmentRef = z.infer<typeof DenormalizedDepartmentRefSchema>;

/**
 * Denormalized Department Reference (Extended)
 * Use when you need additional department info
 */
export const DenormalizedDepartmentRefExtendedSchema = DenormalizedDepartmentRefSchema.extend({
  managerId: z.string().optional(),
  managerName: z.string().optional(),
});

export type DenormalizedDepartmentRefExtended = z.infer<
  typeof DenormalizedDepartmentRefExtendedSchema
>;

// ============================================
// Position References (Denormalized)
// ============================================

/**
 * Denormalized Position Reference (Minimal)
 * Use for lightweight position references
 */
export const DenormalizedPositionRefSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  level: z.string().min(1),
});

export type DenormalizedPositionRef = z.infer<typeof DenormalizedPositionRefSchema>;

/**
 * Denormalized Position Reference (Extended)
 * Use when you need department info with position
 */
export const DenormalizedPositionRefExtendedSchema = DenormalizedPositionRefSchema.extend({
  departmentId: z.string().min(1),
  departmentName: z.string().min(1),
  departmentCode: z.string().min(1),
});

export type DenormalizedPositionRefExtended = z.infer<typeof DenormalizedPositionRefExtendedSchema>;

// ============================================
// Role References (Denormalized)
// ============================================

const roleSchema = z.enum([ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.AUDITOR]);

/**
 * Denormalized Role Reference
 * Use when storing role assignment info
 */
export const DenormalizedRoleRefSchema = z.object({
  role: roleSchema,
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500).optional(),
});

export type DenormalizedRoleRef = z.infer<typeof DenormalizedRoleRefSchema>;

// ============================================
// Employee References (Denormalized)
// ============================================

/**
 * Denormalized Employee Reference (Minimal)
 * Use for basic employee references
 */
export const DenormalizedEmployeeRefSchema = z.object({
  id: z.string().min(1),
  employeeCode: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
});

export type DenormalizedEmployeeRef = z.infer<typeof DenormalizedEmployeeRefSchema>;

/**
 * Denormalized Employee Reference (Extended)
 * Use when you need department and position info
 */
export const DenormalizedEmployeeRefExtendedSchema = DenormalizedEmployeeRefSchema.extend({
  departmentId: z.string().optional(),
  departmentName: z.string().optional(),
  positionId: z.string().optional(),
  positionName: z.string().optional(),
});

export type DenormalizedEmployeeRefExtended = z.infer<typeof DenormalizedEmployeeRefExtendedSchema>;

// ============================================
// Shift References (Denormalized)
// ============================================

/**
 * Denormalized Shift Reference
 * Use for shift assignment references
 */
export const DenormalizedShiftRefSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
});

export type DenormalizedShiftRef = z.infer<typeof DenormalizedShiftRefSchema>;

// ============================================
// Permission References (Denormalized)
// ============================================

const permissionSchema = z.enum([
  PERMISSIONS.READ,
  PERMISSIONS.CREATE,
  PERMISSIONS.UPDATE,
  PERMISSIONS.DELETE,
]);

const resourceSchema = z.enum([
  RESOURCES.EMPLOYEES,
  RESOURCES.ATTENDANCE,
  RESOURCES.LEAVE_REQUESTS,
  RESOURCES.PAYROLL,
  RESOURCES.SETTINGS,
  RESOURCES.USERS,
  RESOURCES.ROLES,
  RESOURCES.AUDIT_LOGS,
]);

/**
 * Denormalized Permission Info
 * Used in role definitions to store permission details
 */
export const DenormalizedPermissionInfoSchema = z.object({
  resource: resourceSchema,
  resourceName: z.string().min(1),
  permissions: z.array(permissionSchema),
});

export type DenormalizedPermissionInfo = z.infer<typeof DenormalizedPermissionInfoSchema>;

// ============================================
// Assignment/Audit References (Denormalized)
// ============================================

/**
 * Denormalized Assignment Info
 * Use for tracking who assigned/created/updated something
 */
export const DenormalizedAssignmentInfoSchema = z.object({
  assignedBy: z.string().min(1),
  assignedByName: z.string().min(1).max(200),
  assignedByEmail: z.string().email().optional(),
  assignedAt: z.date(),
});

export type DenormalizedAssignmentInfo = z.infer<typeof DenormalizedAssignmentInfoSchema>;

/**
 * Denormalized Creator Info
 * Use for tracking who created something
 */
export const DenormalizedCreatorInfoSchema = z.object({
  createdBy: z.string().min(1),
  createdByName: z.string().min(1).max(200),
  createdByEmail: z.string().email().optional(),
});

export type DenormalizedCreatorInfo = z.infer<typeof DenormalizedCreatorInfoSchema>;

/**
 * Denormalized Updater Info
 * Use for tracking who last updated something
 */
export const DenormalizedUpdaterInfoSchema = z.object({
  updatedBy: z.string().min(1),
  updatedByName: z.string().min(1).max(200),
  updatedByEmail: z.string().email().optional(),
});

export type DenormalizedUpdaterInfo = z.infer<typeof DenormalizedUpdaterInfoSchema>;

// ============================================
// Location References (Denormalized)
// ============================================

/**
 * Denormalized Location Reference
 * Use for geofence and location-based references
 */
export const DenormalizedLocationRefSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
});

export type DenormalizedLocationRef = z.infer<typeof DenormalizedLocationRefSchema>;
