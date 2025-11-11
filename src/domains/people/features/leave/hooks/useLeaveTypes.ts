/**
 * Query hook for fetching leave types
 */

import { useQuery } from '@tanstack/react-query';
import { leaveTypeService } from '../services/leaveTypeService';

export const useLeaveTypes = (includeInactive = false) => {
  return useQuery({
    queryKey: ['leaveTypes', includeInactive],
    queryFn: () => leaveTypeService.getAll(includeInactive),
    staleTime: 10 * 60 * 1000, // 10 minutes (master data changes rarely)
  });
};
