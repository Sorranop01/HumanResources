import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { CreatePositionInput } from '@/domains/people/features/positions/schemas';
import {
  positionKeys,
  positionService,
} from '@/domains/people/features/positions/services/positionService';

/**
 * Hook to create a new position
 */
export function useCreatePosition() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (data: CreatePositionInput) => positionService.create(data),
    onSuccess: () => {
      // Invalidate position lists and org chart
      void queryClient.invalidateQueries({ queryKey: positionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: positionKeys.orgChart() });
      void queryClient.invalidateQueries({ queryKey: positionKeys.stats() });
      void message.success('เพิ่มตำแหน่งสำเร็จ');
    },
    onError: (error: Error) => {
      void message.error(`เพิ่มตำแหน่งไม่สำเร็จ: ${error.message}`);
    },
  });
}
