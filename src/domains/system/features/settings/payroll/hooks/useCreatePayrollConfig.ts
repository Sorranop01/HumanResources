/**
 * useCreatePayrollConfig Hook
 * React Query mutation hook for creating payroll configuration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  CreatePayrollConfigInput,
  PayrollConfig,
} from '@/shared/schemas/payrollConfig.schema';
import { payrollConfigService } from '../services/payrollConfigService';
import { payrollConfigKeys } from './usePayrollConfig';

/**
 * Hook to create payroll configuration
 */
export function useCreatePayrollConfig() {
  const queryClient = useQueryClient();

  return useMutation<PayrollConfig, Error, CreatePayrollConfigInput>({
    mutationFn: async (input: CreatePayrollConfigInput) => {
      return await payrollConfigService.create(input);
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: payrollConfigKeys.detail(data.tenantId) });
      queryClient.invalidateQueries({ queryKey: payrollConfigKeys.all });
      message.success('สร้างการตั้งค่าเงินเดือนสำเร็จ');
    },
    onError: (error: Error) => {
      console.error('Error creating payroll config:', error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    },
  });
}
