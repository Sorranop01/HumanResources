/**
 * Overtime Policy Schemas
 * Zod validation schemas for overtime policies
 */

import { z } from 'zod';

/**
 * Overtime Type Schema
 */
export const OvertimeTypeSchema = z.enum(['weekday', 'weekend', 'holiday', 'after-hours']);

/**
 * Overtime Rule Conditions Schema
 */
export const OvertimeRuleConditionsSchema = z.object({
  minHours: z.number().min(0).max(24).optional(),
  maxHoursPerDay: z.number().min(0).max(24).optional(),
  maxHoursPerWeek: z.number().min(0).max(168).optional(),
  maxHoursPerMonth: z.number().min(0).max(744).optional(),
  roundingMinutes: z.number().min(1).max(60).optional(),
});

/**
 * Overtime Rule Schema
 */
export const OvertimeRuleSchema = z.object({
  type: OvertimeTypeSchema,
  rate: z.number().min(1).max(10), // 1x - 10x multiplier
  conditions: OvertimeRuleConditionsSchema.optional(),
});

export type OvertimeRule = z.infer<typeof OvertimeRuleSchema>;

/**
 * Payment Method Schema
 */
export const PaymentMethodSchema = z.enum(['cash', 'included-in-salary', 'separate']);

/**
 * Payment Frequency Schema
 */
export const PaymentFrequencySchema = z.enum(['monthly', 'bi-weekly', 'weekly']);

/**
 * Create Overtime Policy Schema
 */
export const CreateOvertimePolicySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  nameEn: z.string().min(1, 'English name is required').max(100),
  description: z.string().max(500),
  code: z.string().min(1, 'Code is required').max(50).toUpperCase(),

  // Eligibility
  eligibleEmployeeTypes: z.array(z.string()).default([]),
  eligiblePositions: z.array(z.string()).default([]),
  eligibleDepartments: z.array(z.string()).default([]),

  // Overtime rules
  rules: z.array(OvertimeRuleSchema).min(1, 'At least one rule is required'),

  // Approval requirements
  requiresApproval: z.boolean(),
  approvalThresholdHours: z.number().min(0).max(24).optional(),
  autoApproveUnder: z.number().min(0).max(24).optional(),

  // Special rates
  holidayRate: z.number().min(1).max(10),
  weekendRate: z.number().min(1).max(10),
  nightShiftRate: z.number().min(0).max(5).optional(),

  // Tracking
  trackBySystem: z.boolean(),
  allowManualEntry: z.boolean(),

  // Payment
  paymentMethod: PaymentMethodSchema,
  paymentFrequency: PaymentFrequencySchema,

  // Effective dates
  effectiveDate: z.date(),
  expiryDate: z.date().optional(),
});

export type CreateOvertimePolicyValidated = z.infer<typeof CreateOvertimePolicySchema>;

/**
 * Update Overtime Policy Schema
 */
export const UpdateOvertimePolicySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),

  // Eligibility
  eligibleEmployeeTypes: z.array(z.string()).optional(),
  eligiblePositions: z.array(z.string()).optional(),
  eligibleDepartments: z.array(z.string()).optional(),

  // Overtime rules
  rules: z.array(OvertimeRuleSchema).optional(),

  // Approval requirements
  requiresApproval: z.boolean().optional(),
  approvalThresholdHours: z.number().min(0).max(24).optional(),
  autoApproveUnder: z.number().min(0).max(24).optional(),

  // Special rates
  holidayRate: z.number().min(1).max(10).optional(),
  weekendRate: z.number().min(1).max(10).optional(),
  nightShiftRate: z.number().min(0).max(5).optional(),

  // Tracking
  trackBySystem: z.boolean().optional(),
  allowManualEntry: z.boolean().optional(),

  // Payment
  paymentMethod: PaymentMethodSchema.optional(),
  paymentFrequency: PaymentFrequencySchema.optional(),

  // Effective dates
  effectiveDate: z.date().optional(),
  expiryDate: z.date().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateOvertimePolicyValidated = z.infer<typeof UpdateOvertimePolicySchema>;

/**
 * Overtime Policy Filters Schema
 */
export const OvertimePolicyFiltersSchema = z.object({
  department: z.string().optional(),
  position: z.string().optional(),
  employeeType: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type OvertimePolicyFiltersValidated = z.infer<typeof OvertimePolicyFiltersSchema>;

/**
 * Overtime Calculation Input Schema
 */
export const OvertimeCalculationInputSchema = z.object({
  policyId: z.string().min(1),
  employeeId: z.string().min(1),
  date: z.date(),
  overtimeHours: z.number().min(0).max(24),
  overtimeType: OvertimeTypeSchema,
  hourlyRate: z.number().min(0),
});

export type OvertimeCalculationInputValidated = z.infer<typeof OvertimeCalculationInputSchema>;

/**
 * Complete Overtime Policy Schema (for seed scripts and Firestore)
 * Includes all fields with Firestore Timestamps
 */
export const OvertimePolicySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  description: z.string().max(500),
  code: z.string().min(1).max(50),

  // Eligibility
  eligibleEmployeeTypes: z.array(z.string()),
  eligiblePositions: z.array(z.string()),
  eligibleDepartments: z.array(z.string()),

  // Overtime rules
  rules: z.array(OvertimeRuleSchema),

  // Approval requirements
  requiresApproval: z.boolean(),
  approvalThresholdHours: z.number().min(0).max(24).optional(),
  autoApproveUnder: z.number().min(0).max(24).optional(),

  // Special rates
  holidayRate: z.number().min(1).max(10),
  weekendRate: z.number().min(1).max(10),
  nightShiftRate: z.number().min(0).max(5).optional(),

  // Tracking
  trackBySystem: z.boolean(),
  allowManualEntry: z.boolean(),

  // Payment
  paymentMethod: PaymentMethodSchema,
  paymentFrequency: PaymentFrequencySchema,

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

export type OvertimePolicy = z.infer<typeof OvertimePolicySchema>;

/**
 * Validation Helpers
 */
export function validateOvertimePolicy(data: unknown) {
  return OvertimePolicySchema.parse(data);
}

export function safeValidateOvertimePolicy(data: unknown) {
  const result = OvertimePolicySchema.safeParse(data);
  return result.success ? result.data : null;
}

// ===== Cloud Function Schemas =====

/**
 * Cloud Function: Create Overtime Policy Schema
 */
export const CloudFunctionCreateOvertimePolicySchema = z.object({
  policyData: CreateOvertimePolicySchema.extend({
    tenantId: z.string().min(1, 'ต้องระบุ Tenant ID'),
  }),
});

/**
 * Cloud Function: Update Overtime Policy Schema
 */
export const CloudFunctionUpdateOvertimePolicySchema = z.object({
  policyId: z.string().min(1, 'ต้องระบุ Policy ID'),
  policyData: UpdateOvertimePolicySchema,
});

/**
 * Cloud Function: Delete Overtime Policy Schema
 */
export const CloudFunctionDeleteOvertimePolicySchema = z.object({
  policyId: z.string().min(1, 'ต้องระบุ Policy ID'),
});
