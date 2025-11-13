import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService } from '../services/locationService';
import { locationKeys } from './useLocations';

type DeleteLocationParams = {
  id: string;
};

/**
 * Hook to delete a location
 */
export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteLocationParams) => locationService.delete(id),
    onSuccess: () => {
      // Invalidate all location queries
      queryClient.invalidateQueries({
        queryKey: locationKeys.all,
      });
    },
    onError: (error) => {
      console.error('❌ Delete location mutation failed:', error);
    },
  });
};
