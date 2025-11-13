import { useMutation, useQueryClient } from '@tanstack/react-query';
import { positionService } from '../services/positionService';
import type { CreatePositionInput } from '../types/positionTypes';
import { positionKeys } from './usePositions';

interface CreatePositionParams {
  input: CreatePositionInput;
  userId: string;
}

export const useCreatePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, userId }: CreatePositionParams) => positionService.create(input, userId),
    onSuccess: (_data, variables) => {
      // Invalidate all position queries for this tenant
      queryClient.invalidateQueries({
        queryKey: positionKeys.list(variables.input.tenantId),
      });
    },
  });
};
