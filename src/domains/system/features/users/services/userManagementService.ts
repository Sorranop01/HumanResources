import {
  collection,
  doc,
  getDocs,
  type QueryConstraint,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { Role } from '@/shared/constants/roles';
import { db, functions } from '@/shared/lib/firebase';
import type { User } from '@/shared/types';
import type { CreateUserPayload, UpdateUserPayload } from '../types/user.types';

/**
 * User management service
 */
export const userManagementService = {
  /**
   * Create a new user (Admin/HR only)
   */
  async createUser(payload: CreateUserPayload): Promise<void> {
    const createUserFn = httpsCallable<CreateUserPayload, { success: boolean; message: string }>(
      functions,
      'createUser'
    );

    const result = await createUserFn(payload);

    if (!result.data.success) {
      throw new Error(result.data.message || 'Failed to create user');
    }
  },

  /**
   * Get all users with optional filters
   */
  async getUsers(filters?: {
    role?: Role | undefined;
    isActive?: boolean | undefined;
  }): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters?.role) {
      constraints.push(where('role', '==', filters.role));
    }
    if (filters?.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive));
    }

    const q = constraints.length > 0 ? query(usersRef, ...constraints) : query(usersRef);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        id: doc.id,
        tenantId: data.tenantId,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        roleId: data.roleId,
        roleName: data.roleName,
        phoneNumber: data.phoneNumber,
        photoURL: data.photoURL,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
    });
  },

  /**
   * Update user
   */
  async updateUser(userId: string, payload: UpdateUserPayload): Promise<void> {
    const userRef = doc(db, 'users', userId);

    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (payload.displayName !== undefined) {
      updateData.displayName = payload.displayName;
    }
    if (payload.role !== undefined) {
      updateData.role = payload.role;
    }
    if (payload.isActive !== undefined) {
      updateData.isActive = payload.isActive;
    }
    if (payload.phoneNumber !== undefined) {
      updateData.phoneNumber = payload.phoneNumber;
    }

    await updateDoc(userRef, updateData);
  },

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<void> {
    await this.updateUser(userId, { isActive: false });
  },

  /**
   * Activate user
   */
  async activateUser(userId: string): Promise<void> {
    await this.updateUser(userId, { isActive: true });
  },
};
