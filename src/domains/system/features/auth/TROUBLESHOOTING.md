# Auth Feature - Troubleshooting Guide

คู่มือแก้ปัญหาสำหรับ auth feature

Version: 1.0.0 | Last Updated: 2025-11-11

---

## 🚨 ปัญหาที่พบบ่อย

### 1. ไม่สามารถสมัครสมาชิกได้

**อาการ:**
- กดปุ่ม "สมัครสมาชิก" แล้วไม่มีอะไรเกิดขึ้น
- หรือแสดง error message "สมัครสมาชิกไม่สำเร็จ"

**สาเหตุที่เป็นไปได้:**

#### 1.1 Firestore ไม่รับค่า `undefined`

**Error Message:**
```
Function setDoc() called with invalid data. Unsupported field value: undefined
```

**สาเหตุ:**
- Firestore ไม่รับค่า `undefined` ใน document fields
- Optional fields เช่น `phoneNumber`, `photoURL` ถูกส่งเป็น `undefined`

**วิธีแก้:** ✅ แก้ไขแล้ว
```typescript
// ❌ WRONG - Sends undefined to Firestore
const userProfile = {
  phoneNumber: data.phoneNumber ?? undefined, // Will be undefined if null
  photoURL: data.photoURL ?? undefined,
};

// ✅ CORRECT - Only include fields with values
const profileData: Record<string, unknown> = {
  id: data.id,
  email: data.email,
  displayName: data.displayName,
};

// Only add optional fields if they have values
if (data.phoneNumber) {
  profileData.phoneNumber = data.phoneNumber;
}
```

#### 1.2 Firestore Security Rules ไม่อนุญาต

**Error Message:**
```
Missing or insufficient permissions
```

**สาเหตุ:**
- Firestore rules ไม่อนุญาตให้ user สร้าง profile ของตัวเอง

**วิธีตรวจสอบ:**
```bash
# 1. Check firestore.rules file
cat firestore.rules

# 2. Verify rules are deployed
firebase deploy --only firestore:rules
```

**Rules ที่ถูกต้อง:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow users to create their own profile
      allow create: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.role == 'EMPLOYEE';
    }
  }
}
```

#### 1.3 Firebase Auth Error

**Error Messages:**
- `auth/email-already-in-use` - อีเมลนี้ถูกใช้งานแล้ว
- `auth/weak-password` - รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
- `auth/invalid-email` - รูปแบบอีเมลไม่ถูกต้อง

**วิธีแก้:**
- เปลี่ยนอีเมล (กรณี email-already-in-use)
- ใช้รหัสผ่านยาวกว่า 6 ตัวอักษร
- ตรวจสอบรูปแบบอีเมล

---

### 2. ลงชื่อเข้าใช้ไม่ได้

**อาการ:**
- ใส่อีเมลและรหัสผ่านแล้ว แต่เข้าไม่ได้

**สาเหตุที่เป็นไปได้:**

#### 2.1 รหัสผ่านไม่ถูกต้อง

**Error Message:**
```
auth/wrong-password
```

**วิธีแก้:**
- ตรวจสอบรหัสผ่านอีกครั้ง
- ใช้ "ลืมรหัสผ่าน" เพื่อรีเซ็ตรหัสผ่าน

#### 2.2 ไม่พบผู้ใช้

**Error Message:**
```
auth/user-not-found
```

**วิธีแก้:**
- ตรวจสอบว่าได้สมัครสมาชิกแล้วหรือยัง
- ตรวจสอบอีเมลว่าถูกต้อง

#### 2.3 บัญชีถูกปิดการใช้งาน

**Error Message:**
```
auth/user-disabled
```

**วิธีแก้:**
- ติดต่อ admin เพื่อเปิดการใช้งานบัญชี
- Admin: ไปที่ Firebase Console > Authentication > Users > Enable account

---

### 3. Firestore Profile ไม่ถูกสร้าง

**อาการ:**
- สมัครสมาชิกสำเร็จ (Firebase Auth)
- แต่ไม่มี profile ใน Firestore

**สาเหตุ:**
- Firestore profile creation failed แต่ Firebase Auth user สร้างสำเร็จ

**วิธีตรวจสอบ:**
```bash
# Check Firebase Console
# 1. Authentication > Users (should have user)
# 2. Firestore > users collection (should have document)
```

**วิธีแก้:** ✅ แก้ไขแล้ว
- เพิ่ม error handling เพื่อลบ Auth user ถ้า Firestore creation ล้มเหลว

```typescript
try {
  // Create Auth user
  const userCredential = await createUserWithEmailAndPassword(...);

  // Create Firestore profile
  await userService.createUserProfile(...);
} catch (error) {
  // Cleanup: Delete Auth user if Firestore creation failed
  if (userCredential) {
    await userCredential.user.delete();
  }
  throw error;
}
```

---

### 4. TypeScript Errors

#### 4.1 exactOptionalPropertyTypes Error

**Error Message:**
```typescript
Type 'undefined' is not assignable to type 'string'
```

**สาเหตุ:**
- `exactOptionalPropertyTypes: true` ใน tsconfig.json
- Optional properties ต้องมี `| undefined` explicit

**วิธีแก้:**
```typescript
// ❌ WRONG
interface User {
  phoneNumber?: string;
}

// ✅ CORRECT
interface User {
  phoneNumber?: string | undefined;
}
```

#### 4.2 Unused Imports

**Error Message:**
```
'useState' is declared but its value is never read
```

**วิธีแก้:**
- ลบ imports ที่ไม่ได้ใช้

---

### 5. Network Errors

#### 5.1 CORS Error

**Error Message:**
```
Access to fetch at '...' has been blocked by CORS policy
```

**วิธีแก้:**
- ตรวจสอบ Firebase config
- ตรวจสอบว่าใช้ domain ที่ authorized ใน Firebase Console

#### 5.2 Connection Timeout

**Error Message:**
```
auth/network-request-failed
```

**วิธีแก้:**
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
- ตรวจสอบ Firebase service status

---

## 🔧 วิธีการ Debug

### 1. Enable Console Logging

```typescript
// src/domains/system/features/auth/services/authService.ts
async register(data: RegisterData) {
  console.log('Starting registration...', { email: data.email });

  try {
    const userCredential = await createUserWithEmailAndPassword(...);
    console.log('Auth user created:', userCredential.user.uid);

    await userService.createUserProfile(...);
    console.log('Firestore profile created');

    return userCredential;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

### 2. Check Browser Console

```bash
# Open browser DevTools (F12)
# Go to Console tab
# Look for errors when clicking "สมัครสมาชิก"
```

### 3. Check Firebase Console

**Authentication:**
```
Firebase Console > Authentication > Users
- Should see new users after registration
```

**Firestore:**
```
Firebase Console > Firestore > users collection
- Should see user documents
```

**Security Rules:**
```
Firebase Console > Firestore > Rules
- Check rule evaluation logs
```

---

## 📋 Pre-flight Checklist

ตรวจสอบก่อนทดสอบการสมัครสมาชิก:

### Environment Setup
- [ ] `.env.development` file exists with all Firebase config
- [ ] Firebase project configured correctly
- [ ] Running on correct environment (dev/staging/prod)

### Firebase Console
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Indexes deployed

### Code
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] No console errors in browser

---

## 🆘 Emergency Fixes

### Quick Fix: Reset Everything

```bash
# 1. Delete all test users from Firebase Console
Firebase Console > Authentication > Users > Delete All

# 2. Delete all Firestore documents
Firebase Console > Firestore > users > Delete collection

# 3. Redeploy rules
firebase deploy --only firestore:rules

# 4. Restart dev server
pnpm dev

# 5. Clear browser cache & reload
Ctrl+Shift+R (hard reload)
```

### Quick Fix: Temporary Open Rules (DEV ONLY!)

```javascript
// firestore.rules - ⚠️ DEVELOPMENT ONLY
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Allow all temporarily
    }
  }
}
```

```bash
# Deploy
firebase deploy --only firestore:rules

# ⚠️ REMEMBER TO REVERT AFTER TESTING!
```

---

## 📞 Get Help

### Internal Resources
1. [README.md](./README.md) - Feature overview
2. [SCHEMA.md](./SCHEMA.md) - Database schema
3. [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
4. [scripts/README.md](./scripts/README.md) - Script usage

### External Resources
1. [Firebase Auth Docs](https://firebase.google.com/docs/auth)
2. [Firestore Docs](https://firebase.google.com/docs/firestore)
3. [Security Rules Docs](https://firebase.google.com/docs/rules)

---

**Last Updated:** 2025-11-11
**Version:** 1.0.0
