import type { Timestamp } from 'firebase/firestore';

/**
 * Department entity
 * Supports hierarchical structure (parent-child)
 */
export type Department = {
  id: string;
  code: string; // รหัสแผนก (e.g., 'HR', 'IT', 'FIN')
  name: string; // ชื่อแผนก (TH)
  nameEn: string; // Department Name (EN)

  // Hierarchy
  parentDepartmentId?: string; // For nested departments
  level: number; // 1 = top level, 2+ = sub-departments
  path: string; // Full path (e.g., '/HR/Recruitment')

  // Management
  managerId?: string; // Employee ID of department head
  managerName?: string; // Denormalized for quick display

  // Financial
  costCenter?: string; // รหัสศูนย์ต้นทุน
  budgetAmount?: number; // งบประมาณประจำปี

  // Settings
  isActive: boolean; // Default: true
  description?: string;

  // Metadata
  tenantId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
};

/**
 * Input type for creating department
 */
export type CreateDepartmentInput = Omit<
  Department,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Input type for updating department
 */
export type UpdateDepartmentInput = Partial<
  Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
>;

/**
 * Filter options for querying departments
 */
export type DepartmentFilters = {
  isActive?: boolean;
  parentDepartmentId?: string;
  level?: number;
  managerId?: string;
};

/**
 * Department with children (for tree view)
 */
export type DepartmentTree = Department & {
  children?: DepartmentTree[];
};

/**
 * Firestore document type (before ID mapping)
 */
export type DepartmentDocument = Omit<Department, 'id'>;
