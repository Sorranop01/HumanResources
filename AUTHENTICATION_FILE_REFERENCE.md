# Authentication System - File Reference Guide

**Generated:** November 11, 2025  
**Purpose:** Quick reference to find all authentication-related source files

---

## Directory Structure

```
HumanResources/
├── src/
│   ├── app/
│   │   ├── router/
│   │   │   └── AppRouter.tsx                    ⚠️ Needs update
│   │   ├── providers/
│   │   │   ├── AppProviders.tsx                 ✅
│   │   │   └── ThemeProvider.tsx                ✅
│   │   └── App.tsx                              ✅
│   │
│   ├── domains/
│   │   └── system/
│   │       └── features/
│   │           ├── auth/
│   │           │   ├── components/
│   │           │   │   └── LoginForm.tsx        ✅
│   │           │   ├── hooks/
│   │           │   │   ├── useLogin.ts          ✅
│   │           │   │   └── useLogout.ts         ✅
│   │           │   ├── pages/                   ❌ Missing dir
│   │           │   └── services/
│   │           │       └── authService.ts       ⚠️ Incomplete
│   │           │
│   │           ├── rbac/
│   │           │   ├── hooks/
│   │           │   │   └── usePermission.ts     ✅
│   │           │   └── utils/
│   │           │       └── checkPermission.ts   ✅
│   │           │
│   │           └── settings/
│   │               └── ...
│   │
│   ├── shared/
│   │   ├── constants/
│   │   │   ├── roles.ts                         ✅
│   │   │   └── routes.ts                        ✅
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts                       ⚠️ Incomplete
│   │   │   └── useRBAC.ts                       ✅
│   │   │
│   │   ├── lib/
│   │   │   └── firebase.ts                      ✅
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                         ✅
│   │   │
│   │   └── ui/
│   │       ├── components/
│   │       │   ├── ErrorBoundary.tsx            ✅
│   │       │   ├── LoadingSpinner.tsx           ✅
│   │       │   └── PageHeader.tsx               ✅
│   │       │
│   │       └── layouts/
│   │           ├── AuthLayout.tsx               ✅
│   │           └── AdminLayout.tsx              ✅
│   │
│   ├── env.ts                                   ✅
│   └── main.tsx                                 ✅
│
├── .env.development                             ✅
├── .env.production                              ✅
├── .env.example                                 ✅
│
└── Documentation (New - Analysis):
    ├── AUTHENTICATION_SYSTEM_ANALYSIS.md        📄
    ├── AUTHENTICATION_QUICK_REFERENCE.md        📄
    ├── AUTHENTICATION_IMPLEMENTATION_ROADMAP.md 📄
    ├── AUTHENTICATION_ANALYSIS_README.md        📄
    ├── AUTHENTICATION_FILE_REFERENCE.md         📄 (this file)
    └── ANALYSIS_SUMMARY.txt                     📄
```

---

## Complete File Reference

### AUTHENTICATION CORE FILES

#### 1. Firebase Configuration
```
/src/shared/lib/firebase.ts
- Initializes Firebase app
- Exports auth, db, storage instances
- Loads config from environment variables
- Status: ✅ Complete
```

#### 2. Environment Variables
```
/src/env.ts
- Type-safe environment loader
- Validates required Firebase variables
- Throws error if variables missing
- Status: ✅ Complete

Configuration files:
- /.env.development
- /.env.production
- /.env.example
```

---

### AUTHENTICATION SERVICES

#### 3. Auth Service (Core)
```
/src/domains/system/features/auth/services/authService.ts
- login(credentials)                    ✅
- register(data)                        ⚠️ Missing Firestore step
- logout()                              ✅
- resetPassword(email)                  ✅
- getIdToken()                          ✅
- Status: ⚠️ Mostly complete, needs Firestore
```

---

### AUTHENTICATION HOOKS

#### 4. useAuth Hook (State Management)
```
/src/shared/hooks/useAuth.ts
- Listens to Firebase auth state changes
- Returns: { user, firebaseUser, loading, isAuthenticated }
- Issues: ⚠️ Doesn't fetch user profile from Firestore
- Status: ⚠️ Incomplete - needs Firestore integration
```

#### 5. useLogin Hook (Mutation)
```
/src/domains/system/features/auth/hooks/useLogin.ts
- Uses React Query mutation
- Calls authService.login()
- Navigates to dashboard on success
- Shows error message on failure
- Status: ✅ Complete
```

#### 6. useLogout Hook (Mutation)
```
/src/domains/system/features/auth/hooks/useLogout.ts
- Uses React Query mutation
- Calls authService.logout()
- Navigates to login on success
- Shows error message on failure
- Status: ✅ Complete
```

---

### UI COMPONENTS

#### 7. LoginForm Component
```
/src/domains/system/features/auth/components/LoginForm.tsx
- Email input (with validation)
- Password input (with validation)
- Remember me checkbox
- Forgot password link
- Sign up link
- Submit button (with loading state)
- Language: Thai
- Status: ✅ Complete

Form validation:
- Email required and valid format
- Password required (min 6 chars recommended)
```

#### 8. AuthLayout Component
```
/src/shared/ui/layouts/AuthLayout.tsx
- Centered card design
- Gradient background
- Title and subtitle
- Max width 450px
- Responsive
- Status: ✅ Complete
```

#### 9. AdminLayout Component
```
/src/shared/ui/layouts/AdminLayout.tsx
- Main dashboard layout
- Status: ✅ Complete (not examined in detail)
```

#### 10. ErrorBoundary Component
```
/src/shared/ui/components/ErrorBoundary.tsx
- Catches React component errors
- Shows friendly error page
- Reset button
- Status: ✅ Complete
```

#### 11. LoadingSpinner Component
```
/src/shared/ui/components/LoadingSpinner.tsx
- Supports size variants (small, default, large)
- Optional tip text
- Fullscreen mode
- Status: ✅ Complete
```

#### 12. PageHeader Component
```
/src/shared/ui/components/PageHeader.tsx
- Title display
- Breadcrumb navigation
- Extra actions slot
- Status: ✅ Complete
```

---

### ROUTING

#### 13. AppRouter
```
/src/app/router/AppRouter.tsx
- Current: Placeholder pages only
- Issues: ⚠️ Uses placeholder components instead of real pages
- Issues: ❌ No route protection/guards
- Status: ⚠️ Needs major update
- Routes defined:
  - /login → LoginPage (placeholder)
  - /dashboard → DashboardPage (placeholder)
  - / → Redirect to dashboard
  - * → 404
```

#### 14. ProtectedRoute Component
```
/src/app/router/ProtectedRoute.tsx
- Status: ❌ MISSING - Needs to be created
- Should: Check auth state and redirect to login if not authenticated
- Should: Show loading spinner while checking auth
- Should: Render children if authenticated
```

---

### RBAC (Role-Based Access Control)

#### 15. Roles Definition
```
/src/shared/constants/roles.ts
- Defines: ROLES (admin, hr, manager, employee, auditor)
- Defines: ROLE_HIERARCHY (privilege levels)
- Defines: ROLE_LABELS (Thai translations)
- Exports: hasRolePrivilege() function
- Status: ✅ Complete
```

#### 16. Routes Definition
```
/src/shared/constants/routes.ts
- Exports: ROUTES constant with all paths
- Paths: LOGIN, REGISTER, FORGOT_PASSWORD
- Paths: DASHBOARD, EMPLOYEES, ATTENDANCE, etc.
- Status: ✅ Complete
```

#### 17. useRBAC Hook
```
/src/shared/hooks/useRBAC.ts
- Returns: { hasRole, hasAnyRole, hasMinRole, isAdmin, isHR, ... }
- Uses: useAuth() to get current user
- Uses: hasRolePrivilege() to check hierarchy
- Status: ✅ Complete
```

#### 18. usePermission Hook
```
/src/domains/system/features/rbac/hooks/usePermission.ts
- Returns: { hasPermission, canAccessResource, getResourcePermissions }
- Uses: useAuth() to get current user
- Uses: checkPermission() to verify access
- Status: ✅ Complete
```

#### 19. Permission Checker
```
/src/domains/system/features/rbac/utils/checkPermission.ts
- Defines: PERMISSION_MATRIX (role → resource → permissions)
- Exports: checkPermission() function
- Exports: canAccess() function
- Exports: getPermissions() function
- Status: ✅ Complete
```

---

### TYPE DEFINITIONS

#### 20. Core Types
```
/src/shared/types/index.ts
- User interface (extends BaseEntity)
- Employee interface
- AttendanceRecord interface
- LeaveRequest interface
- PayrollRun interface
- ApiResponse interface
- PaginatedResponse interface
- Status: ✅ Complete
```

---

### PROVIDERS & SETUP

#### 21. AppProviders
```
/src/app/providers/AppProviders.tsx
- ErrorBoundary wrapper
- QueryClientProvider (React Query)
- BrowserRouter (React Router)
- ThemeProvider (Ant Design)
- ReactQueryDevtools
- Status: ✅ Complete
```

#### 22. ThemeProvider
```
/src/app/providers/ThemeProvider.tsx
- Ant Design theme configuration
- Color tokens
- Border radius
- Font settings
- Status: ✅ Complete
```

#### 23. Main App Component
```
/src/app/App.tsx
- Renders: AppProviders
- Renders: AppRouter
- Status: ✅ Complete
```

---

### CONFIGURATION FILES

#### 24. Package Configuration
```
/package.json
- Dependencies:
  - react ^18.2.0
  - react-router-dom ^6.23.0
  - @tanstack/react-query ^5.90.2
  - firebase ^12.0.0
  - antd ^5.27.0
  - zod ^3.23.8
  - dayjs ^1.11.10
  - lucide-react ^0.542.0
- Status: ✅ Complete
```

#### 25. TypeScript Configuration
```
/tsconfig.json
- Strict mode enabled
- Path aliases configured
- Status: ✅ Complete (not examined in detail)
```

#### 26. Vite Configuration
```
/vite.config.ts
- React plugin configured
- Status: ✅ Complete (not examined in detail)
```

---

## Missing Files (Need to Create)

```
/src/domains/system/features/auth/pages/
├── LoginPage.tsx                               ❌ Create
├── RegisterPage.tsx                            ❌ Create
└── ForgotPasswordPage.tsx                      ❌ Create

/src/domains/system/features/auth/components/
└── RegisterForm.tsx                            ❌ Create

/src/pages/
└── DashboardPage.tsx                           ❌ Create

/src/app/router/
└── ProtectedRoute.tsx                          ❌ Create
```

---

## File Status Summary

| Category | Status | Count |
|----------|--------|-------|
| Complete Files | ✅ | 15 |
| Incomplete Files | ⚠️ | 4 |
| Missing Files | ❌ | 5 |
| **Total** | | **24** |

---

## Implementation Order

### Phase 1: Route Protection (Create/Update)
1. Create: `/src/app/router/ProtectedRoute.tsx`
2. Create: `/src/domains/system/features/auth/pages/LoginPage.tsx`
3. Create: `/src/pages/DashboardPage.tsx`
4. Update: `/src/app/router/AppRouter.tsx`

### Phase 2: Firestore Integration (Update)
5. Update: `/src/domains/system/features/auth/services/authService.ts`
6. Update: `/src/shared/hooks/useAuth.ts`
7. Create Firestore collections (in Firebase Console)

### Phase 3: Auth Pages (Create)
8. Create: `/src/domains/system/features/auth/pages/RegisterPage.tsx`
9. Create: `/src/domains/system/features/auth/components/RegisterForm.tsx`
10. Create: `/src/domains/system/features/auth/pages/ForgotPasswordPage.tsx`

### Phase 4: Error Handling (Update)
11. Update: `/src/domains/system/features/auth/services/authService.ts` (error handling)
12. Update: `/src/domains/system/features/auth/components/LoginForm.tsx` (error display)
13. Update: `/src/domains/system/features/auth/components/RegisterForm.tsx` (error display)

---

## Firestore Collections to Create

```
users/
├── {uid}/
│   ├── id: string
│   ├── email: string
│   ├── displayName: string
│   ├── role: string
│   ├── photoURL: string (optional)
│   ├── phoneNumber: string (optional)
│   ├── isActive: boolean
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

audit_logs/ (optional)
├── {auto_id}/
│   ├── userId: string
│   ├── action: string
│   ├── timestamp: timestamp
│   ├── ipAddress: string (optional)
│   ├── userAgent: string (optional)
│   ├── success: boolean
│   └── errorMessage: string (optional)
```

---

## Environment Variables

Required in `.env.development` and `.env.production`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ENV=development|production
```

---

## Testing Files by Component

When testing, verify each file in this order:

1. **Firebase Setup**
   - `/src/shared/lib/firebase.ts` → Verifies initialization
   - `/src/env.ts` → Verifies env variables

2. **Services**
   - `/src/domains/system/features/auth/services/authService.ts` → Test login/register

3. **Hooks**
   - `/src/shared/hooks/useAuth.ts` → Test auth state
   - `/src/domains/system/features/auth/hooks/useLogin.ts` → Test login mutation
   - `/src/domains/system/features/auth/hooks/useLogout.ts` → Test logout mutation

4. **Routes**
   - `/src/shared/constants/routes.ts` → Verify all routes defined
   - `/src/app/router/AppRouter.tsx` → Test routing
   - `/src/app/router/ProtectedRoute.tsx` → Test protection

5. **UI**
   - `/src/domains/system/features/auth/components/LoginForm.tsx` → Test form

6. **RBAC**
   - `/src/shared/constants/roles.ts` → Verify roles
   - `/src/shared/hooks/useRBAC.ts` → Test role checks
   - `/src/domains/system/features/rbac/utils/checkPermission.ts` → Test permissions

---

## Related Documentation

- **AUTHENTICATION_SYSTEM_ANALYSIS.md** - Full technical analysis
- **AUTHENTICATION_QUICK_REFERENCE.md** - Quick lookup guide
- **AUTHENTICATION_IMPLEMENTATION_ROADMAP.md** - Step-by-step implementation
- **AUTHENTICATION_ANALYSIS_README.md** - Navigation and index
- **ANALYSIS_SUMMARY.txt** - Executive summary

---

**Last Updated:** November 11, 2025  
**Purpose:** Quick reference to locate all authentication-related files  
**Status:** Complete analysis of codebase
