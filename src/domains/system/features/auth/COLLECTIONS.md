# Firestore Collections for Auth Feature

Version: 1.0.0 | Last Updated: 2025-11-11

## Overview

Auth feature ใช้งาน Firestore collections สำหรับเก็บข้อมูล user profiles และ authentication-related data

---

## 📊 Collections

### 1. `users` (Root Collection)

**Path:** `/users/{userId}`

เก็บข้อมูล user profile ของทุกคนในระบบ (employees, admins, etc.)

#### Document Structure

```typescript
interface UserDocument {
  id: string;                       // User UID from Firebase Auth
  email: string;                    // Email address
  displayName: string;              // Display name
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';  // User role (RBAC)
  phoneNumber?: string | undefined; // Optional phone number
  photoURL?: string | undefined;    // Optional profile photo URL
  isActive: boolean;                // Account active status
  createdAt: Timestamp;             // Creation timestamp
  updatedAt: Timestamp;             // Last update timestamp
}
```

#### Example Document

```javascript
// Document ID: "abc123xyz" (Firebase Auth UID)
{
  id: "abc123xyz",
  email: "somchai@company.com",
  displayName: "Somchai Suksai",
  role: "EMPLOYEE",
  phoneNumber: "+66812345678",
  photoURL: "https://storage.googleapis.com/...",
  isActive: true,
  createdAt: Timestamp(2025, 1, 15, 10, 30, 0),
  updatedAt: Timestamp(2025, 1, 15, 10, 30, 0)
}
```

#### Indexes Required

```javascript
// Composite indexes
users: [
  { fields: ['isActive', 'role', 'createdAt'], order: 'DESCENDING' },
  { fields: ['email'], order: 'ASCENDING' },
  { fields: ['role', 'isActive'], order: 'ASCENDING' }
]
```

#### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Anyone authenticated can read user profiles
      allow read: if request.auth != null;

      // Only the user themselves can create their own profile
      allow create: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.role == 'EMPLOYEE'; // Default role

      // Users can update their own profile (limited fields)
      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys()
                      .hasAny(['id', 'email', 'role', 'isActive', 'createdAt']);

      // Only admins can update roles and isActive
      allow update: if request.auth != null
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';

      // No one can delete users (soft delete via isActive)
      allow delete: if false;
    }
  }
}
```

---

### 2. `userSessions` (Optional - for session tracking)

**Path:** `/userSessions/{sessionId}`

เก็บข้อมูล active sessions ของ users (optional, สำหรับ security monitoring)

#### Document Structure

```typescript
interface UserSessionDocument {
  sessionId: string;        // Unique session ID
  userId: string;           // Reference to users/{userId}
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
  };
  ipAddress: string;
  loginAt: Timestamp;
  lastActivityAt: Timestamp;
  expiresAt: Timestamp;
  isActive: boolean;
}
```

#### Example Document

```javascript
// Document ID: "session_abc123"
{
  sessionId: "session_abc123",
  userId: "abc123xyz",
  deviceInfo: {
    userAgent: "Mozilla/5.0...",
    platform: "macOS",
    browser: "Chrome 120"
  },
  ipAddress: "203.154.xxx.xxx",
  loginAt: Timestamp(2025, 1, 15, 9, 0, 0),
  lastActivityAt: Timestamp(2025, 1, 15, 14, 30, 0),
  expiresAt: Timestamp(2025, 1, 16, 9, 0, 0),
  isActive: true
}
```

---

### 3. `passwordResetTokens` (Optional - for password reset)

**Path:** `/passwordResetTokens/{tokenId}`

เก็บ tokens สำหรับการ reset password (TTL: 1 hour)

#### Document Structure

```typescript
interface PasswordResetTokenDocument {
  tokenId: string;          // Unique token ID
  userId: string;           // Reference to users/{userId}
  email: string;            // User email
  token: string;            // Hashed token
  createdAt: Timestamp;
  expiresAt: Timestamp;
  used: boolean;
}
```

#### Example Document

```javascript
// Document ID: "reset_xyz789"
{
  tokenId: "reset_xyz789",
  userId: "abc123xyz",
  email: "somchai@company.com",
  token: "hashed_token_value",
  createdAt: Timestamp(2025, 1, 15, 10, 0, 0),
  expiresAt: Timestamp(2025, 1, 15, 11, 0, 0), // 1 hour TTL
  used: false
}
```

---

## 🔧 Implementation Guide

### Creating a User Profile

```typescript
import { userService } from '@/domains/system/features/auth';

// After Firebase Auth registration
const user = await userService.createUserProfile({
  id: firebaseUser.uid,
  email: firebaseUser.email!,
  displayName: formData.displayName,
  phoneNumber: formData.phoneNumber ?? undefined,
  photoURL: undefined,
  role: undefined, // Will default to EMPLOYEE
});
```

### Querying Users

```typescript
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

// Get all active employees
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

### Updating User Profile

```typescript
import { userService } from '@/domains/system/features/auth';

await userService.updateUserProfile(userId, {
  displayName: 'New Name',
  phoneNumber: '+66987654321',
});
```

---

## 🔒 Security Considerations

### 1. Authentication Required
- ทุก operations ต้อง authenticated (request.auth != null)
- ไม่อนุญาต anonymous access

### 2. Role-Based Access Control (RBAC)
- Default role สำหรับ new users: `EMPLOYEE`
- เฉพาะ `ADMIN` เท่านั้นที่เปลี่ยน `role` และ `isActive` ได้

### 3. Data Validation
- Email ต้องตรงกับ Firebase Auth email
- Role ต้องเป็น enum values เท่านั้น
- Timestamps ถูก manage โดย server-side

### 4. Soft Delete
- ไม่มีการลบ users จริง ใช้ `isActive: false` แทน

---

## 📋 Migration & Seeding

### Initial Admin User

```typescript
// Run once to create first admin
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

const createInitialAdmin = async (userId: string, email: string) => {
  await setDoc(doc(db, 'users', userId), {
    id: userId,
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

---

## 🧪 Testing Data

### Sample Users

```javascript
// Admin user
{
  id: "admin001",
  email: "admin@company.com",
  displayName: "Admin User",
  role: "ADMIN",
  isActive: true
}

// HR user
{
  id: "hr001",
  email: "hr@company.com",
  displayName: "HR Manager",
  role: "HR",
  isActive: true
}

// Employee user
{
  id: "emp001",
  email: "employee@company.com",
  displayName: "Employee Name",
  role: "EMPLOYEE",
  isActive: true
}
```

---

## 📝 Notes

1. **Document ID = Firebase Auth UID**: ใช้ Auth UID เป็น document ID เพื่อความสะดวกในการ query
2. **Timestamps**: ใช้ Firestore `Timestamp` type (ไม่ใช่ Date หรือ number)
3. **Optional Fields**: ทุก optional fields ต้องเป็น `Type | undefined` (ตาม exactOptionalPropertyTypes)
4. **Email Uniqueness**: Firebase Auth guarantee email uniqueness แล้ว
5. **Photo Storage**: `photoURL` เก็บเป็น Cloud Storage URL (ไม่ได้เก็บ base64)

---

## 🔄 Sync with Firebase Auth

User profiles ใน Firestore ต้อง sync กับ Firebase Auth:

```typescript
// Create profile หลัง Auth registration
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const profile = await userService.getUserProfile(firebaseUser.uid);
    if (!profile) {
      // Create profile if not exists
      await userService.createUserProfile({
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
      });
    }
  }
});
```
