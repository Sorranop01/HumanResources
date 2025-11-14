/**
 * Create User Cloud Function
 * Allows admins/HR to create new users with Firebase Auth and Firestore profile
 */

import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { preparePhoneNumberForAuth } from '../../utils/phoneNumber.js';

interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'hr' | 'manager' | 'employee' | 'auditor';
  phoneNumber?: string | undefined;
}

export const createUser = onCall(
  {
    region: 'asia-southeast1',
    enforceAppCheck: false,
    cors: true,
  },
  async (request) => {
    const db = getFirestore();
    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const callerId = request.auth.uid;
    const callerEmail = request.auth.token.email ?? 'unknown';

    // Get caller's role
    const callerDoc = await db.collection('users').doc(callerId).get();
    const callerData = callerDoc.data();

    if (!callerData) {
      throw new HttpsError('not-found', 'Caller user not found');
    }

    const callerRole = callerData.role as string;

    // Only admins and HR can create users
    if (callerRole !== 'admin' && callerRole !== 'hr') {
      throw new HttpsError('permission-denied', 'Only admins and HR can create users');
    }

    // Validate request data
    const data = request.data as CreateUserRequest;

    if (!data.email || !data.password || !data.displayName || !data.role) {
      throw new HttpsError(
        'invalid-argument',
        'email, password, displayName, and role are required'
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new HttpsError('invalid-argument', 'Invalid email format');
    }

    // Validate password length
    if (data.password.length < 6) {
      throw new HttpsError('invalid-argument', 'Password must be at least 6 characters');
    }

    // Validate role
    const validRoles = ['admin', 'hr', 'manager', 'employee', 'auditor'];
    if (!validRoles.includes(data.role)) {
      throw new HttpsError('invalid-argument', 'Invalid role');
    }

    try {
      // Create Firebase Auth user
      const authUserData: {
        email: string;
        password: string;
        displayName: string;
        phoneNumber?: string;
      } = {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      };

      // Validate and normalize phone number (supports Thai format: 0812345678)
      try {
        const normalizedPhone = preparePhoneNumberForAuth(data.phoneNumber);
        if (normalizedPhone) {
          authUserData.phoneNumber = normalizedPhone;
        }
      } catch (phoneError: unknown) {
        const message =
          phoneError instanceof Error ? phoneError.message : 'Invalid phone number format';
        throw new HttpsError('invalid-argument', message);
      }

      const userRecord = await getAuth().createUser(authUserData);

      logger.info('Firebase Auth user created', {
        uid: userRecord.uid,
        email: data.email,
      });

      try {
        // Fetch role definition to get roleId and roleName for denormalization
        let roleId: string | undefined;
        let roleName: string | undefined;

        try {
          const roleQuery = await db
            .collection('roleDefinitions')
            .where('role', '==', data.role)
            .limit(1)
            .get();

          if (!roleQuery.empty) {
            const roleDoc = roleQuery.docs[0];
            if (roleDoc) {
              roleId = roleDoc.id;
              roleName = roleDoc.data().name;

              logger.info('Role definition found', {
                role: data.role,
                roleId,
                roleName,
              });
            }
          } else {
            logger.warn('Role definition not found, using role string only', {
              role: data.role,
            });
          }
        } catch (roleError: unknown) {
          logger.error('Failed to fetch role definition', { error: roleError });
          // Continue without roleId and roleName
        }

        // Create Firestore user profile
        const userRef = db.collection('users').doc(userRecord.uid);
        const userData: Record<string, unknown> = {
          id: userRecord.uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role, // Primary key for logic & security rules
          isActive: true,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          createdBy: callerId,
          updatedBy: callerId,
        };

        // Add denormalized role fields if available
        if (roleId) {
          userData.roleId = roleId; // Foreign key to roleDefinitions
        }
        if (roleName) {
          userData.roleName = roleName; // Denormalized display name
        }

        if (data.phoneNumber) {
          userData.phoneNumber = data.phoneNumber;
        }

        await userRef.set(userData);

        logger.info('Firestore user profile created', {
          uid: userRecord.uid,
          email: data.email,
          role: data.role,
        });

        // Create audit log
        const auditLogRef = db.collection('rbacAuditLogs').doc();
        await auditLogRef.set({
          id: auditLogRef.id,
          action: 'USER_CREATED',
          performedBy: callerId,
          performedByEmail: callerEmail,
          targetUserId: userRecord.uid,
          targetUserEmail: data.email,
          role: data.role,
          metadata: {
            displayName: data.displayName,
            phoneNumber: data.phoneNumber,
          },
          timestamp: FieldValue.serverTimestamp(),
        });

        return {
          success: true,
          message: 'User created successfully',
          data: {
            userId: userRecord.uid,
            email: data.email,
            displayName: data.displayName,
            role: data.role,
          },
        };
      } catch (firestoreError: unknown) {
        // If Firestore creation fails, delete the auth user to maintain consistency
        logger.error('Firestore user creation failed, cleaning up auth user', {
          error: firestoreError,
          uid: userRecord.uid,
        });

        try {
          await getAuth().deleteUser(userRecord.uid);
          logger.info('Auth user cleaned up successfully', {
            uid: userRecord.uid,
          });
        } catch (deleteError: unknown) {
          logger.error('Failed to cleanup auth user', {
            error: deleteError,
            uid: userRecord.uid,
          });
        }

        throw new HttpsError('internal', 'Failed to create user profile');
      }
    } catch (error: unknown) {
      logger.error('Failed to create user', { error });

      // Parse Firebase Auth errors
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        const firebaseError = error as { code: string; message: string };

        if (firebaseError.code === 'auth/email-already-exists') {
          throw new HttpsError('already-exists', 'Email already in use');
        }
        if (firebaseError.code === 'auth/invalid-email') {
          throw new HttpsError('invalid-argument', 'Invalid email format');
        }
        if (firebaseError.code === 'auth/invalid-password') {
          throw new HttpsError('invalid-argument', 'Password must be at least 6 characters');
        }
      }

      // Re-throw if already HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'Failed to create user');
    }
  }
);
