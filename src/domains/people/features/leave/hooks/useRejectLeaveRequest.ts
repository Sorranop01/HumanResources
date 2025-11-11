/**
 * Mutation hook for rejecting leave request
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { leaveRequestService } from '../services/leaveRequestService';
import type { RejectLeaveRequestInput } from '../types';

export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: RejectLeaveRequestInput }) => {
      await leaveRequestService.reject(id, input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leaveEntitlements'] });
      message.success('ปฏิเสธคำขอลาสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถปฏิเสธคำขอลาได้');
    },
  });
};
