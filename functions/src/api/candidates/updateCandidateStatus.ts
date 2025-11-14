/**
 * Cloud Function: Update Candidate Status
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 *
 * HR/Recruiter endpoint to update candidate application status
 * Requires: 'hr' or 'admin' role
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { defineInt } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionUpdateCandidateSchema } from '@/domains/people/features/candidates/schemas/index.js';

const timeoutSeconds = defineInt('FUNCTION_TIMEOUT_SECONDS');
const db = getFirestore();

/**
 * Update Candidate Status Function
 * POST /updateCandidateStatus
 *
 * Requires authentication and HR/Admin role
 */
export const updateCandidateStatus = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: timeoutSeconds.value() || 60,
    cors: true,
  },
  async (request) => {
    const { auth, data } = request;

    // ===== 1. Authentication Check =====
    if (!auth) {
      logger.warn('Unauthenticated request to updateCandidateStatus');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;
    logger.info(`Update candidate status request from user: ${userId}`);

    // ===== 2. Input Validation with Zod =====
    const validation = CloudFunctionUpdateCandidateSchema.safeParse(data);

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
      // ===== 3. Get User Data and Check Permissions =====
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบข้อมูลผู้ใช้');
      }

      const userData = userDoc.data();
      const userRoles = userData?.roles || [];

      // Check if user has HR or Admin role
      if (!userRoles.includes('hr') && !userRoles.includes('admin')) {
        logger.warn(`Permission denied for user ${userId}`, { roles: userRoles });
        throw new HttpsError(
          'permission-denied',
          'เฉพาะ HR และ Admin เท่านั้นที่สามารถอัปเดตสถานะผู้สมัครได้'
        );
      }

      // ===== 4. Get Candidate Record =====
      const candidateRef = db.collection('candidates').doc(validatedData.candidateId);
      const candidateDoc = await candidateRef.get();

      if (!candidateDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบข้อมูลผู้สมัคร');
      }

      const candidateData = candidateDoc.data();

      if (!candidateData) {
        throw new HttpsError('internal', 'ข้อมูลผู้สมัครไม่ถูกต้อง');
      }

      // ===== 5. Validate status transition =====
      const currentStatus = candidateData.status;
      const newStatus = validatedData.status;

      // Allow any status transition for now (can add rules later)
      // Example: can't move from 'rejected' to 'interview'
      if (currentStatus === 'hired' && newStatus !== 'hired') {
        throw new HttpsError('failed-precondition', 'ไม่สามารถเปลี่ยนสถานะของผู้สมัครที่ได้รับการจ้างงานแล้ว');
      }

      // ===== 6. Update candidate status =====
      const updateData: Record<string, unknown> = {
        status: validatedData.status,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: userId,
      };

      // Add optional fields if provided
      if (validatedData.notes !== undefined) {
        updateData.notes = validatedData.notes;
      }

      if (validatedData.interviewDate !== undefined) {
        updateData.interviewDate = validatedData.interviewDate;
      }

      if (validatedData.interviewer !== undefined) {
        updateData.interviewer = validatedData.interviewer;
      }

      await candidateRef.update(updateData);

      logger.info(`Candidate status updated: ${validatedData.candidateId}`, {
        from: currentStatus,
        to: newStatus,
        updatedBy: userId,
      });

      // ===== 7. Return success response =====
      return {
        success: true,
        message: 'อัปเดตสถานะผู้สมัครเรียบร้อยแล้ว',
        data: {
          id: validatedData.candidateId,
          previousStatus: currentStatus,
          newStatus: validatedData.status,
          updatedBy: userId,
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      // Re-throw HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to update candidate status', {
        error,
        candidateId: validatedData.candidateId,
        userId,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการอัปเดตสถานะผู้สมัคร');
    }
  }
);
