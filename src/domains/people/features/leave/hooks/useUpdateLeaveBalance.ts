/**
 * Mutation hook for updating leave balance
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { leaveEntitlementService } from '../services/leaveEntitlementService';
import type { UpdateLeaveBalanceInput } from '../types';

export const useUpdateLeaveBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      days,
      input,
    }: {
      id: string;
      days: number;
      input: UpdateLeaveBalanceInput;
    }) => {
      await leaveEntitlementService.updateBalance(id, days, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveEntitlements'] });
      message.success('อัปเดตยอดสิทธิ์การลาสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถอัปเดตยอดสิทธิ์การลาได้');
    },
  });
};
