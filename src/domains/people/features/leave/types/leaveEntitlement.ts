/**
 * Leave Entitlement Types
 * Employee leave entitlements (สิทธิ์การลาของพนักงาน)
 */

import type { BaseEntity } from '@/shared/types';

/**
 * Leave Entitlement Entity
 */
export interface LeaveEntitlement extends BaseEntity {
  employeeId: string;
  employeeName: string;
  employeeCode: string;

  leaveTypeId: string;
  leaveTypeCode: string;
  leaveTypeName: string;

  // Entitlement Period
  year: number;
  effectiveFrom: Date;
  effectiveTo: Date;

  // Balance
  totalEntitlement: number;
  carriedOver: number;
  accrued: number;
  used: number;
  pending: number;
  remaining: number;

  // Calculation Details
  basedOnTenure: boolean;
  tenureYears: number;

  // Status
  isActive: boolean;

  // Metadata
  notes?: string;
  lastCalculatedAt: Date;
  tenantId: string;
}

/**
 * Create Leave Entitlement Input
 */
export interface CreateLeaveEntitlementInput {
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalEntitlement: number;
  carriedOver?: number;
  basedOnTenure?: boolean;
  tenureYears?: number;
  notes?: string;
}

/**
 * Update Leave Entitlement Balance Input
 */
export interface UpdateLeaveBalanceInput {
  used?: number;
  pending?: number;
  operation: 'add' | 'subtract';
}
