/**
 * Cloud Function: Reject Leave Request
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { defineInt } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionRejectLeaveRequestSchema } from '@/domains/people/features/leave/schemas/index.js';

const timeoutSeconds = defineInt('FUNCTION_TIMEOUT_SECONDS');
const db = getFirestore();

/**
 * Reject Leave Request
 * POST /rejectLeaveRequest
 */
export const rejectLeaveRequest = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: timeoutSeconds.value() || 60,
    cors: true,
  },
  async (request) => {
    const { auth, data } = request;

    // ===== 1. Authentication Check =====
    if (!auth) {
      logger.warn('Unauthenticated request to rejectLeaveRequest');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;
    logger.info(`Rejecting leave request by user: ${userId}`);

    // ===== 2. Input Validation with Zod =====
    const validation = CloudFunctionRejectLeaveRequestSchema.safeParse(data);

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
    const { requestId, approverId, reason } = validation.data;

    try {
      // ===== 3. Fetch Leave Request =====
      const leaveRequestRef = db.collection('leaveRequests').doc(requestId);
      const leaveRequestDoc = await leaveRequestRef.get();

      if (!leaveRequestDoc.exists) {
        throw new HttpsError('not-found', `ไม่พบคำขอลา: ${requestId}`);
      }

      const leaveRequestData = leaveRequestDoc.data();
      if (!leaveRequestData) {
        throw new HttpsError('internal', 'ข้อมูลคำขอลาไม่ถูกต้อง');
      }

      // ===== 4. Verify Request Status =====
      if (leaveRequestData.status !== 'pending') {
        throw new HttpsError(
          'failed-precondition',
          `ไม่สามารถปฏิเสธคำขอลาที่มีสถานะ: ${leaveRequestData.status}`
        );
      }

      // ===== 5. Verify Approver Permission =====
      const approvalChain = leaveRequestData.approvalChain || [];
      const currentLevel = leaveRequestData.currentApprovalLevel || 1;

      const currentStep = approvalChain.find((step: any) => step.level === currentLevel);

      if (!currentStep) {
        throw new HttpsError('internal', 'ไม่พบขั้นตอนการอนุมัติในระบบ');
      }

      if (currentStep.approverId !== approverId) {
        logger.warn(`User ${userId} attempted to reject request as ${approverId}`, {
          requestId,
          expectedApproverId: currentStep.approverId,
        });
        throw new HttpsError('permission-denied', 'คุณไม่มีสิทธิ์ปฏิเสธคำขอลานี้');
      }

      // Verify user is linked to this employee
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const userEmployeeId = userData?.employeeId;

      if (userEmployeeId !== approverId) {
        logger.warn(`User ${userId} does not match approverId ${approverId}`, {
          userEmployeeId,
          requestId,
        });
        throw new HttpsError('permission-denied', 'คุณไม่มีสิทธิ์ปฏิเสธคำขอลานี้');
      }

      // ===== 6. Update Approval Chain =====
      const now = FieldValue.serverTimestamp();

      // Update current step
      const updatedApprovalChain = approvalChain.map((step: any) => {
        if (step.level === currentLevel) {
          return {
            ...step,
            status: 'rejected',
            actionAt: now,
            comments: reason,
          };
        }
        return step;
      });

      // ===== 7. Update Leave Request =====
      await leaveRequestRef.update({
        approvalChain: updatedApprovalChain,
        status: 'rejected',
        rejectedBy: approverId,
        rejectedAt: now,
        rejectionReason: reason,
        updatedAt: now,
        updatedBy: userId,
      });

      logger.info(`Leave request rejected successfully: ${requestId}`, {
        requestNumber: leaveRequestData.requestNumber,
        approverId,
        currentLevel,
      });

      return {
        success: true,
        message: 'ปฏิเสธคำขอลาสำเร็จ',
        data: {
          id: requestId,
          requestNumber: leaveRequestData.requestNumber,
          status: 'rejected',
          rejectedBy: approverId,
        },
      };
    } catch (error) {
      // Re-throw HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to reject leave request', {
        error,
        requestId,
        approverId,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการปฏิเสธคำขอลา');
    }
  }
);
