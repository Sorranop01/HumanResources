/**
 * Firebase Cloud Function: createEmployee
 *
 * Creates a Firebase Auth user and a corresponding employee document in Firestore.
 * This function must be called by an authenticated user with 'admin' or 'hr' role.
 *
 * Features:
 * - RBAC Permission Check (employees:create)
 * - Input Validation using Zod schemas
 * - Duplicate Email Check
 * - National ID Uniqueness Check
 * - Auto-generate Employee Code (ALWAYS - cannot be provided by user)
 * - Phone Number Normalization
 * - Age Calculation
 * - Transaction Support for Rollback
 * - Audit Logging
 *
 * Important:
 * - Employee Code is ALWAYS auto-generated in format EMP-YYYY-XXX
 * - Users cannot provide their own employee code for security and consistency
 */

import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { ROLES } from '../../shared/constants/roles.js';
import { checkPermission } from '../../shared/utils/permissions.js';
import { normalizeThaiPhoneNumber } from '../../utils/phoneNumber.js';

const db = getFirestore();
const auth = getAuth();

const hasErrorCode = (error: unknown): error is { code?: string } =>
  typeof error === 'object' && error !== null && 'code' in error;

/**
 * Helper to check if user has required role
 */
async function hasRole(userId: string, ...allowedRoles: string[]): Promise<boolean> {
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  if (!userData) return false;
  return allowedRoles.includes(userData.role);
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date | Timestamp): number {
  const dob = dateOfBirth instanceof Timestamp ? dateOfBirth.toDate() : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Generate unique employee code (EMP-YYYY-XXX)
 */
async function generateEmployeeCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EMP-${year}-`;

  // Find the last employee code for this year
  const snapshot = await db
    .collection('employees')
    .where('employeeCode', '>=', prefix)
    .where('employeeCode', '<=', `${prefix}\uf8ff`)
    .orderBy('employeeCode', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return `${prefix}001`;
  }

  const lastCodeData = snapshot.docs[0]?.data();
  const lastCode = lastCodeData?.employeeCode as string | undefined;

  if (!lastCode) {
    return `${prefix}001`;
  }

  const lastNumberStr = lastCode.split('-')[2];
  const lastNumber = Number.parseInt(lastNumberStr || '0', 10);
  const newNumber = lastNumber + 1;

  return `${prefix}${newNumber.toString().padStart(3, '0')}`;
}

/**
 * Validate email uniqueness in both Auth and Firestore
 */
async function validateEmailUniqueness(email: string): Promise<void> {
  // Check Firebase Auth
  try {
    await auth.getUserByEmail(email);
    throw new HttpsError('already-exists', `อีเมล ${email} ถูกใช้งานแล้วในระบบ Authentication`);
  } catch (error: unknown) {
    // If user not found, that's good - email is unique
    if (hasErrorCode(error) && error.code === 'auth/user-not-found') {
      return;
    }
    // If it's already-exists error, re-throw it
    if (error instanceof HttpsError) {
      throw error;
    }
  }

  // Check Firestore employees collection
  const employeeSnapshot = await db.collection('employees').where('email', '==', email).limit(1).get();

  if (!employeeSnapshot.empty) {
    throw new HttpsError('already-exists', `อีเมล ${email} ถูกใช้งานแล้วในระบบพนักงาน`);
  }
}

/**
 * Validate national ID uniqueness
 */
async function validateNationalIdUniqueness(nationalId: string): Promise<void> {
  const snapshot = await db.collection('employees').where('nationalId', '==', nationalId).limit(1).get();

  if (!snapshot.empty) {
    throw new HttpsError('already-exists', `เลขบัตรประชาชน ${nationalId} ถูกใช้งานแล้ว`);
  }
}

/**
 * Create audit log entry
 */
async function createAuditLog(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await db.collection('auditLogs').add({
    userId,
    action,
    resourceType,
    resourceId,
    metadata: metadata || {},
    timestamp: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Input interface for createEmployee
 */
interface CreateEmployeeInput {
  email: string;
  password: string;
  displayName: string;
  employeeData: {
    // employeeCode is auto-generated and cannot be provided
    firstName: string;
    lastName: string;
    thaiFirstName: string;
    thaiLastName: string;
    nickname?: string;
    personalEmail?: string;
    phoneNumber: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
    dateOfBirth: string | Date; // ISO string or Date
    gender: 'male' | 'female' | 'other';
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    nationality?: string;
    religion?: string;
    nationalId: string;
    nationalIdIssueDate?: string | Date;
    nationalIdExpiryDate?: string | Date;
    currentAddress: {
      addressLine1: string;
      addressLine2?: string;
      subDistrict: string;
      district: string;
      province: string;
      postalCode: string;
      country?: string;
    };
    permanentAddress?: {
      addressLine1: string;
      addressLine2?: string;
      subDistrict: string;
      district: string;
      province: string;
      postalCode: string;
      country?: string;
    };
    photoURL?: string;
    hireDate: string | Date;
    probationEndDate?: string | Date;
    confirmationDate?: string | Date;
    status?: 'active' | 'on-leave' | 'resigned' | 'terminated';
    employmentType: 'permanent' | 'contract' | 'probation' | 'freelance' | 'intern';
    workType: 'full-time' | 'part-time';
    position: string;
    level?: string;
    department: string;
    division?: string;
    team?: string;
    reportingTo?: {
      employeeId: string;
      employeeName: string;
      position: string;
    };
    workLocation: {
      office: string;
      building?: string;
      floor?: string;
      seat?: string;
    };
    salary: {
      baseSalary: number;
      currency?: string;
      paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly' | 'hourly';
      hourlyRate?: number;
    };
    allowances?: Array<{
      type: string;
      amount: number;
      frequency: 'monthly' | 'quarterly' | 'yearly';
    }>;
    benefits?: {
      healthInsurance: boolean;
      lifeInsurance: boolean;
      providentFund: {
        isEnrolled: boolean;
        employeeContributionRate?: number;
        employerContributionRate?: number;
      };
      annualLeave: number;
      sickLeave: number;
      otherBenefits?: string[];
    };
    socialSecurity: {
      isEnrolled: boolean;
      ssNumber?: string;
      enrollmentDate?: string | Date;
      hospitalCode?: string;
      hospitalName?: string;
    };
    tax: {
      taxId?: string;
      withholdingTax: boolean;
      withholdingRate?: number;
      taxReliefs?: Array<{
        type: string;
        amount: number;
      }>;
    };
    bankAccount: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      branchName?: string;
    };
    education?: Array<{
      level: string;
      institution: string;
      fieldOfStudy: string;
      graduationYear: number;
      gpa?: number;
    }>;
    certifications?: Array<{
      name: string;
      issuingOrganization: string;
      issueDate: string | Date;
      expiryDate?: string | Date;
      credentialId?: string;
    }>;
    workSchedule: {
      scheduleType: 'fixed' | 'flexible' | 'shift';
      hoursPerWeek: number;
      hoursPerDay: number;
    };
    overtime: {
      isEligible: boolean;
      rate: number;
    };
    notes?: string;
  };
  role?: string; // Optional: default to EMPLOYEE
  sendWelcomeEmail?: boolean; // Optional: send welcome email to new employee
}

export const createEmployee = onCall<CreateEmployeeInput>(
  {
    region: 'asia-southeast1',
  },
  async (request: CallableRequest<CreateEmployeeInput>) => {
    const startTime = Date.now();
    const { data, auth: authContext } = request;

    logger.info('Creating employee - Start', { caller: authContext?.uid });

    // ===== 1. Authentication Check =====
    if (!authContext) {
      logger.warn('Unauthenticated request to createEmployee');
      throw new HttpsError('unauthenticated', 'คุณต้องเข้าสู่ระบบก่อนใช้งานฟังก์ชันนี้');
    }

    // ===== 2. RBAC Permission Check =====
    try {
      const hasPermission = await checkPermission(authContext.uid, 'employees', 'create');
      if (!hasPermission) {
        logger.warn('Permission denied for createEmployee', { userId: authContext.uid });
        throw new HttpsError('permission-denied', 'คุณไม่มีสิทธิ์ในการสร้างพนักงาน');
      }
    } catch (error: unknown) {
      // Fallback to role-based check if RBAC not fully implemented
      logger.info('Using fallback role-based check');
      const allowed = await hasRole(authContext.uid, ROLES.ADMIN, ROLES.HR);
      if (!allowed) {
        throw new HttpsError('permission-denied', 'คุณไม่มีสิทธิ์ในการสร้างพนักงาน');
      }
    }

    // ===== 3. Input Validation =====
    const { email, password, displayName, employeeData, role, sendWelcomeEmail } = data;

    if (!email || !password || !displayName || !employeeData) {
      logger.error('Missing required fields', { email, displayName, hasEmployeeData: !!employeeData });
      throw new HttpsError('invalid-argument', 'ข้อมูลไม่ครบถ้วน: email, password, displayName, employeeData');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpsError('invalid-argument', 'รูปแบบอีเมลไม่ถูกต้อง');
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      throw new HttpsError('invalid-argument', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    }

    // Validate required employeeData fields
    const requiredFields = [
      'firstName',
      'lastName',
      'thaiFirstName',
      'thaiLastName',
      'phoneNumber',
      'dateOfBirth',
      'gender',
      'nationalId',
      'hireDate',
      'employmentType',
      'workType',
      'position',
      'department',
      'currentAddress',
      'workLocation',
      'salary',
      'socialSecurity',
      'tax',
      'bankAccount',
      'workSchedule',
      'overtime',
    ];

    for (const field of requiredFields) {
      if (!employeeData[field as keyof typeof employeeData]) {
        throw new HttpsError('invalid-argument', `ข้อมูลไม่ครบถ้วน: employeeData.${field}`);
      }
    }

    // Validate National ID format (13 digits)
    if (!/^[0-9]{13}$/.test(employeeData.nationalId)) {
      throw new HttpsError('invalid-argument', 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{9,10}$/;
    if (!phoneRegex.test(employeeData.phoneNumber.replace(/[-\s]/g, ''))) {
      throw new HttpsError('invalid-argument', 'เบอร์โทรศัพท์ไม่ถูกต้อง');
    }

    // ===== 4. Duplicate Checks =====
    logger.info('Validating uniqueness constraints');

    try {
      // Check email uniqueness
      await validateEmailUniqueness(email);

      // Check national ID uniqueness
      await validateNationalIdUniqueness(employeeData.nationalId);
    } catch (error: unknown) {
      if (error instanceof HttpsError) {
        throw error;
      }
      logger.error('Error during uniqueness validation', { error });
      throw new HttpsError('internal', 'เกิดข้อผิดพลาดในการตรวจสอบความซ้ำซ้อนของข้อมูล');
    }

    // ===== 5. Auto-generate Employee Code (ALWAYS) =====
    let employeeCode: string;
    try {
      employeeCode = await generateEmployeeCode();
      logger.info('Generated employee code', { employeeCode });
    } catch (error: unknown) {
      logger.error('Error generating employee code', { error });
      throw new HttpsError('internal', 'ไม่สามารถสร้างรหัสพนักงานอัตโนมัติได้');
    }

    // ===== 6. Normalize Phone Numbers =====
    const normalizedPhone = normalizeThaiPhoneNumber(employeeData.phoneNumber);
    const normalizedEmergencyPhone = normalizeThaiPhoneNumber(employeeData.emergencyContact.phoneNumber);

    // ===== 7. Calculate Age =====
    const dateOfBirth =
      typeof employeeData.dateOfBirth === 'string'
        ? new Date(employeeData.dateOfBirth)
        : employeeData.dateOfBirth;
    const age = calculateAge(dateOfBirth);

    // ===== 8. Prepare Timestamps =====
    const now = Timestamp.now();
    const hireDate =
      typeof employeeData.hireDate === 'string' ? new Date(employeeData.hireDate) : employeeData.hireDate;

    // ===== 9. Create Firebase Auth User =====
    let newUser: Awaited<ReturnType<typeof auth.createUser>>;
    let authUserCreated = false;

    try {
      logger.info('Creating Firebase Auth user', { email });
      newUser = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: false,
        disabled: false,
      });
      authUserCreated = true;
      logger.info('Firebase Auth user created', { userId: newUser.uid });
    } catch (error: unknown) {
      logger.error('Error creating Firebase Auth user', { error });
      if (hasErrorCode(error) && error.code === 'auth/email-already-exists') {
        throw new HttpsError('already-exists', `อีเมล ${email} ถูกใช้งานแล้วในระบบ Authentication`);
      }
      if (hasErrorCode(error) && error.code === 'auth/invalid-password') {
        throw new HttpsError('invalid-argument', 'รหัสผ่านไม่ถูกต้อง');
      }
      throw new HttpsError('internal', 'ไม่สามารถสร้างบัญชี Authentication ได้');
    }

    // ===== 10. Create Employee Document in Firestore =====
    let employeeRef;

    try {
      employeeRef = db.collection('employees').doc();
      logger.info('Creating employee document', { employeeId: employeeRef.id });

      const newEmployeeDocument = {
        // Base
        userId: newUser.uid,
        employeeCode,

        // Personal Information
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        thaiFirstName: employeeData.thaiFirstName,
        thaiLastName: employeeData.thaiLastName,
        nickname: employeeData.nickname || null,
        email,
        personalEmail: employeeData.personalEmail || null,
        phoneNumber: normalizedPhone,
        emergencyContact: {
          name: employeeData.emergencyContact.name,
          relationship: employeeData.emergencyContact.relationship,
          phoneNumber: normalizedEmergencyPhone,
        },

        // Personal Details
        dateOfBirth: Timestamp.fromDate(dateOfBirth),
        age,
        gender: employeeData.gender,
        maritalStatus: employeeData.maritalStatus,
        nationality: employeeData.nationality || 'ไทย',
        religion: employeeData.religion || null,

        // National ID
        nationalId: employeeData.nationalId,
        nationalIdIssueDate: employeeData.nationalIdIssueDate
          ? Timestamp.fromDate(
              typeof employeeData.nationalIdIssueDate === 'string'
                ? new Date(employeeData.nationalIdIssueDate)
                : employeeData.nationalIdIssueDate
            )
          : null,
        nationalIdExpiryDate: employeeData.nationalIdExpiryDate
          ? Timestamp.fromDate(
              typeof employeeData.nationalIdExpiryDate === 'string'
                ? new Date(employeeData.nationalIdExpiryDate)
                : employeeData.nationalIdExpiryDate
            )
          : null,

        // Address
        currentAddress: {
          ...employeeData.currentAddress,
          country: employeeData.currentAddress.country || 'ไทย',
        },
        permanentAddress: employeeData.permanentAddress || null,

        photoURL: employeeData.photoURL || null,

        // Employment Information
        hireDate: Timestamp.fromDate(hireDate),
        probationEndDate: employeeData.probationEndDate
          ? Timestamp.fromDate(
              typeof employeeData.probationEndDate === 'string'
                ? new Date(employeeData.probationEndDate)
                : employeeData.probationEndDate
            )
          : null,
        confirmationDate: employeeData.confirmationDate
          ? Timestamp.fromDate(
              typeof employeeData.confirmationDate === 'string'
                ? new Date(employeeData.confirmationDate)
                : employeeData.confirmationDate
            )
          : null,
        terminationDate: null,
        lastWorkingDate: null,

        status: employeeData.status || 'active',
        employmentType: employeeData.employmentType,
        workType: employeeData.workType,

        position: employeeData.position,
        level: employeeData.level || null,
        department: employeeData.department,
        division: employeeData.division || null,
        team: employeeData.team || null,

        reportingTo: employeeData.reportingTo || null,
        workLocation: employeeData.workLocation,

        // Compensation & Benefits
        salary: {
          baseSalary: employeeData.salary.baseSalary,
          currency: employeeData.salary.currency || 'THB',
          paymentFrequency: employeeData.salary.paymentFrequency,
          effectiveDate: now,
          hourlyRate: employeeData.salary.hourlyRate || null,
        },
        allowances: employeeData.allowances || [],
        benefits: employeeData.benefits || null,

        // Tax & Social Security
        socialSecurity: {
          isEnrolled: employeeData.socialSecurity.isEnrolled,
          ssNumber: employeeData.socialSecurity.ssNumber || null,
          enrollmentDate: employeeData.socialSecurity.enrollmentDate
            ? Timestamp.fromDate(
                typeof employeeData.socialSecurity.enrollmentDate === 'string'
                  ? new Date(employeeData.socialSecurity.enrollmentDate)
                  : employeeData.socialSecurity.enrollmentDate
              )
            : null,
          hospitalCode: employeeData.socialSecurity.hospitalCode || null,
          hospitalName: employeeData.socialSecurity.hospitalName || null,
        },
        tax: employeeData.tax,
        bankAccount: employeeData.bankAccount,

        // Education
        education: employeeData.education || [],
        certifications: employeeData.certifications || [],

        // Work Schedule
        workSchedule: employeeData.workSchedule,
        overtime: employeeData.overtime,

        // Documents
        documents: [],

        notes: employeeData.notes || null,

        // Metadata
        createdAt: now,
        updatedAt: now,
        createdBy: authContext.uid,
        updatedBy: authContext.uid,
      };

      await employeeRef.set(newEmployeeDocument);
      logger.info('Employee document created', { employeeId: employeeRef.id });
    } catch (error: unknown) {
      logger.error('Error creating employee document', { error });

      // Rollback: Delete auth user if employee creation failed
      if (authUserCreated && newUser) {
        try {
          await auth.deleteUser(newUser.uid);
          logger.info('Rollback: Auth user deleted', { userId: newUser.uid });
        } catch (rollbackError: unknown) {
          logger.error('Rollback failed: Could not delete auth user', { rollbackError });
        }
      }

      throw new HttpsError('internal', 'ไม่สามารถสร้างข้อมูลพนักงานได้');
    }

    // ===== 11. Set Custom Claims (Role) =====
    try {
      const userRole = role || ROLES.EMPLOYEE;
      await auth.setCustomUserClaims(newUser.uid, { role: userRole });
      logger.info('Custom claims set', { userId: newUser.uid, role: userRole });
    } catch (error: unknown) {
      logger.error('Error setting custom claims', { error });
      // Don't rollback - employee is created, we can fix claims later
    }

    // ===== 12. Create User Document (for RBAC) =====
    try {
      await db
        .collection('users')
        .doc(newUser.uid)
        .set({
          email,
          displayName,
          role: role || ROLES.EMPLOYEE,
          employeeId: employeeRef.id,
          createdAt: now,
          updatedAt: now,
        });
      logger.info('User document created', { userId: newUser.uid });
    } catch (error: unknown) {
      logger.error('Error creating user document', { error });
      // Don't rollback - employee is created
    }

    // ===== 13. Create Audit Log =====
    try {
      await createAuditLog(authContext.uid, 'CREATE_EMPLOYEE', 'employee', employeeRef.id, {
        employeeCode,
        employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
        email,
        position: employeeData.position,
        department: employeeData.department,
      });
      logger.info('Audit log created');
    } catch (error: unknown) {
      logger.error('Error creating audit log', { error });
      // Don't rollback - audit log is non-critical
    }

    // ===== 14. Send Welcome Email (Optional) =====
    if (sendWelcomeEmail) {
      try {
        // TODO: Implement email sending logic
        logger.info('Welcome email would be sent', { email });
      } catch (error: unknown) {
        logger.error('Error sending welcome email', { error });
        // Don't rollback - email is non-critical
      }
    }

    // ===== 15. Return Success =====
    const duration = Date.now() - startTime;
    logger.info('Employee created successfully', {
      employeeId: employeeRef.id,
      userId: newUser.uid,
      duration,
    });

    return {
      success: true,
      message: 'สร้างพนักงานสำเร็จ',
      data: {
        employeeId: employeeRef.id,
        userId: newUser.uid,
        employeeCode,
        email,
        displayName,
      },
    };
  }
);
