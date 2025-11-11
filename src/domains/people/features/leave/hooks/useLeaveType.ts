/**
 * Query hook for fetching a single leave type
 */

import { useQuery } from '@tanstack/react-query';
import { leaveTypeService } from '../services/leaveTypeService';

export const useLeaveType = (id: string) => {
  return useQuery({
    queryKey: ['leaveTypes', id],
    queryFn: () => leaveTypeService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
