/**
 * Cloud Function: Approve Attendance
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionApproveAttendanceSchema } from '@/domains/people/features/attendance/schemas/index.js';

/**
 * Approve Attendance Function
 * POST /approveAttendance
 */
export const approveAttendance = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: 60,
    cors: true,
  },
  async (request) => {
    const { auth, data } = request;
    const db = getFirestore();

    // ===== 1. Authentication Check =====
    if (!auth) {
      logger.warn('Unauthenticated request to approveAttendance');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;
    logger.info(`Approve attendance request by: ${userId}`);

    // ===== 2. Input Validation with Zod =====
    const validation = CloudFunctionApproveAttendanceSchema.safeParse(data);

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
    const { recordId, approverId, notes } = validation.data;

    try {
      // ===== 3. Get Attendance Record =====
      const attendanceRef = db.collection('attendance').doc(recordId);
      const attendanceDoc = await attendanceRef.get();

      if (!attendanceDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบบันทึกการลงเวลา');
      }

      const attendanceData = attendanceDoc.data();

      if (!attendanceData) {
        throw new HttpsError('internal', 'ข้อมูลการลงเวลาไม่ถูกต้อง');
      }

      // ===== 4. Check if approval is needed =====
      if (!attendanceData.requiresApproval) {
        throw new HttpsError('failed-precondition', 'บันทึกนี้ไม่ต้องการการอนุมัติ');
      }

      if (attendanceData.approvalStatus === 'approved') {
        throw new HttpsError('failed-precondition', 'บันทึกนี้ได้รับการอนุมัติแล้ว');
      }

      // ===== 5. Verify Approver Permission =====
      const approverDoc = await db.collection('users').doc(userId).get();
      const approverData = approverDoc.data();

      if (!approverData) {
        throw new HttpsError('not-found', 'ไม่พบข้อมูลผู้อนุมัติ');
      }

      const approverEmployeeId = approverData.employeeId;

      if (approverEmployeeId !== approverId) {
        logger.warn(`User ${userId} does not match approverId ${approverId}`, {
          approverEmployeeId,
          recordId,
        });
        throw new HttpsError('permission-denied', 'คุณไม่มีสิทธิ์อนุมัติบันทึกนี้');
      }

      // Check if user is manager or HR
      const approverRoles = approverData.roles || [];
      const isManagerOrHR =
        approverRoles.includes('manager') ||
        approverRoles.includes('hr') ||
        approverRoles.includes('admin');

      if (!isManagerOrHR) {
        // Check if approver is the employee's manager
        const employeeDoc = await db.collection('employees').doc(attendanceData.employeeId).get();
        const employeeData = employeeDoc.data();

        if (!employeeData || employeeData.managerId !== approverId) {
          logger.warn(`User ${userId} is not authorized to approve`, {
            approverId,
            employeeManagerId: employeeData?.managerId,
          });
          throw new HttpsError('permission-denied', 'เฉพาะผู้จัดการหรือ HR เท่านั้นที่สามารถอนุมัติได้');
        }
      }

      // ===== 6. Update Attendance Record =====
      const now = FieldValue.serverTimestamp();

      await attendanceRef.update({
        approvalStatus: 'approved',
        approvedBy: approverId,
        approvalDate: Timestamp.now(),
        approvalNotes: notes || null,
        requiresApproval: false,
        updatedAt: now,
        updatedBy: userId,
      });

      logger.info(`Attendance approved successfully: ${recordId}`, {
        approverId,
        employeeId: attendanceData.employeeId,
        date: attendanceData.date,
      });

      return {
        success: true,
        message: 'อนุมัติบันทึกการลงเวลาสำเร็จ',
        data: {
          id: recordId,
          approvalStatus: 'approved',
          approvedBy: approverId,
          approvalDate: new Date().toISOString(),
        },
      };
    } catch (error) {
      // Re-throw HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to approve attendance', {
        error,
        recordId,
        approverId,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการอนุมัติ');
    }
  }
);
