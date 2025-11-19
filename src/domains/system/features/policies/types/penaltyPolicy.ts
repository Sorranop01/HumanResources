/**
 * Penalty Policy Types
 * Re-exports from schema for type consistency
 */

import type { BaseEntity } from '@/shared/types';
import type {
  PenaltyType,
  PenaltyCalculationType,
  PenaltyThreshold,
  ProgressivePenaltyRule,
} from '../schemas/penaltyPolicySchema';

export type { PenaltyPolicy } from '../schemas/penaltyPolicySchema';

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
