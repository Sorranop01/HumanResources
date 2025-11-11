/**
 * Work Schedule Policy Types
 * Defines working hours, days, and time rules
 */

import type { BaseEntity } from '@/shared/types';

/**
 * Flexible time range configuration
 */
export interface FlexibleTimeRange {
  earliest: string; // HH:mm format (e.g., "08:00")
  latest: string; // HH:mm format (e.g., "10:00")
}

/**
 * Work Schedule Policy
 * Defines standard working hours and rules for a department/company
 */
export interface WorkSchedulePolicy extends BaseEntity {
  name: string;
  nameEn: string;
  description: string;
  code: string; // STANDARD, FLEXIBLE, SHIFT, etc.

  // Standard working hours
  hoursPerDay: number; // 8.0
  hoursPerWeek: number; // 40.0
  daysPerWeek: number; // 5

  // Working days (0=Sunday, 1=Monday, ..., 6=Saturday)
  workingDays: number[]; // [1, 2, 3, 4, 5] = Mon-Fri

  // Time configuration
  standardStartTime: string; // HH:mm format (e.g., "09:00")
  standardEndTime: string; // HH:mm format (e.g., "18:00")
  breakDuration: number; // minutes (e.g., 60)

  // Late/Early rules
  lateThresholdMinutes: number; // มาสายถ้า > X นาที (e.g., 15)
  earlyLeaveThresholdMinutes: number; // กลับก่อนเวลาถ้า > X นาที (e.g., 15)
  gracePeriodMinutes: number; // ช่วงเวลาผ่อนผัน (e.g., 5)

  // Flexible time (optional)
  allowFlexibleTime: boolean;
  flexibleStartTimeRange?: FlexibleTimeRange;
  flexibleEndTimeRange?: FlexibleTimeRange;

  // Overtime rules
  overtimeStartsAfter: number; // นาทีหลังเวลาเลิกงาน (e.g., 0 = ทันที, 30 = หลังจาก 30 นาที)
  maxOvertimeHoursPerDay: number; // สูงสุด OT/วัน (e.g., 4.0)

  // Applicable to
  applicableDepartments: string[]; // ['Engineering', 'HR']
  applicablePositions: string[]; // ['Staff', 'Senior Staff']
  applicableEmploymentTypes: string[]; // ['permanent', 'contract']

  // Status
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;

  tenantId: string;
}

/**
 * Create Work Schedule Policy Input
 */
export interface CreateWorkSchedulePolicyInput {
  name: string;
  nameEn: string;
  description: string;
  code: string;
  hoursPerDay: number;
  hoursPerWeek: number;
  daysPerWeek: number;
  workingDays: number[];
  standardStartTime: string;
  standardEndTime: string;
  breakDuration: number;
  lateThresholdMinutes: number;
  earlyLeaveThresholdMinutes: number;
  gracePeriodMinutes: number;
  allowFlexibleTime: boolean;
  flexibleStartTimeRange?: FlexibleTimeRange;
  flexibleEndTimeRange?: FlexibleTimeRange;
  overtimeStartsAfter: number;
  maxOvertimeHoursPerDay: number;
  applicableDepartments: string[];
  applicablePositions: string[];
  applicableEmploymentTypes: string[];
  effectiveDate: Date;
  expiryDate?: Date;
}

/**
 * Update Work Schedule Policy Input
 */
export interface UpdateWorkSchedulePolicyInput {
  name?: string;
  nameEn?: string;
  description?: string;
  hoursPerDay?: number;
  hoursPerWeek?: number;
  daysPerWeek?: number;
  workingDays?: number[];
  standardStartTime?: string;
  standardEndTime?: string;
  breakDuration?: number;
  lateThresholdMinutes?: number;
  earlyLeaveThresholdMinutes?: number;
  gracePeriodMinutes?: number;
  allowFlexibleTime?: boolean;
  flexibleStartTimeRange?: FlexibleTimeRange;
  flexibleEndTimeRange?: FlexibleTimeRange;
  overtimeStartsAfter?: number;
  maxOvertimeHoursPerDay?: number;
  applicableDepartments?: string[];
  applicablePositions?: string[];
  applicableEmploymentTypes?: string[];
  effectiveDate?: Date;
  expiryDate?: Date;
  isActive?: boolean;
}

/**
 * Work Schedule Policy Filters
 */
export interface WorkSchedulePolicyFilters {
  department?: string;
  position?: string;
  employmentType?: string;
  isActive?: boolean;
}

/**
 * Time validation result
 */
export interface TimeValidationResult {
  isValid: boolean;
  isLate?: boolean;
  isEarlyLeave?: boolean;
  minutesLate?: number;
  minutesEarly?: number;
  isWithinFlexibleRange?: boolean;
  message?: string;
}
