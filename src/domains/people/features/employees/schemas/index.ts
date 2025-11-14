/**
 * Zod validation schemas for Employee domain
 * Complete validation for employee data with modular structure
 */

import { z } from 'zod';
import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';

// ============================================
// Enum Schemas
// ============================================

export const EmployeeStatusSchema = z.enum(['active', 'on-leave', 'resigned', 'terminated']);
export const EmploymentTypeSchema = z.enum([
  'permanent',
  'contract',
  'probation',
  'freelance',
  'intern',
]);
export const WorkTypeSchema = z.enum(['full-time', 'part-time']);
export const GenderSchema = z.enum(['male', 'female', 'other']);
export const MaritalStatusSchema = z.enum(['single', 'married', 'divorced', 'widowed']);
export const PaymentFrequencySchema = z.enum(['monthly', 'bi-weekly', 'weekly', 'hourly']);
export const EducationLevelSchema = z.enum([
  'high-school',
  'diploma',
  'bachelor',
  'master',
  'doctorate',
]);

// ============================================
// Sub-schemas (Building Blocks)
// ============================================

/**
 * Address Schema
 */
export const AddressSchema = z.object({
  addressLine1: z.string().min(1, 'ที่อยู่บรรทัดที่ 1 ต้องไม่ว่าง'),
  addressLine2: z.string().nullable().optional(),
  subDistrict: z.string().min(1, 'ตำบล/แขวง ต้องไม่ว่าง'),
  district: z.string().min(1, 'อำเภอ/เขต ต้องไม่ว่าง'),
  province: z.string().min(1, 'จังหวัด ต้องไม่ว่าง'),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'),
  country: z.string().min(1, 'ประเทศ ต้องไม่ว่าง').default('ไทย'),
});

/**
 * Emergency Contact Schema
 */
export const EmergencyContactSchema = z.object({
  name: z.string().min(1, 'ชื่อผู้ติดต่อฉุกเฉินต้องไม่ว่าง'),
  relationship: z.string().min(1, 'ความสัมพันธ์ต้องไม่ว่าง'),
  phoneNumber: z.string().regex(/^[0-9]{9,10}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก'),
});

/**
 * Salary Information Schema
 */
export const SalaryInfoSchema = z.object({
  baseSalary: z.number().positive('เงินเดือนพื้นฐานต้องมากกว่า 0'),
  currency: z.string().default('THB'),
  paymentFrequency: PaymentFrequencySchema,
  effectiveDate: FirestoreTimestampSchema,
  hourlyRate: z.number().positive('อัตราค่าจ้างต่อชั่วโมงต้องมากกว่า 0').nullable().optional(),
});

/**
 * Allowance Schema
 */
export const AllowanceSchema = z.object({
  type: z.string().min(1, 'ประเภทเบี้ยเลี้ยงต้องไม่ว่าง'),
  amount: z.number().positive('จำนวนเงินต้องมากกว่า 0'),
  frequency: z.enum(['monthly', 'quarterly', 'yearly']),
});

/**
 * Social Security Schema
 */
export const SocialSecurityInfoSchema = z.object({
  isEnrolled: z.boolean(),
  ssNumber: z.string().nullable().optional(),
  enrollmentDate: FirestoreTimestampSchema.nullable().optional(),
  hospitalCode: z.string().nullable().optional(),
  hospitalName: z.string().nullable().optional(),
});

/**
 * Tax Relief Schema
 */
export const TaxReliefSchema = z.object({
  type: z.string().min(1),
  amount: z.number().nonnegative(),
});

/**
 * Tax Information Schema
 */
export const TaxInfoSchema = z.object({
  taxId: z.string().optional(),
  withholdingTax: z.boolean(),
  withholdingRate: z.number().min(0).max(100).optional(), // %
  taxReliefs: z.array(TaxReliefSchema).optional(),
});

/**
 * Bank Account Schema
 */
export const BankAccountSchema = z.object({
  bankName: z.string().min(1, 'ชื่อธนาคารต้องไม่ว่าง'),
  accountNumber: z.string().min(10, 'เลขที่บัญชีต้องมีอย่างน้อย 10 หลัก'),
  accountName: z.string().min(1, 'ชื่อบัญชีต้องไม่ว่าง'),
  branchName: z.string().optional(),
});

/**
 * Reporting To Schema
 */
export const ReportingToSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  position: z.string(),
});

/**
 * Work Location Schema
 */
export const WorkLocationSchema = z.object({
  office: z.string().min(1, 'สำนักงานต้องไม่ว่าง'),
  building: z.string().nullable().optional(),
  floor: z.string().nullable().optional(),
  seat: z.string().nullable().optional(),
});

/**
 * Benefits Schema
 */
export const BenefitsSchema = z.object({
  healthInsurance: z.boolean(),
  lifeInsurance: z.boolean(),
  providentFund: z.object({
    isEnrolled: z.boolean(),
    employeeContributionRate: z.number().min(0).max(100).optional(),
    employerContributionRate: z.number().min(0).max(100).optional(),
  }),
  annualLeave: z.number().nonnegative(),
  sickLeave: z.number().nonnegative(),
  otherBenefits: z.array(z.string()).optional(),
});

/**
 * Education Record Schema
 */
export const EducationRecordSchema = z.object({
  level: EducationLevelSchema,
  institution: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  graduationYear: z.number().int().min(1950).max(2100),
  gpa: z.number().min(0).max(4).optional(),
});

/**
 * Certification Schema
 */
export const CertificationSchema = z.object({
  name: z.string().min(1),
  issuingOrganization: z.string().min(1),
  issueDate: FirestoreTimestampSchema,
  expiryDate: FirestoreTimestampSchema.optional(),
  credentialId: z.string().optional(),
});

/**
 * Work Hours Schema
 */
export const WorkHoursSchema = z.object({
  startTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:MM)'),
  endTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:MM)'),
  breakMinutes: z.number().min(0).max(480), // max 8 hours break
});

/**
 * Work Schedule Schema
 */
export const WorkScheduleSchema = z.object({
  scheduleType: z.enum(['fixed', 'flexible', 'shift']),
  hoursPerWeek: z.number().positive(),
  hoursPerDay: z.number().positive(),
  standardHours: z
    .object({
      monday: WorkHoursSchema.optional(),
      tuesday: WorkHoursSchema.optional(),
      wednesday: WorkHoursSchema.optional(),
      thursday: WorkHoursSchema.optional(),
      friday: WorkHoursSchema.optional(),
      saturday: WorkHoursSchema.optional(),
      sunday: WorkHoursSchema.optional(),
    })
    .nullable()
    .optional(),
  currentShift: z
    .object({
      shiftName: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    })
    .nullable()
    .optional(),
});

/**
 * Overtime Configuration Schema
 */
export const OvertimeConfigSchema = z.object({
  isEligible: z.boolean(),
  rate: z.number().positive(), // 1.5, 2, 3
});

// ============================================
// Main Employee Schema
// ============================================

/**
 * Complete Employee Schema (for database)
 */
export const EmployeeSchema = z.object({
  // Base
  id: z.string(),
  userId: z.string(),
  employeeCode: z.string().min(1, 'รหัสพนักงานต้องไม่ว่าง'),

  // Personal Information
  firstName: z.string().min(1, 'ชื่อต้องไม่ว่าง').max(100),
  lastName: z.string().min(1, 'นามสกุลต้องไม่ว่าง').max(100),
  displayName: z.string().optional(), // Denormalized
  thaiFirstName: z.string().min(1, 'ชื่อภาษาไทยต้องไม่ว่าง').max(100),
  thaiLastName: z.string().min(1, 'นามสกุลภาษาไทยต้องไม่ว่าง').max(100),
  thaiDisplayName: z.string().optional(), // Denormalized
  nickname: z.string().nullable().optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  personalEmail: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').nullable().optional(),
  phoneNumber: z.string().regex(/^[0-9]{9,10}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก'),
  emergencyContact: EmergencyContactSchema,

  // Personal Details
  dateOfBirth: FirestoreTimestampSchema,
  age: z.number().int().positive(),
  gender: GenderSchema,
  maritalStatus: MaritalStatusSchema,
  nationality: z.string().default('ไทย'),
  religion: z.string().nullable().optional(),

  // National ID
  nationalId: z.string().regex(/^[0-9]{13}$/, 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก'),
  nationalIdIssueDate: FirestoreTimestampSchema.nullable().optional(),
  nationalIdExpiryDate: FirestoreTimestampSchema.nullable().optional(),

  // Address
  currentAddress: AddressSchema,
  permanentAddress: AddressSchema.nullable().optional(),

  photoURL: z.string().url().nullable().optional().or(z.literal('')),

  // Employment Information
  hireDate: FirestoreTimestampSchema,
  probationEndDate: FirestoreTimestampSchema.nullable().optional(),
  confirmationDate: FirestoreTimestampSchema.nullable().optional(),
  terminationDate: FirestoreTimestampSchema.nullable().optional(),
  lastWorkingDate: FirestoreTimestampSchema.nullable().optional(),

  status: EmployeeStatusSchema,
  employmentType: EmploymentTypeSchema,
  workType: WorkTypeSchema,

  position: z.string().min(1, 'ตำแหน่งต้องไม่ว่าง'),
  positionName: z.string().optional(), // Denormalized
  level: z.string().optional(),
  department: z.string().min(1, 'แผนกต้องไม่ว่าง'),
  departmentName: z.string().optional(), // Denormalized
  division: z.string().nullable().optional(),
  team: z.string().nullable().optional(),

  reportingTo: ReportingToSchema.nullable().optional(),
  workLocation: WorkLocationSchema,

  // Compensation & Benefits
  salary: SalaryInfoSchema,
  allowances: z.array(AllowanceSchema).optional(),
  benefits: BenefitsSchema.optional(),

  // Tax & Social Security
  socialSecurity: SocialSecurityInfoSchema,
  tax: TaxInfoSchema,
  bankAccount: BankAccountSchema,

  // Education
  education: z.array(EducationRecordSchema).optional(),
  certifications: z.array(CertificationSchema).optional(),

  // Work Schedule
  workSchedule: WorkScheduleSchema,
  overtime: OvertimeConfigSchema,

  // Documents (stored as refs, not full data)
  documents: z
    .array(
      z.object({
        type: z.string(),
        fileName: z.string(),
        fileURL: z.string().url(),
        uploadDate: FirestoreTimestampSchema,
        uploadedBy: z.string(),
        expiryDate: FirestoreTimestampSchema.optional(),
        storagePath: z.string().optional(),
      })
    )
    .optional(),

  notes: z.string().optional(),

  // Timestamps (Universal validator accepts both Date and Timestamp)
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
});

/**
 * Employee type inferred from schema (Single Source of Truth)
 */
export type Employee = z.infer<typeof EmployeeSchema>;

// ============================================
// Form Schemas (Simplified for UI)
// ============================================

/**
 * Employee Form Schema - Step 1: Personal Information
 * Note: employeeCode is auto-generated by backend and not included in form
 */
export const PersonalInfoFormSchema = z.object({
  // Basic (employeeCode removed - will be auto-generated)
  firstName: z.string().min(1, 'ชื่อต้องไม่ว่าง').max(100),
  lastName: z.string().min(1, 'นามสกุลต้องไม่ว่าง').max(100),
  thaiFirstName: z.string().min(1, 'ชื่อภาษาไทยต้องไม่ว่าง').max(100),
  thaiLastName: z.string().min(1, 'นามสกุลภาษาไทยต้องไม่ว่าง').max(100),
  nickname: z.string().optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  personalEmail: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^[0-9]{9,10}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก'),

  // Date as string from form
  dateOfBirth: z.string().min(1, 'วันเกิดต้องไม่ว่าง'),
  gender: GenderSchema,
  maritalStatus: MaritalStatusSchema,
  nationality: z.string().default('ไทย'),
  religion: z.string().optional(),

  // National ID
  nationalId: z.string().regex(/^[0-9]{13}$/, 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก'),

  // Emergency Contact
  emergencyContactName: z.string().min(1, 'ชื่อผู้ติดต่อฉุกเฉินต้องไม่ว่าง'),
  emergencyContactRelationship: z.string().min(1, 'ความสัมพันธ์ต้องไม่ว่าง'),
  emergencyContactPhone: z.string().regex(/^[0-9]{9,10}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก'),

  photoURL: z.string().url().optional().or(z.literal('')),
});

/**
 * Employee Form Schema - Step 2: Employment Information
 */
export const EmploymentInfoFormSchema = z.object({
  hireDate: z.string().min(1, 'วันเริ่มงานต้องไม่ว่าง'),
  probationEndDate: z.string().optional(),
  status: EmployeeStatusSchema,
  employmentType: EmploymentTypeSchema,
  workType: WorkTypeSchema,

  position: z.string().min(1, 'ตำแหน่งต้องไม่ว่าง'),
  level: z.string().optional(),
  department: z.string().min(1, 'แผนกต้องไม่ว่าง'),
  division: z.string().optional(),
  team: z.string().optional(),

  workLocationOffice: z.string().min(1, 'สำนักงานต้องไม่ว่าง'),
  workLocationBuilding: z.string().optional(),
  workLocationFloor: z.string().optional(),
  workLocationSeat: z.string().optional(),
});

/**
 * Employee Form Schema - Step 3: Compensation & Benefits
 */
export const CompensationFormSchema = z.object({
  // Salary
  baseSalary: z.coerce.number().positive('เงินเดือนพื้นฐานต้องมากกว่า 0'),
  currency: z.string().default('THB'),
  paymentFrequency: PaymentFrequencySchema,
  hourlyRate: z.coerce.number().positive('อัตราค่าจ้างต่อชั่วโมงต้องมากกว่า 0').optional(),

  // Benefits
  healthInsurance: z.boolean().default(false),
  lifeInsurance: z.boolean().default(false),
  providentFundEnrolled: z.boolean().default(false),
  providentFundEmployeeRate: z.coerce.number().min(0).max(100).optional(),
  providentFundEmployerRate: z.coerce.number().min(0).max(100).optional(),
  annualLeave: z.coerce.number().nonnegative().default(0),
  sickLeave: z.coerce.number().nonnegative().default(0),
  otherBenefits: z.array(z.string()).optional(),
});

/**
 * Employee Form Schema - Step 4: Tax & Social Security
 */
export const TaxSocialSecurityFormSchema = z.object({
  // Social Security
  socialSecurityEnrolled: z.boolean(),
  socialSecurityNumber: z.string().optional(),
  hospitalCode: z.string().optional(),
  hospitalName: z.string().optional(),

  // Tax
  taxId: z.string().optional(),
  withholdingTax: z.boolean(),
  withholdingRate: z.coerce.number().min(0).max(100).optional(),

  // Bank Account
  bankName: z.string().min(1, 'ชื่อธนาคารต้องไม่ว่าง'),
  accountNumber: z.string().min(10, 'เลขที่บัญชีต้องมีอย่างน้อย 10 หลัก'),
  accountName: z.string().min(1, 'ชื่อบัญชีต้องไม่ว่าง'),
  branchName: z.string().optional(),
});

/**
 * Combined Employee Form Schema (all steps)
 */
export const EmployeeFormSchema = PersonalInfoFormSchema.merge(EmploymentInfoFormSchema)
  .merge(CompensationFormSchema)
  .merge(TaxSocialSecurityFormSchema);

// ============================================
// Create/Update Schemas
// ============================================

/**
 * Create Employee Input (without id, timestamps, userId)
 */
export const CreateEmployeeSchema = EmployeeSchema.omit({
  id: true,
  userId: true,
  age: true, // calculated
  createdAt: true,
  updatedAt: true,
});

/**
 * Update Employee Input (partial)
 */
export const UpdateEmployeeSchema = EmployeeSchema.partial().required({
  id: true,
});

/**
 * Employee Query Filters
 */
export const EmployeeFiltersSchema = z.object({
  status: EmployeeStatusSchema.optional(),
  employmentType: EmploymentTypeSchema.optional(),
  workType: WorkTypeSchema.optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  search: z.string().optional(),
});

/**
 * Cloud Function: Create Employee Input Schema
 * Schema for validating createEmployee Cloud Function input
 */
export const CloudFunctionCreateEmployeeSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  displayName: z.string().min(1, 'ต้องระบุชื่อที่แสดง'),
  employeeData: CreateEmployeeSchema,
  role: z.string().optional(),
  sendWelcomeEmail: z.boolean().optional(),
});

/**
 * Cloud Function: Update Employee Input Schema
 * Schema for validating updateEmployee Cloud Function input
 */
export const CloudFunctionUpdateEmployeeSchema = z.object({
  employeeId: z.string().min(1, 'ต้องระบุ Employee ID'),
  employeeData: UpdateEmployeeSchema.omit({ id: true }), // Omit id since it's in employeeId
  updatedBy: z.string().min(1, 'ต้องระบุผู้ที่อัปเดต'),
});

// ============================================
// Type Exports
// ============================================

export type EmployeeFormInput = z.infer<typeof EmployeeFormSchema>;
export type PersonalInfoFormInput = z.infer<typeof PersonalInfoFormSchema>;
export type EmploymentInfoFormInput = z.infer<typeof EmploymentInfoFormSchema>;
export type CompensationFormInput = z.infer<typeof CompensationFormSchema>;
export type TaxSocialSecurityFormInput = z.infer<typeof TaxSocialSecurityFormSchema>;

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
export type EmployeeFilters = z.infer<typeof EmployeeFiltersSchema>;
export type EmployeeStatus = z.infer<typeof EmployeeStatusSchema>;
export type CloudFunctionCreateEmployeeInput = z.infer<typeof CloudFunctionCreateEmployeeSchema>;
export type CloudFunctionUpdateEmployeeInput = z.infer<typeof CloudFunctionUpdateEmployeeSchema>;

// ============================================
// Helper Functions
// ============================================

/**
 * Validate employee data
 */
export function validateEmployee(data: unknown) {
  return EmployeeSchema.parse(data);
}

/**
 * Safe validation (returns null on error)
 */
export function safeValidateEmployee(data: unknown) {
  const result = EmployeeSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Convert form data to create input
 * Transforms form strings (dates, etc.) to proper types
 */
export function formDataToCreateInput(formData: EmployeeFormInput): Partial<CreateEmployeeInput> {
  const now = new Date();

  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    thaiFirstName: formData.thaiFirstName,
    thaiLastName: formData.thaiLastName,
    nickname: formData.nickname,
    email: formData.email,
    personalEmail: formData.personalEmail || undefined,
    phoneNumber: formData.phoneNumber,
    emergencyContact: {
      name: formData.emergencyContactName,
      relationship: formData.emergencyContactRelationship,
      phoneNumber: formData.emergencyContactPhone,
    },
    dateOfBirth: new Date(formData.dateOfBirth),
    gender: formData.gender,
    maritalStatus: formData.maritalStatus,
    nationality: formData.nationality,
    religion: formData.religion,
    nationalId: formData.nationalId,
    currentAddress: {
      addressLine1: '',
      subDistrict: '',
      district: '',
      province: '',
      postalCode: '',
      country: 'ไทย',
    }, // Will be filled in actual form
    photoURL: formData.photoURL || undefined,
    hireDate: new Date(formData.hireDate),
    probationEndDate: formData.probationEndDate ? new Date(formData.probationEndDate) : undefined,
    status: formData.status,
    employmentType: formData.employmentType,
    workType: formData.workType,
    position: formData.position,
    level: formData.level,
    department: formData.department,
    division: formData.division,
    team: formData.team,
    workLocation: {
      office: formData.workLocationOffice,
      building: formData.workLocationBuilding,
      floor: formData.workLocationFloor,
      seat: formData.workLocationSeat,
    },
    salary: {
      baseSalary: formData.baseSalary,
      currency: formData.currency,
      paymentFrequency: formData.paymentFrequency,
      effectiveDate: now,
      hourlyRate: formData.hourlyRate,
    },
    benefits: {
      healthInsurance: formData.healthInsurance ?? false,
      lifeInsurance: formData.lifeInsurance ?? false,
      providentFund: {
        isEnrolled: formData.providentFundEnrolled ?? false,
        employeeContributionRate: formData.providentFundEmployeeRate,
        employerContributionRate: formData.providentFundEmployerRate,
      },
      annualLeave: formData.annualLeave ?? 0,
      sickLeave: formData.sickLeave ?? 0,
      otherBenefits: formData.otherBenefits,
    },
    socialSecurity: {
      isEnrolled: formData.socialSecurityEnrolled,
      ssNumber: formData.socialSecurityNumber,
      hospitalCode: formData.hospitalCode,
      hospitalName: formData.hospitalName,
    },
    tax: {
      taxId: formData.taxId,
      withholdingTax: formData.withholdingTax,
      withholdingRate: formData.withholdingRate,
    },
    bankAccount: {
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      branchName: formData.branchName,
    },
    workSchedule: {
      scheduleType: 'fixed',
      hoursPerWeek: formData.workType === 'full-time' ? 40 : 20,
      hoursPerDay: formData.workType === 'full-time' ? 8 : 4,
    },
    overtime: {
      isEligible: formData.workType === 'full-time',
      rate: 1.5,
    },
  };
}

export type EmployeeCreatePayload = ReturnType<typeof formDataToCreateInput>;
