# Auth Feature Scripts

Scripts สำหรับจัดการ Firebase Auth และ Firestore collections

## 📁 Scripts Available

### 1. `seedUsers.ts` - Seed Test Users

สร้าง Firebase Auth users พร้อม Firestore profiles

```bash
# Production (real Firebase)
pnpm tsx src/domains/system/features/auth/scripts/seedUsers.ts

# With emulators (local)
FIREBASE_EMULATOR=true pnpm tsx src/domains/system/features/auth/scripts/seedUsers.ts
```

**Creates:**
- 1 ADMIN user
- 2 HR users
- 2 MANAGER users
- 3 EMPLOYEE users

### 2. `syncProfiles.ts` - Sync Firestore Profiles

สร้าง Firestore profiles สำหรับ Firebase Auth users ที่มีอยู่แล้ว

```bash
pnpm tsx src/domains/system/features/auth/scripts/syncProfiles.ts
```

### 3. `initializeCollections.ts` - Initialize Collections

สร้าง initial admin user (requires Firebase Auth UID)

```bash
ADMIN_AUTH_UID=your-firebase-auth-uid pnpm tsx src/domains/system/features/auth/scripts/initializeCollections.ts

# With sample users
ADMIN_AUTH_UID=your-firebase-auth-uid CREATE_SAMPLES=true pnpm tsx src/domains/system/features/auth/scripts/initializeCollections.ts
```

---

## 🚀 Quick Start

### Step 1: Deploy Firestore Rules (IMPORTANT!)

```bash
# Update firestore.rules with content from:
# src/domains/system/features/auth/firestore.rules.example

# Deploy
firebase deploy --only firestore:rules
```

### Step 2: Seed Users

```bash
# This will create both Firebase Auth users AND Firestore profiles
pnpm tsx src/domains/system/features/auth/scripts/seedUsers.ts
```

⚠️ **NOTE:** Script ต้องการ permission ในการเขียน Firestore
- Production: ต้อง update Firestore rules ให้อนุญาตการสร้าง user profiles
- หรือใช้ Firebase Admin SDK แทน

### Step 3: Verify

```bash
# Check Firebase Console
# 1. Authentication > Users (should see 8 users)
# 2. Firestore > users (should see 8 documents)
```

---

## 🔐 Test Credentials

### ADMIN
```
Email: admin@company.com
Password: Admin@123456
Role: ADMIN
```

### HR
```
Email: hr@company.com
Password: HR@123456
Role: HR

Email: hr.assistant@company.com
Password: HR@123456
Role: HR
```

### MANAGER
```
Email: manager.sales@company.com
Password: Manager@123456
Role: MANAGER

Email: manager.it@company.com
Password: Manager@123456
Role: MANAGER
```

### EMPLOYEE
```
Email: employee1@company.com
Password: Employee@123456
Role: EMPLOYEE

Email: employee2@company.com
Password: Employee@123456
Role: EMPLOYEE

Email: employee3@company.com
Password: Employee@123456
Role: EMPLOYEE
```

⚠️ **IMPORTANT:** เปลี่ยนรหัสผ่านทันทีใน production!

---

## 🔧 Troubleshooting

### Error: "Missing or insufficient permissions"

**Problem:** Firestore rules ไม่อนุญาตให้สร้าง user profiles

**Solution 1:** ใช้ Firebase Emulator (local)
```bash
# Start emulators
firebase emulators:start

# Run script with emulator
FIREBASE_EMULATOR=true pnpm tsx src/domains/system/features/auth/scripts/seedUsers.ts
```

**Solution 2:** ใช้ Firebase Admin SDK
- สร้าง service account key จาก Firebase Console
- ใช้ Admin SDK แทน client SDK

**Solution 3:** อัพเดท Firestore rules ชั่วคราว
```javascript
// ⚠️ DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Allow all (temporary)
    }
  }
}
```

### Error: "email-already-in-use"

**Problem:** User already exists in Firebase Auth

**Solution:** Script จะ skip users ที่มีอยู่แล้วโดยอัตโนมัติ

หรือลบ users เก่าจาก Firebase Console > Authentication

### Error: "Cannot read properties of undefined (reading 'VITE_FIREBASE_API_KEY')"

**Problem:** Missing environment variables

**Solution:** สร้าง `.env.development` file:
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 🧹 Clean Up

### Delete All Test Users

```bash
# Via Firebase Console > Authentication
# Select all users > Delete
```

### Delete All Firestore Profiles

```bash
# Via Firebase Console > Firestore > users collection
# Delete collection
```

---

## 📚 Related Documentation

- [../COLLECTIONS.md](../COLLECTIONS.md) - Firestore collections schema
- [../SCHEMA.md](../SCHEMA.md) - Complete schema documentation
- [../QUICKSTART.md](../QUICKSTART.md) - Quick start guide

---

## 🔐 Security Notes

1. **Never commit passwords** - Change all test passwords in production
2. **Never commit service account keys** - Add `*-key.json` to `.gitignore`
3. **Always use strong passwords** in production
4. **Enable 2FA** for admin accounts in production
5. **Review Firestore rules** before deploying to production

---

Last Updated: 2025-11-11
