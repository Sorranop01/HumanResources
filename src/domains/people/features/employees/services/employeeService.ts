import type { QueryConstraint } from 'firebase/firestore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  type EmployeeCreatePayload,
  type EmployeeFilters,
  EmployeeSchema,
} from '@/domains/people/features/employees/schemas';
import type { Employee } from '@/domains/people/features/employees/types';
import { db } from '@/shared/lib/firebase';

const COLLECTION = 'employees';

/**
 * Query Keys Factory (TanStack Query)
 * Centralized management of query keys for cache invalidation
 */
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters?: EmployeeFilters) => [...employeeKeys.lists(), filters ?? {}] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

/**
 * Convert Firestore Timestamp to Date (recursively handles nested objects and arrays)
 * ✅ Supports both Client SDK Timestamp and Admin SDK Timestamp formats
 */
function convertTimestamps(data: unknown): unknown {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Convert Timestamp to Date
  if (data instanceof Timestamp) {
    return data.toDate();
  }

  // ✅ Handle Admin SDK Timestamp format ({ _seconds, _nanoseconds })
  if (
    data &&
    typeof data === 'object' &&
    '_seconds' in data &&
    '_nanoseconds' in data &&
    typeof (data as { _seconds: unknown })._seconds === 'number'
  ) {
    const { _seconds } = data as { _seconds: number };
    return new Date(_seconds * 1000);
  }

  // ✅ Handle Client SDK Timestamp format ({ seconds, nanoseconds })
  if (
    data &&
    typeof data === 'object' &&
    'seconds' in data &&
    'nanoseconds' in data &&
    typeof (data as { seconds: unknown }).seconds === 'number'
  ) {
    const { seconds } = data as { seconds: number };
    return new Date(seconds * 1000);
  }

  // Handle arrays - recursively convert each element
  if (Array.isArray(data)) {
    return data.map((item) => convertTimestamps(item));
  }

  // Handle objects - recursively convert each property
  if (typeof data === 'object') {
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertTimestamps(value);
    }

    return converted;
  }

  // Return primitive values as-is
  return data;
}

type PlainObject = Record<string, unknown>;

const EMPLOYMENT_TYPE_MAP: Record<string, 'permanent' | 'contract'> = {
  'full-time': 'permanent',
  'part-time': 'contract',
};

const DEFAULT_DATE_OF_BIRTH = new Date('1990-01-01');

function isRecord(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null;
}

function ensureString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function sanitizePhoneNumber(value: unknown): string {
  if (typeof value !== 'string') {
    return '0000000000';
  }
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length >= 9 && digitsOnly.length <= 10) {
    return digitsOnly;
  }
  if (digitsOnly.length > 10) {
    return digitsOnly.slice(0, 10);
  }
  return digitsOnly.padEnd(9, '0');
}

function sanitizeAccountNumber(value: unknown): string {
  if (typeof value !== 'string') {
    return '0000000000';
  }
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length >= 10) {
    return digitsOnly.slice(0, 20);
  }
  return digitsOnly.padEnd(10, '0');
}

function normalizeNationalId(value: unknown): string {
  if (typeof value === 'string') {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 13) {
      return digits;
    }
    if (digits.length > 13) {
      return digits.slice(0, 13);
    }
    if (digits.length > 0) {
      return digits.padEnd(13, '0');
    }
  }
  return '0000000000000';
}

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return undefined;
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return Math.max(age, 0);
}

function ensureEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  if (typeof value === 'string' && allowed.includes(value as T)) {
    return value as T;
  }
  return fallback;
}

function createDefaultEmergencyContact() {
  return {
    name: 'ไม่ระบุ',
    relationship: 'ไม่ระบุ',
    phoneNumber: '0000000000',
  };
}

function isEmergencyContact(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.name === 'string' &&
    typeof value.relationship === 'string' &&
    typeof value.phoneNumber === 'string'
  );
}

function createDefaultAddress() {
  return {
    addressLine1: 'ไม่ระบุ',
    addressLine2: null,
    subDistrict: 'ไม่ระบุ',
    district: 'ไม่ระบุ',
    province: 'ไม่ระบุ',
    postalCode: '00000',
    country: 'ไทย',
  };
}

function isAddress(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.addressLine1 === 'string' &&
    typeof value.subDistrict === 'string' &&
    typeof value.district === 'string' &&
    typeof value.province === 'string' &&
    typeof value.postalCode === 'string' &&
    typeof value.country === 'string'
  );
}

function createDefaultWorkLocation() {
  return {
    office: 'Head Office',
    building: null,
    floor: null,
    seat: null,
  };
}

function isWorkLocation(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value.office === 'string';
}

function createDefaultSalary() {
  const now = new Date();
  return {
    baseSalary: 15000, // ✅ ขั้นต่ำตามกฎหมาย (minimum wage) - must be > 0 for schema validation
    currency: 'THB',
    paymentFrequency: 'monthly' as const,
    effectiveDate: now,
    hourlyRate: null,
  };
}

function ensureSalary(value: unknown): PlainObject {
  if (!isRecord(value)) {
    return createDefaultSalary();
  }

  // ✅ Convert effectiveDate to Date if it's a Timestamp
  const effectiveDate = toDate(value.effectiveDate) ?? new Date();

  // ✅ Ensure baseSalary is > 0 (schema requirement)
  const baseSalary =
    typeof value.baseSalary === 'number' && value.baseSalary > 0 ? value.baseSalary : 15000; // Default to minimum wage if invalid

  return {
    baseSalary,
    currency: ensureString(value.currency, 'THB'),
    paymentFrequency: ensureEnum(
      value.paymentFrequency,
      ['monthly', 'bi-weekly', 'weekly', 'hourly'],
      'monthly'
    ),
    effectiveDate,
    hourlyRate: typeof value.hourlyRate === 'number' ? value.hourlyRate : null,
  };
}

function createDefaultSocialSecurity() {
  return {
    isEnrolled: false,
    ssNumber: null,
    enrollmentDate: null,
    hospitalCode: null,
    hospitalName: null,
  };
}

function ensureSocialSecurity(value: unknown): PlainObject {
  if (!isRecord(value)) {
    return createDefaultSocialSecurity();
  }

  // ✅ Convert enrollmentDate to Date or null
  const enrollmentDate = value.enrollmentDate ? (toDate(value.enrollmentDate) ?? null) : null;

  return {
    isEnrolled: Boolean(value.isEnrolled),
    ssNumber: typeof value.ssNumber === 'string' ? value.ssNumber : null,
    enrollmentDate,
    hospitalCode: typeof value.hospitalCode === 'string' ? value.hospitalCode : null,
    hospitalName: typeof value.hospitalName === 'string' ? value.hospitalName : null,
  };
}

function createDefaultTax() {
  return {
    taxId: undefined,
    withholdingTax: false,
    withholdingRate: undefined,
    taxReliefs: [],
  };
}

function ensureTax(value: unknown): PlainObject {
  if (!isRecord(value)) {
    return createDefaultTax();
  }
  return {
    taxId: typeof value.taxId === 'string' ? value.taxId : undefined,
    withholdingTax: typeof value.withholdingTax === 'boolean' ? value.withholdingTax : false,
    withholdingRate: typeof value.withholdingRate === 'number' ? value.withholdingRate : undefined,
    taxReliefs: Array.isArray(value.taxReliefs) ? value.taxReliefs : [],
  };
}

function createDefaultBankAccount() {
  return {
    bankName: 'ไม่ระบุ',
    accountNumber: '0000000000',
    accountName: 'ไม่ระบุ',
    branchName: undefined,
  };
}

function ensureBankAccount(value: unknown): PlainObject {
  if (!isRecord(value)) {
    return createDefaultBankAccount();
  }
  return {
    bankName: ensureString(value.bankName, 'ไม่ระบุ'),
    accountNumber: sanitizeAccountNumber(value.accountNumber),
    accountName: ensureString(value.accountName, 'ไม่ระบุ'),
    branchName: typeof value.branchName === 'string' ? value.branchName : undefined,
  };
}

function createDefaultWorkSchedule(workType: string) {
  const isFullTime = workType === 'full-time';
  return {
    scheduleType: 'fixed',
    hoursPerWeek: isFullTime ? 40 : 20,
    hoursPerDay: isFullTime ? 8 : 4,
    standardHours: null,
    currentShift: null,
  };
}

function ensureWorkSchedule(value: unknown, workType: string): PlainObject {
  if (!isRecord(value)) {
    return createDefaultWorkSchedule(workType);
  }

  const scheduleType = ensureEnum(value.scheduleType, ['fixed', 'flexible', 'shift'], 'fixed');
  const hoursPerWeek =
    typeof value.hoursPerWeek === 'number' && value.hoursPerWeek > 0
      ? value.hoursPerWeek
      : workType === 'part-time'
        ? 20
        : 40;
  const hoursPerDay =
    typeof value.hoursPerDay === 'number' && value.hoursPerDay > 0
      ? value.hoursPerDay
      : workType === 'part-time'
        ? 4
        : 8;

  return {
    scheduleType,
    hoursPerWeek,
    hoursPerDay,
    standardHours: value.standardHours ?? null,
    currentShift: value.currentShift ?? null,
  };
}

function createDefaultOvertime(workType: string) {
  return {
    isEligible: workType === 'full-time',
    rate: 1.5,
  };
}

function ensureOvertime(value: unknown, workType: string): PlainObject {
  if (!isRecord(value)) {
    return createDefaultOvertime(workType);
  }

  return {
    isEligible: typeof value.isEligible === 'boolean' ? value.isEligible : workType === 'full-time',
    rate: typeof value.rate === 'number' && value.rate > 0 ? value.rate : 1.5,
  };
}

function normalizeEmployeeData(data: PlainObject, docId: string): PlainObject {
  const normalized: PlainObject = { ...data };

  normalized.userId = ensureString(normalized.userId, docId);
  normalized.employeeCode = ensureString(normalized.employeeCode, docId);
  normalized.firstName = ensureString(normalized.firstName, 'Unknown');
  normalized.lastName = ensureString(normalized.lastName, normalized.firstName);
  normalized.thaiFirstName = ensureString(normalized.thaiFirstName, normalized.firstName);
  normalized.thaiLastName = ensureString(normalized.thaiLastName, normalized.lastName);
  normalized.email = ensureString(normalized.email, `${docId}@invalid.local`);
  normalized.phoneNumber = sanitizePhoneNumber(normalized.phoneNumber);

  normalized.emergencyContact = isEmergencyContact(normalized.emergencyContact)
    ? normalized.emergencyContact
    : createDefaultEmergencyContact();

  const createdAt = toDate(normalized.createdAt) ?? new Date();
  const dateOfBirth = toDate(normalized.dateOfBirth) ?? DEFAULT_DATE_OF_BIRTH;
  const hireDate = toDate(normalized.hireDate) ?? createdAt;

  normalized.dateOfBirth = dateOfBirth;
  normalized.age =
    typeof normalized.age === 'number' && Number.isFinite(normalized.age)
      ? normalized.age
      : calculateAge(dateOfBirth);
  normalized.createdAt = createdAt;
  normalized.updatedAt = toDate(normalized.updatedAt) ?? createdAt;
  normalized.hireDate = hireDate;

  // ✅ Convert employment-related dates
  normalized.probationEndDate = normalized.probationEndDate
    ? (toDate(normalized.probationEndDate) ?? null)
    : null;
  normalized.confirmationDate = normalized.confirmationDate
    ? (toDate(normalized.confirmationDate) ?? null)
    : null;
  normalized.terminationDate = normalized.terminationDate
    ? (toDate(normalized.terminationDate) ?? null)
    : null;
  normalized.lastWorkingDate = normalized.lastWorkingDate
    ? (toDate(normalized.lastWorkingDate) ?? null)
    : null;

  // ✅ Convert national ID dates
  normalized.nationalIdIssueDate = normalized.nationalIdIssueDate
    ? (toDate(normalized.nationalIdIssueDate) ?? null)
    : null;
  normalized.nationalIdExpiryDate = normalized.nationalIdExpiryDate
    ? (toDate(normalized.nationalIdExpiryDate) ?? null)
    : null;

  normalized.gender = ensureEnum(normalized.gender, ['male', 'female', 'other'], 'other');
  normalized.maritalStatus = ensureEnum(
    normalized.maritalStatus,
    ['single', 'married', 'divorced', 'widowed'],
    'single'
  );
  normalized.nationality = ensureString(normalized.nationality, 'ไทย');
  normalized.religion = typeof normalized.religion === 'string' ? normalized.religion : undefined;
  normalized.nationalId = normalizeNationalId(normalized.nationalId);

  normalized.currentAddress = isAddress(normalized.currentAddress)
    ? normalized.currentAddress
    : createDefaultAddress();

  normalized.permanentAddress =
    normalized.permanentAddress && isAddress(normalized.permanentAddress)
      ? normalized.permanentAddress
      : normalized.currentAddress;

  normalized.photoURL = typeof normalized.photoURL === 'string' ? normalized.photoURL : null;

  normalized.status = ensureEnum(
    normalized.status,
    ['active', 'on-leave', 'resigned', 'terminated'],
    'active'
  );

  const rawEmploymentType = ensureString(normalized.employmentType, 'permanent');
  const mappedEmploymentType = EMPLOYMENT_TYPE_MAP[rawEmploymentType] ?? rawEmploymentType;
  normalized.employmentType = ensureEnum(
    mappedEmploymentType,
    ['permanent', 'contract', 'probation', 'freelance', 'intern'],
    'permanent'
  );

  normalized.workType = ensureEnum(normalized.workType, ['full-time', 'part-time'], 'full-time');
  normalized.position = ensureString(normalized.position, 'ไม่ระบุตำแหน่ง');
  normalized.department = ensureString(normalized.department, 'ไม่ระบุแผนก');
  normalized.level =
    typeof normalized.level === 'string' && normalized.level.length > 0
      ? normalized.level
      : undefined;
  normalized.division =
    typeof normalized.division === 'string' && normalized.division.length > 0
      ? normalized.division
      : undefined;
  normalized.team =
    typeof normalized.team === 'string' && normalized.team.length > 0 ? normalized.team : undefined;

  normalized.reportingTo = isRecord(normalized.reportingTo) ? normalized.reportingTo : null;
  normalized.workLocation = isWorkLocation(normalized.workLocation)
    ? normalized.workLocation
    : createDefaultWorkLocation();

  normalized.salary = ensureSalary(normalized.salary);
  normalized.socialSecurity = ensureSocialSecurity(normalized.socialSecurity);
  normalized.tax = ensureTax(normalized.tax);
  normalized.bankAccount = ensureBankAccount(normalized.bankAccount);

  const workType = normalized.workType as string;
  normalized.workSchedule = ensureWorkSchedule(normalized.workSchedule, workType);
  normalized.overtime = ensureOvertime(normalized.overtime, workType);

  normalized.notes = typeof normalized.notes === 'string' ? normalized.notes : undefined;

  return normalized;
}

/**
 * Employee Service
 */
export const employeeService = {
  /**
   * Get all employees with optional filters
   */
  async getAll(filters?: EmployeeFilters): Promise<Employee[]> {
    try {
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.department) {
        constraints.push(where('department', '==', filters.department));
      }

      if (filters?.position) {
        constraints.push(where('position', '==', filters.position));
      }

      // Default ordering
      constraints.push(orderBy('createdAt', 'desc'));

      // Execute query
      const employeesCol = collection(db, COLLECTION);
      const q = query(employeesCol, ...constraints);
      const snapshot = await getDocs(q);

      // Parse and validate each document
      const employees: Employee[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const converted = convertTimestamps(data) as PlainObject;
        const normalized = normalizeEmployeeData(converted, docSnap.id);

        // Validate with Zod
        const result = EmployeeSchema.safeParse({
          id: docSnap.id,
          ...normalized,
        });

        if (result.success) {
          const employee = result.data;
          // Add denormalized fields if missing
          employees.push({
            ...employee,
            displayName: employee.displayName || `${employee.firstName} ${employee.lastName}`,
            thaiDisplayName:
              employee.thaiDisplayName || `${employee.thaiFirstName} ${employee.thaiLastName}`,
            positionName: employee.positionName || employee.position,
            departmentName: employee.departmentName || employee.department,
          } as Employee);
        } else {
          console.warn(
            `⚠️ Skipping invalid employee ${docSnap.id} (${data.email || 'no email'}):`,
            'Schema validation failed. Run seed scripts to fix data.'
          );
          // Log detailed errors only in development
          if (import.meta.env.DEV) {
            console.group(`❌ Validation Details for ${docSnap.id}`);
            console.log('Raw data after conversion:', converted);
            console.log('Normalized data:', normalized);
            console.log('Validation errors with paths:', result.error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
              code: err.code
            })));
            console.log('🔍 Sample timestamp values:', {
              dateOfBirth: normalized.dateOfBirth,
              dateOfBirthType: typeof normalized.dateOfBirth,
              dateOfBirthConstructor: normalized.dateOfBirth?.constructor?.name,
              hireDate: normalized.hireDate,
              hireDateType: typeof normalized.hireDate,
              hireDateConstructor: normalized.hireDate?.constructor?.name,
              createdAt: normalized.createdAt,
              createdAtType: typeof normalized.createdAt,
              createdAtConstructor: normalized.createdAt?.constructor?.name,
              salaryEffectiveDate: (normalized.salary as any)?.effectiveDate,
              salaryEffectiveDateType: typeof (normalized.salary as any)?.effectiveDate,
              salaryEffectiveDateConstructor: (normalized.salary as any)?.effectiveDate?.constructor?.name,
            });
            console.groupEnd();
          }
        }
      }

      return employees;
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      throw new Error('ไม่สามารถดึงข้อมูลพนักงานได้');
    }
  },

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();

      // ✅ Debug: Log raw data to see timestamp format
      console.log('🔍 Raw Firestore data sample:', {
        id,
        dateOfBirth: data.dateOfBirth,
        dateOfBirthType: data.dateOfBirth?.constructor?.name,
        createdAt: data.createdAt,
        createdAtType: data.createdAt?.constructor?.name,
      });

      const converted = convertTimestamps(data) as PlainObject;

      // ✅ Debug: Log converted data
      console.log('🔄 After convertTimestamps:', {
        id,
        dateOfBirth: converted.dateOfBirth,
        dateOfBirthType: converted.dateOfBirth?.constructor?.name,
        createdAt: converted.createdAt,
        createdAtType: converted.createdAt?.constructor?.name,
      });

      const normalized = normalizeEmployeeData(converted, snapshot.id);

      // ✅ Debug: Log normalized data
      console.log('✨ After normalizeEmployeeData:', {
        id,
        dateOfBirth: normalized.dateOfBirth,
        dateOfBirthType: normalized.dateOfBirth?.constructor?.name,
        createdAt: normalized.createdAt,
        createdAtType: normalized.createdAt?.constructor?.name,
      });

      // Validate with Zod
      const result = EmployeeSchema.safeParse({
        id: snapshot.id,
        ...normalized,
      });

      if (!result.success) {
        console.error(`❌ Validation failed for employee ${id}:`);
        console.error('Validation errors:', JSON.stringify(result.error.issues, null, 2));
        console.error('Failed data sample:', {
          dateOfBirth: normalized.dateOfBirth,
          hireDate: normalized.hireDate,
          salary: normalized.salary,
          createdAt: normalized.createdAt,
          updatedAt: normalized.updatedAt,
        });
        throw new Error('ข้อมูลพนักงานไม่ถูกต้อง');
      }

      const employee = result.data;
      // Add denormalized fields if missing
      return {
        ...employee,
        displayName: employee.displayName || `${employee.firstName} ${employee.lastName}`,
        thaiDisplayName:
          employee.thaiDisplayName || `${employee.thaiFirstName} ${employee.thaiLastName}`,
        positionName: employee.positionName || employee.position,
        departmentName: employee.departmentName || employee.department,
      };
    } catch (error) {
      console.error(`Failed to fetch employee ${id}:`, error);
      throw new Error('ไม่สามารถดึงข้อมูลพนักงานได้');
    }
  },

  /**
   * Create new employee by calling a Cloud Function
   */
  async create(payload: {
    password?: string;
    employeeData: EmployeeCreatePayload;
  }): Promise<unknown> {
    if (!payload.password) {
      throw new Error('Password is required to create a new employee.');
    }

    try {
      const functions = getFunctions();
      const createEmployeeFunction = httpsCallable(functions, 'createEmployee');

      const { employeeData, password } = payload;

      const result = await createEmployeeFunction({
        email: employeeData.email,
        password,
        displayName: `${employeeData.firstName} ${employeeData.lastName}`,
        employeeData: {
          ...employeeData,
          // Convert date strings from form to Date objects
          dateOfBirth: employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth) : undefined,
          hireDate: employeeData.hireDate ? new Date(employeeData.hireDate) : undefined,
        },
      });

      return result.data;
    } catch (error) {
      console.error('Failed to create employee via cloud function:', error);
      // You can check error.code and error.message to provide more specific feedback
      throw new Error('ไม่สามารถสร้างข้อมูลพนักงานได้');
    }
  },

  /**
   * Update employee
   */
  async update(id: string, data: Partial<Employee>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);

      // Remove id from update data
      const { id: _id, createdAt: _createdAt, ...updateData } = data;

      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Failed to update employee ${id}:`, error);
      throw new Error('ไม่สามารถอัปเดตข้อมูลพนักงานได้');
    }
  },

  /**
   * Delete employee (soft delete - set status to terminated)
   */
  async softDelete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);

      await updateDoc(docRef, {
        status: 'terminated',
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Failed to soft delete employee ${id}:`, error);
      throw new Error('ไม่สามารถลบข้อมูลพนักงานได้');
    }
  },

  /**
   * Hard delete employee (permanent)
   * Use with caution - this is irreversible
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Failed to delete employee ${id}:`, error);
      throw new Error('ไม่สามารถลบข้อมูลพนักงานได้');
    }
  },

  /**
   * Check if employee code exists
   */
  async isEmployeeCodeExists(code: string, excludeId?: string): Promise<boolean> {
    try {
      const employeesCol = collection(db, COLLECTION);
      const q = query(employeesCol, where('employeeCode', '==', code));
      const snapshot = await getDocs(q);

      if (excludeId) {
        return snapshot.docs.some((d) => d.id !== excludeId);
      }

      return !snapshot.empty;
    } catch (error) {
      console.error('Failed to check employee code:', error);
      return false;
    }
  },

  /**
   * Search employees by keyword (firstName, lastName, email, employeeCode)
   */
  async search(keyword: string): Promise<Employee[]> {
    try {
      // Note: Firestore doesn't support full-text search
      // For production, consider using Algolia or Firebase Extensions
      const employees = await this.getAll();

      const searchTerm = keyword.toLowerCase();

      return employees.filter((emp) => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const thaiFullName = `${emp.thaiFirstName} ${emp.thaiLastName}`.toLowerCase();

        return (
          fullName.includes(searchTerm) ||
          thaiFullName.includes(searchTerm) ||
          emp.email.toLowerCase().includes(searchTerm) ||
          emp.employeeCode.toLowerCase().includes(searchTerm)
        );
      });
    } catch (error) {
      console.error('Failed to search employees:', error);
      throw new Error('ไม่สามารถค้นหาพนักงานได้');
    }
  },
};
