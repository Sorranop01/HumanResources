import { useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '../services/organizationService';
import type { UpdateOrganizationInput } from '../types/organizationTypes';
import { organizationKeys } from './useOrganization';

type UpdateOrganizationParams = {
  tenantId: string;
  input: UpdateOrganizationInput;
  userId: string;
};

/**
 * Hook to update organization settings
 */
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, input, userId }: UpdateOrganizationParams) =>
      organizationService.update(tenantId, input, userId),
    onSuccess: (_data, variables) => {
      // Invalidate organization query
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(variables.tenantId),
      });
    },
    onError: (error) => {
      console.error('❌ Update organization mutation failed:', error);
    },
  });
};
