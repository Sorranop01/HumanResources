/**
 * Attendance Schemas
 * Zod validation schemas for attendance feature
 * ✅ Supports both Client SDK and Admin SDK Timestamps
 */

import { z } from 'zod';
import { FirestoreTimestampSchema } from '@/shared/schemas/common.schema';

/**
 * Attendance Status Schema
 */
export const AttendanceStatusSchema = z.enum(['clocked-in', 'clocked-out']);

/**
 * Clock-in Method Schema
 */
export const ClockInMethodSchema = z.enum(['mobile', 'web', 'biometric', 'manual']);

/**
 * Location Data Schema
 */
export const LocationDataSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
  timestamp: FirestoreTimestampSchema,
  isWithinGeofence: z.boolean().optional(),
  distanceFromOffice: z.number().min(0).optional(),
  address: z.string().optional(),
});

/**
 * Break Record Schema
 */
export const BreakRecordSchema = z.object({
  id: z.string(),
  breakType: z.enum(['lunch', 'rest', 'prayer', 'other']),
  startTime: FirestoreTimestampSchema,
  endTime: FirestoreTimestampSchema.nullable(),
  duration: z.number().min(0).nullable(),
  scheduledDuration: z.number().min(0),
  isPaid: z.boolean(),
});

/**
 * Attendance Penalty Schema
 */
export const AttendancePenaltySchema = z.object({
  policyId: z.string(),
  type: z.enum(['late', 'early-leave', 'absence', 'no-clock-out']),
  amount: z.number().min(0),
  description: z.string(),
});

/**
 * Complete Attendance Record Schema (Firestore document)
 * ✅ Single Source of Truth for Attendance data
 */
export const AttendanceRecordSchema = z.object({
  // Base fields
  id: z.string().min(1),
  userId: z.string().min(1),

  // Employee (denormalized)
  employeeId: z.string().optional(),
  employeeName: z.string().min(1),
  departmentName: z.string().min(1),

  // Clock in/out
  clockInTime: FirestoreTimestampSchema,
  clockOutTime: FirestoreTimestampSchema.nullable(),
  status: AttendanceStatusSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  durationHours: z.number().min(0).max(24).nullable(),

  // Schedule reference
  workSchedulePolicyId: z.string().optional(),
  shiftAssignmentId: z.string().optional(),
  scheduledStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  scheduledEndTime: z.string().regex(/^\d{2}:\d{2}$/),

  // Late tracking
  isLate: z.boolean(),
  minutesLate: z.number().min(0),
  lateReason: z.string().optional(),
  isExcusedLate: z.boolean(),
  lateApprovedBy: z.string().optional(),

  // Early leave tracking
  isEarlyLeave: z.boolean(),
  minutesEarly: z.number().min(0),
  earlyLeaveReason: z.string().optional(),
  isApprovedEarlyLeave: z.boolean(),
  earlyLeaveApprovedBy: z.string().optional(),

  // Break tracking
  breaks: z.array(BreakRecordSchema),
  totalBreakMinutes: z.number().min(0),
  unpaidBreakMinutes: z.number().min(0),

  // Location tracking
  clockInLocation: LocationDataSchema.optional(),
  clockOutLocation: LocationDataSchema.optional(),
  isRemoteWork: z.boolean(),

  // Clock-in method
  clockInMethod: ClockInMethodSchema,
  clockOutMethod: ClockInMethodSchema.optional(),
  ipAddress: z.string().optional(),
  deviceId: z.string().optional(),

  // Validation & approval
  requiresApproval: z.boolean(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  approvedBy: z.string().optional(),
  approvalDate: FirestoreTimestampSchema.optional(),
  approvalNotes: z.string().optional(),

  // Penalties
  penaltiesApplied: z.array(AttendancePenaltySchema),

  // Shift premium
  shiftPremiumRate: z.number().min(0).optional(),
  shiftBonus: z.number().min(0).optional(),

  // Flags
  isMissedClockOut: z.boolean(),
  isManualEntry: z.boolean(),
  isCorrected: z.boolean(),

  // Notes
  notes: z.string().optional(),

  // Metadata
  tenantId: z.string().min(1),
  createdAt: FirestoreTimestampSchema,
  updatedAt: FirestoreTimestampSchema,
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

/**
 * Clock In Input Schema
 */
export const ClockInInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  employeeId: z.string().optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().min(0).optional(),
    })
    .optional(),
  clockInMethod: ClockInMethodSchema.default('web'),
  ipAddress: z.string().optional(),
  deviceId: z.string().optional(),
  isRemoteWork: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export type ClockInInput = z.infer<typeof ClockInInputSchema>;

/**
 * Clock Out Input Schema
 */
export const ClockOutInputSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().min(0).optional(),
    })
    .optional(),
  clockOutMethod: ClockInMethodSchema.optional(),
  notes: z.string().max(500).optional(),
});

export type ClockOutInput = z.infer<typeof ClockOutInputSchema>;

/**
 * Attendance Query Filters Schema
 */
export const AttendanceFiltersSchema = z.object({
  userId: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: AttendanceStatusSchema.optional(),
});

export type AttendanceFilters = z.infer<typeof AttendanceFiltersSchema>;

/**
 * Monthly Attendance Query Schema
 */
export const MonthlyAttendanceQuerySchema = z.object({
  userId: z.string().min(1),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});

export type MonthlyAttendanceQuery = z.infer<typeof MonthlyAttendanceQuerySchema>;

/**
 * Attendance Statistics Schema
 */
export const AttendanceStatsSchema = z.object({
  totalDays: z.number().min(0),
  presentDays: z.number().min(0),
  absentDays: z.number().min(0),
  lateDays: z.number().min(0),
  onLeaveDays: z.number().min(0),
  totalWorkHours: z.number().min(0),
  averageWorkHours: z.number().min(0),
  overtimeHours: z.number().min(0),
});

export type AttendanceStats = z.infer<typeof AttendanceStatsSchema>;

/**
 * Bulk Attendance Import Schema
 */
export const BulkAttendanceImportSchema = z.array(
  z.object({
    userId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    clockInTime: z.string().regex(/^\d{2}:\d{2}$/),
    clockOutTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
  })
);

export type BulkAttendanceImport = z.infer<typeof BulkAttendanceImportSchema>;

/**
 * Validation Helper Functions
 */
export function validateAttendanceRecord(data: unknown) {
  return AttendanceRecordSchema.parse(data);
}

export function safeValidateAttendanceRecord(data: unknown) {
  const result = AttendanceRecordSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Cloud Function: Clock In Schema
 */
export const CloudFunctionClockInSchema = z.object({
  userId: z.string().min(1, 'ต้องระบุ User ID'),
  employeeId: z.string().optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().min(0).optional(),
    })
    .optional(),
  clockInMethod: ClockInMethodSchema.default('web'),
  ipAddress: z.string().optional(),
  deviceId: z.string().optional(),
  isRemoteWork: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export type CloudFunctionClockIn = z.infer<typeof CloudFunctionClockInSchema>;

/**
 * Cloud Function: Clock Out Schema
 */
export const CloudFunctionClockOutSchema = z.object({
  recordId: z.string().min(1, 'ต้องระบุ Record ID'),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().min(0).optional(),
    })
    .optional(),
  clockOutMethod: ClockInMethodSchema.optional(),
  notes: z.string().max(500).optional(),
});

export type CloudFunctionClockOut = z.infer<typeof CloudFunctionClockOutSchema>;

/**
 * Cloud Function: Manual Entry Schema
 */
export const CloudFunctionManualAttendanceSchema = z.object({
  userId: z.string().min(1, 'ต้องระบุ User ID'),
  employeeId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD'),
  clockInTime: z.string().regex(/^\d{2}:\d{2}$/, 'รูปแบบเวลาต้องเป็น HH:mm'),
  clockOutTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'รูปแบบเวลาต้องเป็น HH:mm')
    .optional(),
  reason: z.string().min(10, 'เหตุผลต้องมีอย่างน้อย 10 ตัวอักษร').max(500),
  isRemoteWork: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export type CloudFunctionManualAttendance = z.infer<typeof CloudFunctionManualAttendanceSchema>;

/**
 * Cloud Function: Approve Attendance Schema
 */
export const CloudFunctionApproveAttendanceSchema = z.object({
  recordId: z.string().min(1, 'ต้องระบุ Record ID'),
  approverId: z.string().min(1, 'ต้องระบุ Approver ID'),
  notes: z.string().max(500).optional(),
});

export type CloudFunctionApproveAttendance = z.infer<typeof CloudFunctionApproveAttendanceSchema>;

// Re-export break schemas
export * from './breakSchema';
