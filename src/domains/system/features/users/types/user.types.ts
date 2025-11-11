/**
 * User management types
 */

import type { Role } from '@/shared/constants/roles';
import type { User } from '@/shared/types';

/**
 * User filters
 */
export interface UserFilters {
  role?: Role;
  isActive?: boolean;
  searchQuery?: string;
}

/**
 * User table record (extends User for table display)
 */
export interface UserTableRecord extends User {
  key: string;
}

/**
 * User create payload
 */
export interface CreateUserPayload {
  email: string;
  password: string;
  displayName: string;
  role: Role;
  phoneNumber?: string | undefined;
}

/**
 * User update payload
 */
export interface UpdateUserPayload {
  displayName?: string | undefined;
  role?: Role | undefined;
  isActive?: boolean | undefined;
  phoneNumber?: string | undefined;
}
