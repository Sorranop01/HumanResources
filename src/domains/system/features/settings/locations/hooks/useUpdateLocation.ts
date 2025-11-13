import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService } from '../services/locationService';
import type { UpdateLocationInput } from '../types/locationTypes';
import { locationKeys } from './useLocations';

type UpdateLocationParams = {
  id: string;
  input: UpdateLocationInput;
  userId: string;
};

/**
 * Hook to update a location
 */
export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input, userId }: UpdateLocationParams) =>
      locationService.update(id, input, userId),
    onSuccess: (_data, variables) => {
      // Invalidate specific location and lists
      queryClient.invalidateQueries({
        queryKey: locationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: locationKeys.lists(),
      });
    },
    onError: (error) => {
      console.error('❌ Update location mutation failed:', error);
    },
  });
};
