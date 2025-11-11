import { useQuery } from '@tanstack/react-query';
import type { EmployeeFilters } from '@/domains/people/features/employees/schemas';
import {
  employeeKeys,
  employeeService,
} from '@/domains/people/features/employees/services/employeeService';
import type { Employee } from '@/domains/people/features/employees/types';

/**
 * Hook to fetch all employees with optional filters
 * Uses TanStack Query for server state management
 */
export function useEmployees(filters?: EmployeeFilters) {
  return useQuery<Employee[], Error>({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeeService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
