/**
 * Cloud Function: Update Holiday
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { getFirestore } from 'firebase-admin/firestore';
import { defineInt } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionUpdateHolidaySchema } from '@/domains/system/features/policies/schemas/holidaySchema.js';

const timeoutSeconds = defineInt('FUNCTION_TIMEOUT_SECONDS');
const db = getFirestore();

export const updateHoliday = onCall(
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
    const validation = CloudFunctionUpdateHolidaySchema.safeParse(data);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      logger.error('Zod validation failed', { errors: validation.error.issues });
      throw new HttpsError('invalid-argument', `การตรวจสอบข้อมูลล้มเหลว: ${errorMessages}`);
    }

    const { holidayId, holidayData } = validation.data;

    try {
      // Check permissions (HR or Admin only)
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const userRoles = userData?.roles || [];

      if (!userRoles.includes('hr') && !userRoles.includes('admin')) {
        throw new HttpsError('permission-denied', 'เฉพาะ HR และ Admin เท่านั้นที่สามารถแก้ไขวันหยุดได้');
      }

      // Get existing holiday
      const holidayRef = db.collection('holidays').doc(holidayId);
      const holidayDoc = await holidayRef.get();

      if (!holidayDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบวันหยุดที่ต้องการแก้ไข');
      }

      const existingData = holidayDoc.data();

      // Check if date is being changed and conflicts with another holiday
      if (holidayData.date) {
        const duplicateQuery = await db
          .collection('holidays')
          .where('tenantId', '==', existingData?.tenantId)
          .where('date', '==', holidayData.date)
          .limit(2)
          .get();

        const conflict = duplicateQuery.docs.find((doc) => doc.id !== holidayId);
        if (conflict) {
          const conflictData = conflict.data();
          throw new HttpsError('already-exists', `วันหยุด "${conflictData?.name}" มีอยู่แล้วในวันที่นี้`);
        }
      }

      // Update holiday
      const updateData = {
        ...holidayData,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      await holidayRef.update(updateData);

      logger.info(`Holiday updated: ${holidayId}`);

      return {
        success: true,
        message: 'แก้ไขวันหยุดเรียบร้อยแล้ว',
        data: {
          id: holidayId,
          name: holidayData.name || existingData?.name,
        },
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error('Failed to update holiday', { error, holidayId, userId });
      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการแก้ไขวันหยุด');
    }
  }
);
