/**
 * Shift Service
 * Business logic for shift management
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  type QueryConstraint,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type { CreateShiftInput, Shift, ShiftFilters, UpdateShiftInput } from '../types/shift';

const COLLECTION_NAME = 'shifts';

/**
 * Convert Firestore document to Shift
 */
function docToShift(id: string, data: DocumentData): Shift {
  return {
    id,
    name: data.name,
    nameEn: data.nameEn,
    description: data.description,
    code: data.code,
    startTime: data.startTime,
    endTime: data.endTime,
    breaks: data.breaks,
    workHours: data.workHours,
    grossHours: data.grossHours,
    premiumRate: data.premiumRate,
    nightShiftBonus: data.nightShiftBonus,
    applicableDays: data.applicableDays,
    color: data.color ?? undefined,
    isActive: data.isActive,
    effectiveDate: data.effectiveDate.toDate(),
    expiryDate: data.expiryDate ? data.expiryDate.toDate() : undefined,
    tenantId: data.tenantId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

/**
 * Parse time string (HH:mm) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export const shiftService = {
  /**
   * Create shift
   */
  async create(tenantId: string, input: CreateShiftInput): Promise<string> {
    try {
      // Check if code already exists
      const existing = await this.getByCode(tenantId, input.code);
      if (existing) {
        throw new Error('Shift code already exists');
      }

      // Validate time range
      const startMinutes = timeToMinutes(input.startTime);
      const endMinutes = timeToMinutes(input.endTime);

      // Allow overnight shifts (e.g., 22:00 - 06:00)
      // In this case, endMinutes would be less than startMinutes
      if (startMinutes === endMinutes) {
        throw new Error('Start time and end time cannot be the same');
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name: input.name,
        nameEn: input.nameEn,
        description: input.description,
        code: input.code,
        startTime: input.startTime,
        endTime: input.endTime,
        breaks: input.breaks,
        workHours: input.workHours,
        grossHours: input.grossHours,
        premiumRate: input.premiumRate,
        nightShiftBonus: input.nightShiftBonus,
        applicableDays: input.applicableDays,
        color: input.color ?? null,
        isActive: true,
        effectiveDate: Timestamp.fromDate(input.effectiveDate),
        expiryDate: input.expiryDate ? Timestamp.fromDate(input.expiryDate) : null,
        tenantId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create shift', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create shift');
    }
  },

  /**
   * Get shift by ID
   */
  async getById(id: string): Promise<Shift | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        return null;
      }

      return docToShift(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch shift', error);
      throw new Error('Failed to fetch shift');
    }
  },

  /**
   * Get shift by code
   */
  async getByCode(tenantId: string, code: string): Promise<Shift | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('tenantId', '==', tenantId),
        where('code', '==', code)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      if (!doc) {
        return null;
      }

      return docToShift(doc.id, doc.data());
    } catch (error) {
      console.error('Failed to fetch shift by code', error);
      throw new Error('Failed to fetch shift');
    }
  },

  /**
   * Get all shifts with filters
   */
  async getAll(tenantId: string, filters?: ShiftFilters): Promise<Shift[]> {
    try {
      const constraints: QueryConstraint[] = [where('tenantId', '==', tenantId)];

      if (filters?.code) {
        constraints.push(where('code', '==', filters.code));
      }

      if (filters?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => docToShift(doc.id, doc.data()));
    } catch (error) {
      console.error('Failed to fetch shifts', error);
      throw new Error('Failed to fetch shifts');
    }
  },

  /**
   * Update shift
   */
  async update(id: string, input: UpdateShiftInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('Shift not found');
      }

      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.nameEn !== undefined) updateData.nameEn = input.nameEn;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.startTime !== undefined) updateData.startTime = input.startTime;
      if (input.endTime !== undefined) updateData.endTime = input.endTime;
      if (input.breaks !== undefined) updateData.breaks = input.breaks;
      if (input.workHours !== undefined) updateData.workHours = input.workHours;
      if (input.grossHours !== undefined) updateData.grossHours = input.grossHours;
      if (input.premiumRate !== undefined) updateData.premiumRate = input.premiumRate;
      if (input.nightShiftBonus !== undefined) updateData.nightShiftBonus = input.nightShiftBonus;
      if (input.applicableDays !== undefined) updateData.applicableDays = input.applicableDays;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.effectiveDate !== undefined)
        updateData.effectiveDate = Timestamp.fromDate(input.effectiveDate);
      if (input.expiryDate !== undefined)
        updateData.expiryDate = input.expiryDate ? Timestamp.fromDate(input.expiryDate) : null;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Failed to update shift', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update shift');
    }
  },

  /**
   * Delete shift
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete shift', error);
      throw new Error('Failed to delete shift');
    }
  },

  /**
   * Calculate shift duration (including breaks)
   */
  calculateGrossHours(startTime: string, endTime: string): number {
    const startMinutes = timeToMinutes(startTime);
    let endMinutes = timeToMinutes(endTime);

    // Handle overnight shifts
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours
    }

    const totalMinutes = endMinutes - startMinutes;
    return totalMinutes / 60;
  },

  /**
   * Calculate net working hours (excluding breaks)
   */
  calculateWorkHours(
    startTime: string,
    endTime: string,
    breaks: Array<{ duration: number }>
  ): number {
    const grossHours = this.calculateGrossHours(startTime, endTime);
    const totalBreakMinutes = breaks.reduce((sum, b) => sum + b.duration, 0);
    const workMinutes = grossHours * 60 - totalBreakMinutes;
    return workMinutes / 60;
  },

  /**
   * Check if shift is active on a specific date
   */
  isActiveOnDate(shift: Shift, date: Date): boolean {
    const dayOfWeek = date.getDay();

    // Check if shift is active
    if (!shift.isActive) {
      return false;
    }

    // Check if date is within effective period
    if (date < shift.effectiveDate) {
      return false;
    }

    if (shift.expiryDate && date > shift.expiryDate) {
      return false;
    }

    // Check if day is applicable
    if (!shift.applicableDays.includes(dayOfWeek)) {
      return false;
    }

    return true;
  },
};
