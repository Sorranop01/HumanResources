import { z } from 'zod';
import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';

/**
 * Complete Department Firestore schema
 * Single Source of Truth for Department data structure
 */
export const DepartmentSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(2).max(10),
  name: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(100),
  description: z.string(),
  parentDepartment: z.string().optional(),
  managerId: z.string().optional(),
  managerName: z.string().optional(),
  headCount: z.number().int().min(0),
  isActive: z.boolean(),
  tenantId: z.string().min(1),
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Create department schema
 */
export const CreateDepartmentSchema = z.object({
  code: z
    .string()
    .min(2, 'รหัสแผนกต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(10, 'รหัสแผนกต้องไม่เกิน 10 ตัวอักษร')
    .regex(/^[A-Z0-9-]+$/, 'รหัสแผนกต้องเป็นตัวพิมพ์ใหญ่และตัวเลขเท่านั้น')
    .toUpperCase(),
  name: z.string().min(2, 'ชื่อแผนกต้องมีอย่างน้อย 2 ตัวอักษร').max(100, 'ชื่อแผนกต้องไม่เกิน 100 ตัวอักษร'),
  nameEn: z
    .string()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name must not exceed 100 characters'),

  // Hierarchy
  parentDepartmentId: z.string().optional(),
  level: z.number().int().min(1, 'ระดับแผนกต้องเป็นตัวเลขมากกว่า 0'),
  path: z.string().min(1, 'Path จำเป็นต้องระบุ'),

  // Management
  managerId: z.string().optional(),
  managerName: z.string().optional(),

  // Financial
  costCenter: z
    .string()
    .regex(/^[A-Z0-9-]+$/, 'รหัสศูนย์ต้นทุนต้องเป็นตัวพิมพ์ใหญ่และตัวเลข')
    .optional()
    .or(z.literal('')),
  budgetAmount: z.number().min(0, 'งบประมาณต้องไม่ติดลบ').optional().or(z.nan()),

  // Settings
  isActive: z.boolean().default(true),
  description: z.string().max(500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร').optional(),

  // Metadata
  tenantId: z.string().min(1, 'Tenant ID จำเป็นต้องระบุ'),
});

/**
 * Update department schema (all fields optional except constraints)
 */
export const UpdateDepartmentSchema = CreateDepartmentSchema.partial().omit({
  tenantId: true,
});

/**
 * Cloud Function: Create Department Schema
 */
export const CloudFunctionCreateDepartmentSchema = z.object({
  departmentData: CreateDepartmentSchema,
});

/**
 * Cloud Function: Update Department Schema
 */
export const CloudFunctionUpdateDepartmentSchema = z.object({
  departmentId: z.string().min(1, 'ต้องระบุ Department ID'),
  departmentData: UpdateDepartmentSchema,
});

/**
 * Cloud Function: Delete Department Schema
 */
export const CloudFunctionDeleteDepartmentSchema = z.object({
  departmentId: z.string().min(1, 'ต้องระบุ Department ID'),
  transferEmployeesToDepartmentId: z.string().optional(), // ถ้ามีพนักงานในแผนก ย้ายไปแผนกไหน
});

/**
 * Inferred types
 */
export type Department = z.infer<typeof DepartmentSchema>;
export type CreateDepartmentFormInput = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentFormInput = z.infer<typeof UpdateDepartmentSchema>;
export type CloudFunctionCreateDepartment = z.infer<typeof CloudFunctionCreateDepartmentSchema>;
export type CloudFunctionUpdateDepartment = z.infer<typeof CloudFunctionUpdateDepartmentSchema>;
export type CloudFunctionDeleteDepartment = z.infer<typeof CloudFunctionDeleteDepartmentSchema>;

// Validation helpers
export function validateDepartment(data: unknown) {
  return DepartmentSchema.parse(data);
}

export function safeValidateDepartment(data: unknown) {
  const result = DepartmentSchema.safeParse(data);
  return result.success ? result.data : null;
}
