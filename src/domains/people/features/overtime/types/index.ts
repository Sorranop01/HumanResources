/**
 * Overtime Types
 * Complete type definitions for overtime management
 */

import type { Timestamp } from 'firebase/firestore';
import type { BaseEntity } from '@/shared/types';

// ============================================
// Enum Types
// ============================================

/**
 * OT Request Status
 */
export type OvertimeRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

/**
 * OT Clock Status
 */
export type OvertimeClockStatus = 'not-started' | 'clocked-in' | 'clocked-out' | 'completed';

/**
 * OT Type
 */
export type OvertimeType = 'weekday' | 'weekend' | 'holiday' | 'emergency';

// ============================================
// OT Request Entity
// ============================================

/**
 * Overtime Request - Request for overtime work approval
 */
export interface OvertimeRequest extends BaseEntity {
  // Employee Info
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;

  // OT Details
  overtimeDate: Date;
  overtimeType: OvertimeType;
  plannedStartTime: string; // "18:00"
  plannedEndTime: string; // "22:00"
  plannedHours: number; // Calculated duration

  // Request Info
  reason: string;
  taskDescription: string;
  urgencyLevel: 'normal' | 'urgent' | 'critical';

  // Status
  status: OvertimeRequestStatus;

  // Approval Info
  approverId?: string;
  approverName?: string;
  approvalDate?: Date;
  approvalComments?: string;
  rejectionReason?: string;

  // Clock Records (filled after actual OT)
  actualClockInTime?: Timestamp;
  actualClockOutTime?: Timestamp;
  actualHours?: number;
  clockStatus: OvertimeClockStatus;

  // Compensation
  overtimeRate: number; // 1.5x, 2x, 3x
  calculatedPay?: number; // Auto-calculated based on salary & rate

  // Metadata
  isEmergency: boolean;
  attachmentUrl?: string;
  notes?: string;
}

// ============================================
// OT History/Record
// ============================================

/**
 * Overtime History - Completed OT records
 */
export interface OvertimeHistory extends BaseEntity {
  employeeId: string;
  employeeName: string;
  overtimeRequestId: string;

  overtimeDate: Date;
  overtimeType: OvertimeType;

  clockInTime: Timestamp;
  clockOutTime: Timestamp;
  totalHours: number;

  overtimeRate: number;
  calculatedPay: number;

  approvedBy: string;
  approverName: string;

  status: 'completed' | 'paid';
  paidDate?: Date;
  payrollPeriod?: string; // "2025-01"
}

// ============================================
// Approval Action Types
// ============================================

/**
 * OT Approval Action
 */
export interface OvertimeApprovalAction {
  comments?: string;
}

/**
 * OT Rejection Action
 */
export interface OvertimeRejectionAction {
  reason: string;
}

// ============================================
// Statistics & Summary
// ============================================

/**
 * Employee OT Summary
 */
export interface EmployeeOvertimeSummary {
  employeeId: string;
  period: string; // "2025-01"
  totalOTHours: number;
  totalOTRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalCalculatedPay: number;
  byType: {
    weekday: number;
    weekend: number;
    holiday: number;
    emergency: number;
  };
}

// ============================================
// Input Types
// ============================================

/**
 * Input payload for creating OT request
 */
export type CreateOvertimeRequestInput = Omit<OvertimeRequest, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Input payload for updating OT request (pending only)
 */
export type UpdateOvertimeRequestInput = Partial<
  Pick<
    OvertimeRequest,
    | 'overtimeDate'
    | 'overtimeType'
    | 'plannedStartTime'
    | 'plannedEndTime'
    | 'plannedHours'
    | 'reason'
    | 'taskDescription'
    | 'urgencyLevel'
    | 'isEmergency'
    | 'attachmentUrl'
    | 'notes'
    | 'overtimeRate'
  >
>;
