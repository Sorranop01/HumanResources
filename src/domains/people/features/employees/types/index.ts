/**
 * Employee Feature Types
 * Complete employee data structure for HR system
 */

import type { BaseEntity } from '@/shared/types';

// ============================================
// Enums & Status Types
// ============================================

/**
 * Employee Status
 */
export type EmployeeStatus = 'active' | 'on-leave' | 'resigned' | 'terminated';

/**
 * Employment Type (ประเภทการจ้างงาน)
 */
export type EmploymentType = 'permanent' | 'contract' | 'probation' | 'freelance' | 'intern';

/**
 * Work Type (รูปแบบการทำงาน)
 */
export type WorkType = 'full-time' | 'part-time';

/**
 * Gender
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * Marital Status
 */
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

/**
 * Payment Frequency
 */
export type PaymentFrequency = 'monthly' | 'bi-weekly' | 'weekly' | 'hourly';

/**
 * Education Level
 */
export type EducationLevel = 'high-school' | 'diploma' | 'bachelor' | 'master' | 'doctorate';

/**
 * Document Type
 */
export type DocumentType =
  | 'resume'
  | 'national-id'
  | 'house-registration'
  | 'transcript'
  | 'degree-certificate'
  | 'work-permit'
  | 'contract'
  | 'nda'
  | 'photo'
  | 'tax-document'
  | 'medical-certificate'
  | 'other';

// ============================================
// Sub-types
// ============================================

/**
 * Address Information
 */
export interface Address {
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string; // ตำบล/แขวง
  district: string; // อำเภอ/เขต
  province: string; // จังหวัด
  postalCode: string;
  country: string;
}

/**
 * Emergency Contact
 */
export interface EmergencyContact {
  name: string;
  relationship: string; // พ่อ, แม่, คู่สมรส, พี่น้อง
  phoneNumber: string;
}

/**
 * Salary Information
 */
export interface SalaryInfo {
  baseSalary: number;
  currency: string; // THB, USD
  paymentFrequency: PaymentFrequency;
  effectiveDate: Date;
  hourlyRate?: number; // สำหรับ part-time
}

/**
 * Allowance
 */
export interface Allowance {
  type: string; // ค่าเดินทาง, ค่าโทรศัพท์, ค่าตำแหน่ง
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
}

/**
 * Social Security Information
 */
export interface SocialSecurityInfo {
  isEnrolled: boolean;
  ssNumber?: string;
  enrollmentDate?: Date;
  hospitalCode?: string;
  hospitalName?: string;
}

/**
 * Tax Information
 */
export interface TaxInfo {
  taxId?: string;
  withholdingTax: boolean;
  withholdingRate?: number; // %
  taxReliefs?: TaxRelief[];
}

/**
 * Tax Relief
 */
export interface TaxRelief {
  type: string; // บิดา, มารดา, คู่สมรส, บุตร, ประกันชีวิต
  amount: number;
}

/**
 * Bank Account
 */
export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branchName?: string;
}

/**
 * Reporting To (Manager)
 */
export interface ReportingTo {
  employeeId: string;
  employeeName: string;
  position: string;
}

/**
 * Work Location
 */
export interface WorkLocation {
  office: string; // กรุงเทพ, เชียงใหม่
  building?: string;
  floor?: string;
  seat?: string;
}

/**
 * Benefits
 */
export interface Benefits {
  healthInsurance: boolean;
  lifeInsurance: boolean;
  providentFund: {
    isEnrolled: boolean;
    employeeContributionRate?: number; // %
    employerContributionRate?: number; // %
  };
  annualLeave: number; // วัน/ปี
  sickLeave: number; // วัน/ปี
  otherBenefits?: string[];
}

/**
 * Education Record
 */
export interface EducationRecord {
  level: EducationLevel;
  institution: string;
  fieldOfStudy: string;
  graduationYear: number;
  gpa?: number;
}

/**
 * Certification
 */
export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
}

/**
 * Work Hours
 */
export interface WorkHours {
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  breakMinutes: number;
}

/**
 * Work Schedule
 */
export interface WorkSchedule {
  scheduleType: 'fixed' | 'flexible' | 'shift';
  hoursPerWeek: number;
  hoursPerDay: number;
  standardHours?: {
    monday?: WorkHours;
    tuesday?: WorkHours;
    wednesday?: WorkHours;
    thursday?: WorkHours;
    friday?: WorkHours;
    saturday?: WorkHours;
    sunday?: WorkHours;
  };
  currentShift?: {
    shiftName: string;
    startTime: string;
    endTime: string;
  };
}

/**
 * Overtime Configuration
 */
export interface OvertimeConfig {
  isEligible: boolean;
  rate: number; // 1.5x, 2x, 3x
}

/**
 * Document Record
 */
export interface DocumentRecord {
  // Some legacy records still store arbitrary strings, so accept string fallback
  type: DocumentType | string;
  fileName: string;
  fileURL: string;
  uploadDate: Date;
  uploadedBy: string;
  expiryDate?: Date;
  storagePath?: string;
}

// ============================================
// Main Employee Entity
// ============================================

/**
 * Employee type is now defined in schemas (Single Source of Truth)
 * Re-exporting from schemas for backward compatibility
 */
export type { Employee } from '../schemas';

// ============================================
// History & Subcollection Types
// ============================================

/**
 * Salary History (Subcollection)
 */
export interface SalaryHistory extends BaseEntity {
  employeeId: string;
  effectiveDate: Date;
  previousSalary: number;
  newSalary: number;
  increasePercentage: number;
  reason?: string;
  approvedBy?: string;
}

/**
 * Performance Review (Subcollection)
 */
export interface PerformanceReview extends BaseEntity {
  employeeId: string;
  reviewDate: Date;
  reviewPeriod: string; // Q1 2025
  rating: number; // 1-5
  strengths?: string;
  areasForImprovement?: string;
  goals?: string;
  reviewedBy: string;
}

/**
 * Training Record (Subcollection)
 */
export interface TrainingRecord extends BaseEntity {
  employeeId: string;
  trainingName: string;
  trainingDate: Date;
  duration: number; // hours
  provider?: string;
  certificate?: string; // URL
  cost?: number;
}

/**
 * Promotion History (Subcollection)
 */
export interface PromotionHistory extends BaseEntity {
  employeeId: string;
  effectiveDate: Date;
  fromPosition: string;
  toPosition: string;
  reason?: string;
  approvedBy?: string;
}
