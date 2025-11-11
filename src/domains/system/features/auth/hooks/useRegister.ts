import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { authService, getAuthErrorMessage, type RegisterData } from '../services/authService';

export function useRegister() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: () => {
      message.success('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ');
      navigate(ROUTES.LOGIN);
    },
    onError: (error: unknown) => {
      const errorMessage = getAuthErrorMessage(error);
      message.error(`สมัครสมาชิกไม่สำเร็จ: ${errorMessage}`);
    },
  });
}
