import { useQuery } from '@tanstack/react-query';
import type { PositionFiltersType } from '@/domains/people/features/positions/schemas';
import {
  positionKeys,
  positionService,
} from '@/domains/people/features/positions/services/positionService';
import type { Position } from '@/domains/people/features/positions/types';

/**
 * Hook to fetch all positions with optional filters
 */
export function usePositions(filters?: PositionFiltersType) {
  return useQuery<Position[], Error>({
    queryKey: positionKeys.list(filters),
    queryFn: () => positionService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
