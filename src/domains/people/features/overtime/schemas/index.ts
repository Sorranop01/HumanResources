/**
 * Overtime Validation Schemas
 * Zod schemas for overtime data validation
 * ✅ Complete Firestore schema with denormalization pattern
 */

import { z } from 'zod';
import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';

// ============================================
// Enum Schemas
// ============================================

export const OvertimeRequestStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'completed',
]);

export const OvertimeClockStatusSchema = z.enum([
  'not-started',
  'clocked-in',
  'clocked-out',
  'completed',
]);

export const OvertimeTypeSchema = z.enum(['weekday', 'weekend', 'holiday', 'emergency']);

export const UrgencyLevelSchema = z.enum(['normal', 'urgent', 'critical']);

// ============================================
// Complete Overtime Request Schema (Firestore)
// ============================================

/**
 * Complete Overtime Request Schema (Firestore document)
 * ✅ Single Source of Truth for Overtime Request data
 * Follows the same denormalization pattern as LeaveRequestSchema
 */
export const OvertimeRequestSchema = z.object({
  // Base fields
  id: z.string().min(1),
  requestNumber: z.string().min(1),

  // Employee (denormalized)
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  employeeCode: z.string().min(1),
  departmentId: z.string().min(1),
  departmentName: z.string().min(1),
  positionId: z.string().min(1),
  positionName: z.string().min(1),

  // OT Details
  overtimeDate: FirestoreTimestampSchema,
  overtimeType: OvertimeTypeSchema,

  // Planned times
  plannedStartTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:MM)'),
  plannedEndTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:MM)'),
  plannedHours: z.number().positive(),

  // Actual times (after clock in/out)
  actualStartTime: FirestoreTimestampSchema.nullish(),
  actualEndTime: FirestoreTimestampSchema.nullish(),
  actualHours: z.number().positive().nullish(),

  // Request details
  reason: z.string().min(10, 'เหตุผลต้องมีอย่างน้อย 10 ตัวอักษร').max(500, 'เหตุผลยาวเกินไป'),
  taskDescription: z
    .string()
    .min(10, 'คำอธิบายงานต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(1000, 'คำอธิบายยาวเกินไป'),
  urgencyLevel: UrgencyLevelSchema,
  isEmergency: z.boolean(),

  // Status
  status: OvertimeRequestStatusSchema,
  clockStatus: OvertimeClockStatusSchema,
  submittedAt: FirestoreTimestampSchema.optional(),

  // Approval workflow
  approvedBy: z.string().nullish(),
  approvedAt: FirestoreTimestampSchema.nullish(),
  approvalComments: z.string().max(500, 'ความคิดเห็นยาวเกินไป').nullish(),

  // Rejection
  rejectedBy: z.string().nullish(),
  rejectedAt: FirestoreTimestampSchema.nullish(),
  rejectionReason: z
    .string()
    .min(10, 'เหตุผลต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(500, 'เหตุผลยาวเกินไป')
    .nullish(),

  // Cancellation
  cancelledBy: z.string().nullish(),
  cancelledAt: FirestoreTimestampSchema.nullish(),
  cancellationReason: z
    .string()
    .min(10, 'เหตุผลต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(500, 'เหตุผลยาวเกินไป')
    .nullish(),

  // Rate & Payment calculation
  overtimeRate: z.number().positive(), // e.g., 1.5, 2.0, 3.0
  baseSalaryForOT: z.number().positive().optional(), // For calculation
  overtimePay: z.number().min(0).nullish(), // Calculated after completion

  // Attachments
  attachmentUrl: z.string().url('URL ไม่ถูกต้อง').nullish(),
  attachmentFileName: z.string().nullish(),

  // Additional notes
  notes: z.string().max(500, 'หมายเหตุยาวเกินไป').nullish(),

  // Metadata
  tenantId: z.string().min(1),
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Type exports
 */
export type OvertimeRequest = z.infer<typeof OvertimeRequestSchema>;
export type OvertimeRequestStatus = z.infer<typeof OvertimeRequestStatusSchema>;
export type OvertimeClockStatus = z.infer<typeof OvertimeClockStatusSchema>;
export type OvertimeType = z.infer<typeof OvertimeTypeSchema>;
export type UrgencyLevel = z.infer<typeof UrgencyLevelSchema>;

/**
 * Validation helpers
 */
export function validateOvertimeRequest(data: unknown): OvertimeRequest {
  return OvertimeRequestSchema.parse(data);
}

export function safeValidateOvertimeRequest(data: unknown): OvertimeRequest | null {
  const result = OvertimeRequestSchema.safeParse(data);
  return result.success ? result.data : null;
}

// ============================================
// OT Request Form Schema
// ============================================

/**
 * Overtime Request Form Schema
 */
export const OvertimeRequestFormSchema = z
  .object({
    overtimeDate: z.string().min(1, 'กรุณาเลือกวันที่ทำ OT'),

    overtimeType: OvertimeTypeSchema,

    plannedStartTime: z
      .string()
      .regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:MM)'),

    plannedEndTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:MM)'),

    reason: z.string().min(10, 'กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร').max(500, 'เหตุผลยาวเกินไป'),

    taskDescription: z
      .string()
      .min(10, 'กรุณาอธิบายงานอย่างน้อย 10 ตัวอักษร')
      .max(1000, 'คำอธิบายยาวเกินไป'),

    urgencyLevel: UrgencyLevelSchema.default('normal'),

    isEmergency: z.boolean().default(false),

    attachmentUrl: z.string().url('URL ไม่ถูกต้อง').nullable().optional(),

    notes: z.string().max(500, 'หมายเหตุยาวเกินไป').nullable().optional(),
  })
  .refine(
    (data) => {
      // Validate end time is after start time
      const start = data.plannedStartTime.split(':').map(Number);
      const end = data.plannedEndTime.split(':').map(Number);
      const [startHour = 0, startMinute = 0] = start;
      const [endHour = 0, endMinute = 0] = end;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      return endMinutes > startMinutes;
    },
    {
      message: 'เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด',
      path: ['plannedEndTime'],
    }
  );

export type OvertimeRequestFormInput = z.infer<typeof OvertimeRequestFormSchema>;

// ============================================
// OT Clock In Schema
// ============================================

export const OvertimeClockInSchema = z.object({
  overtimeRequestId: z.string().min(1, 'ไม่พบ ID คำขอ OT'),
});

export type OvertimeClockInInput = z.infer<typeof OvertimeClockInSchema>;

// ============================================
// OT Clock Out Schema
// ============================================

export const OvertimeClockOutSchema = z.object({
  overtimeRequestId: z.string().min(1, 'ไม่พบ ID คำขอ OT'),
  notes: z.string().max(500, 'หมายเหตุยาวเกินไป').nullable().optional(),
});

export type OvertimeClockOutInput = z.infer<typeof OvertimeClockOutSchema>;

// ============================================
// Approval & Rejection Schemas
// ============================================

/**
 * Approval Action Schema
 */
export const OvertimeApprovalActionSchema = z.object({
  comments: z.string().max(500, 'ความคิดเห็นยาวเกินไป').nullable().optional(),
});

export type OvertimeApprovalActionInput = z.infer<typeof OvertimeApprovalActionSchema>;

/**
 * Rejection Action Schema
 */
export const OvertimeRejectionActionSchema = z.object({
  reason: z.string().min(10, 'กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร').max(500, 'เหตุผลยาวเกินไป'),
});

export type OvertimeRejectionActionInput = z.infer<typeof OvertimeRejectionActionSchema>;

// ============================================
// Query Filters
// ============================================

export const OvertimeFiltersSchema = z.object({
  status: OvertimeRequestStatusSchema.nullable().optional(),
  overtimeType: OvertimeTypeSchema.nullable().optional(),
  employeeId: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
});

export type OvertimeFilters = z.infer<typeof OvertimeFiltersSchema>;

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate planned hours from time strings
 */
export function calculatePlannedHours(startTime: string, endTime: string): number {
  const [startHour = 0, startMin = 0] = startTime.split(':').map(Number);
  const [endHour = 0, endMin = 0] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return (endMinutes - startMinutes) / 60;
}

/**
 * Convert form data to OT request input
 */
export function formDataToOvertimeRequestInput(
  formData: OvertimeRequestFormInput,
  employeeId: string,
  employeeName: string,
  employeeCode: string,
  departmentId: string,
  departmentName: string,
  positionId: string,
  positionName: string,
  overtimeRate: number
): CreateOvertimeRequestInput {
  const plannedHours = calculatePlannedHours(
    formData.plannedStartTime,
    formData.plannedEndTime,
  );

  return {
    employeeId,
    employeeName,
    employeeCode,
    departmentId,
    departmentName,
    positionId,
    positionName,
    overtimeDate: new Date(formData.overtimeDate),
    overtimeType: formData.overtimeType,
    plannedStartTime: formData.plannedStartTime,
    plannedEndTime: formData.plannedEndTime,
    plannedHours,
    reason: formData.reason,
    taskDescription: formData.taskDescription,
    urgencyLevel: formData.urgencyLevel,
    isEmergency: formData.isEmergency,
    overtimeRate,
    clockStatus: 'not-started',
    status: 'pending',
    attachmentUrl: formData.attachmentUrl ?? undefined,
    notes: formData.notes ?? undefined,
  };
}

/**
 * Input type for creating a new Overtime Request.
 * Omits fields that are auto-generated or have default values.
 */
export type CreateOvertimeRequestInput = Omit<
  OvertimeRequest,
  | 'id'
  | 'requestNumber'
  | 'submittedAt'
  | 'approvedBy'
  | 'approvedAt'
  | 'approvalComments'
  | 'rejectedBy'
  | 'rejectedAt'
  | 'rejectionReason'
  | 'cancelledBy'
  | 'cancelledAt'
  | 'cancellationReason'
  | 'actualStartTime'
  | 'actualEndTime'
  | 'actualHours'
  | 'overtimePay'
  | 'baseSalaryForOT'
  | 'tenantId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
>;
