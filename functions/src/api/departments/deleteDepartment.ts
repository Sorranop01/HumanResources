/**
 * Cloud Function: Delete Department
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionDeleteDepartmentSchema } from '@/domains/system/features/settings/departments/schemas/departmentSchemas.js';

/**
 * Delete Department Function
 * POST /deleteDepartment
 */
export const deleteDepartment = onCall(
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
      logger.warn('Unauthenticated request to deleteDepartment');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;
    logger.info(`Delete department request from user: ${userId}`);

    // ===== 2. Input Validation with Zod =====
    const validation = CloudFunctionDeleteDepartmentSchema.safeParse(data);

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

    const { departmentId, transferEmployeesToDepartmentId } = validation.data;

    try {
      // ===== 3. Get User Data and Check Permissions =====
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบข้อมูลผู้ใช้');
      }

      const userData = userDoc.data();
      const userRoles = userData?.roles || [];

      // Only Admin can delete departments
      if (!userRoles.includes('admin')) {
        logger.warn(`Permission denied for user ${userId}`, { roles: userRoles });
        throw new HttpsError('permission-denied', 'เฉพาะ Admin เท่านั้นที่สามารถลบแผนกได้');
      }

      // ===== 4. Get Department Record =====
      const departmentRef = db.collection('departments').doc(departmentId);
      const departmentDoc = await departmentRef.get();

      if (!departmentDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบแผนกที่ต้องการลบ');
      }

      const departmentData = departmentDoc.data();

      if (!departmentData) {
        throw new HttpsError('internal', 'ข้อมูลแผนกไม่ถูกต้อง');
      }

      // ===== 5. Check if has child departments =====
      const childrenQuery = await db
        .collection('departments')
        .where('parentDepartment', '==', departmentId)
        .limit(1)
        .get();

      if (!childrenQuery.empty) {
        throw new HttpsError(
          'failed-precondition',
          'ไม่สามารถลบแผนกที่มีแผนกย่อยได้ กรุณาลบหรือย้ายแผนกย่อยก่อน'
        );
      }

      // ===== 6. Check if has employees =====
      const employeesQuery = await db
        .collection('employees')
        .where('departmentId', '==', departmentId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      if (!employeesQuery.empty) {
        if (!transferEmployeesToDepartmentId) {
          throw new HttpsError(
            'failed-precondition',
            'แผนกนี้มีพนักงาน กรุณาระบุแผนกปลายทางสำหรับย้ายพนักงาน'
          );
        }

        // Validate transfer department exists
        const transferDeptDoc = await db
          .collection('departments')
          .doc(transferEmployeesToDepartmentId)
          .get();

        if (!transferDeptDoc.exists) {
          throw new HttpsError('not-found', 'ไม่พบแผนกปลายทางที่ระบุ');
        }

        const transferDeptData = transferDeptDoc.data();

        if (!transferDeptData) {
          throw new HttpsError('not-found', 'ไม่พบข้อมูลแผนกปลายทาง');
        }

        if (transferDeptData.tenantId !== departmentData.tenantId) {
          throw new HttpsError('failed-precondition', 'แผนกปลายทางต้องอยู่ใน Tenant เดียวกัน');
        }

        // Transfer all employees to new department
        const allEmployeesQuery = await db
          .collection('employees')
          .where('departmentId', '==', departmentId)
          .get();

        const batch = db.batch();
        let transferCount = 0;

        for (const employeeDoc of allEmployeesQuery.docs) {
          batch.update(employeeDoc.ref, {
            departmentId: transferEmployeesToDepartmentId,
            departmentName: transferDeptData.name,
            updatedAt: new Date(),
            updatedBy: userId,
          });
          transferCount++;
        }

        await batch.commit();

        logger.info(
          `Transferred ${transferCount} employees from ${departmentId} to ${transferEmployeesToDepartmentId}`
        );
      }

      // ===== 7. Delete Department =====
      await departmentRef.delete();

      logger.info(`Department deleted successfully: ${departmentId}`, {
        code: departmentData.code,
        name: departmentData.name,
        deletedBy: userId,
      });

      return {
        success: true,
        message: 'ลบแผนกเรียบร้อยแล้ว',
        data: {
          id: departmentId,
          code: departmentData.code,
          name: departmentData.name,
          employeesTransferred: transferEmployeesToDepartmentId
            ? await db
                .collection('employees')
                .where('departmentId', '==', transferEmployeesToDepartmentId)
                .count()
                .get()
                .then((snapshot) => snapshot.data().count)
            : 0,
        },
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to delete department', {
        error,
        departmentId,
        userId,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการลบแผนก');
    }
  }
);
