import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Timestamp } from 'firebase/firestore';
import { attendanceKeys } from '@/domains/people/features/attendance/hooks/useTodayAttendance';
import { attendanceService } from '@/domains/people/features/attendance/services/attendanceService';
import { useAuth } from '@/shared/hooks/useAuth';

interface ClockOutVariables {
  recordId: string;
  clockInTime: Timestamp;
}

export const useClockOut = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ recordId, clockInTime }: ClockOutVariables) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      return attendanceService.clockOut(recordId, clockInTime);
    },
    onSuccess: () => {
      // Invalidate and refetch the today's attendance query
      return queryClient.invalidateQueries({ queryKey: attendanceKeys.today(user?.uid ?? '') });
    },
    onError: (error) => {
      console.error('Failed to clock out:', error);
    },
  });
};
