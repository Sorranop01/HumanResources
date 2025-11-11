/**
 * Assign User Role Cloud Function
 * Allows admins to assign roles to users
 */

import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

const db = getFirestore();

interface AssignUserRoleRequest {
  userId: string;
  role: 'admin' | 'hr' | 'manager' | 'employee' | 'auditor';
  expiresAt?: string | undefined;
  reason?: string | undefined;
}

export const assignUserRole = onCall(
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

    // Only admins and HR can assign roles
    if (callerRole !== 'admin' && callerRole !== 'hr') {
      throw new HttpsError('permission-denied', 'Only admins and HR can assign roles');
    }

    // Validate request data
    const data = request.data as AssignUserRoleRequest;

    if (!data.userId || !data.role) {
      throw new HttpsError('invalid-argument', 'userId and role are required');
    }

    // Check if target user exists
    try {
      await getAuth().getUser(data.userId);
    } catch (error: unknown) {
      logger.error('User not found', { error, userId: data.userId });
      throw new HttpsError('not-found', 'Target user not found');
    }

    // Get target user data
    const targetUserDoc = await db.collection('users').doc(data.userId).get();
    const targetUserData = targetUserDoc.data();

    if (!targetUserData) {
      throw new HttpsError('not-found', 'Target user not found in Firestore');
    }

    try {
      // Deactivate existing assignments
      const existingAssignments = await db
        .collection('userRoleAssignments')
        .where('userId', '==', data.userId)
        .where('isActive', '==', true)
        .get();

      const batch = db.batch();

      existingAssignments.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isActive: false,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: callerId,
        });
      });

      // Create new assignment
      const assignmentRef = db.collection('userRoleAssignments').doc();
      batch.set(assignmentRef, {
        id: assignmentRef.id,
        userId: data.userId,
        userEmail: targetUserData.email ?? 'unknown',
        userDisplayName: targetUserData.displayName ?? 'Unknown',
        role: data.role,
        assignedBy: callerId,
        isActive: true,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        reason: data.reason ?? 'Role assigned',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: callerId,
        updatedBy: callerId,
      });

      // Update user's role in users collection
      const userRef = db.collection('users').doc(data.userId);
      batch.update(userRef, {
        role: data.role,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: callerId,
      });

      // Create audit log
      const auditLogRef = db.collection('rbacAuditLogs').doc();
      batch.set(auditLogRef, {
        id: auditLogRef.id,
        action: 'ROLE_ASSIGNED',
        performedBy: callerId,
        performedByEmail: callerEmail,
        targetUserId: data.userId,
        targetUserEmail: targetUserData.email ?? 'unknown',
        role: data.role,
        metadata: {
          reason: data.reason,
          expiresAt: data.expiresAt,
        },
        timestamp: FieldValue.serverTimestamp(),
      });

      await batch.commit();

      logger.info('Role assigned successfully', {
        callerId,
        targetUserId: data.userId,
        role: data.role,
      });

      return {
        success: true,
        message: 'Role assigned successfully',
        data: {
          userId: data.userId,
          role: data.role,
        },
      };
    } catch (error: unknown) {
      logger.error('Failed to assign role', { error });
      throw new HttpsError('internal', 'Failed to assign role');
    }
  }
);
