/**
 * Mutation hook for approving leave request
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { leaveRequestService } from '../services/leaveRequestService';
import type { ApproveLeaveRequestInput } from '../types';

export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ApproveLeaveRequestInput }) => {
      await leaveRequestService.approve(id, input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leaveEntitlements'] });
      message.success('อนุมัติคำขอลาสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถอนุมัติคำขอลาได้');
    },
  });
};
