/**
 * Query hook for fetching social security contributions history
 */

import { useQuery } from '@tanstack/react-query';
import { socialSecurityService } from '../services/socialSecurityService';

export const useContributions = (socialSecurityId: string) => {
  return useQuery({
    queryKey: ['socialSecurity', 'contributions', socialSecurityId],
    queryFn: () => socialSecurityService.getContributions(socialSecurityId),
    enabled: !!socialSecurityId,
    staleTime: 5 * 60 * 1000,
  });
};
