import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';
import { userService } from './userService';
import type { Role } from '@/shared/constants/roles';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  displayName: string;
  phoneNumber?: string | undefined;
  role?: Role | undefined;
}

/**
 * Firebase Auth error codes
 */
export const AUTH_ERROR_CODES = {
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  INVALID_EMAIL: 'auth/invalid-email',
  WEAK_PASSWORD: 'auth/weak-password',
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  NETWORK_REQUEST_FAILED: 'auth/network-request-failed',
} as const;

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;

    switch (code) {
      case AUTH_ERROR_CODES.EMAIL_ALREADY_IN_USE:
        return 'อีเมลนี้ถูกใช้งานแล้ว';
      case AUTH_ERROR_CODES.INVALID_EMAIL:
        return 'รูปแบบอีเมลไม่ถูกต้อง';
      case AUTH_ERROR_CODES.WEAK_PASSWORD:
        return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      case AUTH_ERROR_CODES.USER_NOT_FOUND:
        return 'ไม่พบผู้ใช้นี้ในระบบ';
      case AUTH_ERROR_CODES.WRONG_PASSWORD:
        return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      case AUTH_ERROR_CODES.TOO_MANY_REQUESTS:
        return 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ภายหลัง';
      case AUTH_ERROR_CODES.NETWORK_REQUEST_FAILED:
        return 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย';
      default:
        return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
    }
  }

  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

export const authService = {
  /**
   * Sign in with email and password
   */
  async login(credentials: LoginCredentials): Promise<UserCredential> {
    const { email, password } = credentials;
    return signInWithEmailAndPassword(auth, email, password);
  },

  /**
   * Register new user with Firestore profile
   */
  async register(data: RegisterData): Promise<UserCredential> {
    const { email, password, displayName, phoneNumber, role } = data;

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Update Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName,
      });

      // 3. Create Firestore user profile
      await userService.createUserProfile({
        id: userCredential.user.uid,
        email,
        displayName,
        phoneNumber,
        role,
      });

      return userCredential;
    } catch (error: unknown) {
      // If Firestore creation fails, we should probably delete the auth user
      // For now, we'll just rethrow the error
      throw error;
    }
  },

  /**
   * Sign out
   */
  async logout(): Promise<void> {
    return signOut(auth);
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  },

  /**
   * Get current user ID token
   */
  async getIdToken(): Promise<string | undefined> {
    const user = auth.currentUser;
    return user?.getIdToken();
  },
};
