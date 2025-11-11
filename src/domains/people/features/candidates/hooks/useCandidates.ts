import { useQuery } from '@tanstack/react-query';
import { candidateKeys, candidateService } from '../services/candidateService';

export const useCandidates = () => {
  return useQuery({
    queryKey: candidateKeys.lists(),
    queryFn: candidateService.getAll,
  });
};
