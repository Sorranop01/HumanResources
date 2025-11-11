/**
 * Dashboard feature types
 */

import type { Role } from '@/shared/constants/roles';

/**
 * Dashboard statistics data
 */
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveRequests: number;
  todayAttendance: number;
  monthlyPayroll: number;
  departmentCount: number;
}

/**
 * Quick action item
 */
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  roles: Role[];
  color?: string | undefined;
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: string;
  type: 'leave' | 'attendance' | 'employee' | 'payroll' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user?: string | undefined;
  status?: 'pending' | 'approved' | 'rejected' | 'completed' | undefined;
}

/**
 * Dashboard data aggregated
 */
export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
}
