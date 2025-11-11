import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import {
  employeeKeys,
  employeeService,
} from '@/domains/people/features/employees/services/employeeService';
import type { Employee } from '@/domains/people/features/employees/types';

interface UpdateEmployeeParams {
  id: string;
  data: Partial<Employee>;
}

/**
 * Hook to update an existing employee
 * Includes optimistic updates for better UX
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, data }: UpdateEmployeeParams) => employeeService.update(id, data),

    onMutate: async ({ id, data }: UpdateEmployeeParams) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: employeeKeys.detail(id) });

      // Snapshot previous value
      const previousEmployee = queryClient.getQueryData<Employee>(employeeKeys.detail(id));

      // Optimistically update
      if (previousEmployee) {
        queryClient.setQueryData<Employee>(employeeKeys.detail(id), {
          ...previousEmployee,
          ...data,
        });
      }

      return { previousEmployee };
    },

    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousEmployee) {
        queryClient.setQueryData(employeeKeys.detail(id), context.previousEmployee);
      }
      void message.error(`อัปเดตข้อมูลไม่สำเร็จ: ${error.message}`);
    },

    onSuccess: (_, { id }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      void message.success('อัปเดตข้อมูลพนักงานสำเร็จ');
    },
  });
}
