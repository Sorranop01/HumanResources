/**
 * useUpdateRole Hook (Cloud Functions)
 * Updates an existing custom role via Cloud Functions (admin-only)
 *
 * Per docs/standards/07-firestore-data-modeling-ai.md:
 * "Privileged write (admin-only) → Cloud Functions"
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { UpdateRoleInput } from '../services/roleCloudFunctionService';
import * as roleCloudFunctionService from '../services/roleCloudFunctionService';
import { roleKeys } from './useRoles';

export type { UpdateRoleInput };

export function useUpdateRoleCloudFunction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRoleInput) => roleCloudFunctionService.updateRole(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      message.success('อัพเดตบทบาทสำเร็จ และจะ sync ชื่อบทบาทไปยัง users โดยอัตโนมัติ');
    },
    onError: (error: unknown) => {
      console.error('Failed to update role:', error);
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถอัพเดตบทบาทได้';
      message.error(errorMessage);
    },
  });
}
