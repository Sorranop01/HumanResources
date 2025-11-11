/**
 * Global configuration constants
 * Centralized place for app-wide configuration values
 */

export const APP_CONFIG = {
  name: 'Human Resources Management System',
  version: '1.0.0',
  description: 'HR Management System for employee, attendance, and payroll management',
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

export const DATE_FORMATS = {
  display: 'DD/MM/YYYY',
  displayWithTime: 'DD/MM/YYYY HH:mm',
  api: 'YYYY-MM-DD',
  apiWithTime: 'YYYY-MM-DDTHH:mm:ss',
} as const;

export const VALIDATION = {
  phoneNumber: {
    minLength: 9,
    maxLength: 10,
    pattern: /^[0-9]{9,10}$/,
  },
  password: {
    minLength: 6,
  },
  employeeCode: {
    pattern: /^EMP\d{5}$/,
  },
} as const;
