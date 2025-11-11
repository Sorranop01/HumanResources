# Seed Scripts Documentation

## 🔄 อัพเดทสำคัญ: ใช้ Admin SDK

Seed scripts ได้ถูกอัพเดทให้ใช้ **Firebase Admin SDK** แทน Client SDK เพื่อ:
- ✅ Bypass Security Rules (มี full access)
- ✅ ไม่ต้องมี Authentication
- ✅ เหมาะสำหรับ admin operations
- ✅ ทำงานได้เร็วกว่า

## 🌱 Seed Users

สร้าง default users สำหรับการพัฒนา:

```bash
pnpm run seed:users
```

### คำแนะนำ
1. **ต้องรัน emulator ก่อน:**
   ```bash
   # Terminal 1
   pnpm run emulators
   ```

2. **จากนั้นรัน seed (terminal ใหม่):**
   ```bash
   # Terminal 2
   pnpm run seed:users
   ```

### Default Users ที่จะถูกสร้าง

| Role      | Email                  | Password     | Phone        |
|-----------|------------------------|--------------|--------------|
| Admin     | admin@example.com      | admin123     | 0812345678   |
| HR        | hr@example.com         | hr123456     | 0823456789   |
| Manager   | manager@example.com    | manager123   | 0834567890   |
| Employee  | employee@example.com   | employee123  | 0845678901   |
| Auditor   | auditor@example.com    | auditor123   | 0856789012   |

### ข้อมูลที่จะถูกเก็บ

```typescript
{
  id: "seed_admin_1234567890_abc123",
  email: "admin@example.com",
  displayName: "ผู้ดูแลระบบ",
  role: "admin",                 // Primary key
  roleId: "PN7kF15dAQCb...",     // Foreign key (ถ้ามี roleDefinitions)
  roleName: "ผู้ดูแลระบบ",        // Denormalized (ถ้ามี roleDefinitions)
  phoneNumber: "0812345678",
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "seed-script-admin",
  updatedBy: "seed-script-admin"
}
```

## 🧹 Clear Emulator Data

ลบข้อมูลทั้งหมดจาก Firestore emulator:

```bash
pnpm run clear:emulator
```

### Collections ที่จะถูกลบ
- `users`
- `employees`
- `rbacAuditLogs`
- `roleDefinitions`
- `userRoleAssignments`
- `permissionDefinitions`
- `rolePermissions`

### หมายเหตุ
- ✅ ลบเฉพาะข้อมูลใน Firestore
- ⚠️  Auth users ยังคงอยู่ (ต้องลบใน Auth emulator UI เอง)

## 🔄 Reset Emulator

ลบข้อมูลเดิมและสร้าง default users ใหม่:

```bash
pnpm run reset:emulator
```

เท่ากับรัน:
```bash
pnpm run clear:emulator && pnpm run seed:users
```

## ⚠️ การแก้ปัญหา

### ❌ Error: PERMISSION_DENIED
```
[FirebaseError: 7 PERMISSION_DENIED]
```

**สาเหตุ:** ใช้ Client SDK ที่ต้องผ่าน Security Rules

**วิธีแก้:** ใช้ Admin SDK scripts แทน (scripts ใหม่ที่มี `-admin` suffix)
- ✅ `seed-users-admin.ts` (ใหม่)
- ❌ `seed-users.ts` (เก่า - จะมี permission error)

### ❌ Error: Connection refused
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**สาเหตุ:** Emulator ไม่ได้รัน

**วิธีแก้:**
```bash
# เริ่ม emulator ก่อน
pnpm run emulators
```

### ❌ Error: Cannot find module 'firebase-admin'
```
Cannot find module 'firebase-admin'
```

**สาเหตุ:** ไม่ได้ install firebase-admin

**วิธีแก้:**
```bash
pnpm add -D firebase-admin
```

## 🔧 Technical Details

### Admin SDK vs Client SDK

| Feature | Client SDK | Admin SDK |
|---------|-----------|-----------|
| Security Rules | ✅ ต้องผ่าน | ❌ Bypass |
| Authentication | ✅ ต้องมี | ❌ ไม่ต้อง |
| Use Case | User actions | Admin operations |
| Access Level | Limited | Full |

### การทำงานของ Seed Script

```typescript
// 1. Initialize Admin SDK
initializeApp({ projectId: 'human-b4c2c' });

// 2. Connect to Emulator
db.settings({
  host: 'localhost:8080',
  ssl: false
});

// 3. Create users directly (bypass security rules)
await db.collection('users').doc(userId).set(userData);
```

## 📋 Workflow แนะนำ

### การเริ่มต้นครั้งแรก

```bash
# 1. Build functions
pnpm run build:functions

# 2. Start emulators (Terminal 1)
pnpm run emulators

# 3. Seed default users (Terminal 2)
pnpm run seed:users

# 4. Start dev server (Terminal 3)
pnpm run dev
```

### การ Reset ข้อมูลใหม่

```bash
# ขณะที่ emulator กำลังรัน
pnpm run reset:emulator
```

### การบันทึกข้อมูลสำหรับใช้ครั้งหลัง

```bash
# 1. Export ข้อมูล (ขณะที่ emulator กำลังรัน)
pnpm run emulators:export

# 2. ครั้งต่อไปเริ่ม emulator พร้อมข้อมูลเดิม
pnpm run emulators:import
```

## 📚 Related Documentation

- [Denormalization Pattern](./DENORMALIZATION_PATTERN.md) - การจัดเก็บข้อมูล role
- [Phone Number Format](./PHONE_NUMBER_FORMAT.md) - รูปแบบเบอร์โทร

## 💡 Tips

1. **ใช้ seed script เมื่อไหร่?**
   - เริ่มพัฒนาครั้งแรก
   - หลัง clear emulator
   - ต้องการ test data

2. **ไม่ควรใช้ seed script เมื่อไหร่?**
   - Production environment (อันตราย!)
   - มีข้อมูลจริงอยู่แล้ว
   - ต้องการ test specific scenarios

3. **การปรับแต่ง seed data:**
   แก้ไขไฟล์ `scripts/seed-users-admin.ts`:
   ```typescript
   const SEED_USERS: SeedUser[] = [
     {
       email: 'your-email@example.com',
       password: 'your-password',
       displayName: 'Your Name',
       role: 'admin',
     },
     // ... เพิ่ม users ได้เลย
   ];
   ```

4. **การดูข้อมูลที่สร้าง:**
   - เปิด Emulator UI: http://localhost:4000
   - ไปที่ Firestore tab
   - ดู `users` collection
