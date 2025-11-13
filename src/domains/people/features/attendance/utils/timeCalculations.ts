/**
 * Time Calculation Utilities for Attendance
 * Functions for calculating late arrivals, early leaves, and time differences
 */

import type { Timestamp } from 'firebase/firestore';
import type { TimeValidationResult } from '@/domains/system/features/policies/types/workSchedulePolicy';

/**
 * Parse time string (HH:mm) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr ?? '0');
  const minutes = Number(minutesStr ?? '0');
  return hours * 60 + minutes;
}

/**
 * Convert Timestamp to HH:mm format
 */
export function timestampToTimeString(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  const hours = (date.getHours() ?? 0).toString().padStart(2, '0');
  const minutes = (date.getMinutes() ?? 0).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Convert HH:mm string to Date object for today
 */
export function timeStringToDate(timeStr: string): Date {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = Number(hoursStr ?? '0');
  const minutes = Number(minutesStr ?? '0');
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Calculate time difference in minutes between two time strings (HH:mm)
 * Positive if time1 is after time2
 */
export function calculateTimeDifferenceMinutes(time1: string, time2: string): number {
  const minutes1 = timeToMinutes(time1);
  const minutes2 = timeToMinutes(time2);
  return minutes1 - minutes2;
}

/**
 * Calculate late minutes for clock-in
 * @param clockInTime Actual clock-in timestamp
 * @param scheduledStartTime Scheduled start time (HH:mm)
 * @param gracePeriodMinutes Grace period in minutes
 * @returns Number of minutes late (0 if on time or early)
 */
export function calculateLateMinutes(
  clockInTime: Timestamp,
  scheduledStartTime: string,
  gracePeriodMinutes: number = 0
): number {
  const actualTime = timestampToTimeString(clockInTime);
  const actualMinutes = timeToMinutes(actualTime);
  const scheduledMinutes = timeToMinutes(scheduledStartTime);

  const lateMinutes = actualMinutes - scheduledMinutes - gracePeriodMinutes;
  return Math.max(0, lateMinutes);
}

/**
 * Calculate early leave minutes for clock-out
 * @param clockOutTime Actual clock-out timestamp
 * @param scheduledEndTime Scheduled end time (HH:mm)
 * @param gracePeriodMinutes Grace period in minutes
 * @returns Number of minutes early (0 if on time or later)
 */
export function calculateEarlyMinutes(
  clockOutTime: Timestamp,
  scheduledEndTime: string,
  gracePeriodMinutes: number = 0
): number {
  const actualTime = timestampToTimeString(clockOutTime);
  const actualMinutes = timeToMinutes(actualTime);
  const scheduledMinutes = timeToMinutes(scheduledEndTime);

  const earlyMinutes = scheduledMinutes - actualMinutes - gracePeriodMinutes;
  return Math.max(0, earlyMinutes);
}

/**
 * Check if clock-in time is within flexible time range
 */
export function isWithinFlexibleRange(
  clockInTime: Timestamp,
  flexibleRange: { earliest: string; latest: string }
): boolean {
  const actualTime = timestampToTimeString(clockInTime);
  const actualMinutes = timeToMinutes(actualTime);
  const earliestMinutes = timeToMinutes(flexibleRange.earliest);
  const latestMinutes = timeToMinutes(flexibleRange.latest);

  return actualMinutes >= earliestMinutes && actualMinutes <= latestMinutes;
}

/**
 * Validate clock-in time against work schedule
 */
export function validateClockInTime(
  clockInTime: Timestamp,
  scheduledStartTime: string,
  lateThresholdMinutes: number,
  gracePeriodMinutes: number,
  allowFlexibleTime: boolean = false,
  flexibleRange?: { earliest: string; latest: string }
): TimeValidationResult {
  const minutesLate = calculateLateMinutes(clockInTime, scheduledStartTime, gracePeriodMinutes);

  // Check flexible time first
  if (allowFlexibleTime && flexibleRange) {
    const withinFlexible = isWithinFlexibleRange(clockInTime, flexibleRange);
    if (withinFlexible) {
      return {
        isValid: true,
        isLate: false,
        minutesLate: 0,
        isWithinFlexibleRange: true,
        message: 'Clock-in within flexible time range',
      };
    }
  }

  // Check if late
  const isLate = minutesLate > 0 && minutesLate >= lateThresholdMinutes;

  return {
    isValid: !isLate,
    isLate,
    minutesLate,
    isWithinFlexibleRange: false,
    message: isLate ? `Late by ${minutesLate} minutes` : 'On time',
  };
}

/**
 * Validate clock-out time against work schedule
 */
export function validateClockOutTime(
  clockOutTime: Timestamp,
  scheduledEndTime: string,
  earlyLeaveThresholdMinutes: number,
  gracePeriodMinutes: number
): TimeValidationResult {
  const minutesEarly = calculateEarlyMinutes(clockOutTime, scheduledEndTime, gracePeriodMinutes);

  const isEarlyLeave = minutesEarly > 0 && minutesEarly >= earlyLeaveThresholdMinutes;

  return {
    isValid: !isEarlyLeave,
    isEarlyLeave,
    minutesEarly,
    message: isEarlyLeave ? `Early leave by ${minutesEarly} minutes` : 'On time',
  };
}

/**
 * Calculate work duration in hours excluding breaks
 */
export function calculateWorkDuration(
  clockInTime: Timestamp,
  clockOutTime: Timestamp,
  totalBreakMinutes: number = 0
): number {
  const durationMilliseconds = clockOutTime.toMillis() - clockInTime.toMillis();
  const durationMinutes = durationMilliseconds / (1000 * 60);
  const workMinutes = durationMinutes - totalBreakMinutes;
  const workHours = workMinutes / 60;

  return Number.parseFloat(workHours.toFixed(2));
}

/**
 * Calculate overtime hours
 */
export function calculateOvertimeHours(
  actualWorkHours: number,
  standardHoursPerDay: number,
  overtimeStartsAfterMinutes: number = 0
): number {
  const overtimeThreshold = standardHoursPerDay + overtimeStartsAfterMinutes / 60;
  const overtime = Math.max(0, actualWorkHours - overtimeThreshold);

  return Number.parseFloat(overtime.toFixed(2));
}

/**
 * Format minutes to hours and minutes string (e.g., "1h 30m")
 */
export function formatMinutesToDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} นาที`;
  }
  if (mins === 0) {
    return `${hours} ชั่วโมง`;
  }
  return `${hours} ชั่วโมง ${mins} นาที`;
}
