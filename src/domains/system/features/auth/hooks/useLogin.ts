import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authService, getAuthErrorMessage, type LoginCredentials } from '../services/authService';
import { ROUTES } from '@/shared/constants/routes';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: () => {
      message.success('เข้าสู่ระบบสำเร็จ');
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error: unknown) => {
      const errorMessage = getAuthErrorMessage(error);
      message.error(`เข้าสู่ระบบไม่สำเร็จ: ${errorMessage}`);
    },
  });
}
