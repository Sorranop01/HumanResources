import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '@/domains/people/features/attendance/services/attendanceService';
import { useAuth } from '@/shared/hooks/useAuth';

export const attendanceKeys = {
  all: ['attendance'] as const,
  history: (userId: string) => [...attendanceKeys.all, 'history', userId] as const,
  today: (userId: string) => [...attendanceKeys.all, 'today', userId] as const,
};

export const useTodayAttendance = () => {
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid ?? '';

  return useQuery({
    queryKey: attendanceKeys.today(userId),
    queryFn: () => attendanceService.getTodayAttendance(userId),
    enabled: !!userId, // Only run the query if the user ID is available
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
