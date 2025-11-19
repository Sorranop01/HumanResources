import dayjs, { type Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import type { Timestamp } from 'firebase/firestore';
import 'dayjs/locale/th';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone
dayjs.tz.setDefault('Asia/Bangkok');

/**
 * Shared date input type that supports JS Date, Firestore Timestamp,
 * ISO strings, epoch numbers, and Dayjs instances.
 */
export type DateInput = Date | Dayjs | string | number | Timestamp | null | undefined;

/**
 * Convert supported date inputs to native Date instances.
 */
export function toDateValue(value: DateInput): Date | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (dayjs.isDayjs(value)) {
    return value.toDate();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.toDate() : null;
  }
  return null;
}

/**
 * Format generic date values with optional format string.
 */
export function formatDate(value: DateInput, format = 'DD/MM/YYYY'): string {
  const dateValue = toDateValue(value);
  return dateValue ? dayjs(dateValue).format(format) : '-';
}

/**
 * Format generic date-time values with optional format string.
 */
export function formatDateTime(value: DateInput, format = 'DD/MM/YYYY HH:mm'): string {
  const dateValue = toDateValue(value);
  return dateValue ? dayjs(dateValue).format(format) : '-';
}

/**
 * Format date to Thai date format
 */
export function formatThaiDate(date: DateInput): string {
  const dateValue = toDateValue(date);
  return dateValue ? dayjs(dateValue).locale('th').format('DD/MM/YYYY') : '-';
}

/**
 * Format date to Thai datetime format
 */
export function formatThaiDateTime(date: DateInput): string {
  const dateValue = toDateValue(date);
  return dateValue ? dayjs(dateValue).locale('th').format('DD/MM/YYYY HH:mm') : '-';
}

/**
 * Format date to ISO format
 */
export function formatISO(date: DateInput): string {
  const dateValue = toDateValue(date);
  return dateValue ? dayjs(dateValue).toISOString() : '';
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: DateInput): string {
  const dateValue = toDateValue(date);
  return dateValue ? dayjs(dateValue).locale('th').fromNow() : '-';
}

/**
 * Check if date is today
 */
export function isToday(date: DateInput): boolean {
  const dateValue = toDateValue(date);
  return dateValue ? dayjs(dateValue).isSame(dayjs(), 'day') : false;
}

/**
 * Get start of day
 */
export function startOfDay(date?: DateInput): Dayjs {
  const dateValue = toDateValue(date ?? new Date()) ?? new Date();
  return dayjs(dateValue).startOf('day');
}

/**
 * Get end of day
 */
export function endOfDay(date?: DateInput): Dayjs {
  const dateValue = toDateValue(date ?? new Date()) ?? new Date();
  return dayjs(dateValue).endOf('day');
}

/**
 * Add days to date
 */
export function addDays(date: DateInput, days: number): Dayjs {
  const dateValue = toDateValue(date ?? new Date()) ?? new Date();
  return dayjs(dateValue).add(days, 'day');
}

/**
 * Subtract days from date
 */
export function subtractDays(date: DateInput, days: number): Dayjs {
  const dateValue = toDateValue(date ?? new Date()) ?? new Date();
  return dayjs(dateValue).subtract(days, 'day');
}

// Re-export dayjs for advanced usage
export { dayjs };
