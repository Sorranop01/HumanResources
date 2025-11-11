import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { LoginPage } from '@/domains/system/features/auth/pages/LoginPage';
import { RegisterPage } from '@/domains/system/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/domains/system/features/auth/pages/ForgotPasswordPage';

// Temporary placeholder pages
function DashboardPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Dashboard</h1>
      <p>Welcome to HumanResources Admin System</p>
      <p>You are now logged in!</p>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

      {/* Protected Routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <h1>404 - ไม่พบหน้าที่ต้องการ</h1>
            <p>ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา</p>
          </div>
        }
      />
    </Routes>
  );
}
