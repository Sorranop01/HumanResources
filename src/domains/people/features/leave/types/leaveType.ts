/**
 * Leave Type Types
 * Master data for leave types (ประเภทการลา)
 */

import type { BaseEntity } from '@/shared/types';

/**
 * Leave Accrual Type - วิธีการสะสมสิทธิ์
 */
export type LeaveAccrualType = 'yearly' | 'monthly' | 'none';

/**
 * Leave Type Entity
 */
export interface LeaveType extends BaseEntity {
  code: string;
  nameTh: string;
  nameEn: string;
  description?: string;

  // Rules
  requiresApproval: boolean;
  requiresCertificate: boolean;
  certificateRequiredAfterDays: number;
  maxConsecutiveDays: number;
  maxDaysPerYear: number;

  // Calculation
  isPaid: boolean;
  affectsAttendance: boolean;

  // Entitlement
  defaultEntitlement: number;
  accrualType: LeaveAccrualType;
  carryOverAllowed: boolean;
  maxCarryOverDays: number;

  // Display
  color: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  tenantId: string;
}

/**
 * Create Leave Type Input
 */
export interface CreateLeaveTypeInput {
  code: string;
  nameTh: string;
  nameEn: string;
  description?: string;
  requiresApproval?: boolean;
  requiresCertificate?: boolean;
  certificateRequiredAfterDays?: number;
  maxConsecutiveDays?: number;
  maxDaysPerYear?: number;
  isPaid?: boolean;
  affectsAttendance?: boolean;
  defaultEntitlement?: number;
  accrualType?: LeaveAccrualType;
  carryOverAllowed?: boolean;
  maxCarryOverDays?: number;
  color?: string;
  icon?: string;
  sortOrder?: number;
}
