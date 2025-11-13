import { useMutation, useQueryClient } from '@tanstack/react-query';
import { positionService } from '../services/positionService';
import type { UpdatePositionInput } from '../types/positionTypes';
import { positionKeys } from './usePositions';

interface UpdatePositionParams {
  id: string;
  input: UpdatePositionInput;
  userId: string;
}

export const useUpdatePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input, userId }: UpdatePositionParams) =>
      positionService.update(id, input, userId),
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
