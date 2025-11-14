/**
 * Leave Request Types (SSOT)
 * Re-export type definitions from the Zod schemas to avoid divergence.
 */

import type {
  ApprovalStatus as SchemaApprovalStatus,
  ApprovalStep as SchemaApprovalStep,
  CloudFunctionApproveLeaveRequest,
  CloudFunctionRejectLeaveRequest,
  CreateLeaveRequest,
  HalfDayPeriod as SchemaHalfDayPeriod,
  LeaveRequest,
  LeaveRequestFilters,
  LeaveRequestStatus as SchemaLeaveRequestStatus,
  UpdateLeaveRequest,
} from '../schemas/leaveRequestSchema';

export type LeaveRequestStatus = SchemaLeaveRequestStatus;
export type ApprovalStatus = SchemaApprovalStatus;
export type HalfDayPeriod = SchemaHalfDayPeriod;
export type ApprovalStep = SchemaApprovalStep;
export type { LeaveRequest, LeaveRequestFilters };

export type CreateLeaveRequestInput = CreateLeaveRequest;
export type UpdateLeaveRequestInput = UpdateLeaveRequest;

export type ApproveLeaveRequestInput = Omit<CloudFunctionApproveLeaveRequest, 'requestId'>;
export type RejectLeaveRequestInput = Omit<CloudFunctionRejectLeaveRequest, 'requestId'>;
