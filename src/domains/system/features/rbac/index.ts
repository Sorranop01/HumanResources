/**
 * RBAC Feature - Public API
 * Export all public APIs from the RBAC feature
 */

// Components
export * from './components/ActionGuard';
export * from './components/AssignRoleModal';
export * from './components/EditPermissionModal';
export * from './components/PermissionGate';
export * from './components/PermissionGuard';
export * from './components/PermissionMatrixTable';
export * from './components/RoleHistoryTable';
export * from './components/RoleTag';
export * from './components/RouteGuard';
export * from './components/UserRoleCard';
export * from './components/withPermission';
// Hooks
export * from './hooks/useActionPermission';
export * from './hooks/useAuditLogs';
export * from './hooks/useCreateRole';
export * from './hooks/useDeleteRole';
export * from './hooks/useEffectiveRole';
export * from './hooks/usePermission';
export * from './hooks/usePermissions';
export * from './hooks/useRoles';
export * from './hooks/useRolesCloudFunction';
export * from './hooks/useRoutePermission';
export * from './hooks/useUpdateRole';
export * from './hooks/useUserRoleManagement';
export * from './hooks/useUserRoles';
export { AuditLogsPage } from './pages/AuditLogsPage';
// Pages
export { PermissionMatrixPage } from './pages/PermissionMatrixPage';
export { RolesPage } from './pages/RolesPage';
// Schemas
export * from './schemas/rbacSchemas';
export * as auditLogService from './services/auditLogService';
export * as effectiveRoleService from './services/effectiveRoleService';
export * as permissionDefinitionService from './services/permissionDefinitionService';
export * as permissionService from './services/permissionService';
export * as roleCloudFunctionService from './services/roleCloudFunctionService';
// Services
export * as roleService from './services/roleService';
export * as userRoleService from './services/userRoleService';
// Types
export type * from './types/rbacTypes';
// Utils
export * from './utils/actionPermissions';
export * from './utils/checkPermission';
export * from './utils/denormalization';
export * from './utils/routePermissions';
