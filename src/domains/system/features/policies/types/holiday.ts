/**
 * Holiday Calendar Types
 * Defines public holidays and special dates for attendance and payroll calculations
 */

import type { BaseEntity } from '@/shared/types';

/**
 * Holiday Type
 */
export type HolidayType =
  | 'national' // วันหยุดประจำชาติ
  | 'regional' // วันหยุดเฉพาะภูมิภาค
  | 'company' // วันหยุดบริษัท
  | 'substitute'; // วันหยุดชดเชย

/**
 * Holiday Work Policy
 * กฎการทำงานในวันหยุด
 */
export type HolidayWorkPolicy =
  | 'no-work' // ไม่อนุญาตให้ทำงาน
  | 'optional' // เลือกทำงานได้
  | 'required' // บังคับทำงาน
  | 'overtime-only'; // ทำงานเป็น OT เท่านั้น

/**
 * Public Holiday
 * วันหยุดนักขัตฤกษ์
 */
export interface PublicHoliday extends BaseEntity {
  name: string;
  nameEn: string;
  description: string;
  date: Date;
  year: number;
  type: HolidayType;

  // Substitute day info
  isSubstituteDay: boolean; // เป็นวันหยุดชดเชยหรือไม่
  originalDate?: Date; // วันที่ต้นฉบับ (ถ้าเป็นวันชดเชย)

  // Work policy
  workPolicy: HolidayWorkPolicy;
  overtimeRate: number; // ถ้าทำงานจะได้อัตรา X เท่า (เช่น 3.0)

  // Location
  locations: string[]; // [] = ทุกพื้นที่, ['Bangkok', 'Chiang Mai'] = เฉพาะพื้นที่
  regions: string[]; // ['central', 'north'] = เฉพาะภูมิภาค

  // Applicable to
  applicableDepartments: string[]; // [] = ทุกแผนก
  applicablePositions: string[]; // [] = ทุกตำแหน่ง

  // Status
  isActive: boolean;

  tenantId: string;
}

/**
 * Company Holiday
 * วันหยุดพิเศษของบริษัท (เช่น วันก่อตั้งบริษัท, วันปิดสำนักงานพิเศษ)
 */
export interface CompanyHoliday extends BaseEntity {
  name: string;
  nameEn: string;
  description: string;
  startDate: Date;
  endDate: Date;
  workPolicy: HolidayWorkPolicy;
  isPaidLeave: boolean; // ได้เงินเดือนหรือไม่

  // Applicable to
  applicableDepartments: string[];
  applicableLocations: string[];

  // Recurring
  isRecurring: boolean; // ซ้ำทุกปีหรือไม่
  recurrencePattern?: {
    frequency: 'yearly' | 'monthly';
    interval: number; // ทุก X ปี/เดือน
  };

  // Status
  isActive: boolean;

  tenantId: string;
}

/**
 * Create Public Holiday Input
 */
export interface CreatePublicHolidayInput {
  name: string;
  nameEn: string;
  description: string;
  date: Date;
  year: number;
  type: HolidayType;
  isSubstituteDay: boolean;
  originalDate?: Date;
  workPolicy: HolidayWorkPolicy;
  overtimeRate: number;
  locations: string[];
  regions: string[];
  applicableDepartments: string[];
  applicablePositions: string[];
}

/**
 * Update Public Holiday Input
 */
export interface UpdatePublicHolidayInput {
  name?: string;
  nameEn?: string;
  description?: string;
  date?: Date;
  type?: HolidayType;
  isSubstituteDay?: boolean;
  originalDate?: Date;
  workPolicy?: HolidayWorkPolicy;
  overtimeRate?: number;
  locations?: string[];
  regions?: string[];
  applicableDepartments?: string[];
  applicablePositions?: string[];
  isActive?: boolean;
}

/**
 * Public Holiday Filters
 */
export interface PublicHolidayFilters {
  year?: number;
  type?: HolidayType;
  location?: string;
  region?: string;
  department?: string;
  isActive?: boolean;
}

/**
 * Holiday Check Result
 */
export interface HolidayCheckResult {
  isHoliday: boolean;
  holiday?: PublicHoliday | CompanyHoliday;
  holidayName?: string;
  workPolicy: HolidayWorkPolicy;
  overtimeRate?: number;
  isPaidLeave: boolean;
}

/**
 * Working Days Calculation Input
 */
export interface WorkingDaysCalculationInput {
  startDate: Date;
  endDate: Date;
  includeWeekends?: boolean;
  location?: string;
  region?: string;
  department?: string;
}

/**
 * Working Days Calculation Result
 */
export interface WorkingDaysCalculationResult {
  totalDays: number;
  workingDays: number;
  weekendDays: number;
  holidays: number;
  holidayDates: Date[];
}
