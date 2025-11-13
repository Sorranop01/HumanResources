# Seed Scripts Package

เครื่องมือสำหรับ seed ข้อมูลทดสอบเข้า Firebase Emulator สำหรับ Human HR System

## 📦 Structure

```
packages/scripts/
├── src/
│   ├── config/
│   │   └── firebase-admin.ts      # Firebase Admin SDK config
│   ├── seed/
│   │   ├── rbac/                  # RBAC seed scripts
│   │   │   ├── seedRoles.ts
│   │   │   ├── seedPermissions.ts
│   │   │   └── seedRolePermissions.ts
│   │   ├── policies/              # Policy seed scripts
│   │   │   ├── seedWorkSchedulePolicies.ts
│   │   │   ├── seedOvertimePolicies.ts
│   │   │   ├── seedShifts.ts
│   │   │   ├── seedPenaltyPolicies.ts
│   │   │   └── seedHolidays.ts
│   │   ├── users/                 # User seed scripts
│   │   │   └── seedAuthUsers.ts
│   │   ├── clearEmulatorData.ts   # Clear all emulator data
│   │   └── seedAll.ts             # Master seed script
│   └── package.json
```

## 🚀 Usage

### 1. เริ่มต้น Firebase Emulator

```bash
# ที่ root ของ monorepo
firebase emulators:start
```

### 2. รัน Seed Scripts

#### Seed ข้อมูลทั้งหมด (แนะนำ)

```bash
cd packages/scripts
pnpm seed:all
```

#### Seed แยกตาม Module

```bash
# RBAC (Roles, Permissions, Role-Permissions)
pnpm seed:rbac

# Policies (Work Schedule, Overtime, Shift, Penalty, Holiday)
pnpm seed:policies

# People (Departments, Positions, Employees)
pnpm seed:people

# Users & Authentication
pnpm seed:users
```

#### Clear ข้อมูล Emulator

```bash
pnpm clear:emulator
```

## 📊 Seed Data Overview

### 1. RBAC (Role-Based Access Control)

**Roles (5 roles)**
- Admin - ผู้ดูแลระบบ (full access)
- HR - ฝ่ายทรัพยากรบุคคล
- Manager - ผู้จัดการ
- Employee - พนักงาน
- Auditor - ผู้ตรวจสอบ

**Permissions (8 resources)**
- employees
- attendance
- leave-requests
- payroll
- settings
- users
- roles
- audit-logs

**Role-Permission Mappings**
- Admin: Full access ทุก resource
- HR: จัดการ employees, attendance, leave, payroll (read/create/update/delete หรือ read/create/update)
- Manager: อ่านและอนุมัติ leave, attendance ของทีม
- Employee: เข้าถึง attendance, leave, payroll ของตัวเอง
- Auditor: Read-only access เพื่อตรวจสอบ

### 2. Policies

**Work Schedule Policies (3 policies)**
- Standard Mon-Fri (08:00-17:00)
- Standard Mon-Sat (08:00-17:00)
- Flexible (07:00-10:00 เข้า, 16:00-19:00 ออก)

**Overtime Policies (2 policies)**
- Standard OT (1.5x weekday, 2x weekend, 3x holiday)
- High-Rate OT (2x weekday, 2.5x weekend, 3.5x holiday)

**Shifts (5 shifts)**
- Morning Shift (08:00-17:00)
- Afternoon Shift (14:00-23:00)
- Night Shift (22:00-07:00)
- 12-Hour Day Shift (07:00-19:00)
- 12-Hour Night Shift (19:00-07:00)

**Penalty Policies (5 policies)**
- Late (Fixed Rate) - 50 บาท
- Late (Progressive) - 50/100/200 บาท ตามจำนวนครั้ง
- Absence - หัก 1 วันต่อวันที่ขาด
- Early Leave - 100 บาท
- No Clock-In - 200 บาท

**Public Holidays (13 holidays for 2025)**
- วันขึ้นปีใหม่, มาฆบูชา, จักรี, สงกรานต์, แรงงาน, ฉัตรมงคล, วิสาขบูชา, วันเฉลิมพระชนมพรรษาฯ, อาสาฬหบูชา, วันปิยมหาราช, วันรัฐธรรมนูญ, วันสิ้นปี

### 3. Users & Authentication

**Test Users (5 users)**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@human.com | admin123456 |
| HR | hr@human.com | hr123456 |
| Manager | manager@human.com | manager123456 |
| Employee | employee@human.com | employee123456 |
| Auditor | auditor@human.com | auditor123456 |

## 🔧 Technical Details

### Firebase Admin SDK Configuration

Scripts ใช้ Firebase Admin SDK เชื่อมต่อกับ Firebase Emulator:
- Firestore Emulator: `localhost:8888`
- Auth Emulator: `localhost:9099`

### Data Structure

ข้อมูลทั้งหมดถูก seed ไปยัง Collections เหล่านี้:
- `roleDefinitions` - Role definitions
- `permissionDefinitions` - Permission definitions
- `rolePermissions` - Role-Permission mappings
- `userRoleAssignments` - User-Role assignments
- `workSchedulePolicies` - Work schedule policies
- `overtimePolicies` - Overtime policies
- `shifts` - Shift definitions
- `penaltyPolicies` - Penalty policies
- `publicHolidays` - Public holidays
- `users` - User profiles
- Firebase Auth - Authentication users

### Timestamps

ทุก document มี:
- `createdAt`: Firestore Timestamp
- `updatedAt`: Firestore Timestamp
- `effectiveDate`: วันที่เริ่มใช้งาน (สำหรับ policies)

## ⚠️ Important Notes

1. **Emulator Only**: Scripts เหล่านี้ออกแบบมาเพื่อใช้กับ Firebase Emulator เท่านั้น
2. **Clear Before Seed**: แนะนำให้รัน `pnpm clear:emulator` ก่อน seed ข้อมูลใหม่
3. **Sequential Execution**: `seedAll.ts` รัน scripts ตามลำดับที่ถูกต้อง (RBAC → Policies → Users)
4. **Dependencies**: ต้องติดตั้ง `firebase-admin` และ `tsx`

## 🐛 Troubleshooting

### Emulator not running
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```
**Solution**: เริ่ม Firebase Emulator ก่อน `firebase emulators:start`

### Users already exist
```
⚠️  User admin@human.com already exists, skipping...
```
**Solution**: รัน `pnpm clear:emulator` เพื่อลบข้อมูลเก่า

### Permission denied
```
Error: PERMISSION_DENIED
```
**Solution**: ตรวจสอบว่าเชื่อมต่อกับ Emulator ไม่ใช่ Production

## 📚 Next Steps

หลังจาก seed ข้อมูลแล้ว:
1. ทดสอบ login ด้วย test users
2. ตรวจสอบ RBAC permissions
3. ทดสอบ policies
4. พัฒนา features ต่อไป

## 🤝 Contributing

เมื่อเพิ่ม domain ใหม่:
1. สร้าง seed script ใหม่ใน `src/seed/<domain>/`
2. เพิ่ม command ใน `package.json`
3. เพิ่มใน `seedAll.ts` ถ้าต้องการ
4. อัพเดท README นี้
