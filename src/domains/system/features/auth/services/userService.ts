import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { ROLES, type Role } from '@/shared/constants/roles';
import { db } from '@/shared/lib/firebase';
import type { User } from '@/shared/types';

/**
 * User profile data for creation
 */
export interface CreateUserProfileData {
  id: string;
  email: string;
  displayName: string;
  role?: Role | undefined;
  phoneNumber?: string | undefined;
  photoURL?: string | undefined;
}

/**
 * User profile data for updates
 */
export interface UpdateUserProfileData {
  displayName?: string | undefined;
  phoneNumber?: string | undefined;
  photoURL?: string | undefined;
  role?: Role | undefined;
  isActive?: boolean | undefined;
}

/**
 * Service for managing user profiles in Firestore
 */
export const userService = {
  /**
   * Create a new user profile in Firestore
   */
  async createUserProfile(data: CreateUserProfileData): Promise<User> {
    const userRef = doc(db, 'users', data.id);

    const now = Timestamp.now();
    const userProfile: Omit<User, 'createdAt' | 'updatedAt'> & {
      createdAt: Timestamp;
      updatedAt: Timestamp;
    } = {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role || ROLES.EMPLOYEE, // Default role
      phoneNumber: data.phoneNumber ?? undefined,
      photoURL: data.photoURL ?? undefined,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, userProfile);

    // Convert Timestamp to Date for return
    return {
      ...userProfile,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  },

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data();

    return {
      id: userSnap.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      phoneNumber: data.phoneNumber,
      photoURL: data.photoURL,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    };
  },

  /**
   * Update user profile in Firestore
   */
  async updateUserProfile(userId: string, data: UpdateUserProfileData): Promise<void> {
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },
};
