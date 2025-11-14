/**
 * Check Permission Cloud Function
 * Check if a user has specific permission on a resource
 */

import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

type Role = 'admin' | 'hr' | 'manager' | 'employee' | 'auditor';
type Resource =
  | 'employees'
  | 'attendance'
  | 'leave-requests'
  | 'payroll'
  | 'settings'
  | 'users'
  | 'roles'
  | 'audit-logs';
type Permission = 'read' | 'create' | 'update' | 'delete';

interface CheckPermissionRequest {
  userId?: string | undefined; // If not provided, use caller's ID
  resource: Resource;
  permission: Permission;
}

// Permission Matrix
const PERMISSION_MATRIX: Record<Role, Partial<Record<Resource, Permission[]>>> = {
  admin: {
    employees: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update', 'delete'],
    'leave-requests': ['read', 'create', 'update', 'delete'],
    payroll: ['read', 'create', 'update', 'delete'],
    settings: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete'],
    roles: ['read', 'create', 'update', 'delete'],
    'audit-logs': ['read'],
  },
  hr: {
    employees: ['read', 'create', 'update'],
    attendance: ['read', 'update'],
    'leave-requests': ['read', 'update'],
    payroll: ['read', 'create', 'update'],
    settings: ['read'],
    users: ['read'],
    roles: ['read'],
    'audit-logs': ['read'],
  },
  manager: {
    employees: ['read'],
    attendance: ['read', 'update'],
    'leave-requests': ['read', 'update'],
    settings: ['read'],
  },
  employee: {
    employees: ['read'],
    attendance: ['read', 'create'],
    'leave-requests': ['read', 'create'],
  },
  auditor: {
    employees: ['read'],
    attendance: ['read'],
    'leave-requests': ['read'],
    payroll: ['read'],
    'audit-logs': ['read'],
  },
};

export const checkPermission = onCall(
  { region: 'asia-southeast1', enforceAppCheck: false },
  async (request) => {
    const db = getFirestore();
    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const callerId = request.auth.uid;
    const data = request.data as CheckPermissionRequest;

    // Validate request data
    if (!data.resource || !data.permission) {
      throw new HttpsError('invalid-argument', 'resource and permission are required');
    }

    const targetUserId = data.userId ?? callerId;

    try {
      // Get user's role
      const userDoc = await db.collection('users').doc(targetUserId).get();
      const userData = userDoc.data();

      if (!userData) {
        throw new HttpsError('not-found', 'User not found');
      }

      const userRole = userData.role as Role;

      // Check permission
      const rolePermissions = PERMISSION_MATRIX[userRole];
      const resourcePermissions = rolePermissions?.[data.resource];

      const hasPermission = resourcePermissions?.includes(data.permission) ?? false;

      logger.info('Permission checked', {
        userId: targetUserId,
        role: userRole,
        resource: data.resource,
        permission: data.permission,
        hasPermission,
      });

      return {
        success: true,
        hasPermission,
        data: {
          userId: targetUserId,
          role: userRole,
          resource: data.resource,
          permission: data.permission,
        },
      };
    } catch (error: unknown) {
      logger.error('Failed to check permission', { error });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'Failed to check permission');
    }
  }
);
