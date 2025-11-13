/**
 * Shift Assignment Service
 * Business logic for managing shift assignments to employees
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
import type {
  CreateShiftAssignmentInput,
  CurrentShiftInfo,
  Shift,
  ShiftAssignment,
  ShiftAssignmentFilters,
  UpdateShiftAssignmentInput,
} from '../types/shift';
import { shiftService } from './shiftService';

const COLLECTION_NAME = 'shiftAssignments';

/**
 * Convert Firestore document to ShiftAssignment
 */
function docToShiftAssignment(id: string, data: DocumentData): ShiftAssignment {
  return {
    id,
    employeeId: data.employeeId,
    employeeName: data.employeeName,
    shiftId: data.shiftId,
    shiftCode: data.shiftCode,
    startDate: data.startDate.toDate(),
    endDate: data.endDate ? data.endDate.toDate() : undefined,
    workDays: data.workDays,
    rotationPattern: data.rotationPattern ?? undefined,
    isPermanent: data.isPermanent,
    isRotational: data.isRotational,
    isActive: data.isActive,
    notes: data.notes ?? undefined,
    assignedBy: data.assignedBy,
    assignedAt: data.assignedAt.toDate(),
    tenantId: data.tenantId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

/**
 * Calculate which shift should be active on a specific date based on rotation
 */
function getRotationalShiftForDate(assignment: ShiftAssignment, date: Date): string | null {
  if (!assignment.isRotational || !assignment.rotationPattern) {
    return assignment.shiftId;
  }

  const pattern = assignment.rotationPattern;
  const daysDiff = Math.floor(
    (date.getTime() - pattern.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const cyclePosition = daysDiff % pattern.cycleDays;
  const shiftIndex = Math.floor((cyclePosition / pattern.cycleDays) * pattern.sequence.length);

  return pattern.sequence[shiftIndex] || assignment.shiftId;
}

export const shiftAssignmentService = {
  /**
   * Create shift assignment
   */
  async create(input: CreateShiftAssignmentInput): Promise<string> {
    try {
      // Validate shift exists
      const shift = await shiftService.getById(input.shiftId);
      if (!shift) {
        throw new Error('Shift not found');
      }

      // Check for overlapping assignments
      const existing = await this.getByEmployeeId(input.employeeId);
      const hasOverlap = existing.some((assignment) => {
        if (!assignment.isActive) return false;

        const existingStart = assignment.startDate;
        const existingEnd = assignment.endDate || new Date('2099-12-31');
        const newStart = input.startDate;
        const newEnd = input.endDate || new Date('2099-12-31');

        return newStart <= existingEnd && newEnd >= existingStart;
      });

      if (hasOverlap) {
        throw new Error('Employee already has an active shift assignment for this period');
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        employeeId: input.employeeId,
        employeeName: input.employeeName,
        shiftId: input.shiftId,
        shiftCode: input.shiftCode,
        startDate: Timestamp.fromDate(input.startDate),
        endDate: input.endDate ? Timestamp.fromDate(input.endDate) : null,
        workDays: input.workDays,
        rotationPattern: input.rotationPattern ?? null,
        isPermanent: input.isPermanent,
        isRotational: input.isRotational,
        isActive: true,
        notes: input.notes ?? null,
        assignedBy: input.assignedBy,
        assignedAt: Timestamp.now(),
        tenantId: 'default',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create shift assignment', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create shift assignment');
    }
  },

  /**
   * Get assignment by ID
   */
  async getById(id: string): Promise<ShiftAssignment | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        return null;
      }

      return docToShiftAssignment(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch shift assignment', error);
      throw new Error('Failed to fetch shift assignment');
    }
  },

  /**
   * Get assignments by employee ID
   */
  async getByEmployeeId(employeeId: string): Promise<ShiftAssignment[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('employeeId', '==', employeeId),
        orderBy('startDate', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => docToShiftAssignment(doc.id, doc.data()));
    } catch (error) {
      console.error('Failed to fetch shift assignments by employee', error);
      throw new Error('Failed to fetch shift assignments');
    }
  },

  /**
   * Get all assignments with filters
   */
  async getAll(filters?: ShiftAssignmentFilters): Promise<ShiftAssignment[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.employeeId) {
        constraints.push(where('employeeId', '==', filters.employeeId));
      }

      if (filters?.shiftId) {
        constraints.push(where('shiftId', '==', filters.shiftId));
      }

      if (filters?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }

      if (filters?.isPermanent !== undefined) {
        constraints.push(where('isPermanent', '==', filters.isPermanent));
      }

      if (filters?.isRotational !== undefined) {
        constraints.push(where('isRotational', '==', filters.isRotational));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => docToShiftAssignment(doc.id, doc.data()));
    } catch (error) {
      console.error('Failed to fetch shift assignments', error);
      throw new Error('Failed to fetch shift assignments');
    }
  },

  /**
   * Update assignment
   */
  async update(id: string, input: UpdateShiftAssignmentInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('Shift assignment not found');
      }

      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      if (input.shiftId !== undefined) updateData.shiftId = input.shiftId;
      if (input.shiftCode !== undefined) updateData.shiftCode = input.shiftCode;
      if (input.startDate !== undefined) updateData.startDate = Timestamp.fromDate(input.startDate);
      if (input.endDate !== undefined)
        updateData.endDate = input.endDate ? Timestamp.fromDate(input.endDate) : null;
      if (input.workDays !== undefined) updateData.workDays = input.workDays;
      if (input.rotationPattern !== undefined) updateData.rotationPattern = input.rotationPattern;
      if (input.isPermanent !== undefined) updateData.isPermanent = input.isPermanent;
      if (input.isRotational !== undefined) updateData.isRotational = input.isRotational;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Failed to update shift assignment', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update shift assignment');
    }
  },

  /**
   * Delete assignment
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete shift assignment', error);
      throw new Error('Failed to delete shift assignment');
    }
  },

  /**
   * Get current shift for an employee on a specific date
   */
  async getCurrentShift(employeeId: string, date: Date): Promise<CurrentShiftInfo | null> {
    try {
      // Get all active assignments for employee
      const assignments = await this.getByEmployeeId(employeeId);

      // Find assignment that covers this date
      const activeAssignment = assignments.find((assignment) => {
        if (!assignment.isActive) return false;

        const startDate = assignment.startDate;
        const endDate = assignment.endDate || new Date('2099-12-31');

        if (date < startDate || date > endDate) return false;

        // Check if day of week is in workDays
        const dayOfWeek = date.getDay();
        if (!assignment.workDays.includes(dayOfWeek)) return false;

        return true;
      });

      if (!activeAssignment) {
        return null;
      }

      // Get the shift
      let shiftId = activeAssignment.shiftId;

      // Handle rotational shifts
      if (activeAssignment.isRotational && activeAssignment.rotationPattern) {
        const rotationalShiftCode = getRotationalShiftForDate(activeAssignment, date);
        if (rotationalShiftCode) {
          const rotationalShift = await shiftService.getByCode(rotationalShiftCode);
          if (rotationalShift) {
            shiftId = rotationalShift.id;
          }
        }
      }

      const shift = await shiftService.getById(shiftId);
      if (!shift) {
        return null;
      }

      return {
        shift,
        assignment: activeAssignment,
        isOverride: false,
        effectiveStartTime: shift.startTime,
        effectiveEndTime: shift.endTime,
      };
    } catch (error) {
      console.error('Failed to get current shift', error);
      throw new Error('Failed to get current shift');
    }
  },

  /**
   * Check if employee is on shift on a specific date
   */
  async isOnShift(employeeId: string, date: Date): Promise<boolean> {
    const currentShift = await this.getCurrentShift(employeeId, date);
    return currentShift !== null;
  },

  /**
   * Get shift schedule for employee for a date range
   */
  async getSchedule(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: Date; shift: Shift | null }>> {
    const schedule: Array<{ date: Date; shift: Shift | null }> = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const shiftInfo = await this.getCurrentShift(employeeId, currentDate);
      schedule.push({
        date: new Date(currentDate),
        shift: shiftInfo ? shiftInfo.shift : null,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedule;
  },
};
