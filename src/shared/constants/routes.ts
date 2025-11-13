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

  // Attendance Domain
  ATTENDANCE: '/attendance',
  LEAVE_REQUESTS: '/leave-requests',
  OVERTIME_REQUEST: '/overtime/request',
  OVERTIME_LIST: '/overtime/list',
  OVERTIME_APPROVAL: '/overtime/approval',
  OVERTIME_DASHBOARD: '/overtime/dashboard',

  // Payroll Domain
  PAYROLL: '/payroll',
  PAYROLL_RUNS: '/payroll/runs',

  // System Domain
  SETTINGS: '/settings',
  SETTINGS_ORGANIZATION: '/settings/organization',
  SETTINGS_DEPARTMENTS: '/settings/departments',
  SETTINGS_POSITIONS: '/settings/positions',
  SETTINGS_LOCATIONS: '/settings/locations',
  SETTINGS_PAYROLL: '/settings/payroll',
  SETTINGS_SYSTEM: '/settings/system',
  USERS: '/users',
  ROLES: '/roles',
  PERMISSIONS: '/permissions',
  AUDIT_LOGS: '/audit-logs',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
