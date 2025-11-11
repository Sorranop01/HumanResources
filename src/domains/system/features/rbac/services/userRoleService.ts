/**
 * User Role Service
 * Handles user-role assignment operations
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  type Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { Role } from '@/shared/constants/roles';
import { db } from '@/shared/lib/firebase';
import {
  type AssignUserRoleInput,
  assignUserRoleSchema,
  type RevokeUserRoleInput,
  revokeUserRoleSchema,
} from '../schemas/rbacSchemas';
import type { UserRoleAssignment, UserRoleAssignmentFirestore } from '../types/rbacTypes';

const COLLECTION_NAME = 'userRoleAssignments';

/**
 * Convert Firestore document to UserRoleAssignment
 */
function convertToUserRoleAssignment(doc: UserRoleAssignmentFirestore): UserRoleAssignment {
  return {
    ...doc,
    createdAt: (doc.createdAt as Timestamp).toDate(),
    updatedAt: (doc.updatedAt as Timestamp).toDate(),
    expiresAt: doc.expiresAt ? (doc.expiresAt as Timestamp).toDate() : undefined,
  };
}

/**
 * Get all user role assignments
 */
export async function getAllUserRoleAssignments(): Promise<UserRoleAssignment[]> {
  const assignmentsRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(assignmentsRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as UserRoleAssignmentFirestore;
    return convertToUserRoleAssignment(data);
  });
}

/**
 * Get active user role assignments
 */
export async function getActiveUserRoleAssignments(): Promise<UserRoleAssignment[]> {
  const assignmentsRef = collection(db, COLLECTION_NAME);
  const q = query(assignmentsRef, where('isActive', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as UserRoleAssignmentFirestore;
    return convertToUserRoleAssignment(data);
  });
}

/**
 * Get user role assignments by user ID
 */
export async function getUserRoleAssignmentsByUserId(
  userId: string
): Promise<UserRoleAssignment[]> {
  const assignmentsRef = collection(db, COLLECTION_NAME);
  const q = query(assignmentsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as UserRoleAssignmentFirestore;
    return convertToUserRoleAssignment(data);
  });
}

/**
 * Get active user role assignment by user ID
 */
export async function getActiveUserRoleAssignment(
  userId: string
): Promise<UserRoleAssignment | null> {
  const assignmentsRef = collection(db, COLLECTION_NAME);
  const q = query(assignmentsRef, where('userId', '==', userId), where('isActive', '==', true));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  // Check for expired assignments
  const now = new Date();
  const validAssignments = snapshot.docs
    .map((doc) => {
      const data = doc.data() as UserRoleAssignmentFirestore;
      return convertToUserRoleAssignment(data);
    })
    .filter((assignment) => {
      if (!assignment.expiresAt) return true;
      return assignment.expiresAt > now;
    });

  return validAssignments[0] ?? null;
}

/**
 * Get user role assignments by role
 */
export async function getUserRoleAssignmentsByRole(role: Role): Promise<UserRoleAssignment[]> {
  const assignmentsRef = collection(db, COLLECTION_NAME);
  const q = query(assignmentsRef, where('role', '==', role), where('isActive', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as UserRoleAssignmentFirestore;
    return convertToUserRoleAssignment(data);
  });
}

/**
 * Assign role to user
 */
export async function assignUserRole(
  data: AssignUserRoleInput,
  assignedByUser: {
    id: string;
    email: string;
    displayName: string;
  }
): Promise<UserRoleAssignment> {
  // Validate input
  const validatedData = assignUserRoleSchema.parse(data);

  // Check if user already has an active role assignment
  const existingAssignment = await getActiveUserRoleAssignment(validatedData.userId);

  if (existingAssignment) {
    // Deactivate existing assignment
    await revokeUserRole(
      {
        userId: validatedData.userId,
        reason: 'Replaced by new role assignment',
      },
      assignedByUser.id
    );
  }

  const assignmentsRef = collection(db, COLLECTION_NAME);

  const newAssignment = {
    userId: validatedData.userId,
    userEmail: assignedByUser.email,
    userDisplayName: assignedByUser.displayName,
    role: validatedData.role,
    assignedBy: assignedByUser.id,
    isActive: true,
    expiresAt: validatedData.expiresAt ? validatedData.expiresAt : undefined,
    reason: validatedData.reason,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: assignedByUser.id,
    updatedBy: assignedByUser.id,
  };

  const docRef = await addDoc(assignmentsRef, newAssignment);

  const snapshot = await getDoc(docRef);
  const createdData = snapshot.data() as UserRoleAssignmentFirestore;

  return convertToUserRoleAssignment({
    ...createdData,
    id: docRef.id,
  });
}

/**
 * Revoke user role
 */
export async function revokeUserRole(
  data: RevokeUserRoleInput,
  revokedByUserId: string
): Promise<void> {
  // Validate input
  const validatedData = revokeUserRoleSchema.parse(data);

  const assignmentsRef = collection(db, COLLECTION_NAME);
  const q = query(
    assignmentsRef,
    where('userId', '==', validatedData.userId),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error(`No active role assignment found for user ${validatedData.userId}`);
  }

  // Deactivate all active assignments
  const updatePromises = snapshot.docs.map((docSnapshot) => {
    const docRef = doc(db, COLLECTION_NAME, docSnapshot.id);
    return updateDoc(docRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
      updatedBy: revokedByUserId,
      reason: validatedData.reason ?? 'Role revoked',
    });
  });

  await Promise.all(updatePromises);
}

/**
 * Update user role assignment
 */
export async function updateUserRoleAssignment(
  userId: string,
  newRole: Role,
  updatedByUser: {
    id: string;
    email: string;
    displayName: string;
  },
  reason?: string | undefined
): Promise<UserRoleAssignment> {
  // Revoke existing assignment
  await revokeUserRole(
    {
      userId,
      reason: reason ?? 'Role updated',
    },
    updatedByUser.id
  );

  // Assign new role
  return assignUserRole(
    {
      userId,
      role: newRole,
      reason: reason ?? 'Role updated',
    },
    updatedByUser
  );
}

/**
 * Permanently delete user role assignment
 */
export async function permanentlyDeleteUserRoleAssignment(id: string): Promise<void> {
  const assignmentRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(assignmentRef);

  if (!snapshot.exists()) {
    throw new Error(`User role assignment ${id} not found`);
  }

  await deleteDoc(assignmentRef);
}

/**
 * Check if user role assignment is expired
 */
export function isRoleAssignmentExpired(assignment: UserRoleAssignment): boolean {
  if (!assignment.expiresAt) {
    return false;
  }

  return assignment.expiresAt < new Date();
}

/**
 * Get users by role with valid assignments
 */
export async function getUsersByRole(role: Role): Promise<string[]> {
  const assignments = await getUserRoleAssignmentsByRole(role);
  const now = new Date();

  return assignments
    .filter((assignment) => {
      if (!assignment.expiresAt) return true;
      return assignment.expiresAt > now;
    })
    .map((assignment) => assignment.userId);
}

/**
 * Get role distribution statistics
 */
export async function getRoleDistribution(): Promise<Record<Role, number>> {
  const assignments = await getActiveUserRoleAssignments();
  const now = new Date();

  const distribution: Record<string, number> = {};

  assignments.forEach((assignment) => {
    if (assignment.expiresAt && assignment.expiresAt < now) {
      return; // Skip expired
    }

    const role = assignment.role;
    distribution[role] = (distribution[role] ?? 0) + 1;
  });

  return distribution as Record<Role, number>;
}
