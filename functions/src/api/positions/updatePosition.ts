/**
 * Cloud Function: Update Position
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionUpdatePositionSchema } from '@/domains/system/features/settings/positions/schemas/positionSchemas.js';

export const updatePosition = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: 60,
    cors: true,
  },
  async (request) => {
    const db = getFirestore();
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;

    // ===== Zod Validation =====
    const validation = CloudFunctionUpdatePositionSchema.safeParse(data);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      logger.error('Zod validation failed', { errors: validation.error.issues });
      throw new HttpsError('invalid-argument', `การตรวจสอบข้อมูลล้มเหลว: ${errorMessages}`);
    }

    const { positionId, positionData } = validation.data;

    try {
      // Check permissions
      const userDoc = await db.collection('users').doc(userId).get();
      const userRoles = userDoc.data()?.roles || [];

      if (!userRoles.includes('hr') && !userRoles.includes('admin')) {
        throw new HttpsError('permission-denied', 'เฉพาะ HR และ Admin เท่านั้น');
      }

      // Get position
      const positionRef = db.collection('positions').doc(positionId);
      const positionDoc = await positionRef.get();

      if (!positionDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบตำแหน่งที่ต้องการแก้ไข');
      }

      const existingData = positionDoc.data();

      // Check code uniqueness if changed
      if (positionData.code) {
        const codeUpper = positionData.code.toUpperCase();
        if (codeUpper !== existingData?.code) {
          const duplicateQuery = await db
            .collection('positions')
            .where('tenantId', '==', existingData?.tenantId)
            .where('code', '==', codeUpper)
            .limit(1)
            .get();

          if (!duplicateQuery.empty && duplicateQuery.docs[0]?.id !== positionId) {
            throw new HttpsError('already-exists', `รหัสตำแหน่ง "${codeUpper}" มีอยู่แล้ว`);
          }
        }
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: userId,
      };

      if (positionData.code) updateData.code = positionData.code.toUpperCase();
      if (positionData.title) updateData.name = positionData.title;
      if (positionData.titleEn) updateData.nameEn = positionData.titleEn;
      if (positionData.description !== undefined) updateData.description = positionData.description;
      if (positionData.level) updateData.level = positionData.level;
      if (positionData.minSalary !== undefined) updateData.minSalary = positionData.minSalary;
      if (positionData.maxSalary !== undefined) updateData.maxSalary = positionData.maxSalary;
      if (positionData.isActive !== undefined) updateData.isActive = positionData.isActive;

      await positionRef.update(updateData);

      logger.info(`Position updated: ${positionId}`);

      return {
        success: true,
        message: 'อัปเดตตำแหน่งเรียบร้อยแล้ว',
        data: { id: positionId },
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error('Failed to update position', { error, positionId, userId });
      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการอัปเดตตำแหน่ง');
    }
  }
);
