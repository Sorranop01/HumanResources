/**
 * Work Schedule Policy Types
 * Re-exports from schema for type consistency
 */

export type { WorkSchedulePolicy } from '../schemas/workSchedulePolicySchema';

export interface FlexibleTimeRange {
  earliest: string;
  latest: string;
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
