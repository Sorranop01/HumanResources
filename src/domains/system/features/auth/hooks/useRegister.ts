import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authService, getAuthErrorMessage, type RegisterData } from '../services/authService';
import { ROUTES } from '@/shared/constants/routes';

export function useRegister() {
  const navigate = useNavigate();

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
