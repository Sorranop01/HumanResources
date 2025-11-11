/**
 * useDeleteRole Hook (Cloud Functions)
 * Deletes a custom role via Cloud Functions (admin-only)
 *
 * Per docs/standards/07-firestore-data-modeling-ai.md:
 * "Privileged write (admin-only) → Cloud Functions"
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, message } from 'antd';
import * as roleCloudFunctionService from '../services/roleCloudFunctionService';
import { roleKeys } from './useRoles';

export function useDeleteRoleCloudFunction() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (roleId: string) => roleCloudFunctionService.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      message.success('ลบบทบาทสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Failed to delete role:', error);
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถลบบทบาทได้';
      message.error(errorMessage);
    },
  });

  const confirmDelete = (roleId: string, roleName: string, isSystemRole: boolean) => {
    if (isSystemRole) {
      message.warning('ไม่สามารถลบบทบาทของระบบได้');
      return;
    }

    Modal.confirm({
      title: 'ยืนยันการลบบทบาท',
      content: (
        <div>
          <p>
            คุณต้องการลบบทบาท <strong>"{roleName}"</strong> หรือไม่?
          </p>
          <p className="text-gray-500 text-sm mt-2">หมายเหตุ: ไม่สามารถลบบทบาทที่มีผู้ใช้งานอยู่ได้</p>
        </div>
      ),
      okText: 'ลบ',
      cancelText: 'ยกเลิก',
      okButtonProps: { danger: true },
      onOk: () => mutation.mutate(roleId),
    });
  };

  return {
    ...mutation,
    confirmDelete,
  };
}
