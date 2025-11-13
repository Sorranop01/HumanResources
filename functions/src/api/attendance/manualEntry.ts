/**
 * Cloud Function: Manual Attendance Entry
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 * For HR to manually enter attendance records
 */

import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineInt } from 'firebase-functions/params';
import { CloudFunctionManualAttendanceSchema } from '@/domains/people/features/attendance/schemas/index.js';

const timeoutSeconds = defineInt('FUNCTION_TIMEOUT_SECONDS');
const db = getFirestore();

/**
 * Parse time string (HH:mm) to Date
 */
function parseTime(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

/**
 * Calculate work duration in hours
 */
function calculateDuration(clockInTime: Date, clockOutTime: Date): number {
  const diffMs = clockOutTime.getTime() - clockInTime.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return Math.max(0, Math.round(hours * 100) / 100);
}

/**
 * Manual Attendance Entry Function
 * POST /manualAttendanceEntry
 */
export const manualAttendanceEntry = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: timeoutSeconds.value() || 60,
    cors: true,
  },
  async (request) => {
    const { auth, data } = request;

    // ===== 1. Authentication Check =====
    if (!auth) {
      logger.warn('Unauthenticated request to manualAttendanceEntry');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;
    logger.info(`Manual attendance entry request by: ${userId}`);

    // ===== 2. Check HR Permission =====
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userRoles = userData?.roles || [];

    if (!userRoles.includes('hr') && !userRoles.includes('admin')) {
      logger.warn(`User ${userId} attempted manual entry without HR permission`, {
        userRoles,
      });
      throw new HttpsError('permission-denied', 'เฉพาะ HR เท่านั้นที่สามารถบันทึกข้อมูลด้วยตนเองได้');
    }

    // ===== 3. Input Validation with Zod =====
    const validation = CloudFunctionManualAttendanceSchema.safeParse(data);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      logger.error('Zod validation failed', {
        errors: validation.error.issues,
        errorCount: validation.error.issues.length,
      });

      throw new HttpsError(
        'invalid-argument',
        `การตรวจสอบข้อมูลล้มเหลว: ${errorMessages}`,
        validation.error.issues
      );
    }

    // Use validated data (100% type-safe)
    const validatedData = validation.data;

    try {
      // ===== 4. Check for existing record =====
      const existingQuery = await db
        .collection('attendance')
        .where('userId', '==', validatedData.userId)
        .where('date', '==', validatedData.date)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        throw new HttpsError(
          'already-exists',
          `มีบันทึกการลงเวลาสำหรับวันที่ ${validatedData.date} อยู่แล้ว`
        );
      }

      // ===== 5. Get Employee Data =====
      const targetUserDoc = await db.collection('users').doc(validatedData.userId).get();

      if (!targetUserDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบข้อมูลผู้ใช้');
      }

      const targetUserData = targetUserDoc.data();
      const employeeId = validatedData.employeeId || targetUserData?.employeeId;

      if (!employeeId) {
        throw new HttpsError('failed-precondition', 'ไม่พบข้อมูลพนักงาน');
      }

      const employeeDoc = await db.collection('employees').doc(employeeId).get();

      if (!employeeDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบข้อมูลพนักงาน');
      }

      const employeeData = employeeDoc.data();

      if (!employeeData) {
        throw new HttpsError('internal', 'ข้อมูลพนักงานไม่ถูกต้อง');
      }

      // ===== 6. Parse Times =====
      const clockInTime = parseTime(validatedData.date, validatedData.clockInTime);
      const clockOutTime = validatedData.clockOutTime
        ? parseTime(validatedData.date, validatedData.clockOutTime)
        : null;

      // ===== 7. Calculate Duration and Status =====
      const durationHours = clockOutTime ? calculateDuration(clockInTime, clockOutTime) : null;
      const status = clockOutTime ? 'clocked-out' : 'clocked-in';

      // ===== 8. Get Work Schedule =====
      const workSchedule = employeeData.workSchedule || {
        scheduleType: 'fixed',
        hoursPerDay: 8,
      };

      const scheduledStartTime = workSchedule.standardHours?.monday?.startTime || '09:00';
      const scheduledEndTime = workSchedule.standardHours?.monday?.endTime || '18:00';

      // ===== 9. Create Attendance Record =====
      const now = FieldValue.serverTimestamp();
      const attendanceRef = db.collection('attendance').doc();

      const attendanceData = {
        // Base fields
        userId: validatedData.userId,
        employeeId,
        employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
        departmentName: employeeData.departmentName || 'N/A',

        // Clock in/out
        clockInTime: Timestamp.fromDate(clockInTime),
        clockOutTime: clockOutTime ? Timestamp.fromDate(clockOutTime) : null,
        status,
        date: validatedData.date,
        durationHours,

        // Schedule
        workSchedulePolicyId: employeeData.workSchedulePolicyId,
        shiftAssignmentId: employeeData.shiftAssignmentId,
        scheduledStartTime,
        scheduledEndTime,

        // Late tracking (set to false for manual entries)
        isLate: false,
        minutesLate: 0,
        lateReason: validatedData.reason,
        isExcusedLate: true, // Manual entries are excused
        lateApprovedBy: userId,

        // Early leave tracking
        isEarlyLeave: false,
        minutesEarly: 0,
        earlyLeaveReason: null,
        isApprovedEarlyLeave: true,
        earlyLeaveApprovedBy: userId,

        // Break tracking
        breaks: [],
        totalBreakMinutes: 0,
        unpaidBreakMinutes: 0,

        // Location
        clockInLocation: null,
        clockOutLocation: null,
        isRemoteWork: validatedData.isRemoteWork,

        // Clock-in method
        clockInMethod: 'manual',
        clockOutMethod: clockOutTime ? 'manual' : null,
        ipAddress: null,
        deviceId: null,

        // Approval (manual entries are pre-approved)
        requiresApproval: false,
        approvalStatus: 'approved',
        approvedBy: userId,
        approvalDate: Timestamp.now(),
        approvalNotes: validatedData.reason,

        // Penalties
        penaltiesApplied: [],

        // Shift premium
        shiftPremiumRate: null,
        shiftBonus: null,

        // Flags
        isMissedClockOut: false,
        isManualEntry: true, // Mark as manual entry
        isCorrected: false,

        // Notes
        notes: validatedData.notes || null,

        // Metadata
        tenantId: 'default',
        createdAt: now,
        updatedAt: now,
        createdBy: userId, // HR who created the entry
        updatedBy: userId,
      };

      await attendanceRef.set(attendanceData);

      logger.info(`Manual attendance entry created: ${attendanceRef.id}`, {
        createdBy: userId,
        forUserId: validatedData.userId,
        employeeId,
        date: validatedData.date,
        status,
      });

      return {
        success: true,
        message: 'บันทึกข้อมูลการลงเวลาสำเร็จ',
        data: {
          id: attendanceRef.id,
          userId: validatedData.userId,
          employeeId,
          date: validatedData.date,
          clockInTime: clockInTime.toISOString(),
          clockOutTime: clockOutTime?.toISOString() || null,
          durationHours,
          status,
          isManualEntry: true,
        },
      };
    } catch (error) {
      // Re-throw HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to create manual attendance entry', {
        error,
        userId: validatedData.userId,
        date: validatedData.date,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  }
);
