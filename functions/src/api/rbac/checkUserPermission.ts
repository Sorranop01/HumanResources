/**
 * Check User Permission Cloud Function
 * Validates if a user has a specific permission on a resource
 */

import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

interface CheckPermissionRequest {
  resource: string;
  permission: string;
  targetUserId?: string; // Optional: for checking :own permissions
}

interface CheckPermissionResponse {
  hasPermission: boolean;
  scope?: 'own' | 'all';
  message?: string;
}

/**
 * Parse permission string into base and scope
 */
function parsePermission(permission: string): { base: string; scope: string } {
  if (permission.includes(':')) {
    const [base, scope] = permission.split(':');
    return { base: base || '', scope: scope || 'all' };
  }
  return { base: permission, scope: 'all' };
}

/**
 * Check if user has permission
 */
async function checkUserPermission(
  userId: string,
  role: string,
  resource: string,
  permission: string,
  targetUserId?: string
): Promise<CheckPermissionResponse> {
  try {
    // Get role permissions from Firestore
    const rolePermissionsQuery = await db
      .collection('rolePermissions')
      .where('role', '==', role)
      .where('resource', '==', resource)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (rolePermissionsQuery.empty) {
      return {
        hasPermission: false,
        message: `No permissions found for role '${role}' on resource '${resource}'`,
      };
    }

    const rolePermissionDoc = rolePermissionsQuery.docs[0];
    if (!rolePermissionDoc) {
      return {
        hasPermission: false,
        message: 'Permission document is undefined',
      };
    }

    const rolePermissions = rolePermissionDoc.data().permissions as string[];

    // Parse requested permission
    const { base: requestedBase, scope: requestedScope } = parsePermission(permission);

    // Check for exact match
    if (rolePermissions.includes(permission)) {
      // If permission is :own, validate that user is accessing own data
      if (requestedScope === 'own' && targetUserId && userId !== targetUserId) {
        return {
          hasPermission: false,
          scope: 'own',
          message: 'User can only access own data',
        };
      }

      return {
        hasPermission: true,
        scope: requestedScope as 'own' | 'all',
      };
    }

    // Check if role has base permission without context (treated as :all)
    if (rolePermissions.includes(requestedBase)) {
      return {
        hasPermission: true,
        scope: 'all',
      };
    }

    // Check if role has :all scope (which includes :own)
    const allScopePermission = `${requestedBase}:all`;
    if (rolePermissions.includes(allScopePermission)) {
      return {
        hasPermission: true,
        scope: 'all',
      };
    }

    // Check if role has :own scope and requested scope is :own
    const ownScopePermission = `${requestedBase}:own`;
    if (rolePermissions.includes(ownScopePermission) && requestedScope === 'own') {
      // Validate that user is accessing own data
      if (targetUserId && userId !== targetUserId) {
        return {
          hasPermission: false,
          scope: 'own',
          message: 'User can only access own data',
        };
      }

      return {
        hasPermission: true,
        scope: 'own',
      };
    }

    return {
      hasPermission: false,
      message: `Permission '${permission}' not granted to role '${role}' on resource '${resource}'`,
    };
  } catch (error: unknown) {
    logger.error('Error checking user permission:', error);
    throw new HttpsError(
      'internal',
      `Failed to check permission: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Cloud Function: Check User Permission
 * Usage:
 *   checkUserPermission({ resource: 'employees', permission: 'read:all' })
 *   checkUserPermission({ resource: 'employees', permission: 'read:own', targetUserId: 'xyz' })
 */
export const checkUserPermissionFunction = onCall<
  CheckPermissionRequest,
  Promise<CheckPermissionResponse>
>(
  {
    region: 'asia-southeast1',
    enforceAppCheck: false,
  },
  async (request: CallableRequest<CheckPermissionRequest>) => {
    const { auth, data } = request;

    // Check authentication
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { resource, permission, targetUserId } = data;

    // Validate input
    if (!resource) {
      throw new HttpsError('invalid-argument', 'Resource is required');
    }

    if (!permission) {
      throw new HttpsError('invalid-argument', 'Permission is required');
    }

    logger.info('Checking permission:', {
      userId: auth.uid,
      resource,
      permission,
      targetUserId,
    });

    try {
      // Get user's role from Firestore
      const userDoc = await db.collection('users').doc(auth.uid).get();

      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User not found in Firestore');
      }

      const userData = userDoc.data();
      if (!userData) {
        throw new HttpsError('not-found', 'User data is undefined');
      }

      const userRole = userData.role as string;

      if (!userRole) {
        throw new HttpsError('failed-precondition', 'User has no role assigned');
      }

      // Check permission
      const result = await checkUserPermission(
        auth.uid,
        userRole,
        resource,
        permission,
        targetUserId
      );

      logger.info('Permission check result:', result);

      return result;
    } catch (error: unknown) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Unexpected error checking permission:', error);
      throw new HttpsError(
        'internal',
        `Failed to check permission: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
);
