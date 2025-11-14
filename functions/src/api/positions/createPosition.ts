/**
 * Cloud Function: Create Position
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionCreatePositionSchema } from '@/domains/system/features/settings/positions/schemas/positionSchemas.js';

export const createPosition = onCall(
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
    const validation = CloudFunctionCreatePositionSchema.safeParse(data);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      logger.error('Zod validation failed', { errors: validation.error.issues });
      throw new HttpsError('invalid-argument', `การตรวจสอบข้อมูลล้มเหลว: ${errorMessages}`);
    }

    const { positionData } = validation.data;

    try {
      // Check permissions
      const userDoc = await db.collection('users').doc(userId).get();
      const userRoles = userDoc.data()?.roles || [];

      if (!userRoles.includes('hr') && !userRoles.includes('admin')) {
        throw new HttpsError('permission-denied', 'เฉพาะ HR และ Admin เท่านั้น');
      }

      // Check code duplicate
      const codeUpper = positionData.code.toUpperCase();
      const existingQuery = await db
        .collection('positions')
        .where('tenantId', '==', positionData.tenantId)
        .where('code', '==', codeUpper)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        throw new HttpsError('already-exists', `รหัสตำแหน่ง "${codeUpper}" มีอยู่แล้ว`);
      }

      // Validate department exists
      const deptDoc = await db.collection('departments').doc(positionData.departmentId).get();
      if (!deptDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบแผนกที่ระบุ');
      }

      // Create position
      const now = FieldValue.serverTimestamp();
      const positionRef = db.collection('positions').doc();

      await positionRef.set({
        code: codeUpper,
        name: positionData.title,
        nameEn: positionData.titleEn,
        description: positionData.description || '',
        department: positionData.departmentId,
        level: positionData.level,
        minSalary: positionData.minSalary || 0,
        maxSalary: positionData.maxSalary || 0,
        isActive: positionData.isActive ?? true,
        tenantId: positionData.tenantId,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      });

      logger.info(`Position created: ${positionRef.id}`);

      return {
        success: true,
        message: 'สร้างตำแหน่งเรียบร้อยแล้ว',
        data: { id: positionRef.id, code: codeUpper, name: positionData.title },
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error('Failed to create position', { error, userId });
      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการสร้างตำแหน่ง');
    }
  }
);
