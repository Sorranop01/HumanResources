/**
 * Cloud Function: Clock In
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineInt } from 'firebase-functions/params';
import { CloudFunctionClockInSchema } from '@/domains/people/features/attendance/schemas/index.js';

const timeoutSeconds = defineInt('FUNCTION_TIMEOUT_SECONDS');
const db = getFirestore();

/**
 * Calculate if employee is late
 */
function calculateLateMinutes(
  clockInTime: Date,
  scheduledStartTime: string
): { isLate: boolean; minutesLate: number } {
  const [hours, minutes] = scheduledStartTime.split(':').map(Number);
  const scheduledStart = new Date(clockInTime);
  scheduledStart.setHours(hours || 0, minutes || 0, 0, 0);

  const diffMs = clockInTime.getTime() - scheduledStart.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  return {
    isLate: diffMinutes > 0,
    minutesLate: Math.max(0, diffMinutes),
  };
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Clock In Function
 * POST /clockIn
 */
export const clockIn = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: timeoutSeconds.value() || 60,
    cors: true,
  },
  async (request) => {
    const { auth, data } = request;

    // ===== 1. Authentication Check =====
    if (!auth) {
      logger.warn('Unauthenticated request to clockIn');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;
    logger.info(`Clock in request for user: ${userId}`);

    // ===== 2. Input Validation with Zod =====
    const validation = CloudFunctionClockInSchema.safeParse(data);

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
      // ===== 3. Check for existing clock-in today =====
      const today = formatDate(new Date());
      const existingQuery = await db
        .collection('attendance')
        .where('userId', '==', validatedData.userId)
        .where('date', '==', today)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        throw new HttpsError('already-exists', 'คุณได้ลงเวลาเข้างานวันนี้แล้ว');
      }

      // ===== 4. Get Employee Data =====
      const userDoc = await db.collection('users').doc(validatedData.userId).get();

      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบข้อมูลผู้ใช้');
      }

      const userData = userDoc.data();
      const employeeId = validatedData.employeeId || userData?.employeeId;

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

      // ===== 5. Get Work Schedule =====
      const workSchedule = employeeData.workSchedule || {
        scheduleType: 'fixed',
        hoursPerDay: 8,
      };

      const scheduledStartTime = workSchedule.standardHours?.monday?.startTime || '09:00';
      const scheduledEndTime = workSchedule.standardHours?.monday?.endTime || '18:00';

      // ===== 6. Calculate Late Status =====
      const clockInTime = new Date();
      const { isLate, minutesLate } = calculateLateMinutes(clockInTime, scheduledStartTime);

      // ===== 7. Validate Location (if provided) =====
      let clockInLocation = undefined;
      let requiresApproval = false;

      if (validatedData.location) {
        // Get geofence settings from organization
        const geofenceQuery = await db
          .collection('geofences')
          .where('tenantId', '==', 'default')
          .where('isActive', '==', true)
          .limit(1)
          .get();

        if (!geofenceQuery.empty) {
          const geofence = geofenceQuery.docs[0]?.data();
          const officeLocation = geofence?.location;

          if (officeLocation) {
            // Calculate distance (simple Haversine formula)
            const lat1 = validatedData.location.latitude;
            const lon1 = validatedData.location.longitude;
            const lat2 = officeLocation.latitude;
            const lon2 = officeLocation.longitude;

            const R = 6371e3; // Earth's radius in meters
            const φ1 = (lat1 * Math.PI) / 180;
            const φ2 = (lat2 * Math.PI) / 180;
            const Δφ = ((lat2 - lat1) * Math.PI) / 180;
            const Δλ = ((lon2 - lon1) * Math.PI) / 180;

            const a =
              Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            const radiusMeters = geofence?.radiusMeters || 100;
            const isWithinGeofence = distance <= radiusMeters;

            clockInLocation = {
              latitude: validatedData.location.latitude,
              longitude: validatedData.location.longitude,
              accuracy: validatedData.location.accuracy,
              timestamp: Timestamp.now(),
              isWithinGeofence,
              distanceFromOffice: Math.round(distance),
            };

            // Require approval if outside geofence and not remote work
            if (!isWithinGeofence && !validatedData.isRemoteWork) {
              requiresApproval = true;
            }
          }
        }
      }

      // ===== 8. Create Attendance Record =====
      const now = FieldValue.serverTimestamp();
      const attendanceRef = db.collection('attendance').doc();

      const attendanceData = {
        // Base fields
        userId: validatedData.userId,
        employeeId,
        employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
        departmentName: employeeData.departmentName || 'N/A',

        // Clock in/out
        clockInTime: Timestamp.now(),
        clockOutTime: null,
        status: 'clocked-in',
        date: today,
        durationHours: null,

        // Schedule
        workSchedulePolicyId: employeeData.workSchedulePolicyId,
        shiftAssignmentId: employeeData.shiftAssignmentId,
        scheduledStartTime,
        scheduledEndTime,

        // Late tracking
        isLate,
        minutesLate,
        lateReason: null,
        isExcusedLate: false,
        lateApprovedBy: null,

        // Early leave tracking
        isEarlyLeave: false,
        minutesEarly: 0,
        earlyLeaveReason: null,
        isApprovedEarlyLeave: false,
        earlyLeaveApprovedBy: null,

        // Break tracking
        breaks: [],
        totalBreakMinutes: 0,
        unpaidBreakMinutes: 0,

        // Location
        clockInLocation,
        clockOutLocation: null,
        isRemoteWork: validatedData.isRemoteWork,

        // Clock-in method
        clockInMethod: validatedData.clockInMethod,
        clockOutMethod: null,
        ipAddress: validatedData.ipAddress,
        deviceId: validatedData.deviceId,

        // Approval
        requiresApproval,
        approvalStatus: requiresApproval ? 'pending' : undefined,
        approvedBy: null,
        approvalDate: null,
        approvalNotes: null,

        // Penalties
        penaltiesApplied: [],

        // Shift premium
        shiftPremiumRate: null,
        shiftBonus: null,

        // Flags
        isMissedClockOut: false,
        isManualEntry: false,
        isCorrected: false,

        // Notes
        notes: validatedData.notes || null,

        // Metadata
        tenantId: 'default',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      };

      await attendanceRef.set(attendanceData);

      logger.info(`Clock in successful: ${attendanceRef.id}`, {
        userId: validatedData.userId,
        employeeId,
        isLate,
        minutesLate,
        requiresApproval,
      });

      return {
        success: true,
        message: isLate ? `ลงเวลาเข้างานสำเร็จ (สาย ${minutesLate} นาที)` : 'ลงเวลาเข้างานสำเร็จ',
        data: {
          id: attendanceRef.id,
          clockInTime: clockInTime.toISOString(),
          status: 'clocked-in',
          isLate,
          minutesLate,
          requiresApproval,
          isWithinGeofence: clockInLocation?.isWithinGeofence,
        },
      };
    } catch (error) {
      // Re-throw HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to clock in', {
        error,
        userId: validatedData.userId,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการลงเวลาเข้างาน');
    }
  }
);
