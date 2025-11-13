/**
 * Payroll Types
 * Type definitions for payroll feature
 */

import type { BaseEntity } from '@/shared/types';

/**
 * Payroll Status
 */
export type PayrollStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'cancelled';

/**
 * Payment Frequency
 */
export type PaymentFrequency = 'monthly' | 'bi-weekly' | 'weekly' | 'hourly';

/**
 * Allowances (เบี้ยเลี้ยง/ค่าใช้จ่ายเพิ่มเติม)
 */
export interface Allowances {
  transportation: number; // ค่าเดินทาง
  housing: number; // ค่าที่พักอาศัย
  meal: number; // ค่าอาหาร
  position: number; // เบี้ยตำแหน่ง
  other: number; // อื่นๆ
}

/**
 * Deductions (รายการหัก)
 */
export interface Deductions {
  tax: number; // หัก ณ ที่จ่าย (withholding tax)
  socialSecurity: number; // ประกันสังคม
  providentFund: number; // กองทุนสำรองเลี้ยงชีพ
  loan: number; // เงินกู้
  advance: number; // เบิกล่วงหน้า
  latePenalty: number; // หักค่าปรับมาสาย
  absencePenalty: number; // หักค่าขาดงาน
  other: number; // อื่นๆ
}

/**
 * Payroll Record Entity
 */
export interface PayrollRecord extends BaseEntity {
  // Employee Information (denormalized for reporting/display)
  employeeId: string;
  employeeName: string; // Denormalized: from Employee.displayName
  employeeCode: string; // Denormalized: from Employee.employeeCode
  departmentId: string; // Reference ID
  departmentName: string; // Denormalized: from departments collection
  positionId: string; // Reference ID
  positionName: string; // Denormalized: from positions collection

  // Period
  month: number; // 1-12
  year: number;
  periodStart: Date;
  periodEnd: Date;
  payDate: Date;

  // Income
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  allowances: Allowances;
  grossIncome: number; // Total before deductions

  // Deductions
  deductions: Deductions;
  totalDeductions: number;

  // Net Pay
  netPay: number;

  // Working Days (from attendance)
  workingDays: number; // Expected working days
  actualWorkDays: number; // Actual days worked
  absentDays: number; // Days absent
  lateDays: number; // Days late
  onLeaveDays: number; // Days on leave
  overtimeHours: number; // OT hours

  // Status
  status: PayrollStatus;

  // Approval
  approvedBy?: string;
  approvedAt?: Date;
  approvalComments?: string;

  // Payment
  paidBy?: string;
  paidAt?: Date;
  paymentMethod?: string; // 'bank-transfer' | 'cash' | 'cheque'
  transactionRef?: string;

  // Notes
  notes?: string;

  tenantId: string;
}

/**
 * Payroll Calculation Input
 */
export interface PayrollCalculationInput {
  employeeId: string;
  month: number;
  year: number;

  // From attendance records
  actualWorkDays: number;
  absentDays: number;
  lateDays: number;
  overtimeHours: number;

  // From leave requests
  onLeaveDays: number;

  // From employee record
  baseSalary: number;
  paymentFrequency: PaymentFrequency;
  overtimeRate: number; // 1.5x, 2x, 3x

  // Additional income
  bonus?: number;
  allowances?: Partial<Allowances>;

  // Deduction rates
  taxRate?: number; // %
  socialSecurityRate?: number; // %
  providentFundRate?: number; // %

  // Fixed deductions
  loan?: number;
  advance?: number;
}

/**
 * Payroll Calculation Result
 */
export interface PayrollCalculationResult {
  // Income breakdown
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  allowances: Allowances;
  grossIncome: number;

  // Deductions breakdown
  deductions: Deductions;
  totalDeductions: number;

  // Net result
  netPay: number;

  // Working days summary
  workingDays: number;
  actualWorkDays: number;
  absentDays: number;
  lateDays: number;
  onLeaveDays: number;
  overtimeHours: number;
}

/**
 * Create Payroll Input
 */
export interface CreatePayrollInput {
  employeeId: string;
  month: number;
  year: number;
  periodStart: Date;
  periodEnd: Date;
  payDate: Date;
  notes?: string;
}

/**
 * Update Payroll Input
 */
export interface UpdatePayrollInput {
  baseSalary?: number;
  overtimePay?: number;
  bonus?: number;
  allowances?: Partial<Allowances>;
  deductions?: Partial<Deductions>;
  payDate?: Date;
  notes?: string;
}

/**
 * Approve Payroll Input
 */
export interface ApprovePayrollInput {
  approverId: string;
  comments?: string;
}

/**
 * Process Payment Input
 */
export interface ProcessPaymentInput {
  paymentMethod: 'bank-transfer' | 'cash' | 'cheque';
  transactionRef?: string;
  paidBy: string;
}

/**
 * Payroll Filters
 */
export interface PayrollFilters {
  employeeId?: string;
  department?: string;
  month?: number;
  year?: number;
  status?: PayrollStatus;
}

/**
 * Payroll Summary (for dashboard/reports)
 */
export interface PayrollSummary {
  totalEmployees: number;
  totalGrossIncome: number;
  totalDeductions: number;
  totalNetPay: number;
  averageNetPay: number;
  month: number;
  year: number;
}
