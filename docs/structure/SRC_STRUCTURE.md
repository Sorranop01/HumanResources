# Source Code Structure Documentation

**Version:** 1.0.0  
**Last Updated:** 2025-11-13  
**Path:** `/src`

> Complete documentation of the Human Resources Admin System's source code organization following Feature Sliced Design (FSD) architecture.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Domains](#domains)
4. [App Layer](#app-layer)
5. [Shared Layer](#shared-layer)
6. [File Organization Patterns](#file-organization-patterns)

---

## Overview

The `src/` directory is organized using **Feature Sliced Design (FSD)**, a scalable architecture pattern that separates concerns by business domain and feature layers. This ensures:

- **Modularity**: Each domain is self-contained and independently testable
- **Scalability**: Easy to add new features without affecting existing code
- **Maintainability**: Clear separation of concerns with consistent naming conventions
- **Discoverability**: Intuitive file locations based on feature purpose

### Architecture Layers

```
src/
├── app/              # Application root (routing, providers, global styles)
├── domains/          # Business logic (organized by HR domain)
├── shared/           # Cross-cutting concerns (utilities, UI, config)
└── Main entry point
```

---

## Directory Structure

### Root Level Files

```
src/
├── main.tsx          # Vite application entry point
├── env.ts            # Environment configuration interface
└── __tests__/        # Global test setup
    └── setup.ts
```

| File | Purpose |
|------|---------|
| `main.tsx` | Application bootstrap and React root mounting |
| `env.ts` | Type-safe environment variables interface |
| `__tests__/setup.ts` | Global test configuration (Vitest, mocks, etc.) |

---

## Domains

Business logic is organized into **5 main domains**, each containing features, hooks, services, and types.

### Domain Structure Pattern

Every domain follows this FSD-compliant structure:

```
domains/
└── {domain}/
    ├── features/
    │   └── {feature}/
    │       ├── components/      # UI components
    │       ├── hooks/           # React hooks
    │       ├── pages/           # Page-level components
    │       ├── services/        # API/Firestore services
    │       ├── schemas/         # Zod validation schemas
    │       ├── types/           # TypeScript types
    │       └── index.ts         # Public exports
    └── index.ts                 # Domain exports
```

---

## 📦 Domain: People

**Path:** `src/domains/people/`

Core employee management functionality.

### Features

#### 1. **Employees** (`src/domains/people/features/employees/`)

Employee CRUD operations and management.

**Components:**
- `EmployeeCard.tsx` - Card view for individual employees
- `EmployeeFilters.tsx` - Filter controls for employee list
- `EmployeeForm.tsx` - Basic employee form
- `EmployeeFormWizard.tsx` - Multi-step employee creation wizard
- `EmployeeTable.tsx` - Tabular employee list view
- `form-steps/` - Wizard step components
  - `PersonalInfoStep.tsx` - Name, contact, identifiers
  - `EmploymentInfoStep.tsx` - Position, department, start date
  - `CompensationStep.tsx` - Salary, benefits
  - `TaxSocialSecurityStep.tsx` - Tax ID, social security
  - `PasswordStep.tsx` - Initial password setup

**Hooks:**
- `useEmployees()` - Fetch all employees
- `useEmployee(id)` - Fetch single employee
- `useCreateEmployee()` - Create new employee
- `useUpdateEmployee()` - Update employee
- `useDeleteEmployee()` - Delete employee

**Services:**
- `employeeService.ts` - Firestore operations

**Pages:**
- `EmployeeListPage.tsx` - Employee list view
- `EmployeeDetailPage.tsx` - Employee detail/profile
- `EmployeeCreatePage.tsx` - Employee creation flow
- `EmployeeEditPage.tsx` - Employee editing

---

#### 2. **Attendance** (`src/domains/people/features/attendance/`)

Clock-in/out and attendance tracking.

**Components:**
- `ClockInOutCard.tsx` - Daily clock in/out interface
- `AttendanceHistoryTable.tsx` - Historical attendance records

**Hooks:**
- `useClockIn()` - Clock in action
- `useClockOut()` - Clock out action
- `useTodayAttendance()` - Today's attendance status
- `useAttendanceHistory()` - Historical records
- `useAttendanceStats()` - Attendance statistics
- `useMonthlyAttendance()` - Monthly summary
- `useValidateClockIn()` - Validate clock-in eligibility

**Services:**
- `attendanceService.ts` - Firestore attendance operations

**Pages:**
- `AttendancePage.tsx` - Main attendance dashboard

---

#### 3. **Leave Management** (`src/domains/people/features/leave/`)

Leave requests, approvals, and entitlements.

**Components:**
- `LeaveRequestForm.tsx` - Request form
- `LeaveRequestCard.tsx` - Request card display
- `LeaveRequestList.tsx` - List of requests
- `LeaveEntitlementCard.tsx` - Entitlement balance display

**Hooks:**
- `useLeaveRequests()` - Fetch requests
- `useLeaveRequest(id)` - Fetch single request
- `useCreateLeaveRequest()` - Create request
- `useUpdateLeaveRequest()` - Update request
- `useApproveLeaveRequest()` - Approve request
- `useRejectLeaveRequest()` - Reject request
- `useCancelLeaveRequest()` - Cancel request
- `useDeleteLeaveRequest()` - Delete request
- `useLeaveTypes()` - Fetch leave types
- `useLeaveType(id)` - Fetch single type
- `useLeaveEntitlements()` - Employee entitlements
- `useCreateLeaveEntitlement()` - Add entitlement
- `useUpdateLeaveBalance()` - Update balance

**Services:**
- `leaveRequestService.ts` - Leave request operations
- `leaveTypeService.ts` - Leave type management
- `leaveEntitlementService.ts` - Entitlement management

**Types:**
- `leaveRequest.ts` - Leave request type definitions
- `leaveType.ts` - Leave type definitions
- `leaveEntitlement.ts` - Entitlement type definitions

**Pages:**
- `LeaveRequestPage.tsx` - Leave management page

---

#### 4. **Candidates** (`src/domains/people/features/candidates/`)

Applicant Tracking System (ATS) for recruitment.

**Hooks:**
- `useCandidates()` - Fetch all candidates
- `useCandidate(id)` - Fetch single candidate
- `useCreateCandidate()` - Add new candidate
- `useUpdateCandidate()` - Update candidate
- `useDeleteCandidate()` - Delete candidate

**Services:**
- `candidateService.ts` - Firestore candidate operations

**Pages:**
- `CandidatesPage.tsx` - Candidate list view

---

#### 5. **Social Security** (`src/domains/people/features/socialSecurity/`)

Social security and contribution management.

**Components:**
- `SocialSecurityCard.tsx` - Display social security info
- `SocialSecurityForm.tsx` - Edit form

**Hooks:**
- `useSocialSecurity()` - Fetch employee's record
- `useCreateSocialSecurity()` - Create record
- `useUpdateSocialSecurity()` - Update record
- `useDeleteSocialSecurity()` - Delete record
- `useContributions()` - Fetch contributions

**Services:**
- `socialSecurityService.ts` - Firestore operations

---

## 💰 Domain: Payroll

**Path:** `src/domains/payroll/`

Salary processing and payroll operations.

### Features

#### **Payroll Management** (`src/domains/payroll/features/payroll/`)

**Components:** None currently

**Services:**
- `payrollService.ts` - Payroll calculations and processing

**Pages:**
- `PayrollPage.tsx` - Main payroll dashboard
- `PayrollRunsPage.tsx` - Payroll run history

---

## ⚙️ Domain: System

**Path:** `src/domains/system/`

Core system features: authentication, RBAC, dashboard, policies, and settings.

### Features

#### 1. **Authentication** (`src/domains/system/features/auth/`)

User authentication and account management.

**Components:**
- `LoginForm.tsx` - Login form
- `RegisterForm.tsx` - Registration form
- `ForgotPasswordForm.tsx` - Password recovery

**Hooks:**
- `useAuth()` - Current user/auth state
- `useLogin()` - Login action
- `useRegister()` - Registration action
- `useForgotPassword()` - Password recovery
- `useLogout()` - Logout action

**Services:**
- `authService.ts` - Firebase authentication
- `userService.ts` - User profile management

**Pages:**
- `LoginPage.tsx` - Login view
- `RegisterPage.tsx` - Registration view
- `ForgotPasswordPage.tsx` - Password recovery view

**Documentation:**
- `README.md` - Feature overview
- `QUICKSTART.md` - Getting started
- `SCHEMA.md` - Data schema
- `COLLECTIONS.md` - Firestore collections
- `TROUBLESHOOTING.md` - Common issues

**Scripts:**
- `initializeCollections.ts` - Initialize Firestore collections
- `seedUsers.ts` - Seed test users
- `syncProfiles.ts` - Sync user profiles

---

#### 2. **Dashboard** (`src/domains/system/features/dashboard/`)

Admin dashboard with overview and statistics.

**Components:**
- `DashboardStats.tsx` - Key metrics display
- `WelcomeSection.tsx` - Welcome message
- `QuickActions.tsx` - Quick action buttons
- `RecentActivities.tsx` - Recent system activity

**Hooks:**
- `useDashboardStats()` - Fetch dashboard statistics

**Pages:**
- `DashboardPage.tsx` - Main dashboard

---

#### 3. **RBAC** (`src/domains/system/features/rbac/`)

Role-Based Access Control system.

**Components:**
- `PermissionGuard.tsx` - Route/component permission wrapper
- `withPermission.tsx` - HOC for permission checking
- `RoleTag.tsx` - Role display badge
- `UserRoleCard.tsx` - User role card
- `PermissionMatrixTable.tsx` - Permission matrix view
- `RoleHistoryTable.tsx` - Role change audit trail
- `AssignRoleModal.tsx` - Assign role to user
- `CreateRoleModal.tsx` - Create new role
- `EditPermissionModal.tsx` - Edit permissions

**Hooks:**
- `usePermission(permission)` - Check single permission
- `usePermissions()` - Get all user permissions
- `useUserRoles()` - Get user roles
- `useRoles()` - Get all roles
- `useEffectiveRole()` - Get effective (highest) role
- `useCreateRole()` - Create role
- `useUpdateRole()` - Update role
- `useDeleteRole()` - Delete role
- `useUserRoleManagement()` - Manage user roles
- `useAuditLogs()` - Fetch RBAC audit logs
- `useRolesCloudFunction()` - Cloud function integration

**Services:**
- `roleService.ts` - Role management
- `permissionService.ts` - Permission management
- `userRoleService.ts` - User-role assignments
- `effectiveRoleService.ts` - Compute effective roles
- `auditLogService.ts` - RBAC audit logging
- `roleCloudFunctionService.ts` - Cloud function calls

**Pages:**
- `RolesPage.tsx` - Role management page
- `PermissionMatrixPage.tsx` - Permission matrix view
- `AuditLogsPage.tsx` - Audit log viewer

**Documentation:**
- `README.md` - RBAC overview
- `QUICK_START.md` - Quick setup guide

---

#### 4. **Policies** (`src/domains/system/features/policies/`)

HR policies: holidays, shifts, overtime, penalties, work schedules.

**Components:**
- `HolidayCalendarTable.tsx` - Holiday calendar view
- `ShiftManagementTable.tsx` - Shift management table
- `OvertimePolicyTable.tsx` - Overtime policies table
- `PenaltyPolicyTable.tsx` - Penalty policies table
- `WorkSchedulePolicyTable.tsx` - Work schedule policies table

**Hooks:**
- `useHolidays()` - Fetch holidays
- `useShifts()` - Fetch shifts
- `useOvertimePolicies()` - Fetch overtime policies
- `usePenaltyPolicies()` - Fetch penalty policies
- `useWorkSchedulePolicies()` - Fetch work schedule policies

**Services:**
- `holidayService.ts` - Holiday management
- `shiftService.ts` - Shift management
- `shiftAssignmentService.ts` - Shift assignments
- `overtimePolicyService.ts` - Overtime policy management
- `penaltyPolicyService.ts` - Penalty policy management
- `workSchedulePolicyService.ts` - Work schedule management

**Schemas:**
- `holidaySchema.ts` - Holiday validation
- `shiftSchema.ts` - Shift validation
- `overtimePolicySchema.ts` - Overtime policy validation
- `penaltyPolicySchema.ts` - Penalty policy validation
- `workSchedulePolicySchema.ts` - Work schedule validation

**Types:**
- `holiday.ts` - Holiday type definitions
- `shift.ts` - Shift type definitions
- `overtimePolicy.ts` - Overtime policy types
- `penaltyPolicy.ts` - Penalty policy types
- `workSchedulePolicy.ts` - Work schedule types

**Pages:**
- `PolicyListPage.tsx` - Policy management overview

---

#### 5. **Users** (`src/domains/system/features/users/`)

User account management (distinct from auth).

**Components:**
- `UserTable.tsx` - User list table
- `CreateUserModal.tsx` - Create user modal
- `EditUserModal.tsx` - Edit user modal

**Hooks:**
- `useUsers()` - Fetch all users

**Services:**
- `userManagementService.ts` - User management operations

**Pages:**
- `UsersPage.tsx` - User management page
- `UserManagementPage.tsx` - Alternative user management view

---

#### 6. **Settings** (`src/domains/system/features/settings/`)

Application settings and configuration.

**Pages:**
- `SettingsPage.tsx` - Settings page

---

## 🎨 App Layer

**Path:** `src/app/`

Global application configuration, routing, providers, and layout.

### Structure

```
app/
├── App.tsx              # Root component
├── layouts/             # Layout components
│   ├── AppLayout.tsx    # Main app layout wrapper
│   ├── AppHeader.tsx    # Application header
│   ├── AppSidebar.tsx   # Navigation sidebar
│   └── index.ts
├── providers/           # Context providers
│   ├── AppProviders.tsx # Provider composition
│   └── ThemeProvider.tsx # Theme/dark mode
├── router/              # Routing configuration
│   ├── AppRouter.tsx    # Route definitions
│   └── components/
│       └── ProtectedRoute.tsx  # Auth-protected routes
└── styles/
    └── index.css        # Global CSS
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `App.tsx` | Root React component, imports providers and router |
| `AppLayout.tsx` | Main layout wrapper with header/sidebar |
| `AppHeader.tsx` | Top navigation bar |
| `AppSidebar.tsx` | Left sidebar navigation |
| `AppProviders.tsx` | Composes all context providers (Auth, Theme, Queries) |
| `ThemeProvider.tsx` | Light/dark theme management |
| `AppRouter.tsx` | React Router configuration |
| `ProtectedRoute.tsx` | Route protection based on auth status |

---

## 📚 Shared Layer

**Path:** `src/shared/`

Reusable utilities, components, and configuration shared across domains.

### Structure

```
shared/
├── config/              # Application configuration
│   └── index.ts         # Config exports
├── constants/           # Application constants
│   ├── roles.ts         # Role definitions
│   └── routes.ts        # Route constants
├── hooks/               # Custom React hooks (cross-domain)
│   ├── useAuth.ts       # Auth context hook
│   └── useRBAC.ts       # RBAC utilities hook
├── lib/                 # Utility functions and libraries
│   ├── firebase.ts      # Firebase initialization
│   ├── date.ts          # Date utilities
│   └── format.ts        # Formatting utilities
├── stores/              # State management (Zustand, etc.)
│   └── uiStore.ts       # UI state store
├── types/               # Shared TypeScript types
│   └── index.ts         # Type exports
└── ui/                  # Reusable UI components
    ├── components/
    │   ├── ErrorBoundary.tsx      # Error boundary
    │   ├── LoadingSpinner.tsx      # Loading indicator
    │   └── PageHeader.tsx          # Page header component
    └── layouts/
        ├── AdminLayout.tsx         # Admin section layout
        └── AuthLayout.tsx          # Auth pages layout
```

### Key Files

| File | Purpose |
|------|---------|
| `config/index.ts` | App-wide configuration (API URLs, etc.) |
| `constants/roles.ts` | Role and permission definitions |
| `constants/routes.ts` | Route path constants |
| `hooks/useAuth.ts` | Auth state and methods |
| `hooks/useRBAC.ts` | Permission checking helpers |
| `lib/firebase.ts` | Firebase initialization and helpers |
| `lib/date.ts` | Date manipulation utilities |
| `lib/format.ts` | Formatting utilities (currency, dates, etc.) |
| `stores/uiStore.ts` | Global UI state (sidebar open, etc.) |
| `ui/components/ErrorBoundary.tsx` | Global error handling |
| `ui/components/LoadingSpinner.tsx` | Loading indicator |
| `ui/components/PageHeader.tsx` | Page title and actions |
| `ui/layouts/AdminLayout.tsx` | Admin section wrapper |
| `ui/layouts/AuthLayout.tsx` | Authentication pages wrapper |

---

## File Organization Patterns

### Component Files

**Naming Convention:** PascalCase with `.tsx` extension

```tsx
// src/domains/{domain}/features/{feature}/components/ComponentName.tsx
import type { FC, ReactNode } from 'react';

interface Props {
  title: string;
  children?: ReactNode;
}

export const ComponentName: FC<Props> = ({ title, children }) => {
  return <div className="component">{title}{children}</div>;
};
```

### Hook Files

**Naming Convention:** `use` prefix, camelCase with `.ts` extension

```ts
// src/domains/{domain}/features/{feature}/hooks/useFeatureName.ts
import { useQuery } from '@tanstack/react-query';
import { featureService } from '../services/featureService';

export const useFeatureName = (id: string) => {
  return useQuery({
    queryKey: ['feature', id],
    queryFn: () => featureService.getById(id),
  });
};
```

### Service Files

**Naming Convention:** camelCase with `Service` suffix

```ts
// src/domains/{domain}/features/{feature}/services/featureService.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

export const featureService = {
  async getAll() {
    const snap = await getDocs(collection(db, 'features'));
    return snap.docs.map((d) => d.data());
  },
};
```

### Schema Files

**Naming Convention:** camelCase with `Schema` suffix

```ts
// src/domains/{domain}/features/{feature}/schemas/index.ts
import { z } from 'zod';

export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export type FeatureInput = z.infer<typeof FeatureSchema>;
```

### Type Files

**Naming Convention:** camelCase matching domain concept

```ts
// src/domains/{domain}/features/{feature}/types/index.ts
export interface Feature {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Index Files

Every feature directory includes an `index.ts` barrel export:

```ts
// src/domains/{domain}/features/{feature}/index.ts
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export * from './pages';
```

---

## Import Aliases

The project uses path aliases for clean imports. See `tsconfig.json`:

```ts
// ❌ Avoid
import { useEmployee } from '../../../domains/people/features/employees/hooks';

// ✅ Use
import { useEmployee } from '@/domains/people/features/employees/hooks';
```

### Available Aliases

| Alias | Path |
|-------|------|
| `@/` | `./src/` |
| `@human/*` | Shared package types (if applicable) |

---

## Dependency Rules (FSD Constraints)

### ✅ Allowed Imports

```ts
// Within same feature
import { ComponentName } from '../components';

// From shared layer
import { useAuth } from '@/shared/hooks';

// From other domains (only public exports)
import { useEmployee } from '@/domains/people/features/employees';
```

### ❌ Forbidden Imports

```ts
// Cross-domain private imports
import { EmployeeService } from '@/domains/people/features/employees/services';

// Relative path traversal beyond feature
import { something } from '../../../../';

// Importing internal implementation
import { internalUtil } from '../services/employeeService';
```

---

## Summary Table

| Layer | Path | Purpose |
|-------|------|---------|
| **App** | `src/app/` | Routing, layout, providers |
| **Domains** | `src/domains/` | Business logic by feature |
| **Shared** | `src/shared/` | Cross-cutting utilities |
| **Root** | `src/` | Entry point (main.tsx) |

---

## Quick Navigation

- **Add new employee feature** → `src/domains/people/features/employees/`
- **Add new page** → `src/domains/{domain}/features/{feature}/pages/`
- **Add utility function** → `src/shared/lib/`
- **Add global component** → `src/shared/ui/components/`
- **Configure routing** → `src/app/router/AppRouter.tsx`
- **Add provider** → `src/app/providers/AppProviders.tsx`

---

## References

- **Master Coding Guide:** `@/standards/06-ai-coding-instructions.md`
- **CLAUDE.md:** `./CLAUDE.md`
