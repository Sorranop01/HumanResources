/**
 * Social Security Feature Types
 * Domain-specific types for social security management
 */

import type { BaseEntity } from '@/shared/types';

/**
 * Social Security Status
 */
export type SocialSecurityStatus = 'active' | 'inactive' | 'suspended';

/**
 * Social Security Entity
 */
export interface SocialSecurity extends BaseEntity {
  employeeId: string;
  employeeName: string;
  employeeCode: string;

  // Registration Info
  socialSecurityNumber: string;
  registrationDate: Date;
  status: SocialSecurityStatus;

  // Hospital
  hospitalName: string;
  hospitalCode?: string;

  // Contribution Rates (as decimal, e.g., 0.05 for 5%)
  employeeContributionRate: number;
  employerContributionRate: number;

  // Monthly Contributions
  contributionBase: number;
  employeeAmount: number;
  employerAmount: number;
  totalAmount: number;

  // Accumulated Totals
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  totalContribution: number;

  // Metadata
  notes?: string;
  lastContributionDate?: Date;
  tenantId: string;
}

/**
 * Social Security Contribution Record
 */
export interface SocialSecurityContribution extends BaseEntity {
  socialSecurityId: string;
  payrollId?: string;

  month: number;
  year: number;
  contributionDate: Date;

  contributionBase: number;
  employeeAmount: number;
  employerAmount: number;
  totalAmount: number;

  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: Date;
}

/**
 * Create Social Security Input
 */
export interface CreateSocialSecurityInput {
  employeeId: string;
  socialSecurityNumber: string;
  registrationDate: Date;
  hospitalName: string;
  hospitalCode?: string | undefined;
  employeeContributionRate?: number | undefined;
  employerContributionRate?: number | undefined;
  notes?: string | undefined;
}

/**
 * Update Social Security Input
 */
export interface UpdateSocialSecurityInput {
  hospitalName?: string | undefined;
  hospitalCode?: string | undefined;
  status?: SocialSecurityStatus | undefined;
  employeeContributionRate?: number | undefined;
  employerContributionRate?: number | undefined;
  notes?: string | undefined;
}

/**
 * Social Security Filters
 */
export interface SocialSecurityFilters {
  status?: SocialSecurityStatus;
  employeeId?: string;
}
