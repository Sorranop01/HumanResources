/**
 * Work Schedule Policy Schemas
 * Zod validation schemas for work schedule policies
 */

import { z } from 'zod';

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

  // Applicable to
  applicableDepartments: z.array(z.string()).default([]),
  applicablePositions: z.array(z.string()).default([]),
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

  // Applicable to
  applicableDepartments: z.array(z.string()).optional(),
  applicablePositions: z.array(z.string()).optional(),
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
