import { useQuery } from '@tanstack/react-query';
import { candidateKeys, candidateService } from '../services/candidateService';

export const useCandidateStats = () => {
  return useQuery({
    queryKey: candidateKeys.stats(),
    queryFn: candidateService.getStats,
    staleTime: 30000,
  });
};
