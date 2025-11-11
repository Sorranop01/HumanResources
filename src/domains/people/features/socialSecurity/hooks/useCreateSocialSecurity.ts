/**
 * Mutation hook for creating social security record
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { socialSecurityService } from '../services/socialSecurityService';
import type { CreateSocialSecurityInput } from '../types';

export const useCreateSocialSecurity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      input,
      employee,
    }: {
      input: CreateSocialSecurityInput;
      employee: { name: string; code: string; salary: number };
    }) => {
      return await socialSecurityService.create(input, employee);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['socialSecurity', 'employee', variables.input.employeeId],
      });
      queryClient.invalidateQueries({ queryKey: ['socialSecurity'] });
      message.success('บันทึกข้อมูลประกันสังคมสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถบันทึกข้อมูลประกันสังคมได้');
    },
  });
};
