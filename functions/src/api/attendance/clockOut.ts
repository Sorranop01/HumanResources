/**
 * Cloud Function: Clock Out
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { defineInt } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionClockOutSchema } from '@/domains/people/features/attendance/schemas/index.js';

const timeoutSeconds = defineInt('FUNCTION_TIMEOUT_SECONDS');
const db = getFirestore();

/**
 * Calculate work duration in hours
 */
function calculateDuration(clockInTime: Date, clockOutTime: Date): number {
  const diffMs = clockOutTime.getTime() - clockInTime.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return Math.max(0, Math.round(hours * 100) / 100); // Round to 2 decimals
}

/**
 * Calculate if employee left early
 */
function calculateEarlyMinutes(
  clockOutTime: Date,
  scheduledEndTime: string
): { isEarlyLeave: boolean; minutesEarly: number } {
  const [hours, minutes] = scheduledEndTime.split(':').map(Number);
  const scheduledEnd = new Date(clockOutTime);
  scheduledEnd.setHours(hours || 0, minutes || 0, 0, 0);

  const diffMs = scheduledEnd.getTime() - clockOutTime.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  return {
    isEarlyLeave: diffMinutes > 0,
    minutesEarly: Math.max(0, diffMinutes),
  };
}

/**
 * Clock Out Function
 * POST /clockOut
 */
export const clockOut = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: timeoutSeconds.value() || 60,
    cors: true,
  },
  async (request) => {
    const { auth, data } = request;

    // ===== 1. Authentication Check =====
    if (!auth) {
      logger.warn('Unauthenticated request to clockOut');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;
    logger.info(`Clock out request for user: ${userId}`);

    // ===== 2. Input Validation with Zod =====
    const validation = CloudFunctionClockOutSchema.safeParse(data);

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
      // ===== 3. Get Attendance Record =====
      const attendanceRef = db.collection('attendance').doc(validatedData.recordId);
      const attendanceDoc = await attendanceRef.get();

      if (!attendanceDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบบันทึกการลงเวลา');
      }

      const attendanceData = attendanceDoc.data();

      if (!attendanceData) {
        throw new HttpsError('internal', 'ข้อมูลการลงเวลาไม่ถูกต้อง');
      }

      // ===== 4. Verify User Permission =====
      if (attendanceData.userId !== userId) {
        logger.warn(`User ${userId} attempted to clock out for another user`, {
          recordId: validatedData.recordId,
          recordUserId: attendanceData.userId,
        });
        throw new HttpsError('permission-denied', 'คุณไม่มีสิทธิ์ลงเวลาออกงานสำหรับบันทึกนี้');
      }

      // ===== 5. Check if already clocked out =====
      if (attendanceData.status === 'clocked-out') {
        throw new HttpsError('failed-precondition', 'คุณได้ลงเวลาออกงานแล้ว');
      }

      // ===== 6. Calculate Duration and Early Leave =====
      const clockOutTime = new Date();
      const clockInTime = attendanceData.clockInTime.toDate();

      const durationHours = calculateDuration(clockInTime, clockOutTime);

      const { isEarlyLeave, minutesEarly } = calculateEarlyMinutes(
        clockOutTime,
        attendanceData.scheduledEndTime
      );

      // ===== 7. Calculate Total Break Time =====
      const breaks = attendanceData.breaks || [];
      const totalBreakMinutes = breaks.reduce((sum: number, breakRecord: any) => {
        return sum + (breakRecord.duration || 0);
      }, 0);

      const unpaidBreakMinutes = breaks
        .filter((breakRecord: any) => !breakRecord.isPaid)
        .reduce((sum: number, breakRecord: any) => sum + (breakRecord.duration || 0), 0);

      // ===== 8. Validate Location (if provided) =====
      let clockOutLocation;

      if (validatedData.location) {
        clockOutLocation = {
          latitude: validatedData.location.latitude,
          longitude: validatedData.location.longitude,
          accuracy: validatedData.location.accuracy,
          timestamp: Timestamp.now(),
        };
      }

      // ===== 9. Apply Penalties (if applicable) =====
      const penaltiesApplied = [...(attendanceData.penaltiesApplied || [])];

      // Check for no clock-out penalty (if clocking out very late)
      const hoursWorked = durationHours - totalBreakMinutes / 60;
      if (hoursWorked > 12) {
        // More than 12 hours - might be missed clock out
        penaltiesApplied.push({
          policyId: 'system-penalty',
          type: 'no-clock-out',
          amount: 0,
          description: 'ลงเวลาออกล่าช้ามาก (มากกว่า 12 ชั่วโมง)',
        });
      }

      // ===== 10. Update Attendance Record =====
      const now = FieldValue.serverTimestamp();

      await attendanceRef.update({
        clockOutTime: Timestamp.now(),
        clockOutMethod: validatedData.clockOutMethod || attendanceData.clockInMethod,
        clockOutLocation,
        status: 'clocked-out',
        durationHours,

        // Early leave tracking
        isEarlyLeave,
        minutesEarly,

        // Break tracking
        totalBreakMinutes,
        unpaidBreakMinutes,

        // Penalties
        penaltiesApplied,

        // Notes
        notes: validatedData.notes || attendanceData.notes,

        // Metadata
        updatedAt: now,
        updatedBy: userId,
      });

      logger.info(`Clock out successful: ${validatedData.recordId}`, {
        userId,
        durationHours,
        isEarlyLeave,
        minutesEarly,
      });

      return {
        success: true,
        message: isEarlyLeave
          ? `ลงเวลาออกงานสำเร็จ (ออกก่อนเวลา ${minutesEarly} นาที)`
          : 'ลงเวลาออกงานสำเร็จ',
        data: {
          id: validatedData.recordId,
          clockOutTime: clockOutTime.toISOString(),
          durationHours,
          status: 'clocked-out',
          isEarlyLeave,
          minutesEarly,
          totalBreakMinutes,
        },
      };
    } catch (error) {
      // Re-throw HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to clock out', {
        error,
        recordId: validatedData.recordId,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการลงเวลาออกงาน');
    }
  }
);
