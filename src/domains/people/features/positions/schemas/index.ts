import { z } from 'zod';

/**
 * Position Status Schema
 */
export const PositionStatusSchema = z.enum(['active', 'inactive']);

/**
 * Position Level Schema
 */
export const PositionLevelSchema = z.enum([
  'executive',
  'senior-management',
  'middle-management',
  'supervisor',
  'staff',
  'junior',
]);

/**
 * Job Description Schema
 */
export const JobDescriptionSchema = z.object({
  overview: z.string().min(1, 'กรุณากรอกภาพรวมของงาน'),
  responsibilities: z.array(z.string().min(1)).min(1, 'กรุณากรอกความรับผิดชอบอย่างน้อย 1 รายการ'),
  requirements: z.array(z.string().min(1)).min(1, 'กรุณากรอกคุณสมบัติที่ต้องการอย่างน้อย 1 รายการ'),
  qualifications: z.array(z.string().min(1)).min(1, 'กรุณากรอกวุฒิการศึกษา/ประสบการณ์อย่างน้อย 1 รายการ'),
  skills: z.array(z.string().min(1)).min(1, 'กรุณากรอกทักษะที่จำเป็นอย่างน้อย 1 รายการ'),
  competencies: z.array(z.string().min(1)).optional(),
});

/**
 * Salary Range Schema
 */
export const SalaryRangeSchema = z
  .object({
    min: z.number().min(0, 'เงินเดือนขั้นต่ำต้องมากกว่าหรือเท่ากับ 0'),
    max: z.number().min(0, 'เงินเดือนขั้นสูงต้องมากกว่าหรือเท่ากับ 0'),
    currency: z.string().default('THB'),
  })
  .refine((data) => data.max >= data.min, {
    message: 'เงินเดือนขั้นสูงต้องมากกว่าหรือเท่ากับเงินเดือนขั้นต่ำ',
    path: ['max'],
  });

/**
 * Position Schema
 */
export const PositionSchema = z.object({
  id: z.string(),
  positionCode: z.string().min(1, 'กรุณากรอกรหัสตำแหน่ง'),
  nameTH: z.string().min(1, 'กรุณากรอกชื่อตำแหน่งภาษาไทย'),
  nameEN: z.string().optional(),
  level: PositionLevelSchema,
  department: z.string().min(1, 'กรุณาเลือกแผนก/ฝ่าย'),
  parentPositionId: z.string().optional(),
  parentPositionName: z.string().optional(),
  jobDescription: JobDescriptionSchema,
  salaryRange: SalaryRangeSchema,
  headcount: z.number().int().min(1, 'จำนวนตำแหน่งต้องมากกว่าหรือเท่ากับ 1'),
  currentEmployees: z.number().int().min(0).default(0),
  vacancy: z.number().int().min(0).default(0),
  status: PositionStatusSchema.default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Create Position Schema (without auto-generated fields)
 */
export const CreatePositionSchema = PositionSchema.omit({
  id: true,
  currentEmployees: true,
  vacancy: true,
  createdAt: true,
  updatedAt: true,
  parentPositionName: true,
});

/**
 * Update Position Schema (partial with required id)
 */
export const UpdatePositionSchema = PositionSchema.omit({
  createdAt: true,
  updatedAt: true,
})
  .partial()
  .required({ id: true });

/**
 * Position Form Schema (for UI forms - simplified)
 */
export const PositionFormSchema = z.object({
  positionCode: z.string().min(1, 'กรุณากรอกรหัสตำแหน่ง'),
  nameTH: z.string().min(1, 'กรุณากรอกชื่อตำแหน่งภาษาไทย'),
  nameEN: z.string().optional(),
  level: PositionLevelSchema,
  department: z.string().min(1, 'กรุณาเลือกแผนก/ฝ่าย'),
  parentPositionId: z.string().optional(),
  jobDescription: JobDescriptionSchema,
  salaryRange: SalaryRangeSchema,
  headcount: z.number().int().min(1, 'จำนวนตำแหน่งต้องมากกว่าหรือเท่ากับ 1'),
  status: PositionStatusSchema.default('active'),
});

/**
 * Position Filters Schema
 */
export const PositionFiltersSchema = z.object({
  status: PositionStatusSchema.optional(),
  level: PositionLevelSchema.optional(),
  department: z.string().optional(),
  parentPositionId: z.string().optional(),
  hasVacancy: z.boolean().optional(),
});

// Type exports (derived from schemas)
export type Position = z.infer<typeof PositionSchema>;
export type CreatePositionInput = z.infer<typeof CreatePositionSchema>;
export type UpdatePositionInput = z.infer<typeof UpdatePositionSchema>;
export type PositionFormInput = z.infer<typeof PositionFormSchema>;
export type PositionFiltersType = z.infer<typeof PositionFiltersSchema>;
export type PositionStatus = z.infer<typeof PositionStatusSchema>;
export type PositionLevel = z.infer<typeof PositionLevelSchema>;
export type JobDescription = z.infer<typeof JobDescriptionSchema>;
export type SalaryRange = z.infer<typeof SalaryRangeSchema>;
