/**
 * Seed Leave Types
 * Script to populate leave types master data
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin (no credentials needed for emulator)
if (getApps().length === 0) {
  initializeApp({
    projectId: 'human-b4c2c',
  });
}

const db = getFirestore();

// Connect to emulator
db.settings({
  host: 'localhost:8080',
  ssl: false,
});

const leaveTypes = [
  {
    code: 'ANNUAL',
    nameTh: 'ลาพักร้อน',
    nameEn: 'Annual Leave',
    description: 'ลาพักร้อนประจำปี',
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    maxConsecutiveDays: 15,
    maxDaysPerYear: 20,
    isPaid: true,
    affectsAttendance: false,
    defaultEntitlement: 10,
    accrualType: 'yearly' as const,
    carryOverAllowed: true,
    maxCarryOverDays: 5,
    color: '#1890ff',
    icon: '🏖️',
    sortOrder: 1,
    isActive: true,
  },
  {
    code: 'SICK',
    nameTh: 'ลาป่วย',
    nameEn: 'Sick Leave',
    description: 'ลาป่วยด้วยเหตุผลสุขภาพ',
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 3,
    maxConsecutiveDays: 30,
    maxDaysPerYear: 30,
    isPaid: true,
    affectsAttendance: false,
    defaultEntitlement: 30,
    accrualType: 'yearly' as const,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    color: '#ff4d4f',
    icon: '🤒',
    sortOrder: 2,
    isActive: true,
  },
  {
    code: 'PERSONAL',
    nameTh: 'ลากิจ',
    nameEn: 'Personal Leave',
    description: 'ลากิจส่วนตัว',
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    maxConsecutiveDays: 3,
    maxDaysPerYear: 3,
    isPaid: false,
    affectsAttendance: true,
    defaultEntitlement: 3,
    accrualType: 'yearly' as const,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    color: '#faad14',
    icon: '👤',
    sortOrder: 3,
    isActive: true,
  },
  {
    code: 'MATERNITY',
    nameTh: 'ลาคลอด',
    nameEn: 'Maternity Leave',
    description: 'ลาคลอดบุตร (สำหรับพนักงานหญิง)',
    requiresApproval: true,
    requiresCertificate: true,
    certificateRequiredAfterDays: 0,
    maxConsecutiveDays: 90,
    maxDaysPerYear: 90,
    isPaid: true,
    affectsAttendance: false,
    defaultEntitlement: 90,
    accrualType: 'none' as const,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    color: '#eb2f96',
    icon: '🤱',
    sortOrder: 4,
    isActive: true,
  },
  {
    code: 'PATERNITY',
    nameTh: 'ลาบิดา',
    nameEn: 'Paternity Leave',
    description: 'ลาเพื่อดูแลภรรยาที่คลอดบุตร',
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    maxConsecutiveDays: 5,
    maxDaysPerYear: 5,
    isPaid: true,
    affectsAttendance: false,
    defaultEntitlement: 5,
    accrualType: 'none' as const,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    color: '#722ed1',
    icon: '👨',
    sortOrder: 5,
    isActive: true,
  },
  {
    code: 'TRAINING',
    nameTh: 'ลาฝึกอบรม',
    nameEn: 'Training Leave',
    description: 'ลาเพื่อเข้ารับการฝึกอบรม',
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    maxConsecutiveDays: 10,
    maxDaysPerYear: 10,
    isPaid: true,
    affectsAttendance: false,
    defaultEntitlement: 5,
    accrualType: 'none' as const,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    color: '#13c2c2',
    icon: '🎓',
    sortOrder: 6,
    isActive: true,
  },
  {
    code: 'UNPAID',
    nameTh: 'ลาไม่รับค่าจ้าง',
    nameEn: 'Unpaid Leave',
    description: 'ลาโดยไม่รับค่าจ้าง',
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    maxConsecutiveDays: 30,
    maxDaysPerYear: 30,
    isPaid: false,
    affectsAttendance: true,
    defaultEntitlement: 0,
    accrualType: 'none' as const,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    color: '#8c8c8c',
    icon: '⏸️',
    sortOrder: 7,
    isActive: true,
  },
];

async function seedLeaveTypes(): Promise<void> {
  console.log('🌱 Starting to seed leave types...\n');
  console.log('📡 Connected to Firestore Emulator at localhost:8080\n');

  for (const leaveType of leaveTypes) {
    try {
      // Check if leave type already exists
      const existingQuery = await db
        .collection('leaveTypes')
        .where('code', '==', leaveType.code)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        // Update existing leave type
        const existingDoc = existingQuery.docs[0];
        await existingDoc.ref.update({
          ...leaveType,
          updatedAt: Timestamp.now(),
        });
        console.log(`♻️  Updated leave type: ${leaveType.nameTh} (${leaveType.code})`);
      } else {
        // Create new leave type
        const docRef = db.collection('leaveTypes').doc();
        await docRef.set({
          ...leaveType,
          id: docRef.id,
          tenantId: 'default',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log(`✅ Created leave type: ${leaveType.nameTh} (${leaveType.code})`);
      }
    } catch (error) {
      console.error(`❌ Failed to create leave type: ${leaveType.nameTh}`, error);
    }
  }

  console.log('\n✨ Leave types seeding completed!');
  process.exit(0);
}

seedLeaveTypes().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
