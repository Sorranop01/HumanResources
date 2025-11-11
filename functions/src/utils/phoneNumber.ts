/**
 * Phone Number Utilities
 * Handle phone number validation and normalization for Thai numbers
 */

/**
 * Normalize Thai phone number to E.164 format
 * Converts: 0812345678 -> +66812345678
 * Keeps: +66812345678 -> +66812345678
 */
export function normalizeThaiPhoneNumber(phoneNumber: string): string {
  // Remove all whitespace and dashes
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // If already in E.164 format, return as-is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If starts with 0 (Thai format), convert to +66
  if (cleaned.startsWith('0')) {
    return `+66${cleaned.substring(1)}`;
  }

  // If starts with 66 (without +), add +
  if (cleaned.startsWith('66')) {
    return `+${cleaned}`;
  }

  // Otherwise, assume it's Thai and add +66
  return `+66${cleaned}`;
}

/**
 * Validate Thai phone number
 * Accepts: 0812345678, 0812345678, +66812345678, 66812345678
 */
export function isValidThaiPhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // Pattern for Thai mobile numbers (starts with 06, 08, 09)
  const thaiMobilePattern = /^(0[689]\d{8}|\+66[689]\d{8}|66[689]\d{8})$/;

  // Pattern for Thai landline (starts with 0[2-5])
  const thaiLandlinePattern = /^(0[2-5]\d{7,8}|\+66[2-5]\d{7,8}|66[2-5]\d{7,8})$/;

  return thaiMobilePattern.test(cleaned) || thaiLandlinePattern.test(cleaned);
}

/**
 * Format phone number for display (Thai format)
 * Converts: +66812345678 -> 081-234-5678
 */
export function formatThaiPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/[\s-+]/g, '');

  // Remove country code if present
  let number = cleaned;
  if (cleaned.startsWith('66')) {
    number = `0${cleaned.substring(2)}`;
  }

  // Format mobile: 0XX-XXX-XXXX
  if (number.length === 10 && number.startsWith('0')) {
    return `${number.slice(0, 3)}-${number.slice(3, 6)}-${number.slice(6)}`;
  }

  // Return as-is if format is unknown
  return phoneNumber;
}

/**
 * Validate and normalize phone number for Firebase Auth
 */
export function preparePhoneNumberForAuth(phoneNumber: string | undefined): string | undefined {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return undefined;
  }

  const trimmed = phoneNumber.trim();

  // Check if it's a valid Thai phone number
  if (isValidThaiPhoneNumber(trimmed)) {
    return normalizeThaiPhoneNumber(trimmed);
  }

  // For other countries, validate E.164 format
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  if (e164Regex.test(trimmed)) {
    return trimmed;
  }

  // Invalid format
  throw new Error(
    'Invalid phone number format. Thai numbers: 0812345678, International: +1234567890'
  );
}
