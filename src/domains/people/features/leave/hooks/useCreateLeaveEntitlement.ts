/**
 * Mutation hook for creating leave entitlement
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { leaveEntitlementService } from '../services/leaveEntitlementService';
import type { CreateLeaveEntitlementInput } from '../types';

export const useCreateLeaveEntitlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLeaveEntitlementInput) => {
      return await leaveEntitlementService.create(input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['leaveEntitlements', 'employee', variables.employeeId],
      });
      queryClient.invalidateQueries({ queryKey: ['leaveEntitlements'] });
      message.success('สร้างสิทธิ์การลาสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถสร้างสิทธิ์การลาได้');
    },
  });
};
