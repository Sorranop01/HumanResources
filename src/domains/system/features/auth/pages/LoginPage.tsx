import { Card, Typography } from 'antd';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

const { Title, Paragraph } = Typography;

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Get the page user was trying to access before login
  const from = (location.state as { from?: Location })?.from?.pathname || ROUTES.DASHBOARD;

  // If already authenticated, redirect to intended page
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
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
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>
            ระบบบริหารทรัพยากรบุคคล
          </Title>
          <Paragraph type="secondary">เข้าสู่ระบบเพื่อดำเนินการต่อ</Paragraph>
        </div>

        <LoginForm />
      </Card>
    </div>
  );
}
