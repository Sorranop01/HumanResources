import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { StartBreakInput } from '../schemas';
import { attendanceService } from '../services/attendanceService';

/**
 * Hook to start a break
 */
export const useStartBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StartBreakInput) => {
      await attendanceService.startBreak(input.recordId, input.breakType, input.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'today'] });
      message.success('เริ่มพักสำเร็จ');
    },
    onError: (error: Error) => {
      console.error('Failed to start break:', error);
      message.error(error.message || 'ไม่สามารถเริ่มพักได้');
    },
  });
};

/**
 * Hook to end a break
 */
export const useEndBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { recordId: string; breakId: string }) => {
      await attendanceService.endBreak(input.recordId, input.breakId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'today'] });
      message.success('สิ้นสุดการพักสำเร็จ');
    },
    onError: (error: Error) => {
      console.error('Failed to end break:', error);
      message.error(error.message || 'ไม่สามารถสิ้นสุดการพักได้');
    },
  });
};

/**
 * Hook to get current active break
 */
export const useCurrentBreak = (recordId: string | null) => {
  return useQuery({
    queryKey: ['attendance', 'break', recordId],
    queryFn: async () => {
      if (!recordId) return null;
      return attendanceService.getCurrentBreak(recordId);
    },
    enabled: !!recordId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};
