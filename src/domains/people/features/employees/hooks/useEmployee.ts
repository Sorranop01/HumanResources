import { useQuery } from '@tanstack/react-query';
import type { Employee } from '@/shared/types';
import { employeeService } from '../services/employeeService';

export function useEmployee(id: string | undefined) {
  return useQuery<Employee | null, Error>({
    queryKey: ['employees', id],
    queryFn: () => (id ? employeeService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
