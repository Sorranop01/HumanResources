import type { Timestamp } from 'firebase/firestore';

/**
 * Position level classification
 */
export type PositionLevel =
  | 'entry'
  | 'junior'
  | 'senior'
  | 'lead'
  | 'manager'
  | 'director'
  | 'executive';

/**
 * Position category
 */
export type PositionCategory = 'technical' | 'management' | 'support' | 'sales' | 'operations';

/**
 * Employment types applicable to position
 */
export type EmploymentType = 'permanent' | 'contract' | 'probation' | 'intern';

/**
 * Position entity (Job Title)
 */
export type Position = {
  id: string;
  code: string; // รหัสตำแหน่ง (e.g., 'ENG-001', 'HR-MGR')
  title: string; // ชื่อตำแหน่ง (TH)
  titleEn: string; // Position Title (EN)

  // Classification
  level: PositionLevel;
  category: PositionCategory;

  // Organization
  departmentId: string; // Default department
  departmentName: string; // Denormalized

  // Salary Range
  minSalary?: number;
  maxSalary?: number;
  currency: string; // Default: 'THB'

  // Job Details
  description?: string; // รายละเอียดหน้าที่
  responsibilities?: string[]; // รายการหน้าที่รับผิดชอบ
  requirements?: string[]; // คุณสมบัติที่ต้องการ

  // Employment
  employmentTypes: EmploymentType[];

  // Settings
  isActive: boolean; // Default: true
  isPublic: boolean; // Show in job postings

  // Metadata
  tenantId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
};

/**
 * Input type for creating position
 */
export type CreatePositionInput = Omit<
  Position,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Input type for updating position
 */
export type UpdatePositionInput = Partial<
  Omit<Position, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
>;

/**
 * Filter options for querying positions
 */
export type PositionFilters = {
  isActive?: boolean;
  departmentId?: string;
  level?: PositionLevel;
  category?: PositionCategory;
  isPublic?: boolean;
};

/**
 * Firestore document type (before ID mapping)
 */
export type PositionDocument = Omit<Position, 'id'>;
