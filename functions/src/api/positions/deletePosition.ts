/**
 * Cloud Function: Delete Position
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionDeletePositionSchema } from '@/domains/system/features/settings/positions/schemas/positionSchemas.js';

export const deletePosition = onCall(
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
    const validation = CloudFunctionDeletePositionSchema.safeParse(data);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      logger.error('Zod validation failed', { errors: validation.error.issues });
      throw new HttpsError('invalid-argument', `การตรวจสอบข้อมูลล้มเหลว: ${errorMessages}`);
    }

    const { positionId, transferEmployeesToPositionId } = validation.data;

    try {
      // Check permissions (Admin only)
      const userDoc = await db.collection('users').doc(userId).get();
      const userRoles = userDoc.data()?.roles || [];

      if (!userRoles.includes('admin')) {
        throw new HttpsError('permission-denied', 'เฉพาะ Admin เท่านั้นที่สามารถลบตำแหน่งได้');
      }

      // Get position
      const positionRef = db.collection('positions').doc(positionId);
      const positionDoc = await positionRef.get();

      if (!positionDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบตำแหน่งที่ต้องการลบ');
      }

      const positionData = positionDoc.data();

      // Check if has employees
      const employeesQuery = await db
        .collection('employees')
        .where('positionId', '==', positionId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      if (!employeesQuery.empty) {
        if (!transferEmployeesToPositionId) {
          throw new HttpsError(
            'failed-precondition',
            'ตำแหน่งนี้มีพนักงาน กรุณาระบุตำแหน่งปลายทางสำหรับย้ายพนักงาน'
          );
        }

        // Validate transfer position exists
        const transferPosDoc = await db
          .collection('positions')
          .doc(transferEmployeesToPositionId)
          .get();

        if (!transferPosDoc.exists) {
          throw new HttpsError('not-found', 'ไม่พบตำแหน่งปลายทางที่ระบุ');
        }

        const transferPosData = transferPosDoc.data();

        // Transfer employees
        const allEmployeesQuery = await db
          .collection('employees')
          .where('positionId', '==', positionId)
          .get();

        const batch = db.batch();
        let transferCount = 0;

        for (const employeeDoc of allEmployeesQuery.docs) {
          batch.update(employeeDoc.ref, {
            positionId: transferEmployeesToPositionId,
            positionName: transferPosData?.name || transferPosData?.title,
            updatedAt: new Date(),
            updatedBy: userId,
          });
          transferCount++;
        }

        await batch.commit();
        logger.info(
          `Transferred ${transferCount} employees from ${positionId} to ${transferEmployeesToPositionId}`
        );
      }

      // Delete position
      await positionRef.delete();

      logger.info(`Position deleted: ${positionId}`);

      return {
        success: true,
        message: 'ลบตำแหน่งเรียบร้อยแล้ว',
        data: {
          id: positionId,
          code: positionData?.code,
          name: positionData?.name,
        },
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error('Failed to delete position', { error, positionId, userId });
      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการลบตำแหน่ง');
    }
  }
);
