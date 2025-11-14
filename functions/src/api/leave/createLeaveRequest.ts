/**
 * Cloud Function: Create Leave Request
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionCreateLeaveRequestSchema } from '@/domains/people/features/leave/schemas/index.js';

/**
 * Calculate business days between two dates
 */
function calculateBusinessDays(startDate: Date, endDate: Date, isHalfDay: boolean): number {
  if (isHalfDay) return 0.5;

  let days = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Generate leave request number
 */
async function generateRequestNumber(): Promise<string> {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const counterRef = db.collection('counters').doc('leaveRequests');

  const result = await db.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let counter = 1;

    if (counterDoc.exists) {
      counter = (counterDoc.data()?.counter || 0) + 1;
      transaction.update(counterRef, { counter });
    } else {
      transaction.set(counterRef, { counter });
    }

    return `LR${year}${counter.toString().padStart(5, '0')}`;
  });

  return result;
}

/**
 * Create Leave Request
 * POST /createLeaveRequest
 */
export const createLeaveRequest = onCall(
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
      logger.warn('Unauthenticated request to createLeaveRequest');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = auth.uid;
    logger.info(`Creating leave request for user: ${userId}`);

    // ===== 2. Input Validation with Zod =====
    const validation = CloudFunctionCreateLeaveRequestSchema.safeParse(data);

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
    const { employeeId, leaveRequestData } = validation.data;

    try {
      // ===== 3. Fetch Employee Data =====
      const employeeRef = db.collection('employees').doc(employeeId);
      const employeeDoc = await employeeRef.get();

      if (!employeeDoc.exists) {
        throw new HttpsError('not-found', `ไม่พบข้อมูลพนักงาน: ${employeeId}`);
      }

      const employeeData = employeeDoc.data();
      if (!employeeData) {
        throw new HttpsError('internal', 'ข้อมูลพนักงานไม่ถูกต้อง');
      }

      // ===== 4. Verify User Permission =====
      // User can only create leave requests for themselves (unless they have HR permission)
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const userEmployeeId = userData?.employeeId;

      const isHR = userData?.roles?.includes('hr') || false;

      if (employeeId !== userEmployeeId && !isHR) {
        logger.warn(`User ${userId} attempted to create leave request for another employee`, {
          requestedEmployeeId: employeeId,
          userEmployeeId,
        });
        throw new HttpsError('permission-denied', 'คุณไม่มีสิทธิ์สร้างคำขอลาสำหรับพนักงานคนอื่น');
      }

      // ===== 5. Fetch Leave Type Data =====
      const leaveTypeRef = db.collection('leaveTypes').doc(leaveRequestData.leaveTypeId);
      const leaveTypeDoc = await leaveTypeRef.get();

      if (!leaveTypeDoc.exists) {
        throw new HttpsError('not-found', `ไม่พบประเภทการลา: ${leaveRequestData.leaveTypeId}`);
      }

      const leaveTypeData = leaveTypeDoc.data();
      if (!leaveTypeData) {
        throw new HttpsError('internal', 'ข้อมูลประเภทการลาไม่ถูกต้อง');
      }

      // ===== 6. Calculate Total Days =====
      const totalDays = calculateBusinessDays(
        leaveRequestData.startDate,
        leaveRequestData.endDate,
        leaveRequestData.isHalfDay || false
      );

      // ===== 7. Check Leave Balance (if applicable) =====
      if (leaveTypeData.requiresEntitlement) {
        const entitlementRef = db
          .collection('leaveEntitlements')
          .where('employeeId', '==', employeeId)
          .where('leaveTypeId', '==', leaveRequestData.leaveTypeId)
          .limit(1);

        const entitlementSnapshot = await entitlementRef.get();

        if (entitlementSnapshot.empty) {
          throw new HttpsError('failed-precondition', 'ไม่พบสิทธิ์การลาสำหรับประเภทนี้');
        }

        const entitlement = entitlementSnapshot.docs[0]?.data();
        const remainingDays = entitlement?.remainingDays || 0;

        if (remainingDays < totalDays) {
          throw new HttpsError(
            'failed-precondition',
            `สิทธิ์การลาไม่เพียงพอ (คงเหลือ ${remainingDays} วัน)`
          );
        }
      }

      // ===== 8. Build Approval Chain =====
      const approvalChain = [];

      // Level 1: Direct Manager
      if (employeeData.managerId) {
        const managerDoc = await db.collection('employees').doc(employeeData.managerId).get();
        const managerData = managerDoc.data();

        if (managerData) {
          approvalChain.push({
            level: 1,
            approverId: employeeData.managerId,
            approverName: `${managerData.firstName} ${managerData.lastName}`,
            approverRole: 'Manager',
            status: 'pending',
          });
        }
      }

      // Level 2: HR (for leave > 3 days)
      if (totalDays > 3) {
        // Find HR role users
        const hrUsersSnapshot = await db
          .collection('users')
          .where('roles', 'array-contains', 'hr')
          .limit(1)
          .get();

        if (!hrUsersSnapshot.empty) {
          const hrUser = hrUsersSnapshot.docs[0]?.data();
          const hrEmployeeId = hrUser?.employeeId;

          if (hrEmployeeId) {
            const hrEmployeeDoc = await db.collection('employees').doc(hrEmployeeId).get();
            const hrEmployeeData = hrEmployeeDoc.data();

            if (hrEmployeeData) {
              approvalChain.push({
                level: 2,
                approverId: hrEmployeeId,
                approverName: `${hrEmployeeData.firstName} ${hrEmployeeData.lastName}`,
                approverRole: 'HR',
                status: 'pending',
              });
            }
          }
        }
      }

      // ===== 9. Generate Request Number =====
      const requestNumber = await generateRequestNumber();

      // ===== 10. Create Leave Request Document =====
      const now = FieldValue.serverTimestamp();
      const leaveRequestRef = db.collection('leaveRequests').doc();

      const leaveRequestDoc = {
        // Base fields
        requestNumber,

        // Employee (denormalized)
        employeeId,
        employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
        employeeCode: employeeData.employeeCode,
        departmentId: employeeData.departmentId,
        departmentName: employeeData.departmentName,
        positionId: employeeData.positionId,
        positionName: employeeData.positionName,

        // Leave Type (denormalized)
        leaveTypeId: leaveRequestData.leaveTypeId,
        leaveTypeCode: leaveTypeData.code,
        leaveTypeName: leaveTypeData.nameTh,

        // Period
        startDate: leaveRequestData.startDate,
        endDate: leaveRequestData.endDate,
        totalDays,
        isHalfDay: leaveRequestData.isHalfDay || false,
        halfDayPeriod: leaveRequestData.halfDayPeriod || null,

        // Details
        reason: leaveRequestData.reason,
        contactDuringLeave: leaveRequestData.contactDuringLeave || null,
        workHandoverTo: leaveRequestData.workHandoverTo || null,
        workHandoverNotes: leaveRequestData.workHandoverNotes || null,

        // Certificate
        hasCertificate: leaveRequestData.hasCertificate || false,
        certificateUrl: leaveRequestData.certificateUrl || null,
        certificateFileName: leaveRequestData.certificateFileName || null,

        // Workflow
        status: 'pending',
        submittedAt: now,
        approvalChain,
        currentApprovalLevel: approvalChain.length > 0 ? 1 : 0,

        // Metadata
        tenantId: 'default',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      };

      await leaveRequestRef.set(leaveRequestDoc);

      logger.info(`Leave request created successfully: ${leaveRequestRef.id}`, {
        requestNumber,
        employeeId,
        totalDays,
      });

      return {
        success: true,
        message: 'สร้างคำขอลาสำเร็จ',
        data: {
          id: leaveRequestRef.id,
          requestNumber,
          status: 'pending',
          totalDays,
          approvalChain,
        },
      };
    } catch (error) {
      // Re-throw HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to create leave request', {
        error,
        employeeId,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการสร้างคำขอลา');
    }
  }
);
