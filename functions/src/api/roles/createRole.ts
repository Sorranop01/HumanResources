/**
 * Create Role Cloud Function
 * Creates a new custom role (only admins can create roles)
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CreateRoleSchema } from '../../shared/schemas/roleSchemas.js';
import type { CreateRoleInput } from '../../shared/types/role.js';

export const createRole = onCall<CreateRoleInput>(
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

    // 2. Authorization check - only admins can create roles
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      logger.warn('Unauthorized role creation attempt', { userId });
      throw new HttpsError('permission-denied', 'Only administrators can create roles');
    }

    // 3. Validate input
    const validation = CreateRoleSchema.safeParse(request.data);

    if (!validation.success) {
      logger.warn('Invalid role creation input', {
        userId,
        errors: validation.error.flatten(),
      });
      throw new HttpsError(
        'invalid-argument',
        `Invalid input: ${validation.error.errors.map((e) => e.message).join(', ')}`
      );
    }

    const { role, name, description } = validation.data;

    try {
      // 4. Check if role key already exists
      const existingRoleQuery = await db
        .collection('roleDefinitions')
        .where('role', '==', role)
        .limit(1)
        .get();

      if (!existingRoleQuery.empty) {
        throw new HttpsError('already-exists', `Role with key '${role}' already exists`);
      }

      // 5. Create role document
      const roleRef = db.collection('roleDefinitions').doc();
      const roleId = roleRef.id;

      const roleData = {
        id: roleId,
        role,
        name,
        description,
        isSystemRole: false, // Custom roles are never system roles
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: userId,
        updatedBy: userId,
      };

      await roleRef.set(roleData);

      logger.info('Role created successfully', {
        roleId,
        role,
        name,
        createdBy: userId,
      });

      const now = new Date().toISOString();

      return {
        success: true,
        roleId,
        role: {
          id: roleId,
          role,
          name,
          description,
          isSystemRole: false,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      };
    } catch (error: unknown) {
      // Re-throw HttpsError as-is
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to create role', { error, userId, role });
      throw new HttpsError('internal', 'Failed to create role');
    }
  }
);
