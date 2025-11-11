/**
 * Attendance Schemas
 * Zod validation schemas for attendance feature
 */

import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

/**
 * Attendance Status Schema
 */
export const AttendanceStatusSchema = z.enum(['clocked-in', 'clocked-out']);

/**
 * Attendance Record Schema (for validation)
 */
export const AttendanceRecordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  clockInTime: z.instanceof(Timestamp),
  clockOutTime: z.instanceof(Timestamp).nullable(),
  status: AttendanceStatusSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  durationHours: z.number().min(0).max(24).nullable(),
});

/**
 * Clock In Input Schema
 */
export const ClockInInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  employeeId: z.string().optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  notes: z.string().max(500).optional(),
});

export type ClockInInput = z.infer<typeof ClockInInputSchema>;

/**
 * Clock Out Input Schema
 */
export const ClockOutInputSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
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
