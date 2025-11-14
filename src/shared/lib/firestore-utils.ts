/**
 * Firestore Utility Functions
 * Helpers for working with Firestore data types
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Safely convert a Firestore Timestamp to Date
 * Handles cases where the value might already be a Date or undefined
 */
export function toDate(value: Timestamp | Date | undefined | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  // Already a Date object
  if (value instanceof Date) {
    return value;
  }

  // Firestore Timestamp with toDate method
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  // Fallback: try to parse as date if it's a timestamp-like object
  // Handle both firebase-admin format (_seconds/_nanoseconds) and client format (seconds/nanoseconds)
  if (typeof value === 'object' && value !== null) {
    // Type guard for Admin SDK format
    if ('_seconds' in value && typeof (value as { _seconds: unknown })._seconds === 'number') {
      const { _seconds, _nanoseconds } = value as { _seconds: number; _nanoseconds?: number };
      return new Date(_seconds * 1000 + (_nanoseconds ?? 0) / 1000000);
    }

    // Type guard for Client SDK format
    if ('seconds' in value && typeof (value as { seconds: unknown }).seconds === 'number') {
      const { seconds, nanoseconds } = value as { seconds: number; nanoseconds?: number };
      return new Date(seconds * 1000 + (nanoseconds ?? 0) / 1000000);
    }
  }

  console.warn('Unable to convert value to Date:', value);
  return undefined;
}

/**
 * Safely convert a Firestore Timestamp to Date (required version)
 * Throws an error if the value cannot be converted
 */
export function toDateRequired(
  value: Timestamp | Date | undefined | null,
  fieldName?: string
): Date {
  const result = toDate(value);

  if (!result) {
    throw new Error(
      `Required timestamp field ${fieldName ? `"${fieldName}"` : ''} is missing or invalid`
    );
  }

  return result;
}
