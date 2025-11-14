/**
 * Attendance Types
 * NOTE: Most types are now defined in schemas/index.ts (Single Source of Truth via Zod)
 * This file re-exports commonly used types for backward compatibility.
 */

// Re-export types from schemas
export type {
  AttendancePenalty,
  AttendanceRecord,
  AttendanceStatus,
  BreakRecord,
  ClockInMethod,
  LocationData,
} from '../schemas';
