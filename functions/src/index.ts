/**
 * Cloud Functions for HumanResources
 * Region: asia-southeast1 (MANDATORY)
 */

// Employee functions
export { createEmployee } from './api/employees/createEmployee.js';
export { getEmployees } from './api/employees/getEmployees.js';
// Candidate functions
export {
  createCandidate,
  moveToEmployee,
  updateCandidateStatus,
} from './api/candidates/index.js';
// Attendance functions
export {
  approveAttendance,
  clockIn,
  clockOut,
  manualAttendanceEntry,
} from './api/attendance/index.js';
// Leave functions
export {
  approveLeaveRequest,
  createLeaveRequest,
  rejectLeaveRequest,
} from './api/leave/index.js';
// Payroll functions
export { calculatePayroll } from './api/payroll/calculatePayroll.js';
export { generateMonthlyPayroll } from './api/payroll/generateMonthlyPayroll.js';
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

// Firestore Triggers - Audit Logging & Data Sync
export {
  // RBAC Triggers
  onRoleDefinitionCreate,
  onRoleDefinitionUpdate,
  onRoleDefinitionWrite,
  onUserWrite,
  syncDepartmentName,
  // Denormalization Sync Triggers
  syncEmployeeDenormalizedFields,
  syncPositionName,
} from './triggers/index.js';

// TODO: Add more functions
// - Attendance functions
// - Scheduled functions
