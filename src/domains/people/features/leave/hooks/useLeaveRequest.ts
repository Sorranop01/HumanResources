/**
 * Query hook for fetching a single leave request
 */

import { useQuery } from '@tanstack/react-query';
import { leaveRequestService } from '../services/leaveRequestService';

export const useLeaveRequest = (id: string) => {
  return useQuery({
    queryKey: ['leaveRequests', id],
    queryFn: () => leaveRequestService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
