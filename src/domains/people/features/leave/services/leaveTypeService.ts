/**
 * Leave Type Service
 * Business logic for leave types (master data)
 */

import {
  collection,
  type DocumentData,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type { CreateLeaveTypeInput, LeaveType } from '../types';

const COLLECTION_NAME = 'leaveTypes';

/**
 * Convert Firestore document to LeaveType
 */
function docToLeaveType(id: string, data: DocumentData): LeaveType {
  return {
    id,
    code: data.code,
    nameTh: data.nameTh,
    nameEn: data.nameEn,
    description: data.description,
    requiresApproval: data.requiresApproval,
    requiresCertificate: data.requiresCertificate,
    certificateRequiredAfterDays: data.certificateRequiredAfterDays,
    maxConsecutiveDays: data.maxConsecutiveDays,
    maxDaysPerYear: data.maxDaysPerYear,
    isPaid: data.isPaid,
    affectsAttendance: data.affectsAttendance,
    defaultEntitlement: data.defaultEntitlement,
    accrualType: data.accrualType,
    carryOverAllowed: data.carryOverAllowed,
    maxCarryOverDays: data.maxCarryOverDays,
    color: data.color,
    icon: data.icon,
    sortOrder: data.sortOrder,
    isActive: data.isActive,
    tenantId: data.tenantId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

export const leaveTypeService = {
  /**
   * Get all active leave types
   */
  async getAll(includeInactive = false): Promise<LeaveType[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('sortOrder', 'asc'));

      if (!includeInactive) {
        q = query(q, where('isActive', '==', true));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => docToLeaveType(doc.id, doc.data()));
    } catch (error) {
      console.error('Failed to fetch leave types', error);
      throw new Error('ไม่สามารถดึงข้อมูลประเภทการลาได้');
    }
  },

  /**
   * Get leave type by ID
   */
  async getById(id: string): Promise<LeaveType | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) return null;

      return docToLeaveType(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch leave type', error);
      throw new Error('ไม่สามารถดึงข้อมูลประเภทการลาได้');
    }
  },

  /**
   * Get leave type by code
   */
  async getByCode(code: string): Promise<LeaveType | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('code', '==', code));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const docSnap = snapshot.docs[0];
      if (!docSnap) return null;
      return docToLeaveType(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch leave type by code', error);
      throw new Error('ไม่สามารถดึงข้อมูลประเภทการลาได้');
    }
  },

  /**
   * Create leave type
   */
  async create(input: CreateLeaveTypeInput): Promise<string> {
    try {
      const docRef = doc(collection(db, COLLECTION_NAME));

      await setDoc(docRef, {
        code: input.code,
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        description: input.description ?? null,
        requiresApproval: input.requiresApproval ?? true,
        requiresCertificate: input.requiresCertificate ?? false,
        certificateRequiredAfterDays: input.certificateRequiredAfterDays ?? 0,
        maxConsecutiveDays: input.maxConsecutiveDays ?? 30,
        maxDaysPerYear: input.maxDaysPerYear ?? 30,
        isPaid: input.isPaid ?? true,
        affectsAttendance: input.affectsAttendance ?? false,
        defaultEntitlement: input.defaultEntitlement ?? 10,
        accrualType: input.accrualType ?? 'yearly',
        carryOverAllowed: input.carryOverAllowed ?? false,
        maxCarryOverDays: input.maxCarryOverDays ?? 0,
        color: input.color ?? '#1890ff',
        icon: input.icon ?? null,
        sortOrder: input.sortOrder ?? 999,
        isActive: true,
        tenantId: 'default',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create leave type', error);
      throw new Error('ไม่สามารถสร้างประเภทการลาได้');
    }
  },

  /**
   * Update leave type
   */
  async update(id: string, input: Partial<LeaveType>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...input,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to update leave type', error);
      throw new Error('ไม่สามารถอัปเดตประเภทการลาได้');
    }
  },

  /**
   * Delete leave type
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete leave type', error);
      throw new Error('ไม่สามารถลบประเภทการลาได้');
    }
  },

  /**
   * Deactivate leave type (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    try {
      await this.update(id, { isActive: false });
    } catch (error) {
      console.error('Failed to deactivate leave type', error);
      throw new Error('ไม่สามารถปิดใช้งานประเภทการลาได้');
    }
  },
};
