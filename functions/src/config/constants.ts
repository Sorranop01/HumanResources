/**
 * Cloud Functions configuration constants
 */

// MANDATORY: All functions must use this region
export const REGION = 'asia-southeast1';

// CORS configuration
export const CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://hr-dev.web.app',
  'https://hr-staging.web.app',
  'https://hr-prod.web.app',
];

// Rate limiting
export const RATE_LIMITS = {
  AUTH: {
    MAX_REQUESTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  API: {
    MAX_REQUESTS: 60,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  REPORTS: {
    MAX_REQUESTS: 5,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
};

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendance',
  LEAVE_REQUESTS: 'leave-requests',
  PAYROLL_RUNS: 'payroll-runs',
  AUDIT_LOGS: 'audit-logs',
  SETTINGS: 'settings',
  ROLES: 'roles',
} as const;
