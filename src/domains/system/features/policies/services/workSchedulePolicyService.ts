/**
 * Work Schedule Policy Service
 * Business logic for work schedule policy management
 */

import {
  addDoc,
  collection,
  type DocumentData,
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
import { WorkSchedulePolicySchema } from '@/domains/system/features/policies/schemas/workSchedulePolicySchema';
import { db } from '@/shared/lib/firebase';
import type {
  CreateWorkSchedulePolicyInput,
  TimeValidationResult,
  UpdateWorkSchedulePolicyInput,
  WorkSchedulePolicy,
  WorkSchedulePolicyFilters,
} from '../types/workSchedulePolicy';

const COLLECTION_NAME = 'workSchedulePolicies';

/**
 * Convert Firestore document to WorkSchedulePolicy with validation
 */
function docToWorkSchedulePolicy(id: string, data: DocumentData): WorkSchedulePolicy | null {
  const validation = WorkSchedulePolicySchema.safeParse({ id, ...data });

  if (!validation.success) {
    console.error('Invalid work schedule policy document', {
      id,
      issues: validation.error.issues,
    });
    return null;
  }

  const parsed = validation.data;

  return {
    id: parsed.id,
    name: parsed.name,
    nameEn: parsed.nameEn,
    description: parsed.description,
    code: parsed.code,
    hoursPerDay: parsed.hoursPerDay,
    hoursPerWeek: parsed.hoursPerWeek,
    daysPerWeek: parsed.daysPerWeek,
    workingDays: parsed.workingDays,
    standardStartTime: parsed.standardStartTime,
    standardEndTime: parsed.standardEndTime,
    breakDuration: parsed.breakDuration,
    lateThresholdMinutes: parsed.lateThresholdMinutes,
    earlyLeaveThresholdMinutes: parsed.earlyLeaveThresholdMinutes,
    gracePeriodMinutes: parsed.gracePeriodMinutes,
    allowFlexibleTime: parsed.allowFlexibleTime,
    flexibleStartTimeRange: parsed.flexibleStartTimeRange ?? undefined,
    flexibleEndTimeRange: parsed.flexibleEndTimeRange ?? undefined,
    overtimeStartsAfter: parsed.overtimeStartsAfter,
    maxOvertimeHoursPerDay: parsed.maxOvertimeHoursPerDay,
    applicableDepartments: parsed.applicableDepartments,
    applicablePositions: parsed.applicablePositions,
    applicableEmploymentTypes: parsed.applicableEmploymentTypes,
    isActive: parsed.isActive,
    effectiveDate: parsed.effectiveDate,
    expiryDate: parsed.expiryDate ?? undefined,
    tenantId: parsed.tenantId,
    createdAt: parsed.createdAt,
    updatedAt: parsed.updatedAt,
  };
}

/**
 * Parse time string (HH:mm) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculate time difference in minutes
 */
function _calculateTimeDifference(time1: string, time2: string): number {
  const minutes1 = timeToMinutes(time1);
  const minutes2 = timeToMinutes(time2);
  return minutes1 - minutes2;
}

export const workSchedulePolicyService = {
  /**
   * Create work schedule policy
   */
  async create(tenantId: string, input: CreateWorkSchedulePolicyInput): Promise<string> {
    try {
      // Check if code already exists
      const existing = await this.getByCode(tenantId, input.code);
      if (existing) {
        throw new Error('Policy code already exists');
      }

      // Validate time ranges
      if (input.allowFlexibleTime && input.flexibleStartTimeRange) {
        if (
          timeToMinutes(input.flexibleStartTimeRange.latest) <=
          timeToMinutes(input.flexibleStartTimeRange.earliest)
        ) {
          throw new Error('Flexible start time range is invalid');
        }
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name: input.name,
        nameEn: input.nameEn,
        description: input.description,
        code: input.code,
        hoursPerDay: input.hoursPerDay,
        hoursPerWeek: input.hoursPerWeek,
        daysPerWeek: input.daysPerWeek,
        workingDays: input.workingDays,
        standardStartTime: input.standardStartTime,
        standardEndTime: input.standardEndTime,
        breakDuration: input.breakDuration,
        lateThresholdMinutes: input.lateThresholdMinutes,
        earlyLeaveThresholdMinutes: input.earlyLeaveThresholdMinutes,
        gracePeriodMinutes: input.gracePeriodMinutes,
        allowFlexibleTime: input.allowFlexibleTime,
        flexibleStartTimeRange: input.flexibleStartTimeRange ?? null,
        flexibleEndTimeRange: input.flexibleEndTimeRange ?? null,
        overtimeStartsAfter: input.overtimeStartsAfter,
        maxOvertimeHoursPerDay: input.maxOvertimeHoursPerDay,
        applicableDepartments: input.applicableDepartments,
        applicablePositions: input.applicablePositions,
        applicableEmploymentTypes: input.applicableEmploymentTypes,
        isActive: true,
        effectiveDate: Timestamp.fromDate(input.effectiveDate),
        expiryDate: input.expiryDate ? Timestamp.fromDate(input.expiryDate) : null,
        tenantId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create work schedule policy', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create work schedule policy');
    }
  },

  /**
   * Get policy by ID
   */
  async getById(id: string): Promise<WorkSchedulePolicy | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        return null;
      }

      return docToWorkSchedulePolicy(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch work schedule policy', error);
      throw new Error('Failed to fetch work schedule policy');
    }
  },

  /**
   * Get policy by code
   */
  async getByCode(tenantId: string, code: string): Promise<WorkSchedulePolicy | null> {
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

      return docToWorkSchedulePolicy(doc.id, doc.data());
    } catch (error) {
      console.error('Failed to fetch work schedule policy by code', error);
      throw new Error('Failed to fetch work schedule policy');
    }
  },

  /**
   * Get all policies with filters
   * Note: Firestore only allows ONE array-contains clause per query,
   * so we fetch all active policies and filter in memory
   */
  async getAll(
    tenantId: string,
    filters?: WorkSchedulePolicyFilters
  ): Promise<WorkSchedulePolicy[]> {
    try {
      const constraints: QueryConstraint[] = [where('tenantId', '==', tenantId)];

      // Only add isActive filter to query (more efficient than array-contains)
      if (filters?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      let policies = snapshot.docs
        .map((doc) => docToWorkSchedulePolicy(doc.id, doc.data()))
        .filter((policy): policy is WorkSchedulePolicy => policy !== null);

      // Filter in memory (because Firestore doesn't support multiple array-contains)
      if (filters?.department) {
        policies = policies.filter((policy) =>
          policy.applicableDepartments?.includes(filters.department!)
        );
      }

      if (filters?.position) {
        policies = policies.filter((policy) =>
          policy.applicablePositions?.includes(filters.position!)
        );
      }

      if (filters?.employmentType) {
        policies = policies.filter((policy) =>
          policy.applicableEmploymentTypes?.includes(filters.employmentType!)
        );
      }

      return policies;
    } catch (error) {
      console.error('Failed to fetch work schedule policies', error);
      throw new Error('Failed to fetch work schedule policies');
    }
  },

  /**
   * Update policy
   */
  async update(id: string, input: UpdateWorkSchedulePolicyInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('Work schedule policy not found');
      }

      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.nameEn !== undefined) updateData.nameEn = input.nameEn;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.hoursPerDay !== undefined) updateData.hoursPerDay = input.hoursPerDay;
      if (input.hoursPerWeek !== undefined) updateData.hoursPerWeek = input.hoursPerWeek;
      if (input.daysPerWeek !== undefined) updateData.daysPerWeek = input.daysPerWeek;
      if (input.workingDays !== undefined) updateData.workingDays = input.workingDays;
      if (input.standardStartTime !== undefined)
        updateData.standardStartTime = input.standardStartTime;
      if (input.standardEndTime !== undefined) updateData.standardEndTime = input.standardEndTime;
      if (input.breakDuration !== undefined) updateData.breakDuration = input.breakDuration;
      if (input.lateThresholdMinutes !== undefined)
        updateData.lateThresholdMinutes = input.lateThresholdMinutes;
      if (input.earlyLeaveThresholdMinutes !== undefined)
        updateData.earlyLeaveThresholdMinutes = input.earlyLeaveThresholdMinutes;
      if (input.gracePeriodMinutes !== undefined)
        updateData.gracePeriodMinutes = input.gracePeriodMinutes;
      if (input.allowFlexibleTime !== undefined)
        updateData.allowFlexibleTime = input.allowFlexibleTime;
      if (input.flexibleStartTimeRange !== undefined)
        updateData.flexibleStartTimeRange = input.flexibleStartTimeRange;
      if (input.flexibleEndTimeRange !== undefined)
        updateData.flexibleEndTimeRange = input.flexibleEndTimeRange;
      if (input.overtimeStartsAfter !== undefined)
        updateData.overtimeStartsAfter = input.overtimeStartsAfter;
      if (input.maxOvertimeHoursPerDay !== undefined)
        updateData.maxOvertimeHoursPerDay = input.maxOvertimeHoursPerDay;
      if (input.applicableDepartments !== undefined)
        updateData.applicableDepartments = input.applicableDepartments;
      if (input.applicablePositions !== undefined)
        updateData.applicablePositions = input.applicablePositions;
      if (input.applicableEmploymentTypes !== undefined)
        updateData.applicableEmploymentTypes = input.applicableEmploymentTypes;
      if (input.effectiveDate !== undefined)
        updateData.effectiveDate = Timestamp.fromDate(input.effectiveDate);
      if (input.expiryDate !== undefined)
        updateData.expiryDate = input.expiryDate ? Timestamp.fromDate(input.expiryDate) : null;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Failed to update work schedule policy', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update work schedule policy');
    }
  },

  /**
   * Delete policy
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete work schedule policy', error);
      throw new Error('Failed to delete work schedule policy');
    }
  },

  /**
   * Validate clock-in time
   */
  validateClockInTime(
    policy: WorkSchedulePolicy,
    clockInTime: string,
    date: Date
  ): TimeValidationResult {
    const dayOfWeek = date.getDay();

    // Check if it's a working day
    if (!policy.workingDays.includes(dayOfWeek)) {
      return {
        isValid: false,
        message: 'ไม่ใช่วันทำงาน',
      };
    }

    const standardStart = timeToMinutes(policy.standardStartTime);
    const clockIn = timeToMinutes(clockInTime);

    // Calculate difference
    const diffMinutes = clockIn - standardStart;

    // Check grace period
    if (Math.abs(diffMinutes) <= policy.gracePeriodMinutes) {
      return {
        isValid: true,
        isLate: false,
        minutesLate: 0,
        message: 'ลงเวลาตรงเวลา',
      };
    }

    // Check flexible time range
    if (policy.allowFlexibleTime && policy.flexibleStartTimeRange) {
      const flexEarliest = timeToMinutes(policy.flexibleStartTimeRange.earliest);
      const flexLatest = timeToMinutes(policy.flexibleStartTimeRange.latest);

      if (clockIn >= flexEarliest && clockIn <= flexLatest) {
        return {
          isValid: true,
          isLate: false,
          isWithinFlexibleRange: true,
          message: 'ลงเวลาภายในช่วงเวลายืดหยุ่น',
        };
      }
    }

    // Check if late
    if (diffMinutes > policy.lateThresholdMinutes) {
      return {
        isValid: true,
        isLate: true,
        minutesLate: diffMinutes,
        message: `มาสาย ${diffMinutes} นาที`,
      };
    }

    // Early arrival is ok
    if (diffMinutes < 0) {
      return {
        isValid: true,
        isLate: false,
        minutesLate: 0,
        message: 'มาก่อนเวลา',
      };
    }

    return {
      isValid: true,
      isLate: false,
      minutesLate: 0,
      message: 'ลงเวลาตรงเวลา',
    };
  },

  /**
   * Validate clock-out time
   */
  validateClockOutTime(
    policy: WorkSchedulePolicy,
    clockOutTime: string,
    date: Date
  ): TimeValidationResult {
    const dayOfWeek = date.getDay();

    // Check if it's a working day
    if (!policy.workingDays.includes(dayOfWeek)) {
      return {
        isValid: false,
        message: 'ไม่ใช่วันทำงาน',
      };
    }

    const standardEnd = timeToMinutes(policy.standardEndTime);
    const clockOut = timeToMinutes(clockOutTime);

    // Calculate difference
    const diffMinutes = standardEnd - clockOut;

    // Check grace period
    if (Math.abs(diffMinutes) <= policy.gracePeriodMinutes) {
      return {
        isValid: true,
        isEarlyLeave: false,
        minutesEarly: 0,
        message: 'ลงเวลาตรงเวลา',
      };
    }

    // Check if early leave
    if (diffMinutes > policy.earlyLeaveThresholdMinutes) {
      return {
        isValid: true,
        isEarlyLeave: true,
        minutesEarly: diffMinutes,
        message: `กลับก่อนเวลา ${diffMinutes} นาที`,
      };
    }

    // Late departure is ok (might be OT)
    if (diffMinutes < 0) {
      const overtimeMinutes = Math.abs(diffMinutes);
      return {
        isValid: true,
        isEarlyLeave: false,
        minutesEarly: 0,
        message: `ทำงานล่วงเวลา ${overtimeMinutes} นาที`,
      };
    }

    return {
      isValid: true,
      isEarlyLeave: false,
      minutesEarly: 0,
      message: 'ลงเวลาตรงเวลา',
    };
  },

  /**
   * Check if date is a working day
   */
  isWorkingDay(policy: WorkSchedulePolicy, date: Date): boolean {
    const dayOfWeek = date.getDay();
    return policy.workingDays.includes(dayOfWeek);
  },

  /**
   * Calculate working hours between two times
   */
  calculateWorkingHours(policy: WorkSchedulePolicy, startTime: string, endTime: string): number {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (end <= start) {
      return 0;
    }

    const totalMinutes = end - start;
    const workingMinutes = totalMinutes - policy.breakDuration;

    return workingMinutes / 60; // Convert to hours
  },
};
