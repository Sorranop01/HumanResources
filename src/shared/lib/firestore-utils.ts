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
  if (typeof value === 'object') {
    const seconds =
      'seconds' in value
        ? Number(value.seconds)
        : '_seconds' in value
          ? Number(value._seconds)
          : null;

    const nanoseconds =
      'nanoseconds' in value
        ? Number(value.nanoseconds)
        : '_nanoseconds' in value
          ? Number(value._nanoseconds)
          : null;

    if (seconds !== null && nanoseconds !== null) {
      return new Date(seconds * 1000 + nanoseconds / 1000000);
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
