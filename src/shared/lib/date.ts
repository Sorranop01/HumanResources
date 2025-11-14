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
 * Convert Firestore Timestamp to Date
 */
function toDate(value: Date | Timestamp): Date {
  if (value instanceof Date) {
    return value;
  }
  return value.toDate();
}

/**
 * Format date to Thai date format
 */
export function formatThaiDate(date: Date | Dayjs | string | Timestamp): string {
  const dateValue = typeof date === 'object' && 'toDate' in date ? toDate(date) : date;
  return dayjs(dateValue).locale('th').format('DD/MM/YYYY');
}

/**
 * Format date to Thai datetime format
 */
export function formatThaiDateTime(date: Date | Dayjs | string | Timestamp): string {
  const dateValue = typeof date === 'object' && 'toDate' in date ? toDate(date) : date;
  return dayjs(dateValue).locale('th').format('DD/MM/YYYY HH:mm');
}

/**
 * Format date to ISO format
 */
export function formatISO(date: Date | Dayjs | string): string {
  return dayjs(date).toISOString();
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | Dayjs | string): string {
  return dayjs(date).locale('th').fromNow();
}

/**
 * Check if date is today
 */
export function isToday(date: Date | Dayjs | string): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * Get start of day
 */
export function startOfDay(date?: Date | Dayjs | string): Dayjs {
  return dayjs(date).startOf('day');
}

/**
 * Get end of day
 */
export function endOfDay(date?: Date | Dayjs | string): Dayjs {
  return dayjs(date).endOf('day');
}

/**
 * Add days to date
 */
export function addDays(date: Date | Dayjs | string, days: number): Dayjs {
  return dayjs(date).add(days, 'day');
}

/**
 * Subtract days from date
 */
export function subtractDays(date: Date | Dayjs | string, days: number): Dayjs {
  return dayjs(date).subtract(days, 'day');
}

// Re-export dayjs for advanced usage
export { dayjs };
