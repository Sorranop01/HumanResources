/**
 * Application route paths
 */
export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard
  DASHBOARD: '/dashboard',

  // People Domain
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAIL: '/employees/:id',
  EMPLOYEE_CREATE: '/employees/create',
  CANDIDATES: '/candidates',
  POSITIONS: '/positions',
  POSITION_DETAIL: '/positions/:id',
  POSITION_CREATE: '/positions/create',
  POSITION_EDIT: '/positions/:id/edit',
  POSITION_ORG_CHART: '/positions/org-chart',

  // Attendance Domain
  ATTENDANCE: '/attendance',
  LEAVE_REQUESTS: '/leave-requests',

  // Payroll Domain
  PAYROLL: '/payroll',
  PAYROLL_RUNS: '/payroll/runs',

  // System Domain
  SETTINGS: '/settings',
  USERS: '/users',
  ROLES: '/roles',
  PERMISSIONS: '/permissions',
  AUDIT_LOGS: '/audit-logs',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
