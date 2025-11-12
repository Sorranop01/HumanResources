import type { BaseEntity } from '@/shared/types/base';

/**
 * Position Status
 */
export type PositionStatus = 'active' | 'inactive';

/**
 * Position Level
 */
export type PositionLevel =
  | 'executive'
  | 'senior-management'
  | 'middle-management'
  | 'supervisor'
  | 'staff'
  | 'junior';

/**
 * Job Description Details
 */
export interface JobDescription {
  overview: string; // ภาพรวมของงาน
  responsibilities: string[]; // ความรับผิดชอบ
  requirements: string[]; // คุณสมบัติที่ต้องการ
  qualifications: string[]; // วุฒิการศึกษา/ประสบการณ์
  skills: string[]; // ทักษะที่จำเป็น
  competencies?: string[]; // สมรรถนะหลัก (optional)
}

/**
 * Salary Range
 */
export interface SalaryRange {
  min: number; // เงินเดือนขั้นต่ำ
  max: number; // เงินเดือนขั้นสูง
  currency: string; // สกุลเงิน (THB)
}

/**
 * Position Entity
 */
export interface Position extends BaseEntity {
  id: string;
  positionCode: string; // รหัสตำแหน่ง (unique)
  nameTH: string; // ชื่อตำแหน่งภาษาไทย
  nameEN?: string; // ชื่อตำแหน่งภาษาอังกฤษ (optional)
  level: PositionLevel; // ระดับตำแหน่ง
  department: string; // แผนก/ฝ่าย
  parentPositionId?: string; // รหัสตำแหน่งหัวหน้า (สำหรับ org chart)
  parentPositionName?: string; // ชื่อตำแหน่งหัวหน้า (denormalized)
  jobDescription: JobDescription; // รายละเอียดงาน
  salaryRange: SalaryRange; // ช่วงเงินเดือน
  headcount: number; // จำนวนตำแหน่งทั้งหมด
  currentEmployees: number; // จำนวนพนักงานปัจจุบัน
  vacancy: number; // จำนวนตำแหน่งว่าง (calculated: headcount - currentEmployees)
  status: PositionStatus; // สถานะ
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Position Filters for querying
 */
export interface PositionFilters {
  status?: PositionStatus;
  level?: PositionLevel;
  department?: string;
  parentPositionId?: string;
  hasVacancy?: boolean; // filter positions with vacancy > 0
}

/**
 * Organization Chart Node (for visualization)
 */
export interface OrgChartNode {
  id: string;
  name: string;
  positionCode: string;
  level: PositionLevel;
  department: string;
  headcount: number;
  currentEmployees: number;
  vacancy: number;
  employees?: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  children?: OrgChartNode[];
}

/**
 * Position Summary Statistics
 */
export interface PositionStats {
  totalPositions: number;
  totalHeadcount: number;
  totalEmployees: number;
  totalVacancies: number;
  positionsByLevel: Record<PositionLevel, number>;
  positionsByDepartment: Record<string, number>;
}
