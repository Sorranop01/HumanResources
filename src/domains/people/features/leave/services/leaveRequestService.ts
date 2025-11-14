/**
 * Leave Request Service
 * ✅ Uses Zod schemas for runtime validation
 * Business logic for leave requests (คำขอลา)
 */

import {
  collection,
  type DocumentData,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  type QueryConstraint,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { employeeService } from '../../employees/services/employeeService';
import { LeaveRequestSchema } from '../schemas';
import type {
  ApproveLeaveRequestInput,
  CreateLeaveRequestInput,
  LeaveRequest,
  LeaveRequestFilters,
  RejectLeaveRequestInput,
  UpdateLeaveRequestInput,
} from '../types';
import { leaveEntitlementService } from './leaveEntitlementService';
import { leaveTypeService } from './leaveTypeService';

const COLLECTION_NAME = 'leaveRequests';

/**
 * Convert Firestore Timestamp to Date (recursively handles nested objects and arrays)
 */
function convertTimestamps(data: unknown): unknown {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Convert Timestamp to Date
  if (data instanceof Timestamp) {
    return data.toDate();
  }

  // Handle arrays - recursively convert each element
  if (Array.isArray(data)) {
    return data.map((item) => convertTimestamps(item));
  }

  // Handle objects - recursively convert each property
  if (typeof data === 'object') {
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertTimestamps(value);
    }

    return converted;
  }

  // Return primitive values as-is
  return data;
}

/**
 * Convert Firestore document to LeaveRequest with Zod validation
 * ✅ Converts Timestamps to Dates BEFORE validation
 */
function docToLeaveRequest(id: string, data: DocumentData): LeaveRequest | null {
  // Convert all Timestamps to Dates first
  const converted = convertTimestamps(data) as Record<string, unknown>;

  // ✅ Validate with Zod schema AFTER conversion
  const validation = LeaveRequestSchema.safeParse({
    id,
    ...converted,
  });

  if (!validation.success) {
    console.warn(
      `⚠️ Skipping invalid leave request ${id}:`,
      'Schema validation failed. Run seed scripts to fix data.'
    );
    if (import.meta.env.DEV) {
      console.error('Validation errors:', validation.error.errors);
    }
    return null;
  }

  // ✅ Type assertion: After timestamp conversion and validation,
  // we know all timestamps are Date objects (LeaveRequest type)
  return validation.data as LeaveRequest;
}

export const leaveRequestService = {
  /**
   * Calculate business days between two dates (excluding weekends)
   * For production, should also exclude public holidays
   */
  calculateBusinessDays(startDate: Date, endDate: Date, isHalfDay: boolean): number {
    if (isHalfDay) {
      return 0.5;
    }

    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  },

  /**
   * Generate unique request number (format: LV-YYYY-NNN)
   */
  async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `LV-${year}-`;

    try {
      // Query requests from current year
      const q = query(
        collection(db, COLLECTION_NAME),
        where('requestNumber', '>=', prefix),
        where('requestNumber', '<', `LV-${year + 1}-`),
        orderBy('requestNumber', 'desc')
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return `${prefix}001`;
      }

      // Get the last number and increment
      const lastDoc = snapshot.docs[0];
      if (!lastDoc) {
        return `${prefix}001`;
      }
      const lastRequest = lastDoc.data();
      const lastNumber = Number.parseInt(lastRequest.requestNumber.split('-')[2], 10);
      const nextNumber = lastNumber + 1;

      return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Failed to generate request number', error);
      // Fallback to timestamp-based number
      const timestamp = Date.now().toString().slice(-3);
      return `${prefix}${timestamp}`;
    }
  },

  /**
   * Check for overlapping leave requests
   */
  async hasOverlappingLeave(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeRequestId?: string
  ): Promise<boolean> {
    try {
      // Query approved or pending requests for the employee
      const q = query(
        collection(db, COLLECTION_NAME),
        where('employeeId', '==', employeeId),
        where('status', 'in', ['pending', 'approved'])
      );

      const snapshot = await getDocs(q);

      for (const docSnap of snapshot.docs) {
        // Skip the current request if updating
        if (excludeRequestId && docSnap.id === excludeRequestId) {
          continue;
        }

        const data = docSnap.data();
        const existingStart = data.startDate.toDate();
        const existingEnd = data.endDate.toDate();

        // Check for overlap
        if (startDate <= existingEnd && endDate >= existingStart) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to check overlapping leave', error);
      return false;
    }
  },

  /**
   * Validate leave request before creation
   */
  async validateLeaveRequest(
    employeeId: string,
    leaveTypeId: string,
    startDate: Date,
    endDate: Date,
    isHalfDay: boolean,
    hasCertificate: boolean
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // Get leave type
      const leaveType = await leaveTypeService.getById(leaveTypeId);
      if (!leaveType) {
        return { valid: false, error: 'ไม่พบประเภทการลาที่เลือก' };
      }

      // Check if leave type is active
      if (!leaveType.isActive) {
        return { valid: false, error: 'ประเภทการลานี้ถูกปิดใช้งานแล้ว' };
      }

      // Validate date range
      if (endDate < startDate) {
        return { valid: false, error: 'วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น' };
      }

      // Calculate days
      const totalDays = this.calculateBusinessDays(startDate, endDate, isHalfDay);

      // Check max consecutive days
      if (leaveType.maxConsecutiveDays > 0 && totalDays > leaveType.maxConsecutiveDays) {
        return {
          valid: false,
          error: `ไม่สามารถลาติดต่อกันเกิน ${leaveType.maxConsecutiveDays} วันได้`,
        };
      }

      // Check certificate requirement
      if (leaveType.requiresCertificate && totalDays > leaveType.certificateRequiredAfterDays) {
        if (!hasCertificate) {
          return {
            valid: false,
            error: `ต้องแนบใบรับรองแพทย์สำหรับการลามากกว่า ${leaveType.certificateRequiredAfterDays} วัน`,
          };
        }
      }

      // Check entitlement balance (for non-unpaid leave)
      if (leaveType.code !== 'UNPAID') {
        const currentYear = new Date().getFullYear();
        const entitlement = await leaveEntitlementService.getByEmployeeAndLeaveType(
          employeeId,
          leaveTypeId,
          currentYear
        );

        if (!entitlement) {
          return { valid: false, error: 'ไม่พบสิทธิ์การลาสำหรับประเภทนี้' };
        }

        if (entitlement.remaining < totalDays) {
          return {
            valid: false,
            error: `สิทธิ์การลาไม่เพียงพอ (เหลือ ${entitlement.remaining} วัน ต้องการ ${totalDays} วัน)`,
          };
        }
      }

      // Check for overlapping requests
      const hasOverlap = await this.hasOverlappingLeave(employeeId, startDate, endDate);
      if (hasOverlap) {
        return { valid: false, error: 'มีคำขอลาที่ซ้อนทับกับวันที่ที่เลือกอยู่แล้ว' };
      }

      return { valid: true };
    } catch (error) {
      console.error('Failed to validate leave request', error);
      return { valid: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบคำขอลา' };
    }
  },

  /**
   * Build approval chain
   * For now, simple 2-level approval: Manager -> HR
   * In production, this should be configurable based on org structure
   */
  buildApprovalChain(_employeeId: string): Array<{
    level: number;
    approverId: string;
    approverName: string;
    approverRole: string;
    status: 'pending' | 'approved' | 'rejected';
    actionAt?: Date;
    comments?: string;
  }> {
    // TODO: Get manager and HR from employee data or org structure
    // For now, return a basic 2-level chain
    return [
      {
        level: 1,
        approverId: 'manager-id', // Should be fetched from employee's manager
        approverName: 'ผู้จัดการ',
        approverRole: 'Manager',
        status: 'pending',
      },
      {
        level: 2,
        approverId: 'hr-id', // Should be fetched from HR role
        approverName: 'ฝ่ายทรัพยากรบุคคล',
        approverRole: 'HR',
        status: 'pending',
      },
    ];
  },

  /**
   * Create leave request
   */
  async create(input: CreateLeaveRequestInput): Promise<string> {
    try {
      // Validate request
      const validation = await this.validateLeaveRequest(
        input.employeeId,
        input.leaveTypeId,
        input.startDate,
        input.endDate,
        input.isHalfDay ?? false,
        input.hasCertificate ?? false
      );

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Get employee details
      const employee = await employeeService.getById(input.employeeId);
      if (!employee) {
        throw new Error('ไม่พบข้อมูลพนักงาน');
      }

      // Get leave type details
      const leaveType = await leaveTypeService.getById(input.leaveTypeId);
      if (!leaveType) {
        throw new Error('ไม่พบข้อมูลประเภทการลา');
      }

      // Calculate total days
      const totalDays = this.calculateBusinessDays(
        input.startDate,
        input.endDate,
        input.isHalfDay ?? false
      );

      // Generate request number
      const requestNumber = await this.generateRequestNumber();

      // Build approval chain
      const approvalChain = this.buildApprovalChain(input.employeeId);

      // Create document
      const docRef = doc(collection(db, COLLECTION_NAME));

      await setDoc(docRef, {
        requestNumber,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        departmentId: employee.department,
        departmentName: employee.departmentName,
        positionId: employee.position,
        positionName: employee.positionName,
        leaveTypeId: leaveType.id,
        leaveTypeCode: leaveType.code,
        leaveTypeName: leaveType.nameTh,
        startDate: Timestamp.fromDate(input.startDate),
        endDate: Timestamp.fromDate(input.endDate),
        totalDays,
        isHalfDay: input.isHalfDay ?? false,
        halfDayPeriod: input.halfDayPeriod ?? null,
        reason: input.reason,
        contactDuringLeave: input.contactDuringLeave ?? null,
        workHandoverTo: input.workHandoverTo ?? null,
        workHandoverNotes: input.workHandoverNotes ?? null,
        hasCertificate: input.hasCertificate ?? false,
        certificateUrl: input.certificateUrl ?? null,
        certificateFileName: input.certificateFileName ?? null,
        status: 'pending',
        submittedAt: Timestamp.now(),
        approvalChain: approvalChain.map((step) => ({
          ...step,
          actionAt: step.actionAt ? Timestamp.fromDate(step.actionAt) : null,
        })),
        currentApprovalLevel: 1,
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
        cancelledBy: null,
        cancelledAt: null,
        cancellationReason: null,
        tenantId: 'default',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Update entitlement (add to pending)
      const currentYear = new Date().getFullYear();
      const entitlement = await leaveEntitlementService.getByEmployeeAndLeaveType(
        input.employeeId,
        input.leaveTypeId,
        currentYear
      );

      if (entitlement) {
        await leaveEntitlementService.updateBalance(entitlement.id, totalDays, {
          pending: totalDays,
          operation: 'add',
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Failed to create leave request', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถสร้างคำขอลาได้');
    }
  },

  /**
   * Get leave request by ID
   */
  async getById(id: string): Promise<LeaveRequest | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        return null;
      }

      return docToLeaveRequest(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch leave request', error);
      throw new Error('ไม่สามารถดึงข้อมูลคำขอลาได้');
    }
  },

  /**
   * Get leave requests with filters
   */
  async getAll(filters?: LeaveRequestFilters): Promise<LeaveRequest[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.employeeId) {
        constraints.push(where('employeeId', '==', filters.employeeId));
      }

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.leaveTypeId) {
        constraints.push(where('leaveTypeId', '==', filters.leaveTypeId));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      // ✅ Filter out null results from failed validations
      const results = snapshot.docs
        .map((doc) => docToLeaveRequest(doc.id, doc.data()))
        .filter((request): request is LeaveRequest => request !== null);

      return results;
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      // Return empty array instead of throwing to prevent UI break
      return [];
    }
  },

  /**
   * Update leave request (only if status is draft)
   */
  async update(id: string, input: UpdateLeaveRequestInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('ไม่พบคำขอลา');
      }

      const current = docSnap.data();

      if (current.status !== 'draft') {
        throw new Error('ไม่สามารถแก้ไขคำขอลาที่ส่งไปแล้ว');
      }

      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      if (input.startDate) updateData.startDate = Timestamp.fromDate(input.startDate);
      if (input.endDate) updateData.endDate = Timestamp.fromDate(input.endDate);
      if (input.isHalfDay !== undefined) updateData.isHalfDay = input.isHalfDay;
      if (input.halfDayPeriod) updateData.halfDayPeriod = input.halfDayPeriod;
      if (input.reason) updateData.reason = input.reason;
      if (input.contactDuringLeave !== undefined)
        updateData.contactDuringLeave = input.contactDuringLeave;
      if (input.workHandoverTo !== undefined) updateData.workHandoverTo = input.workHandoverTo;
      if (input.workHandoverNotes !== undefined)
        updateData.workHandoverNotes = input.workHandoverNotes;
      if (input.hasCertificate !== undefined) updateData.hasCertificate = input.hasCertificate;
      if (input.certificateUrl !== undefined) updateData.certificateUrl = input.certificateUrl;
      if (input.certificateFileName !== undefined)
        updateData.certificateFileName = input.certificateFileName;

      // Recalculate total days if dates changed
      if (input.startDate || input.endDate) {
        const startDate = input.startDate ?? current.startDate.toDate();
        const endDate = input.endDate ?? current.endDate.toDate();
        const isHalfDay = input.isHalfDay ?? current.isHalfDay;

        updateData.totalDays = this.calculateBusinessDays(startDate, endDate, isHalfDay);
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Failed to update leave request', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถอัปเดตคำขอลาได้');
    }
  },

  /**
   * Approve leave request
   */
  async approve(id: string, input: ApproveLeaveRequestInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('ไม่พบคำขอลา');
      }

      const request = docSnap.data();

      if (request.status !== 'pending') {
        throw new Error('ไม่สามารถอนุมัติคำขอลาที่ไม่ได้รออนุมัติ');
      }

      // Update approval chain
      const approvalChain = [...request.approvalChain];
      const currentLevel = request.currentApprovalLevel;
      const stepIndex = approvalChain.findIndex(
        (step: { level: number }) => step.level === currentLevel
      );

      if (stepIndex === -1) {
        throw new Error('ไม่พบขั้นตอนการอนุมัติ');
      }

      // Update current step
      approvalChain[stepIndex] = {
        ...approvalChain[stepIndex],
        status: 'approved',
        actionAt: Timestamp.now(),
        comments: input.comments ?? null,
      };

      // Check if this is the last approval level
      const isLastLevel = currentLevel === approvalChain.length;
      const newStatus = isLastLevel ? 'approved' : 'pending';
      const newLevel = isLastLevel ? currentLevel : currentLevel + 1;

      await updateDoc(docRef, {
        approvalChain,
        currentApprovalLevel: newLevel,
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      // If fully approved, update entitlement balances
      if (isLastLevel) {
        const currentYear = new Date().getFullYear();
        const entitlement = await leaveEntitlementService.getByEmployeeAndLeaveType(
          request.employeeId,
          request.leaveTypeId,
          currentYear
        );

        if (entitlement) {
          // Move from pending to used
          await leaveEntitlementService.updateBalance(entitlement.id, request.totalDays, {
            pending: request.totalDays,
            operation: 'subtract',
          });
          await leaveEntitlementService.updateBalance(entitlement.id, request.totalDays, {
            used: request.totalDays,
            operation: 'add',
          });
        }
      }
    } catch (error) {
      console.error('Failed to approve leave request', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถอนุมัติคำขอลาได้');
    }
  },

  /**
   * Reject leave request
   */
  async reject(id: string, input: RejectLeaveRequestInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('ไม่พบคำขอลา');
      }

      const request = docSnap.data();

      if (request.status !== 'pending') {
        throw new Error('ไม่สามารถปฏิเสธคำขอลาที่ไม่ได้รออนุมัติ');
      }

      // Update approval chain
      const approvalChain = [...request.approvalChain];
      const currentLevel = request.currentApprovalLevel;
      const stepIndex = approvalChain.findIndex(
        (step: { level: number }) => step.level === currentLevel
      );

      if (stepIndex === -1) {
        throw new Error('ไม่พบขั้นตอนการอนุมัติ');
      }

      // Update current step
      approvalChain[stepIndex] = {
        ...approvalChain[stepIndex],
        status: 'rejected',
        actionAt: Timestamp.now(),
        comments: input.reason,
      };

      await updateDoc(docRef, {
        approvalChain,
        status: 'rejected',
        rejectedBy: input.approverId,
        rejectedAt: Timestamp.now(),
        rejectionReason: input.reason,
        updatedAt: Timestamp.now(),
      });

      // Remove from pending balance
      const currentYear = new Date().getFullYear();
      const entitlement = await leaveEntitlementService.getByEmployeeAndLeaveType(
        request.employeeId,
        request.leaveTypeId,
        currentYear
      );

      if (entitlement) {
        await leaveEntitlementService.updateBalance(entitlement.id, request.totalDays, {
          pending: request.totalDays,
          operation: 'subtract',
        });
      }
    } catch (error) {
      console.error('Failed to reject leave request', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถปฏิเสธคำขอลาได้');
    }
  },

  /**
   * Cancel leave request (by employee)
   */
  async cancel(id: string, employeeId: string, reason: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('ไม่พบคำขอลา');
      }

      const request = docSnap.data();

      if (request.employeeId !== employeeId) {
        throw new Error('ไม่สามารถยกเลิกคำขอลาของผู้อื่นได้');
      }

      if (request.status !== 'pending' && request.status !== 'approved') {
        throw new Error('ไม่สามารถยกเลิกคำขอลานี้ได้');
      }

      await updateDoc(docRef, {
        status: 'cancelled',
        cancelledBy: employeeId,
        cancelledAt: Timestamp.now(),
        cancellationReason: reason,
        updatedAt: Timestamp.now(),
      });

      // Update entitlement balance
      const currentYear = new Date().getFullYear();
      const entitlement = await leaveEntitlementService.getByEmployeeAndLeaveType(
        request.employeeId,
        request.leaveTypeId,
        currentYear
      );

      if (entitlement) {
        if (request.status === 'pending') {
          // Remove from pending
          await leaveEntitlementService.updateBalance(entitlement.id, request.totalDays, {
            pending: request.totalDays,
            operation: 'subtract',
          });
        } else if (request.status === 'approved') {
          // Return to balance from used
          await leaveEntitlementService.updateBalance(entitlement.id, request.totalDays, {
            used: request.totalDays,
            operation: 'subtract',
          });
        }
      }
    } catch (error) {
      console.error('Failed to cancel leave request', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถยกเลิกคำขอลาได้');
    }
  },

  /**
   * Delete leave request (only if draft)
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('ไม่พบคำขอลา');
      }

      const request = docSnap.data();

      if (request.status !== 'draft') {
        throw new Error('ไม่สามารถลบคำขอลาที่ส่งไปแล้ว');
      }

      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete leave request', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถลบคำขอลาได้');
    }
  },
};
