import { useQuery } from '@tanstack/react-query';
import {
  positionKeys,
  positionService,
} from '@/domains/people/features/positions/services/positionService';
import type { OrgChartNode } from '@/domains/people/features/positions/types';

/**
 * Hook to fetch organization chart hierarchy
 */
export function useOrgChart() {
  return useQuery<OrgChartNode[], Error>({
    queryKey: positionKeys.orgChart(),
    queryFn: () => positionService.getOrgChart(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
