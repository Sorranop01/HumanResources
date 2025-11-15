import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { attendanceKeys } from '@/domains/people/features/attendance/hooks/useTodayAttendance';
import type { ClockOutInput } from '@/domains/people/features/attendance/schemas';
import { attendanceService } from '@/domains/people/features/attendance/services/attendanceService';
import { useAuth } from '@/shared/hooks/useAuth';

interface ClockOutVariables {
  recordId: string;
  clockInTime: Date | Timestamp;
  scheduledEndTime: string;
  gracePeriodMinutes?: number;
  earlyLeaveThresholdMinutes?: number;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export const useClockOut = () => {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: ({
      recordId,
      clockInTime,
      scheduledEndTime,
      gracePeriodMinutes = 5,
      earlyLeaveThresholdMinutes = 15,
      notes,
      location,
    }: ClockOutVariables) => {
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const clockOutData: ClockOutInput = {
        recordId,
        notes,
        location,
        clockOutMethod: 'web',
      };

      const normalizedClockInTime =
        clockInTime instanceof Timestamp ? clockInTime : Timestamp.fromDate(clockInTime);

      return attendanceService.clockOut(
        clockOutData,
        normalizedClockInTime,
        scheduledEndTime,
        gracePeriodMinutes,
        earlyLeaveThresholdMinutes
      );
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
      console.error('Failed to clock out:', error);
    },
  });
};
