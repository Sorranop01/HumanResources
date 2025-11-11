/**
 * Query hook for fetching leave requests
 */

import { useQuery } from '@tanstack/react-query';
import { leaveRequestService } from '../services/leaveRequestService';
import type { LeaveRequestFilters } from '../types';

export const useLeaveRequests = (filters?: LeaveRequestFilters) => {
  return useQuery({
    queryKey: ['leaveRequests', filters],
    queryFn: () => leaveRequestService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
