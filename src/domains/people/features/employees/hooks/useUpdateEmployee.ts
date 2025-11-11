import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Employee } from '@/shared/types';
import { employeeService } from '../services/employeeService';

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      employeeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
      message.success('อัปเดตข้อมูลพนักงานสำเร็จ');
    },
    onError: (error: Error) => {
      message.error(`อัปเดตข้อมูลไม่สำเร็จ: ${error.message}`);
    },
  });
}
