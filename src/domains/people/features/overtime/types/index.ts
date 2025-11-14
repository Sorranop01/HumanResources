/**
 * Overtime Types
 * Complete type definitions for overtime management
 *
 * NOTE: Main types (OvertimeRequest, OvertimeRequestStatus, etc.) are now exported from schemas
 * This file contains additional UI/business logic types only
 */

import type { Timestamp } from 'firebase/firestore';
import type { BaseEntity } from '@/shared/types';

// Re-export main types from schemas (Single Source of Truth)
export type {
  OvertimeRequest,
  OvertimeRequestStatus,
  OvertimeClockStatus,
  OvertimeType,
  UrgencyLevel,
} from '../schemas';

// ============================================
// OT History/Record
// ============================================

/**
 * Overtime History - Completed OT records
 */
export interface OvertimeHistory extends BaseEntity {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
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

  tenantId: string;
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
// Input Types (UI-specific, not for Firestore)
// ============================================

/**
 * Input payload for creating OT request (UI form)
 * NOTE: For Firestore creation, use OvertimeRequestSchema from schemas
 */
export type CreateOvertimeRequestInput = Omit<
  OvertimeRequest,
  'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'createdBy' | 'updatedBy'
>;

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
