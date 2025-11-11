/**
 * Hook for fetching monthly attendance records
 */

import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';

export const useMonthlyAttendance = (userId: string, month: number, year: number) => {
  return useQuery({
    queryKey: ['attendance', 'monthly', userId, month, year],
    queryFn: () => attendanceService.getMonthlyAttendance(userId, month, year),
    enabled: !!userId && month > 0 && month <= 12 && year > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
