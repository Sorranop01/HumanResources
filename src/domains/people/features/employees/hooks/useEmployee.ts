import { useQuery } from '@tanstack/react-query';
import {
  employeeKeys,
  employeeService,
} from '@/domains/people/features/employees/services/employeeService';
import type { Employee } from '@/domains/people/features/employees/types';

/**
 * Hook to fetch a single employee by ID
 * Uses TanStack Query for server state management
 */
export function useEmployee(id: string | undefined) {
  return useQuery<Employee | null, Error>({
    queryKey: employeeKeys.detail(id ?? ''),
    queryFn: () => (id ? employeeService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
