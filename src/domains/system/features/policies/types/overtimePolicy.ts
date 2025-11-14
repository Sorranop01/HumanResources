/**
 * Overtime Policy Types
 * Re-exports from schema for type consistency
 */

export type { OvertimePolicy } from '../schemas/overtimePolicySchema';

/**
 * Create Overtime Policy Input
 */
export interface CreateOvertimePolicyInput {
  name: string;
  nameEn: string;
  description: string;
  code: string;
  eligibleEmployeeTypes: string[];
  eligiblePositions: string[];
  eligibleDepartments: string[];
  rules: OvertimeRule[];
  requiresApproval: boolean;
  approvalThresholdHours?: number;
  autoApproveUnder?: number;
  holidayRate: number;
  weekendRate: number;
  nightShiftRate?: number;
  trackBySystem: boolean;
  allowManualEntry: boolean;
  paymentMethod: 'cash' | 'included-in-salary' | 'separate';
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  effectiveDate: Date;
  expiryDate?: Date;
}

/**
 * Update Overtime Policy Input
 */
export interface UpdateOvertimePolicyInput {
  name?: string;
  nameEn?: string;
  description?: string;
  eligibleEmployeeTypes?: string[];
  eligiblePositions?: string[];
  eligibleDepartments?: string[];
  rules?: OvertimeRule[];
  requiresApproval?: boolean;
  approvalThresholdHours?: number;
  autoApproveUnder?: number;
  holidayRate?: number;
  weekendRate?: number;
  nightShiftRate?: number;
  trackBySystem?: boolean;
  allowManualEntry?: boolean;
  paymentMethod?: 'cash' | 'included-in-salary' | 'separate';
  paymentFrequency?: 'monthly' | 'bi-weekly' | 'weekly';
  effectiveDate?: Date;
  expiryDate?: Date;
  isActive?: boolean;
}

/**
 * Overtime Policy Filters
 */
export interface OvertimePolicyFilters {
  department?: string;
  position?: string;
  employeeType?: string;
  isActive?: boolean;
}

/**
 * Overtime Calculation Input
 */
export interface OvertimeCalculationInput {
  policyId: string;
  employeeId: string;
  date: Date;
  overtimeHours: number;
  overtimeType: OvertimeType;
  hourlyRate: number;
}

/**
 * Overtime Calculation Result
 */
export interface OvertimeCalculationResult {
  hours: number;
  rate: number;
  amount: number;
  type: OvertimeType;
  requiresApproval: boolean;
  isWithinLimit: boolean;
  exceedsLimit?: {
    type: 'day' | 'week' | 'month';
    limit: number;
    actual: number;
  };
}

/**
 * Overtime Request (for approval workflow)
 */
export interface OvertimeRequest extends BaseEntity {
  employeeId: string;
  employeeName: string;
  policyId: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalHours: number;
  type: OvertimeType;
  reason: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  tenantId: string;
}
