import { useQuery } from '@tanstack/react-query';
import {
  positionKeys,
  positionService,
} from '@/domains/people/features/positions/services/positionService';
import type { PositionStats } from '@/domains/people/features/positions/types';

/**
 * Hook to fetch position statistics
 */
export function usePositionStats() {
  return useQuery<PositionStats, Error>({
    queryKey: positionKeys.stats(),
    queryFn: () => positionService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
