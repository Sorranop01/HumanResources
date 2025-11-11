# Auth Feature - HumanResources Admin System

Complete authentication and user management feature with Firebase Auth + Firestore integration.

## 📁 Directory Structure

```
auth/
├── components/           # UI components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ForgotPasswordForm.tsx
├── hooks/               # React hooks
│   ├── useLogin.ts
│   ├── useRegister.ts
│   ├── useLogout.ts
│   └── useForgotPassword.ts
├── pages/               # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── ForgotPasswordPage.tsx
├── schemas/             # Zod validation schemas
│   └── authSchemas.ts
├── services/            # Business logic
│   ├── authService.ts   # Firebase Auth operations
│   └── userService.ts   # Firestore user management
├── types/               # TypeScript types
│   └── firestoreTypes.ts
├── COLLECTIONS.md       # 📚 Firestore collections guide
├── SCHEMA.md           # 📚 Complete schema documentation
├── README.md           # 📚 This file
└── index.ts            # Public exports
```

## 🚀 Quick Start

### 1. Login User

```typescript
import { useLogin } from '@/domains/system/features/auth';

function LoginPage() {
  const { login, isPending } = useLogin();

  const handleSubmit = async (data: LoginFormData) => {
    await login({
      email: data.email,
      password: data.password,
    });
    // User is now logged in
  };
}
```

### 2. Register New User

```typescript
import { useRegister } from '@/domains/system/features/auth';

function RegisterPage() {
  const { register, isPending } = useRegister();

  const handleSubmit = async (data: RegisterFormData) => {
    await register({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
    });
    // User created + profile created in Firestore
  };
}
```

### 3. Get User Profile

```typescript
import { userService } from '@/domains/system/features/auth';

const profile = await userService.getUserProfile(userId);

if (profile) {
  console.log(profile.displayName, profile.role);
}
```

### 4. Update User Profile

```typescript
await userService.updateUserProfile(userId, {
  displayName: 'New Name',
  phoneNumber: '+66812345678',
});
```

## 📦 Firestore Collections

### Primary Collection: `users`

```typescript
{
  id: string;                       // Firebase Auth UID
  email: string;                    // User email
  displayName: string;              // Display name
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  phoneNumber?: string | undefined;
  photoURL?: string | undefined;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**ดูข้อมูลเพิ่มเติม:** [COLLECTIONS.md](./COLLECTIONS.md)

## 📋 Complete Schema Documentation

ดูรายละเอียด schema ทั้งหมดที่: [SCHEMA.md](./SCHEMA.md)

- Collection structures
- Validation rules
- Security rules
- Indexes
- Query examples
- Best practices

## 🔐 Authentication Flow

### Registration Flow

```
1. User fills RegisterForm
2. useRegister() hook validates with Zod schema
3. authService.register() creates Firebase Auth user
4. userService.createUserProfile() creates Firestore document
5. User is logged in automatically
```

### Login Flow

```
1. User fills LoginForm
2. useLogin() hook validates credentials
3. authService.login() signs in with Firebase Auth
4. onAuthStateChanged listener updates app state
5. User is redirected to dashboard
```

### Logout Flow

```
1. User clicks logout button
2. useLogout() hook calls authService.logout()
3. Firebase Auth signs out
4. User is redirected to login page
```

## 🎯 TypeScript Types

### Main Types

```typescript
// From services/authService.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

// From services/userService.ts
export interface CreateUserProfileData {
  id: string;
  email: string;
  displayName: string;
  role?: Role | undefined;
  phoneNumber?: string | undefined;
  photoURL?: string | undefined;
}

// From types/firestoreTypes.ts
export interface UserFirestoreDocument {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  phoneNumber?: string | undefined;
  photoURL?: string | undefined;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## ⚙️ Configuration

### Firebase Auth Settings

```typescript
// src/shared/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const app = initializeApp({
  projectId: 'humanresources-dev',
  // ... other config
});

export const auth = getAuth(app);
```

### Environment Variables

```bash
# .env.development
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=humanresources-dev
```

## 🔒 Security

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Anyone authenticated can read
      allow read: if request.auth != null;

      // Users can create their own profile
      allow create: if request.auth.uid == userId;

      // Users can update their own (limited fields)
      allow update: if request.auth.uid == userId
                    && !affectsProtectedFields();

      // Admins can update any user
      allow update: if isAdmin();

      // No deletes (soft delete via isActive)
      allow delete: if false;
    }
  }
}
```

**ดูรายละเอียดเต็ม:** [SCHEMA.md#security-rules](./SCHEMA.md#security-rules)

## 🧪 Testing

### Unit Tests (Example)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { authService } from './services/authService';

describe('authService', () => {
  it('should login with valid credentials', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
  });
});
```

### Integration Tests (with Emulator)

```bash
# Start Firebase emulators
pnpm emulators

# Run tests
pnpm test:integration
```

## 📚 Related Documentation

- [COLLECTIONS.md](./COLLECTIONS.md) - Firestore collections overview
- [SCHEMA.md](./SCHEMA.md) - Complete schema documentation
- [CLAUDE.md](/CLAUDE.md) - Project-wide development standards
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)

## 🛠️ Common Tasks

### Create Initial Admin User

```typescript
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

// After creating Firebase Auth user manually
const createAdmin = async (authUid: string, email: string) => {
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
};
```

### Query Users by Role

```typescript
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

const getAllHRUsers = async () => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'HR'),
    where('isActive', '==', true)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};
```

### Update User Role (Admin only)

```typescript
await userService.updateUserProfile(userId, {
  role: 'HR',
});
```

## 🚨 Error Handling

```typescript
import { authService, AUTH_ERROR_CODES } from '@/domains/system/features/auth';

try {
  await authService.login({ email, password });
} catch (error) {
  if (error.code === AUTH_ERROR_CODES.INVALID_CREDENTIALS) {
    console.error('Invalid email or password');
  } else if (error.code === AUTH_ERROR_CODES.USER_DISABLED) {
    console.error('Account has been disabled');
  } else {
    console.error('Login failed:', error.message);
  }
}
```

## 📊 Monitoring

### Check User Counts

```bash
# Firebase Console
firebase firestore:count users
```

### Active Users Today

```typescript
const today = Timestamp.fromDate(
  new Date(new Date().setHours(0, 0, 0, 0))
);

const q = query(
  collection(db, 'users'),
  where('createdAt', '>=', today),
  where('isActive', '==', true)
);
```

## 🔄 Migration Scripts

See [SCHEMA.md#data-migration](./SCHEMA.md#data-migration) for migration scripts.

---

**Version:** 1.0.0
**Last Updated:** 2025-11-11
**Maintainer:** HumanResources Dev Team
