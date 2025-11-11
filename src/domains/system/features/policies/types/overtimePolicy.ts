/**
 * Overtime Policy Types
 * Defines overtime rules, rates, and eligibility
 */

import type { BaseEntity } from '@/shared/types';

/**
 * Overtime rule type
 */
export type OvertimeType = 'weekday' | 'weekend' | 'holiday' | 'after-hours';

/**
 * Overtime Rule
 * Defines rate and conditions for specific overtime scenarios
 */
export interface OvertimeRule {
  type: OvertimeType;
  rate: number; // Multiplier (1.5x, 2x, 3x)

  // Optional conditions
  conditions?: {
    minHours?: number; // ขั้นต่ำ (e.g., 1.0)
    maxHoursPerDay?: number; // สูงสุดต่อวัน (e.g., 4.0)
    maxHoursPerWeek?: number; // สูงสุดต่อสัปดาห์ (e.g., 20.0)
    maxHoursPerMonth?: number; // สูงสุดต่อเดือน (e.g., 40.0)
    roundingMinutes?: number; // ปัดเป็น (e.g., 15, 30)
  };
}

/**
 * Overtime Policy
 * Comprehensive overtime management rules
 */
export interface OvertimePolicy extends BaseEntity {
  name: string;
  nameEn: string;
  description: string;
  code: string; // STANDARD_OT, MANUFACTURING_OT, etc.

  // Eligibility criteria
  eligibleEmployeeTypes: string[]; // ['permanent', 'contract']
  eligiblePositions: string[]; // ['staff', 'supervisor']
  eligibleDepartments: string[]; // ['Production', 'IT']

  // Overtime rules by type
  rules: OvertimeRule[];

  // Approval requirements
  requiresApproval: boolean;
  approvalThresholdHours?: number; // OT > X ชม. ต้อง approve
  autoApproveUnder?: number; // OT < X ชม. อนุมัติอัตโนมัติ

  // Special day rates
  holidayRate: number; // 3x for public holidays
  weekendRate: number; // 2x for weekends
  nightShiftRate?: number; // เพิ่มเติมสำหรับกะดึก

  // Time tracking
  trackBySystem: boolean; // คำนวณจาก clock-in/out อัตโนมัติ
  allowManualEntry: boolean; // อนุญาตกรอก manual

  // Payment
  paymentMethod: 'cash' | 'included-in-salary' | 'separate';
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';

  // Status
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;

  tenantId: string;
}

/**
 * Create Overtime Policy Input
 */
export interface CreateOvertimePolicyInput {
  name: string;
  nameEn: string;
  description: string;
  code: string;
  eligibleEmployeeTypes: string[];
  eligiblePositions: string[];
  eligibleDepartments: string[];
  rules: OvertimeRule[];
  requiresApproval: boolean;
  approvalThresholdHours?: number;
  autoApproveUnder?: number;
  holidayRate: number;
  weekendRate: number;
  nightShiftRate?: number;
  trackBySystem: boolean;
  allowManualEntry: boolean;
  paymentMethod: 'cash' | 'included-in-salary' | 'separate';
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  effectiveDate: Date;
  expiryDate?: Date;
}

/**
 * Update Overtime Policy Input
 */
export interface UpdateOvertimePolicyInput {
  name?: string;
  nameEn?: string;
  description?: string;
  eligibleEmployeeTypes?: string[];
  eligiblePositions?: string[];
  eligibleDepartments?: string[];
  rules?: OvertimeRule[];
  requiresApproval?: boolean;
  approvalThresholdHours?: number;
  autoApproveUnder?: number;
  holidayRate?: number;
  weekendRate?: number;
  nightShiftRate?: number;
  trackBySystem?: boolean;
  allowManualEntry?: boolean;
  paymentMethod?: 'cash' | 'included-in-salary' | 'separate';
  paymentFrequency?: 'monthly' | 'bi-weekly' | 'weekly';
  effectiveDate?: Date;
  expiryDate?: Date;
  isActive?: boolean;
}

/**
 * Overtime Policy Filters
 */
export interface OvertimePolicyFilters {
  department?: string;
  position?: string;
  employeeType?: string;
  isActive?: boolean;
}

/**
 * Overtime Calculation Input
 */
export interface OvertimeCalculationInput {
  policyId: string;
  employeeId: string;
  date: Date;
  overtimeHours: number;
  overtimeType: OvertimeType;
  hourlyRate: number;
}

/**
 * Overtime Calculation Result
 */
export interface OvertimeCalculationResult {
  hours: number;
  rate: number;
  amount: number;
  type: OvertimeType;
  requiresApproval: boolean;
  isWithinLimit: boolean;
  exceedsLimit?: {
    type: 'day' | 'week' | 'month';
    limit: number;
    actual: number;
  };
}

/**
 * Overtime Request (for approval workflow)
 */
export interface OvertimeRequest extends BaseEntity {
  employeeId: string;
  employeeName: string;
  policyId: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalHours: number;
  type: OvertimeType;
  reason: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  tenantId: string;
}
