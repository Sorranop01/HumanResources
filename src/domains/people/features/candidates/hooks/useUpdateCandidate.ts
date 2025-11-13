import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { CandidateUpdateInput } from '../schemas';
import { candidateKeys, candidateService } from '../services/candidateService';

interface UpdateParams {
  id: string;
  data: CandidateUpdateInput;
}

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, data }: UpdateParams) => candidateService.update(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: candidateKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: candidateKeys.stats() });
      void message.success('อัปเดตข้อมูลผู้สมัครสำเร็จ');
    },
    onError: (error: Error) => {
      void message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    },
  });
};
