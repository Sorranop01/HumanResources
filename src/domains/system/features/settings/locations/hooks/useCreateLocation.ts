import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService } from '../services/locationService';
import type { CreateLocationInput } from '../types/locationTypes';
import { locationKeys } from './useLocations';

type CreateLocationParams = {
  input: CreateLocationInput;
  userId: string;
};

/**
 * Hook to create a new location
 */
export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, userId }: CreateLocationParams) => locationService.create(input, userId),
    onSuccess: (_data, _variables) => {
      // Invalidate all location queries for this tenant
      queryClient.invalidateQueries({
        queryKey: locationKeys.lists(),
      });
    },
    onError: (error) => {
      console.error('❌ Create location mutation failed:', error);
    },
  });
};
