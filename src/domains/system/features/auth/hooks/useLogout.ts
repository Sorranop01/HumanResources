import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authService } from '../services/authService';
import { ROUTES } from '@/shared/constants/routes';

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
