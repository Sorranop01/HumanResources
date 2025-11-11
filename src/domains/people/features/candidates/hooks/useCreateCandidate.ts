import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { CandidateFormInput } from '../schemas';
import { candidateKeys, candidateService } from '../services/candidateService';

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (data: CandidateFormInput) => candidateService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      void message.success('เพิ่มผู้สมัครสำเร็จ');
    },
    onError: (error: Error) => {
      void message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    },
  });
};
