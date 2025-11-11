import { Card, Typography } from 'antd';
import { Navigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';

const { Title, Paragraph } = Typography;

export function RegisterPage() {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '24px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>
            สมัครสมาชิก
          </Title>
          <Paragraph type="secondary">สร้างบัญชีใหม่สำหรับใช้งานระบบ</Paragraph>
        </div>

        <RegisterForm />
      </Card>
    </div>
  );
}
