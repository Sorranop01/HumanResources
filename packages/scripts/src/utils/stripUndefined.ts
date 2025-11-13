/**
 * Strip Undefined Utility
 * Removes undefined values from objects before Firestore writes
 *
 * Required by: @/docs/standards/09-seed-scripts-and-emulator-guide.md
 *
 * Firestore rejects undefined values - this utility ensures safety
 */

/**
 * Recursively removes undefined values from an object
 * @param obj - The object to clean
 * @returns Clean object without undefined values
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'object' && item !== null
        ? stripUndefined(item as Record<string, unknown>)
        : item
    ) as T;
  }

  // Handle objects
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip undefined values
    if (value === undefined) {
      continue;
    }

    // Recursively clean nested objects
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) =>
          typeof item === 'object' && item !== null
            ? stripUndefined(item as Record<string, unknown>)
            : item
        );
      } else {
        cleaned[key] = stripUndefined(value as Record<string, unknown>);
      }
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned as T;
}

/**
 * Converts undefined values to null (alternative approach)
 * Use this when you want explicit null instead of omitting the field
 */
export function undefinedToNull<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const converted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      converted[key] = null;
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = undefinedToNull(value as Record<string, unknown>);
    } else {
      converted[key] = value;
    }
  }

  return converted as T;
}
