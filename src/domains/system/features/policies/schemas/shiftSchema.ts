/**
 * Shift Management Schemas
 * Zod validation schemas for shift management
 */

import { z } from 'zod';

/**
 * Time format validation (HH:mm)
 */
const timeFormatRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Working Days Schema (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
const WorkingDaysSchema = z
  .array(z.number().min(0).max(6))
  .min(1, 'At least one working day required')
  .max(7, 'Cannot have more than 7 working days');

/**
 * Shift Break Schema
 */
export const ShiftBreakSchema = z.object({
  name: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  startTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format'),
  duration: z.number().min(1).max(240), // 1-240 minutes
});

/**
 * Shift Rotation Type Schema
 */
export const ShiftRotationTypeSchema = z.enum([
  'fixed',
  'weekly',
  'bi-weekly',
  'monthly',
  'custom',
]);

/**
 * Shift Rotation Pattern Schema
 */
export const ShiftRotationPatternSchema = z.object({
  type: ShiftRotationTypeSchema,
  sequence: z.array(z.string()).min(1, 'At least one shift code required'),
  cycleDays: z.number().min(1).max(365),
  startDate: z.date(),
});

/**
 * Create Shift Schema
 */
export const CreateShiftSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  nameEn: z.string().min(1, 'English name is required').max(100),
  description: z.string().max(500),
  code: z.string().min(1, 'Code is required').max(50).toUpperCase(),

  // Time configuration
  startTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format'),
  endTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format'),
  breaks: z.array(ShiftBreakSchema).default([]),

  // Hours
  workHours: z.number().min(0).max(24),
  grossHours: z.number().min(0).max(24),

  // Premium
  premiumRate: z.number().min(0).max(5), // 0-500%
  nightShiftBonus: z.number().min(0).max(10000), // Fixed bonus amount

  // Applicable days
  applicableDays: WorkingDaysSchema,

  // UI
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),

  // Effective dates
  effectiveDate: z.date(),
  expiryDate: z.date().optional(),
});

export type CreateShiftValidated = z.infer<typeof CreateShiftSchema>;

/**
 * Update Shift Schema
 */
export const UpdateShiftSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),

  // Time configuration
  startTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format').optional(),
  endTime: z.string().regex(timeFormatRegex, 'Must be in HH:mm format').optional(),
  breaks: z.array(ShiftBreakSchema).optional(),

  // Hours
  workHours: z.number().min(0).max(24).optional(),
  grossHours: z.number().min(0).max(24).optional(),

  // Premium
  premiumRate: z.number().min(0).max(5).optional(),
  nightShiftBonus: z.number().min(0).max(10000).optional(),

  // Applicable days
  applicableDays: WorkingDaysSchema.optional(),

  // UI
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),

  // Effective dates
  effectiveDate: z.date().optional(),
  expiryDate: z.date().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateShiftValidated = z.infer<typeof UpdateShiftSchema>;

/**
 * Shift Filters Schema
 */
export const ShiftFiltersSchema = z.object({
  code: z.string().optional(),
  isActive: z.boolean().optional(),
  effectiveDate: z.date().optional(),
});

export type ShiftFiltersValidated = z.infer<typeof ShiftFiltersSchema>;

/**
 * Create Shift Assignment Schema
 */
export const CreateShiftAssignmentSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  shiftId: z.string().min(1, 'Shift ID is required'),
  shiftCode: z.string().min(1, 'Shift code is required'),

  // Assignment period
  startDate: z.date(),
  endDate: z.date().optional(),

  // Working days
  workDays: WorkingDaysSchema,

  // Rotation
  rotationPattern: ShiftRotationPatternSchema.optional(),
  isPermanent: z.boolean(),
  isRotational: z.boolean(),

  notes: z.string().max(500).optional(),
  assignedBy: z.string().min(1, 'Assigned by is required'),
});

export type CreateShiftAssignmentValidated = z.infer<typeof CreateShiftAssignmentSchema>;

/**
 * Update Shift Assignment Schema
 */
export const UpdateShiftAssignmentSchema = z.object({
  shiftId: z.string().min(1).optional(),
  shiftCode: z.string().min(1).optional(),

  // Assignment period
  startDate: z.date().optional(),
  endDate: z.date().optional(),

  // Working days
  workDays: WorkingDaysSchema.optional(),

  // Rotation
  rotationPattern: ShiftRotationPatternSchema.optional(),
  isPermanent: z.boolean().optional(),
  isRotational: z.boolean().optional(),

  notes: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateShiftAssignmentValidated = z.infer<typeof UpdateShiftAssignmentSchema>;

/**
 * Shift Assignment Filters Schema
 */
export const ShiftAssignmentFiltersSchema = z.object({
  employeeId: z.string().optional(),
  shiftId: z.string().optional(),
  isActive: z.boolean().optional(),
  isPermanent: z.boolean().optional(),
  isRotational: z.boolean().optional(),
});

export type ShiftAssignmentFiltersValidated = z.infer<typeof ShiftAssignmentFiltersSchema>;
