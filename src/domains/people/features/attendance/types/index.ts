import type { Timestamp } from 'firebase/firestore';

/**
 * Represents the status of an attendance record.
 */
export type AttendanceStatus = 'clocked-in' | 'clocked-out';

/**
 * Represents a single attendance record for a user on a specific day.
 */
export interface AttendanceRecord {
  id: string; // Firestore document ID
  userId: string; // ID of the user
  clockInTime: Timestamp;
  clockOutTime: Timestamp | null;
  status: AttendanceStatus;
  date: string; // YYYY-MM-DD format for querying
  durationHours: number | null; // Duration in hours
}
