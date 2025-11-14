/**
 * List Roles Cloud Function
 * Returns all role definitions (system + custom)
 */

import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

interface ListRolesRequest {
  includeInactive?: boolean;
  systemOnly?: boolean;
  customOnly?: boolean;
}

export const listRoles = onCall<ListRolesRequest>(
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
    const { includeInactive = false, systemOnly = false, customOnly = false } = request.data || {};

    try {
      // 2. Build query
      let query: FirebaseFirestore.Query = db.collection('roleDefinitions');

      // Filter by active status
      if (!includeInactive) {
        query = query.where('isActive', '==', true);
      }

      // Filter by system/custom
      if (systemOnly) {
        query = query.where('isSystemRole', '==', true);
      } else if (customOnly) {
        query = query.where('isSystemRole', '==', false);
      }

      // Order by creation time
      const snapshot = await query.orderBy('createdAt', 'asc').get();

      // 3. Map results and convert Timestamps to ISO strings
      const roles = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role,
          name: data.name,
          description: data.description,
          isSystemRole: data.isSystemRole,
          isActive: data.isActive,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });

      logger.info('Roles listed successfully', {
        userId,
        count: roles.length,
        filters: { includeInactive, systemOnly, customOnly },
      });

      return {
        success: true,
        roles,
        count: roles.length,
      };
    } catch (error: unknown) {
      logger.error('Failed to list roles', { error, userId });
      throw new HttpsError('internal', 'Failed to list roles');
    }
  }
);
