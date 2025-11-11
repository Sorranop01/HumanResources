import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { authService, getAuthErrorMessage, type LoginCredentials } from '../services/authService';

export function useLogin() {
  const navigate = useNavigate();
  const { message } = App.useApp();

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
