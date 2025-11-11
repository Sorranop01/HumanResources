# Auth Feature - Quick Start Guide

เอกสารนำเข้าใช้งานอย่างรวดเร็วสำหรับ auth feature

## 🚀 Setup (5 นาที)

### 1. Configure Firebase (ครั้งแรกเท่านั้น)

```bash
# 1.1 Install Firebase CLI
npm install -g firebase-tools

# 1.2 Login to Firebase
firebase login

# 1.3 Init Firestore (if not done)
firebase init firestore
```

### 2. Apply Firestore Rules

```bash
# Copy example rules
cp src/domains/system/features/auth/firestore.rules.example firestore.rules

# Deploy rules
firebase deploy --only firestore:rules
```

### 3. Apply Firestore Indexes

```bash
# Merge indexes into firebase.json
# Copy content from src/domains/system/features/auth/firestore.indexes.example.json
# to firebase.json > firestore.indexes

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 4. Create Initial Admin User

```typescript
// Run this in your browser console or Node script
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

// After creating Firebase Auth user via console
const createAdmin = async () => {
  const authUid = 'YOUR_FIREBASE_AUTH_UID'; // Get from Firebase Console
  const email = 'admin@yourcompany.com';

  await setDoc(doc(db, 'users', authUid), {
    id: authUid,
    email: email,
    displayName: 'System Admin',
    role: 'ADMIN',
    phoneNumber: undefined,
    photoURL: undefined,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  console.log('Admin created!');
};

createAdmin();
```

---

## 📝 Basic Usage

### Login User

```typescript
import { useLogin } from '@/domains/system/features/auth';

function LoginPage() {
  const { login, isPending, error } = useLogin();

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      await login(data);
      // Success - user is logged in
      console.log('Login success');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  );
}
```

### Register New User

```typescript
import { useRegister } from '@/domains/system/features/auth';

function RegisterPage() {
  const { register, isPending, error } = useRegister();

  const handleSubmit = async (data: {
    email: string;
    password: string;
    displayName: string;
  }) => {
    try {
      await register(data);
      // Success - user created + logged in
      console.log('Registration success');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  );
}
```

### Get Current User

```typescript
import { useAuthStore } from '@/shared/stores/authStore';

function UserProfile() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;

  return (
    <div>
      <h1>{user.displayName}</h1>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### Logout

```typescript
import { useLogout } from '@/domains/system/features/auth';

function LogoutButton() {
  const { logout, isPending } = useLogout();

  return (
    <button type="button" onClick={() => void logout()} disabled={isPending}>
      Logout
    </button>
  );
}
```

---

## 🔐 Protected Routes

### Setup Protected Route

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### Usage in Router

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 👤 User Profile Operations

### Get User Profile

```typescript
import { userService } from '@/domains/system/features/auth';

const profile = await userService.getUserProfile('user-id');

if (profile) {
  console.log(profile.displayName);
  console.log(profile.role);
}
```

### Update User Profile

```typescript
await userService.updateUserProfile('user-id', {
  displayName: 'New Name',
  phoneNumber: '+66812345678',
});
```

### Update User Role (Admin Only)

```typescript
// Only admins can do this
await userService.updateUserProfile('user-id', {
  role: 'HR',
});
```

---

## 🔍 Query Users

### Get All Active Employees

```typescript
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

const usersRef = collection(db, 'users');
const q = query(
  usersRef,
  where('isActive', '==', true),
  where('role', '==', 'EMPLOYEE')
);

const snapshot = await getDocs(q);
const employees = snapshot.docs.map(doc => ({
  ...doc.data(),
  createdAt: doc.data().createdAt.toDate(),
  updatedAt: doc.data().updatedAt.toDate(),
}));
```

### Get User by Email

```typescript
const q = query(
  collection(db, 'users'),
  where('email', '==', 'user@example.com')
);

const snapshot = await getDocs(q);
const user = snapshot.docs[0]?.data();
```

### Get All HR Users

```typescript
const q = query(
  collection(db, 'users'),
  where('role', '==', 'HR'),
  where('isActive', '==', true)
);

const snapshot = await getDocs(q);
const hrUsers = snapshot.docs.map(doc => doc.data());
```

---

## 🚨 Error Handling

### Handle Auth Errors

```typescript
import { authService, AUTH_ERROR_CODES, getAuthErrorMessage } from '@/domains/system/features/auth';

try {
  await authService.login({ email, password });
} catch (error: unknown) {
  const errorCode = (error as { code?: string }).code;

  switch (errorCode) {
    case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      break;
    case AUTH_ERROR_CODES.USER_DISABLED:
      alert('บัญชีถูกปิดการใช้งาน');
      break;
    case AUTH_ERROR_CODES.TOO_MANY_REQUESTS:
      alert('พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่');
      break;
    default:
      alert(getAuthErrorMessage(error));
  }
}
```

---

## 🎯 Role-Based Access Control (RBAC)

### Check User Role

```typescript
import { useAuthStore } from '@/shared/stores/authStore';
import { ROLES } from '@/shared/constants/roles';

function AdminPanel() {
  const { user } = useAuthStore();

  if (!user || user.role !== ROLES.ADMIN) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Panel</div>;
}
```

### Check Multiple Roles

```typescript
function HRPanel() {
  const { user } = useAuthStore();

  const hasAccess = user && [ROLES.ADMIN, ROLES.HR].includes(user.role);

  if (!hasAccess) {
    return <div>Access Denied</div>;
  }

  return <div>HR Panel</div>;
}
```

---

## 📚 Complete Documentation

- **[README.md](./README.md)** - Overview & quick start
- **[COLLECTIONS.md](./COLLECTIONS.md)** - Firestore collections guide
- **[SCHEMA.md](./SCHEMA.md)** - Complete schema documentation with examples

---

## ✅ Checklist

### Initial Setup

- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Firebase Auth enabled (Email/Password)
- [ ] Security rules deployed
- [ ] Indexes deployed
- [ ] Initial admin user created

### Development

- [ ] Login page implemented
- [ ] Register page implemented
- [ ] Protected routes configured
- [ ] Auth state management setup
- [ ] Error handling implemented

### Testing

- [ ] Test user registration
- [ ] Test user login
- [ ] Test logout
- [ ] Test protected routes
- [ ] Test role-based access
- [ ] Test error scenarios

---

## 🆘 Common Issues

### Issue: "Missing or insufficient permissions"

**Solution:** Check Firestore security rules are deployed:

```bash
firebase deploy --only firestore:rules
```

### Issue: "No matching index found"

**Solution:** Deploy Firestore indexes:

```bash
firebase deploy --only firestore:indexes
```

### Issue: "User not found in Firestore"

**Solution:** User profile not created. Call `userService.createUserProfile()` after registration.

### Issue: "exactOptionalPropertyTypes error"

**Solution:** Use `| undefined` for all optional properties:

```typescript
// ✅ CORRECT
interface User {
  phoneNumber?: string | undefined;
}

// ❌ WRONG
interface User {
  phoneNumber?: string;
}
```

---

**Last Updated:** 2025-11-11
**Need Help?** Check [SCHEMA.md](./SCHEMA.md) or [README.md](./README.md)
