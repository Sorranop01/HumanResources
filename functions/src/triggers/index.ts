/**
 * Cloud Functions Triggers
 * Export all Firestore triggers for automatic audit logging and data sync
 */

// Denormalization sync triggers
export { onRoleDefinitionCreate, onRoleDefinitionUpdate } from './roleDefinitionSyncTrigger.js';
export { onRoleDefinitionWrite } from './rolesAuditTrigger.js';
// Audit triggers
export { onUserWrite } from './usersAuditTrigger.js';
