/**
 * usePayrollConfig Hook
 * React Query hook for fetching payroll configuration
 */

import { useQuery } from '@tanstack/react-query';
import type { PayrollConfig } from '@/shared/schemas/payrollConfig.schema';
import { payrollConfigService } from '../services/payrollConfigService';

/**
 * Query key factory for payroll config
 */
export const payrollConfigKeys = {
  all: ['payrollConfig'] as const,
  detail: (tenantId: string) => ['payrollConfig', tenantId] as const,
};

/**
 * Hook to fetch payroll configuration for a tenant
 */
export function usePayrollConfig(tenantId: string, organizationName?: string) {
  return useQuery<PayrollConfig | null, Error>({
    queryKey: payrollConfigKeys.detail(tenantId),
    queryFn: async () => {
      if (organizationName) {
        return await payrollConfigService.getOrCreate(tenantId, organizationName);
      }
      return await payrollConfigService.get(tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
