/**
 * Zod validation schemas for Employee domain (Cloud Functions)
 * Contains only the schemas needed for Cloud Functions
 */

import { z } from 'zod';

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
  enrollmentDate: z.union([z.string(), z.date()]).nullable().optional(),
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
  level: z.string(),
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
  issueDate: z.union([z.string(), z.date()]),
  expiryDate: z.union([z.string(), z.date()]).optional(),
  credentialId: z.string().optional(),
});

/**
 * Work Schedule Schema
 */
export const WorkScheduleSchema = z.object({
  scheduleType: z.enum(['fixed', 'flexible', 'shift']),
  hoursPerWeek: z.number().positive(),
  hoursPerDay: z.number().positive(),
});

/**
 * Overtime Configuration Schema
 */
export const OvertimeConfigSchema = z.object({
  isEligible: z.boolean(),
  rate: z.number().positive(), // 1.5, 2, 3
});

// ============================================
// Create Employee Schema (for Cloud Function)
// ============================================

/**
 * Create Employee Input (without id, timestamps, userId)
 * Used for Cloud Function validation
 */
export const CreateEmployeeSchema = z.object({
  // employeeCode is auto-generated and not included here

  // Personal Information
  firstName: z.string().min(1, 'ชื่อต้องไม่ว่าง').max(100),
  lastName: z.string().min(1, 'นามสกุลต้องไม่ว่าง').max(100),
  thaiFirstName: z.string().min(1, 'ชื่อภาษาไทยต้องไม่ว่าง').max(100),
  thaiLastName: z.string().min(1, 'นามสกุลภาษาไทยต้องไม่ว่าง').max(100),
  nickname: z.string().nullable().optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  personalEmail: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').nullable().optional(),
  phoneNumber: z.string().regex(/^[0-9]{9,10}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก'),
  emergencyContact: EmergencyContactSchema,

  // Personal Details
  dateOfBirth: z.union([z.string(), z.date()]),
  gender: GenderSchema,
  maritalStatus: MaritalStatusSchema,
  nationality: z.string().default('ไทย'),
  religion: z.string().nullable().optional(),

  // National ID
  nationalId: z.string().regex(/^[0-9]{13}$/, 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก'),
  nationalIdIssueDate: z.union([z.string(), z.date()]).nullable().optional(),
  nationalIdExpiryDate: z.union([z.string(), z.date()]).nullable().optional(),

  // Address
  currentAddress: AddressSchema,
  permanentAddress: AddressSchema.nullable().optional(),

  photoURL: z.string().url().nullable().optional().or(z.literal('')),

  // Employment Information
  hireDate: z.union([z.string(), z.date()]),
  probationEndDate: z.union([z.string(), z.date()]).nullable().optional(),
  confirmationDate: z.union([z.string(), z.date()]).nullable().optional(),

  status: EmployeeStatusSchema.optional(),
  employmentType: EmploymentTypeSchema,
  workType: WorkTypeSchema,

  position: z.string().min(1, 'ตำแหน่งต้องไม่ว่าง'),
  level: z.string().optional(),
  department: z.string().min(1, 'แผนกต้องไม่ว่าง'),
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

  notes: z.string().optional(),
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

// ============================================
// Type Exports
// ============================================

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type CloudFunctionCreateEmployeeInput = z.infer<typeof CloudFunctionCreateEmployeeSchema>;
