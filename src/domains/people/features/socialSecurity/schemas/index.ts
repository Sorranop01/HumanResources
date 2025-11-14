/**
 * Social Security Validation Schemas
 * Zod schemas for social security data validation
 */

import { z } from 'zod';
import { FirestoreTimestampSchema, TenantIdSchema } from '@/shared/schemas/common.schema';

/**
 * Social Security Status Schema
 */
export const SocialSecurityStatusSchema = z.enum(['active', 'inactive', 'suspended']);

/**
 * Social Security Form Schema
 * Used for creating and updating social security records
 */
export const SocialSecurityFormSchema = z.object({
  socialSecurityNumber: z
    .string()
    .min(13, 'เลขประกันสังคมต้องมี 13 หลัก')
    .max(13, 'เลขประกันสังคมต้องมี 13 หลัก')
    .regex(/^[0-9]{13}$/, 'เลขประกันสังคมต้องเป็นตัวเลข 13 หลัก'),

  registrationDate: z.string().min(1, 'กรุณาเลือกวันที่เริ่มจ่ายประกันสังคม'),

  hospitalName: z.string().min(1, 'กรุณาระบุชื่อโรงพยาบาล').max(200, 'ชื่อโรงพยาบาลยาวเกินไป'),

  hospitalCode: z.string().optional(),

  employeeContributionRate: z
    .number()
    .min(0, 'อัตราต้องไม่ติดลบ')
    .max(1, 'อัตราต้องไม่เกิน 100%')
    .optional()
    .default(0.05),

  employerContributionRate: z
    .number()
    .min(0, 'อัตราต้องไม่ติดลบ')
    .max(1, 'อัตราต้องไม่เกิน 100%')
    .optional()
    .default(0.05),

  status: SocialSecurityStatusSchema.optional().default('active'),

  notes: z.string().max(500, 'หมายเหตุยาวเกินไป').optional(),
});

export type SocialSecurityFormInput = z.infer<typeof SocialSecurityFormSchema>;

/**
 * Contribution Record Schema
 * Used for recording monthly contributions
 */
export const ContributionRecordSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  contributionDate: z.string().min(1),
  contributionBase: z.number().min(0),
  employeeAmount: z.number().min(0),
  employerAmount: z.number().min(0),
});

export type ContributionRecordInput = z.infer<typeof ContributionRecordSchema>;

/**
 * Social Security Firestore Schema
 */
export const SocialSecuritySchema = z.object({
  id: z.string().min(1),
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  employeeCode: z.string().min(1),

  socialSecurityNumber: z.string().min(13).max(13),
  registrationDate: FirestoreTimestampSchema,
  status: SocialSecurityStatusSchema,

  hospitalName: z.string().min(1),
  hospitalCode: z.string().nullable(),

  employeeContributionRate: z.number().min(0).max(1),
  employerContributionRate: z.number().min(0).max(1),

  contributionBase: z.number().min(0),
  employeeAmount: z.number().min(0),
  employerAmount: z.number().min(0),
  totalAmount: z.number().min(0),

  totalEmployeeContribution: z.number().min(0),
  totalEmployerContribution: z.number().min(0),
  totalContribution: z.number().min(0),

  notes: z.string().nullable(),
  lastContributionDate: FirestoreTimestampSchema.nullable(),

  tenantId: TenantIdSchema,
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
});

export type SocialSecurityRecord = z.infer<typeof SocialSecuritySchema>;

/**
 * Social Security Contribution Firestore Schema
 */
export const SocialSecurityContributionSchema = z.object({
  id: z.string().min(1),
  socialSecurityId: z.string().min(1),
  payrollId: z.string().nullable().optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  contributionDate: FirestoreTimestampSchema,
  contributionBase: z.number().min(0),
  employeeAmount: z.number().min(0),
  employerAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  status: z.enum(['pending', 'paid', 'cancelled']),
  paidAt: FirestoreTimestampSchema.nullable(),
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
});

export type SocialSecurityContributionRecord = z.infer<typeof SocialSecurityContributionSchema>;

export function validateSocialSecurity(data: unknown) {
  return SocialSecuritySchema.parse(data);
}

export function safeValidateSocialSecurity(data: unknown) {
  const result = SocialSecuritySchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Convert form data to Date object
 */
export function formDataToSocialSecurityInput(formData: SocialSecurityFormInput): {
  registrationDate: Date;
  hospitalName: string;
  hospitalCode?: string | undefined;
  employeeContributionRate: number;
  employerContributionRate: number;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string | undefined;
  socialSecurityNumber: string;
} {
  return {
    ...formData,
    registrationDate: new Date(formData.registrationDate),
    hospitalCode: formData.hospitalCode ?? undefined,
    notes: formData.notes ?? undefined,
  };
}
