import { useQuery } from '@tanstack/react-query';
import { candidateKeys, candidateService } from '../services/candidateService';

export const useCandidate = (id: string | undefined) => {
  return useQuery({
    queryKey: candidateKeys.detail(id ?? ''),
    queryFn: () => (id ? candidateService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
};
