/**
 * Mutation hook for deleting social security record
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { socialSecurityService } from '../services/socialSecurityService';

export const useDeleteSocialSecurity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await socialSecurityService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialSecurity'] });
      message.success('ลบข้อมูลประกันสังคมสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(error.message || 'ไม่สามารถลบข้อมูลประกันสังคมได้');
    },
  });
};
