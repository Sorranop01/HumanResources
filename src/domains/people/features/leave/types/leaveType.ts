/**
 * Leave Type Types (SSOT)
 * Re-export inferred types from the Zod schemas.
 */

import type {
  CreateLeaveTypeInput as SchemaCreateLeaveTypeInput,
  LeaveAccrualType as SchemaLeaveAccrualType,
  LeaveType as SchemaLeaveType,
} from '../schemas/leaveTypeSchema';

export type LeaveType = SchemaLeaveType;
export type LeaveAccrualType = SchemaLeaveAccrualType;
export type CreateLeaveTypeInput = SchemaCreateLeaveTypeInput;
