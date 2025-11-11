/**
 * Query hook for fetching social security by employee ID
 */

import { useQuery } from '@tanstack/react-query';
import { socialSecurityService } from '../services/socialSecurityService';

export const useSocialSecurity = (employeeId: string) => {
  return useQuery({
    queryKey: ['socialSecurity', 'employee', employeeId],
    queryFn: () => socialSecurityService.getByEmployeeId(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });
};
