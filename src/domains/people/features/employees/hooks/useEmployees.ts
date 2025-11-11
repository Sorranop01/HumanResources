import { useQuery } from '@tanstack/react-query';
import type { Employee } from '@/shared/types';
import { employeeService } from '../services/employeeService';

interface UseEmployeesOptions {
  status?: string;
  department?: string;
}

export function useEmployees(options?: UseEmployeesOptions) {
  return useQuery<Employee[], Error>({
    queryKey: ['employees', options],
    queryFn: () => employeeService.getAll(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
