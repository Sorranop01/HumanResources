# Authentication Implementation Roadmap

## Visual Architecture - Current State

```
┌────────────────────────────────────────────────────────────────┐
│                        App.tsx                                 │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      AppProviders                    │
        │  ┌────────────────────────────────┐  │
        │  │ ✅ ErrorBoundary               │  │
        │  │ ✅ QueryClientProvider         │  │
        │  │ ✅ BrowserRouter               │  │
        │  │ ✅ ThemeProvider (Ant Design)  │  │
        │  │ ✅ ReactQueryDevtools          │  │
        │  └────────────────────────────────┘  │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      ❌ AppRouter (NEEDS FIX)        │
        │  ┌────────────────────────────────┐  │
        │  │ ⚠️  Has placeholder pages      │  │
        │  │ ❌ No route protection         │  │
        │  │ ❌ No ProtectedRoute component │  │
        │  │ Routes:                        │  │
        │  │  - /login → LoginPage          │  │
        │  │  - /dashboard → DashboardPage  │  │
        │  │  - /register → (missing)       │  │
        │  │  - /forgot-password → (miss)   │  │
        │  └────────────────────────────────┘  │
        └──────────────────┬───────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │ LoginPage    │ │ DashboardPage│ │ (Other Pages)
   │ ❌ MISSING   │ │ ⚠️ PLACEHOLDER
   │ needs:       │ │ needs:       │ │ ❌ No guard
   │ -LoginForm   │ │ -Auth check  │ │
   │ -AuthLayout  │ │ -Real content│ │
   └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
          │                │                │
          │ uses           │ checks auth    │ checks auth
          │                │ via            │ via
          ▼                ▼                ▼
   ┌──────────────────────────────────────────────────┐
   │         ✅ useAuth() Hook                        │
   │  Returns:                                        │
   │  - user: User | null                             │
   │  - firebaseUser: FirebaseUser | null             │
   │  - loading: boolean                              │
   │  - isAuthenticated: boolean                      │
   │                                                  │
   │  ⚠️  ISSUES:                                     │
   │  - Doesn't fetch from Firestore                  │
   │  - Role hardcoded as 'employee'                  │
   │  - No permission data                            │
   └──────────────┬───────────────────────────────────┘
                  │
                  │ calls Firebase Auth listener
                  │ and TODO: should call Firestore
                  │
        ┌─────────┴──────────────┐
        │                        │
        ▼                        ▼
   ┌──────────────────┐   ┌────────────────────┐
   │ Firebase Auth    │   │ ❌ Firestore        │
   │ ✅ Configured   │   │ ❌ Not integrated   │
   │                  │   │ (should have users  │
   │ Operations:      │   │  collection)        │
   │ ✅ Login         │   │                    │
   │ ✅ Register (*)  │   │ Needed:            │
   │ ✅ Logout        │   │ - User profiles    │
   │ ✅ Reset pwd     │   │ - Audit logs       │
   │ ✅ Get token     │   │ - Custom claims?   │
   │                  │   │                    │
   │ (*) Missing      │   │ (*) Missing        │
   │  Firestore step  │   │  integration       │
   └──────────────────┘   └────────────────────┘
```

---

## Phase-by-Phase Implementation

### PHASE 1: Route Protection & Pages (Critical - Day 1-2)

#### 1.1 Create ProtectedRoute Component
**File:** `/src/app/router/ProtectedRoute.tsx`

**What it does:**
- Checks if user is authenticated via `useAuth()` hook
- Shows loading spinner while auth state loads
- Redirects to login if not authenticated
- Renders children if authenticated

**Implementation:**
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoadingSpinner } from '@/shared/ui/components/LoadingSpinner';
import { ROUTES } from '@/shared/constants/routes';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullscreen tip="กำลังตรวจสอบการเข้าสู่ระบบ..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
```

**Time to Implement:** 15 minutes

---

#### 1.2 Create LoginPage Component
**File:** `/src/domains/system/features/auth/pages/LoginPage.tsx`

**What it does:**
- Redirects authenticated users to dashboard
- Shows loading spinner while checking auth
- Displays login form wrapped in AuthLayout

**Implementation:**
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { LoadingSpinner } from '@/shared/ui/components/LoadingSpinner';
import { ROUTES } from '@/shared/constants/routes';

export function LoginPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullscreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <AuthLayout title="HumanResources">
      <LoginForm />
    </AuthLayout>
  );
}
```

**Time to Implement:** 10 minutes

---

#### 1.3 Create DashboardPage Component
**File:** `/src/pages/DashboardPage.tsx`

**What it does:**
- Shows user welcome message
- Displays user info from useAuth hook
- Has logout button
- Will be extended with actual dashboard content

**Implementation:**
```typescript
import { Button, Card, Statistic, Row, Col } from 'antd';
import { useAuth } from '@/shared/hooks/useAuth';
import { useLogout } from '@/domains/system/features/auth/hooks/useLogout';
import { PageHeader } from '@/shared/ui/components/PageHeader';

export function DashboardPage() {
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader 
        title="Dashboard"
        extra={
          <Button 
            type="primary" 
            danger 
            loading={isPending}
            onClick={() => logout()}
          >
            ออกจากระบบ
          </Button>
        }
      />

      <Card style={{ marginBottom: '24px' }}>
        <h2>ยินดีต้อนรับ, {user?.displayName}</h2>
        <p>อีเมล: {user?.email}</p>
        <p>บทบาท: {user?.role}</p>
      </Card>

      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Statistic title="Status" value="Active" />
        </Col>
      </Row>
    </div>
  );
}
```

**Time to Implement:** 15 minutes

---

#### 1.4 Update AppRouter with Route Protection
**File:** `/src/app/router/AppRouter.tsx`

**What changes:**
- Import ProtectedRoute, LoginPage, DashboardPage
- Wrap protected routes with ProtectedRoute component
- Remove placeholder implementations

**Implementation:**
```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/domains/system/features/auth/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* TODO: Add other protected routes here */}

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <h1>404 - Page Not Found</h1>
          </div>
        }
      />
    </Routes>
  );
}
```

**Time to Implement:** 10 minutes

---

### PHASE 2: Firestore Integration (Critical - Day 2-3)

#### 2.1 Update authService.register() for Firestore
**File:** `/src/domains/system/features/auth/services/authService.ts`

**What changes:**
- Import Firestore functions
- Create user document in `users` collection
- Set default role
- Add audit log

**Implementation:**
```typescript
import { db } from '@/shared/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export const authService = {
  async register(data: RegisterData): Promise<UserCredential> {
    const { email, password, displayName } = data;

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update auth profile
    await updateProfile(userCredential.user, { displayName });

    // Create user profile in Firestore
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        email: email,
        displayName: displayName,
        role: 'employee', // Default role
        isActive: true,
        photoURL: null,
        phoneNumber: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to create user profile:', error);
      // TODO: Rollback user creation if Firestore fails
      throw error;
    }

    return userCredential;
  },
};
```

**Time to Implement:** 20 minutes

---

#### 2.2 Update useAuth() to Fetch from Firestore
**File:** `/src/shared/hooks/useAuth.ts`

**What changes:**
- Import Firestore functions
- Fetch user profile after auth state change
- Load role from Firestore
- Handle errors gracefully

**Implementation:**
```typescript
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/shared/lib/firebase';
import type { User } from '@/shared/types';

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);

        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
          } else {
            // Fallback if profile doesn't exist (shouldn't happen)
            const fallbackUser: User = {
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || '',
              role: 'employee',
              photoURL: fbUser.photoURL || undefined,
              phoneNumber: fbUser.phoneNumber || undefined,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            setUser(fallbackUser);
          }
        } catch (error) {
          console.error('Failed to fetch user profile from Firestore:', error);
          // Still set basic user data if Firestore fails
          const basicUser: User = {
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || '',
            role: 'employee',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setUser(basicUser);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user,
  };
}
```

**Time to Implement:** 25 minutes

---

#### 2.3 Create Firestore Collections
**Location:** Firebase Console

**Collections to create:**

1. **`users` Collection**
   - Document ID: Firebase UID
   - Fields:
     ```json
     {
       "id": "string (Firebase UID)",
       "email": "string",
       "displayName": "string",
       "role": "string (admin|hr|manager|employee|auditor)",
       "photoURL": "string (optional)",
       "phoneNumber": "string (optional)",
       "isActive": "boolean",
       "createdAt": "timestamp",
       "updatedAt": "timestamp"
     }
     ```

2. **`audit_logs` Collection** (optional but recommended)
   - Auto-generated document ID
   - Fields:
     ```json
     {
       "userId": "string",
       "action": "string (login|logout|register|password_reset)",
       "timestamp": "timestamp",
       "ipAddress": "string (optional)",
       "userAgent": "string (optional)",
       "success": "boolean",
       "errorMessage": "string (optional)"
     }
     ```

**Time to Implement:** 10 minutes in Firebase Console

---

### PHASE 3: Auth Pages (Important - Day 3-4)

#### 3.1 Create RegisterPage
**File:** `/src/domains/system/features/auth/pages/RegisterPage.tsx`

**Implementation:**
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';
import { LoadingSpinner } from '@/shared/ui/components/LoadingSpinner';
import { ROUTES } from '@/shared/constants/routes';

export function RegisterPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullscreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <AuthLayout title="สมัครสมาชิก">
      <RegisterForm />
    </AuthLayout>
  );
}
```

**Time to Implement:** 20 minutes (including RegisterForm component)

---

#### 3.2 Create ForgotPasswordPage
**File:** `/src/domains/system/features/auth/pages/ForgotPasswordPage.tsx`

**Implementation:**
```typescript
import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout';
import { ROUTES } from '@/shared/constants/routes';

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      await authService.resetPassword(values.email);
      message.success('ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณ');
      setSubmitted(true);
      form.resetFields();
    } catch (error) {
      message.error(`เกิดข้อผิดพลาด: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="ลืมรหัสผ่าน">
      {submitted ? (
        <div style={{ textAlign: 'center' }}>
          <p>ตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน</p>
          <Link to={ROUTES.LOGIN}>กลับไปเข้าสู่ระบบ</Link>
        </div>
      ) : (
        <Form onFinish={handleSubmit} form={form}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'กรุณากรอกอีเมล' },
              { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="อีเมล" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              ส่งลิงก์รีเซ็ต
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link to={ROUTES.LOGIN}>กลับไปเข้าสู่ระบบ</Link>
          </div>
        </Form>
      )}
    </AuthLayout>
  );
}
```

**Time to Implement:** 25 minutes

---

### PHASE 4: Error Handling & Improvements (Important - Day 4-5)

#### 4.1 Enhanced Error Handling
**File:** `/src/domains/system/features/auth/services/authService.ts`

**What to add:**
```typescript
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'ไม่พบผู้ใช้ที่มีอีเมลนี้',
  'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
  'auth/email-already-in-use': 'อีเมลนี้ได้ถูกใช้แล้ว',
  'auth/weak-password': 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/too-many-requests': 'ลองใหม่อีกครั้งในภายหลัง',
  'auth/operation-not-allowed': 'ฟีเจอร์นี้ไม่อนุญาตให้ใช้',
  'auth/network-request-failed': 'เกิดข้อผิดพลาดกับเครือข่าย',
};

function getErrorMessage(code: string): string {
  return FIREBASE_ERROR_MESSAGES[code] || 'เกิดข้อผิดพลาด โปรดลองใหม่';
}
```

**Time to Implement:** 20 minutes

---

## Implementation Timeline

```
Day 1 (2-3 hours):
├─ 10 min: ProtectedRoute.tsx
├─ 10 min: LoginPage.tsx
├─ 15 min: DashboardPage.tsx
├─ 10 min: Update AppRouter
└─ Test all routes and navigation

Day 2 (2-3 hours):
├─ 20 min: Update authService.register()
├─ 25 min: Update useAuth() hook
├─ 10 min: Create Firestore collections
└─ Test registration and profile loading

Day 3 (2-3 hours):
├─ 20 min: RegisterPage
├─ 25 min: ForgotPasswordPage
├─ 15 min: Create RegisterForm component
└─ Test registration flow

Day 4 (2 hours):
├─ 20 min: Error handling in authService
├─ 15 min: Better error messages in forms
├─ 20 min: Email verification setup (optional)
└─ Test error scenarios

Day 5 (2 hours):
├─ 30 min: Testing checklist
├─ 30 min: Security review
├─ 30 min: Performance optimization
└─ 30 min: Documentation
```

**Total Time: ~10-12 hours**

---

## Checklist for Each Phase

### Phase 1 Completion
- [ ] ProtectedRoute component created and tested
- [ ] LoginPage component created
- [ ] DashboardPage component created
- [ ] AppRouter updated with new pages
- [ ] Route protection working (can't access /dashboard without login)
- [ ] Login form redirects to dashboard after successful login
- [ ] Unauthenticated users see login page
- [ ] Loading spinner shows while checking auth

### Phase 2 Completion
- [ ] Firestore `users` collection created
- [ ] authService.register() creates Firestore doc
- [ ] useAuth() fetches user profile from Firestore
- [ ] User role loads correctly after login
- [ ] User profile persists across page refresh
- [ ] Default role set to 'employee' for new users

### Phase 3 Completion
- [ ] RegisterPage component created
- [ ] RegisterForm component created with validation
- [ ] ForgotPasswordPage component created
- [ ] AppRouter routes added for /register and /forgot-password
- [ ] Registration flow creates user and saves to Firestore
- [ ] Password reset email sent successfully
- [ ] All forms have proper Thai labels and validation messages

### Phase 4 Completion
- [ ] Firebase error codes mapped to friendly messages
- [ ] Error handling in login form
- [ ] Error handling in register form
- [ ] Error handling in reset password form
- [ ] Specific error messages show (not generic "error occurred")
- [ ] Rate limiting considered (future: implement)
- [ ] All error scenarios tested

---

## File Structure After Completion

```
src/
├── app/
│   ├── router/
│   │   ├── AppRouter.tsx              ✅ Updated
│   │   └── ProtectedRoute.tsx         ✅ New
│   ├── providers/
│   │   ├── AppProviders.tsx           ✅ Existing
│   │   └── ThemeProvider.tsx          ✅ Existing
│   └── App.tsx                        ✅ Existing
│
├── domains/
│   └── system/
│       └── features/
│           └── auth/
│               ├── components/
│               │   ├── LoginForm.tsx          ✅ Existing
│               │   └── RegisterForm.tsx       ✅ New
│               ├── hooks/
│               │   ├── useLogin.ts           ✅ Existing
│               │   └── useLogout.ts          ✅ Existing
│               ├── pages/
│               │   ├── LoginPage.tsx         ✅ New
│               │   ├── RegisterPage.tsx      ✅ New
│               │   └── ForgotPasswordPage.tsx ✅ New
│               └── services/
│                   └── authService.ts        ✅ Updated
│
├── pages/
│   └── DashboardPage.tsx                      ✅ New
│
├── shared/
│   ├── hooks/
│   │   ├── useAuth.ts                 ✅ Updated
│   │   └── useRBAC.ts                 ✅ Existing
│   ├── lib/
│   │   └── firebase.ts                ✅ Existing
│   ├── constants/
│   │   ├── roles.ts                   ✅ Existing
│   │   └── routes.ts                  ✅ Existing
│   ├── types/
│   │   └── index.ts                   ✅ Existing
│   └── ui/
│       ├── components/
│       │   ├── ErrorBoundary.tsx      ✅ Existing
│       │   ├── LoadingSpinner.tsx     ✅ Existing
│       │   └── PageHeader.tsx         ✅ Existing
│       └── layouts/
│           ├── AuthLayout.tsx         ✅ Existing
│           └── AdminLayout.tsx        ✅ Existing
│
└── env.ts                             ✅ Existing
```

---

## Success Criteria

After all phases are complete, the authentication system is production-ready if:

1. ✅ Users can login with email and password
2. ✅ Users cannot access protected routes without authentication
3. ✅ Unauthenticated users are redirected to login
4. ✅ Users stay logged in after page refresh
5. ✅ User profile is created in Firestore on registration
6. ✅ User role is loaded from Firestore
7. ✅ Users can logout
8. ✅ Users can reset password
9. ✅ All error messages are user-friendly
10. ✅ No console errors in production build
11. ✅ RBAC system prevents unauthorized access (Phase 5+)
12. ✅ Audit logs track authentication events (Phase 5+)

---

## Notes for Implementation

1. **Use TypeScript strictly** - Maintain type safety
2. **Test as you go** - Each phase should be tested before moving to next
3. **Commit frequently** - Small, logical commits make debugging easier
4. **Document TODOs** - Mark future enhancements with TODO comments
5. **Follow existing patterns** - Use same structure as LoginForm for RegisterForm
6. **Use Thai language** - All UI labels should be in Thai
7. **Handle loading states** - Show spinners while loading
8. **Handle errors gracefully** - Don't throw unhandled rejections

---

**Created:** November 11, 2025  
**Estimated Total Time:** 10-12 working hours  
**Difficulty Level:** Intermediate (mostly frontend, basic Firestore)
