/**
 * Effective Role Service
 * Determines the actual role a user should have based on:
 * 1. Active role assignments (userRoleAssignments) - Priority 1
 * 2. Default role in users collection - Priority 2
 */

import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import type { Role } from '@/shared/constants/roles';
import { db } from '@/shared/lib/firebase';
import type { UserRoleAssignment, UserRoleAssignmentFirestore } from '../types/rbacTypes';
import { getActiveUserRoleAssignment } from './userRoleService';

/**
 * Effective role information
 */
export interface EffectiveRoleInfo {
  userId: string;
  effectiveRole: Role;
  source: 'assignment' | 'default';
  assignment?: UserRoleAssignment | undefined;
  defaultRole?: Role | undefined;
}

/**
 * Get effective role for a user
 * Checks userRoleAssignments first, then falls back to users collection
 */
export async function getEffectiveRole(userId: string): Promise<EffectiveRoleInfo> {
  // Check for active role assignment (Priority 1)
  const assignment = await getActiveUserRoleAssignment(userId);

  if (assignment) {
    return {
      userId,
      effectiveRole: assignment.role,
      source: 'assignment',
      assignment,
      defaultRole: undefined, // Will be fetched if needed
    };
  }

  // Fall back to default role from users collection (Priority 2)
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (!userDoc.exists()) {
    throw new Error(`User ${userId} not found`);
  }

  const userData = userDoc.data();
  const defaultRole = userData.role as Role;

  return {
    userId,
    effectiveRole: defaultRole,
    source: 'default',
    assignment: undefined,
    defaultRole,
  };
}

/**
 * Get effective roles for multiple users
 */
export async function getEffectiveRoles(
  userIds: string[]
): Promise<Map<string, EffectiveRoleInfo>> {
  const results = new Map<string, EffectiveRoleInfo>();

  // Fetch all at once for better performance
  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const info = await getEffectiveRole(userId);
        results.set(userId, info);
      } catch (error) {
        console.error(`Failed to get effective role for user ${userId}:`, error);
      }
    })
  );

  return results;
}

/**
 * Check if user has active role assignment (override)
 */
export async function hasActiveRoleAssignment(userId: string): Promise<boolean> {
  const assignment = await getActiveUserRoleAssignment(userId);
  return assignment !== null;
}

/**
 * Get default role from users collection
 */
export async function getDefaultRole(userId: string): Promise<Role> {
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (!userDoc.exists()) {
    throw new Error(`User ${userId} not found`);
  }

  return userDoc.data().role as Role;
}

/**
 * Get all users with role assignments
 */
export async function getUsersWithAssignments(): Promise<
  Array<{
    userId: string;
    defaultRole: Role;
    assignedRole: Role;
    assignment: UserRoleAssignment;
  }>
> {
  const assignmentsRef = collection(db, 'userRoleAssignments');
  const q = query(assignmentsRef, where('isActive', '==', true));
  const snapshot = await getDocs(q);

  const results = await Promise.all(
    snapshot.docs.map(async (assignmentDoc) => {
      const assignmentData = assignmentDoc.data() as UserRoleAssignmentFirestore;
      const assignment: UserRoleAssignment = {
        id: assignmentDoc.id,
        userId: assignmentData.userId,
        userEmail: assignmentData.userEmail,
        userDisplayName: assignmentData.userDisplayName,
        role: assignmentData.role,
        assignedBy: assignmentData.assignedBy,
        isActive: assignmentData.isActive,
        expiresAt: assignmentData.expiresAt?.toDate(),
        reason: assignmentData.reason,
        createdAt: assignmentData.createdAt.toDate(),
        updatedAt: assignmentData.updatedAt.toDate(),
        createdBy: assignmentData.createdBy,
        updatedBy: assignmentData.updatedBy,
      };

      // Check if expired
      if (assignment.expiresAt && assignment.expiresAt < new Date()) {
        return null;
      }

      try {
        const defaultRole = await getDefaultRole(assignment.userId);
        return {
          userId: assignment.userId,
          defaultRole,
          assignedRole: assignment.role,
          assignment,
        };
      } catch (error) {
        console.error(`Failed to get default role for user ${assignment.userId}:`, error);
        return null;
      }
    })
  );

  return results.filter((r) => r !== null);
}
