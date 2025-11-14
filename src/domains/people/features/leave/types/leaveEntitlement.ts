/**
 * Leave Entitlement Types (SSOT)
 * Re-export inferred types from the Zod schemas.
 */

import type {
  CreateLeaveEntitlementInput as SchemaCreateLeaveEntitlementInput,
  LeaveEntitlement as SchemaLeaveEntitlement,
  UpdateLeaveBalanceInput as SchemaUpdateLeaveBalanceInput,
} from '../schemas/leaveEntitlementSchema';

export type LeaveEntitlement = SchemaLeaveEntitlement;
export type CreateLeaveEntitlementInput = SchemaCreateLeaveEntitlementInput;
export type UpdateLeaveBalanceInput = SchemaUpdateLeaveBalanceInput;
