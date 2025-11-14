/**
 * Cloud Function: Create Holiday
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionCreateHolidaySchema } from '@/domains/system/features/policies/schemas/holidaySchema.js';

export const createHoliday = onCall(
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
    const validation = CloudFunctionCreateHolidaySchema.safeParse(data);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      logger.error('Zod validation failed', { errors: validation.error.issues });
      throw new HttpsError('invalid-argument', `การตรวจสอบข้อมูลล้มเหลว: ${errorMessages}`);
    }

    const { holidayData } = validation.data;

    try {
      // Check permissions (HR or Admin only)
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const userRoles = userData?.roles || [];

      if (!userRoles.includes('hr') && !userRoles.includes('admin')) {
        throw new HttpsError('permission-denied', 'เฉพาะ HR และ Admin เท่านั้นที่สามารถสร้างวันหยุดได้');
      }

      // Check for duplicate (same date, same tenant)
      const duplicateQuery = await db
        .collection('holidays')
        .where('tenantId', '==', holidayData.tenantId)
        .where('date', '==', holidayData.date)
        .limit(1)
        .get();

      if (!duplicateQuery.empty) {
        const existing = duplicateQuery.docs[0]?.data();
        throw new HttpsError('already-exists', `วันหยุด "${existing?.name}" มีอยู่แล้วในวันที่นี้`);
      }

      // Create holiday record
      const holidayRef = db.collection('holidays').doc();
      const now = new Date();

      await holidayRef.set({
        name: holidayData.name,
        nameEn: holidayData.nameEn,
        description: holidayData.description,
        date: holidayData.date,
        year: holidayData.year,
        type: holidayData.type,
        isSubstituteDay: holidayData.isSubstituteDay,
        originalDate: holidayData.originalDate || null,
        workPolicy: holidayData.workPolicy,
        overtimeRate: holidayData.overtimeRate,
        locations: holidayData.locations || [],
        regions: holidayData.regions || [],
        applicableDepartments: holidayData.applicableDepartments || [],
        applicablePositions: holidayData.applicablePositions || [],
        isActive: true,
        tenantId: holidayData.tenantId,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      });

      logger.info(`Holiday created: ${holidayRef.id}`);

      return {
        success: true,
        message: 'สร้างวันหยุดเรียบร้อยแล้ว',
        data: {
          id: holidayRef.id,
          name: holidayData.name,
          date: holidayData.date,
        },
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error('Failed to create holiday', { error, userId });
      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการสร้างวันหยุด');
    }
  }
);
