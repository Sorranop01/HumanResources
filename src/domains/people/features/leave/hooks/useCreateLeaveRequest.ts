/**
 * Mutation hook for creating leave request
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { leaveRequestService } from '../services/leaveRequestService';
import type { CreateLeaveRequestInput } from '../types';

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLeaveRequestInput) => {
      return await leaveRequestService.create(input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({
        queryKey: ['leaveEntitlements', 'employee', variables.employeeId],
      });
      queryClient.invalidateQueries({ queryKey: ['leaveEntitlements'] });
      message.success('สร้างคำขอลาสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถสร้างคำขอลาได้');
    },
  });
};
