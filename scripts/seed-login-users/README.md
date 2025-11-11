# Development Scripts

Scripts สำหรับช่วยในการพัฒนา เช่น seed data, clear emulator, etc.

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm run seed:roles` | สร้าง/อัพเดท roles (roleDefinitions) |
| `pnpm run seed:users` | สร้าง users (ต้องมี roles ก่อน) |
| `pnpm run seed:all` | สร้างทั้ง roles และ users (แนะนำ!) |
| `pnpm run clear:emulator` | ลบข้อมูลทั้งหมด |
| `pnpm run reset:emulator` | ลบแล้วสร้างใหม่ |

**⚠️ สำคัญ:** ต้องรัน emulator ก่อน! Scripts ใช้ Admin SDK เพื่อ bypass Security Rules

---

## 🎭 Seed Roles

สร้าง/อัพเดท role definitions:

```bash
pnpm run seed:roles
```

### Default Roles

| Role | Name | Description |
|------|------|-------------|
| admin | ผู้ดูแลระบบ | มีสิทธิ์เข้าถึงระบบทั้งหมด |
| hr | ฝ่ายทรัพยากรบุคคล | จัดการข้อมูลพนักงาน การลา |
| manager | ผู้จัดการ | อนุมัติการลา ดูรายงาน |
| employee | พนักงาน | ดูข้อมูลส่วนตัว บันทึกเวลา |
| auditor | ผู้ตรวจสอบ | ดูข้อมูลและรายงาน |

---

## 👥 Seed Users

สร้าง default users (ต้องมี roles ก่อน):

```bash
pnpm run seed:users
```

### Default Users

| Role      | Email                  | Password     | Phone          |
|-----------|------------------------|--------------|----------------|
| Admin     | admin@example.com      | admin123     | +66812345678   |
| HR        | hr@example.com         | hr123456     | +66823456789   |
| Manager   | manager@example.com    | manager123   | +66834567890   |
| Employee  | employee@example.com   | employee123  | +66845678901   |
| Auditor   | auditor@example.com    | auditor123   | +66856789012   |

**⚠️ หมายเหตุสำคัญ:** Script เดิม (seed-users.ts, seed-users-admin.ts) สร้างเฉพาะ **Firestore users** เท่านั้น ไม่ได้สร้าง **Authentication users**

---

## 🔐 Seed Authentication Users (ใหม่!)

สร้างทั้ง **Firebase Auth users** และ **Firestore users** พร้อมกัน:

```bash
cd scripts/seed-login-users
tsx seed-auth-users.ts
```

**คุณสมบัติ:**
- ✅ สร้าง users ใน Firebase Authentication
- ✅ ใช้ Auth UID เป็น Firestore document ID (ตามมาตรฐาน)
- ✅ Sync ข้อมูลระหว่าง Auth และ Firestore
- ✅ เชื่อมโยงกับ roleDefinitions อัตโนมัติ
- ✅ รองรับการรันซ้ำ (update ถ้ามีอยู่แล้ว)

**ใช้เมื่อ:**
- ต้องการให้ users ล็อกอินได้จริง
- ต้องการ Firestore document ID ตรงกับ Auth UID
- ต้องการความสอดคล้องระหว่าง Auth และ Firestore

---

## 🌱 Seed All (แนะนำที่สุด! ✨)

สร้างทั้ง roles, Authentication users, และ Firestore users พร้อมกัน:

```bash
pnpm run seed:all
# หรือ
cd scripts/seed-login-users
tsx seed-all.ts
```

**ข้อดี:**
- ✅ สร้าง roles ก่อนอัตโนมัติ
- ✅ สร้าง Firebase Auth users พร้อม password
- ✅ ใช้ Auth UID เป็น Firestore document ID
- ✅ Map ข้อมูล role กับ user ให้อัตโนมัติ
- ✅ Users มี `roleId` และ `roleName` ครบถ้วน (denormalized)
- ✅ รันครั้งเดียวเสร็จทุกอย่าง
- ✅ **Users สามารถล็อกอินได้ทันที**

**ขั้นตอนการทำงาน:**
1. สร้าง Role Definitions (5 roles)
2. สร้าง Authentication Users (5 users พร้อม password)
3. สร้าง Firestore Users (ใช้ Auth UID, เชื่อมกับ roles)

**Output ตัวอย่าง:**
```
🚀 Starting complete data seeding...

📡 Connected to Auth Emulator at localhost:9099
📡 Connected to Firestore Emulator at localhost:8080

📋 STEP 1: Seeding Roles (roleDefinitions)
   ✅ Created: admin → ผู้ดูแลระบบ
   ✅ Created: hr → ฝ่ายทรัพยากรบุคคล
   ...

🔐 STEP 2: Seeding Authentication Users
   ✅ Created: admin@example.com (UID: abc123...)
   ✅ Created: hr@example.com (UID: def456...)
   ...

👥 STEP 3: Seeding Firestore Users (with denormalized role data)
   ✅ admin@example.com
      UID: abc123...
      Role: admin → ผู้ดูแลระบบ (PN7kF15dAQCb...)
   ...

═══════════════════════════════════════════════════════
🎉 All seeding completed successfully!
═══════════════════════════════════════════════════════
⏱️  Duration: 2.45s
📊 Summary:
   • Roles: 5 created/updated
   • Auth Users: 5 created/updated
   • Firestore Users: 5 created
```

---

## 🧹 Clear Emulator Data

ลบข้อมูลทั้งหมดจาก emulator:

```bash
pnpm run clear:emulator
```

## 🔄 Reset Emulator

ลบข้อมูลเดิมและสร้าง default users ใหม่:

```bash
pnpm run reset:emulator
```

## 💾 Export/Import Emulator Data

### Export (บันทึกข้อมูล)

```bash
# ขณะที่ emulator กำลังรัน ให้เปิด terminal ใหม่
pnpm run emulators:export
```

ข้อมูลจะถูกบันทึกไว้ที่ `./emulator-data/`

### Import (โหลดข้อมูลกลับ)

```bash
# เริ่ม emulator พร้อมโหลดข้อมูลที่ export ไว้
pnpm run emulators:import
```

## 🔧 Workflow แนะนำ

### การเริ่มต้นครั้งแรก

```bash
# 1. Build functions
pnpm run build:functions

# 2. Start emulators
pnpm run emulators

# 3. (Terminal ใหม่) Seed default users
pnpm run seed:users

# 4. (Terminal ใหม่) Start dev server
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

## 📚 เลือก Script ไหนดี?

| Script | Firebase Auth | Firestore | Auth UID = Doc ID | แนะนำ |
|--------|---------------|-----------|-------------------|-------|
| `seed-all.ts` | ✅ | ✅ | ✅ | ⭐⭐⭐ |
| `seed-auth-users.ts` | ✅ | ✅ | ✅ | ⭐⭐ |
| `seed-users-admin.ts` | ❌ | ✅ | ❌ | ⭐ (เลิกใช้) |
| `seed-users.ts` | ❌ | ✅ | ❌ | ⭐ (เลิกใช้) |

**คำแนะนำ:**
- 🏆 **ใช้ `seed-all.ts` เสมอ** - ครบถ้วนที่สุด สร้างทั้ง roles, auth users, และ firestore users
- 🔐 **ใช้ `seed-auth-users.ts`** - ถ้ามี roles อยู่แล้ว แค่ต้องการสร้าง auth users
- 🚫 **หยุดใช้ `seed-users-admin.ts` และ `seed-users.ts`** - ไม่สร้าง auth users, doc ID ไม่ตรงกับ auth UID

## ⚠️ หมายเหตุ

- Scripts เหล่านี้ทำงานกับ **emulator เท่านั้น** (localhost)
- ไม่มีผลกับ production database
- ข้อมูลที่ export จะถูก ignore โดย git (ดู .gitignore)
- **เบอร์โทรศัพท์:** ใช้รูปแบบ international (+66) เพื่อให้ Firebase Auth รองรับ
