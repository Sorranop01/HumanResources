/**
 * Mutation hook for updating leave request
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { leaveRequestService } from '../services/leaveRequestService';
import type { UpdateLeaveRequestInput } from '../types';

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateLeaveRequestInput }) => {
      await leaveRequestService.update(id, input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests', variables.id] });
      message.success('อัปเดตคำขอลาสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถอัปเดตคำขอลาได้');
    },
  });
};
