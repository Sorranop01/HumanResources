# 🚀 Quick Start Guide - Seed Scripts

## วิธีการใช้งาน Seed Scripts สำหรับ Firebase Emulator

### ขั้นตอนที่ 1: เริ่มต้น Firebase Emulator

เปิด Terminal หน้าต่างแรก และรัน:

```bash
# ที่ root ของ project
pnpm emulators
```

หรือ

```bash
firebase emulators:start
```

รอจนกว่า Emulator จะพร้อมใช้งาน คุณจะเห็น:
```
✔ All emulators ready! It is now safe to connect.
```

### ขั้นตอนที่ 2: Seed ข้อมูล

เปิด Terminal หน้าต่างที่สอง และเลือกวิธีใดวิธีหนึ่ง:

#### วิธีที่ 1: Seed ทุกอย่างพร้อมกัน (แนะนำ)

```bash
# ที่ root ของ project
pnpm seed:all
```

#### วิธีที่ 2: Seed แยกตาม Module

```bash
# Seed RBAC (Roles, Permissions, Role-Permissions)
pnpm seed:rbac

# Seed Policies (Work Schedule, Overtime, Shift, Penalty, Holiday)
pnpm seed:policies

# Seed Users
pnpm seed:users
```

### ขั้นตอนที่ 3: ทดสอบ

เปิด browser และไปที่:
- **Admin Panel**: http://localhost:5173
- **Firestore Emulator UI**: http://localhost:4000
- **Auth Emulator UI**: http://localhost:4000/auth

ลองล็อกอินด้วย test accounts:
```
admin@human.com / admin123456
hr@human.com / hr123456
manager@human.com / manager123456
employee@human.com / employee123456
auditor@human.com / auditor123456
```

---

## 🔄 Reset ข้อมูล

หากต้องการลบข้อมูลเดิมและ seed ใหม่:

```bash
# ลบข้อมูลทั้งหมด
pnpm clear:emulator

# Reset (ลบ + seed ใหม่)
pnpm reset:emulator
```

---

## 📦 ข้อมูลที่จะถูก Seed

### 1. RBAC System
- ✅ 5 Roles (Admin, HR, Manager, Employee, Auditor)
- ✅ 8 Permission Definitions
- ✅ 30+ Role-Permission Mappings

### 2. Work Policies
- ✅ 3 Work Schedule Policies
- ✅ 2 Overtime Policies
- ✅ 5 Shifts (Morning, Afternoon, Night, 12H Day, 12H Night)
- ✅ 5 Penalty Policies
- ✅ 13 Public Holidays (2025)

### 3. Users & Auth
- ✅ 5 Test Users with Firebase Authentication
- ✅ User profiles in Firestore
- ✅ Role assignments

---

## 🐛 Troubleshooting

### ❌ Error: Cannot connect to emulator

**ปัญหา**:
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**แก้ไข**:
1. ตรวจสอบว่า Firebase Emulator กำลังรันอยู่
2. เปิด Terminal ใหม่และรัน `firebase emulators:start`

---

### ❌ Users already exist

**ปัญหา**:
```
⚠️ User admin@human.com already exists
```

**แก้ไข**:
```bash
pnpm clear:emulator
```

---

### ❌ Module not found

**ปัญหา**:
```
Error: Cannot find module 'firebase-admin'
```

**แก้ไข**:
```bash
cd packages/scripts
pnpm install
```

---

## 💡 Tips

1. **ใช้ Emulator UI**: เข้า http://localhost:4000 เพื่อดูข้อมูลที่ seed แล้ว
2. **Export Data**: สามารถ export ข้อมูลเพื่อใช้ซ้ำได้:
   ```bash
   pnpm emulators:export
   ```
3. **Import Data**: นำเข้าข้อมูลที่ export ไว้:
   ```bash
   pnpm emulators:import
   ```

---

## 📝 สำหรับ Developer

หากต้องการเพิ่ม seed data ใหม่:

1. สร้างไฟล์ seed ใหม่ใน `packages/scripts/src/seed/<module>/`
2. ใช้ Firebase Admin SDK จาก `../../config/firebase-admin.js`
3. Export ข้อมูลตาม schema ที่กำหนด
4. เพิ่ม script ใน `package.json`
5. อัพเดท `seedAll.ts` (ถ้าต้องการ)

ตัวอย่าง:
```typescript
import { db, Timestamp } from '../../config/firebase-admin.js';

async function seedMyData() {
  console.log('🌱 Seeding My Data...');
  const now = Timestamp.now();

  await db.collection('myCollection').doc('doc-1').set({
    name: 'Test',
    createdAt: now,
    updatedAt: now,
  });

  console.log('✅ Successfully seeded data');
}

seedMyData().then(() => process.exit(0)).catch(() => process.exit(1));
```

---

## 🎯 Next Steps

หลังจาก seed ข้อมูลแล้ว:

1. ✅ ลองล็อกอินด้วย test accounts
2. ✅ ตรวจสอบ permissions ของแต่ละ role
3. ✅ ทดสอบสร้าง/แก้ไข data ในระบบ
4. ✅ ตรวจสอบ policies ทำงานถูกต้อง

Happy coding! 🚀
