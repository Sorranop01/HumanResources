/**
 * Penalty Policy Schemas
 * Zod validation schemas for penalty policies
 */

import { z } from 'zod';

/**
 * Penalty Type Schema
 */
export const PenaltyTypeSchema = z.enum([
  'late',
  'absence',
  'early-leave',
  'no-clock-in',
  'no-clock-out',
  'violation',
]);

/**
 * Calculation Type Schema
 */
export const PenaltyCalculationTypeSchema = z.enum([
  'fixed',
  'percentage',
  'hourly-rate',
  'daily-rate',
  'progressive',
]);

/**
 * Penalty Threshold Schema
 */
export const PenaltyThresholdSchema = z.object({
  minutes: z.number().min(0).max(1440).optional(), // 0-24 hours
  occurrences: z.number().min(1).max(100).optional(),
  days: z.number().min(1).max(365).optional(),
});

/**
 * Progressive Penalty Rule Schema
 */
export const ProgressivePenaltyRuleSchema = z.object({
  fromOccurrence: z.number().min(1),
  toOccurrence: z.number().min(1).optional(),
  amount: z.number().min(0),
  percentage: z.number().min(0).max(100).optional(),
  description: z.string().max(500).optional(),
});

/**
 * Create Penalty Policy Schema
 */
export const CreatePenaltyPolicySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  nameEn: z.string().min(1, 'English name is required').max(100),
  description: z.string().max(500),
  code: z.string().min(1, 'Code is required').max(50).toUpperCase(),

  // Type
  type: PenaltyTypeSchema,

  // Calculation
  calculationType: PenaltyCalculationTypeSchema,
  amount: z.number().min(0).optional(),
  percentage: z.number().min(0).max(100).optional(),
  hourlyRateMultiplier: z.number().min(0).max(10).optional(),
  dailyRateMultiplier: z.number().min(0).max(10).optional(),

  // Threshold
  threshold: PenaltyThresholdSchema,

  // Grace period
  gracePeriodMinutes: z.number().min(0).max(120).optional(),
  graceOccurrences: z.number().min(0).max(10).optional(),

  // Progressive
  isProgressive: z.boolean(),
  progressiveRules: z.array(ProgressivePenaltyRuleSchema).optional(),

  // Applicable to
  applicableDepartments: z.array(z.string()).default([]),
  applicablePositions: z.array(z.string()).default([]),
  applicableEmploymentTypes: z.array(z.string()).default([]),

  // Auto-apply
  autoApply: z.boolean(),
  requiresApproval: z.boolean(),

  // Cap
  maxPenaltyPerMonth: z.number().min(0).optional(),
  maxOccurrencesPerMonth: z.number().min(1).max(100).optional(),

  // Effective dates
  effectiveDate: z.date(),
  expiryDate: z.date().optional(),
});

export type CreatePenaltyPolicyValidated = z.infer<typeof CreatePenaltyPolicySchema>;

/**
 * Update Penalty Policy Schema
 */
export const UpdatePenaltyPolicySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),

  // Calculation
  calculationType: PenaltyCalculationTypeSchema.optional(),
  amount: z.number().min(0).optional(),
  percentage: z.number().min(0).max(100).optional(),
  hourlyRateMultiplier: z.number().min(0).max(10).optional(),
  dailyRateMultiplier: z.number().min(0).max(10).optional(),

  // Threshold
  threshold: PenaltyThresholdSchema.optional(),

  // Grace period
  gracePeriodMinutes: z.number().min(0).max(120).optional(),
  graceOccurrences: z.number().min(0).max(10).optional(),

  // Progressive
  isProgressive: z.boolean().optional(),
  progressiveRules: z.array(ProgressivePenaltyRuleSchema).optional(),

  // Applicable to
  applicableDepartments: z.array(z.string()).optional(),
  applicablePositions: z.array(z.string()).optional(),
  applicableEmploymentTypes: z.array(z.string()).optional(),

  // Auto-apply
  autoApply: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),

  // Cap
  maxPenaltyPerMonth: z.number().min(0).optional(),
  maxOccurrencesPerMonth: z.number().min(1).max(100).optional(),

  // Effective dates
  effectiveDate: z.date().optional(),
  expiryDate: z.date().optional(),
  isActive: z.boolean().optional(),
});

export type UpdatePenaltyPolicyValidated = z.infer<typeof UpdatePenaltyPolicySchema>;

/**
 * Penalty Policy Filters Schema
 */
export const PenaltyPolicyFiltersSchema = z.object({
  type: PenaltyTypeSchema.optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employmentType: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type PenaltyPolicyFiltersValidated = z.infer<typeof PenaltyPolicyFiltersSchema>;

/**
 * Penalty Calculation Input Schema
 */
export const PenaltyCalculationInputSchema = z.object({
  policyId: z.string().min(1),
  employeeId: z.string().min(1),
  date: z.date(),
  violationType: PenaltyTypeSchema,
  minutesLate: z.number().min(0).max(1440).optional(),
  occurrenceCount: z.number().min(1).optional(),
  employeeSalary: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  dailyRate: z.number().min(0).optional(),
});

export type PenaltyCalculationInputValidated = z.infer<typeof PenaltyCalculationInputSchema>;
