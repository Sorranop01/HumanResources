import { useQuery } from '@tanstack/react-query';
import {
  positionKeys,
  positionService,
} from '@/domains/people/features/positions/services/positionService';
import type { Position } from '@/domains/people/features/positions/types';

/**
 * Hook to fetch a single position by ID
 */
export function usePosition(id: string | undefined) {
  return useQuery<Position | null, Error>({
    queryKey: positionKeys.detail(id ?? ''),
    queryFn: () => (id ? positionService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
