import { z } from 'zod';
import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';

// Base Schemas
export const CandidateStatusSchema = z.enum([
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
]);

export const EducationLevelSchema = z.enum([
  'high_school',
  'diploma',
  'bachelor',
  'master',
  'doctorate',
]);

export const ExperienceLevelSchema = z.enum([
  'entry',
  'junior',
  'mid',
  'senior',
  'lead',
  'executive',
]);

// Education Schema
export const EducationSchema = z.object({
  degree: z.string().min(1, 'ระดับการศึกษาต้องไม่ว่าง'),
  field: z.string().min(1, 'สาขาวิชาต้องไม่ว่าง'),
  institution: z.string().min(1, 'สถาบันการศึกษาต้องไม่ว่าง'),
  graduationYear: z.number().min(1950).max(2030),
  gpa: z.number().min(0).max(4).optional(),
});

// Work Experience Schema
export const WorkExperienceSchema = z.object({
  title: z.string().min(1, 'ตำแหน่งงานต้องไม่ว่าง'),
  company: z.string().min(1, 'ชื่อบริษัทต้องไม่ว่าง'),
  startDate: z.string().min(1, 'วันที่เริ่มต้องไม่ว่าง'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

/**
 * Complete Candidate Schema (Firestore document)
 * ✅ Single Source of Truth for Candidate data
 */
export const CandidateSchema = z.object({
  // Base fields
  id: z.string().min(1),
  firstName: z.string().min(1, 'ชื่อต้องไม่ว่าง'),
  lastName: z.string().min(1, 'นามสกุลต้องไม่ว่าง'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phone: z.string().min(9, 'เบอร์โทรศัพท์ไม่ถูกต้อง'),
  dateOfBirth: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  address: z.string().nullable().optional(),

  // Position Information
  positionApplied: z.string().min(1, 'กรุณาระบุตำแหน่งที่สมัคร'),
  expectedSalary: z.number().min(0).nullable().optional(),
  availableDate: z.string().nullable().optional(),

  // Experience & Skills
  experienceLevel: ExperienceLevelSchema.optional(),
  yearsOfExperience: z.number().min(0).optional(),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),

  // Education & Experience
  education: z.array(EducationSchema).default([]),
  workExperience: z.array(WorkExperienceSchema).default([]),

  // Documents & Links
  resumeUrl: z.string().url('URL ของเรซูเม่ไม่ถูกต้อง').nullable(),
  portfolioUrl: z.string().url('URL ของ Portfolio ไม่ถูกต้อง').optional().nullable(),
  linkedInUrl: z.string().url('URL ของ LinkedIn ไม่ถูกต้อง').optional().nullable(),

  // Application Status
  status: CandidateStatusSchema,
  notes: z.string().nullable().optional(),
  interviewDate: z.string().nullable().optional(),
  interviewer: z.string().nullable().optional(),

  // Application Source
  source: z.string().default('website'),

  // Metadata
  tenantId: z.string().min(1),
  appliedAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  createdAt: FirestoreTimestampSchema,
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Schema for the public candidate application form.
 */
export const CandidateApplicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phone: z.string().min(9, 'เบอร์โทรศัพท์ไม่ถูกต้อง').max(10, 'เบอร์โทรศัพท์ไม่ถูกต้อง'),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),

  // Position Information
  positionApplied: z.string().min(1, 'กรุณาเลือกตำแหน่งที่สมัคร'),
  expectedSalary: z.number().min(0, 'เงินเดือนที่คาดหวังต้องมากกว่า 0').optional(),
  availableDate: z.string().optional(),

  // Experience & Skills
  experienceLevel: ExperienceLevelSchema.optional(),
  yearsOfExperience: z.number().min(0, 'จำนวนปีประสบการณ์ต้องมากกว่า 0').optional(),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),

  // Education
  education: z.array(EducationSchema).min(1, 'กรุณาเพิ่มข้อมูลการศึกษาอย่างน้อย 1 รายการ'),

  // Work Experience
  workExperience: z.array(WorkExperienceSchema).default([]),

  // Documents & Links
  resumeUrl: z.string().url('URL ของเรซูเม่ไม่ถูกต้อง').or(z.literal('')).nullable(),
  portfolioUrl: z.string().url('URL ของ Portfolio ไม่ถูกต้อง').or(z.literal('')).optional().nullable(),
  linkedInUrl: z.string().url('URL ของ LinkedIn ไม่ถูกต้อง').or(z.literal('')).optional().nullable(),
});

/**
 * Schema for HR to update candidate status and add notes.
 */
export const CandidateUpdateSchema = z.object({
  status: CandidateStatusSchema,
  notes: z.string().optional(),
  interviewDate: z.string().optional(),
  interviewer: z.string().optional(),
});

// Inferred Types (Single Source of Truth)
export type Candidate = z.infer<typeof CandidateSchema>;
export type CandidateStatus = z.infer<typeof CandidateStatusSchema>;
export type EducationLevel = z.infer<typeof EducationLevelSchema>;
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type CandidateApplicationInput = z.infer<typeof CandidateApplicationSchema>;
export type CandidateUpdateInput = z.infer<typeof CandidateUpdateSchema>;

/**
 * Cloud Function: Create Candidate Schema
 */
export const CloudFunctionCreateCandidateSchema = z.object({
  candidateData: CandidateApplicationSchema,
});

export type CloudFunctionCreateCandidate = z.infer<typeof CloudFunctionCreateCandidateSchema>;

/**
 * Cloud Function: Update Candidate Status Schema
 */
export const CloudFunctionUpdateCandidateSchema = z.object({
  candidateId: z.string().min(1, 'ต้องระบุ Candidate ID'),
  status: CandidateStatusSchema,
  notes: z.string().max(1000).optional(),
  interviewDate: z.string().optional(),
  interviewer: z.string().optional(),
});

export type CloudFunctionUpdateCandidate = z.infer<typeof CloudFunctionUpdateCandidateSchema>;

/**
 * Cloud Function: Move to Employee Schema
 */
export const CloudFunctionMoveToEmployeeSchema = z.object({
  candidateId: z.string().min(1, 'ต้องระบุ Candidate ID'),
  hireDate: z.string().min(1, 'ต้องระบุวันที่เริ่มงาน'),
  salary: z.number().min(0, 'เงินเดือนต้องมากกว่า 0'),
  positionId: z.string().min(1, 'ต้องระบุตำแหน่งงาน'),
  departmentId: z.string().min(1, 'ต้องระบุแผนก'),
});

export type CloudFunctionMoveToEmployee = z.infer<typeof CloudFunctionMoveToEmployeeSchema>;

// Validation helpers
export function validateCandidate(data: unknown) {
  return CandidateSchema.parse(data);
}

export function safeValidateCandidate(data: unknown) {
  const result = CandidateSchema.safeParse(data);
  return result.success ? result.data : null;
}
