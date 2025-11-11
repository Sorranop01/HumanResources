/**
 * Revoke User Role Cloud Function
 * Allows admins to revoke roles from users
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

const db = getFirestore();

interface RevokeUserRoleRequest {
  userId: string;
  reason?: string | undefined;
}

export const revokeUserRole = onCall(
  { region: 'asia-southeast1', enforceAppCheck: false },
  async (request) => {
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

    // Only admins can revoke roles
    if (callerRole !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admins can revoke roles');
    }

    // Validate request data
    const data = request.data as RevokeUserRoleRequest;

    if (!data.userId) {
      throw new HttpsError('invalid-argument', 'userId is required');
    }

    // Get target user data
    const targetUserDoc = await db.collection('users').doc(data.userId).get();
    const targetUserData = targetUserDoc.data();

    if (!targetUserData) {
      throw new HttpsError('not-found', 'Target user not found');
    }

    try {
      // Deactivate all active assignments
      const existingAssignments = await db
        .collection('userRoleAssignments')
        .where('userId', '==', data.userId)
        .where('isActive', '==', true)
        .get();

      if (existingAssignments.empty) {
        throw new HttpsError('not-found', 'No active role assignment found for user');
      }

      const batch = db.batch();

      const previousRole = existingAssignments.docs[0]?.data().role as string;

      existingAssignments.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isActive: false,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: callerId,
          reason: data.reason ?? 'Role revoked',
        });
      });

      // Update user's role to employee (default)
      const userRef = db.collection('users').doc(data.userId);
      batch.update(userRef, {
        role: 'employee',
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: callerId,
      });

      // Create audit log
      const auditLogRef = db.collection('rbacAuditLogs').doc();
      batch.set(auditLogRef, {
        id: auditLogRef.id,
        action: 'ROLE_REVOKED',
        performedBy: callerId,
        performedByEmail: callerEmail,
        targetUserId: data.userId,
        targetUserEmail: targetUserData.email ?? 'unknown',
        role: previousRole,
        metadata: {
          reason: data.reason,
        },
        timestamp: FieldValue.serverTimestamp(),
      });

      await batch.commit();

      logger.info('Role revoked successfully', {
        callerId,
        targetUserId: data.userId,
      });

      return {
        success: true,
        message: 'Role revoked successfully',
        data: {
          userId: data.userId,
        },
      };
    } catch (error: unknown) {
      logger.error('Failed to revoke role', { error });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'Failed to revoke role');
    }
  }
);
