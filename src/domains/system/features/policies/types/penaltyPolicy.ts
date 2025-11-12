/**
 * Penalty Policy Types
 * Defines penalty rules for late arrivals, absences, and violations
 */

import type { BaseEntity } from '@/shared/types';

/**
 * Penalty Type
 */
export type PenaltyType =
  | 'late' // มาสาย
  | 'absence' // ขาดงาน
  | 'early-leave' // กลับก่อนเวลา
  | 'no-clock-in' // ไม่ลงเวลาเข้า
  | 'no-clock-out' // ไม่ลงเวลาออก
  | 'violation'; // ฝ่าฝืนกฎ

/**
 * Calculation Type
 */
export type PenaltyCalculationType =
  | 'fixed' // จำนวนเงินคงที่
  | 'percentage' // เปอร์เซ็นต์ของเงินเดือน
  | 'hourly-rate' // คำนวณจากอัตราต่อชั่วโมง
  | 'daily-rate' // คำนวณจากอัตราต่อวัน
  | 'progressive'; // ค่าปรับแบบขั้นบันได

/**
 * Penalty Threshold
 */
export interface PenaltyThreshold {
  minutes?: number; // มาสาย > X นาที (สำหรับ late)
  occurrences?: number; // เกิดขึ้น X ครั้ง
  days?: number; // ระยะเวลา X วัน
}

/**
 * Progressive Penalty Rule
 * ค่าปรับแบบขั้นบันได (ครั้งที่ 1, 2, 3+)
 */
export interface ProgressivePenaltyRule {
  fromOccurrence: number; // จากครั้งที่
  toOccurrence?: number; // ถึงครั้งที่ (undefined = ไม่จำกัด)
  amount: number; // จำนวนเงิน
  percentage?: number; // หรือ % ของเงินเดือน
  description?: string;
}

/**
 * Penalty Policy
 */
export interface PenaltyPolicy extends BaseEntity {
  name: string;
  nameEn: string;
  description: string;
  code: string; // LATE_PENALTY, ABSENCE_PENALTY, etc.

  // Type
  type: PenaltyType;

  // Calculation
  calculationType: PenaltyCalculationType;
  amount?: number; // Fixed amount
  percentage?: number; // Percentage of salary
  hourlyRateMultiplier?: number; // Multiplier of hourly rate
  dailyRateMultiplier?: number; // Multiplier of daily rate

  // Threshold
  threshold: PenaltyThreshold;

  // Grace period
  gracePeriodMinutes?: number; // ผ่อนผันกี่นาที (สำหรับ late/early-leave)
  graceOccurrences?: number; // ผ่อนผันกี่ครั้ง (สำหรับ absence)

  // Progressive rules (if applicable)
  isProgressive: boolean;
  progressiveRules?: ProgressivePenaltyRule[];

  // Applicable to
  applicableDepartments: string[];
  applicablePositions: string[];
  applicableEmploymentTypes: string[];

  // Auto-apply
  autoApply: boolean; // ใช้อัตโนมัติหรือต้อง approve
  requiresApproval: boolean;

  // Cap (max penalty)
  maxPenaltyPerMonth?: number; // ค่าปรับสูงสุดต่อเดือน
  maxOccurrencesPerMonth?: number; // จำนวนครั้งสูงสุดที่ปรับต่อเดือน

  // Status
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;

  tenantId: string;
}

/**
 * Create Penalty Policy Input
 */
export interface CreatePenaltyPolicyInput {
  name: string;
  nameEn: string;
  description: string;
  code: string;
  type: PenaltyType;
  calculationType: PenaltyCalculationType;
  amount?: number;
  percentage?: number;
  hourlyRateMultiplier?: number;
  dailyRateMultiplier?: number;
  threshold: PenaltyThreshold;
  gracePeriodMinutes?: number;
  graceOccurrences?: number;
  isProgressive: boolean;
  progressiveRules?: ProgressivePenaltyRule[];
  applicableDepartments: string[];
  applicablePositions: string[];
  applicableEmploymentTypes: string[];
  autoApply: boolean;
  requiresApproval: boolean;
  maxPenaltyPerMonth?: number;
  maxOccurrencesPerMonth?: number;
  effectiveDate: Date;
  expiryDate?: Date;
}

/**
 * Update Penalty Policy Input
 */
export interface UpdatePenaltyPolicyInput {
  name?: string;
  nameEn?: string;
  description?: string;
  calculationType?: PenaltyCalculationType;
  amount?: number;
  percentage?: number;
  hourlyRateMultiplier?: number;
  dailyRateMultiplier?: number;
  threshold?: PenaltyThreshold;
  gracePeriodMinutes?: number;
  graceOccurrences?: number;
  isProgressive?: boolean;
  progressiveRules?: ProgressivePenaltyRule[];
  applicableDepartments?: string[];
  applicablePositions?: string[];
  applicableEmploymentTypes?: string[];
  autoApply?: boolean;
  requiresApproval?: boolean;
  maxPenaltyPerMonth?: number;
  maxOccurrencesPerMonth?: number;
  effectiveDate?: Date;
  expiryDate?: Date;
  isActive?: boolean;
}

/**
 * Penalty Policy Filters
 */
export interface PenaltyPolicyFilters {
  type?: PenaltyType;
  department?: string;
  position?: string;
  employmentType?: string;
  isActive?: boolean;
}

/**
 * Penalty Calculation Input
 */
export interface PenaltyCalculationInput {
  policyId: string;
  employeeId: string;
  date: Date;
  violationType: PenaltyType;
  minutesLate?: number; // สำหรับ late/early-leave
  occurrenceCount?: number; // ครั้งที่เท่าไหร่ในเดือนนี้
  employeeSalary?: number; // เงินเดือนพนักงาน (สำหรับ percentage)
  hourlyRate?: number; // อัตราต่อชั่วโมง
  dailyRate?: number; // อัตราต่อวัน
}

/**
 * Penalty Calculation Result
 */
export interface PenaltyCalculationResult {
  shouldApply: boolean; // ควรใช้ค่าปรับหรือไม่
  amount: number; // จำนวนเงินที่ปรับ
  reason: string; // เหตุผล
  details: {
    policyCode: string;
    policyName: string;
    calculationType: PenaltyCalculationType;
    threshold: PenaltyThreshold;
    actualViolation: {
      minutes?: number;
      occurrences?: number;
    };
    isWithinGracePeriod: boolean;
    isWithinCap: boolean;
    requiresApproval: boolean;
  };
}

/**
 * Penalty Record
 * บันทึกค่าปรับที่เกิดขึ้นจริง
 */
export interface PenaltyRecord extends BaseEntity {
  employeeId: string;
  employeeName: string;
  policyId: string;
  policyCode: string;
  type: PenaltyType;
  date: Date;
  amount: number;
  reason: string;
  details: string; // JSON string with additional details
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  appliedToPayrollId?: string;
  tenantId: string;
}
