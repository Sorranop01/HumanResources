/**
 * Firestore document types for auth feature
 * These types represent the actual document structure in Firestore
 */

import type { Timestamp } from 'firebase/firestore';
import type { Role } from '@/shared/constants/roles';

/**
 * User document in Firestore (with Timestamp)
 * Path: /users/{userId}
 */
export interface UserFirestoreDocument {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  phoneNumber?: string | undefined;
  photoURL?: string | undefined;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * User session document in Firestore
 * Path: /userSessions/{sessionId}
 */
export interface UserSessionDocument {
  sessionId: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
  };
  ipAddress: string;
  loginAt: Timestamp;
  lastActivityAt: Timestamp;
  expiresAt: Timestamp;
  isActive: boolean;
}

/**
 * Password reset token document in Firestore
 * Path: /passwordResetTokens/{tokenId}
 */
export interface PasswordResetTokenDocument {
  tokenId: string;
  userId: string;
  email: string;
  token: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  used: boolean;
}

/**
 * User activity log document (optional)
 * Path: /userActivityLogs/{logId}
 */
export interface UserActivityLogDocument {
  logId: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'ROLE_CHANGE';
  metadata?: Record<string, unknown> | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  timestamp: Timestamp;
}

/**
 * Helper type for converting Firestore Timestamp to Date
 */
export type WithDates<T> = {
  [K in keyof T]: T[K] extends Timestamp ? Date : T[K];
};

/**
 * User document with Date instead of Timestamp (for app usage)
 */
export type UserDocument = WithDates<UserFirestoreDocument>;
