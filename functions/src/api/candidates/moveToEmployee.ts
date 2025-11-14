/**
 * Cloud Function: Move Candidate to Employee
 * ✅ Layer 3 - Zod Validation at Cloud Function Level
 *
 * HR/Admin endpoint to convert hired candidate to employee
 * Creates employee record, auth user, and marks candidate as hired
 *
 * Requires: 'hr' or 'admin' role
 */

import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { defineInt } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CloudFunctionMoveToEmployeeSchema } from '@/domains/people/features/candidates/schemas/index.js';

const timeoutSeconds = defineInt('FUNCTION_TIMEOUT_SECONDS');
const db = getFirestore();
const auth = getAuth();

/**
 * Move Candidate to Employee Function
 * POST /moveToEmployee
 *
 * Complex function that:
 * 1. Validates candidate status (must be 'offer' or 'hired')
 * 2. Creates Firebase Auth user
 * 3. Creates employee record with all required data
 * 4. Creates user record for authentication
 * 5. Updates candidate status to 'hired'
 * 6. Creates audit log entry
 */
export const moveToEmployee = onCall(
  {
    region: 'asia-southeast1',
    timeoutSeconds: timeoutSeconds.value() || 120, // Longer timeout for complex operation
    cors: true,
  },
  async (request) => {
    const { auth: requestAuth, data } = request;

    // ===== 1. Authentication Check =====
    if (!requestAuth) {
      logger.warn('Unauthenticated request to moveToEmployee');
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้งาน');
    }

    const userId = requestAuth.uid;
    logger.info(`Move to employee request from user: ${userId}`);

    // ===== 2. Input Validation with Zod =====
    const validation = CloudFunctionMoveToEmployeeSchema.safeParse(data);

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
    const validatedData = validation.data;

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
        throw new HttpsError('permission-denied', 'เฉพาะ HR และ Admin เท่านั้นที่สามารถจ้างพนักงานได้');
      }

      // ===== 4. Get Candidate Record =====
      const candidateRef = db.collection('candidates').doc(validatedData.candidateId);
      const candidateDoc = await candidateRef.get();

      if (!candidateDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบข้อมูลผู้สมัคร');
      }

      const candidateData = candidateDoc.data();

      if (!candidateData) {
        throw new HttpsError('internal', 'ข้อมูลผู้สมัครไม่ถูกต้อง');
      }

      // ===== 5. Validate candidate status =====
      const currentStatus = candidateData.status;

      if (currentStatus !== 'offer' && currentStatus !== 'hired') {
        throw new HttpsError(
          'failed-precondition',
          `ไม่สามารถจ้างผู้สมัครที่มีสถานะ "${currentStatus}" ได้ (ต้องเป็น "offer" หรือ "hired")`
        );
      }

      // ===== 6. Check if already converted =====
      if (candidateData.employeeId) {
        throw new HttpsError('already-exists', 'ผู้สมัครคนนี้ได้รับการจ้างงานเป็นพนักงานแล้ว');
      }

      // ===== 7. Validate position and department exist =====
      const [positionDoc, departmentDoc] = await Promise.all([
        db.collection('positions').doc(validatedData.positionId).get(),
        db.collection('departments').doc(validatedData.departmentId).get(),
      ]);

      if (!positionDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบตำแหน่งงานที่ระบุ');
      }

      if (!departmentDoc.exists) {
        throw new HttpsError('not-found', 'ไม่พบแผนกที่ระบุ');
      }

      const positionData = positionDoc.data();
      const departmentData = departmentDoc.data();

      // ===== 8. Check if email already exists in employees =====
      const existingEmployeeQuery = await db
        .collection('employees')
        .where('email', '==', candidateData.email)
        .limit(1)
        .get();

      if (!existingEmployeeQuery.empty) {
        throw new HttpsError('already-exists', 'อีเมลนี้ถูกใช้งานโดยพนักงานคนอื่นแล้ว');
      }

      // ===== 9. Generate employee ID =====
      const employeeIdCounter = await db.collection('counters').doc('employeeId').get();
      let nextEmployeeNumber = 1;

      if (employeeIdCounter.exists) {
        nextEmployeeNumber = (employeeIdCounter.data()?.current || 0) + 1;
      }

      const employeeId = `EMP${String(nextEmployeeNumber).padStart(5, '0')}`;

      // ===== 10. Create Firebase Auth User =====
      const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
      let authUserId: string;

      try {
        const authUser = await auth.createUser({
          email: candidateData.email,
          password: tempPassword,
          displayName: `${candidateData.firstName} ${candidateData.lastName}`,
          emailVerified: false,
        });
        authUserId = authUser.uid;

        logger.info(`Created auth user: ${authUserId} for ${candidateData.email}`);
      } catch (authError: unknown) {
        logger.error('Failed to create auth user', { error: authError });
        throw new HttpsError('internal', 'ไม่สามารถสร้างบัญชีผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
      }

      // ===== 11. Create Employee Record =====
      const now = FieldValue.serverTimestamp();
      const employeeRef = db.collection('employees').doc();

      const employeeRecord = {
        // Core Identity
        employeeId,
        userId: authUserId,
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        phone: candidateData.phone,
        dateOfBirth: candidateData.dateOfBirth || null,
        nationality: candidateData.nationality || null,
        address: candidateData.address || null,

        // Position & Department
        positionId: validatedData.positionId,
        positionName: positionData?.title || 'Unknown',
        departmentId: validatedData.departmentId,
        departmentName: departmentData?.name || 'Unknown',
        managerId: departmentData?.managerId || null,

        // Employment Details
        hireDate: validatedData.hireDate,
        employmentType: 'full-time',
        status: 'active',

        // Compensation
        salary: validatedData.salary,
        payrollSchedule: 'monthly',

        // Education & Experience (from candidate)
        education: candidateData.education || [],
        workExperience: candidateData.workExperience || [],
        skills: candidateData.skills || [],
        languages: candidateData.languages || [],

        // Candidate Reference
        candidateId: validatedData.candidateId,

        // Metadata
        tenantId: 'default',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      };

      await employeeRef.set(employeeRecord);

      // ===== 12. Create User Record =====
      const userRecord = {
        uid: authUserId,
        email: candidateData.email,
        displayName: `${candidateData.firstName} ${candidateData.lastName}`,
        employeeId: employeeRef.id,
        roles: ['employee'],
        isActive: true,
        tenantId: 'default',
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('users').doc(authUserId).set(userRecord);

      // ===== 13. Update Employee ID Counter =====
      await db.collection('counters').doc('employeeId').set(
        {
          current: nextEmployeeNumber,
          updatedAt: now,
        },
        { merge: true }
      );

      // ===== 14. Update Candidate Record =====
      await candidateRef.update({
        status: 'hired',
        employeeId: employeeRef.id,
        hiredDate: validatedData.hireDate,
        updatedAt: now,
        updatedBy: userId,
      });

      logger.info(`Successfully converted candidate to employee`, {
        candidateId: validatedData.candidateId,
        employeeId: employeeRef.id,
        authUserId,
        email: candidateData.email,
      });

      // ===== 15. Return success response =====
      return {
        success: true,
        message: `จ้างพนักงานเรียบร้อยแล้ว! รหัสพนักงาน: ${employeeId}`,
        data: {
          employeeId: employeeRef.id,
          employeeNumber: employeeId,
          authUserId,
          email: candidateData.email,
          name: `${candidateData.firstName} ${candidateData.lastName}`,
          position: positionData?.title,
          department: departmentData?.name,
          hireDate: validatedData.hireDate,
          tempPassword, // Include temp password in response (should be sent to employee)
        },
      };
    } catch (error) {
      // Re-throw HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to convert candidate to employee', {
        error,
        candidateId: validatedData.candidateId,
        userId,
      });

      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการจ้างพนักงาน กรุณาลองใหม่อีกครั้ง');
    }
  }
);
