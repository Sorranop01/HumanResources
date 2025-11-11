import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { AttendanceRecord } from '@/domains/people/features/attendance/types';
import { leaveRequestService } from '@/domains/people/features/leave';
import { db } from '@/shared/lib/firebase';
import type { AttendanceStats } from '../schemas';

const ATTENDANCE_COLLECTION = 'attendance';

/**
 * Gets today's date in YYYY-MM-DD format.
 */
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
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

    const docData = querySnapshot.docs[0].data();
    return { id: querySnapshot.docs[0].id, ...docData } as AttendanceRecord;
  },

  /**
   * Creates a new attendance record for clocking in.
   * @param userId The ID of the user clocking in.
   * @returns The newly created attendance record.
   */
  async clockIn(userId: string): Promise<AttendanceRecord> {
    const now = Timestamp.now();
    const newRecord = {
      userId,
      clockInTime: now,
      clockOutTime: null,
      status: 'clocked-in' as const,
      date: getTodayDateString(),
      durationHours: null,
    };

    const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), newRecord);

    return {
      id: docRef.id,
      ...newRecord,
    };
  },

  /**
   * Updates an attendance record for clocking out.
   * @param recordId The ID of the attendance record to update.
   * @param clockInTime The timestamp of the clock-in.
   * @returns The updated attendance record.
   */
  async clockOut(recordId: string, clockInTime: Timestamp): Promise<Partial<AttendanceRecord>> {
    const now = Timestamp.now();
    const durationMilliseconds = now.toMillis() - clockInTime.toMillis();
    const durationHours = durationMilliseconds / (1000 * 60 * 60);

    const updatedFields = {
      clockOutTime: now,
      status: 'clocked-out' as const,
      durationHours: parseFloat(durationHours.toFixed(2)),
    };

    const docRef = doc(db, ATTENDANCE_COLLECTION, recordId);
    await updateDoc(docRef, updatedFields);

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
    employeeId: string
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

      // Check if on approved leave
      const todayDate = dateStringToDate(today);
      const hasLeave = await leaveRequestService.hasOverlappingLeave(
        employeeId,
        todayDate,
        todayDate
      );

      if (hasLeave) {
        return {
          canClockIn: false,
          reason: 'คุณมีการลางานในวันนี้ ไม่สามารถลงเวลาได้',
        };
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

      // Calculate late days (arrived after standard time, e.g., 9:00 AM)
      // TODO: This should be configurable based on employee work schedule
      const lateDays = 0; // Placeholder

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
};
