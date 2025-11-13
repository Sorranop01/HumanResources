/**
 * Overtime Service
 * Handles all overtime-related operations with Firestore
 */

import type { QueryConstraint } from 'firebase/firestore';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { OvertimeFilters } from '@/domains/people/features/overtime/schemas';
import type {
  OvertimeRequest,
  OvertimeRequestStatus,
  UpdateOvertimeRequestInput,
} from '@/domains/people/features/overtime/types';
import { db } from '@/shared/lib/firebase';

const COLLECTION = 'overtimeRequests';

/**
 * Query Keys Factory (TanStack Query)
 */
export const overtimeKeys = {
  all: ['overtime'] as const,
  lists: () => [...overtimeKeys.all, 'list'] as const,
  list: (filters?: OvertimeFilters) => [...overtimeKeys.lists(), filters ?? {}] as const,
  details: () => [...overtimeKeys.all, 'detail'] as const,
  detail: (id: string) => [...overtimeKeys.details(), id] as const,
  myRequests: (employeeId: string) => [...overtimeKeys.all, 'myRequests', employeeId] as const,
  pending: () => [...overtimeKeys.all, 'pending'] as const,
};

/**
 * Convert Firestore Timestamp to Date
 */
function convertTimestamps(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Timestamp) {
    return data.toDate();
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertTimestamps(item));
  }

  if (typeof data === 'object') {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertTimestamps(value);
    }
    return converted;
  }

  return data;
}

/**
 * Overtime Service
 */
export const overtimeService = {
  /**
   * Get all OT requests with optional filters
   */
  async getAll(filters?: OvertimeFilters): Promise<OvertimeRequest[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.overtimeType) {
        constraints.push(where('overtimeType', '==', filters.overtimeType));
      }

      if (filters?.employeeId) {
        constraints.push(where('employeeId', '==', filters.employeeId));
      }

      if (filters?.department) {
        constraints.push(where('department', '==', filters.department));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, COLLECTION), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((docSnap) => {
        const data = convertTimestamps(docSnap.data()) as OvertimeRequest;
        return {
          ...data,
          id: docSnap.id,
        };
      });
    } catch (error) {
      console.error('Failed to fetch OT requests:', error);
      throw new Error('ไม่สามารถดึงข้อมูล OT ได้');
    }
  },

  /**
   * Get OT request by ID
   */
  async getById(id: string): Promise<OvertimeRequest | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = convertTimestamps(snapshot.data()) as OvertimeRequest;
      return {
        ...data,
        id: snapshot.id,
      };
    } catch (error) {
      console.error(`Failed to fetch OT request ${id}:`, error);
      throw new Error('ไม่สามารถดึงข้อมูล OT ได้');
    }
  },

  /**
   * Get my OT requests
   */
  async getMyRequests(employeeId: string): Promise<OvertimeRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((docSnap) => {
        const data = convertTimestamps(docSnap.data()) as OvertimeRequest;
        return {
          ...data,
          id: docSnap.id,
        };
      });
    } catch (error) {
      console.error('Failed to fetch my OT requests:', error);
      throw new Error('ไม่สามารถดึงข้อมูล OT ของคุณได้');
    }
  },

  /**
   * Get pending OT requests (for approvers)
   */
  async getPendingRequests(): Promise<OvertimeRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((docSnap) => {
        const data = convertTimestamps(docSnap.data()) as OvertimeRequest;
        return {
          ...data,
          id: docSnap.id,
        };
      });
    } catch (error) {
      console.error('Failed to fetch pending OT requests:', error);
      throw new Error('ไม่สามารถดึงข้อมูล OT ที่รออนุมัติได้');
    }
  },

  /**
   * Create new OT request
   */
  async create(data: Omit<OvertimeRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create OT request:', error);
      throw new Error('ไม่สามารถสร้างคำขอ OT ได้');
    }
  },

  /**
   * Update pending OT request
   */
  async update(requestId: string, data: UpdateOvertimeRequestInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, requestId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error('ไม่พบคำขอ OT');
      }

      const request = snapshot.data() as OvertimeRequest;

      if (request.status !== 'pending') {
        throw new Error('สามารถแก้ไขได้เฉพาะคำขอ OT ที่รออนุมัติเท่านั้น');
      }

      const sanitizedPayload = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
      );

      await updateDoc(docRef, {
        ...sanitizedPayload,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Failed to update OT request ${requestId}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถแก้ไขคำขอ OT ได้');
    }
  },

  /**
   * Clock In for OT
   */
  async clockIn(requestId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, requestId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error('ไม่พบคำขอ OT');
      }

      const request = snapshot.data() as OvertimeRequest;

      if (request.status !== 'approved') {
        throw new Error('คำขอ OT ยังไม่ได้รับอนุมัติ');
      }

      if (request.clockStatus !== 'not-started') {
        throw new Error('ได้ลงเวลาเข้า OT แล้ว');
      }

      await updateDoc(docRef, {
        actualClockInTime: Timestamp.now(),
        clockStatus: 'clocked-in',
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to clock in for OT:', error);
      throw error;
    }
  },

  /**
   * Clock Out from OT
   */
  async clockOut(requestId: string, notes?: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, requestId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error('ไม่พบคำขอ OT');
      }

      const request = snapshot.data() as OvertimeRequest;

      if (request.clockStatus !== 'clocked-in') {
        throw new Error('ต้องลงเวลาเข้า OT ก่อน');
      }

      const clockOutTime = Timestamp.now();
      const clockInTime = request.actualClockInTime as Timestamp;

      // Calculate actual hours
      const durationMs = clockOutTime.toMillis() - clockInTime.toMillis();
      const actualHours = durationMs / (1000 * 60 * 60);

      // Calculate pay (simplified - should get base salary from employee record)
      // This is a placeholder calculation
      const calculatedPay = actualHours * request.overtimeRate * 100; // Assuming base rate of 100/hour

      await updateDoc(docRef, {
        actualClockOutTime: clockOutTime,
        actualHours,
        calculatedPay,
        clockStatus: 'clocked-out',
        status: 'completed',
        notes,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to clock out from OT:', error);
      throw error;
    }
  },

  /**
   * Approve OT request
   */
  async approve(
    requestId: string,
    approverId: string,
    approverName: string,
    comments?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, requestId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error('ไม่พบคำขอ OT');
      }

      const request = snapshot.data() as OvertimeRequest;

      if (request.status !== 'pending') {
        throw new Error('คำขอ OT นี้ไม่สามารถอนุมัติได้');
      }

      await updateDoc(docRef, {
        status: 'approved' as OvertimeRequestStatus,
        approverId,
        approverName,
        approvalDate: Timestamp.now(),
        approvalComments: comments || null,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to approve OT request:', error);
      throw error;
    }
  },

  /**
   * Reject OT request
   */
  async reject(
    requestId: string,
    approverId: string,
    approverName: string,
    reason: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, requestId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error('ไม่พบคำขอ OT');
      }

      const request = snapshot.data() as OvertimeRequest;

      if (request.status !== 'pending') {
        throw new Error('คำขอ OT นี้ไม่สามารถปฏิเสธได้');
      }

      await updateDoc(docRef, {
        status: 'rejected' as OvertimeRequestStatus,
        approverId,
        approverName,
        approvalDate: Timestamp.now(),
        rejectionReason: reason,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to reject OT request:', error);
      throw error;
    }
  },

  /**
   * Cancel OT request (by employee)
   */
  async cancel(requestId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, requestId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error('ไม่พบคำขอ OT');
      }

      const request = snapshot.data() as OvertimeRequest;

      if (!['pending', 'approved'].includes(request.status)) {
        throw new Error('ไม่สามารถยกเลิกคำขอ OT นี้ได้');
      }

      if (request.clockStatus !== 'not-started') {
        throw new Error('ไม่สามารถยกเลิกคำขอ OT ที่เริ่มลงเวลาแล้ว');
      }

      await updateDoc(docRef, {
        status: 'cancelled' as OvertimeRequestStatus,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to cancel OT request:', error);
      throw error;
    }
  },
};
