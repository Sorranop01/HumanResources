import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { EmployeeFormInput } from '@/domains/people/features/employees/schemas';
import {
  employeeKeys,
  employeeService,
} from '@/domains/people/features/employees/services/employeeService';

interface CreateEmployeePayload {
  employeeData: EmployeeFormInput;
  password?: string;
}

/**
 * Hook to create a new employee
 * Handles cache invalidation and success/error messages
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeeService.create(payload),
    onSuccess: () => {
      // Invalidate all employee list queries
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      void message.success('เพิ่มพนักงานสำเร็จ');
    },
    onError: (error: Error) => {
      void message.error(`เพิ่มพนักงานไม่สำเร็จ: ${error.message}`);
    },
  });
}
