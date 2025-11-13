import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/app/layouts';
// Payroll Pages
import { PayrollPage, PayrollRunsPage } from '@/domains/payroll';
// People Pages
import { AttendancePage } from '@/domains/people/features/attendance';
import { CandidatesPage } from '@/domains/people/features/candidates';
import {
  EmployeeCreatePage,
  EmployeeDetailPage,
  EmployeeEditPage,
  EmployeeListPage,
} from '@/domains/people/features/employees';
import { LeaveRequestPage } from '@/domains/people/features/leave';
import {
  OvertimeApprovalPage,
  OvertimeDashboardPage,
  OvertimeListPage,
  OvertimeRequestPage,
} from '@/domains/people/features/overtime';
// Auth Pages
import { ForgotPasswordPage } from '@/domains/system/features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/domains/system/features/auth/pages/LoginPage';
import { RegisterPage } from '@/domains/system/features/auth/pages/RegisterPage';
// Dashboard Page
import { DashboardPage } from '@/domains/system/features/dashboard';
// System Pages
import { AuditLogsPage, PermissionMatrixPage, RolesPage } from '@/domains/system/features/rbac';
import { SettingsPage } from '@/domains/system/features/settings';
import { DepartmentsPage } from '@/domains/system/features/settings/departments/pages/DepartmentsPage';
import { LocationsPage } from '@/domains/system/features/settings/locations/pages/LocationsPage';
import { OrganizationSettingsPage } from '@/domains/system/features/settings/organization/pages/OrganizationSettingsPage';
import { PayrollSettingsPage } from '@/domains/system/features/settings/payroll/pages/PayrollSettingsPage';
import { PositionsPage } from '@/domains/system/features/settings/positions/pages/PositionsPage';
import { SystemConfigPage } from '@/domains/system/features/settings/system/pages/SystemConfigPage';
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
        path={ROUTES.EMPLOYEE_CREATE}
        element={
          <ProtectedRoute>
            <AppLayout>
              <EmployeeCreatePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.EMPLOYEE_DETAIL}
        element={
          <ProtectedRoute>
            <AppLayout>
              <EmployeeDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id/edit"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EmployeeEditPage />
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
      <Route
        path={ROUTES.LEAVE_REQUESTS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <LeaveRequestPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.OVERTIME_REQUEST}
        element={
          <ProtectedRoute>
            <AppLayout>
              <OvertimeRequestPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.OVERTIME_LIST}
        element={
          <ProtectedRoute>
            <AppLayout>
              <OvertimeListPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.OVERTIME_APPROVAL}
        element={
          <ProtectedRoute>
            <AppLayout>
              <OvertimeApprovalPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.OVERTIME_DASHBOARD}
        element={
          <ProtectedRoute>
            <AppLayout>
              <OvertimeDashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Payroll Routes */}
      <Route
        path={ROUTES.PAYROLL}
        element={
          <ProtectedRoute>
            <AppLayout>
              <PayrollPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PAYROLL_RUNS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <PayrollRunsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

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
        path={ROUTES.PERMISSIONS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <PermissionMatrixPage />
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
      <Route
        path={ROUTES.SETTINGS_ORGANIZATION}
        element={
          <ProtectedRoute>
            <AppLayout>
              <OrganizationSettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS_DEPARTMENTS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <DepartmentsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS_POSITIONS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <PositionsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS_LOCATIONS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <LocationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS_PAYROLL}
        element={
          <ProtectedRoute>
            <AppLayout>
              <PayrollSettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS_SYSTEM}
        element={
          <ProtectedRoute>
            <AppLayout>
              <SystemConfigPage />
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
