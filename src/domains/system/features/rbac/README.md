# RBAC (Role-Based Access Control) Feature

ระบบจัดการสิทธิ์และบทบาทที่สมบูรณ์แบบสำหรับ HumanResources Admin System

## 📋 Overview

ระบบ RBAC นี้ประกอบด้วย:
- **8-Tier Role System**: Admin, HR, Manager, Employee, Auditor
- **Resource-Based Permissions**: CRUD permissions สำหรับทุก resource
- **Dynamic Role Assignment**: การมอบหมายบทบาทแบบ dynamic พร้อม expiration
- **Audit Logging**: บันทึกการเปลี่ยนแปลงทั้งหมด
- **Permission Guards**: Components และ HOCs สำหรับป้องกัน UI

## 🏗️ Architecture

```
rbac/
├── types/              # Type definitions
├── schemas/            # Zod validation schemas
├── services/           # Firestore operations
│   ├── roleService.ts
│   ├── permissionService.ts
│   ├── userRoleService.ts
│   └── auditLogService.ts
├── hooks/              # TanStack Query hooks
│   ├── useRoles.ts
│   ├── usePermissions.ts
│   ├── useUserRoles.ts
│   └── useAuditLogs.ts
├── components/         # UI components & guards
│   ├── PermissionGuard.tsx
│   ├── withPermission.tsx
│   └── RoleTag.tsx
├── utils/              # Utility functions
│   └── checkPermission.ts
└── index.ts            # Public API
```

## 🚀 Quick Start

### 1. ใช้งาน Permission Hooks

```typescript
import { usePermission } from '@/domains/system/features/rbac';

function MyComponent() {
  const { hasPermission, canAccessResource } = usePermission();

  if (!hasPermission('employees', 'create')) {
    return <div>No permission</div>;
  }

  return <div>Can create employees</div>;
}
```

### 2. ใช้งาน Permission Guards

```typescript
import { PermissionGuard } from '@/domains/system/features/rbac';

function EmployeeList() {
  return (
    <div>
      <h1>Employees</h1>

      <PermissionGuard resource="employees" permission="create">
        <button>Create Employee</button>
      </PermissionGuard>

      <PermissionGuard
        resource="employees"
        permission="delete"
        fallback={<span>You cannot delete</span>}
      >
        <button>Delete Employee</button>
      </PermissionGuard>
    </div>
  );
}
```

### 3. ใช้งาน HOCs (Higher-Order Components)

```typescript
import { withPermission } from '@/domains/system/features/rbac';

function CreateEmployeePage() {
  return <div>Create Employee Form</div>;
}

// Protect the entire page
export default withPermission(CreateEmployeePage, {
  resource: 'employees',
  permission: 'create',
  redirectTo: '/unauthorized',
});
```

### 4. ใช้งาน Role Guards

```typescript
import { RoleGuard } from '@/domains/system/features/rbac';
import { ROLES } from '@/shared/constants/roles';

function AdminPanel() {
  return (
    <RoleGuard roles={[ROLES.ADMIN, ROLES.HR]}>
      <div>Admin content here</div>
    </RoleGuard>
  );
}
```

## 📊 Permission Matrix

### Admin
- **All Resources**: Full CRUD access
- **Audit Logs**: Read only

### HR
- **Employees**: Create, Read, Update
- **Attendance**: Read, Update
- **Leave Requests**: Read, Update
- **Payroll**: Full CRUD
- **Audit Logs**: Read only

### Manager
- **Employees**: Read only
- **Attendance**: Read, Update
- **Leave Requests**: Read, Update

### Employee
- **Employees**: Read only
- **Attendance**: Read, Create (own)
- **Leave Requests**: Read, Create (own)

### Auditor
- **All Resources**: Read only
- **Audit Logs**: Read only

## 🔧 Services Usage

### Role Service

```typescript
import { roleService } from '@/domains/system/features/rbac';

// Get all roles
const roles = await roleService.getAllRoles();

// Create role
const newRole = await roleService.createRole({
  role: 'custom-role',
  name: 'บทบาทพิเศษ',
  description: 'คำอธิบายบทบาทและหน้าที่ความรับผิดชอบ',
}, userId);

// Update role
await roleService.updateRole(roleId, {
  name: 'ชื่อใหม่',
}, userId);
```

### Permission Service

```typescript
import { permissionService } from '@/domains/system/features/rbac';

// Get permissions by role
const permissions = await permissionService.getPermissionsByRole('hr');

// Assign permission
await permissionService.assignRolePermission({
  role: 'manager',
  resource: 'payroll',
  permissions: ['read'],
}, userId, roleId);

// Check permission
const hasPermission = await permissionService.checkRolePermission(
  'employee',
  'attendance',
  'create'
);
```

### User Role Service

```typescript
import { userRoleService } from '@/domains/system/features/rbac';

// Assign role to user
await userRoleService.assignUserRole({
  userId: 'user123',
  role: 'hr',
  reason: 'Promoted to HR',
}, assignedByUser);

// Revoke role
await userRoleService.revokeUserRole({
  userId: 'user123',
  reason: 'Left company',
}, revokedByUserId);

// Get active role
const assignment = await userRoleService.getActiveUserRoleAssignment('user123');
```

## 🪝 Hooks Usage

### useRoles

```typescript
import { useRoles, useActiveRoles } from '@/domains/system/features/rbac';

function RoleList() {
  const { data: roles, isLoading } = useRoles();
  const { data: activeRoles } = useActiveRoles();

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {roles?.map(role => <li key={role.id}>{role.name}</li>)}
    </ul>
  );
}
```

### useUserRoles

```typescript
import {
  useAssignUserRole,
  useRevokeUserRole
} from '@/domains/system/features/rbac';

function UserRoleManager() {
  const assignMutation = useAssignUserRole();
  const revokeMutation = useRevokeUserRole();

  const handleAssign = () => {
    assignMutation.mutate({
      data: {
        userId: 'user123',
        role: 'hr',
      },
      assignedByUser: {
        id: currentUserId,
        email: currentUserEmail,
        displayName: currentUserName,
      },
    });
  };

  return <button onClick={handleAssign}>Assign Role</button>;
}
```

## 🔐 Cloud Functions

### assignUserRole

```typescript
// Client-side
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const assignUserRole = httpsCallable(functions, 'assignUserRole');

await assignUserRole({
  userId: 'user123',
  role: 'hr',
  reason: 'Promotion',
});
```

### revokeUserRole

```typescript
const revokeUserRole = httpsCallable(functions, 'revokeUserRole');

await revokeUserRole({
  userId: 'user123',
  reason: 'Left company',
});
```

### checkPermission

```typescript
const checkPermission = httpsCallable(functions, 'checkPermission');

const result = await checkPermission({
  resource: 'employees',
  permission: 'create',
});

console.log(result.data.hasPermission); // true/false
```

## 📝 Firestore Collections

### roleDefinitions
```typescript
{
  id: string;
  role: Role;
  name: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### permissionDefinitions
```typescript
{
  id: string;
  resource: Resource;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### rolePermissions
```typescript
{
  id: string;
  roleId: string;
  role: Role;
  resource: Resource;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### userRoleAssignments
```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  role: Role;
  assignedBy: string;
  isActive: boolean;
  expiresAt?: Timestamp;
  reason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### rbacAuditLogs
```typescript
{
  id: string;
  action: 'ROLE_ASSIGNED' | 'ROLE_REVOKED' | ...;
  performedBy: string;
  performedByEmail: string;
  targetUserId?: string;
  targetUserEmail?: string;
  role?: Role;
  resource?: Resource;
  permissions?: Permission[];
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
}
```

## 🎨 Component Examples

### Multiple Permissions

```typescript
import { MultiPermissionGuard } from '@/domains/system/features/rbac';

<MultiPermissionGuard
  permissions={[
    { resource: 'employees', permission: 'update' },
    { resource: 'payroll', permission: 'read' },
  ]}
  requireAll={false} // Any permission is enough
>
  <button>Advanced Action</button>
</MultiPermissionGuard>
```

### Resource Access

```typescript
import { ResourceAccessGuard } from '@/domains/system/features/rbac';

<ResourceAccessGuard resource="payroll">
  <PayrollDashboard />
</ResourceAccessGuard>
```

## 🔄 Migration & Seeding

ในอนาคต ควรสร้าง seeding scripts สำหรับ:
1. Initialize default roles
2. Initialize permission definitions
3. Assign default permissions to roles

## 🧪 Testing

```typescript
// Test permission check
import { checkPermission } from '@/domains/system/features/rbac/utils/checkPermission';

const hasPermission = checkPermission('admin', 'employees', 'delete');
expect(hasPermission).toBe(true);
```

## 📚 Best Practices

1. **Always use guards for UI**: ใช้ `PermissionGuard` หรือ HOCs เสมอ
2. **Check permissions in services**: ตรวจสอบสิทธิ์ใน backend ด้วย
3. **Log all changes**: ใช้ audit logging ทุกครั้งที่มีการเปลี่ยนแปลง
4. **Use TanStack Query**: ใช้ hooks ที่มี caching แทน direct service calls
5. **Handle errors gracefully**: แสดง error messages ที่เหมาะสม

## 🔒 Security Notes

- ⚠️ **Never trust client-side checks**: Always validate on backend
- ✅ Use Cloud Functions for critical operations
- ✅ Implement Firestore Security Rules
- ✅ Log all permission changes
- ✅ Regularly audit role assignments

## 🚧 Future Enhancements

- [ ] Dynamic permission creation
- [ ] Permission groups/bundles
- [ ] Time-based permissions
- [ ] Context-based permissions (own data vs all data)
- [ ] Permission delegation
- [ ] Advanced audit analytics

## 📞 Support

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนา
