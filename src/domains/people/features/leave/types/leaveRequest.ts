/**
 * Leave Request Types
 * Employee leave requests (คำขอลา)
 */

import type { BaseEntity } from '@/shared/types';

/**
 * Leave Request Status
 */
export type LeaveRequestStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

/**
 * Approval Status
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Half Day Period
 */
export type HalfDayPeriod = 'morning' | 'afternoon';

/**
 * Approval Step
 */
export interface ApprovalStep {
  level: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: ApprovalStatus;
  actionAt?: Date;
  comments?: string;
}

/**
 * Leave Request Entity
 */
export interface LeaveRequest extends BaseEntity {
  requestNumber: string;

  // Employee
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;

  // Leave
  leaveTypeId: string;
  leaveTypeCode: string;
  leaveTypeName: string;

  // Period
  startDate: Date;
  endDate: Date;
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod?: HalfDayPeriod;

  // Details
  reason: string;
  contactDuringLeave?: string;
  workHandoverTo?: string;
  workHandoverNotes?: string;

  // Certificate
  hasCertificate: boolean;
  certificateUrl?: string;
  certificateFileName?: string;

  // Workflow
  status: LeaveRequestStatus;
  submittedAt?: Date;
  approvalChain: ApprovalStep[];
  currentApprovalLevel: number;

  // Rejection/Cancellation
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;
  cancellationReason?: string;

  tenantId: string;
}

/**
 * Create Leave Request Input
 */
export interface CreateLeaveRequestInput {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  isHalfDay?: boolean | undefined;
  halfDayPeriod?: HalfDayPeriod | undefined;
  reason: string;
  contactDuringLeave?: string | undefined;
  workHandoverTo?: string | undefined;
  workHandoverNotes?: string | undefined;
  hasCertificate?: boolean | undefined;
  certificateUrl?: string | undefined;
  certificateFileName?: string | undefined;
}

/**
 * Update Leave Request Input
 */
export interface UpdateLeaveRequestInput {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  isHalfDay?: boolean | undefined;
  halfDayPeriod?: HalfDayPeriod | undefined;
  reason?: string | undefined;
  contactDuringLeave?: string | undefined;
  workHandoverTo?: string | undefined;
  workHandoverNotes?: string | undefined;
  hasCertificate?: boolean | undefined;
  certificateUrl?: string | undefined;
  certificateFileName?: string | undefined;
}

/**
 * Approve/Reject Leave Request Input
 */
export interface ApproveLeaveRequestInput {
  approverId: string;
  comments?: string | undefined;
}

export interface RejectLeaveRequestInput {
  approverId: string;
  reason: string;
}

/**
 * Leave Request Filters
 */
export interface LeaveRequestFilters {
  status?: LeaveRequestStatus | undefined;
  leaveTypeId?: string | undefined;
  employeeId?: string | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}
