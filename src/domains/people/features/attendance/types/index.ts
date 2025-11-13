import type { Timestamp } from 'firebase/firestore';

/**
 * Represents the status of an attendance record.
 */
export type AttendanceStatus = 'clocked-in' | 'clocked-out';

/**
 * Clock-in method types
 */
export type ClockInMethod = 'mobile' | 'web' | 'biometric' | 'manual';

/**
 * Location data for clock-in/out
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number | undefined;
  timestamp: Timestamp;
  isWithinGeofence?: boolean | undefined;
  distanceFromOffice?: number | undefined;
  address?: string | undefined;
}

/**
 * Break record
 */
export interface BreakRecord {
  id: string;
  breakType: 'lunch' | 'rest' | 'prayer' | 'other';
  startTime: Timestamp;
  endTime: Timestamp | null;
  duration: number | null; // minutes
  scheduledDuration: number; // minutes
  isPaid: boolean;
}

/**
 * Penalty applied to attendance
 */
export interface AttendancePenalty {
  policyId: string;
  type: 'late' | 'early-leave' | 'absence' | 'no-clock-out';
  amount: number;
  description: string;
}

/**
 * Represents a single attendance record for a user on a specific day.
 */
export interface AttendanceRecord {
  id: string; // Firestore document ID
  userId: string; // ID of the user
  employeeId?: string; // Reference to employee document
  employeeName: string; // Denormalized: from Employee.displayName (for list rendering)
  departmentName: string; // Denormalized: from Employee.departmentName (for filtering/grouping)
  clockInTime: Timestamp;
  clockOutTime: Timestamp | null;
  status: AttendanceStatus;
  date: string; // YYYY-MM-DD format for querying
  durationHours: number | null; // Duration in hours

  // Schedule reference
  workSchedulePolicyId?: string;
  shiftAssignmentId?: string;
  scheduledStartTime: string; // HH:mm format
  scheduledEndTime: string; // HH:mm format

  // Late tracking
  isLate: boolean;
  minutesLate: number;
  lateReason?: string;
  isExcusedLate: boolean;
  lateApprovedBy?: string;

  // Early leave tracking
  isEarlyLeave: boolean;
  minutesEarly: number;
  earlyLeaveReason?: string;
  isApprovedEarlyLeave: boolean;
  earlyLeaveApprovedBy?: string;

  // Break tracking
  breaks: BreakRecord[];
  totalBreakMinutes: number;
  unpaidBreakMinutes: number;

  // Location tracking
  clockInLocation?: LocationData;
  clockOutLocation?: LocationData;
  isRemoteWork: boolean;

  // Clock-in method
  clockInMethod: ClockInMethod;
  clockOutMethod?: ClockInMethod;
  ipAddress?: string;
  deviceId?: string;

  // Validation & approval
  requiresApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: Timestamp;
  approvalNotes?: string;

  // Penalties
  penaltiesApplied: AttendancePenalty[];

  // Shift premium
  shiftPremiumRate?: number;
  shiftBonus?: number;

  // Flags
  isMissedClockOut: boolean;
  isManualEntry: boolean;
  isCorrected: boolean;

  // Notes
  notes?: string;
}
