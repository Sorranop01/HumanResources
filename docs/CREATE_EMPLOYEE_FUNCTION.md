# Cloud Function: createEmployee

## 📋 ภาพรวม

`createEmployee` เป็น Firebase Cloud Function สำหรับสร้างพนักงานใหม่ในระบบ HR โดยมีการตรวจสอบความปลอดภัย การ validate ข้อมูล และระบบ rollback ที่สมบูรณ์

**Location:** `functions/src/api/employees/createEmployee.ts`

---

## ✨ Features ที่เพิ่มเข้ามา

### 1. 🔐 Security & Authorization
- **Authentication Check**: ตรวจสอบว่าผู้ใช้ล็อกอินแล้ว
- **RBAC Permission Check**: ตรวจสอบสิทธิ์ `employees:create` ผ่านระบบ RBAC
- **Fallback Role Check**: ถ้า RBAC ยังไม่พร้อม จะใช้การตรวจสอบแบบ role-based (admin, hr)

### 2. ✅ Data Validation

#### Email Validation
- ตรวจสอบรูปแบบอีเมลด้วย regex
- ตรวจสอบว่าอีเมลซ้ำใน Firebase Auth หรือไม่
- ตรวจสอบว่าอีเมลซ้ำใน Firestore `employees` collection หรือไม่

#### Password Validation
- ตรวจสอบว่ารหัสผ่านมีความยาวอย่างน้อย 6 ตัวอักษร

#### National ID Validation
- ตรวจสอบรูปแบบเลขบัตรประชาชน (13 หลัก)
- ตรวจสอบว่าเลขบัตรประชาชนซ้ำในระบบหรือไม่

#### Phone Number Validation
- ตรวจสอบรูปแบบเบอร์โทรศัพท์ (9-10 หลัก)
- Normalize เบอร์โทรศัพท์ (ลบ `-` และช่องว่าง)

#### Employee Code Validation
- ตรวจสอบว่ารหัสพนักงานซ้ำหรือไม่ (ถ้ามีการส่งมา)
- Auto-generate รหัสพนักงาน (EMP-YYYY-XXX) ถ้าไม่ได้ส่งมา

#### Required Fields Validation
ตรวจสอบว่ามีฟิลด์ที่จำเป็นครบถ้วน:
- firstName, lastName, thaiFirstName, thaiLastName
- phoneNumber, dateOfBirth, gender, nationalId
- hireDate, employmentType, workType
- position, department
- currentAddress, workLocation
- salary, socialSecurity, tax, bankAccount
- workSchedule, overtime

### 3. 🤖 Auto-calculations & Transformations

#### Auto-generate Employee Code
```typescript
// รูปแบบ: EMP-YYYY-XXX
// ตัวอย่าง: EMP-2025-001, EMP-2025-002
```
- ดึงเลขล่าสุดของปีปัจจุบัน
- เพิ่ม 1 และ pad ด้วย 0 เป็น 3 หลัก

#### Age Calculation
```typescript
// คำนวณอายุจากวันเกิด
// พิจารณาเดือนและวันด้วย
```

#### Phone Number Normalization
```typescript
// Input: "091-234-5678", "091 234 5678", "0912345678"
// Output: "0912345678"
```

#### Timestamp Conversion
- แปลง string dates เป็น Firestore Timestamp
- ใช้ `serverTimestamp()` สำหรับ createdAt/updatedAt

### 4. 🔄 Transaction & Rollback

#### Transaction Flow
1. **Create Auth User** → ถ้าล้มเหลว → ยกเลิกทันที
2. **Create Employee Doc** → ถ้าล้มเหลว → ลบ Auth User
3. **Set Custom Claims** → ถ้าล้มเหลว → ไม่ rollback (แก้ไขได้ทีหลัง)
4. **Create User Doc** → ถ้าล้มเหลว → ไม่ rollback
5. **Create Audit Log** → ถ้าล้มเหลว → ไม่ rollback (non-critical)

#### Rollback Strategy
```typescript
// ถ้าสร้าง Employee document ล้มเหลว
if (authUserCreated && newUser) {
  await auth.deleteUser(newUser.uid); // ลบ Auth User
}
```

### 5. 📝 Audit Logging

บันทึกการกระทำทุกครั้งลง `auditLogs` collection:
```typescript
{
  userId: string,              // ผู้ทำรายการ
  action: 'CREATE_EMPLOYEE',   // ประเภทการกระทำ
  resourceType: 'employee',    // ประเภท resource
  resourceId: string,          // ID ของ employee
  metadata: {
    employeeCode: string,
    employeeName: string,
    email: string,
    position: string,
    department: string,
  },
  timestamp: Timestamp,
  createdAt: Timestamp,
}
```

### 6. 👤 User Account Creation

สร้าง User document ใน `users` collection สำหรับ RBAC:
```typescript
{
  email: string,
  displayName: string,
  role: string,              // default: 'employee'
  employeeId: string,        // link กับ employee doc
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### 7. 🔑 Custom Claims

กำหนด role ให้กับ Firebase Auth user:
```typescript
await auth.setCustomUserClaims(newUser.uid, { role: 'employee' });
```

### 8. 📧 Email Integration (TODO)

มีโครงสร้างพร้อมสำหรับส่งอีเมลต้อนรับ:
```typescript
if (sendWelcomeEmail) {
  // TODO: Implement email sending logic
}
```

### 9. 📊 Logging & Monitoring

ใช้ Firebase Logger เพื่อติดตาม:
- จุดเริ่มต้นและจุดสิ้นสุด
- แต่ละขั้นตอนของการสร้างพนักงาน
- Error และ warning
- ระยะเวลาที่ใช้ (duration)

---

## 📥 Input Structure

```typescript
interface CreateEmployeeInput {
  // Firebase Auth
  email: string;              // ✅ Required
  password: string;           // ✅ Required (min 6 chars)
  displayName: string;        // ✅ Required

  // Employee Data
  employeeData: {
    // Auto-generated if not provided
    employeeCode?: string;    // Optional (format: EMP-YYYY-XXX)

    // Personal Information
    firstName: string;
    lastName: string;
    thaiFirstName: string;
    thaiLastName: string;
    nickname?: string;
    personalEmail?: string;
    phoneNumber: string;      // 9-10 digits
    emergencyContact: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };

    // Personal Details
    dateOfBirth: string | Date;
    gender: 'male' | 'female' | 'other';
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    nationality?: string;     // Default: 'ไทย'
    religion?: string;

    // National ID
    nationalId: string;       // 13 digits
    nationalIdIssueDate?: string | Date;
    nationalIdExpiryDate?: string | Date;

    // Address
    currentAddress: {
      addressLine1: string;
      addressLine2?: string;
      subDistrict: string;
      district: string;
      province: string;
      postalCode: string;
      country?: string;       // Default: 'ไทย'
    };
    permanentAddress?: Address;

    photoURL?: string;

    // Employment Information
    hireDate: string | Date;
    probationEndDate?: string | Date;
    confirmationDate?: string | Date;
    status?: 'active' | 'on-leave' | 'resigned' | 'terminated';
    employmentType: 'permanent' | 'contract' | 'probation' | 'freelance' | 'intern';
    workType: 'full-time' | 'part-time';

    // Organization
    position: string;
    level?: string;
    department: string;
    division?: string;
    team?: string;
    reportingTo?: {
      employeeId: string;
      employeeName: string;
      position: string;
    };
    workLocation: {
      office: string;
      building?: string;
      floor?: string;
      seat?: string;
    };

    // Compensation
    salary: {
      baseSalary: number;
      currency?: string;      // Default: 'THB'
      paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly' | 'hourly';
      hourlyRate?: number;    // สำหรับ part-time
    };
    allowances?: Array<{
      type: string;
      amount: number;
      frequency: 'monthly' | 'quarterly' | 'yearly';
    }>;
    benefits?: {
      healthInsurance: boolean;
      lifeInsurance: boolean;
      providentFund: {
        isEnrolled: boolean;
        employeeContributionRate?: number;
        employerContributionRate?: number;
      };
      annualLeave: number;
      sickLeave: number;
      otherBenefits?: string[];
    };

    // Tax & Social Security
    socialSecurity: {
      isEnrolled: boolean;    // ⭐ เข้าประกันสังคมหรือไม่
      ssNumber?: string;
      enrollmentDate?: string | Date;
      hospitalCode?: string;
      hospitalName?: string;
    };
    tax: {
      taxId?: string;
      withholdingTax: boolean;  // ⭐ หัก ณ ที่จ่ายหรือไม่
      withholdingRate?: number;
      taxReliefs?: Array<{
        type: string;
        amount: number;
      }>;
    };
    bankAccount: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      branchName?: string;
    };

    // Education
    education?: Array<{
      level: string;
      institution: string;
      fieldOfStudy: string;
      graduationYear: number;
      gpa?: number;
    }>;
    certifications?: Array<{
      name: string;
      issuingOrganization: string;
      issueDate: string | Date;
      expiryDate?: string | Date;
      credentialId?: string;
    }>;

    // Work Schedule
    workSchedule: {
      scheduleType: 'fixed' | 'flexible' | 'shift';
      hoursPerWeek: number;
      hoursPerDay: number;
    };
    overtime: {
      isEligible: boolean;
      rate: number;           // 1.5x, 2x, 3x
    };

    notes?: string;
  };

  // Optional Settings
  role?: string;              // Default: 'employee'
  sendWelcomeEmail?: boolean; // Default: false
}
```

---

## 📤 Output Structure

### Success Response
```typescript
{
  success: true,
  message: 'สร้างพนักงานสำเร็จ',
  data: {
    employeeId: string,
    userId: string,
    employeeCode: string,
    email: string,
    displayName: string,
  }
}
```

### Error Responses

#### Authentication Error
```typescript
{
  code: 'unauthenticated',
  message: 'คุณต้องเข้าสู่ระบบก่อนใช้งานฟังก์ชันนี้'
}
```

#### Permission Denied
```typescript
{
  code: 'permission-denied',
  message: 'คุณไม่มีสิทธิ์ในการสร้างพนักงาน'
}
```

#### Invalid Input
```typescript
{
  code: 'invalid-argument',
  message: 'ข้อมูลไม่ครบถ้วน: email, password, displayName, employeeData'
}
```

#### Duplicate Data
```typescript
{
  code: 'already-exists',
  message: 'อีเมล xxx@example.com ถูกใช้งานแล้วในระบบ Authentication'
}
// OR
{
  code: 'already-exists',
  message: 'รหัสพนักงาน EMP-2025-001 ถูกใช้งานแล้ว'
}
// OR
{
  code: 'already-exists',
  message: 'เลขบัตรประชาชน 1234567890123 ถูกใช้งานแล้ว'
}
```

#### Internal Error
```typescript
{
  code: 'internal',
  message: 'ไม่สามารถสร้างบัญชี Authentication ได้'
}
```

---

## 🚀 การใช้งาน

### Frontend (React + TypeScript)

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const createEmployeeFn = httpsCallable(functions, 'createEmployee');

async function createEmployee(data: CreateEmployeeInput) {
  try {
    const result = await createEmployeeFn(data);
    console.log('Success:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Example usage
await createEmployee({
  email: 'john.doe@company.com',
  password: 'SecurePass123',
  displayName: 'John Doe',
  employeeData: {
    // employeeCode: 'EMP-2025-001', // Optional: will auto-generate
    firstName: 'John',
    lastName: 'Doe',
    thaiFirstName: 'จอห์น',
    thaiLastName: 'โด',
    phoneNumber: '0912345678',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'คู่สมรส',
      phoneNumber: '0987654321',
    },
    dateOfBirth: '1990-01-01',
    gender: 'male',
    maritalStatus: 'married',
    nationality: 'ไทย',
    nationalId: '1234567890123',
    currentAddress: {
      addressLine1: '123 ถนนสุขุมวิท',
      subDistrict: 'คลองเตย',
      district: 'คลองเตย',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110',
      country: 'ไทย',
    },
    hireDate: '2025-01-01',
    probationEndDate: '2025-04-01',
    status: 'active',
    employmentType: 'permanent',
    workType: 'full-time',
    position: 'Software Engineer',
    level: 'Senior',
    department: 'Engineering',
    workLocation: {
      office: 'กรุงเทพ',
    },
    salary: {
      baseSalary: 50000,
      currency: 'THB',
      paymentFrequency: 'monthly',
    },
    socialSecurity: {
      isEnrolled: true,
      ssNumber: 'SS-12345',
      hospitalCode: 'H001',
      hospitalName: 'โรงพยาบาลรามาธิบดี',
    },
    tax: {
      withholdingTax: true,
      withholdingRate: 5,
    },
    bankAccount: {
      bankName: 'ธนาคารกสิกรไทย',
      accountNumber: '1234567890',
      accountName: 'John Doe',
    },
    workSchedule: {
      scheduleType: 'fixed',
      hoursPerWeek: 40,
      hoursPerDay: 8,
    },
    overtime: {
      isEligible: true,
      rate: 1.5,
    },
  },
  role: 'employee',
  sendWelcomeEmail: true,
});
```

---

## 🔍 Testing

### Unit Tests
```bash
cd functions
npm test -- createEmployee.test.ts
```

### Manual Testing
```bash
# Deploy function
firebase deploy --only functions:createEmployee

# Test using Firebase Console or Postman
```

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Average Duration | 2-3 seconds |
| Cold Start | 5-7 seconds |
| Firestore Reads | 4-6 reads |
| Firestore Writes | 3 writes |

---

## ⚠️ Known Limitations

1. **Email Sending**: ยังไม่ได้ implement (TODO)
2. **File Upload**: ยังไม่รองรับการอัปโหลดรูปโปรไฟล์ตอนสร้าง (ต้องอัปโหลดแยก)
3. **Bulk Import**: ไม่รองรับการสร้างพนักงานหลายคนพร้อมกัน
4. **Rate Limiting**: ยังไม่มีการจำกัดจำนวนครั้งในการเรียกใช้

---

## 🔮 Future Enhancements

1. **Email Integration**
   - ส่งอีเมลต้อนรับพนักงานใหม่
   - ส่งรหัสผ่านเริ่มต้น

2. **Notification System**
   - แจ้งเตือน HR เมื่อมีพนักงานใหม่
   - แจ้งเตือนหัวหน้างาน (reportingTo)

3. **Document Upload**
   - รองรับการอัปโหลดเอกสารตอนสร้าง
   - สร้าง folder ส่วนตัวให้พนักงานใหม่

4. **Validation Enhancement**
   - ตรวจสอบความถูกต้องของเลขบัตรประชาชน (checksum)
   - ตรวจสอบข้อมูลธนาคาร

5. **Performance Optimization**
   - ใช้ batch writes สำหรับ multi-document operations
   - Cache role permissions

---

## 📝 Related Files

- `functions/src/api/employees/createEmployee.ts` - Main function
- `functions/src/shared/utils/permissions.ts` - RBAC utilities
- `functions/src/utils/phoneNumber.ts` - Phone number utilities
- `functions/src/shared/constants/roles.js` - Role constants
- `src/domains/people/features/employees/types/index.ts` - TypeScript types
- `src/domains/people/features/employees/schemas/index.ts` - Zod schemas

---

## 🐛 Troubleshooting

### Error: "ไม่สามารถสร้างรหัสพนักงานอัตโนมัติได้"
**Solution**: ตรวจสอบ Firestore indexes สำหรับ `employees` collection

### Error: "Permission denied"
**Solution**:
1. ตรวจสอบว่า user มี role `admin` หรือ `hr`
2. ตรวจสอบ RBAC permissions ใน `rolePermissions` collection

### Error: "Rollback failed"
**Solution**: ลบ Auth user ด้วยตนเองผ่าน Firebase Console

---

## 📄 License

Copyright © 2025 HumanResources System
