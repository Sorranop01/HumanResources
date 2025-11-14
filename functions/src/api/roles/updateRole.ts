/**
 * Update Role Cloud Function
 * Updates an existing role (only custom roles can be updated, system roles cannot)
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { UpdateRoleSchema } from '../../shared/schemas/roleSchemas.js';
import type { UpdateRoleInput } from '../../shared/types/role.js';

interface UpdateRoleRequest extends UpdateRoleInput {
  roleId: string;
}

export const updateRole = onCall<UpdateRoleRequest>(
  {
    region: 'asia-southeast1',
    cors: true,
  },
  async (request) => {
    const db = getFirestore();
    // 1. Authentication check
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = request.auth.uid;
    const { roleId, ...updateData } = request.data;

    if (!roleId) {
      throw new HttpsError('invalid-argument', 'roleId is required');
    }

    // 2. Authorization check - only admins can update roles
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      logger.warn('Unauthorized role update attempt', { userId, roleId });
      throw new HttpsError('permission-denied', 'Only administrators can update roles');
    }

    // 3. Validate input
    const validation = UpdateRoleSchema.safeParse(updateData);

    if (!validation.success) {
      logger.warn('Invalid role update input', {
        userId,
        roleId,
        errors: validation.error.flatten(),
      });
      throw new HttpsError(
        'invalid-argument',
        `Invalid input: ${validation.error.errors.map((e) => e.message).join(', ')}`
      );
    }

    try {
      // 4. Check if role exists
      const roleRef = db.collection('roleDefinitions').doc(roleId);
      const roleDoc = await roleRef.get();

      if (!roleDoc.exists) {
        throw new HttpsError('not-found', `Role with ID '${roleId}' not found`);
      }

      const roleData = roleDoc.data();

      // 5. Prevent updating system roles
      if (roleData?.isSystemRole === true) {
        throw new HttpsError(
          'failed-precondition',
          'System roles cannot be modified. Only custom roles can be updated.'
        );
      }

      // 6. Update role
      const updatePayload = {
        ...validation.data,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: userId,
      };

      await roleRef.update(updatePayload);

      logger.info('Role updated successfully', {
        roleId,
        updatedBy: userId,
        updates: Object.keys(validation.data),
      });

      // 7. Note: roleName sync to users happens automatically via trigger
      // See: functions/src/triggers/roleDefinitionSyncTrigger.ts

      return {
        success: true,
        roleId,
        message: 'Role updated successfully. User role names will be synced automatically.',
      };
    } catch (error: unknown) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to update role', { error, userId, roleId });
      throw new HttpsError('internal', 'Failed to update role');
    }
  }
);
