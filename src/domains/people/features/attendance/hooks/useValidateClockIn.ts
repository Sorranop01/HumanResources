/**
 * Hook for validating clock-in eligibility
 */

import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';

export const useValidateClockIn = (userId: string, employeeId: string, enabled = true) => {
  return useQuery({
    queryKey: ['attendance', 'validate-clock-in', userId, employeeId],
    queryFn: () => attendanceService.validateClockIn(userId, employeeId),
    enabled: enabled && !!userId && !!employeeId,
    staleTime: 0, // Always fresh
    gcTime: 0, // Don't cache
  });
};
