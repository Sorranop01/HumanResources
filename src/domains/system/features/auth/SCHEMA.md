# Firestore Schema Documentation - Auth Feature

Version: 1.0.0 | Last Updated: 2025-11-11

## 📋 Table of Contents

- [Collection: users](#collection-users)
- [Collection: userSessions](#collection-usersessions-optional)
- [Collection: passwordResetTokens](#collection-passwordresettokens-optional)
- [Collection: userActivityLogs](#collection-useractivitylogs-optional)
- [Indexes](#indexes)
- [Security Rules](#security-rules)

---

## Collection: `users`

**Path:** `/users/{userId}`

Primary collection สำหรับเก็บข้อมูล user profiles

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Firebase Auth UID (same as document ID) |
| `email` | `string` | ✅ Yes | User email address (unique, from Firebase Auth) |
| `displayName` | `string` | ✅ Yes | User display name |
| `role` | `Role` | ✅ Yes | User role: `ADMIN` \| `HR` \| `MANAGER` \| `EMPLOYEE` |
| `phoneNumber` | `string \| undefined` | ❌ No | Optional phone number (E.164 format) |
| `photoURL` | `string \| undefined` | ❌ No | Optional profile photo URL (Cloud Storage) |
| `isActive` | `boolean` | ✅ Yes | Account active status (default: true) |
| `createdAt` | `Timestamp` | ✅ Yes | Document creation timestamp |
| `updatedAt` | `Timestamp` | ✅ Yes | Last update timestamp |

### Validation Rules

```typescript
// Email validation
/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Phone number validation (E.164 format)
/^\+[1-9]\d{1,14}$/

// Role validation
['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']

// Display name
minLength: 1
maxLength: 100
```

### Default Values

```typescript
{
  role: 'EMPLOYEE',
  isActive: true,
  phoneNumber: undefined,
  photoURL: undefined
}
```

---

## Collection: `userSessions` (Optional)

**Path:** `/userSessions/{sessionId}`

Track active user sessions สำหรับ security monitoring

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | `string` | ✅ Yes | Unique session identifier |
| `userId` | `string` | ✅ Yes | Reference to users/{userId} |
| `deviceInfo.userAgent` | `string` | ✅ Yes | Browser user agent string |
| `deviceInfo.platform` | `string` | ✅ Yes | Operating system |
| `deviceInfo.browser` | `string` | ✅ Yes | Browser name and version |
| `ipAddress` | `string` | ✅ Yes | Client IP address |
| `loginAt` | `Timestamp` | ✅ Yes | Login timestamp |
| `lastActivityAt` | `Timestamp` | ✅ Yes | Last activity timestamp |
| `expiresAt` | `Timestamp` | ✅ Yes | Session expiration (TTL: 24 hours) |
| `isActive` | `boolean` | ✅ Yes | Session active status |

### TTL Configuration

```javascript
// Firebase Console > Firestore > Indexes
// Set TTL policy on expiresAt field
{
  collection: 'userSessions',
  ttlField: 'expiresAt',
  enabled: true
}
```

---

## Collection: `passwordResetTokens` (Optional)

**Path:** `/passwordResetTokens/{tokenId}`

Store password reset tokens (ถ้าไม่ใช้ Firebase Auth default reset)

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tokenId` | `string` | ✅ Yes | Unique token identifier |
| `userId` | `string` | ✅ Yes | Reference to users/{userId} |
| `email` | `string` | ✅ Yes | User email |
| `token` | `string` | ✅ Yes | Hashed token value |
| `createdAt` | `Timestamp` | ✅ Yes | Token creation timestamp |
| `expiresAt` | `Timestamp` | ✅ Yes | Token expiration (TTL: 1 hour) |
| `used` | `boolean` | ✅ Yes | Whether token has been used |

### TTL Configuration

```javascript
{
  collection: 'passwordResetTokens',
  ttlField: 'expiresAt',
  enabled: true
}
```

---

## Collection: `userActivityLogs` (Optional)

**Path:** `/userActivityLogs/{logId}`

Audit log สำหรับ track user activities

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `logId` | `string` | ✅ Yes | Unique log identifier |
| `userId` | `string` | ✅ Yes | Reference to users/{userId} |
| `action` | `ActionType` | ✅ Yes | Action type (see below) |
| `metadata` | `Record<string, unknown>` | ❌ No | Additional action metadata |
| `ipAddress` | `string \| undefined` | ❌ No | Client IP address |
| `userAgent` | `string \| undefined` | ❌ No | Browser user agent |
| `timestamp` | `Timestamp` | ✅ Yes | Action timestamp |

### Action Types

```typescript
type ActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'PROFILE_UPDATE'
  | 'ROLE_CHANGE';
```

---

## Indexes

### Composite Indexes

```javascript
// firebase.json
{
  "firestore": {
    "indexes": [
      {
        "collectionGroup": "users",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "isActive", "order": "ASCENDING" },
          { "fieldPath": "role", "order": "ASCENDING" },
          { "fieldPath": "createdAt", "order": "DESCENDING" }
        ]
      },
      {
        "collectionGroup": "users",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "email", "order": "ASCENDING" }
        ]
      },
      {
        "collectionGroup": "userSessions",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "userId", "order": "ASCENDING" },
          { "fieldPath": "isActive", "order": "ASCENDING" },
          { "fieldPath": "loginAt", "order": "DESCENDING" }
        ]
      },
      {
        "collectionGroup": "userActivityLogs",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "userId", "order": "ASCENDING" },
          { "fieldPath": "timestamp", "order": "DESCENDING" }
        ]
      }
    ]
  }
}
```

### Single Field Indexes (Auto-created)

- `users.email` (ASC)
- `users.role` (ASC)
- `users.isActive` (ASC)
- `userSessions.userId` (ASC)

---

## Security Rules

### Complete Rules File

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'ADMIN';
    }

    function isHROrAdmin() {
      return isAuthenticated() && getUserRole() in ['ADMIN', 'HR'];
    }

    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read user profiles
      allow read: if isAuthenticated();

      // Users can create their own profile with EMPLOYEE role only
      allow create: if isOwner(userId)
                    && request.resource.data.role == 'EMPLOYEE'
                    && request.resource.data.email == request.auth.token.email
                    && request.resource.data.id == userId;

      // Users can update their own limited fields
      allow update: if isOwner(userId)
                    && !request.resource.data.diff(resource.data)
                        .affectedKeys()
                        .hasAny(['id', 'email', 'role', 'isActive', 'createdAt']);

      // Admins can update any user (including role and isActive)
      allow update: if isAdmin();

      // No one can delete users (soft delete via isActive)
      allow delete: if false;
    }

    // User sessions collection
    match /userSessions/{sessionId} {
      // Users can read their own sessions
      allow read: if isAuthenticated()
                  && resource.data.userId == request.auth.uid;

      // Admins can read all sessions
      allow read: if isAdmin();

      // Users can create their own sessions
      allow create: if isAuthenticated()
                    && request.resource.data.userId == request.auth.uid;

      // Users can update their own sessions (lastActivityAt)
      allow update: if isAuthenticated()
                    && resource.data.userId == request.auth.uid;

      // Users can delete their own sessions (logout)
      allow delete: if isAuthenticated()
                    && resource.data.userId == request.auth.uid;
    }

    // Password reset tokens
    match /passwordResetTokens/{tokenId} {
      // Only server-side can read/write
      allow read, write: if false;
    }

    // User activity logs
    match /userActivityLogs/{logId} {
      // Users can read their own logs
      allow read: if isAuthenticated()
                  && resource.data.userId == request.auth.uid;

      // HR and Admins can read all logs
      allow read: if isHROrAdmin();

      // Only server-side can write logs
      allow write: if false;
    }
  }
}
```

---

## Query Examples

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
const employees = snapshot.docs.map(doc => doc.data());
```

### Get User by Email

```typescript
const usersRef = collection(db, 'users');
const q = query(usersRef, where('email', '==', 'user@example.com'));
const snapshot = await getDocs(q);
const user = snapshot.docs[0]?.data();
```

### Get User Active Sessions

```typescript
const sessionsRef = collection(db, 'userSessions');
const q = query(
  sessionsRef,
  where('userId', '==', currentUserId),
  where('isActive', '==', true)
);
const snapshot = await getDocs(q);
const sessions = snapshot.docs.map(doc => doc.data());
```

### Get User Activity History

```typescript
import { orderBy, limit } from 'firebase/firestore';

const logsRef = collection(db, 'userActivityLogs');
const q = query(
  logsRef,
  where('userId', '==', currentUserId),
  orderBy('timestamp', 'desc'),
  limit(50)
);
const snapshot = await getDocs(q);
const logs = snapshot.docs.map(doc => doc.data());
```

---

## Data Migration

### Initial Setup Script

```typescript
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

/**
 * Create initial admin user
 * Run this once after Firebase Auth user is created
 */
const createInitialAdmin = async (
  authUid: string,
  email: string,
  displayName: string
) => {
  const userRef = doc(db, 'users', authUid);

  await setDoc(userRef, {
    id: authUid,
    email: email,
    displayName: displayName,
    role: 'ADMIN',
    phoneNumber: undefined,
    photoURL: undefined,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  console.log('Initial admin user created:', authUid);
};
```

---

## Best Practices

### 1. Always Use Timestamps

```typescript
import { Timestamp } from 'firebase/firestore';

// ✅ CORRECT
createdAt: Timestamp.now()

// ❌ WRONG
createdAt: new Date()
createdAt: Date.now()
```

### 2. Handle Optional Fields Correctly

```typescript
// ✅ CORRECT (exactOptionalPropertyTypes)
interface User {
  phoneNumber?: string | undefined;
}

const user = {
  phoneNumber: data.phone ?? undefined  // null → undefined
};

// ❌ WRONG
interface User {
  phoneNumber?: string;  // Missing | undefined
}
```

### 3. Convert Timestamps When Reading

```typescript
// ✅ CORRECT
const user = {
  ...data,
  createdAt: data.createdAt instanceof Timestamp
    ? data.createdAt.toDate()
    : data.createdAt
};

// ❌ WRONG (leaving as Timestamp)
const user = data;
```

### 4. Use Transactions for Critical Updates

```typescript
import { runTransaction } from 'firebase/firestore';

await runTransaction(db, async (transaction) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await transaction.get(userRef);

  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  transaction.update(userRef, {
    role: 'ADMIN',
    updatedAt: Timestamp.now()
  });
});
```

---

## Monitoring & Maintenance

### 1. Monitor Collection Sizes

```bash
# Check document counts
firebase firestore:count users
firebase firestore:count userSessions
firebase firestore:count userActivityLogs
```

### 2. Cleanup Old Sessions (Cloud Function)

```typescript
// functions/src/scheduled/cleanupSessions.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const cleanupExpiredSessions = onSchedule(
  { schedule: 'every 24 hours', region: 'asia-southeast1' },
  async () => {
    const now = Timestamp.now();
    const expiredSessions = await db
      .collection('userSessions')
      .where('expiresAt', '<', now)
      .get();

    const batch = db.batch();
    expiredSessions.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
);
```

### 3. Audit Logs Retention

```typescript
// Keep logs for 90 days only
const retentionDate = Timestamp.fromDate(
  new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
);

const oldLogs = await db
  .collection('userActivityLogs')
  .where('timestamp', '<', retentionDate)
  .get();
```
