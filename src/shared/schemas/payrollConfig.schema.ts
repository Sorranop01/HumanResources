/**
 * Payroll Configuration Schema
 * Single Source of Truth for payroll system configuration
 * Used across domains: system, payroll, finance
 */

import { z } from 'zod';

// ============================================
// Enum Schemas
// ============================================

/**
 * Pay Frequency Schema
 */
export const PayFrequencySchema = z.enum(['monthly', 'bi-weekly', 'weekly', 'daily']);

/**
 * Fiscal Year Start Month Schema (1-12)
 */
export const FiscalMonthSchema = z.number().int().min(1).max(12);

/**
 * Pay Day Schema (1-31)
 */
export const PayDaySchema = z.number().int().min(1).max(31);

/**
 * Currency Schema
 */
export const CurrencySchema = z.enum(['THB', 'USD', 'EUR']);

// ============================================
// Sub-Schemas
// ============================================

/**
 * Overtime Rates Configuration
 */
export const OvertimeRatesSchema = z.object({
  regularDayRate: z.number().min(1).max(5).default(1.5), // เช่น 1.5x
  weekendRate: z.number().min(1).max(5).default(2.0), // เช่น 2x
  holidayRate: z.number().min(1).max(5).default(3.0), // เช่น 3x
});

export type OvertimeRates = z.infer<typeof OvertimeRatesSchema>;

/**
 * Social Security Configuration
 */
export const SocialSecurityConfigSchema = z.object({
  enabled: z.boolean().default(true),
  employeeRate: z.number().min(0).max(100).default(5), // %
  employerRate: z.number().min(0).max(100).default(5), // %
  maxSalaryBase: z.number().min(0).default(15000), // ฐานเงินสูงสุด (THB)
  minContribution: z.number().min(0).default(0), // ขั้นต่ำที่ต้องหัก
  maxContribution: z.number().min(0).default(750), // สูงสุดที่หัก (750 THB)
});

export type SocialSecurityConfig = z.infer<typeof SocialSecurityConfigSchema>;

/**
 * Provident Fund Configuration
 */
export const ProvidentFundConfigSchema = z.object({
  enabled: z.boolean().default(false),
  defaultEmployeeRate: z.number().min(0).max(100).default(3), // %
  defaultEmployerRate: z.number().min(0).max(100).default(3), // %
  minContributionRate: z.number().min(0).max(100).default(2),
  maxContributionRate: z.number().min(0).max(100).default(15),
});

export type ProvidentFundConfig = z.infer<typeof ProvidentFundConfigSchema>;

/**
 * Tax Withholding Configuration
 */
export const TaxConfigSchema = z.object({
  enabled: z.boolean().default(true),
  defaultTaxRate: z.number().min(0).max(100).default(0), // %, หักตาม % หรือตารางภาษี
  useProgressiveTax: z.boolean().default(true), // ใช้ภาษีแบบขั้นบันไดหรือไม่
});

export type TaxConfig = z.infer<typeof TaxConfigSchema>;

/**
 * Working Days Configuration
 */
export const WorkingDaysConfigSchema = z.object({
  standardWorkDaysPerMonth: z.number().int().min(1).max(31).default(22),
  standardWorkHoursPerDay: z.number().min(1).max(24).default(8),
  standardWorkHoursPerWeek: z.number().min(1).max(168).default(40),
  workingDays: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]), // 0=Sunday, 6=Saturday
});

export type WorkingDaysConfig = z.infer<typeof WorkingDaysConfigSchema>;

/**
 * Default Allowances Configuration
 */
export const DefaultAllowancesConfigSchema = z.object({
  transportation: z.number().min(0).default(0),
  housing: z.number().min(0).default(0),
  meal: z.number().min(0).default(0),
  position: z.number().min(0).default(0),
});

export type DefaultAllowancesConfig = z.infer<typeof DefaultAllowancesConfigSchema>;

// ============================================
// Main Payroll Configuration Schema
// ============================================

/**
 * Complete Payroll Configuration Schema
 * This is the master configuration for the entire payroll system
 */
export const PayrollConfigSchema = z.object({
  id: z.string().default('payroll-config'), // Singleton document ID

  // Basic Settings
  organizationName: z.string().min(1, 'Organization name is required'),
  payFrequency: PayFrequencySchema,
  payDay: PayDaySchema, // วันที่จ่ายในแต่ละเดือน (1-31)
  currency: CurrencySchema,

  // Fiscal Year
  fiscalYearStartMonth: FiscalMonthSchema, // เดือนเริ่มต้นปีงบ (1-12)

  // Overtime
  overtimeRates: OvertimeRatesSchema,

  // Deductions
  socialSecurity: SocialSecurityConfigSchema,
  providentFund: ProvidentFundConfigSchema,
  tax: TaxConfigSchema,

  // Working Days
  workingDays: WorkingDaysConfigSchema,

  // Default Allowances (ค่าเริ่มต้นสำหรับพนักงานใหม่)
  defaultAllowances: DefaultAllowancesConfigSchema,

  // Additional Settings
  enableAutomaticPayrollGeneration: z.boolean().default(false),
  payrollLockDaysBefore: z.number().int().min(0).default(3), // ล็อค payroll กี่วันก่อนจ่าย
  enablePayslipEmail: z.boolean().default(true),

  // Metadata
  tenantId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().optional(), // User ID ของคนแก้ไขล่าสุด
});

export type PayrollConfig = z.infer<typeof PayrollConfigSchema>;

// ============================================
// Input Schemas for CRUD Operations
// ============================================

/**
 * Create Payroll Config Input Schema
 */
export const CreatePayrollConfigInputSchema = PayrollConfigSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreatePayrollConfigInput = z.infer<typeof CreatePayrollConfigInputSchema>;

/**
 * Update Payroll Config Input Schema
 */
export const UpdatePayrollConfigInputSchema = PayrollConfigSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
}).partial();

export type UpdatePayrollConfigInput = z.infer<typeof UpdatePayrollConfigInputSchema>;

// ============================================
// Helper Functions
// ============================================

/**
 * Validate payroll config data
 */
export function validatePayrollConfig(data: unknown): PayrollConfig {
  return PayrollConfigSchema.parse(data);
}

/**
 * Safe validation (returns null on error)
 */
export function safeValidatePayrollConfig(data: unknown): PayrollConfig | null {
  const result = PayrollConfigSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Default configuration values
 */
export const DEFAULT_PAYROLL_CONFIG: Omit<
  PayrollConfig,
  'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'organizationName'
> = {
  payFrequency: 'monthly',
  payDay: 25,
  currency: 'THB',
  fiscalYearStartMonth: 1,
  overtimeRates: {
    regularDayRate: 1.5,
    weekendRate: 2.0,
    holidayRate: 3.0,
  },
  socialSecurity: {
    enabled: true,
    employeeRate: 5,
    employerRate: 5,
    maxSalaryBase: 15000,
    minContribution: 0,
    maxContribution: 750,
  },
  providentFund: {
    enabled: false,
    defaultEmployeeRate: 3,
    defaultEmployerRate: 3,
    minContributionRate: 2,
    maxContributionRate: 15,
  },
  tax: {
    enabled: true,
    defaultTaxRate: 0,
    useProgressiveTax: true,
  },
  workingDays: {
    standardWorkDaysPerMonth: 22,
    standardWorkHoursPerDay: 8,
    standardWorkHoursPerWeek: 40,
    workingDays: [1, 2, 3, 4, 5],
  },
  defaultAllowances: {
    transportation: 0,
    housing: 0,
    meal: 0,
    position: 0,
  },
  enableAutomaticPayrollGeneration: false,
  payrollLockDaysBefore: 3,
  enablePayslipEmail: true,
};
