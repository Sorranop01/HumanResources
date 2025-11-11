import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/app/layouts';
// People Pages
import { AttendancePage } from '@/domains/people/features/attendance';
import { CandidatesPage } from '@/domains/people/features/candidates';
import { EmployeeListPage } from '@/domains/people/features/employees';
// import { LeaveRequestPage } from '@/domains/people/features/leave';
// Auth Pages
import { ForgotPasswordPage } from '@/domains/system/features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/domains/system/features/auth/pages/LoginPage';
import { RegisterPage } from '@/domains/system/features/auth/pages/RegisterPage';
// Dashboard Page
import { DashboardPage } from '@/domains/system/features/dashboard';
// System Pages
import { AuditLogsPage, RolesPage } from '@/domains/system/features/rbac';
import { SettingsPage } from '@/domains/system/features/settings';
import { UserManagementPage } from '@/domains/system/features/users';
import { ROUTES } from '@/shared/constants/routes';
import { ProtectedRoute } from './components/ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

      {/* Protected Routes with Layout */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* People Domain Routes */}
      <Route
        path={ROUTES.EMPLOYEES}
        element={
          <ProtectedRoute>
            <AppLayout>
              <EmployeeListPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CANDIDATES}
        element={
          <ProtectedRoute>
            <AppLayout>
              <CandidatesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ATTENDANCE}
        element={
          <ProtectedRoute>
            <AppLayout>
              <AttendancePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      {/* TODO: Implement LeaveRequestPage */}
      {/* <Route
        path={ROUTES.LEAVE_REQUESTS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <LeaveRequestPage />
            </AppLayout>
          </ProtectedRoute>
        }
      /> */}

      {/* System Routes */}
      <Route
        path={ROUTES.USERS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <UserManagementPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ROLES}
        element={
          <ProtectedRoute>
            <AppLayout>
              <RolesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.AUDIT_LOGS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <AuditLogsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
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
