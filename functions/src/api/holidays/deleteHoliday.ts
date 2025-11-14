/**
 * Cloud Function: Delete Holiday
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { getFirestore } from 'firebase-admin/firestore';
import { defineInt } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionDeleteHolidaySchema } from '@/domains/system/features/policies/schemas/holidaySchema.js';

const timeoutSeconds = defineInt('FUNCTION_TIMEOUT_SECONDS');
const db = getFirestore();

export const deleteHoliday = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: timeoutSeconds.value() || 60,
    cors: true,
  },
  async (request) => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;

    // ===== Zod Validation =====
    const validation = CloudFunctionDeleteHolidaySchema.safeParse(data);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      logger.error('Zod validation failed', { errors: validation.error.issues });
      throw new HttpsError('invalid-argument', `การตรวจสอบข้อมูลล้มเหลว: ${errorMessages}`);
    }

    const { holidayId } = validation.data;

    try {
      // Check permissions (Admin only)
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const userRoles = userData?.roles || [];

      if (!userRoles.includes('admin')) {
        throw new HttpsError('permission-denied', 'เฉพาะ Admin เท่านั้นที่สามารถลบวันหยุดได้');
      }

      // Get holiday
      const holidayRef = db.collection('holidays').doc(holidayId);
      const holidayDoc = await holidayRef.get();

      if (!holidayDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบวันหยุดที่ต้องการลบ');
      }

      const holidayData = holidayDoc.data();

      // Delete holiday (soft delete option: set isActive = false)
      // For now, we'll do hard delete
      await holidayRef.delete();

      logger.info(`Holiday deleted: ${holidayId}`);

      return {
        success: true,
        message: 'ลบวันหยุดเรียบร้อยแล้ว',
        data: {
          id: holidayId,
          name: holidayData?.name,
          date: holidayData?.date,
        },
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error('Failed to delete holiday', { error, holidayId, userId });
      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการลบวันหยุด');
    }
  }
);
