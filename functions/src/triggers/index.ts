/**
 * Cloud Functions Triggers
 * Export all Firestore triggers for automatic audit logging and data sync
 */

export { syncDepartmentName } from './departmentDenormalizationTrigger.js';
// Denormalization sync triggers (HR Data)
export { syncEmployeeDenormalizedFields } from './employeeDenormalizationTrigger.js';
export { syncLeaveTypeName } from './leaveTypeDenormalizationTrigger.js';
export { syncPositionName } from './positionDenormalizationTrigger.js';
// Denormalization sync triggers (RBAC)
export { onRoleDefinitionCreate, onRoleDefinitionUpdate } from './roleDefinitionSyncTrigger.js';
export { syncRolePermissionsToRoleDefinitions } from './rolePermissionDenormalizationTrigger.js';
export { onRoleDefinitionWrite } from './rolesAuditTrigger.js';

// Audit triggers
export { onUserWrite } from './usersAuditTrigger.js';
