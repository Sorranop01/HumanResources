# Authentication System - Quick Reference Guide

## Status at a Glance

| Component | Status | Notes |
|-----------|--------|-------|
| **Firebase Auth Setup** | ✅ Complete | Configured and working |
| **Login Form** | ✅ Complete | Thai UI with validation |
| **Auth Service** | ⚠️ Incomplete | Missing Firestore integration |
| **useAuth Hook** | ⚠️ Incomplete | Doesn't fetch Firestore profile |
| **useLogin Hook** | ✅ Complete | Works with React Query |
| **useLogout Hook** | ✅ Complete | Works with React Query |
| **RBAC System** | ✅ Complete | Full permission matrix |
| **Route Protection** | ❌ Missing | No ProtectedRoute component |
| **Pages** | ❌ Missing | Only placeholder pages exist |
| **Email Verification** | ❌ Missing | Not implemented |
| **Password Reset** | ❌ Missing | Service exists, no UI |
| **User Profile Creation** | ❌ Missing | TODO in register function |

---

## What Works Right Now

```typescript
// 1. Firebase Auth Integration
✅ Login with email/password
✅ Create account (auth part only)
✅ Logout
✅ Send password reset email
✅ Session persistence across page refresh
✅ Get auth token for API calls

// 2. UI Components
✅ LoginForm component (Thai language)
✅ AuthLayout component
✅ AdminLayout component
✅ ErrorBoundary for error handling
✅ Theme provider (Ant Design)

// 3. State Management
✅ useAuth() hook returns current user
✅ Real-time auth state updates
✅ User role access
✅ Loading state for auth check

// 4. RBAC System
✅ Role hierarchy defined
✅ Permission matrix implemented
✅ useRBAC() and usePermission() hooks
✅ Fine-grained permissions per resource
```

---

## What Doesn't Work (Critical)

```typescript
// 1. Route Protection
❌ NO: ProtectedRoute component exists
   IMPACT: Unauthenticated users can access /dashboard directly

❌ NO: Route guards in AppRouter
   IMPACT: All routes are publicly accessible

// 2. Page Integration
❌ NO: LoginForm used in actual LoginPage
   IMPACT: Clicking login doesn't do anything

❌ NO: Real dashboard page
   IMPACT: /dashboard shows placeholder

// 3. User Profiles
❌ NO: User profile created in Firestore
   IMPACT: User role always defaults to 'employee'

❌ NO: Firestore fetch in useAuth()
   IMPACT: User data incomplete, no role from database

// 4. Auth Pages
❌ NO: RegisterPage component
   IMPACT: /register route links to nothing

❌ NO: PasswordResetPage component
   IMPACT: Forgot password link goes nowhere

❌ NO: Profile completion flow
   IMPACT: Users can't complete their profile after signup
```

---

## Key File Locations

### Authentication Core
```
/src/shared/lib/firebase.ts                  # Firebase config
/src/shared/hooks/useAuth.ts                 # Auth state hook (⚠️)
/src/env.ts                                  # Env var loader
```

### Auth Feature
```
/src/domains/system/features/auth/
├── components/
│   └── LoginForm.tsx                        # ✅ Login form
├── hooks/
│   ├── useLogin.ts                          # ✅ Login mutation
│   └── useLogout.ts                         # ✅ Logout mutation
├── pages/                                   # ❌ MISSING!
│   ├── LoginPage.tsx                        # ❌ Needs creation
│   ├── RegisterPage.tsx                     # ❌ Needs creation
│   └── ForgotPasswordPage.tsx               # ❌ Needs creation
└── services/
    └── authService.ts                       # ⚠️ Missing Firestore
```

### Routing & Layout
```
/src/app/
├── router/
│   ├── AppRouter.tsx                        # ⚠️ Needs update
│   └── ProtectedRoute.tsx                   # ❌ Missing!
└── providers/
    └── AppProviders.tsx                     # ✅ Provider setup
```

### RBAC & Types
```
/src/shared/
├── constants/
│   ├── roles.ts                             # ✅ Role definitions
│   └── routes.ts                            # ✅ Route constants
├── hooks/
│   └── useRBAC.ts                           # ✅ Role check hook
├── types/
│   └── index.ts                             # ✅ Type definitions
└── ui/
    └── layouts/
        ├── AuthLayout.tsx                   # ✅ Login page layout
        └── AdminLayout.tsx                  # ✅ Dashboard layout
```

---

## Current Flow vs Required Flow

### Current Flow (Incomplete)
```
User Visit / 
    ↓
App.tsx
    ↓
AppProviders (no auth check)
    ↓
AppRouter (no route guards)
    ↓
Placeholder Pages (accessible to anyone)
    ↓
X Can see dashboard without login!
```

### Required Flow (Not Implemented)
```
User Visit /
    ↓
App.tsx
    ↓
AppProviders
    ↓
AppRouter with ProtectedRoute check
    ↓
Is user authenticated?
├─ YES → Render protected page
└─ NO → Redirect to /login
    ↓
LoginPage
    ↓
LoginForm + authService.login()
    ↓
Firebase Auth success
    ↓
User profile created in Firestore
    ↓
useAuth() fetches profile
    ↓
Redirect to dashboard
```

---

## What Needs to Be Done (Priority Order)

### Priority 1: Route Protection (Day 1)
```typescript
// 1. Create ProtectedRoute.tsx
// 2. Update AppRouter.tsx to use ProtectedRoute
// 3. Create LoginPage.tsx
// 4. Create DashboardPage.tsx (real version)
// 5. Wire LoginForm to AppRouter
```

**Estimated Time:** 2-3 hours  
**Blocks:** Everything else until done

---

### Priority 2: User Profiles (Day 1-2)
```typescript
// 1. Update authService.register() to create Firestore doc
// 2. Update useAuth() to fetch from Firestore
// 3. Create users Firestore collection
// 4. Test profile persistence
```

**Estimated Time:** 3-4 hours

---

### Priority 3: Auth Pages (Day 2)
```typescript
// 1. Create RegisterPage.tsx
// 2. Create ForgotPasswordPage.tsx
// 3. Create ResetPasswordPage.tsx
// 4. Wire forms to services
```

**Estimated Time:** 4-5 hours

---

### Priority 4: Error Handling (Day 3)
```typescript
// 1. Map Firebase error codes to friendly messages
// 2. Add specific error messages for:
//    - Invalid email
//    - Wrong password
//    - User not found
//    - Email already in use
//    - Weak password
// 3. Add rate limiting
// 4. Add account lockout logic
```

**Estimated Time:** 3-4 hours

---

### Priority 5: Additional Features (Week 2)
```typescript
// 1. Email verification
// 2. Session timeout
// 3. Remember me functionality
// 4. Logout all devices
// 5. Audit logging
```

**Estimated Time:** 8-10 hours

---

## Code Examples - What's Working

### Example 1: Login Form (Working)
```typescript
// File: /src/domains/system/features/auth/components/LoginForm.tsx
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (values) => {
    login({ email: values.email, password: values.password });
  };

  return (
    <Form onFinish={handleSubmit}>
      <Form.Item name="email" rules={[{ required: true }]}>
        <Input prefix={<UserOutlined />} placeholder="อีเมล" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่าน" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={isPending}>
        เข้าสู่ระบบ
      </Button>
    </Form>
  );
}
```

### Example 2: Auth Service Login (Working)
```typescript
// File: /src/domains/system/features/auth/services/authService.ts
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';

export const authService = {
  async login(credentials: LoginCredentials) {
    return signInWithEmailAndPassword(auth, credentials.email, credentials.password);
  },
  // ... other methods
};
```

### Example 3: useAuth Hook (Incomplete)
```typescript
// File: /src/shared/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // ⚠️ TODO: Fetch full profile from Firestore
        // ⚠️ TODO: Get role from Firestore (currently hardcoded)
        setUser({
          id: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          role: 'employee', // Hardcoded!
        });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
```

---

## Code Examples - What's Missing

### Missing 1: ProtectedRoute Component
```typescript
// File: /src/app/router/ProtectedRoute.tsx
// THIS DOESN'T EXIST YET!

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';
import { LoadingSpinner } from '@/shared/ui/components/LoadingSpinner';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner fullscreen />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} />;
  
  return children;
}
```

### Missing 2: LoginPage Component
```typescript
// File: /src/domains/system/features/auth/pages/LoginPage.tsx
// THIS DOESN'T EXIST YET!

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { ROUTES } from '@/shared/constants/routes';

export function LoginPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner fullscreen />;
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} />;

  return (
    <AuthLayout title="HumanResources">
      <LoginForm />
    </AuthLayout>
  );
}
```

### Missing 3: Updated AppRouter
```typescript
// File: /src/app/router/AppRouter.tsx
// CURRENT VERSION HAS PLACEHOLDERS!

import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/domains/system/features/auth/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
```

---

## Environment Variables Required

```bash
# .env.development (existing)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ENV=development
```

All variables are required and validated in `/src/env.ts`

---

## Firestore Collections Needed

### `users` Collection
```json
{
  "id": "firebase_uid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "employee",
  "photoURL": null,
  "phoneNumber": null,
  "isActive": true,
  "createdAt": "2025-11-11T...",
  "updatedAt": "2025-11-11T..."
}
```

---

## Testing Checklist

- [ ] User can login with valid credentials
- [ ] User cannot login with invalid credentials
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users can access dashboard
- [ ] User stays logged in after page refresh
- [ ] User can logout
- [ ] User role loaded from Firestore
- [ ] Permissions checked correctly based on role
- [ ] Password reset link works
- [ ] Account creation stores user in Firestore
- [ ] Registration form validates correctly

---

## Deployment Checklist

- [ ] Firebase Security Rules reviewed
- [ ] Error messages are user-friendly
- [ ] No console errors in production build
- [ ] All environment variables set
- [ ] Firestore indexes created
- [ ] Email verification enabled (if needed)
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Session timeout configured

---

## Common Issues & Solutions

### Issue: "Cannot GET /login"
**Solution:** AppRouter doesn't have LoginPage route properly configured

### Issue: "User can access /dashboard without logging in"
**Solution:** ProtectedRoute component not implemented, add route guards

### Issue: "User role always shows as 'employee'"
**Solution:** useAuth() doesn't fetch from Firestore, needs update to doc(db, 'users', uid)

### Issue: "Form submission does nothing"
**Solution:** LoginForm exists but LoginPage doesn't use it, create LoginPage.tsx

### Issue: "Cannot read property 'role' of null"
**Solution:** User object not created in Firestore during registration, add create logic

---

## Quick Links

- **Firebase Console:** https://console.firebase.google.com/
- **Firestore Rules Docs:** https://firebase.google.com/docs/firestore/security/start
- **React Router Docs:** https://reactrouter.com/
- **Ant Design Docs:** https://ant.design/components/
- **Firebase Auth Docs:** https://firebase.google.com/docs/auth/

---

**Last Updated:** November 11, 2025  
**Status:** ~40% production-ready
