import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceKeys } from '@/domains/people/features/attendance/hooks/useTodayAttendance';
import type { ClockInInput } from '@/domains/people/features/attendance/schemas';
import { attendanceService } from '@/domains/people/features/attendance/services/attendanceService';
import { useAuth } from '@/shared/hooks/useAuth';

export const useClockIn = () => {
  const queryClient = useQueryClient();
  const { firebaseUser, employeeId } = useAuth();

  return useMutation({
    mutationFn: (input?: Partial<ClockInInput>) => {
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const clockInData: ClockInInput = {
        userId: firebaseUser.uid,
        employeeId: employeeId || undefined,
        clockInMethod: 'web',
        isRemoteWork: false,
        ...input,
      };

      return attendanceService.clockIn(clockInData);
    },
    onSuccess: () => {
      const userId = firebaseUser?.uid ?? '';
      // Invalidate and refetch both today's attendance and history
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.today(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.history(userId),
        }),
      ]);
    },
    onError: (error) => {
      // You can add more robust error handling here, e.g., showing a toast notification
      console.error('Failed to clock in:', error);
    },
  });
};
