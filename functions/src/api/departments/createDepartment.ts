/**
 * Cloud Function: Create Department
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionCreateDepartmentSchema } from '@/domains/system/features/settings/departments/schemas/departmentSchemas.js';

/**
 * Create Department Function
 * POST /createDepartment
 */
export const createDepartment = onCall(
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
      logger.warn('Unauthenticated request to createDepartment');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;
    logger.info(`Create department request from user: ${userId}`);

    // ===== 2. Input Validation with Zod =====
    const validation = CloudFunctionCreateDepartmentSchema.safeParse(data);

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

    const { departmentData } = validation.data;

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
        throw new HttpsError('permission-denied', 'เฉพาะ HR และ Admin เท่านั้นที่สามารถสร้างแผนกได้');
      }

      // ===== 4. Check if code already exists =====
      const codeUpper = departmentData.code.toUpperCase();
      const existingQuery = await db
        .collection('departments')
        .where('tenantId', '==', departmentData.tenantId)
        .where('code', '==', codeUpper)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        throw new HttpsError('already-exists', `รหัสแผนก "${codeUpper}" มีอยู่แล้ว`);
      }

      // ===== 5. Validate parent department if provided =====
      if (departmentData.parentDepartmentId) {
        const parentDoc = await db
          .collection('departments')
          .doc(departmentData.parentDepartmentId)
          .get();

        if (!parentDoc.exists) {
          throw new HttpsError('not-found', 'ไม่พบแผนกหลักที่ระบุ');
        }

        const parentData = parentDoc.data();
        if (parentData?.tenantId !== departmentData.tenantId) {
          throw new HttpsError('failed-precondition', 'แผนกหลักต้องอยู่ใน Tenant เดียวกัน');
        }
      }

      // ===== 6. Create Department Record =====
      const now = FieldValue.serverTimestamp();
      const departmentRef = db.collection('departments').doc();

      const departmentRecord = {
        code: codeUpper,
        name: departmentData.name,
        nameEn: departmentData.nameEn,
        description: departmentData.description || '',

        // Hierarchy
        parentDepartment: departmentData.parentDepartmentId || null,
        level: departmentData.level,
        path: departmentData.path,

        // Management
        managerId: departmentData.managerId || null,
        managerName: departmentData.managerName || null,

        // Financial
        costCenter: departmentData.costCenter || null,
        budgetAmount: departmentData.budgetAmount || null,

        // Settings
        isActive: departmentData.isActive ?? true,
        headCount: 0, // Initialize to 0

        // Metadata
        tenantId: departmentData.tenantId,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      };

      await departmentRef.set(departmentRecord);

      logger.info(`Department created successfully: ${departmentRef.id}`, {
        code: codeUpper,
        name: departmentData.name,
      });

      return {
        success: true,
        message: 'สร้างแผนกเรียบร้อยแล้ว',
        data: {
          id: departmentRef.id,
          code: codeUpper,
          name: departmentData.name,
        },
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to create department', {
        error,
        userId,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการสร้างแผนก');
    }
  }
);
