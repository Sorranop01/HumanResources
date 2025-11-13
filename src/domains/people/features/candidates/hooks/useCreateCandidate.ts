import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { CandidateApplicationInput } from '../schemas';
import { candidateKeys, candidateService } from '../services/candidateService';

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (data: CandidateApplicationInput) => candidateService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: candidateKeys.stats() });
      void message.success('ส่งใบสมัครสำเร็จ! เราจะติดต่อกลับโดยเร็วที่สุด');
    },
    onError: (error: Error) => {
      void message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    },
  });
};
