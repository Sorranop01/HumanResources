import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { authService } from '../services/authService';

export function useLogout() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      message.success('ออกจากระบบสำเร็จ');
      navigate(ROUTES.LOGIN);
    },
    onError: (error: Error) => {
      message.error(`ออกจากระบบไม่สำเร็จ: ${error.message}`);
    },
  });
}
