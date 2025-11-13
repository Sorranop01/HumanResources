/**
 * Leave Entitlement Schemas
 * Zod validation schemas for leave entitlements (leave balances)
 *
 * @see @/domains/people/features/leave/types/leaveEntitlement.ts
 * @see @/docs/standards/10-Single-Source-of-Truth-Zod.md
 *
 * Note: This schema supports both Firebase Client SDK and Admin SDK Timestamps
 */

import { z } from 'zod';
import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';

/**
 * Complete Leave Entitlement Schema (for Firestore)
 */
export const LeaveEntitlementSchema = z.object({
  // Base fields
  id: z.string().min(1),

  // Employee (denormalized)
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  employeeCode: z.string().min(1),

  // Leave Type (denormalized)
  leaveTypeId: z.string().min(1),
  leaveTypeCode: z.string().min(1),
  leaveTypeName: z.string().min(1),

  // Entitlement Period
  year: z.number().int().min(2000).max(2100),
  effectiveFrom: FirestoreTimestampSchema,
  effectiveTo: FirestoreTimestampSchema,

  // Balance
  totalEntitlement: z.number().min(0),
  carriedOver: z.number().min(0).default(0),
  accrued: z.number().min(0).default(0),
  used: z.number().min(0).default(0),
  pending: z.number().min(0).default(0),
  remaining: z.number().min(0),

  // Calculation Details
  basedOnTenure: z.boolean().default(false),
  tenureYears: z.number().min(0).default(0),

  // Status
  isActive: z.boolean().default(true),

  // Metadata
  notes: z.string().max(500).optional(),
  lastCalculatedAt: FirestoreTimestampSchema,

  // Multi-tenancy
  tenantId: z.string().min(1),

  // Timestamps
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Create Leave Entitlement Schema (for API input)
 */
export const CreateLeaveEntitlementSchema = z.object({
  employeeId: z.string().min(1),
  leaveTypeId: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  totalEntitlement: z.number().min(0),
  carriedOver: z.number().min(0).default(0),
  basedOnTenure: z.boolean().default(false),
  tenureYears: z.number().min(0).default(0),
  notes: z.string().max(500).optional(),
});

/**
 * Update Leave Balance Schema
 */
export const UpdateLeaveBalanceSchema = z.object({
  used: z.number().min(0).optional(),
  pending: z.number().min(0).optional(),
  operation: z.enum(['add', 'subtract']),
});

/**
 * Type Exports
 */
export type LeaveEntitlement = z.infer<typeof LeaveEntitlementSchema>;
export type CreateLeaveEntitlementInput = z.infer<typeof CreateLeaveEntitlementSchema>;
export type UpdateLeaveBalanceInput = z.infer<typeof UpdateLeaveBalanceSchema>;

/**
 * Validation Helpers
 */
export function validateLeaveEntitlement(data: unknown): LeaveEntitlement {
  return LeaveEntitlementSchema.parse(data);
}

export function safeValidateLeaveEntitlement(data: unknown): LeaveEntitlement | null {
  const result = LeaveEntitlementSchema.safeParse(data);
  return result.success ? result.data : null;
}
