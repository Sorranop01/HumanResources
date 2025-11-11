/**
 * Social Security Validation Schemas
 * Zod schemas for social security data validation
 */

import { z } from 'zod';

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

  status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),

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
