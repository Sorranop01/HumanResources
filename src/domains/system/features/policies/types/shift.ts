/**
 * Shift Management Types
 * Defines shift schedules, assignments, and rotation patterns
 */

import type { BaseEntity } from '@/shared/types';

/**
 * Shift Break
 */
export interface ShiftBreak {
  name: string;
  nameEn: string;
  startTime: string; // HH:mm format
  duration: number; // minutes
}

/**
 * Shift Rotation Type
 */
export type ShiftRotationType = 'fixed' | 'weekly' | 'bi-weekly' | 'monthly' | 'custom';

/**
 * Shift Rotation Pattern
 */
export interface ShiftRotationPattern {
  type: ShiftRotationType;
  sequence: string[]; // Array of shift codes ["MORNING", "AFTERNOON", "NIGHT"]
  cycleDays: number; // Total days in one cycle (e.g., 21 for 3-week rotation)
  startDate: Date;
}

/**
 * Shift
 * Defines a work shift (e.g., Morning, Afternoon, Night)
 */
export interface Shift extends BaseEntity {
  name: string;
  nameEn: string;
  description: string;
  code: string; // MORNING, AFTERNOON, NIGHT, etc.

  // Time configuration
  startTime: string; // HH:mm format (e.g., "06:00")
  endTime: string; // HH:mm format (e.g., "14:00")
  breaks: ShiftBreak[];

  // Hours
  workHours: number; // Net working hours (excluding breaks)
  grossHours: number; // Total hours (including breaks)

  // Premium
  premiumRate: number; // Additional rate (0 = no premium, 0.15 = +15%)
  nightShiftBonus: number; // Fixed bonus for night shift

  // Applicable days
  applicableDays: number[]; // [0,1,2,3,4,5,6] where 0=Sunday

  // Color for UI
  color?: string; // Hex color for calendar display

  // Status
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;

  tenantId: string;
}

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
