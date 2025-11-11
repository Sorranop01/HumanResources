/**
 * Cloud Functions for HumanResources
 * Region: asia-southeast1 (MANDATORY)
 */

export { createEmployee } from './api/employees/createEmployee.js';
// Employee functions
export { getEmployees } from './api/employees/getEmployees.js';
// RBAC functions
export {
  assignUserRole,
  checkPermission,
  checkUserPermission,
  revokeUserRole,
} from './api/rbac/index.js';
// Role management functions
export {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
} from './api/roles/index.js';
// User management functions
export { createUser } from './api/users/createUser.js';

// Payroll functions
export { calculatePayroll } from './api/payroll/calculatePayroll.js';
export { generateMonthlyPayroll } from './api/payroll/generateMonthlyPayroll.js';

// Firestore Triggers - Audit Logging & Data Sync
export {
  onRoleDefinitionCreate,
  onRoleDefinitionUpdate,
  onRoleDefinitionWrite,
  onUserWrite,
} from './triggers/index.js';

// TODO: Add more functions
// - Attendance functions
// - Scheduled functions
