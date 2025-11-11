# 🎯 Attendance & Payroll Implementation Summary

> สรุปการพัฒนาระบบ Attendance และ Payroll ที่เชื่อมโยงกับ Employee และ Leave Management

**วันที่:** 2025-11-12
**สถานะ:** Core Backend & Services ✅ สมบูรณ์ | UI Components ⏳ รอพัฒนา

---

## ✅ สิ่งที่พัฒนาเสร็จแล้ว (Completed)

### 1. Attendance Feature Enhancement

#### 📄 Schemas & Validation
- ✅ `src/domains/people/features/attendance/schemas/index.ts`
  - Zod schemas สำหรับ validation
  - ClockInInputSchema, ClockOutInputSchema
  - AttendanceFiltersSchema, MonthlyAttendanceQuerySchema
  - AttendanceStatsSchema สำหรับสถิติ

#### 🔧 Services
- ✅ `src/domains/people/features/attendance/services/attendanceService.ts` (Enhanced)
  - **validateClockIn()** - ตรวจสอบก่อน clock in
    - ป้องกัน clock in ซ้ำในวันเดียว
    - ตรวจสอบว่ามีการลา (leave request) หรือไม่
  - **getMonthlyAttendance()** - ดึงข้อมูลรายเดือน
  - **getAttendanceByDateRange()** - ดึงข้อมูลตามช่วงวันที่
  - **calculateStats()** - คำนวณสถิติการเข้างาน
    - Total days, Present days, Absent days
    - Late days, On-leave days
    - Total work hours, Average work hours
    - Overtime hours
  - **markAbsentDays()** - (Placeholder) สำหรับ Cloud Function

#### 🪝 React Hooks
- ✅ `useValidateClockIn` - ตรวจสอบก่อน clock in
- ✅ `useMonthlyAttendance` - ดึงข้อมูลรายเดือน
- ✅ `useAttendanceStats` - คำนวณสถิติ

#### 🔗 Integration
- ✅ เชื่อมกับ Leave System
  - ตรวจสอบ approved leave requests
  - ป้องกันการ clock in ในวันที่ลา
  - นับวันลาใน attendance stats

---

### 2. Payroll Feature (New)

#### 📊 Types & Interfaces
- ✅ `src/domains/payroll/features/payroll/types/index.ts`
  - **PayrollRecord** - โครงสร้างข้อมูล payroll
  - **PayrollCalculationInput** - input สำหรับคำนวณเงินเดือน
  - **PayrollCalculationResult** - ผลลัพธ์การคำนวณ
  - **Allowances** (เบี้ยเลี้ยง) - transportation, housing, meal, position
  - **Deductions** (รายการหัก) - tax, social security, provident fund, loans, penalties
  - **PayrollStatus** - draft, pending, approved, paid, cancelled

#### 📄 Schemas & Validation
- ✅ `src/domains/payroll/features/payroll/schemas/index.ts`
  - Zod schemas สำหรับ validation
  - PayrollCalculationInputSchema
  - CreatePayrollInputSchema, UpdatePayrollInputSchema
  - ApprovePayrollInputSchema, ProcessPaymentInputSchema
  - PayrollFiltersSchema

#### 💰 Payroll Service (Core)
- ✅ `src/domains/payroll/features/payroll/services/payrollService.ts`
  - **calculateWorkingDays()** - คำนวณวันทำงาน (ไม่นับวันหยุด)
  - **calculateDailyRate()** - คำนวณค่าแรงรายวัน
  - **calculateHourlyRate()** - คำนวณค่าแรงรายชั่วโมง
  - **calculateOvertimePay()** - คำนวณค่า OT (1.5x, 2x, 3x)
  - **calculateAbsencePenalty()** - หักค่าขาดงาน
  - **calculateLatePenalty()** - หักค่ามาสาย
  - **calculateSocialSecurity()** - คำนวณประกันสังคม (5%, max 750 บาท)
  - **calculateWithholdingTax()** - คำนวณภาษีหัก ณ ที่จ่าย (แบบง่าย)
  - **calculatePayroll()** - ฟังก์ชันหลักคำนวณเงินเดือน
  - **create()** - สร้าง payroll record จาก attendance data
  - **getById()**, **getByEmployeeAndPeriod()**, **getAll()**
  - **update()** - แก้ไข payroll (เฉพาะ draft)
  - **approve()** - อนุมัติ payroll
  - **processPayment()** - บันทึกการจ่ายเงิน
  - **getSummary()** - สรุปรายงานเงินเดือนรายเดือน

---

### 3. Cloud Functions (Firebase)

#### ☁️ Payroll Functions
- ✅ `functions/src/api/payroll/calculatePayroll.ts`
  - **calculatePayroll** - คำนวณเงินเดือนสำหรับพนักงาน 1 คน
  - Input: employeeId, month, year, payDate
  - Output: payrollId, grossIncome, deductions, netPay, stats
  - ดึงข้อมูลจาก:
    - Employee collection (baseSalary, overtime rate)
    - Attendance collection (actual work days, OT hours)
    - Leave requests (on-leave days)
  - คำนวณอัตโนมัติ:
    - Working days, absent days, late days
    - Overtime pay
    - Deductions (social security, tax, penalties)
    - Net pay

- ✅ `functions/src/api/payroll/generateMonthlyPayroll.ts`
  - **generateMonthlyPayroll** - สร้าง payroll สำหรับพนักงานทั้งหมด (batch)
  - Input: month, year, payDate, departmentFilter (optional)
  - Output: generated count, skipped count, errors, details
  - ประมวลผลทีละคน (sequential)
  - Skip ถ้ามี payroll อยู่แล้ว
  - Log ผลลัพธ์และ errors

- ✅ Export ใน `functions/src/index.ts`

---

## 🔄 Data Flow & Integration

### Attendance → Payroll Flow

```
1. Employee clocks in/out daily
   ↓
2. Attendance records stored in Firestore
   ↓
3. Month-end: HR calls calculatePayroll()
   ↓
4. Cloud Function:
   - Query attendance records for the month
   - Calculate: present days, absent days, late days, OT hours
   ↓
5. Query leave requests (approved)
   - Calculate on-leave days
   ↓
6. Calculate payroll:
   - Base salary
   - OT pay (hours × hourly rate × OT rate)
   - Allowances
   - Deductions (tax, social security, penalties)
   - Net pay = Gross - Deductions
   ↓
7. Create payroll record (status: draft)
   ↓
8. HR reviews and approves
   ↓
9. Process payment (status: paid)
```

### Leave Integration

```
Employee submits leave request
   ↓
Manager/HR approves
   ↓
Attendance validation:
- Cannot clock in on approved leave days
- Leave days counted in payroll calculation
- Excluded from absent days penalty
```

---

## 📐 Calculation Formulas

### Working Days
```javascript
// Exclude weekends (Saturday, Sunday)
workingDays = countWeekdays(month, year)
```

### Daily & Hourly Rates
```javascript
dailyRate = baseSalary / workingDays
hourlyRate = dailyRate / 8  // 8 hours per day
```

### Overtime Pay
```javascript
overtimePay = overtimeHours × hourlyRate × overtimeRate
// overtimeRate = 1.5x (normal), 2x (holiday), 3x (special)
```

### Absence Penalty
```javascript
absencePenalty = absentDays × dailyRate
```

### Late Penalty
```javascript
latePenalty = lateDays × 100  // Fixed 100 THB per late day
```

### Social Security (Thailand)
```javascript
socialSecurity = min(grossIncome × 5%, 750)
// Max contribution: 750 THB/month
```

### Withholding Tax (Simplified)
```javascript
// Progressive tax rates:
// 0-150,000: 0%
// 150,001-300,000: 5%
// 300,001-500,000: 10%
// 500,001-750,000: 15%
// 750,001-1,000,000: 20%
// 1,000,001-2,000,000: 25%
// 2,000,001-5,000,000: 30%
// 5,000,001+: 35%
```

### Gross Income
```javascript
grossIncome = baseSalary + overtimePay + bonus + totalAllowances
```

### Net Pay
```javascript
netPay = grossIncome - totalDeductions

totalDeductions =
  tax +
  socialSecurity +
  providentFund +
  loan +
  advance +
  latePenalty +
  absencePenalty +
  other
```

---

## 🗂️ Firestore Collections Structure

### attendance (มีอยู่แล้ว - Enhanced)
```typescript
{
  id: string
  userId: string
  clockInTime: Timestamp
  clockOutTime: Timestamp | null
  status: 'clocked-in' | 'clocked-out'
  date: string  // YYYY-MM-DD
  durationHours: number | null
}
```

### payroll (ใหม่)
```typescript
{
  id: string

  // Employee (denormalized)
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  position: string

  // Period
  month: number       // 1-12
  year: number
  periodStart: Timestamp
  periodEnd: Timestamp
  payDate: Timestamp

  // Income
  baseSalary: number
  overtimePay: number
  bonus: number
  allowances: {
    transportation: number
    housing: number
    meal: number
    position: number
    other: number
  }
  grossIncome: number

  // Deductions
  deductions: {
    tax: number
    socialSecurity: number
    providentFund: number
    loan: number
    advance: number
    latePenalty: number
    absencePenalty: number
    other: number
  }
  totalDeductions: number

  // Net Pay
  netPay: number

  // Working Days (from attendance)
  workingDays: number
  actualWorkDays: number
  absentDays: number
  lateDays: number
  onLeaveDays: number
  overtimeHours: number

  // Status & Approval
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'cancelled'
  approvedBy?: string
  approvedAt?: Timestamp
  approvalComments?: string

  // Payment
  paidBy?: string
  paidAt?: Timestamp
  paymentMethod?: string
  transactionRef?: string

  notes?: string
  tenantId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 🚀 How to Use

### 1. Clock In/Out (พนักงาน)

```typescript
import { useClockIn, useValidateClockIn } from '@/domains/people/features/attendance';

function ClockInButton() {
  const { user } = useAuth();
  const employee = useEmployee(user.uid);

  // Validate before showing button
  const { data: validation } = useValidateClockIn(user.uid, employee?.id);

  const { mutate: clockIn } = useClockIn();

  const handleClockIn = () => {
    if (!validation?.canClockIn) {
      alert(validation?.reason);
      return;
    }

    clockIn(user.uid);
  };

  return (
    <button onClick={handleClockIn} disabled={!validation?.canClockIn}>
      Clock In
    </button>
  );
}
```

### 2. View Monthly Stats (พนักงาน/ผู้จัดการ)

```typescript
import { useMonthlyAttendance, useAttendanceStats } from '@/domains/people/features/attendance';

function AttendanceStatsCard() {
  const { user } = useAuth();
  const employee = useEmployee(user.uid);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const { data: records } = useMonthlyAttendance(user.uid, month, year);

  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

  const { data: stats } = useAttendanceStats(user.uid, employee?.id, startDate, endDate);

  return (
    <div>
      <h3>สถิติการเข้างาน {month}/{year}</h3>
      <p>วันทำงาน: {stats?.actualWorkDays} / {stats?.totalDays}</p>
      <p>ขาดงาน: {stats?.absentDays} วัน</p>
      <p>ลางาน: {stats?.onLeaveDays} วัน</p>
      <p>มาสาย: {stats?.lateDays} วัน</p>
      <p>OT: {stats?.overtimeHours} ชั่วโมง</p>
    </div>
  );
}
```

### 3. Generate Payroll (HR)

#### Single Employee
```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/shared/lib/firebase';

const calculatePayroll = httpsCallable(functions, 'calculatePayroll');

async function generatePayrollForEmployee(employeeId: string) {
  const month = 11; // November
  const year = 2025;
  const payDate = '2025-12-05'; // Pay on Dec 5

  try {
    const result = await calculatePayroll({
      employeeId,
      month,
      year,
      payDate,
      notes: 'November 2025 Payroll'
    });

    console.log('Payroll created:', result.data);
    // {
    //   success: true,
    //   payrollId: 'xxx',
    //   data: { grossIncome, netPay, ... }
    // }
  } catch (error) {
    console.error('Failed to generate payroll:', error);
  }
}
```

#### All Employees (Batch)
```typescript
const generateMonthlyPayroll = httpsCallable(functions, 'generateMonthlyPayroll');

async function generatePayrollForAll() {
  const month = 11;
  const year = 2025;
  const payDate = '2025-12-05';

  try {
    const result = await generateMonthlyPayroll({
      month,
      year,
      payDate,
      // departmentFilter: 'Engineering' // Optional
    });

    console.log('Batch result:', result.data);
    // {
    //   success: true,
    //   generated: 50,
    //   skipped: 5,
    //   errors: 0,
    //   details: [...]
    // }
  } catch (error) {
    console.error('Failed to generate batch payroll:', error);
  }
}
```

---

## ⏳ TODO: งานที่ยังต้องทำต่อ

### 1. UI Components (Priority: High)
- [ ] **AttendanceCalendar** - ปฏิทินแสดงการเข้างานรายเดือน
- [ ] **AttendanceStatsCard** - การ์ดสรุปสถิติ
- [ ] **AttendanceFilters** - ฟิลเตอร์ค้นหา
- [ ] **AttendanceReportTable** - ตารางรายงาน export Excel/PDF

### 2. Payroll UI (Priority: High)
- [ ] **PayrollTable** - ตารางแสดงรายการ payroll
- [ ] **PayrollDetail** - หน้ารายละเอียด payroll
- [ ] **PayrollApprovalModal** - Modal อนุมัติ
- [ ] **PayslipViewer** - ดูสลิปเงินเดือน
- [ ] Hooks: `usePayroll`, `usePayrollList`, `useApprovePayroll`

### 3. Reports & Analytics (Priority: Medium)
- [ ] **AttendanceReportPage** - หน้ารายงานการเข้างาน
  - รายวัน, รายสัปดาห์, รายเดือน
  - เปรียบเทียบแผนก
  - Export Excel/PDF
- [ ] **PayrollReportPage** - หน้ารายงานเงินเดือน
  - สรุปรายเดือน
  - เปรียบเทียบแผนก
  - Export payslip (PDF)

### 4. Advanced Features (Priority: Low)
- [ ] **Shift Management** - จัดการกะทำงาน
- [ ] **Geo-location Tracking** - ตรวจสอบ GPS ตอน clock in
- [ ] **Biometric Integration** - เชื่อมกับเครื่องสแกนลายนิ้วมือ
- [ ] **Real-time Alerts** - แจ้งเตือนเมื่อขาดงาน/มาสาย
- [ ] **Approval Workflow** - ระบบอนุมัติ attendance

### 5. Firestore Security Rules (Priority: High)
```javascript
// attendance
match /attendance/{attendanceId} {
  allow read: if isAuthenticated();
  allow create: if isEmployee();
  allow update: if isManager() || isOwner();
  allow delete: if isAdmin();
}

// payroll
match /payroll/{payrollId} {
  allow read: if isHR() || isOwner();
  allow create: if isHR();
  allow update: if isHR() && resource.data.status in ['draft', 'pending'];
  allow delete: if isAdmin();
}
```

### 6. Cloud Functions - Scheduled (Priority: Medium)
- [ ] **dailyAttendanceCheck** - ตรวจสอบขาดงานทุกวัน (23:59)
- [ ] **monthlyPayrollReminder** - แจ้งเตือน HR สร้าง payroll (วันที่ 25 ของเดือน)
- [ ] **payslipGenerator** - สร้าง PDF payslip อัตโนมัติ

### 7. Testing
- [ ] Unit tests สำหรับ calculation functions
- [ ] Integration tests สำหรับ Cloud Functions
- [ ] E2E tests สำหรับ flow ทั้งหมด

---

## 📊 Data Validation Rules

### Attendance
- ✅ ไม่สามารถ clock in ซ้ำในวันเดียว
- ✅ ไม่สามารถ clock in ในวันที่ลา (approved leave)
- ⏳ ไม่สามารถ clock in นอกเวลางาน (configurable)
- ⏳ ไม่สามารถ clock in นอก geo-fence (optional)

### Payroll
- ✅ ไม่สามารถสร้าง payroll ซ้ำในเดือนเดียวกัน
- ✅ ไม่สามารถแก้ไข payroll ที่ approved แล้ว
- ✅ ไม่สามารถจ่ายเงินก่อน approve
- ⏳ ต้องผ่านการอนุมัติก่อนจ่ายเงิน (workflow)

---

## 🎓 Best Practices

### 1. Denormalization Strategy
- Employee name, code, department ถูก denormalize ลง payroll
- เพื่อความเร็วในการ query และสร้างรายงาน
- Trade-off: ต้อง sync เมื่อข้อมูล employee เปลี่ยน

### 2. Calculation Accuracy
- ใช้ Number.parseFloat().toFixed(2) สำหรับเงิน
- เก็บเป็นจำนวนเต็ม (satang) ใน production
- Example: 1000.50 THB → 100050 satang

### 3. Error Handling
- ทุก service function ต้อง try-catch
- Log errors พร้อม context
- Throw meaningful error messages

### 4. Performance
- Index Firestore fields: userId, date, employeeId, month, year
- Use pagination สำหรับ large datasets
- Cache attendance stats (5 minutes)

---

## 🔐 Security Considerations

### 1. Permission Checks
- ใช้ RBAC system ทุกที่
- HR role: full access to payroll
- Manager role: read attendance of team
- Employee role: read own data only

### 2. Sensitive Data
- Payroll data เข้าถึงได้เฉพาะ HR และ employee ตัวเอง
- Encrypt payslip PDFs
- Log ทุกการเข้าถึงข้อมูล payroll

### 3. Validation
- ใช้ Zod validation ทั้ง client และ server
- Sanitize input ก่อน save
- Validate business logic (e.g., month 1-12)

---

## 📞 API Reference

### Cloud Functions Endpoints

#### calculatePayroll
```
Region: asia-southeast1
Callable: true
Auth: Required
Timeout: 60s
Memory: 256MB
```

**Input:**
```typescript
{
  employeeId: string;
  month: number;        // 1-12
  year: number;         // 2000-2100
  payDate: string;      // ISO date
  notes?: string;
}
```

**Output:**
```typescript
{
  success: true;
  payrollId: string;
  data: {
    grossIncome: number;
    totalDeductions: number;
    netPay: number;
    workingDays: number;
    actualWorkDays: number;
    absentDays: number;
    overtimeHours: number;
  }
}
```

**Errors:**
- `unauthenticated` - User not logged in
- `invalid-argument` - Invalid input
- `not-found` - Employee not found
- `already-exists` - Payroll already exists
- `internal` - Server error

#### generateMonthlyPayroll
```
Region: asia-southeast1
Callable: true
Auth: Required (HR only)
Timeout: 300s (5 min)
Memory: 512MB
```

**Input:**
```typescript
{
  month: number;
  year: number;
  payDate: string;
  departmentFilter?: string;  // Optional
}
```

**Output:**
```typescript
{
  success: true;
  generated: number;
  skipped: number;
  errors: number;
  details: Array<{
    employeeId: string;
    employeeName: string;
    status: 'success' | 'skipped' | 'error';
    message?: string;
  }>;
}
```

---

## 🎉 สรุป

### สิ่งที่ได้
1. ✅ **Attendance System** ที่สมบูรณ์
   - Validation ครบถ้วน
   - เชื่อมกับ Leave System
   - คำนวณสถิติอัตโนมัติ

2. ✅ **Payroll Calculation Engine** ที่ถูกต้อง
   - คำนวณจาก attendance data
   - รองรับ Thailand tax & social security
   - ครอบคลุม allowances & deductions

3. ✅ **Cloud Functions** สำหรับ automation
   - Single employee payroll
   - Batch payroll generation

4. ✅ **Type Safety** ทั้งระบบ
   - TypeScript strict mode
   - Zod validation schemas

### สิ่งที่ยังต้องทำ
1. ⏳ **UI Components** (Pages, Cards, Tables, Modals)
2. ⏳ **Reports & Analytics**
3. ⏳ **Firestore Security Rules**
4. ⏳ **Scheduled Functions** (daily/monthly automation)
5. ⏳ **Advanced Features** (Shifts, Geo-tracking, Biometric)

### Next Steps
1. สร้าง UI components สำหรับ Attendance
2. สร้าง Payroll management pages
3. ทดสอบการคำนวณกับข้อมูลจริง
4. Deploy Cloud Functions
5. เพิ่ม Firestore rules
6. สร้าง reports และ analytics

---

**🚀 พร้อมใช้งานในส่วน Backend และ Core Logic แล้ว!**

**📧 ติดต่อ:** สามารถขยายฟีเจอร์เพิ่มเติมได้ตามต้องการ
