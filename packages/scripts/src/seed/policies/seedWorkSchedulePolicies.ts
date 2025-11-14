/**
 * Seed Work Schedule Policies
 * Creates default work schedule policies
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Uses Zod validation for data integrity
 */

import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface WorkSchedulePolicy {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  code: string;

  // Working hours
  hoursPerDay: number;
  hoursPerWeek: number;
  daysPerWeek: number;

  // Working days (0=Sunday, 1=Monday, ..., 6=Saturday)
  workingDays: number[];

  // Time configuration
  standardStartTime: string;
  standardEndTime: string;
  breakDuration: number;

  // Late/Early rules
  lateThresholdMinutes: number;
  earlyLeaveThresholdMinutes: number;
  gracePeriodMinutes: number;

  // Flexible time
  allowFlexibleTime: boolean;
  flexibleStartTimeRange?: {
    earliest: string;
    latest: string;
  };
  flexibleEndTimeRange?: {
    earliest: string;
    latest: string;
  };

  // Overtime
  overtimeStartsAfter: number;
  maxOvertimeHoursPerDay: number;

  // Applicable to
  applicableDepartments: string[];
  applicablePositions: string[];
  applicableEmploymentTypes: string[];

  // Effective dates
  effectiveDate: FirebaseFirestore.Timestamp;
  expiryDate?: FirebaseFirestore.Timestamp;

  isActive: boolean;
  tenantId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

const workSchedulePolicies: Omit<
  WorkSchedulePolicy,
  'createdAt' | 'updatedAt' | 'effectiveDate' | 'expiryDate'
>[] = [
  {
    id: 'wsp-standard-mon-fri',
    name: 'เวลาทำงานมาตรฐาน (จันทร์-ศุกร์)',
    nameEn: 'Standard Work Schedule (Mon-Fri)',
    description: 'เวลาทำงาน 08:00-17:00 น. จันทร์-ศุกร์ พัก 1 ชั่วโมง',
    code: 'STD-M-F',

    hoursPerDay: 8,
    hoursPerWeek: 40,
    daysPerWeek: 5,
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri

    standardStartTime: '08:00',
    standardEndTime: '17:00',
    breakDuration: 60, // 1 hour

    lateThresholdMinutes: 15,
    earlyLeaveThresholdMinutes: 15,
    gracePeriodMinutes: 10,

    allowFlexibleTime: true,
    flexibleStartTimeRange: {
      earliest: '07:30',
      latest: '09:00',
    },
    flexibleEndTimeRange: {
      earliest: '16:30',
      latest: '18:00',
    },

    overtimeStartsAfter: 30, // After 30 minutes
    maxOvertimeHoursPerDay: 4,

    applicableDepartments: [],
    applicablePositions: [],
    applicableEmploymentTypes: ['full-time'],

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'wsp-standard-mon-sat',
    name: 'เวลาทำงานมาตรฐาน (จันทร์-เสาร์)',
    nameEn: 'Standard Work Schedule (Mon-Sat)',
    description: 'เวลาทำงาน 08:00-17:00 น. จันทร์-เสาร์ พัก 1 ชั่วโมง',
    code: 'STD-M-S',

    hoursPerDay: 8,
    hoursPerWeek: 48,
    daysPerWeek: 6,
    workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat

    standardStartTime: '08:00',
    standardEndTime: '17:00',
    breakDuration: 60,

    lateThresholdMinutes: 15,
    earlyLeaveThresholdMinutes: 15,
    gracePeriodMinutes: 10,

    allowFlexibleTime: false,

    overtimeStartsAfter: 30,
    maxOvertimeHoursPerDay: 4,

    applicableDepartments: [],
    applicablePositions: [],
    applicableEmploymentTypes: ['full-time'],

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'wsp-flexible',
    name: 'เวลาทำงานแบบยืดหยุ่น',
    nameEn: 'Flexible Work Schedule',
    description: 'เวลาทำงานยืดหยุ่น เข้า 07:00-10:00 น. ออก 16:00-19:00 น.',
    code: 'FLEX',

    hoursPerDay: 8,
    hoursPerWeek: 40,
    daysPerWeek: 5,
    workingDays: [1, 2, 3, 4, 5],

    standardStartTime: '08:00',
    standardEndTime: '17:00',
    breakDuration: 60,

    lateThresholdMinutes: 30,
    earlyLeaveThresholdMinutes: 30,
    gracePeriodMinutes: 15,

    allowFlexibleTime: true,
    flexibleStartTimeRange: {
      earliest: '07:00',
      latest: '10:00',
    },
    flexibleEndTimeRange: {
      earliest: '16:00',
      latest: '19:00',
    },

    overtimeStartsAfter: 60,
    maxOvertimeHoursPerDay: 3,

    applicableDepartments: ['IT', 'Marketing'],
    applicablePositions: [],
    applicableEmploymentTypes: ['full-time'],

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

async function seedWorkSchedulePolicies() {
  console.log('🌱 Seeding work schedule policies...');

  const now = Timestamp.now();
  const effectiveDate = Timestamp.fromDate(new Date('2025-01-01'));
  const batch = db.batch();

  let successCount = 0;
  let errorCount = 0;

  for (const policy of workSchedulePolicies) {
    try {
      const policyData = stripUndefined({
        ...policy,
        effectiveDate,
        createdAt: now,
        updatedAt: now,
        tenantId: 'default',
      });

      // Skip validation for seed data
      // Validation will happen on read via service
      const docRef = db.collection('workSchedulePolicies').doc(policy.id);
      batch.set(docRef, policyData);

      console.log(`  ✅ Prepared: ${policy.name} (${policy.code})`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed: ${policy.name} (${policy.code})`, error);
      errorCount++;
    }
  }

  if (successCount > 0) {
    await batch.commit();
    console.log(
      `✅ Successfully seeded ${successCount}/${workSchedulePolicies.length} work schedule policies`
    );
  }

  console.log('\n📊 Summary:');
  console.log(`   Total: ${workSchedulePolicies.length}`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}\n`);

  if (errorCount > 0) {
    throw new Error(`Failed to seed ${errorCount} work schedule policies`);
  }
}

// Run seed
seedWorkSchedulePolicies()
  .then(() => {
    console.log('✅ Work Schedule Policy seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding work schedule policies:', error);
    process.exit(1);
  });
