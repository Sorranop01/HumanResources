import { HttpsError, type FunctionsErrorCode } from 'firebase-functions/v2/https';

/**
 * Helper functions for creating HttpsError instances
 */

export function createHttpsError(
  code: FunctionsErrorCode,
  message: string,
  details?: unknown
): HttpsError {
  return new HttpsError(code, message, details);
}

export function createUnauthenticatedError(message = 'กรุณาเข้าสู่ระบบ'): HttpsError {
  return createHttpsError('unauthenticated', message);
}

export function createPermissionDeniedError(
  message = 'คุณไม่มีสิทธิ์ในการดำเนินการนี้'
): HttpsError {
  return createHttpsError('permission-denied', message);
}

export function createNotFoundError(message = 'ไม่พบข้อมูล'): HttpsError {
  return createHttpsError('not-found', message);
}

export function createInvalidArgumentError(message = 'ข้อมูลไม่ถูกต้อง'): HttpsError {
  return createHttpsError('invalid-argument', message);
}

export function createInternalError(message = 'เกิดข้อผิดพลาดภายในระบบ'): HttpsError {
  return createHttpsError('internal', message);
}
