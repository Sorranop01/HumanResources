/**
 * Work Schedule Policy Schemas
 * Zod validation schemas for work schedule policies
 */

import { z } from 'zod';
import {
  DenormalizedDepartmentRefSchema,
  DenormalizedPositionRefSchema,
} from '@/shared/schemas/denormalized.schema';

/**
 * Time format validation (HH:mm)
 */
const timeFormatRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Flexible Time Range Schema
 */
export const FlexibleTimeRangeSchema = z.object({
  earliest: z.string().regex(timeFormatRegex, 'Must be in HH:mm format'),
  latest: z.string().regex(timeFormatRegex, 'Must be in HH:mm format'),
});

export type FlexibleTimeRangeInput = z.infer<typeof FlexibleTimeRangeSchema>;

/**
 * Working Days Schema (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export const WorkingDaysSchema = z
  .array(z.number().min(0).max(6))
  .min(1, 'At least one working day required')
  .max(7, 'Cannot have more than 7 working days');

/**
 * Create Work Schedule Policy Schema
 */
export const CreateWorkSchedulePolicySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  nameEn: z.string().min(1, 'English name is required').max(100),
  description: z.string().max(500),
  code: z.string().min(1, 'Code is required').max(50).toUpperCase(),

  // Working hours
  hoursPerDay: z.number().min(1).max(24),
  hoursPerWeek: z.number().min(1).max(168),
  daysPerWeek: z.number().min(1).max(7),

  // Working days
  workingDays: WorkingDaysSchema,

  // Time configuration
  standardStartTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format'),
  standardEndTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format'),
  breakDuration: z.number().min(0).max(240), // 0-4 hours

  // Late/Early rules
  lateThresholdMinutes: z.number().min(0).max(120),
  earlyLeaveThresholdMinutes: z.number().min(0).max(120),
  gracePeriodMinutes: z.number().min(0).max(60),

  // Flexible time
  allowFlexibleTime: z.boolean(),
  flexibleStartTimeRange: FlexibleTimeRangeSchema.optional(),
  flexibleEndTimeRange: FlexibleTimeRangeSchema.optional(),

  // Overtime
  overtimeStartsAfter: z.number().min(0).max(120),
  maxOvertimeHoursPerDay: z.number().min(0).max(12),

  // Applicable to (denormalized)
  applicableDepartments: z.record(DenormalizedDepartmentRefSchema).optional(), // ✅ Changed to denormalized map
  applicablePositions: z.record(DenormalizedPositionRefSchema).optional(), // ✅ Changed to denormalized map
  applicableEmploymentTypes: z.array(z.string()).default([]),

  // Effective dates
  effectiveDate: z.date(),
  expiryDate: z.date().optional(),
});

export type CreateWorkSchedulePolicyValidated = z.infer<typeof CreateWorkSchedulePolicySchema>;

/**
 * Update Work Schedule Policy Schema
 */
export const UpdateWorkSchedulePolicySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),

  // Working hours
  hoursPerDay: z.number().min(1).max(24).optional(),
  hoursPerWeek: z.number().min(1).max(168).optional(),
  daysPerWeek: z.number().min(1).max(7).optional(),

  // Working days
  workingDays: WorkingDaysSchema.optional(),

  // Time configuration
  standardStartTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format').optional(),
  standardEndTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format').optional(),
  breakDuration: z.number().min(0).max(240).optional(),

  // Late/Early rules
  lateThresholdMinutes: z.number().min(0).max(120).optional(),
  earlyLeaveThresholdMinutes: z.number().min(0).max(120).optional(),
  gracePeriodMinutes: z.number().min(0).max(60).optional(),

  // Flexible time
  allowFlexibleTime: z.boolean().optional(),
  flexibleStartTimeRange: FlexibleTimeRangeSchema.optional(),
  flexibleEndTimeRange: FlexibleTimeRangeSchema.optional(),

  // Overtime
  overtimeStartsAfter: z.number().min(0).max(120).optional(),
  maxOvertimeHoursPerDay: z.number().min(0).max(12).optional(),

  // Applicable to (denormalized)
  applicableDepartments: z.record(DenormalizedDepartmentRefSchema).optional(),
  applicablePositions: z.record(DenormalizedPositionRefSchema).optional(),
  applicableEmploymentTypes: z.array(z.string()).optional(),

  // Effective dates
  effectiveDate: z.date().optional(),
  expiryDate: z.date().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateWorkSchedulePolicyValidated = z.infer<typeof UpdateWorkSchedulePolicySchema>;

/**
 * Work Schedule Policy Filters Schema
 */
export const WorkSchedulePolicyFiltersSchema = z.object({
  department: z.string().optional(),
  position: z.string().optional(),
  employmentType: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type WorkSchedulePolicyFiltersValidated = z.infer<typeof WorkSchedulePolicyFiltersSchema>;

/**
 * Time Check Input Schema (for validating clock-in/out time)
 */
export const TimeCheckInputSchema = z.object({
  policyId: z.string().min(1),
  checkTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format'),
  checkType: z.enum(['clock-in', 'clock-out']),
  date: z.date(),
});

export type TimeCheckInput = z.infer<typeof TimeCheckInputSchema>;

/**
 * Complete Work Schedule Policy Schema (for seed scripts and Firestore)
 * Includes all fields with Firestore Timestamps
 */
export const WorkSchedulePolicySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  description: z.string().max(500),
  code: z.string().min(1).max(50),

  // Working hours
  hoursPerDay: z.number().min(1).max(24),
  hoursPerWeek: z.number().min(1).max(168),
  daysPerWeek: z.number().min(1).max(7),

  // Working days
  workingDays: WorkingDaysSchema,

  // Time configuration
  standardStartTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format'),
  standardEndTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format'),
  breakDuration: z.number().min(0).max(240),

  // Late/Early rules
  lateThresholdMinutes: z.number().min(0).max(120),
  earlyLeaveThresholdMinutes: z.number().min(0).max(120),
  gracePeriodMinutes: z.number().min(0).max(60),

  // Flexible time
  allowFlexibleTime: z.boolean(),
  flexibleStartTimeRange: FlexibleTimeRangeSchema.optional(),
  flexibleEndTimeRange: FlexibleTimeRangeSchema.optional(),

  // Overtime
  overtimeStartsAfter: z.number().min(0).max(120),
  maxOvertimeHoursPerDay: z.number().min(0).max(12),

  // Applicable to (denormalized)
  applicableDepartments: z.record(DenormalizedDepartmentRefSchema).optional(),
  applicablePositions: z.record(DenormalizedPositionRefSchema).optional(),
  applicableEmploymentTypes: z.array(z.string()),

  // Effective dates
  effectiveDate: z.date(),
  expiryDate: z.date().optional(),

  // Metadata
  isActive: z.boolean(),
  tenantId: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type WorkSchedulePolicy = z.infer<typeof WorkSchedulePolicySchema>;

/**
 * Validation Helpers
 */
export function validateWorkSchedulePolicy(data: unknown) {
  return WorkSchedulePolicySchema.parse(data);
}

export function safeValidateWorkSchedulePolicy(data: unknown) {
  const result = WorkSchedulePolicySchema.safeParse(data);
  return result.success ? result.data : null;
}

// ===== Cloud Function Schemas =====

/**
 * Cloud Function: Create Work Schedule Policy Schema
 */
export const CloudFunctionCreateWorkSchedulePolicySchema = z.object({
  policyData: CreateWorkSchedulePolicySchema.extend({
    tenantId: z.string().min(1, 'ต้องระบุ Tenant ID'),
  }),
});

/**
 * Cloud Function: Update Work Schedule Policy Schema
 */
export const CloudFunctionUpdateWorkSchedulePolicySchema = z.object({
  policyId: z.string().min(1, 'ต้องระบุ Policy ID'),
  policyData: UpdateWorkSchedulePolicySchema,
});

/**
 * Cloud Function: Delete Work Schedule Policy Schema
 */
export const CloudFunctionDeleteWorkSchedulePolicySchema = z.object({
  policyId: z.string().min(1, 'ต้องระบุ Policy ID'),
});
