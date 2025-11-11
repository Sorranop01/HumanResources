# แผนการพัฒนาระบบ HR แบบละเอียด

## 📌 ภาพรวม

เอกสารนี้เป็นแผนการพัฒนาแบบ Step-by-step สำหรับสร้างระบบ HR ที่ครบถ้วน ประกอบด้วย:

1. **Social Security (ประกันสังคม)** - 2 สัปดาห์
2. **Leave Management (การจัดการลา)** - 4 สัปดาห์
3. **Payroll (เงินเดือน)** - 2 สัปดาห์
4. **Cloud Functions** - 1 สัปดาห์
5. **Reports & Analytics** - 1 สัปดาห์

**รวมเวลา: 10 สัปดาห์**

---

## 🎯 Phase 1: Social Security (สัปดาห์ที่ 1-2)

### Week 1: Foundation

#### Day 1-2: Data Structure

**Task 1.1: สร้าง Types**
```bash
# สร้างไฟล์ใหม่
touch src/domains/people/features/socialSecurity/types/index.ts
```

```typescript
// src/domains/people/features/socialSecurity/types/index.ts

import type { BaseEntity } from '@/shared/types';

export type SocialSecurityStatus = 'active' | 'inactive' | 'suspended';

export interface SocialSecurity extends BaseEntity {
  employeeId: string;
  employeeName: string;
  employeeCode: string;

  // Registration
  socialSecurityNumber: string;
  registrationDate: Date;
  status: SocialSecurityStatus;

  // Hospital
  hospitalName: string;
  hospitalCode?: string;

  // Rates
  employeeContributionRate: number;
  employerContributionRate: number;

  // Monthly
  contributionBase: number;
  employeeAmount: number;
  employerAmount: number;
  totalAmount: number;

  // Accumulated
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  totalContribution: number;

  // Metadata
  notes?: string;
  lastContributionDate?: Date;
  tenantId: string;
}

export interface SocialSecurityContribution extends BaseEntity {
  socialSecurityId: string;
  payrollId?: string;

  month: number;
  year: number;
  contributionDate: Date;

  contributionBase: number;
  employeeAmount: number;
  employerAmount: number;
  totalAmount: number;

  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: Date;
}

export interface CreateSocialSecurityInput {
  employeeId: string;
  socialSecurityNumber: string;
  registrationDate: Date;
  hospitalName: string;
  hospitalCode?: string;
  employeeContributionRate?: number;
  employerContributionRate?: number;
}

export interface UpdateSocialSecurityInput {
  hospitalName?: string;
  hospitalCode?: string;
  status?: SocialSecurityStatus;
  employeeContributionRate?: number;
  employerContributionRate?: number;
  notes?: string;
}
```

**Task 1.2: สร้าง Zod Schemas**
```bash
touch src/domains/people/features/socialSecurity/schemas/index.ts
```

```typescript
// src/domains/people/features/socialSecurity/schemas/index.ts

import { z } from 'zod';

export const SocialSecurityFormSchema = z.object({
  socialSecurityNumber: z
    .string()
    .min(13, 'เลขประกันสังคมต้องมี 13 หลัก')
    .max(13, 'เลขประกันสังคมต้องมี 13 หลัก')
    .regex(/^[0-9]{13}$/, 'เลขประกันสังคมต้องเป็นตัวเลข 13 หลัก'),

  registrationDate: z.string().min(1, 'กรุณาเลือกวันที่เริ่มจ่าย'),

  hospitalName: z.string().min(1, 'กรุณากระบุชื่อโรงพยาบาล'),

  hospitalCode: z.string().optional(),

  employeeContributionRate: z
    .number()
    .min(0)
    .max(100)
    .default(5),

  employerContributionRate: z
    .number()
    .min(0)
    .max(100)
    .default(5),

  status: z.enum(['active', 'inactive', 'suspended']).default('active'),

  notes: z.string().optional(),
});

export type SocialSecurityFormInput = z.infer<typeof SocialSecurityFormSchema>;
```

**Task 1.3: สร้าง Service Layer**
```bash
touch src/domains/people/features/socialSecurity/services/socialSecurityService.ts
```

```typescript
// services/socialSecurityService.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type {
  SocialSecurity,
  SocialSecurityContribution,
  CreateSocialSecurityInput,
  UpdateSocialSecurityInput,
} from '../types';

const COLLECTION_NAME = 'socialSecurity';
const MAX_SS_BASE = 15000;

export const socialSecurityService = {
  /**
   * Get social security by employee ID
   */
  async getByEmployeeId(employeeId: string): Promise<SocialSecurity | null> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('employeeId', '==', employeeId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      registrationDate: doc.data().registrationDate.toDate(),
      lastContributionDate: doc.data().lastContributionDate?.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    } as SocialSecurity;
  },

  /**
   * Get social security by ID
   */
  async getById(id: string): Promise<SocialSecurity | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
      registrationDate: docSnap.data().registrationDate.toDate(),
      lastContributionDate: docSnap.data().lastContributionDate?.toDate(),
      createdAt: docSnap.data().createdAt.toDate(),
      updatedAt: docSnap.data().updatedAt.toDate(),
    } as SocialSecurity;
  },

  /**
   * Create social security record
   */
  async create(
    input: CreateSocialSecurityInput,
    employee: { name: string; code: string; salary: number }
  ): Promise<void> {
    const docRef = doc(collection(db, COLLECTION_NAME));

    const contributionBase = Math.min(employee.salary, MAX_SS_BASE);
    const employeeRate = input.employeeContributionRate ?? 0.05;
    const employerRate = input.employerContributionRate ?? 0.05;

    const employeeAmount = contributionBase * employeeRate;
    const employerAmount = contributionBase * employerRate;

    await setDoc(docRef, {
      employeeId: input.employeeId,
      employeeName: employee.name,
      employeeCode: employee.code,
      socialSecurityNumber: input.socialSecurityNumber,
      registrationDate: Timestamp.fromDate(input.registrationDate),
      status: 'active',
      hospitalName: input.hospitalName,
      hospitalCode: input.hospitalCode,
      employeeContributionRate: employeeRate,
      employerContributionRate: employerRate,
      contributionBase,
      employeeAmount,
      employerAmount,
      totalAmount: employeeAmount + employerAmount,
      totalEmployeeContribution: 0,
      totalEmployerContribution: 0,
      totalContribution: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      tenantId: 'default',
    });
  },

  /**
   * Update social security
   */
  async update(id: string, input: UpdateSocialSecurityInput): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);

    await updateDoc(docRef, {
      ...input,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Delete social security
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  /**
   * Calculate contribution amounts
   */
  calculateContribution(
    baseSalary: number,
    employeeRate = 0.05,
    employerRate = 0.05
  ) {
    const base = Math.min(baseSalary, MAX_SS_BASE);
    const employeeAmount = base * employeeRate;
    const employerAmount = base * employerRate;

    return {
      contributionBase: base,
      employeeAmount,
      employerAmount,
      totalAmount: employeeAmount + employerAmount,
    };
  },
};
```

#### Day 3-4: React Hooks

**Task 1.4: สร้าง Custom Hooks**

```bash
mkdir -p src/domains/people/features/socialSecurity/hooks
touch src/domains/people/features/socialSecurity/hooks/useSocialSecurity.ts
touch src/domains/people/features/socialSecurity/hooks/useCreateSocialSecurity.ts
touch src/domains/people/features/socialSecurity/hooks/useUpdateSocialSecurity.ts
```

```typescript
// hooks/useSocialSecurity.ts
import { useQuery } from '@tanstack/react-query';
import { socialSecurityService } from '../services/socialSecurityService';

export const useSocialSecurity = (employeeId: string) => {
  return useQuery({
    queryKey: ['socialSecurity', 'employee', employeeId],
    queryFn: () => socialSecurityService.getByEmployeeId(employeeId),
    enabled: !!employeeId,
  });
};

// hooks/useCreateSocialSecurity.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { socialSecurityService } from '../services/socialSecurityService';
import type { CreateSocialSecurityInput } from '../types';

export const useCreateSocialSecurity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      input,
      employee,
    }: {
      input: CreateSocialSecurityInput;
      employee: { name: string; code: string; salary: number };
    }) => {
      await socialSecurityService.create(input, employee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialSecurity'] });
      message.success('บันทึกข้อมูลประกันสังคมสำเร็จ');
    },
    onError: () => {
      message.error('ไม่สามารถบันทึกข้อมูลประกันสังคมได้');
    },
  });
};

// hooks/useUpdateSocialSecurity.ts (คล้ายกัน)
```

#### Day 5: UI Components

**Task 1.5: สร้าง SocialSecurityCard Component**

```bash
mkdir -p src/domains/people/features/socialSecurity/components
touch src/domains/people/features/socialSecurity/components/SocialSecurityCard.tsx
```

```typescript
// components/SocialSecurityCard.tsx
import { Card, Descriptions, Tag, Button, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { FC } from 'react';
import { useSocialSecurity } from '../hooks/useSocialSecurity';

interface Props {
  employeeId: string;
  onEdit?: () => void;
}

export const SocialSecurityCard: FC<Props> = ({ employeeId, onEdit }) => {
  const { data: ss, isLoading } = useSocialSecurity(employeeId);

  if (isLoading) return <Spin />;
  if (!ss) return <div>ยังไม่มีข้อมูลประกันสังคม</div>;

  return (
    <Card
      title="ข้อมูลประกันสังคม"
      extra={
        <Button icon={<EditOutlined />} onClick={onEdit}>
          แก้ไข
        </Button>
      }
    >
      <Descriptions column={2} bordered>
        <Descriptions.Item label="เลขประกันสังคม">
          {ss.socialSecurityNumber}
        </Descriptions.Item>
        <Descriptions.Item label="สถานะ">
          <Tag color={ss.status === 'active' ? 'green' : 'red'}>
            {ss.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="วันที่เริ่มจ่าย">
          {ss.registrationDate.toLocaleDateString('th-TH')}
        </Descriptions.Item>
        <Descriptions.Item label="โรงพยาบาลประจำ">
          {ss.hospitalName}
        </Descriptions.Item>
        <Descriptions.Item label="อัตราพนักงาน">
          {ss.employeeContributionRate * 100}%
        </Descriptions.Item>
        <Descriptions.Item label="อัตรานายจ้าง">
          {ss.employerContributionRate * 100}%
        </Descriptions.Item>
        <Descriptions.Item label="ฐานเงินเดือน">
          {ss.contributionBase.toLocaleString()} บาท
        </Descriptions.Item>
        <Descriptions.Item label="จำนวนเงินรายเดือน">
          {ss.totalAmount.toLocaleString()} บาท
        </Descriptions.Item>
        <Descriptions.Item label="ยอดสะสมพนักงาน">
          {ss.totalEmployeeContribution.toLocaleString()} บาท
        </Descriptions.Item>
        <Descriptions.Item label="ยอดสะสมนายจ้าง">
          {ss.totalEmployerContribution.toLocaleString()} บาท
        </Descriptions.Item>
        <Descriptions.Item label="ยอดสะสมรวม" span={2}>
          <strong>{ss.totalContribution.toLocaleString()} บาท</strong>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
```

### Week 2: Integration

#### Day 6-7: Form Component & Integration

**Task 1.6: สร้าง SocialSecurityForm**

```typescript
// components/SocialSecurityForm.tsx
// ฟอร์มสำหรับสร้าง/แก้ไขข้อมูลประกันสังคม
// ใช้ react-hook-form + zod validation
```

**Task 1.7: เพิ่ม Tab ใน Employee Detail Page**

```typescript
// แก้ไขไฟล์ src/domains/people/features/employees/pages/EmployeeDetailPage.tsx
// เพิ่ม Tab "ประกันสังคม" พร้อม SocialSecurityCard
```

#### Day 8-10: Testing

**Task 1.8: Manual Testing**
- ✅ สร้างข้อมูลประกันสังคมใหม่
- ✅ แก้ไขข้อมูล
- ✅ คำนวณเงินสะสมถูกต้อง
- ✅ แสดงผลใน Employee Detail

---

## 🎯 Phase 2: Leave Management (สัปดาห์ที่ 3-6)

### Week 3: Leave Types & Entitlements

#### Day 1-2: Master Data

**Task 2.1: สร้าง Leave Types Types & Schemas**

```typescript
// src/domains/people/features/leave/types/index.ts

export type LeaveAccrualType = 'yearly' | 'monthly' | 'none';

export interface LeaveType extends BaseEntity {
  code: string;
  nameTh: string;
  nameEn: string;
  description?: string;

  // Rules
  requiresApproval: boolean;
  requiresCertificate: boolean;
  certificateRequiredAfterDays: number;
  maxConsecutiveDays: number;
  maxDaysPerYear: number;

  // Calculation
  isPaid: boolean;
  affectsAttendance: boolean;

  // Entitlement
  defaultEntitlement: number;
  accrualType: LeaveAccrualType;
  carryOverAllowed: boolean;
  maxCarryOverDays: number;

  // Display
  color: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  tenantId: string;
}
```

**Task 2.2: สร้าง Seed Script สำหรับ Leave Types**

```bash
touch scripts/seedLeaveTypes.ts
```

```typescript
// scripts/seedLeaveTypes.ts
import { db } from '../src/shared/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const leaveTypes = [
  {
    code: 'ANNUAL',
    nameTh: 'ลาพักร้อน',
    nameEn: 'Annual Leave',
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    maxConsecutiveDays: 15,
    maxDaysPerYear: 20,
    isPaid: true,
    affectsAttendance: false,
    defaultEntitlement: 10,
    accrualType: 'yearly',
    carryOverAllowed: true,
    maxCarryOverDays: 5,
    color: 'blue',
    icon: '🏖️',
    sortOrder: 1,
    isActive: true,
  },
  {
    code: 'SICK',
    nameTh: 'ลาป่วย',
    nameEn: 'Sick Leave',
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 3,
    maxConsecutiveDays: 30,
    maxDaysPerYear: 30,
    isPaid: true,
    affectsAttendance: false,
    defaultEntitlement: 30,
    accrualType: 'yearly',
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    color: 'red',
    icon: '🤒',
    sortOrder: 2,
    isActive: true,
  },
  {
    code: 'PERSONAL',
    nameTh: 'ลากิจ',
    nameEn: 'Personal Leave',
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    maxConsecutiveDays: 3,
    maxDaysPerYear: 3,
    isPaid: false,
    affectsAttendance: true,
    defaultEntitlement: 3,
    accrualType: 'yearly',
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    color: 'orange',
    icon: '👤',
    sortOrder: 3,
    isActive: true,
  },
];

async function seedLeaveTypes() {
  for (const lt of leaveTypes) {
    const docRef = doc(collection(db, 'leaveTypes'));
    await setDoc(docRef, {
      ...lt,
      tenantId: 'default',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Created leave type: ${lt.nameTh}`);
  }
}

seedLeaveTypes();
```

#### Day 3-5: Leave Entitlements

**Task 2.3: สร้าง Leave Entitlement Service**

```typescript
// services/leaveEntitlementService.ts

export const leaveEntitlementService = {
  /**
   * Calculate annual leave based on tenure
   */
  calculateAnnualLeaveEntitlement(tenureYears: number): number {
    if (tenureYears < 1) return 6;
    if (tenureYears < 2) return 8;
    if (tenureYears < 3) return 10;
    if (tenureYears < 5) return 12;
    if (tenureYears < 10) return 15;
    return 20;
  },

  /**
   * Calculate pro-rata leave for new employees
   */
  calculateProRataLeave(hireDate: Date, entitlement: number): number {
    const now = new Date();
    const monthsWorked = (
      (now.getFullYear() - hireDate.getFullYear()) * 12 +
      (now.getMonth() - hireDate.getMonth())
    );
    const proRata = (monthsWorked / 12) * entitlement;
    return Math.floor(proRata);
  },

  /**
   * Get entitlements by employee
   */
  async getByEmployeeId(employeeId: string, year: number) {
    // Query Firestore...
  },

  /**
   * Create initial entitlements for new employee
   */
  async createInitialEntitlements(employeeId: string, hireDate: Date) {
    // Create entitlements for all active leave types...
  },

  /**
   * Update entitlement balance
   */
  async updateBalance(
    entitlementId: string,
    usedDays: number,
    operation: 'add' | 'subtract'
  ) {
    // Update remaining balance...
  },
};
```

**Task 2.4: สร้าง Leave Entitlement Components**

```typescript
// components/LeaveEntitlementCard.tsx
// แสดงสิทธิ์การลาของพนักงาน แบ่งตามประเภท

// components/LeaveBalanceSummary.tsx
// สรุปสิทธิ์คงเหลือแบบย่อ
```

### Week 4: Leave Requests - Part 1

#### Day 1-3: Leave Request Types & Services

**Task 2.5: สร้าง Leave Request Types**

```typescript
// types/leaveRequest.ts

export type LeaveRequestStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalStep {
  level: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: ApprovalStatus;
  actionAt?: Date;
  comments?: string;
}

export interface LeaveRequest extends BaseEntity {
  requestNumber: string;

  // Employee
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;

  // Leave
  leaveTypeId: string;
  leaveTypeCode: string;
  leaveTypeName: string;

  // Period
  startDate: Date;
  endDate: Date;
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';

  // Details
  reason: string;
  contactDuringLeave?: string;
  workHandoverTo?: string;
  workHandoverNotes?: string;

  // Certificate
  hasCertificate: boolean;
  certificateUrl?: string;
  certificateFileName?: string;

  // Workflow
  status: LeaveRequestStatus;
  submittedAt?: Date;
  approvalChain: ApprovalStep[];
  currentApprovalLevel: number;

  // Rejection/Cancellation
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;
  cancellationReason?: string;

  tenantId: string;
}
```

**Task 2.6: สร้าง Leave Request Service**

```typescript
// services/leaveRequestService.ts

export const leaveRequestService = {
  /**
   * Generate request number
   */
  generateRequestNumber(year: number, sequence: number): string {
    return `LV-${year}-${String(sequence).padStart(4, '0')}`;
  },

  /**
   * Calculate total leave days
   */
  calculateLeaveDays(
    startDate: Date,
    endDate: Date,
    isHalfDay: boolean
  ): number {
    if (isHalfDay) return 0.5;

    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    // TODO: Exclude weekends and holidays
    return days;
  },

  /**
   * Validate leave request
   */
  async validateLeaveRequest(request: CreateLeaveRequestInput) {
    const errors: string[] = [];

    // 1. Check remaining entitlement
    const entitlement = await leaveEntitlementService.getByEmployeeId(
      request.employeeId,
      new Date().getFullYear()
    );

    if (request.totalDays > entitlement.remaining) {
      errors.push('สิทธิ์การลาไม่เพียงพอ');
    }

    // 2. Check overlapping
    const overlapping = await this.checkOverlapping(
      request.employeeId,
      request.startDate,
      request.endDate
    );

    if (overlapping) {
      errors.push('มีการลาในช่วงวันดังกล่าวแล้ว');
    }

    // 3. Check certificate requirement
    const leaveType = await leaveTypeService.getById(request.leaveTypeId);

    if (
      leaveType.requiresCertificate &&
      request.totalDays >= leaveType.certificateRequiredAfterDays &&
      !request.hasCertificate
    ) {
      errors.push(`ต้องแนบใบรับรองแพทย์สำหรับการลาเกิน ${leaveType.certificateRequiredAfterDays} วัน`);
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Create leave request
   */
  async create(input: CreateLeaveRequestInput) {
    // Validate first
    const validation = await this.validateLeaveRequest(input);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Generate request number
    const requestNumber = await this.generateRequestNumber(
      new Date().getFullYear(),
      await this.getNextSequence()
    );

    // Build approval chain
    const approvalChain = await this.buildApprovalChain(
      input.employeeId,
      input.leaveTypeId
    );

    // Create document...
  },

  /**
   * Approve leave request
   */
  async approve(
    requestId: string,
    approverId: string,
    comments?: string
  ) {
    // Update approval chain
    // Check if all approved → update status to 'approved'
    // Update leave entitlement balance
  },

  /**
   * Reject leave request
   */
  async reject(
    requestId: string,
    approverId: string,
    reason: string
  ) {
    // Update status to 'rejected'
    // Record rejection details
  },
};
```

#### Day 4-5: Leave Request Form

**Task 2.7: สร้าง LeaveRequestForm Component**

```typescript
// components/LeaveRequestForm.tsx
// ฟอร์มยื่นคำขอลา
// - เลือกประเภทการลา
// - แสดงสิทธิ์คงเหลือ
// - เลือกวันที่
// - ระบุเหตุผล
// - อัพโหลดใบรับรอง (ถ้าจำเป็น)
// - มอบหมายงาน
```

### Week 5: Leave Requests - Part 2

#### Day 1-3: Leave Request List & Detail

**Task 2.8: สร้าง Leave Request Pages**

```typescript
// pages/LeaveRequestListPage.tsx
// แสดงรายการคำขอลาทั้งหมด
// Filter by status, type, date range

// pages/LeaveRequestDetailPage.tsx
// แสดงรายละเอียดคำขอ
// Timeline approval workflow
// Approve/Reject buttons (ถ้ามีสิทธิ์)
```

**Task 2.9: สร้าง Approval Components**

```typescript
// components/ApprovalWorkflow.tsx
// แสดง timeline การอนุมัติ

// components/ApprovalActions.tsx
// ปุ่ม Approve/Reject พร้อม modal comment
```

#### Day 4-5: Leave Calendar

**Task 2.10: สร้าง Leave Calendar Page**

```typescript
// pages/LeaveCalendarPage.tsx
// ปฏิทินแสดงการลาของทีม
// ใช้ library เช่น react-big-calendar
```

### Week 6: Leave Testing & Integration

#### Day 1-5: Complete Testing

**Task 2.11: Integration & Testing**
- ✅ ยื่นคำขอลาใหม่
- ✅ Workflow การอนุมัติ (multi-level)
- ✅ อัพเดตสิทธิ์คงเหลือ
- ✅ แสดงผลในปฏิทิน
- ✅ แสดงประวัติใน Employee Detail

---

## 🎯 Phase 3: Payroll (สัปดาห์ที่ 7-8)

### Week 7: Payroll Foundation

#### Day 1-3: Payroll Types & Services

**Task 3.1: สร้าง Payroll Types**

```typescript
// types/payroll.ts
// ตามที่ออกแบบไว้ใน HR_SYSTEM_DESIGN.md
```

**Task 3.2: สร้าง Payroll Calculation Service**

```typescript
// services/payrollCalculationService.ts

export const payrollCalculationService = {
  /**
   * Calculate gross income
   */
  calculateGrossIncome(data: {
    baseSalary: number;
    overtimePay: number;
    bonus: number;
    allowances: PayrollAllowances;
  }): number {
    return (
      data.baseSalary +
      data.overtimePay +
      data.bonus +
      Object.values(data.allowances).reduce((sum, val) => sum + val, 0)
    );
  },

  /**
   * Calculate tax withholding
   */
  calculateTax(grossIncome: number): number {
    // สูตรคำนวณภาษีตามกฎหมายไทย
    // ตัวอย่างแบบง่าย (ควรใช้ bracket ที่ถูกต้อง)
    if (grossIncome <= 150000) return 0;
    if (grossIncome <= 300000) return (grossIncome - 150000) * 0.05;
    if (grossIncome <= 500000) return 7500 + (grossIncome - 300000) * 0.10;
    // ... จริงๆ ควรใช้ตารางภาษี
    return 0;
  },

  /**
   * Calculate social security deduction
   */
  calculateSocialSecurityDeduction(
    baseSalary: number,
    rate = 0.05
  ): number {
    const MAX_BASE = 15000;
    const base = Math.min(baseSalary, MAX_BASE);
    return base * rate;
  },

  /**
   * Calculate net pay
   */
  calculateNetPay(grossIncome: number, totalDeductions: number): number {
    return grossIncome - totalDeductions;
  },

  /**
   * Full payroll calculation
   */
  async calculatePayroll(
    employeeId: string,
    month: number,
    year: number,
    overrides?: Partial<PayrollData>
  ): Promise<PayrollCalculationResult> {
    // 1. Get employee data
    const employee = await employeeService.getById(employeeId);

    // 2. Get attendance data for the month
    const attendance = await attendanceService.getMonthlyData(
      employeeId,
      month,
      year
    );

    // 3. Get social security data
    const ss = await socialSecurityService.getByEmployeeId(employeeId);

    // 4. Calculate components
    const baseSalary = overrides?.baseSalary ?? employee.salary;
    const overtimePay = overrides?.overtimePay ?? 0;
    const bonus = overrides?.bonus ?? 0;
    const allowances = overrides?.allowances ?? {
      transportation: 1000,
      housing: 0,
      meal: 500,
      position: 1000,
      other: 0,
    };

    const grossIncome = this.calculateGrossIncome({
      baseSalary,
      overtimePay,
      bonus,
      allowances,
    });

    const tax = this.calculateTax(grossIncome);
    const socialSecurity = ss
      ? this.calculateSocialSecurityDeduction(baseSalary, ss.employeeContributionRate)
      : 0;

    const deductions = {
      tax,
      socialSecurity,
      providentFund: overrides?.deductions?.providentFund ?? 0,
      loan: overrides?.deductions?.loan ?? 0,
      advance: overrides?.deductions?.advance ?? 0,
      latePenalty: overrides?.deductions?.latePenalty ?? 0,
      absencePenalty: overrides?.deductions?.absencePenalty ?? 0,
      other: overrides?.deductions?.other ?? 0,
    };

    const totalDeductions = Object.values(deductions).reduce(
      (sum, val) => sum + val,
      0
    );

    const netPay = this.calculateNetPay(grossIncome, totalDeductions);

    return {
      baseSalary,
      overtimePay,
      bonus,
      allowances,
      grossIncome,
      deductions,
      totalDeductions,
      netPay,
      workingDays: attendance.workingDays,
      actualWorkDays: attendance.actualWorkDays,
      absentDays: attendance.absentDays,
      lateDays: attendance.lateDays,
      overtimeHours: attendance.overtimeHours,
    };
  },
};
```

#### Day 4-5: Payroll Form

**Task 3.3: สร้าง PayrollForm Component**

```typescript
// components/PayrollForm.tsx
// ฟอร์มสร้างใบเงินเดือน (ซับซ้อน)
// - Auto-fill จากข้อมูล employee
// - แบ่ง section: Income, Deductions, Working Days
// - Calculate in real-time
// - Preview ก่อนบันทึก
```

### Week 8: Payroll Pages & PDF

#### Day 1-2: Payroll Pages

**Task 3.4: สร้าง Payroll Pages**

```typescript
// pages/PayrollListPage.tsx
// แสดงรายการใบเงินเดือนทั้งหมด
// Group by month/year
// Filter, sort

// pages/PayrollDetailPage.tsx
// แสดงรายละเอียดใบเงินเดือน
// Actions: Approve, Generate PDF, Send Email
```

#### Day 3-4: PDF Generation

**Task 3.5: สร้าง Payslip PDF Generator**

```typescript
// utils/payslipPDFGenerator.ts
// ใช้ library เช่น jsPDF หรือ pdfmake
// Template สลิปเงินเดือนภาษาไทย

import pdfMake from 'pdfmake/build/pdfmake';

export const generatePayslipPDF = (payroll: Payroll) => {
  const docDefinition = {
    content: [
      { text: 'ใบจ่ายเงินเดือน', style: 'header' },
      { text: `งวด: ${payroll.month}/${payroll.year}` },
      // ... รายละเอียดอื่นๆ
    ],
    styles: {
      header: { fontSize: 18, bold: true },
    },
  };

  pdfMake.createPdf(docDefinition).download(`payslip-${payroll.requestNumber}.pdf`);
};
```

#### Day 5: Integration

**Task 3.6: Integration with Employee Detail**
- เพิ่ม Tab "เงินเดือน" ใน Employee Detail
- แสดง Payroll Summary
- แสดงประวัติการจ่าย

---

## 🎯 Phase 4: Cloud Functions (สัปดาห์ที่ 9)

### Week 9: Backend Automation

**Task 4.1: Payroll Calculation Function**

```typescript
// functions/src/api/payroll/calculatePayroll.ts

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

export const calculatePayroll = onCall(async (request) => {
  const { employeeId, month, year } = request.data;

  // Perform calculation using payrollCalculationService
  // Save to Firestore

  return { success: true, payrollId: '...' };
});
```

**Task 4.2: Social Security Contribution Trigger**

```typescript
// functions/src/triggers/onPayrollCreated.ts

import { onDocumentCreated } from 'firebase-functions/v2/firestore';

export const onPayrollCreated = onDocumentCreated(
  'payroll/{payrollId}',
  async (event) => {
    const payroll = event.data?.data();

    // Update social security contributions
    // Create contribution record
  }
);
```

**Task 4.3: Leave Entitlement Calculator**

```typescript
// functions/src/scheduled/calculateLeaveEntitlements.ts

import { onSchedule } from 'firebase-functions/v2/scheduler';

// Run on January 1st every year
export const calculateAnnualLeaveEntitlements = onSchedule(
  '0 0 1 1 *',
  async () => {
    // Get all active employees
    // Calculate new year entitlements
    // Carry over remaining leave
  }
);
```

**Task 4.4: Leave Approval Notification**

```typescript
// functions/src/triggers/onLeaveRequestStatusChanged.ts

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

export const onLeaveRequestStatusChanged = onDocumentUpdated(
  'leaveRequests/{requestId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (before.status !== after.status) {
      // Send notification to employee
      // Send email if approved/rejected
    }
  }
);
```

**Task 4.5: Monthly Payroll Reminder**

```typescript
// functions/src/scheduled/payrollReminder.ts

import { onSchedule } from 'firebase-functions/v2/scheduler';

// Run on 20th of every month
export const monthlyPayrollReminder = onSchedule('0 9 20 * *', async () => {
  // Send notification to HR
  // Reminder to process payroll
});
```

---

## 🎯 Phase 5: Reports & Analytics (สัปดาห์ที่ 10)

### Week 10: Dashboards & Reports

**Task 5.1: Payroll Dashboard**

```typescript
// pages/PayrollDashboardPage.tsx
// - Total payroll expense by month
// - Average salary
// - Department breakdown
// - Charts (Bar, Pie, Line)
```

**Task 5.2: Leave Analytics**

```typescript
// pages/LeaveAnalyticsPage.tsx
// - Leave usage by type
// - Leave trends
// - Busiest months
// - Department comparison
```

**Task 5.3: Export Functions**

```typescript
// utils/exportToExcel.ts
// Export payroll/leave data to Excel

import * as XLSX from 'xlsx';

export const exportPayrollToExcel = (payrolls: Payroll[]) => {
  const worksheet = XLSX.utils.json_to_sheet(payrolls);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll');
  XLSX.writeFile(workbook, `payroll-${Date.now()}.xlsx`);
};
```

---

## ✅ Final Checklist

### Functional Requirements
- [ ] พนักงานสามารถยื่นคำขอลาได้
- [ ] ระบบ approval workflow ทำงานถูกต้อง
- [ ] คำนวณสิทธิ์การลาตามอายุงาน
- [ ] คำนวณเงินเดือนถูกต้อง
- [ ] คำนวณประกันสังคมถูกต้อง (5% + 5%)
- [ ] คำนวณภาษีหัก ณ ที่จ่าย
- [ ] สร้าง PDF สลิปเงินเดือน
- [ ] แสดงปฏิทินการลา
- [ ] แสดง Dashboard & Reports

### Non-Functional Requirements
- [ ] Response time < 2s
- [ ] Support 1000+ employees
- [ ] Mobile responsive
- [ ] Zero TypeScript errors
- [ ] Pass Biome checks
- [ ] Security rules implemented
- [ ] Error handling ครบถ้วน

### Code Quality
- [ ] Follow FSD architecture
- [ ] Use proper TypeScript types
- [ ] Zod validation ทุก form
- [ ] React Query for all data fetching
- [ ] Proper error messages (Thai)
- [ ] Loading states everywhere
- [ ] Comments in Thai where needed

---

## 📝 คำแนะนำในการพัฒนา

### 1. เริ่มจากง่ายไปยาก
- เริ่มจาก Social Security (ง่ายที่สุด)
- ไปที่ Leave Management (ปานกลาง)
- จบที่ Payroll (ซับซ้อนที่สุด)

### 2. Test ทุก Feature ก่อนไปต่อ
- Unit tests สำหรับ calculation logic
- Integration tests สำหรับ workflow
- Manual testing UI/UX

### 3. ใช้ Emulator ในระหว่างพัฒนา
```bash
firebase emulators:start
```

### 4. Commit บ่อยๆ
```bash
git commit -m "feat(leave): add leave request form"
```

### 5. Deploy เป็น Stage
- Dev → Staging → Production
- Test บน staging ก่อน production

---

**เอกสารสร้างเมื่อ**: 2025-11-12
**ผู้สร้าง**: Claude Code AI
**สถานะ**: พร้อมใช้งาน
