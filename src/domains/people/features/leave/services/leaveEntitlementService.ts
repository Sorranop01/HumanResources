/**
 * Leave Entitlement Service
 * Business logic for leave entitlements (สิทธิ์การลา)
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
import type {
  CreateLeaveEntitlementInput,
  LeaveEntitlement,
  UpdateLeaveBalanceInput,
} from '../types';

const COLLECTION_NAME = 'leaveEntitlements';

/**
 * Convert Firestore document to LeaveEntitlement
 */
function docToLeaveEntitlement(id: string, data: DocumentData): LeaveEntitlement {
  return {
    id,
    employeeId: data.employeeId,
    employeeName: data.employeeName,
    employeeCode: data.employeeCode,
    leaveTypeId: data.leaveTypeId,
    leaveTypeCode: data.leaveTypeCode,
    leaveTypeName: data.leaveTypeName,
    year: data.year,
    effectiveFrom: data.effectiveFrom.toDate(),
    effectiveTo: data.effectiveTo.toDate(),
    totalEntitlement: data.totalEntitlement,
    carriedOver: data.carriedOver,
    accrued: data.accrued,
    used: data.used,
    pending: data.pending,
    remaining: data.remaining,
    basedOnTenure: data.basedOnTenure,
    tenureYears: data.tenureYears,
    isActive: data.isActive,
    notes: data.notes,
    lastCalculatedAt: data.lastCalculatedAt.toDate(),
    tenantId: data.tenantId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

export const leaveEntitlementService = {
  /**
   * Calculate annual leave entitlement based on tenure
   */
  calculateAnnualLeaveEntitlement(tenureYears: number): number {
    if (tenureYears < 1) return 6;
    if (tenureYears < 2) return 8;
    if (tenureYears < 3) return 10;
    if (tenureYears < 5) return 12;
    if (tenureYears < 10) return 15;
    return 20;
  },

  /**
   * Calculate pro-rata leave for new employees
   */
  calculateProRataLeave(hireDate: Date, entitlement: number): number {
    const now = new Date();
    const monthsWorked =
      (now.getFullYear() - hireDate.getFullYear()) * 12 + (now.getMonth() - hireDate.getMonth());
    const proRata = (monthsWorked / 12) * entitlement;
    return Math.floor(proRata);
  },

  /**
   * Calculate tenure years from hire date
   */
  calculateTenureYears(hireDate: Date): number {
    const now = new Date();
    const years = now.getFullYear() - hireDate.getFullYear();
    const monthDiff = now.getMonth() - hireDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < hireDate.getDate())) {
      return years - 1;
    }
    return years;
  },

  /**
   * Get entitlements by employee ID
   */
  async getByEmployeeId(employeeId: string, year?: number): Promise<LeaveEntitlement[]> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('employeeId', '==', employeeId),
        orderBy('year', 'desc')
      );

      if (year) {
        q = query(q, where('year', '==', year));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => docToLeaveEntitlement(doc.id, doc.data()));
    } catch (error) {
      console.error('Failed to fetch leave entitlements', error);
      throw new Error('ไม่สามารถดึงข้อมูลสิทธิ์การลาได้');
    }
  },

  /**
   * Get entitlement by employee and leave type
   */
  async getByEmployeeAndLeaveType(
    employeeId: string,
    leaveTypeId: string,
    year: number
  ): Promise<LeaveEntitlement | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('employeeId', '==', employeeId),
        where('leaveTypeId', '==', leaveTypeId),
        where('year', '==', year)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const docSnap = snapshot.docs[0];
      if (!docSnap) return null;
      return docToLeaveEntitlement(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch leave entitlement', error);
      throw new Error('ไม่สามารถดึงข้อมูลสิทธิ์การลาได้');
    }
  },

  /**
   * Create initial entitlements for new employee
   */
  async createInitialEntitlements(
    employee: {
      id: string;
      name: string;
      code: string;
      hireDate: Date;
    },
    leaveTypes: Array<{
      id: string;
      code: string;
      name: string;
      defaultEntitlement: number;
      accrualType: string;
    }>,
    year?: number
  ): Promise<void> {
    const currentYear = year ?? new Date().getFullYear();
    const tenureYears = this.calculateTenureYears(employee.hireDate);

    for (const leaveType of leaveTypes) {
      try {
        let totalEntitlement = leaveType.defaultEntitlement;

        // Calculate based on tenure for annual leave
        if (leaveType.code === 'ANNUAL') {
          totalEntitlement = this.calculateAnnualLeaveEntitlement(tenureYears);

          // Pro-rata for new employees
          if (tenureYears < 1) {
            totalEntitlement = this.calculateProRataLeave(employee.hireDate, totalEntitlement);
          }
        }

        await this.create({
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year: currentYear,
          totalEntitlement,
          carriedOver: 0,
          basedOnTenure: leaveType.code === 'ANNUAL',
          tenureYears,
        });
      } catch (error) {
        console.error(`Failed to create entitlement for ${leaveType.name}`, error);
      }
    }
  },

  /**
   * Create leave entitlement
   */
  async create(input: CreateLeaveEntitlementInput): Promise<string> {
    try {
      // Get employee info (we need to fetch this)
      // For now, we'll assume it's passed or we have it
      const docRef = doc(collection(db, COLLECTION_NAME));

      const year = input.year ?? new Date().getFullYear();
      const carriedOver = input.carriedOver ?? 0;
      const accrued = input.totalEntitlement;
      const totalEntitlement = accrued + carriedOver;

      const effectiveFrom = new Date(year, 0, 1); // Jan 1
      const effectiveTo = new Date(year, 11, 31); // Dec 31

      await setDoc(docRef, {
        employeeId: input.employeeId,
        employeeName: 'TBD', // Should be passed or fetched
        employeeCode: 'TBD',
        leaveTypeId: input.leaveTypeId,
        leaveTypeCode: 'TBD', // Should be fetched
        leaveTypeName: 'TBD',
        year,
        effectiveFrom: Timestamp.fromDate(effectiveFrom),
        effectiveTo: Timestamp.fromDate(effectiveTo),
        totalEntitlement,
        carriedOver,
        accrued,
        used: 0,
        pending: 0,
        remaining: totalEntitlement,
        basedOnTenure: input.basedOnTenure ?? false,
        tenureYears: input.tenureYears ?? 0,
        isActive: true,
        notes: input.notes ?? null,
        lastCalculatedAt: Timestamp.now(),
        tenantId: 'default',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create leave entitlement', error);
      throw new Error('ไม่สามารถสร้างสิทธิ์การลาได้');
    }
  },

  /**
   * Update leave balance
   */
  async updateBalance(id: string, _days: number, input: UpdateLeaveBalanceInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('Leave entitlement not found');
      }

      const current = docSnap.data();
      const operation = input.operation;

      let newUsed = current.used;
      let newPending = current.pending;

      if (input.used !== undefined) {
        newUsed = operation === 'add' ? current.used + input.used : current.used - input.used;
      }

      if (input.pending !== undefined) {
        newPending =
          operation === 'add' ? current.pending + input.pending : current.pending - input.pending;
      }

      const newRemaining = current.totalEntitlement - newUsed - newPending;

      await updateDoc(docRef, {
        used: Math.max(0, newUsed),
        pending: Math.max(0, newPending),
        remaining: Math.max(0, newRemaining),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to update leave balance', error);
      throw new Error('ไม่สามารถอัปเดตยอดสิทธิ์การลาได้');
    }
  },

  /**
   * Carry over remaining leave to next year
   */
  async carryOver(
    employeeId: string,
    leaveTypeId: string,
    fromYear: number,
    maxCarryOver: number
  ): Promise<void> {
    try {
      // Get current year entitlement
      const currentEntitlement = await this.getByEmployeeAndLeaveType(
        employeeId,
        leaveTypeId,
        fromYear
      );

      if (!currentEntitlement) {
        throw new Error('Current year entitlement not found');
      }

      // Calculate carry over amount (limited by max)
      const carryOverAmount = Math.min(currentEntitlement.remaining, maxCarryOver);

      if (carryOverAmount > 0) {
        // Check if next year entitlement exists
        const nextYear = fromYear + 1;
        const nextYearEntitlement = await this.getByEmployeeAndLeaveType(
          employeeId,
          leaveTypeId,
          nextYear
        );

        if (nextYearEntitlement) {
          // Update existing
          const docRef = doc(db, COLLECTION_NAME, nextYearEntitlement.id);
          await updateDoc(docRef, {
            carriedOver: carryOverAmount,
            totalEntitlement: nextYearEntitlement.accrued + carryOverAmount,
            remaining: nextYearEntitlement.accrued + carryOverAmount - nextYearEntitlement.used,
            updatedAt: Timestamp.now(),
          });
        } else {
          // Create new entitlement for next year
          await this.create({
            employeeId,
            leaveTypeId,
            year: nextYear,
            totalEntitlement: currentEntitlement.accrued, // Use default for next year
            carriedOver: carryOverAmount,
          });
        }
      }
    } catch (error) {
      console.error('Failed to carry over leave', error);
      throw new Error('ไม่สามารถยกยอดลาได้');
    }
  },

  /**
   * Delete leave entitlement
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete leave entitlement', error);
      throw new Error('ไม่สามารถลบสิทธิ์การลาได้');
    }
  },
};
