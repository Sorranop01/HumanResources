import {
  addDoc,
  collection,
  type DocumentData,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { AttendanceRecord, BreakRecord } from '@/domains/people/features/attendance/schemas';
import { leaveRequestService } from '@/domains/people/features/leave';
import { geofenceService } from '@/domains/system/features/policies/services/geofenceService';
import { shiftAssignmentService } from '@/domains/system/features/policies/services/shiftAssignmentService';
import { workSchedulePolicyService } from '@/domains/system/features/policies/services/workSchedulePolicyService';
import type { GeofenceValidation } from '@/domains/system/features/policies/types/geofence';
import { db } from '@/shared/lib/firebase';
import type { AttendanceStats, ClockInInput, ClockOutInput } from '../schemas';
import { AttendanceRecordSchema } from '../schemas';
import {
  calculateEarlyMinutes,
  calculateLateMinutes,
  calculateWorkDuration,
} from '../utils/timeCalculations';
import { attendancePenaltyService } from './attendancePenaltyService';

/**
 * Convert Firestore Timestamp or Date to milliseconds
 */
function toMillis(value: Date | Timestamp): number {
  if (value instanceof Date) {
    return value.getTime();
  }
  return value.toMillis();
}

const ATTENDANCE_COLLECTION = 'attendance';
const TENANT_ID = 'default';

/**
 * Convert Firestore Timestamp to Date
 */
function toDate(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value && typeof value === 'object' && '_seconds' in value) {
    return new Timestamp(
      (value as { _seconds: number; _nanoseconds: number })._seconds,
      (value as { _seconds: number; _nanoseconds: number })._nanoseconds
    ).toDate();
  }
  if (value && typeof value === 'object' && 'seconds' in value) {
    return new Timestamp(
      (value as { seconds: number; nanoseconds: number }).seconds,
      (value as { seconds: number; nanoseconds: number }).nanoseconds
    ).toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date();
}

/**
 * Convert Firestore document to AttendanceRecord with Zod validation
 * ✅ Layer 2: Service Layer Validation
 */
function docToAttendanceRecord(id: string, data: DocumentData): AttendanceRecord | null {
  // Convert Firestore Timestamps to Dates for validation
  const converted = {
    id,
    ...data,
    clockInTime: toDate(data.clockInTime),
    clockOutTime: data.clockOutTime ? toDate(data.clockOutTime) : null,
    approvalDate: data.approvalDate ? toDate(data.approvalDate) : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    clockInLocation: data.clockInLocation
      ? {
          ...data.clockInLocation,
          timestamp: toDate(data.clockInLocation.timestamp),
        }
      : undefined,
    clockOutLocation: data.clockOutLocation
      ? {
          ...data.clockOutLocation,
          timestamp: toDate(data.clockOutLocation.timestamp),
        }
      : undefined,
    breaks:
      data.breaks?.map((breakRecord: DocumentData) => ({
        ...breakRecord,
        startTime: toDate(breakRecord.startTime),
        endTime: breakRecord.endTime ? toDate(breakRecord.endTime) : null,
      })) || [],
  };

  // ✅ Validate with Zod schema
  const validation = AttendanceRecordSchema.safeParse(converted);

  if (!validation.success) {
    console.warn(
      `⚠️ Skipping invalid attendance record ${id}:`,
      'Schema validation failed. Run seed scripts to fix data.'
    );
    if (import.meta.env.DEV) {
      console.error('Validation errors:', validation.error.errors);
    }
    return null;
  }

  // Return validated data (keeps Timestamp format as per schema)
  return validation.data;
}

/**
 * Gets today's date in YYYY-MM-DD format.
 */
const getTodayDateString = (): string => {
  return new Date().toISOString().slice(0, 10);
};

/**
 * Convert date string (YYYY-MM-DD) to Date object
 */
const dateStringToDate = (dateStr: string): Date => {
  return new Date(dateStr);
};

export const attendanceService = {
  /**
   * Fetches the attendance record for a specific user for today.
   * @param userId The ID of the user.
   * @returns The user's attendance record for today, or null if not found.
   */
  async getTodayAttendance(userId: string): Promise<AttendanceRecord | null> {
    const today = getTodayDateString();
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('userId', '==', userId),
      where('date', '==', today),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    if (!docSnap) {
      return null;
    }

    return docToAttendanceRecord(docSnap.id, docSnap.data());
  },

  /**
   * Get employee data from Firestore
   */
  async getEmployee(userId: string): Promise<({ id: string } & DocumentData) | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      const employeeId = userData.employeeId;

      if (!employeeId) {
        return null;
      }

      const employeeDoc = await getDoc(doc(db, 'employees', employeeId));
      if (!employeeDoc.exists()) {
        return null;
      }

      return {
        id: employeeDoc.id,
        ...employeeDoc.data(),
      };
    } catch (error) {
      console.error('Failed to fetch employee', error);
      return null;
    }
  },

  /**
   * Creates a new attendance record for clocking in with late detection.
   * @param input Clock-in input data
   * @returns The newly created attendance record.
   */
  async clockIn(input: ClockInInput): Promise<AttendanceRecord> {
    const now = Timestamp.now();
    const {
      userId,
      employeeId,
      location,
      clockInMethod,
      ipAddress,
      deviceId,
      isRemoteWork,
      notes,
    } = input;

    // Get employee data
    const employee = await this.getEmployee(userId);

    // Default schedule values
    let scheduledStartTime = '09:00';
    let scheduledEndTime = '18:00';
    let workSchedulePolicyId: string | undefined;
    let shiftAssignmentId: string | undefined;
    let gracePeriodMinutes = 5;
    let lateThresholdMinutes = 15;

    try {
      // Try to get shift assignment first
      if (employeeId) {
        const currentShift = await shiftAssignmentService.getCurrentShift(employeeId, new Date());

        if (currentShift) {
          scheduledStartTime = currentShift.effectiveStartTime;
          scheduledEndTime = currentShift.effectiveEndTime;
          shiftAssignmentId = currentShift.assignment.id;
        }
      }

      // If no shift, get work schedule policy
      if (!shiftAssignmentId && employee) {
        const policies = await workSchedulePolicyService.getAll(
          {
          department: employee.departmentId,
          position: employee.positionId,
          employmentType: employee.employmentType,
          isActive: true,
          },
          TENANT_ID
        );

        if (policies.length > 0 && policies[0]) {
          const policy = policies[0];
          scheduledStartTime = policy.standardStartTime;
          scheduledEndTime = policy.standardEndTime;
          gracePeriodMinutes = policy.gracePeriodMinutes;
          lateThresholdMinutes = policy.lateThresholdMinutes;
          workSchedulePolicyId = policy.id;
        }
      }
    } catch (error) {
      console.error('Failed to fetch work schedule, using defaults', error);
    }

    // Calculate late status
    const minutesLate = calculateLateMinutes(now, scheduledStartTime, gracePeriodMinutes);
    const isLate = minutesLate > 0 && minutesLate >= lateThresholdMinutes;

    // Validate geofencing if location is provided
    let geofenceValidation: GeofenceValidation | undefined;
    if (location && employee) {
      try {
        geofenceValidation = await geofenceService.validateClockInLocation(
          location.latitude,
          location.longitude,
          {
            departmentId: employee.departmentId,
            employmentType: employee.employmentType,
          }
        );

        // If geofence validation fails, throw error
        if (!geofenceValidation.isWithinGeofence) {
          throw new Error(geofenceValidation.message);
        }
      } catch (error) {
        console.error('Geofence validation failed', error);
        throw error;
      }
    }

    // Build location data
    const clockInLocation = location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: now,
          isWithinGeofence: geofenceValidation?.isWithinGeofence,
          distanceFromOffice: geofenceValidation?.distanceMeters,
        }
      : undefined;

    const newRecord: Partial<AttendanceRecord> = {
      userId,
      employeeId: employeeId || userId, // ✅ Required by Firestore rules
      clockInTime: now,
      clockOutTime: null,
      status: 'clocked-in' as const,
      date: getTodayDateString(),
      durationHours: null,

      // ✅ Required denormalized fields for Firestore rules
      employeeName: employee?.displayName || employee?.firstName || 'Unknown',
      departmentName: employee?.department || 'Unknown',

      // Schedule reference
      scheduledStartTime,
      scheduledEndTime,

      // Late tracking
      isLate,
      minutesLate,
      isExcusedLate: false,

      // Early leave (initialized)
      isEarlyLeave: false,
      minutesEarly: 0,
      isApprovedEarlyLeave: false,

      // Break tracking (initialized)
      breaks: [],
      totalBreakMinutes: 0,
      unpaidBreakMinutes: 0,

      // Location tracking
      isRemoteWork,

      // Clock-in method
      clockInMethod: clockInMethod || 'web',

      // Validation & approval
      requiresApproval: isLate && minutesLate >= 30, // Require approval if late > 30 min

      // Penalties (will be calculated on clock-out)
      penaltiesApplied: [],

      // Shift premium
      // Flags
      isMissedClockOut: false,
      isManualEntry: false,
      isCorrected: false,

      // ✅ Metadata fields required by Firestore rules
      tenantId: 'default',
      createdAt: now,
      updatedAt: now,
    };

    if (workSchedulePolicyId) {
      newRecord.workSchedulePolicyId = workSchedulePolicyId;
    }

    if (shiftAssignmentId) {
      newRecord.shiftAssignmentId = shiftAssignmentId;
    }

    if (employeeId) {
      newRecord.employeeId = employeeId;
    }

    if (notes) {
      newRecord.notes = notes;
    }

    if (clockInLocation) {
      newRecord.clockInLocation = clockInLocation;
    }

    if (ipAddress) {
      newRecord.ipAddress = ipAddress;
    }

    if (deviceId) {
      newRecord.deviceId = deviceId;
    }

    const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), newRecord);

    return {
      id: docRef.id,
      ...newRecord,
    } as AttendanceRecord;
  },

  /**
   * Updates an attendance record for clocking out with early leave detection.
   * @param input Clock-out input data
   * @param clockInTime The timestamp of the clock-in.
   * @param scheduledEndTime The scheduled end time.
   * @returns The updated attendance record.
   */
  async clockOut(
    input: ClockOutInput,
    clockInTime: Timestamp,
    scheduledEndTime: string,
    gracePeriodMinutes: number = 5,
    earlyLeaveThresholdMinutes: number = 15
  ): Promise<Partial<AttendanceRecord>> {
    const now = Timestamp.now();
    const { recordId, location, clockOutMethod, notes } = input;

    // Get existing record to calculate breaks
    const docRef = doc(db, ATTENDANCE_COLLECTION, recordId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Attendance record not found');
    }

    const existingRecord = docSnap.data() as AttendanceRecord;

    // Calculate early leave status
    const minutesEarly = calculateEarlyMinutes(now, scheduledEndTime, gracePeriodMinutes);
    const isEarlyLeave = minutesEarly > 0 && minutesEarly >= earlyLeaveThresholdMinutes;

    // Calculate work duration (excluding breaks)
    const totalBreakMinutes = existingRecord.totalBreakMinutes || 0;
    const durationHours = calculateWorkDuration(clockInTime, now, totalBreakMinutes);

    // Validate geofencing if location is provided
    let geofenceValidation: GeofenceValidation | undefined;
    if (location && existingRecord.employeeId) {
      try {
        const employee = await this.getEmployee(existingRecord.userId);
        if (employee) {
          geofenceValidation = await geofenceService.validateClockOutLocation(
            location.latitude,
            location.longitude,
            {
              departmentId: employee.departmentId,
              employmentType: employee.employmentType,
            }
          );

          // If geofence validation fails, throw error
          if (!geofenceValidation.isWithinGeofence) {
            throw new Error(geofenceValidation.message);
          }
        }
      } catch (error) {
        console.error('Geofence validation failed', error);
        throw error;
      }
    }

    // Build location data
    const clockOutLocation = location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: now,
          isWithinGeofence: geofenceValidation?.isWithinGeofence,
          distanceFromOffice: geofenceValidation?.distanceMeters,
        }
      : undefined;

    const updatedFields: Partial<AttendanceRecord> = {
      clockOutTime: now,
      status: 'clocked-out' as const,
      durationHours,

      // Early leave tracking
      isEarlyLeave,
      minutesEarly,

      // Clock-out method
      clockOutMethod: clockOutMethod || 'web',

      // Update approval requirement
      requiresApproval: existingRecord.requiresApproval || (isEarlyLeave && minutesEarly >= 30),
    };

    // Add notes if provided
    if (notes) {
      updatedFields.notes = existingRecord.notes
        ? `${existingRecord.notes}\nClock-out: ${notes}`
        : notes;
    }

    if (clockOutLocation) {
      updatedFields.clockOutLocation = clockOutLocation;
    }

    await updateDoc(docRef, updatedFields);

    // Calculate and apply penalties automatically
    try {
      if (existingRecord.employeeId) {
        const employee = await this.getEmployee(existingRecord.userId);
        if (employee) {
          const updatedRecord: AttendanceRecord = {
            ...existingRecord,
            ...updatedFields,
          } as AttendanceRecord;

          // Calculate penalties
          const penalties = await attendancePenaltyService.calculateAndApplyPenalties(
            updatedRecord,
            {
              employeeId: existingRecord.employeeId,
              departmentId: employee.departmentId,
              positionId: employee.positionId,
              employmentType: employee.employmentType,
              baseSalary: employee.salary?.baseSalary ?? 0,
            }
          );

          console.log('Applied penalties:', penalties);
        }
      }
    } catch (error) {
      console.error('Failed to calculate penalties, but clock-out succeeded', error);
      // Don't throw - clock-out was successful even if penalty calculation failed
    }

    return updatedFields;
  },

  /**
   * Fetches the attendance history for a specific user.
   * @param userId The ID of the user.
   * @returns A list of the user's attendance records.
   */
  async getAttendanceHistory(userId: string): Promise<AttendanceRecord[]> {
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AttendanceRecord);
  },

  /**
   * Validates if a user can clock in
   * Checks for:
   * 1. Already clocked in today
   * 2. On approved leave
   */
  async validateClockIn(
    userId: string,
    employeeId?: string
  ): Promise<{ canClockIn: boolean; reason?: string }> {
    try {
      const today = getTodayDateString();

      // Check if already clocked in today
      const existingRecord = await this.getTodayAttendance(userId);
      if (existingRecord && existingRecord.status === 'clocked-in') {
        return {
          canClockIn: false,
          reason: 'คุณได้ลงเวลาเข้างานวันนี้แล้ว',
        };
      }

      // Check if on approved leave (only if employeeId is provided)
      if (employeeId) {
        const todayDate = dateStringToDate(today);
        const employeeIdStrict = employeeId as string;
        const hasLeave = await leaveRequestService.hasOverlappingLeave(
          employeeIdStrict,
          todayDate,
          todayDate
        );

        if (hasLeave) {
          return {
            canClockIn: false,
            reason: 'คุณมีการลางานในวันนี้ ไม่สามารถลงเวลาได้',
          };
        }
      }

      return { canClockIn: true };
    } catch (error) {
      console.error('Failed to validate clock in', error);
      return {
        canClockIn: false,
        reason: 'เกิดข้อผิดพลาดในการตรวจสอบ',
      };
    }
  },

  /**
   * Get attendance records for a specific month
   */
  async getMonthlyAttendance(
    userId: string,
    month: number,
    year: number
  ): Promise<AttendanceRecord[]> {
    try {
      // Create date range for the month
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      const q = query(
        collection(db, ATTENDANCE_COLLECTION),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AttendanceRecord);
    } catch (error) {
      console.error('Failed to fetch monthly attendance', error);
      throw new Error('ไม่สามารถดึงข้อมูลการเข้างานรายเดือนได้');
    }
  },

  /**
   * Get attendance records for a date range
   */
  async getAttendanceByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<AttendanceRecord[]> {
    try {
      const q = query(
        collection(db, ATTENDANCE_COLLECTION),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AttendanceRecord);
    } catch (error) {
      console.error('Failed to fetch attendance by date range', error);
      throw new Error('ไม่สามารถดึงข้อมูลการเข้างานได้');
    }
  },

  /**
   * Calculate attendance statistics for a given period
   */
  async calculateStats(
    userId: string,
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<AttendanceStats> {
    try {
      const records = await this.getAttendanceByDateRange(userId, startDate, endDate);

      const presentDays = records.filter((r) => r.status === 'clocked-out').length;
      const totalWorkHours = records.reduce((sum, r) => sum + (r.durationHours ?? 0), 0);

      // Calculate working days in period (excluding weekends)
      const start = dateStringToDate(startDate);
      const end = dateStringToDate(endDate);
      let totalDays = 0;
      const current = new Date(start);

      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          totalDays++;
        }
        current.setDate(current.getDate() + 1);
      }

      // Get leave days
      const leaveRequests = await leaveRequestService.getAll({
        employeeId,
        status: 'approved',
      });

      let onLeaveDays = 0;
      for (const leave of leaveRequests) {
        if (leave.startDate >= start && leave.endDate <= end) {
          onLeaveDays += leave.totalDays;
        }
      }

      // Calculate absent days (working days - present days - leave days)
      const absentDays = Math.max(0, totalDays - presentDays - onLeaveDays);

      // Calculate late days (from attendance records)
      const lateDays = records.filter((r) => r.isLate && !r.isExcusedLate).length;

      // Calculate overtime hours (worked more than 8 hours per day)
      const standardHoursPerDay = 8;
      const overtimeHours = records.reduce((sum, r) => {
        const hours = r.durationHours ?? 0;
        return sum + Math.max(0, hours - standardHoursPerDay);
      }, 0);

      const averageWorkHours = presentDays > 0 ? totalWorkHours / presentDays : 0;

      return {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        onLeaveDays,
        totalWorkHours: Number.parseFloat(totalWorkHours.toFixed(2)),
        averageWorkHours: Number.parseFloat(averageWorkHours.toFixed(2)),
        overtimeHours: Number.parseFloat(overtimeHours.toFixed(2)),
      };
    } catch (error) {
      console.error('Failed to calculate attendance stats', error);
      throw new Error('ไม่สามารถคำนวณสถิติการเข้างานได้');
    }
  },

  /**
   * Mark absent days for employees who didn't clock in on working days
   * This should be called by a scheduled Cloud Function
   */
  async markAbsentDays(date: string): Promise<void> {
    try {
      // This is a placeholder for the Cloud Function logic
      // In production, this should:
      // 1. Get all active employees
      // 2. Check if they clocked in on the given date
      // 3. Check if they have approved leave
      // 4. If neither, mark as absent
      console.log('Mark absent days for:', date);
    } catch (error) {
      console.error('Failed to mark absent days', error);
      throw new Error('ไม่สามารถทำเครื่องหมายวันขาดงานได้');
    }
  },

  /**
   * Start a break
   */
  async startBreak(
    recordId: string,
    breakType: 'lunch' | 'rest' | 'prayer' | 'other',
    _notes?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, recordId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Attendance record not found');
      }

      const existingRecord = docSnap.data() as AttendanceRecord;

      // Check if already on break
      const activeBreak = existingRecord.breaks.find((b) => !b.endTime);
      if (activeBreak) {
        throw new Error('คุณอยู่ในช่วงพักอยู่แล้ว กรุณาสิ้นสุดการพักก่อน');
      }

      // Determine break properties based on type and policy
      const isPaid = breakType === 'lunch'; // Lunch breaks are typically unpaid
      const scheduledDuration = breakType === 'lunch' ? 60 : 15; // 60 min for lunch, 15 for others

      const newBreak = {
        id: `break_${Date.now()}`,
        breakType,
        startTime: Timestamp.now(),
        endTime: null,
        duration: null,
        scheduledDuration,
        isPaid,
      };

      const updatedBreaks = [...existingRecord.breaks, newBreak];

      await updateDoc(docRef, {
        breaks: updatedBreaks,
      });
    } catch (error) {
      console.error('Failed to start break', error);
      throw error;
    }
  },

  /**
   * End a break
   */
  async endBreak(recordId: string, breakId: string): Promise<void> {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, recordId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Attendance record not found');
      }

      const existingRecord = docSnap.data() as AttendanceRecord;

      // Find the active break
      const breakIndex = existingRecord.breaks.findIndex((b) => b.id === breakId && !b.endTime);
      if (breakIndex === -1) {
        throw new Error('ไม่พบการพักที่ยังไม่สิ้นสุด');
      }

      const now = Timestamp.now();
      const activeBreak = existingRecord.breaks[breakIndex];

      if (!activeBreak) {
        throw new Error('ไม่พบการพักที่ยังไม่สิ้นสุด');
      }

      const duration = Math.floor((now.toMillis() - toMillis(activeBreak.startTime)) / 60000); // minutes

      // Update the break
      const updatedBreaks = [...existingRecord.breaks];
      updatedBreaks[breakIndex] = {
        id: activeBreak.id,
        breakType: activeBreak.breakType,
        startTime: activeBreak.startTime,
        scheduledDuration: activeBreak.scheduledDuration,
        isPaid: activeBreak.isPaid,
        endTime: now,
        duration,
      };

      // Calculate totals
      const totalBreakMinutes = updatedBreaks.reduce((sum, b) => sum + (b.duration || 0), 0);
      const unpaidBreakMinutes = updatedBreaks
        .filter((b) => !b.isPaid)
        .reduce((sum, b) => sum + (b.duration || 0), 0);

      await updateDoc(docRef, {
        breaks: updatedBreaks,
        totalBreakMinutes,
        unpaidBreakMinutes,
      });
    } catch (error) {
      console.error('Failed to end break', error);
      throw error;
    }
  },

  /**
   * Get current active break
   */
  async getCurrentBreak(recordId: string): Promise<BreakRecord | null> {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, recordId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const existingRecord = docSnap.data() as AttendanceRecord;
      const activeBreak = existingRecord.breaks.find((b) => !b.endTime);

      return activeBreak || null;
    } catch (error) {
      console.error('Failed to get current break', error);
      return null;
    }
  },
};
