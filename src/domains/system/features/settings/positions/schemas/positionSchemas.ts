import { z } from 'zod';
import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';

/**
 * Position level enum
 */
export const PositionLevelSchema = z.enum([
  'entry',
  'junior',
  'senior',
  'lead',
  'manager',
  'director',
  'executive',
]);

/**
 * Position category enum
 */
export const PositionCategorySchema = z.enum([
  'technical',
  'management',
  'support',
  'sales',
  'operations',
]);

/**
 * Employment type enum
 */
export const EmploymentTypeSchema = z.enum(['permanent', 'contract', 'probation', 'intern']);

/**
 * Base position schema (without refinements)
 * This is the source of truth for the form fields.
 */
const BasePositionSchema = z.object({
  code: z
    .string()
    .min(2, 'รหัสตำแหน่งต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(20, 'รหัสตำแหน่งต้องไม่เกิน 20 ตัวอักษร')
    .regex(/^[A-Z0-9-]+$/, 'รหัสตำแหน่งต้องเป็นตัวพิมพ์ใหญ่ ตัวเลข และเครื่องหมาย - เท่านั้น')
    .toUpperCase(),
  title: z.string().min(2, 'ชื่อตำแหน่งต้องมีอย่างน้อย 2 ตัวอักษร').max(100, 'ชื่อตำแหน่งต้องไม่เกิน 100 ตัวอักษร'),
  titleEn: z
    .string()
    .min(2, 'Position title must be at least 2 characters')
    .max(100, 'Position title must not exceed 100 characters'),

  // Classification
  level: PositionLevelSchema,
  category: PositionCategorySchema,

  // Organization (denormalized)
  departmentId: z.string().min(1, 'แผนกจำเป็นต้องระบุ'),
  departmentName: z.string().min(1, 'ชื่อแผนกจำเป็นต้องระบุ'),
  departmentCode: z.string().min(1, 'รหัสแผนกจำเป็นต้องระบุ'),

  // Salary Range
  minSalary: z.number().min(0, 'เงินเดือนขั้นต่ำต้องไม่ติดลบ').optional(),
  maxSalary: z.number().min(0, 'เงินเดือนสูงสุดต้องไม่ติดลบ').optional(),
  currency: z.string().length(3, 'สกุลเงินต้องเป็นรหัส 3 ตัวอักษร'),

  // Job Details
  description: z.string().max(2000, 'คำอธิบายต้องไม่เกิน 2000 ตัวอักษร').optional(),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),

  // Employment
  employmentTypes: z.array(EmploymentTypeSchema).min(1, 'ต้องระบุประเภทการจ้างงานอย่างน้อย 1 ประเภท'),

  // Settings
  isActive: z.boolean(),
  isPublic: z.boolean(),

  // Metadata
  tenantId: z.string().min(1, 'Tenant ID จำเป็นต้องระบุ'),
});

/**
 * Complete Position Firestore schema
 * Extends the base schema with Firestore-specific fields.
 */
export const PositionSchema = BasePositionSchema.extend({
  id: z.string().min(1),
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Create position schema (with validation)
 */
export const CreatePositionSchema = BasePositionSchema.refine(
  (data) => {
    if (data.minSalary && data.maxSalary) {
      return data.minSalary <= data.maxSalary;
    }
    return true;
  },
  {
    message: 'เงินเดือนขั้นต่ำต้องไม่มากกว่าเงินเดือนสูงสุด',
    path: ['maxSalary'],
  }
);

/**
 * Update position schema (all fields optional except constraints)
 */
export const UpdatePositionSchema = BasePositionSchema.partial()
  .omit({
    tenantId: true,
  })
  .refine(
    (data) => {
      if (data.minSalary && data.maxSalary) {
        return data.minSalary <= data.maxSalary;
      }
      return true;
    },
    {
      message: 'เงินเดือนขั้นต่ำต้องไม่มากกว่าเงินเดือนสูงสุด',
      path: ['maxSalary'],
    }
  );

/**
 * Cloud Function: Create Position Schema
 */
export const CloudFunctionCreatePositionSchema = z.object({
  positionData: CreatePositionSchema,
});

/**
 * Cloud Function: Update Position Schema
 */
export const CloudFunctionUpdatePositionSchema = z.object({
  positionId: z.string().min(1, 'ต้องระบุ Position ID'),
  positionData: UpdatePositionSchema,
});

/**
 * Cloud Function: Delete Position Schema
 */
export const CloudFunctionDeletePositionSchema = z.object({
  positionId: z.string().min(1, 'ต้องระบุ Position ID'),
  transferEmployeesToPositionId: z.string().optional(), // ถ้ามีพนักงานในตำแหน่ง ย้ายไปตำแหน่งไหน
});

/**
 * Inferred types
 */
export type Position = z.infer<typeof PositionSchema>;
export type PositionLevel = z.infer<typeof PositionLevelSchema>;
export type PositionCategory = z.infer<typeof PositionCategorySchema>;
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;
export type CreatePositionFormInput = z.infer<typeof CreatePositionSchema>;
export type UpdatePositionFormInput = z.infer<typeof UpdatePositionSchema>;
export type CloudFunctionCreatePosition = z.infer<typeof CloudFunctionCreatePositionSchema>;
export type CloudFunctionUpdatePosition = z.infer<typeof CloudFunctionUpdatePositionSchema>;
export type CloudFunctionDeletePosition = z.infer<typeof CloudFunctionDeletePositionSchema>;

// Validation helpers
export function validatePosition(data: unknown) {
  return PositionSchema.parse(data);
}

export function safeValidatePosition(data: unknown) {
  const result = PositionSchema.safeParse(data);
  return result.success ? result.data : null;
}
