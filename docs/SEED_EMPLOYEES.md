# Seed Employees Documentation

## 🌱 ภาพรวม

Seed script สำหรับสร้างข้อมูล employees ตัวอย่างที่ครบถ้วนสมบูรณ์ พร้อมใช้งานสำหรับการพัฒนาและทดสอบระบบ HR

## 🎯 คุณสมบัติ

### ข้อมูลที่ครอบคลุมทั้งหมด

- ✅ **ข้อมูลส่วนบุคคล** - ชื่อ-นามสกุล (EN/TH), เพศ, วันเกิด, อายุ, สถานภาพสมรส
- ✅ **ข้อมูลติดต่อ** - อีเมล, เบอร์โทร, ที่อยู่ปัจจุบัน/ตามทะเบียนบ้าน
- ✅ **ข้อมูลฉุกเฉิน** - ผู้ติดต่อฉุกเฉิน, ความสัมพันธ์
- ✅ **ข้อมูลบัตรประชาชน** - เลขบัตร, วันออกบัตร, วันหมดอายุ
- ✅ **ข้อมูลการจ้างงาน** - รหัสพนักงาน, วันเริ่มงาน, ประเภทการจ้างงาน, สถานะ
- ✅ **โครงสร้างองค์กร** - แผนก, ฝ่าย, ทีม, ตำแหน่ง, ระดับ
- ✅ **ข้อมูลเงินเดือน** - เงินเดือนพื้นฐาน, เบี้ยเลี้ยง, ค่าตำแหน่ง
- ✅ **ภาษีและประกันสังคม** - เลขประกันสังคม, โรงพยาบาล, การหักภาษี ณ ที่จ่าย
- ✅ **บัญชีธนาคาร** - ธนาคาร, เลขที่บัญชี, สาขา
- ✅ **สวัสดิการ** - ประกันสุขภาพ, ประกันชีวิต, กองทุนสำรองเลี้ยงชีพ
- ✅ **การศึกษา** - ระดับการศึกษา, สถาบัน, สาขา, GPA
- ✅ **ตารางงาน** - เวลาทำงาน, วันทำงาน, OT
- ✅ **สถานที่ทำงาน** - สำนักงาน, อาคาร, ชั้น, ที่นั่ง

## 📊 พนักงานตัวอย่าง (15 คน)

### IT Department (5 คน)
- **Senior Software Engineer** (Full-time, Permanent) - 80,000 THB
- **Frontend Developer** (Full-time, Permanent) - 60,000 THB
- **DevOps Engineer** (Full-time, Permanent) - 75,000 THB
- **UX/UI Designer** (Full-time, Permanent) - 55,000 THB
- **Junior Developer** (Part-time, Intern) - 15,000 THB

### HR Department (2 คน)
- **HR Manager** (Full-time, Permanent) - 70,000 THB
- **Recruitment Specialist** (Full-time, Permanent) - 40,000 THB

### Finance Department (2 คน)
- **Senior Accountant** (Full-time, Permanent) - 65,000 THB
- **Financial Analyst** (Full-time, Permanent) - 58,000 THB

### Marketing Department (2 คน)
- **Marketing Manager** (Full-time, Permanent) - 72,000 THB
- **Content Creator** (Full-time, Contract) - 35,000 THB

### Sales Department (2 คน)
- **Sales Manager** (Full-time, Permanent) - 75,000 THB
- **Sales Executive** (Full-time, Permanent) - 45,000 THB

### Others (2 คน)
- **Graphic Designer** (Part-time, Freelance) - 20,000 THB
- **Business Analyst** (Full-time, Probation) - 52,000 THB

## 🚀 วิธีใช้งาน

### 1. เริ่มต้น Emulator

```bash
# Terminal 1
pnpm run emulators
```

### 2. รัน Seed Script

```bash
# Terminal 2
pnpm run seed:employees
```

### 3. ตรวจสอบผลลัพธ์

เปิด Emulator UI: http://localhost:4000
- ไปที่ Firestore → `employees` collection
- จะเห็นพนักงาน 15 คน พร้อมข้อมูลครบถ้วน

## 📋 ตัวอย่างข้อมูลพนักงานที่สร้าง

```typescript
{
  // Basic Info
  id: "emp_1234567890_abc123",
  userId: "seed_employee_xxx",
  employeeCode: "EMP-2025-001",

  // Personal Info
  firstName: "John",
  lastName: "Smith",
  thaiFirstName: "สมชาย",
  thaiLastName: "ใจดี",
  nickname: "จอห์น",
  email: "john.smith@company.com",
  phoneNumber: "0812345678",
  dateOfBirth: Date,
  age: 32,
  gender: "male",
  maritalStatus: "single",
  nationality: "ไทย",
  nationalId: "1234567890123",

  // Address
  currentAddress: {
    addressLine1: "123 หมู่ 5",
    district: "เมือง",
    province: "กรุงเทพมหานคร",
    postalCode: "10110",
    country: "ประเทศไทย"
  },

  // Employment
  hireDate: Date,
  status: "active",
  employmentType: "permanent",
  workType: "full-time",
  position: "Senior Software Engineer",
  level: "Senior",
  department: "IT",
  division: "Engineering",
  team: "Backend Team",

  // Compensation
  salary: {
    baseSalary: 80000,
    currency: "THB",
    paymentFrequency: "monthly",
    effectiveDate: Date
  },
  allowances: [
    { type: "ค่าเดินทาง", amount: 2000, frequency: "monthly" },
    { type: "ค่าโทรศัพท์", amount: 800, frequency: "monthly" }
  ],

  // Tax & Social Security
  socialSecurity: {
    isEnrolled: true,
    ssNumber: "1234567890",
    hospitalCode: "BKK001",
    hospitalName: "โรงพยาบาลจุฬาลงกรณ์"
  },
  tax: {
    withholdingTax: true,
    withholdingRate: 5,
    taxReliefs: [
      { type: "ตัวเอง", amount: 60000 }
    ]
  },

  // Bank Account
  bankAccount: {
    bankName: "ธนาคารกสิกรไทย",
    accountNumber: "1234567890",
    accountName: "สมชาย ใจดี",
    branchName: "สาขาสยาม"
  },

  // Benefits
  benefits: {
    healthInsurance: true,
    lifeInsurance: true,
    providentFund: {
      isEnrolled: true,
      employeeContributionRate: 5,
      employerContributionRate: 5
    },
    annualLeave: 10,
    sickLeave: 30,
    otherBenefits: ["ตรวจสุขภาพประจำปี", "ประกันอุบัติเหตุ"]
  },

  // Education
  education: [{
    level: "bachelor",
    institution: "มหาวิทยาลัยเชียงใหม่",
    fieldOfStudy: "วิทยาการคอมพิวเตอร์",
    graduationYear: 2015,
    gpa: 3.25
  }],

  // Work Schedule
  workSchedule: {
    scheduleType: "fixed",
    hoursPerWeek: 40,
    hoursPerDay: 8,
    standardHours: {
      monday: { startTime: "09:00", endTime: "18:00", breakMinutes: 60 },
      // ... tuesday - friday
    }
  },

  // Overtime
  overtime: {
    isEligible: true,
    rate: 1.5
  },

  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔄 การรวม Seed Scripts

### Seed ทั้งหมดพร้อมกัน

```bash
# ล้างข้อมูลเดิมและสร้างใหม่ทั้งหมด
pnpm run reset:emulator

# จากนั้นรัน employees แยก
pnpm run seed:employees
```

### Seed แบบทีละขั้นตอน

```bash
# 1. ล้างข้อมูลเดิม
pnpm run clear:emulator

# 2. สร้าง roles และ users
pnpm run seed:all

# 3. สร้าง employees
pnpm run seed:employees

# 4. สร้าง leave types
pnpm run seed:leaveTypes
```

## 🎨 การปรับแต่งข้อมูล

### เพิ่ม/แก้ไขพนักงานตัวอย่าง

แก้ไขไฟล์: `scripts/seed-login-users/seed-employees.ts`

```typescript
const SEED_EMPLOYEES: SeedEmployeeTemplate[] = [
  {
    firstName: 'Your',
    lastName: 'Name',
    thaiFirstName: 'ชื่อไทย',
    thaiLastName: 'นามสกุล',
    nickname: 'ชื่อเล่น',
    gender: 'male',
    maritalStatus: 'single',
    position: 'Your Position',
    level: 'Senior',
    department: 'IT',
    division: 'Engineering',
    employmentType: 'permanent',
    workType: 'full-time',
    baseSalary: 80000,
    officeLocation: 'กรุงเทพ',
  },
  // เพิ่มพนักงานคนอื่นๆ
];
```

### ปรับแต่ง Helper Functions

ฟังก์ชันสำหรับสร้างข้อมูล mock:

- `generateEmployeeCode(index)` - สร้างรหัสพนักงาน
- `generateNationalId()` - สร้างเลขบัตรประชาชน
- `generatePhoneNumber()` - สร้างเบอร์โทรศัพท์
- `generateAddress()` - สร้างที่อยู่แบบไทย
- `calculateAge(dateOfBirth)` - คำนวณอายุ
- `randomDate(start, end)` - สร้างวันที่สุ่ม

## 🧪 การทดสอบ

### ตรวจสอบข้อมูลที่สร้าง

```bash
# เปิด Emulator UI
open http://localhost:4000

# ดู Firestore
# - employees collection → ดูพนักงานทั้งหมด
# - แต่ละ document → ดูรายละเอียด
```

### ทดสอบการใช้งานในแอป

1. เปิดแอป: http://localhost:5173
2. Login ด้วย user ใด user หนึ่ง
3. ไปที่หน้า Employees
4. ควรเห็นพนักงาน 15 คน พร้อมข้อมูลครบถ้วน

## ⚙️ Technical Details

### โครงสร้างไฟล์

```
scripts/seed-login-users/
├── seed-employees.ts        # Main seed script
├── seed-users-admin.ts      # Seed users
├── seed-all.ts              # Seed everything
└── clear-emulator-data-admin.ts  # Clear data
```

### Dependencies

- `firebase-admin` - Admin SDK สำหรับ bypass security rules
- `tsx` - TypeScript executor

### การทำงาน

1. Connect to Firestore Emulator (localhost:8080)
2. Fetch existing users (ถ้ามี)
3. Generate mock data สำหรับแต่ละพนักงาน
4. Save to `employees` collection
5. Show summary

## 🐛 Troubleshooting

### ❌ Error: Connection refused

```
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**แก้ไข:** เริ่ม emulator ก่อน

```bash
pnpm run emulators
```

### ❌ Error: Cannot find module

```
Cannot find module '@/domains/people/features/employees/types'
```

**แก้ไข:** ตรวจสอบว่า types ถูกสร้างแล้ว

```bash
# ตรวจสอบไฟล์
ls src/domains/people/features/employees/types/index.ts
```

### ❌ พนักงานไม่แสดงในแอป

**แก้ไข:**

1. ตรวจสอบ Firestore Rules
2. ตรวจสอบว่า user มี permission `read:all` หรือ `read:own`
3. ตรวจสอบ Firestore Emulator UI ว่ามีข้อมูลจริง

### ⚠️ ข้อมูลไม่ครบถ้วน

ตรวจสอบ console output ว่ามี error ตอนสร้างหรือไม่:

```bash
pnpm run seed:employees | tee seed.log
```

## 💡 Best Practices

### 1. รัน Seed หลังจาก Clear

```bash
pnpm run clear:emulator && pnpm run seed:employees
```

### 2. Export ข้อมูลสำหรับใช้ครั้งหลัง

```bash
# หลังจาก seed เสร็จ
pnpm run emulators:export

# ครั้งต่อไป
pnpm run emulators:import
```

### 3. สร้างข้อมูลเฉพาะที่ต้องการ

แทนที่จะรัน `seed:all` ทุกครั้ง ให้รันเฉพาะที่ต้องการ:

```bash
pnpm run seed:employees  # เฉพาะ employees
```

### 4. ใช้ข้อมูลจริงสำหรับ Staging

**ไม่แนะนำ** ให้ใช้ seed data ใน staging/production
- ใช้เฉพาะใน development/testing
- Staging ควรใช้ data migration จากระบบเดิม

## 📚 Related Documentation

- [Employee Data Structure](./EMPLOYEE_DATA_STRUCTURE_PROPOSAL.md) - โครงสร้างข้อมูลพนักงานแบบเต็ม
- [Seed Scripts](./SEED_SCRIPTS.md) - คู่มือ seed scripts ทั้งหมด
- [Phone Number Format](./PHONE_NUMBER_FORMAT.md) - รูปแบบเบอร์โทร

## 🎉 Summary

Seed employees script นี้ให้ข้อมูลพนักงานที่:

- ✅ **ครบถ้วน** - มีข้อมูลทุกฟิลด์ที่จำเป็น
- ✅ **หลากหลาย** - มีทุกประเภทการจ้างงาน (permanent, contract, freelance, intern, probation)
- ✅ **สมจริง** - ข้อมูล mock ใกล้เคียงข้อมูลจริง
- ✅ **พร้อมใช้** - รันได้เลย ไม่ต้อง config เพิ่ม
- ✅ **ยืดหยุ่น** - แก้ไขและปรับแต่งได้ง่าย

สามารถใช้ทดสอบ feature ต่างๆ ได้เลย เช่น:
- Employee Management (CRUD)
- Attendance Tracking
- Leave Requests
- Payroll Calculation
- Reports & Analytics

Happy coding! 🚀
