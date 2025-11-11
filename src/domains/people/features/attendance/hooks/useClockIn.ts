import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceKeys } from '@/domains/people/features/attendance/hooks/useTodayAttendance';
import { attendanceService } from '@/domains/people/features/attendance/services/attendanceService';
import { useAuth } from '@/shared/hooks/useAuth';

export const useClockIn = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      return attendanceService.clockIn(user.uid);
    },
    onSuccess: () => {
      // Invalidate and refetch the today's attendance query
      return queryClient.invalidateQueries({ queryKey: attendanceKeys.today(user?.uid ?? '') });
    },
    onError: (error) => {
      // You can add more robust error handling here, e.g., showing a toast notification
      console.error('Failed to clock in:', error);
    },
  });
};
