/**
 * Leave Request Schema
 * ✅ Complete Firestore schema with runtime validation
 * Single Source of Truth for Leave Request data
 */

import { z } from 'zod';
import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';

/**
 * Leave Request Status Schema
 */
export const LeaveRequestStatusSchema = z.enum([
  'draft',
  'pending',
  'approved',
  'rejected',
  'cancelled',
]);

/**
 * Approval Status Schema
 */
export const ApprovalStatusSchema = z.enum(['pending', 'approved', 'rejected']);

/**
 * Half Day Period Schema
 */
export const HalfDayPeriodSchema = z.enum(['morning', 'afternoon']);

/**
 * Approval Step Schema
 */
export const ApprovalStepSchema = z.object({
  level: z.number().int().min(1),
  approverId: z.string().min(1),
  approverName: z.string().min(1),
  approverRole: z.string().min(1),
  status: ApprovalStatusSchema,
  actionAt: FirestoreTimestampSchema.nullish(),
  comments: z.string().max(500).optional(),
});

/**
 * Complete Leave Request Schema (Firestore document)
 */
export const LeaveRequestSchema = z.object({
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

  // Leave Type (denormalized)
  leaveTypeId: z.string().min(1),
  leaveTypeCode: z.string().min(1),
  leaveTypeName: z.string().min(1),

  // Period
  startDate: FirestoreTimestampSchema,
  endDate: FirestoreTimestampSchema,
  totalDays: z.number().min(0.5),
  isHalfDay: z.boolean(),
  halfDayPeriod: HalfDayPeriodSchema.nullish(),

  // Details
  reason: z.string().min(10).max(500),
  contactDuringLeave: z.string().max(100).nullish(),
  workHandoverTo: z.string().nullish(),
  workHandoverNotes: z.string().max(500).nullish(),

  // Certificate
  hasCertificate: z.boolean(),
  certificateUrl: z.string().url().nullish(),
  certificateFileName: z.string().nullish(),

  // Workflow
  status: LeaveRequestStatusSchema,
  submittedAt: FirestoreTimestampSchema.optional(),
  approvalChain: z.array(ApprovalStepSchema),
  currentApprovalLevel: z.number().int().min(0),

  // Rejection/Cancellation
  rejectedBy: z.string().nullish(),
  rejectedAt: FirestoreTimestampSchema.nullish(),
  rejectionReason: z.string().min(10).max(500).nullish(),
  cancelledBy: z.string().nullish(),
  cancelledAt: FirestoreTimestampSchema.nullish(),
  cancellationReason: z.string().min(10).max(500).nullish(),

  // Metadata
  tenantId: z.string().min(1),
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Create Leave Request Schema (for Cloud Functions input)
 */
export const CreateLeaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'ต้องระบุ Employee ID'),
  leaveTypeId: z.string().min(1, 'ต้องระบุประเภทการลา'),
  startDate: z.date(),
  endDate: z.date(),
  isHalfDay: z.boolean().optional().default(false),
  halfDayPeriod: HalfDayPeriodSchema.nullish(),
  reason: z.string().min(10, 'เหตุผลต้องมีอย่างน้อย 10 ตัวอักษร').max(500, 'เหตุผลยาวเกินไป'),
  contactDuringLeave: z.string().max(100).nullish(),
  workHandoverTo: z.string().nullish(),
  workHandoverNotes: z.string().max(500).nullish(),
  hasCertificate: z.boolean().optional().default(false),
  certificateUrl: z.string().url('URL ไม่ถูกต้อง').nullish(),
  certificateFileName: z.string().nullish(),
});

/**
 * Update Leave Request Schema (partial)
 */
export const UpdateLeaveRequestSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isHalfDay: z.boolean().optional(),
  halfDayPeriod: HalfDayPeriodSchema.nullish(),
  reason: z.string().min(10).max(500).optional(),
  contactDuringLeave: z.string().max(100).nullish(),
  workHandoverTo: z.string().nullish(),
  workHandoverNotes: z.string().max(500).nullish(),
  hasCertificate: z.boolean().optional(),
  certificateUrl: z.string().url().nullish(),
  certificateFileName: z.string().nullish(),
});

/**
 * Cloud Function: Create Leave Request Input Schema
 */
export const CloudFunctionCreateLeaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'ต้องระบุ Employee ID'),
  leaveRequestData: CreateLeaveRequestSchema.omit({ employeeId: true }),
});

/**
 * Cloud Function: Approve Leave Request Input Schema
 */
export const CloudFunctionApproveLeaveRequestSchema = z.object({
  requestId: z.string().min(1, 'ต้องระบุ Request ID'),
  approverId: z.string().min(1, 'ต้องระบุ Approver ID'),
  comments: z.string().max(500, 'ความคิดเห็นยาวเกินไป').optional(),
});

/**
 * Cloud Function: Reject Leave Request Input Schema
 */
export const CloudFunctionRejectLeaveRequestSchema = z.object({
  requestId: z.string().min(1, 'ต้องระบุ Request ID'),
  approverId: z.string().min(1, 'ต้องระบุ Approver ID'),
  reason: z.string().min(10, 'เหตุผลต้องมีอย่างน้อย 10 ตัวอักษร').max(500, 'เหตุผลยาวเกินไป'),
});

/**
 * Leave Request Filters Schema
 */
export const LeaveRequestFiltersSchema = z.object({
  status: LeaveRequestStatusSchema.optional(),
  leaveTypeId: z.string().optional(),
  employeeId: z.string().optional(),
  startDate: z.union([z.date(), z.string().datetime()]).optional(),
  endDate: z.union([z.date(), z.string().datetime()]).optional(),
});

// ============================================
// Type Exports (inferred from Zod)
// ============================================

export type LeaveRequestStatus = z.infer<typeof LeaveRequestStatusSchema>;
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
export type HalfDayPeriod = z.infer<typeof HalfDayPeriodSchema>;
export type ApprovalStep = z.infer<typeof ApprovalStepSchema>;
export type LeaveRequest = z.infer<typeof LeaveRequestSchema>;
export type CreateLeaveRequest = z.infer<typeof CreateLeaveRequestSchema>;
export type UpdateLeaveRequest = z.infer<typeof UpdateLeaveRequestSchema>;
export type CloudFunctionCreateLeaveRequest = z.infer<typeof CloudFunctionCreateLeaveRequestSchema>;
export type CloudFunctionApproveLeaveRequest = z.infer<
  typeof CloudFunctionApproveLeaveRequestSchema
>;
export type CloudFunctionRejectLeaveRequest = z.infer<typeof CloudFunctionRejectLeaveRequestSchema>;
export type LeaveRequestFilters = z.infer<typeof LeaveRequestFiltersSchema>;

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validate leave request data
 */
export function validateLeaveRequest(data: unknown): LeaveRequest {
  return LeaveRequestSchema.parse(data);
}

/**
 * Safe validation (returns null on error)
 */
export function safeValidateLeaveRequest(data: unknown): LeaveRequest | null {
  const result = LeaveRequestSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate create leave request input
 */
export function validateCreateLeaveRequest(data: unknown): CreateLeaveRequest {
  return CreateLeaveRequestSchema.parse(data);
}

/**
 * Validate update leave request input
 */
export function validateUpdateLeaveRequest(data: unknown): UpdateLeaveRequest {
  return UpdateLeaveRequestSchema.parse(data);
}
