import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationDocument,
  UpdateOrganizationInput,
} from '../types/organizationTypes';

const COLLECTION = 'organization';

/**
 * Convert Firestore document to Organization type
 */
const mapDocToOrganization = (id: string, data: OrganizationDocument): Organization => ({
  id,
  ...data,
});

/**
 * Get organization settings by tenant ID
 */
export const getOrganization = async (tenantId: string): Promise<Organization | null> => {
  try {
    const docRef = doc(db, COLLECTION, tenantId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return mapDocToOrganization(snapshot.id, snapshot.data() as OrganizationDocument);
  } catch (error) {
    console.error('❌ Failed to get organization:', error);
    throw new Error('ไม่สามารถดึงข้อมูลองค์กรได้');
  }
};

/**
 * Create or initialize organization settings
 */
export const createOrganization = async (
  tenantId: string,
  input: CreateOrganizationInput,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, tenantId);

    // Check if already exists
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      throw new Error('ข้อมูลองค์กรมีอยู่แล้ว');
    }

    const data: OrganizationDocument = {
      ...input,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      createdBy: userId,
      updatedBy: userId,
    };

    await setDoc(docRef, data);
  } catch (error) {
    console.error('❌ Failed to create organization:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถสร้างข้อมูลองค์กรได้');
  }
};

/**
 * Update organization settings
 */
export const updateOrganization = async (
  tenantId: string,
  input: UpdateOrganizationInput,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION, tenantId);

    // Check if exists
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      throw new Error('ไม่พบข้อมูลองค์กร');
    }

    const updateData = {
      ...input,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('❌ Failed to update organization:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ไม่สามารถอัปเดตข้อมูลองค์กรได้');
  }
};

/**
 * Check if organization exists
 */
export const organizationExists = async (tenantId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION, tenantId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists();
  } catch (error) {
    console.error('❌ Failed to check organization existence:', error);
    return false;
  }
};

export const organizationService = {
  get: getOrganization,
  create: createOrganization,
  update: updateOrganization,
  exists: organizationExists,
};
