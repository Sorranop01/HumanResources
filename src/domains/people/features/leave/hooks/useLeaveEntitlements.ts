/**
 * Query hook for fetching leave entitlements by employee
 */

import { useQuery } from '@tanstack/react-query';
import { leaveEntitlementService } from '../services/leaveEntitlementService';

export const useLeaveEntitlements = (employeeId: string, year?: number) => {
  return useQuery({
    queryKey: ['leaveEntitlements', 'employee', employeeId, year],
    queryFn: () => leaveEntitlementService.getByEmployeeId(employeeId, year),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });
};
