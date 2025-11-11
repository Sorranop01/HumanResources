# RBAC Quick Start Guide

## 🎯 สิ่งที่คุณต้องรู้ทันที

### 1. เช็คสิทธิ์ในคอมโพเนนต์

```tsx
import { usePermission } from '@/domains/system/features/rbac';

function MyComponent() {
  const { hasPermission } = usePermission();

  return (
    <div>
      {hasPermission('employees', 'create') && (
        <button>Create Employee</button>
      )}
    </div>
  );
}
```

### 2. ซ่อน/แสดง UI ตาม Permission

```tsx
import { PermissionGuard } from '@/domains/system/features/rbac';

<PermissionGuard resource="employees" permission="delete">
  <button>Delete</button>
</PermissionGuard>
```

### 3. ป้องกันทั้งหน้า (Page Protection)

```tsx
import { withPermission } from '@/domains/system/features/rbac';

function EmployeeCreatePage() {
  return <div>Create Form</div>;
}

export default withPermission(EmployeeCreatePage, {
  resource: 'employees',
  permission: 'create',
  redirectTo: '/unauthorized',
});
```

### 4. เช็คหลายสิทธิ์พร้อมกัน

```tsx
import { MultiPermissionGuard } from '@/domains/system/features/rbac';

<MultiPermissionGuard
  permissions={[
    { resource: 'employees', permission: 'update' },
    { resource: 'payroll', permission: 'read' },
  ]}
  requireAll={false}
>
  <button>Advanced Action</button>
</MultiPermissionGuard>
```

### 5. เช็ค Role

```tsx
import { useRBAC } from '@/shared/hooks/useRBAC';

function AdminPanel() {
  const { isAdmin, isHR } = useRBAC();

  if (!isAdmin && !isHR) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
}
```

### 6. Assign Role ให้ User (Admin เท่านั้น)

```tsx
import { useAssignUserRole } from '@/domains/system/features/rbac';

function AssignRoleButton() {
  const { mutate: assignRole } = useAssignUserRole();

  const handleAssign = () => {
    assignRole({
      data: {
        userId: 'user123',
        role: 'hr',
        reason: 'Promotion',
      },
      assignedByUser: {
        id: currentUser.id,
        email: currentUser.email,
        displayName: currentUser.displayName,
      },
    });
  };

  return <button onClick={handleAssign}>Assign HR Role</button>;
}
```

## 📊 Permission Matrix (ที่ควรจำ)

| Role | Employees | Attendance | Leave | Payroll | Settings | Users | Audit |
|------|-----------|------------|-------|---------|----------|-------|-------|
| **Admin** | Full | Full | Full | Full | Full | Full | Read |
| **HR** | CRU | RU | RU | CRU | Read | Read | Read |
| **Manager** | Read | RU | RU | - | Read | - | - |
| **Employee** | Read | RC | RC | - | - | - | - |
| **Auditor** | Read | Read | Read | Read | - | - | Read |

**Legend**: C=Create, R=Read, U=Update, D=Delete

## 🔧 Cloud Functions (เรียกจาก Client)

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Assign Role
const assignUserRole = httpsCallable(functions, 'assignUserRole');
await assignUserRole({ userId: 'user123', role: 'hr' });

// Revoke Role
const revokeUserRole = httpsCallable(functions, 'revokeUserRole');
await revokeUserRole({ userId: 'user123' });

// Check Permission
const checkPermission = httpsCallable(functions, 'checkPermission');
const result = await checkPermission({
  resource: 'employees',
  permission: 'create',
});
```

## 🎨 Common Patterns

### Pattern 1: Conditional Rendering

```tsx
const { hasPermission } = usePermission();

return (
  <div>
    {hasPermission('employees', 'read') && <EmployeeList />}
    {hasPermission('employees', 'create') && <CreateButton />}
  </div>
);
```

### Pattern 2: Disabled State

```tsx
const { hasPermission } = usePermission();

<button
  disabled={!hasPermission('employees', 'delete')}
  onClick={handleDelete}
>
  Delete
</button>
```

### Pattern 3: Role-Based Menu

```tsx
const { isAdmin, isHR, isManager } = useRBAC();

<Menu>
  {(isAdmin || isHR) && <MenuItem>User Management</MenuItem>}
  {(isAdmin || isHR || isManager) && <MenuItem>Attendance</MenuItem>}
  <MenuItem>Dashboard</MenuItem>
</Menu>
```

### Pattern 4: Fallback Message

```tsx
<PermissionGuard
  resource="payroll"
  permission="read"
  fallback={<Alert>You don't have access to payroll</Alert>}
>
  <PayrollDashboard />
</PermissionGuard>
```

## ⚠️ Important Notes

1. **Client-side checks are for UX only** - Always validate on backend
2. **Use hooks, not direct service calls** - TanStack Query handles caching
3. **Always handle loading states** - Check `isLoading` from hooks
4. **Log sensitive operations** - Audit logs are automatic
5. **Test permission changes** - Use staging environment first

## 🚨 Common Mistakes

❌ **Don't do this:**
```tsx
// Direct service call (no caching)
const roles = await roleService.getAllRoles();

// No loading state
const { data: roles } = useRoles();
return <div>{roles.map(...)}</div>; // roles might be undefined!

// Client-only validation
if (user.role === 'admin') {
  await deleteUser(); // ❌ Not secure!
}
```

✅ **Do this instead:**
```tsx
// Use hooks (with caching)
const { data: roles, isLoading } = useRoles();

// Handle loading
if (isLoading) return <Spinner />;
if (!roles) return null;

// Always validate on backend
await deleteUserFunction({ userId }); // Cloud Function validates
```

## 📱 Quick Reference

```typescript
// Hooks
usePermission()           // Check permissions
useRoles()               // Get all roles
useUserRoles()           // User role assignments
useAuditLogs()           // Audit logs

// Components
<PermissionGuard />      // Guard single permission
<MultiPermissionGuard /> // Guard multiple permissions
<RoleGuard />           // Guard by role
<ResourceAccessGuard /> // Guard resource access

// HOCs
withPermission()        // Protect page with permission
withRole()             // Protect page with role
withResourceAccess()   // Protect page with resource access

// Services
roleService            // Role CRUD
permissionService      // Permission CRUD
userRoleService       // User role assignment
auditLogService       // Audit logs
```

## 🎓 Learn More

- [Full Documentation](./README.md)
- [Type Definitions](./types/rbacTypes.ts)
- [Permission Matrix](./utils/checkPermission.ts)
