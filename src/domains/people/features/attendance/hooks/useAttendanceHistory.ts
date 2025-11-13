import { useQuery } from '@tanstack/react-query';
import { attendanceKeys } from '@/domains/people/features/attendance/hooks/useTodayAttendance';
import { attendanceService } from '@/domains/people/features/attendance/services/attendanceService';
import { useAuth } from '@/shared/hooks/useAuth';

export const useAttendanceHistory = () => {
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid ?? '';

  return useQuery({
    queryKey: attendanceKeys.history(userId),
    queryFn: () => attendanceService.getAttendanceHistory(userId),
    enabled: !!userId, // Only run the query if the user ID is available
  });
};
