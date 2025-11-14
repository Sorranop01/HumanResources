/**
 * Cloud Function: Update Department
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionUpdateDepartmentSchema } from '@/domains/system/features/settings/departments/schemas/departmentSchemas.js';

/**
 * Update Department Function
 * POST /updateDepartment
 */
export const updateDepartment = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: 60,
    cors: true,
  },
  async (request) => {
    const db = getFirestore();
    const { auth, data } = request;

    // ===== 1. Authentication Check =====
    if (!auth) {
      logger.warn('Unauthenticated request to updateDepartment');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;
    logger.info(`Update department request from user: ${userId}`);

    // ===== 2. Input Validation with Zod =====
    const validation = CloudFunctionUpdateDepartmentSchema.safeParse(data);

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

    const { departmentId, departmentData } = validation.data;

    try {
      // ===== 3. Get User Data and Check Permissions =====
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบข้อมูลผู้ใช้');
      }

      const userData = userDoc.data();
      const userRoles = userData?.roles || [];

      if (!userRoles.includes('hr') && !userRoles.includes('admin')) {
        logger.warn(`Permission denied for user ${userId}`, { roles: userRoles });
        throw new HttpsError('permission-denied', 'เฉพาะ HR และ Admin เท่านั้นที่สามารถแก้ไขแผนกได้');
      }

      // ===== 4. Get Department Record =====
      const departmentRef = db.collection('departments').doc(departmentId);
      const departmentDoc = await departmentRef.get();

      if (!departmentDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบแผนกที่ต้องการแก้ไข');
      }

      const existingData = departmentDoc.data();

      if (!existingData) {
        throw new HttpsError('internal', 'ข้อมูลแผนกไม่ถูกต้อง');
      }

      // ===== 5. Prevent self-referencing parent =====
      if (departmentData.parentDepartmentId === departmentId) {
        throw new HttpsError('failed-precondition', 'แผนกไม่สามารถเป็นแผนกหลักของตัวเองได้');
      }

      // ===== 6. Validate code uniqueness if changed =====
      if (departmentData.code) {
        const codeUpper = departmentData.code.toUpperCase();

        if (codeUpper !== existingData.code) {
          const duplicateQuery = await db
            .collection('departments')
            .where('tenantId', '==', existingData.tenantId)
            .where('code', '==', codeUpper)
            .limit(1)
            .get();

          if (!duplicateQuery.empty && duplicateQuery.docs[0]?.id !== departmentId) {
            throw new HttpsError('already-exists', `รหัสแผนก "${codeUpper}" มีอยู่แล้ว`);
          }
        }
      }

      // ===== 7. Validate parent department if changed =====
      if (departmentData.parentDepartmentId) {
        const parentDoc = await db
          .collection('departments')
          .doc(departmentData.parentDepartmentId)
          .get();

        if (!parentDoc.exists) {
          throw new HttpsError('not-found', 'ไม่พบแผนกหลักที่ระบุ');
        }

        const parentData = parentDoc.data();
        if (parentData?.tenantId !== existingData.tenantId) {
          throw new HttpsError('failed-precondition', 'แผนกหลักต้องอยู่ใน Tenant เดียวกัน');
        }
      }

      // ===== 8. Update Department =====
      const updateData: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: userId,
      };

      // Add fields that are being updated
      if (departmentData.code !== undefined) {
        updateData.code = departmentData.code.toUpperCase();
      }
      if (departmentData.name !== undefined) {
        updateData.name = departmentData.name;
      }
      if (departmentData.nameEn !== undefined) {
        updateData.nameEn = departmentData.nameEn;
      }
      if (departmentData.description !== undefined) {
        updateData.description = departmentData.description;
      }
      if (departmentData.parentDepartmentId !== undefined) {
        updateData.parentDepartment = departmentData.parentDepartmentId;
      }
      if (departmentData.level !== undefined) {
        updateData.level = departmentData.level;
      }
      if (departmentData.path !== undefined) {
        updateData.path = departmentData.path;
      }
      if (departmentData.managerId !== undefined) {
        updateData.managerId = departmentData.managerId;
      }
      if (departmentData.managerName !== undefined) {
        updateData.managerName = departmentData.managerName;
      }
      if (departmentData.costCenter !== undefined) {
        updateData.costCenter = departmentData.costCenter;
      }
      if (departmentData.budgetAmount !== undefined) {
        updateData.budgetAmount = departmentData.budgetAmount;
      }
      if (departmentData.isActive !== undefined) {
        updateData.isActive = departmentData.isActive;
      }

      await departmentRef.update(updateData);

      logger.info(`Department updated successfully: ${departmentId}`, {
        updatedBy: userId,
      });

      return {
        success: true,
        message: 'อัปเดตแผนกเรียบร้อยแล้ว',
        data: {
          id: departmentId,
          updatedBy: userId,
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to update department', {
        error,
        departmentId,
        userId,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการอัปเดตแผนก');
    }
  }
);
