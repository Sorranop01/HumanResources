/**
 * Leave Type Schemas
 * Zod validation schemas for leave types
 *
 * @see @/domains/people/features/leave/types/leaveType.ts
 * @see @/docs/standards/10-Single-Source-of-Truth-Zod.md
 *
 * Note: This schema supports both Firebase Client SDK and Admin SDK Timestamps
 */

import { z } from 'zod';
import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';

/**
 * Leave Accrual Type Schema
 */
export const LeaveAccrualTypeSchema = z.enum(['yearly', 'monthly', 'none']);

/**
 * Complete Leave Type Schema (for Firestore)
 */
export const LeaveTypeSchema = z.object({
  // Base fields
  id: z.string().min(1),
  code: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, numbers, underscore, or hyphen'),
  nameTh: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  description: z.string().max(500).optional(),

  // Rules
  requiresApproval: z.boolean(),
  requiresCertificate: z.boolean(),
  certificateRequiredAfterDays: z.number().int().min(0).max(365),
  maxConsecutiveDays: z.number().int().min(0).max(365),
  maxDaysPerYear: z.number().int().min(0).max(365),

  // Calculation
  isPaid: z.boolean(),
  affectsAttendance: z.boolean(),

  // Entitlement
  defaultEntitlement: z.number().min(0).max(365),
  accrualType: LeaveAccrualTypeSchema,
  carryOverAllowed: z.boolean(),
  maxCarryOverDays: z.number().int().min(0).max(365),

  // Display
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be valid hex code'),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),

  // Multi-tenancy
  tenantId: z.string().min(1),

  // Timestamps (Firebase Timestamp - supports both Client and Admin SDK)
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Create Leave Type Schema (for API input)
 */
export const CreateLeaveTypeSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/),
  nameTh: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  requiresApproval: z.boolean().default(true),
  requiresCertificate: z.boolean().default(false),
  certificateRequiredAfterDays: z.number().int().min(0).max(365).default(3),
  maxConsecutiveDays: z.number().int().min(0).max(365).default(365),
  maxDaysPerYear: z.number().int().min(0).max(365).default(0),
  isPaid: z.boolean().default(true),
  affectsAttendance: z.boolean().default(true),
  defaultEntitlement: z.number().min(0).max(365).default(0),
  accrualType: LeaveAccrualTypeSchema.default('yearly'),
  carryOverAllowed: z.boolean().default(false),
  maxCarryOverDays: z.number().int().min(0).max(365).default(0),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#10B981'),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

/**
 * Update Leave Type Schema
 */
export const UpdateLeaveTypeSchema = CreateLeaveTypeSchema.partial();

/**
 * Type Exports
 */
export type LeaveType = z.infer<typeof LeaveTypeSchema>;
export type CreateLeaveTypeInput = z.infer<typeof CreateLeaveTypeSchema>;
export type UpdateLeaveTypeInput = z.infer<typeof UpdateLeaveTypeSchema>;
export type LeaveAccrualType = z.infer<typeof LeaveAccrualTypeSchema>;

/**
 * Validation Helpers
 */
export function validateLeaveType(data: unknown): LeaveType {
  return LeaveTypeSchema.parse(data);
}

export function safeValidateLeaveType(data: unknown): LeaveType | null {
  const result = LeaveTypeSchema.safeParse(data);
  return result.success ? result.data : null;
}
