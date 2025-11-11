import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { authService, getAuthErrorMessage } from '../services/authService';

interface ForgotPasswordData {
  email: string;
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => authService.resetPassword(data.email),
    onSuccess: () => {
      message.success('ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ');
    },
    onError: (error: unknown) => {
      const errorMessage = getAuthErrorMessage(error);
      message.error(`ส่งอีเมลไม่สำเร็จ: ${errorMessage}`);
    },
  });
}
