/**
 * Mutation hook for updating social security record
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { socialSecurityService } from '../services/socialSecurityService';
import type { UpdateSocialSecurityInput } from '../types';

export const useUpdateSocialSecurity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateSocialSecurityInput }) => {
      await socialSecurityService.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialSecurity'] });
      message.success('อัปเดตข้อมูลประกันสังคมสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถอัปเดตข้อมูลประกันสังคมได้');
    },
  });
};
