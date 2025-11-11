import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type { DashboardStats } from '../types/dashboard.types';

/**
 * Fetch dashboard statistics
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total employees count
    const employeesRef = collection(db, 'employees');
    const employeesSnap = await getDocs(employeesRef);
    const totalEmployees = employeesSnap.size;

    // Get active employees (status = 'active')
    const activeEmployeesQuery = query(employeesRef, where('status', '==', 'active'));
    const activeEmployeesSnap = await getDocs(activeEmployeesQuery);
    const activeEmployees = activeEmployeesSnap.size;

    // Get pending leave requests (if collection exists)
    let pendingLeaveRequests = 0;
    try {
      const leaveRequestsRef = collection(db, 'leave-requests');
      const pendingLeaveQuery = query(leaveRequestsRef, where('status', '==', 'pending'));
      const pendingLeaveSnap = await getDocs(pendingLeaveQuery);
      pendingLeaveRequests = pendingLeaveSnap.size;
    } catch {
      // Collection might not exist yet
      pendingLeaveRequests = 0;
    }

    // Mock data for other stats (will be implemented later)
    const todayAttendance = Math.floor(activeEmployees * 0.85); // 85% attendance rate
    const monthlyPayroll = activeEmployees * 25000; // Average 25,000 per employee
    const departmentCount = Math.ceil(totalEmployees / 10); // ~10 employees per department

    return {
      totalEmployees,
      activeEmployees,
      pendingLeaveRequests,
      todayAttendance,
      monthlyPayroll,
      departmentCount,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    // Return empty stats on error
    return {
      totalEmployees: 0,
      activeEmployees: 0,
      pendingLeaveRequests: 0,
      todayAttendance: 0,
      monthlyPayroll: 0,
      departmentCount: 0,
    };
  }
}

/**
 * Query keys for dashboard
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
