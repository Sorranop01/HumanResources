/**
 * Shift Management Types
 * Re-exports from schema for type consistency
 */

import type { BaseEntity } from '@/shared/types';
import type { Shift, ShiftBreak, ShiftRotationPattern } from '../schemas/shiftSchema';

export type { Shift } from '../schemas/shiftSchema';

/**
 * Shift Assignment
 * Assigns an employee to a specific shift
 */
export interface ShiftAssignment extends BaseEntity {
  employeeId: string;
  employeeName: string; // Denormalized for quick access
  shiftId: string;
  shiftCode: string; // Denormalized

  // Assignment period
  startDate: Date;
  endDate?: Date; // null = permanent assignment

  // Working days
  workDays: number[]; // [1,2,3,4,5] for Mon-Fri

  // Rotation (optional)
  rotationPattern?: ShiftRotationPattern;

  // Override
  isPermanent: boolean; // true = fixed, false = temporary or rotational
  isRotational: boolean;

  // Status
  isActive: boolean;
  notes?: string;

  // Assigned by
  assignedBy: string;
  assignedAt: Date;

  tenantId: string;
}

/**
 * Shift Override
 * Temporary shift change for specific dates
 */
export interface ShiftOverride extends BaseEntity {
  employeeId: string;
  employeeName: string;
  originalShiftId: string;
  newShiftId: string;
  date: Date;
  reason: string;
  approvedBy?: string;
  approvedAt?: Date;
  tenantId: string;
}

/**
 * Create Shift Input
 */
export interface CreateShiftInput {
  name: string;
  nameEn: string;
  description: string;
  code: string;
  startTime: string;
  endTime: string;
  breaks: ShiftBreak[];
  workHours: number;
  grossHours: number;
  premiumRate: number;
  nightShiftBonus: number;
  applicableDays: number[];
  color?: string;
  effectiveDate: Date;
  expiryDate?: Date;
}

/**
 * Update Shift Input
 */
export interface UpdateShiftInput {
  name?: string;
  nameEn?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  breaks?: ShiftBreak[];
  workHours?: number;
  grossHours?: number;
  premiumRate?: number;
  nightShiftBonus?: number;
  applicableDays?: number[];
  color?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
  isActive?: boolean;
}

/**
 * Create Shift Assignment Input
 */
export interface CreateShiftAssignmentInput {
  employeeId: string;
  employeeName: string;
  shiftId: string;
  shiftCode: string;
  startDate: Date;
  endDate?: Date;
  workDays: number[];
  rotationPattern?: ShiftRotationPattern;
  isPermanent: boolean;
  isRotational: boolean;
  notes?: string;
  assignedBy: string;
}

/**
 * Update Shift Assignment Input
 */
export interface UpdateShiftAssignmentInput {
  shiftId?: string;
  shiftCode?: string;
  startDate?: Date;
  endDate?: Date;
  workDays?: number[];
  rotationPattern?: ShiftRotationPattern;
  isPermanent?: boolean;
  isRotational?: boolean;
  notes?: string;
  isActive?: boolean;
}

/**
 * Shift Filters
 */
export interface ShiftFilters {
  code?: string;
  isActive?: boolean;
  effectiveDate?: Date;
}

/**
 * Shift Assignment Filters
 */
export interface ShiftAssignmentFilters {
  employeeId?: string;
  shiftId?: string;
  isActive?: boolean;
  isPermanent?: boolean;
  isRotational?: boolean;
}

/**
 * Current Shift Info (for a specific date)
 */
export interface CurrentShiftInfo {
  shift: Shift;
  assignment: ShiftAssignment;
  isOverride: boolean;
  override?: ShiftOverride;
  effectiveStartTime: string;
  effectiveEndTime: string;
}
