import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { UpdatePositionInput } from '@/domains/people/features/positions/schemas';
import {
  positionKeys,
  positionService,
} from '@/domains/people/features/positions/services/positionService';

/**
 * Hook to update a position
 */
export function useUpdatePosition() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdatePositionInput> }) =>
      positionService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate affected queries
      void queryClient.invalidateQueries({ queryKey: positionKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: positionKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: positionKeys.orgChart() });
      void queryClient.invalidateQueries({ queryKey: positionKeys.stats() });
      void message.success('อัปเดตตำแหน่งสำเร็จ');
    },
    onError: (error: Error) => {
      void message.error(`อัปเดตตำแหน่งไม่สำเร็จ: ${error.message}`);
    },
  });
}
