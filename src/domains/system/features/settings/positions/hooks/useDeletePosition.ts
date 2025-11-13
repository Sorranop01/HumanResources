import { useMutation, useQueryClient } from '@tanstack/react-query';
import { positionService } from '../services/positionService';
import { positionKeys } from './usePositions';

interface DeletePositionParams {
  id: string;
}

export const useDeletePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeletePositionParams) => positionService.delete(id),
    onSuccess: (_data, variables) => {
      // Invalidate the specific position detail
      queryClient.invalidateQueries({
        queryKey: positionKeys.detail(variables.id),
      });
      // Invalidate all position lists
      queryClient.invalidateQueries({
        queryKey: positionKeys.lists(),
      });
    },
  });
};
