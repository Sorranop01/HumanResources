import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Modal } from 'antd';
import {
  positionKeys,
  positionService,
} from '@/domains/people/features/positions/services/positionService';

/**
 * Hook to delete a position
 */
export function useDeletePosition() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const mutation = useMutation({
    mutationFn: (id: string) => positionService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: positionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: positionKeys.orgChart() });
      void queryClient.invalidateQueries({ queryKey: positionKeys.stats() });
      void message.success('ลบตำแหน่งสำเร็จ');
    },
    onError: (error: Error) => {
      void message.error(`ลบตำแหน่งไม่สำเร็จ: ${error.message}`);
    },
  });

  const deleteWithConfirm = (id: string, positionName: string) => {
    Modal.confirm({
      title: 'ยืนยันการลบตำแหน่ง',
      icon: <ExclamationCircleOutlined />,
      content: `คุณแน่ใจหรือไม่ว่าต้องการลบตำแหน่ง "${positionName}" การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: () => {
        mutation.mutate(id);
      },
    });
  };

  return {
    ...mutation,
    deleteWithConfirm,
  };
}
