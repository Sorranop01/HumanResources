/**
 * Seed Overtime Policies
 * Creates default overtime policies
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Uses Zod validation for data integrity
 */

import { OvertimePolicySchema } from '@/domains/system/features/policies/schemas/overtimePolicySchema';
import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface OvertimeRule {
  type: 'weekday' | 'weekend' | 'holiday' | 'after-hours';
  rate: number;
  conditions?: {
    minHours?: number;
    maxHoursPerDay?: number;
    maxHoursPerWeek?: number;
    maxHoursPerMonth?: number;
    roundingMinutes?: number;
  };
}

interface OvertimePolicy {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  code: string;

  // Eligibility
  eligibleEmployeeTypes: string[];
  eligiblePositions: string[];
  eligibleDepartments: string[];

  // Overtime rules
  rules: OvertimeRule[];

  // Approval requirements
  requiresApproval: boolean;
  approvalThresholdHours?: number;
  autoApproveUnder?: number;

  // Special rates
  holidayRate: number;
  weekendRate: number;
  nightShiftRate?: number;

  // Tracking
  trackBySystem: boolean;
  allowManualEntry: boolean;

  // Payment
  paymentMethod: 'cash' | 'included-in-salary' | 'separate';
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';

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

const overtimePolicies: Omit<
  OvertimePolicy,
  'createdAt' | 'updatedAt' | 'effectiveDate' | 'expiryDate'
>[] = [
  {
    id: 'ot-standard',
    name: 'นโยบาย OT มาตรฐาน',
    nameEn: 'Standard Overtime Policy',
    description: 'OT วันธรรมดา 1.5x วันหยุด 2x',
    code: 'OT-STD',

    eligibleEmployeeTypes: ['full-time'],
    eligiblePositions: [],
    eligibleDepartments: [],

    rules: [
      {
        type: 'weekday',
        rate: 1.5,
        conditions: {
          maxHoursPerDay: 4,
          maxHoursPerWeek: 20,
          maxHoursPerMonth: 80,
          roundingMinutes: 15,
        },
      },
      {
        type: 'weekend',
        rate: 2.0,
        conditions: {
          maxHoursPerDay: 8,
          roundingMinutes: 15,
        },
      },
      {
        type: 'holiday',
        rate: 3.0,
        conditions: {
          maxHoursPerDay: 8,
          roundingMinutes: 15,
        },
      },
    ],

    requiresApproval: true,
    approvalThresholdHours: 2,
    autoApproveUnder: 1,

    holidayRate: 3.0,
    weekendRate: 2.0,
    nightShiftRate: 0.5,

    trackBySystem: true,
    allowManualEntry: false,

    paymentMethod: 'separate',
    paymentFrequency: 'monthly',

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'ot-high-rate',
    name: 'นโยบาย OT อัตราสูง',
    nameEn: 'High-Rate Overtime Policy',
    description: 'OT อัตราสูงสำหรับตำแหน่งพิเศษ',
    code: 'OT-HIGH',

    eligibleEmployeeTypes: ['full-time'],
    eligiblePositions: ['Senior Developer', 'Team Lead', 'Manager'],
    eligibleDepartments: ['IT', 'Engineering'],

    rules: [
      {
        type: 'weekday',
        rate: 2.0,
        conditions: {
          maxHoursPerDay: 4,
          maxHoursPerWeek: 20,
          roundingMinutes: 30,
        },
      },
      {
        type: 'weekend',
        rate: 2.5,
        conditions: {
          maxHoursPerDay: 8,
          roundingMinutes: 30,
        },
      },
      {
        type: 'holiday',
        rate: 3.5,
        conditions: {
          maxHoursPerDay: 8,
          roundingMinutes: 30,
        },
      },
    ],

    requiresApproval: true,
    approvalThresholdHours: 4,
    autoApproveUnder: 2,

    holidayRate: 3.5,
    weekendRate: 2.5,
    nightShiftRate: 0.75,

    trackBySystem: true,
    allowManualEntry: true,

    paymentMethod: 'separate',
    paymentFrequency: 'monthly',

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

/**
 * Validate overtime policy data with Zod
 */
function validateOvertimePolicy(data: unknown, context: string) {
  try {
    return OvertimePolicySchema.parse(data);
  } catch (error) {
    console.error(`❌ Validation failed for ${context}:`, error);
    throw error;
  }
}

async function seedOvertimePolicies() {
  console.log('🌱 Seeding overtime policies...');

  const now = Timestamp.now();
  const effectiveDate = Timestamp.fromDate(new Date('2025-01-01'));
  const batch = db.batch();

  let successCount = 0;
  let errorCount = 0;

  for (const policy of overtimePolicies) {
    try {
      const policyData = {
        ...policy,
        effectiveDate,
        createdAt: now,
        updatedAt: now,
        tenantId: 'default',
      };

      // ✅ Validate with Zod before writing
      const validated = validateOvertimePolicy(
        stripUndefined(policyData),
        `${policy.name} (${policy.code})`
      );

      const docRef = db.collection('overtimePolicies').doc(validated.id);
      batch.set(docRef, validated);

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
      `✅ Successfully seeded ${successCount}/${overtimePolicies.length} overtime policies`
    );
  }

  console.log('\n📊 Summary:');
  console.log(`   Total: ${overtimePolicies.length}`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}\n`);

  if (errorCount > 0) {
    throw new Error(`Failed to seed ${errorCount} overtime policies`);
  }
}

// Run seed
seedOvertimePolicies()
  .then(() => {
    console.log('✅ Overtime Policy seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding overtime policies:', error);
    process.exit(1);
  });
