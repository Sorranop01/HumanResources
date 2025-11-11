/**
 * Shared Common Types
 * Only generic/reusable types that are used across multiple domains
 * Domain-specific types should live in their respective feature folders
 */

import type { Role } from '@/shared/constants/roles';

// ============================================
// Base Entity Types
// ============================================

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// User Types (System-level)
// ============================================

/**
 * System user (for authentication)
 */
export interface User extends BaseEntity {
  email: string;
  displayName: string;
  role: Role; // Primary key for logic & security rules
  roleId?: string | undefined; // Foreign key to roleDefinitions
  roleName?: string | undefined; // Denormalized: display name for UI
  photoURL?: string | undefined;
  phoneNumber?: string | undefined;
  isActive: boolean;
}

// ============================================
// API Response Types (Generic)
// ============================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T | undefined;
  error?: string | undefined;
  message?: string | undefined;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// Future Domain Types (Placeholder)
// ============================================
// Note: When implementing these features, move types to their respective domains:
// - Employee → domains/people/features/employees/types/
// - Attendance → domains/people/features/attendance/types/
// - Leave → domains/people/features/leave/types/
// - Payroll → domains/finance/features/payroll/types/
