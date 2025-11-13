import { useQuery } from '@tanstack/react-query';
import { organizationService } from '../services/organizationService';

/**
 * Query keys for organization
 */
export const organizationKeys = {
  all: ['organization'] as const,
  detail: (tenantId: string) => [...organizationKeys.all, tenantId] as const,
};

/**
 * Hook to fetch organization settings
 */
export const useOrganization = (tenantId: string) => {
  return useQuery({
    queryKey: organizationKeys.detail(tenantId),
    queryFn: () => organizationService.get(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
