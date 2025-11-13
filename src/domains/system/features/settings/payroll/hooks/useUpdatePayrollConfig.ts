/**
 * useUpdatePayrollConfig Hook
 * React Query mutation hook for updating payroll configuration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { UpdatePayrollConfigInput } from '@/shared/schemas/payrollConfig.schema';
import { payrollConfigService } from '../services/payrollConfigService';
import { payrollConfigKeys } from './usePayrollConfig';

interface UpdatePayrollConfigParams {
  tenantId: string;
  data: UpdatePayrollConfigInput;
  updatedBy?: string;
}

/**
 * Hook to update payroll configuration
 */
export function useUpdatePayrollConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tenantId, data, updatedBy }: UpdatePayrollConfigParams) => {
      await payrollConfigService.update(tenantId, data, updatedBy);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: payrollConfigKeys.detail(variables.tenantId) });
      queryClient.invalidateQueries({ queryKey: payrollConfigKeys.all });
      message.success('บันทึกการตั้งค่าเงินเดือนสำเร็จ');
    },
    onError: (error: Error) => {
      console.error('Error updating payroll config:', error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    },
  });
}
