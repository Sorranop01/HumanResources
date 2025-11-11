import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Employee } from '@/shared/types';
import { employeeService } from '../services/employeeService';

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) =>
      employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      message.success('เพิ่มพนักงานสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`เพิ่มพนักงานไม่สำเร็จ: ${error.message}`);
    },
  });
}
