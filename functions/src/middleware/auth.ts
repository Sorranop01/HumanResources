import { HttpsError } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { auth } from '../config/firebase';

/**
 * Verify Firebase Auth token
 */
export async function verifyAuth(request: CallableRequest): Promise<string> {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'กรุณาเข้าสู่ระบบ');
  }

  return request.auth.uid;
}

/**
 * Get user role from custom claims
 */
export async function getUserRole(uid: string): Promise<string> {
  const user = await auth.getUser(uid);
  const customClaims = user.customClaims || {};

  return (customClaims.role as string) || 'employee';
}

/**
 * Check if user has required role
 */
export async function requireRole(uid: string, allowedRoles: string[]): Promise<void> {
  const userRole = await getUserRole(uid);

  if (!allowedRoles.includes(userRole)) {
    throw new HttpsError('permission-denied', 'คุณไม่มีสิทธิ์ในการดำเนินการนี้');
  }
}
