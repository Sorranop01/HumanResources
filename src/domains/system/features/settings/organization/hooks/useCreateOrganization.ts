import { useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '../services/organizationService';
import type { CreateOrganizationInput } from '../types/organizationTypes';
import { organizationKeys } from './useOrganization';

type CreateOrganizationParams = {
  tenantId: string;
  input: CreateOrganizationInput;
  userId: string;
};

/**
 * Hook to create organization settings
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, input, userId }: CreateOrganizationParams) =>
      organizationService.create(tenantId, input, userId),
    onSuccess: (_data, variables) => {
      // Invalidate organization query
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(variables.tenantId),
      });
    },
    onError: (error) => {
      console.error('❌ Create organization mutation failed:', error);
    },
  });
};
