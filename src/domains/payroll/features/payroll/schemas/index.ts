/**
 * Payroll Schemas
 * Zod validation schemas for payroll feature
 * Single Source of Truth for payroll data validation
 */

import { z } from 'zod';

// ============================================
// Enum Schemas
// ============================================

/**
 * Payroll Status Schema
 */
export const PayrollStatusSchema = z.enum(['draft', 'pending', 'approved', 'paid', 'cancelled']);

/**
 * Payment Frequency Schema
 */
export const PaymentFrequencySchema = z.enum(['monthly', 'bi-weekly', 'weekly', 'hourly']);

/**
 * Payment Method Schema
 */
export const PaymentMethodSchema = z.enum(['bank-transfer', 'cash', 'cheque']);

/**
 * Allowances Schema
 */
export const AllowancesSchema = z.object({
  transportation: z.number().min(0).default(0),
  housing: z.number().min(0).default(0),
  meal: z.number().min(0).default(0),
  position: z.number().min(0).default(0),
  other: z.number().min(0).default(0),
});

export type AllowancesInput = z.infer<typeof AllowancesSchema>;

/**
 * Deductions Schema
 */
export const DeductionsSchema = z.object({
  tax: z.number().min(0).default(0),
  socialSecurity: z.number().min(0).default(0),
  providentFund: z.number().min(0).default(0),
  loan: z.number().min(0).default(0),
  advance: z.number().min(0).default(0),
  latePenalty: z.number().min(0).default(0),
  absencePenalty: z.number().min(0).default(0),
  other: z.number().min(0).default(0),
});

export type DeductionsInput = z.infer<typeof DeductionsSchema>;

/**
 * Payroll Calculation Input Schema
 */
export const PayrollCalculationInputSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),

  // Attendance data
  actualWorkDays: z.number().min(0),
  absentDays: z.number().min(0),
  lateDays: z.number().min(0),
  overtimeHours: z.number().min(0),
  onLeaveDays: z.number().min(0),

  // Salary data
  baseSalary: z.number().min(0),
  paymentFrequency: PaymentFrequencySchema,
  overtimeRate: z.number().min(1).max(5), // 1x to 5x

  // Additional income
  bonus: z.number().min(0).optional(),
  allowances: AllowancesSchema.partial().optional(),

  // Deduction rates
  taxRate: z.number().min(0).max(100).optional(),
  socialSecurityRate: z.number().min(0).max(100).optional(),
  providentFundRate: z.number().min(0).max(100).optional(),

  // Fixed deductions
  loan: z.number().min(0).optional(),
  advance: z.number().min(0).optional(),
});

export type PayrollCalculationInputValidated = z.infer<typeof PayrollCalculationInputSchema>;

/**
 * Create Payroll Input Schema
 */
export const CreatePayrollInputSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  periodStart: z.date(),
  periodEnd: z.date(),
  payDate: z.date(),
  notes: z.string().max(1000).optional(),
});

export type CreatePayrollInputValidated = z.infer<typeof CreatePayrollInputSchema>;

/**
 * Update Payroll Input Schema
 */
export const UpdatePayrollInputSchema = z.object({
  baseSalary: z.number().min(0).optional(),
  overtimePay: z.number().min(0).optional(),
  bonus: z.number().min(0).optional(),
  allowances: AllowancesSchema.partial().optional(),
  deductions: DeductionsSchema.partial().optional(),
  payDate: z.date().optional(),
  notes: z.string().max(1000).optional(),
});

export type UpdatePayrollInputValidated = z.infer<typeof UpdatePayrollInputSchema>;

/**
 * Approve Payroll Input Schema
 */
export const ApprovePayrollInputSchema = z.object({
  approverId: z.string().min(1, 'Approver ID is required'),
  comments: z.string().max(500).optional(),
});

export type ApprovePayrollInputValidated = z.infer<typeof ApprovePayrollInputSchema>;

/**
 * Process Payment Input Schema
 */
export const ProcessPaymentInputSchema = z.object({
  paymentMethod: z.enum(['bank-transfer', 'cash', 'cheque']),
  transactionRef: z.string().max(100).optional(),
  paidBy: z.string().min(1, 'Paid by is required'),
});

export type ProcessPaymentInputValidated = z.infer<typeof ProcessPaymentInputSchema>;

/**
 * Payroll Filters Schema
 */
export const PayrollFiltersSchema = z.object({
  employeeId: z.string().optional(),
  department: z.string().optional(),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000).max(2100).optional(),
  status: PayrollStatusSchema.optional(),
});

export type PayrollFiltersValidated = z.infer<typeof PayrollFiltersSchema>;

/**
 * Bulk Payroll Generation Schema
 */
export const BulkPayrollGenerationSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  employeeIds: z.array(z.string()).min(1, 'At least one employee is required'),
  payDate: z.date(),
});

export type BulkPayrollGenerationInput = z.infer<typeof BulkPayrollGenerationSchema>;

// ============================================
// Complete Payroll Record Schema
// ============================================

/**
 * Complete Payroll Record Schema (for database)
 */
export const PayrollRecordSchema = z.object({
  id: z.string(),

  // Employee Information (denormalized)
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeCode: z.string().min(1, 'Employee code is required'),
  departmentId: z.string().min(1, 'Department ID is required'),
  departmentName: z.string().min(1, 'Department name is required'),
  positionId: z.string().min(1, 'Position ID is required'),
  positionName: z.string().min(1, 'Position name is required'),

  // Period
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  periodStart: z.date(),
  periodEnd: z.date(),
  payDate: z.date(),

  // Income
  baseSalary: z.number().min(0),
  overtimePay: z.number().min(0),
  bonus: z.number().min(0),
  allowances: AllowancesSchema,
  grossIncome: z.number().min(0),

  // Deductions
  deductions: DeductionsSchema,
  totalDeductions: z.number().min(0),

  // Net Pay
  netPay: z.number(),

  // Working Days (from attendance)
  workingDays: z.number().int().min(0),
  actualWorkDays: z.number().int().min(0),
  absentDays: z.number().int().min(0),
  lateDays: z.number().int().min(0),
  onLeaveDays: z.number().int().min(0),
  overtimeHours: z.number().min(0),

  // Status
  status: PayrollStatusSchema,

  // Approval
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  approvalComments: z.string().optional(),

  // Payment
  paidBy: z.string().optional(),
  paidAt: z.date().optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  transactionRef: z.string().optional(),

  // Notes
  notes: z.string().optional(),

  // Multi-tenancy
  tenantId: z.string(),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PayrollRecordValidated = z.infer<typeof PayrollRecordSchema>;

// ============================================
// Helper Functions
// ============================================

/**
 * Validate payroll record data
 */
export function validatePayrollRecord(data: unknown) {
  return PayrollRecordSchema.parse(data);
}

/**
 * Safe validation (returns null on error)
 */
export function safeValidatePayrollRecord(data: unknown) {
  const result = PayrollRecordSchema.safeParse(data);
  return result.success ? result.data : null;
}
