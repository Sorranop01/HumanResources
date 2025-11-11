/**
 * Hook for calculating attendance statistics
 */

import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';

export const useAttendanceStats = (
  userId: string,
  employeeId: string,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ['attendance', 'stats', userId, employeeId, startDate, endDate],
    queryFn: () => attendanceService.calculateStats(userId, employeeId, startDate, endDate),
    enabled: !!userId && !!employeeId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
