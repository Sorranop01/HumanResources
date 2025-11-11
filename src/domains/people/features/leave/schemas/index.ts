/**
 * Leave Validation Schemas
 * Zod schemas for leave data validation
 */

import { z } from 'zod';

/**
 * Leave Request Form Schema
 */
export const LeaveRequestFormSchema = z.object({
  leaveTypeId: z.string().min(1, 'กรุณาเลือกประเภทการลา'),

  startDate: z.string().min(1, 'กรุณาเลือกวันที่เริ่มลา'),

  endDate: z.string().min(1, 'กรุณาเลือกวันที่สิ้นสุดการลา'),

  isHalfDay: z.boolean().optional().default(false),

  halfDayPeriod: z.enum(['morning', 'afternoon']).optional(),

  reason: z.string().min(10, 'กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร').max(500, 'เหตุผลยาวเกินไป'),

  contactDuringLeave: z.string().max(100, 'ข้อมูลติดต่อยาวเกินไป').optional(),

  workHandoverTo: z.string().optional(),

  workHandoverNotes: z.string().max(500, 'หมายเหตุยาวเกินไป').optional(),

  hasCertificate: z.boolean().optional().default(false),

  certificateUrl: z.string().url('URL ไม่ถูกต้อง').optional(),

  certificateFileName: z.string().optional(),
});

export type LeaveRequestFormInput = z.infer<typeof LeaveRequestFormSchema>;

/**
 * Approval Action Schema
 */
export const ApprovalActionSchema = z.object({
  comments: z.string().max(500, 'ความคิดเห็นยาวเกินไป').optional(),
});

export type ApprovalActionInput = z.infer<typeof ApprovalActionSchema>;

/**
 * Rejection Action Schema
 */
export const RejectionActionSchema = z.object({
  reason: z.string().min(10, 'กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร').max(500, 'เหตุผลยาวเกินไป'),
});

export type RejectionActionInput = z.infer<typeof RejectionActionSchema>;

/**
 * Convert form data to create input
 */
export function formDataToLeaveRequestInput(
  formData: LeaveRequestFormInput,
  employeeId: string
): {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  isHalfDay?: boolean | undefined;
  halfDayPeriod?: 'morning' | 'afternoon' | undefined;
  reason: string;
  contactDuringLeave?: string | undefined;
  workHandoverTo?: string | undefined;
  workHandoverNotes?: string | undefined;
  hasCertificate?: boolean | undefined;
  certificateUrl?: string | undefined;
  certificateFileName?: string | undefined;
} {
  return {
    employeeId,
    leaveTypeId: formData.leaveTypeId,
    startDate: new Date(formData.startDate),
    endDate: new Date(formData.endDate),
    isHalfDay: formData.isHalfDay ?? undefined,
    halfDayPeriod: formData.halfDayPeriod ?? undefined,
    reason: formData.reason,
    contactDuringLeave: formData.contactDuringLeave ?? undefined,
    workHandoverTo: formData.workHandoverTo ?? undefined,
    workHandoverNotes: formData.workHandoverNotes ?? undefined,
    hasCertificate: formData.hasCertificate ?? undefined,
    certificateUrl: formData.certificateUrl ?? undefined,
    certificateFileName: formData.certificateFileName ?? undefined,
  };
}
