/**
 * Holiday Calendar Schemas
 * Zod validation schemas for holidays
 */

import { z } from 'zod';
import {
  DenormalizedDepartmentRefSchema,
  DenormalizedPositionRefSchema,
} from '@/shared/schemas/denormalized.schema';

/**
 * Holiday Type Schema
 */
export const HolidayTypeSchema = z.enum(['national', 'regional', 'company', 'substitute']);

/**
 * Holiday Work Policy Schema
 */
export const HolidayWorkPolicySchema = z.enum(['no-work', 'optional', 'required', 'overtime-only']);

/**
 * Create Public Holiday Schema
 */
export const CreatePublicHolidaySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  nameEn: z.string().min(1, 'English name is required').max(200),
  description: z.string().max(500),
  date: z.date(),
  year: z.number().min(2000).max(2100),
  type: HolidayTypeSchema,

  // Substitute day
  isSubstituteDay: z.boolean(),
  originalDate: z.date().optional(),

  // Work policy
  workPolicy: HolidayWorkPolicySchema,
  overtimeRate: z.number().min(1).max(10), // 1x - 10x

  // Location
  locations: z.array(z.string()).default([]),
  regions: z.array(z.string()).default([]),

  // Applicable to (denormalized)
  applicableDepartments: z.record(DenormalizedDepartmentRefSchema).optional(),
  applicablePositions: z.record(DenormalizedPositionRefSchema).optional(),
});

export type CreatePublicHolidayValidated = z.infer<typeof CreatePublicHolidaySchema>;

/**
 * Update Public Holiday Schema
 */
export const UpdatePublicHolidaySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameEn: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  date: z.date().optional(),
  type: HolidayTypeSchema.optional(),

  // Substitute day
  isSubstituteDay: z.boolean().optional(),
  originalDate: z.date().optional(),

  // Work policy
  workPolicy: HolidayWorkPolicySchema.optional(),
  overtimeRate: z.number().min(1).max(10).optional(),

  // Location
  locations: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),

  // Applicable to (denormalized)
  applicableDepartments: z.record(DenormalizedDepartmentRefSchema).optional(),
  applicablePositions: z.record(DenormalizedPositionRefSchema).optional(),

  isActive: z.boolean().optional(),
});

export type UpdatePublicHolidayValidated = z.infer<typeof UpdatePublicHolidaySchema>;

/**
 * Public Holiday Filters Schema
 */
export const PublicHolidayFiltersSchema = z.object({
  year: z.number().min(2000).max(2100).optional(),
  type: HolidayTypeSchema.optional(),
  location: z.string().optional(),
  region: z.string().optional(),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type PublicHolidayFiltersValidated = z.infer<typeof PublicHolidayFiltersSchema>;

/**
 * Working Days Calculation Input Schema
 */
export const WorkingDaysCalculationInputSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  includeWeekends: z.boolean().default(false),
  location: z.string().optional(),
  region: z.string().optional(),
  department: z.string().optional(),
});

export type WorkingDaysCalculationInputValidated = z.infer<
  typeof WorkingDaysCalculationInputSchema
>;

/**
 * Complete Public Holiday Schema (for seed scripts and Firestore)
 * Includes all fields with Firestore Timestamps
 */
export const PublicHolidaySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  nameEn: z.string().min(1).max(200),
  description: z.string().max(500),
  date: z.date(),
  year: z.number().min(2000).max(2100),
  type: HolidayTypeSchema,

  // Substitute day
  isSubstituteDay: z.boolean(),
  originalDate: z.date().optional(),

  // Work policy
  workPolicy: HolidayWorkPolicySchema,
  overtimeRate: z.number().min(1).max(10),

  // Location
  locations: z.array(z.string()),
  regions: z.array(z.string()),

  // Applicable to (denormalized)
  applicableDepartments: z.record(DenormalizedDepartmentRefSchema).optional(),
  applicablePositions: z.record(DenormalizedPositionRefSchema).optional(),

  // Metadata
  isActive: z.boolean(),
  tenantId: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type PublicHoliday = z.infer<typeof PublicHolidaySchema>;

/**
 * Validation Helpers
 */
export function validatePublicHoliday(data: unknown) {
  return PublicHolidaySchema.parse(data);
}

export function safeValidatePublicHoliday(data: unknown) {
  const result = PublicHolidaySchema.safeParse(data);
  return result.success ? result.data : null;
}

// ===== Cloud Function Schemas =====

/**
 * Cloud Function: Create Holiday Schema
 */
export const CloudFunctionCreateHolidaySchema = z.object({
  holidayData: CreatePublicHolidaySchema.extend({
    tenantId: z.string().min(1, 'ต้องระบุ Tenant ID'),
  }),
});

/**
 * Cloud Function: Update Holiday Schema
 */
export const CloudFunctionUpdateHolidaySchema = z.object({
  holidayId: z.string().min(1, 'ต้องระบุ Holiday ID'),
  holidayData: UpdatePublicHolidaySchema,
});

/**
 * Cloud Function: Delete Holiday Schema
 */
export const CloudFunctionDeleteHolidaySchema = z.object({
  holidayId: z.string().min(1, 'ต้องระบุ Holiday ID'),
});
