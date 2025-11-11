/**
 * Mutation hook for cancelling leave request
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { leaveRequestService } from '../services/leaveRequestService';

export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      employeeId,
      reason,
    }: {
      id: string;
      employeeId: string;
      reason: string;
    }) => {
      await leaveRequestService.cancel(id, employeeId, reason);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leaveEntitlements'] });
      message.success('ยกเลิกคำขอลาสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถยกเลิกคำขอลาได้');
    },
  });
};
