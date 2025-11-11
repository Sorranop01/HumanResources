import { ExclamationCircleFilled } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Modal } from 'antd';
import { employeeKeys, employeeService } from '../services/employeeService';

const { confirm } = Modal;

/**
 * Hook to delete an employee (soft delete by default)
 * Shows confirmation dialog before deletion
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const mutation = useMutation({
    mutationFn: ({ id, hard = false }: { id: string; hard?: boolean }) => {
      if (hard) {
        return employeeService.delete(id);
      }
      return employeeService.softDelete(id);
    },

    onSuccess: (_, { hard }) => {
      // Invalidate all employee queries
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });

      const successMessage = hard
        ? 'ลบข้อมูลพนักงานถาวรสำเร็จ'
        : 'ลบข้อมูลพนักงานสำเร็จ (สถานะเปลี่ยนเป็น terminated)';

      void message.success(successMessage);
    },

    onError: (error: Error, { hard }) => {
      const errorMessage = hard
        ? `ลบข้อมูลถาวรไม่สำเร็จ: ${error.message}`
        : `ลบข้อมูลไม่สำเร็จ: ${error.message}`;

      void message.error(errorMessage);
    },
  });

  /**
   * Show confirmation dialog and delete if confirmed
   */
  const deleteWithConfirm = (id: string, employeeName: string, hard = false): void => {
    confirm({
      title: hard ? 'ยืนยันการลบข้อมูลถาวร' : 'ยืนยันการลบข้อมูลพนักงาน',
      icon: <ExclamationCircleFilled />,
      content: hard
        ? `คุณต้องการลบข้อมูล "${employeeName}" ออกจากระบบถาวรใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`
        : `คุณต้องการลบข้อมูล "${employeeName}" ใช่หรือไม่? สถานะจะเปลี่ยนเป็น "เลิกจ้าง"`,
      okText: 'ยืนยัน',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk() {
        mutation.mutate({ id, hard });
      },
    });
  };

  return {
    ...mutation,
    deleteWithConfirm,
  };
}
