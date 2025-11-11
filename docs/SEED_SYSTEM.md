# Seed System Documentation

## 🌱 Overview

ระบบ seed data ที่ครบถ้วนสำหรับการพัฒนา ประกอบด้วย:
1. **Roles** (roleDefinitions) - บทบาทของผู้ใช้
2. **Users** - ผู้ใช้งานระบบพร้อม denormalized role data

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run seed:roles` | สร้าง/อัพเดท roles เท่านั้น |
| `pnpm run seed:users` | สร้าง users เท่านั้น (ต้องมี roles ก่อน) |
| `pnpm run seed:all` | สร้างทั้ง roles และ users (แนะนำ!) |
| `pnpm run clear:emulator` | ลบข้อมูลทั้งหมด |
| `pnpm run reset:emulator` | ลบแล้วสร้างใหม่ |

## 🚀 Quick Start

### วิธีที่ 1: Seed ทั้งหมดพร้อมกัน (แนะนำ)

```bash
# Terminal 1: Start emulator
pnpm run emulators

# Terminal 2: Seed everything
pnpm run seed:all
```

### วิธีที่ 2: Seed ทีละส่วน

```bash
# Terminal 1: Start emulator
pnpm run emulators

# Terminal 2: Seed roles first
pnpm run seed:roles

# Then seed users
pnpm run seed:users
```

## 🎭 Roles (roleDefinitions)

### Default Roles

| Role | Name | Description | System Role |
|------|------|-------------|-------------|
| `admin` | ผู้ดูแลระบบ | มีสิทธิ์เข้าถึงระบบทั้งหมด | ✅ Yes |
| `hr` | ฝ่ายทรัพยากรบุคคล | จัดการข้อมูลพนักงาน การลา การเข้างาน | ✅ Yes |
| `manager` | ผู้จัดการ | อนุมัติการลา ดูรายงานของทีม | ✅ Yes |
| `employee` | พนักงาน | ดูข้อมูลส่วนตัว บันทึกเวลา ขอลา | ✅ Yes |
| `auditor` | ผู้ตรวจสอบ | ดูข้อมูลและรายงานทั้งหมด | ✅ Yes |

### Role Document Structure

```typescript
roleDefinitions / {roleId}
  id: "PN7kF15dAQCb..."
  role: "admin"                          // String enum
  name: "ผู้ดูแลระบบ"                     // Display name
  description: "มีสิทธิ์เข้าถึง..."        // Full description
  isSystemRole: true                     // Cannot be deleted
  isActive: true
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: "seed-script-admin"
  updatedBy: "seed-script-admin"
```

### Features

- ✅ **Idempotent**: รัน `seed:roles` ซ้ำได้ (update แทน create ใหม่)
- ✅ **System Roles**: ป้องกันการลบโดยไม่ตั้งใจ
- ✅ **Versioning**: track createdAt/updatedAt

## 👥 Users

### Default Users

| Role | Email | Password | Phone | Name |
|------|-------|----------|-------|------|
| Admin | admin@example.com | admin123 | 0812345678 | ผู้ดูแลระบบ |
| HR | hr@example.com | hr123456 | 0823456789 | ฝ่ายทรัพยากรบุคคล |
| Manager | manager@example.com | manager123 | 0834567890 | ผู้จัดการแผนก |
| Employee | employee@example.com | employee123 | 0845678901 | สมชาย ใจดี |
| Auditor | auditor@example.com | auditor123 | 0856789012 | ผู้ตรวจสอบ |

### User Document Structure (with Denormalization)

```typescript
users / {userId}
  id: "seed_admin_1234567890_abc123"
  email: "admin@example.com"
  displayName: "ผู้ดูแลระบบ"

  // Role Information (3 fields - Denormalized)
  role: "admin"                          // Primary: for logic & rules
  roleId: "PN7kF15dAQCb..."             // Foreign key: to roleDefinitions
  roleName: "ผู้ดูแลระบบ"                // Denormalized: for UI display

  phoneNumber: "0812345678"
  isActive: true
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: "seed-script-admin"
  updatedBy: "seed-script-admin"
```

### Role Mapping Flow

```
1. seed:all starts
   ↓
2. Seed roles first
   roleDefinitions created
   ↓
3. Build role map
   Map<role, {id, name}>
   {
     "admin" → { id: "PN7kF...", name: "ผู้ดูแลระบบ" }
     "hr" → { id: "QM8gG...", name: "ฝ่ายทรัพยากรบุคคล" }
     ...
   }
   ↓
4. Seed users with role map
   For each user:
     - Get roleInfo from map
     - Set: role, roleId, roleName
   ↓
5. Complete!
   Users have denormalized role data
```

## 🔄 Data Flow Example

### When Running `seed:all`

```bash
$ pnpm run seed:all

🚀 Starting complete data seeding...
📡 Connected to Firestore Emulator at localhost:8080

📋 STEP 1: Seeding Roles (roleDefinitions)

   ✅ Created: admin → ผู้ดูแลระบบ
   ✅ Created: hr → ฝ่ายทรัพยากรบุคคล
   ✅ Created: manager → ผู้จัดการ
   ✅ Created: employee → พนักงาน
   ✅ Created: auditor → ผู้ตรวจสอบ

   ✨ Roles completed: 5 roles

👥 STEP 2: Seeding Users (with denormalized role data)

   ✅ admin@example.com
      Role: admin → ผู้ดูแลระบบ (PN7kF15dAQCb...)
      Phone: 0812345678
   ✅ hr@example.com
      Role: hr → ฝ่ายทรัพยากรบุคคล (QM8gG16eBRDb...)
      Phone: 0823456789
   ...

   ✨ Users completed: 5 users

═══════════════════════════════════════════════════════════════════
🎉 All seeding completed successfully!
═══════════════════════════════════════════════════════════════════
⏱️  Duration: 1.23s
📊 Summary:
   • Roles: 5 created/updated
   • Users: 5 created
═══════════════════════════════════════════════════════════════════

📋 Login Credentials:
────────────────────────────────────────────────────────────────────
Role        Email                          Password
────────────────────────────────────────────────────────────────────
ADMIN       admin@example.com              admin123
HR          hr@example.com                 hr123456
MANAGER     manager@example.com            manager123
EMPLOYEE    employee@example.com           employee123
AUDITOR     auditor@example.com            auditor123
────────────────────────────────────────────────────────────────────
```

## 🧪 Verification

### 1. Check Firestore Emulator UI

เปิด: http://localhost:4000

**roleDefinitions Collection:**
```json
{
  "id": "PN7kF15dAQCb...",
  "role": "admin",
  "name": "ผู้ดูแลระบบ",
  "description": "มีสิทธิ์เข้าถึงระบบทั้งหมด...",
  "isSystemRole": true,
  "isActive": true
}
```

**users Collection:**
```json
{
  "id": "seed_admin_...",
  "email": "admin@example.com",
  "displayName": "ผู้ดูแลระบบ",
  "role": "admin",
  "roleId": "PN7kF15dAQCb...",      // ← From roleDefinitions
  "roleName": "ผู้ดูแลระบบ",         // ← Denormalized
  "phoneNumber": "0812345678"
}
```

### 2. Test Denormalization Sync

1. ใน Emulator UI, แก้ไข `roleDefinitions`
2. เปลี่ยน `name` จาก "ผู้ดูแลระบบ" → "Super Admin"
3. รอ 1-2 วินาที (trigger ทำงาน)
4. ดู `users` collection
5. `roleName` จะถูกอัพเดตเป็น "Super Admin" อัตโนมัติ! ✨

## 🔧 Customization

### เพิ่ม Role ใหม่

แก้ไข `scripts/seed-roles-admin.ts` และ `scripts/seed-all.ts`:

```typescript
const SEED_ROLES: SeedRole[] = [
  // ... existing roles
  {
    role: 'accountant',
    name: 'นักบัญชี',
    description: 'จัดการบัญชีและการเงิน',
    isSystemRole: false,
    isActive: true,
  },
];
```

### เพิ่ม User ใหม่

แก้ไข `scripts/seed-users-admin.ts` และ `scripts/seed-all.ts`:

```typescript
const SEED_USERS: SeedUser[] = [
  // ... existing users
  {
    email: 'accountant@example.com',
    password: 'accountant123',
    displayName: 'นักบัญชี',
    role: 'accountant',
    phoneNumber: '0867890123',
  },
];
```

## 📊 Benefits of This System

### ✅ Consistency
- Role ถูกสร้างก่อน users เสมอ
- Data mapping ถูกต้องทุกครั้ง

### ✅ Denormalization
- Users มี `roleId` และ `roleName` อัตโนมัติ
- ไม่ต้อง JOIN query (เร็วกว่า, ถูกกว่า)

### ✅ Idempotent
- รัน `seed:all` ซ้ำได้ไม่จำกัด
- Roles จะถูก update แทน create ใหม่

### ✅ Admin SDK
- Bypass Security Rules
- Full access to emulator
- ไม่ต้อง authentication

### ✅ Developer Friendly
- ครบถ้วน: roles + users
- Output ชัดเจน
- เห็นผลลัพธ์ทันที

## ⚠️ Important Notes

### 1. Emulator Only
Scripts เหล่านี้ทำงานกับ **emulator เท่านั้น**
- ✅ localhost:8080 (Firestore Emulator)
- ❌ Production database

### 2. Run Order Matters
ถ้ารัน `seed:users` โดยไม่มี roles:
- ⚠️ Users จะไม่มี `roleId` และ `roleName`
- ⚠️ ต้องรัน `seed:roles` ก่อน หรือใช้ `seed:all`

### 3. Auth Users
Scripts นี้สร้างเฉพาะ **Firestore users**
- ไม่ได้สร้าง Firebase Auth users
- ต้องสร้าง Auth users แยกผ่าน:
  - ✅ UI Registration
  - ✅ Cloud Function `createUser`
  - ✅ Auth Emulator UI (manual)

## 🎯 Recommended Workflow

### เริ่มพัฒนาครั้งแรก
```bash
# 1. Build functions
pnpm run build:functions

# 2. Start emulators
pnpm run emulators

# 3. (Terminal ใหม่) Seed all data
pnpm run seed:all

# 4. (Terminal ใหม่) Start dev
pnpm run dev
```

### Reset & Start Fresh
```bash
# ลบทุกอย่างและสร้างใหม่
pnpm run reset:emulator
```

### เพิ่ม User ใหม่ (ไม่ต้อง reset)
```bash
# แค่รัน seed:users ซ้ำ (จะสร้างเพิ่ม)
pnpm run seed:users
```

## 📚 Related Docs

- [Denormalization Pattern](./DENORMALIZATION_PATTERN.md)
- [Seed Scripts Guide](./SEED_SCRIPTS.md)
- [Phone Number Format](./PHONE_NUMBER_FORMAT.md)

## 💡 Pro Tips

1. **Export data หลัง seed:**
   ```bash
   pnpm run emulators:export
   ```
   ครั้งต่อไปใช้: `pnpm run emulators:import`

2. **ดู logs ใน real-time:**
   ```bash
   firebase emulators:start --inspect-functions
   ```

3. **Custom seed data:**
   Copy script และแก้ค่าตาม use case ของคุณ

4. **Test denormalization:**
   แก้ role name ใน UI → ดู users sync อัตโนมัติ!
