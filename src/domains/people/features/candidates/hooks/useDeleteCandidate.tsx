import { ExclamationCircleFilled } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Modal } from 'antd';
import { candidateKeys, candidateService } from '../services/candidateService';

const { confirm } = Modal;

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const mutation = useMutation({
    mutationFn: (id: string) => candidateService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: candidateKeys.stats() });
      void message.success('ลบผู้สมัครสำเร็จ');
    },
    onError: (error: Error) => {
      void message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    },
  });

  const deleteWithConfirm = (id: string, candidateName: string) => {
    confirm({
      title: 'ยืนยันการลบข้อมูลผู้สมัคร',
      icon: <ExclamationCircleFilled />,
      content: `คุณต้องการลบข้อมูลของ "${candidateName}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      okText: 'ยืนยัน',
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
};
