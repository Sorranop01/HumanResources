/**
 * Delete Role Cloud Function
 * Deletes a custom role (system roles cannot be deleted)
 * Prevents deletion if any users are assigned to this role
 */

import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

const db = getFirestore();

interface DeleteRoleRequest {
  roleId: string;
}

export const deleteRole = onCall<DeleteRoleRequest>(
  {
    region: 'asia-southeast1',
    cors: true,
  },
  async (request) => {
    // 1. Authentication check
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = request.auth.uid;
    const { roleId } = request.data;

    if (!roleId) {
      throw new HttpsError('invalid-argument', 'roleId is required');
    }

    // 2. Authorization check - only admins can delete roles
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      logger.warn('Unauthorized role deletion attempt', { userId, roleId });
      throw new HttpsError('permission-denied', 'Only administrators can delete roles');
    }

    try {
      // 3. Check if role exists
      const roleRef = db.collection('roleDefinitions').doc(roleId);
      const roleDoc = await roleRef.get();

      if (!roleDoc.exists) {
        throw new HttpsError('not-found', `Role with ID '${roleId}' not found`);
      }

      const roleData = roleDoc.data();

      if (!roleData) {
        throw new HttpsError('not-found', `Role data not found for ID '${roleId}'`);
      }

      // 4. Prevent deleting system roles
      if (roleData.isSystemRole === true) {
        throw new HttpsError(
          'failed-precondition',
          'System roles cannot be deleted. Only custom roles can be removed.'
        );
      }

      // 5. Check if any users are assigned to this role
      const usersWithRoleQuery = await db
        .collection('users')
        .where('roleId', '==', roleId)
        .limit(1)
        .get();

      if (!usersWithRoleQuery.empty) {
        const userCount = await db.collection('users').where('roleId', '==', roleId).count().get();

        throw new HttpsError(
          'failed-precondition',
          `Cannot delete role '${roleData.name}' because ${userCount.data().count} user(s) are assigned to it. Please reassign these users to another role first.`
        );
      }

      // 6. Delete role
      await roleRef.delete();

      logger.info('Role deleted successfully', {
        roleId,
        roleName: roleData.name,
        deletedBy: userId,
      });

      return {
        success: true,
        roleId,
        message: `Role '${roleData.name}' deleted successfully`,
      };
    } catch (error: unknown) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to delete role', { error, userId, roleId });
      throw new HttpsError('internal', 'Failed to delete role');
    }
  }
);
