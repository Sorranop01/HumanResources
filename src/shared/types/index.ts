/**
 * Central type definitions for the HR system
 * Re-export domain-specific types here
 */

import type { Role } from '@/shared/constants/roles';

// Base types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User extends BaseEntity {
  email: string;
  displayName: string;
  role: Role;
  photoURL?: string | undefined;
  phoneNumber?: string | undefined;
  isActive: boolean;
}

// Employee types
export interface Employee extends BaseEntity {
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  thaiFirstName: string;
  thaiLastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  hireDate: Date;
  position: string;
  department: string;
  salary: number;
  status: EmployeeStatus;
  photoURL?: string;
}

export type EmployeeStatus = 'active' | 'on-leave' | 'resigned' | 'terminated';

// Attendance types
export interface AttendanceRecord extends BaseEntity {
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'holiday';

// Leave request types
export interface LeaveRequest extends BaseEntity {
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  approvedBy?: string;
  approvedAt?: Date;
}

export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// Payroll types
export interface PayrollRun extends BaseEntity {
  periodStart: Date;
  periodEnd: Date;
  status: PayrollStatus;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  processedBy?: string;
  processedAt?: Date;
}

export type PayrollStatus = 'draft' | 'processing' | 'completed' | 'paid' | 'cancelled';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
