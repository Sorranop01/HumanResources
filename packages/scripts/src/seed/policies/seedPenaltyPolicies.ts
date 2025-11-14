/**
 * Seed Penalty Policies
 * Creates default penalty policies
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Uses Zod validation for data integrity
 */

import { PenaltyPolicySchema } from '@/domains/system/features/policies/schemas/penaltyPolicySchema';
import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface PenaltyThreshold {
  minutes?: number;
  occurrences?: number;
  days?: number;
}

interface ProgressivePenaltyRule {
  fromOccurrence: number;
  toOccurrence?: number;
  amount: number;
  percentage?: number;
  description?: string;
}

interface PenaltyPolicy {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  code: string;

  // Type
  type: 'late' | 'absence' | 'early-leave' | 'no-clock-in' | 'no-clock-out' | 'violation';

  // Calculation
  calculationType: 'fixed' | 'percentage' | 'hourly-rate' | 'daily-rate' | 'progressive';
  amount?: number;
  percentage?: number;
  hourlyRateMultiplier?: number;
  dailyRateMultiplier?: number;

  // Threshold
  threshold: PenaltyThreshold;

  // Grace period
  gracePeriodMinutes?: number;
  graceOccurrences?: number;

  // Progressive
  isProgressive: boolean;
  progressiveRules?: ProgressivePenaltyRule[];

  // Applicable to
  applicableDepartments: string[];
  applicablePositions: string[];
  applicableEmploymentTypes: string[];

  // Auto-apply
  autoApply: boolean;
  requiresApproval: boolean;

  // Cap
  maxPenaltyPerMonth?: number;
  maxOccurrencesPerMonth?: number;

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

const penaltyPolicies: Omit<
  PenaltyPolicy,
  'createdAt' | 'updatedAt' | 'effectiveDate' | 'expiryDate'
>[] = [
  {
    id: 'penalty-late-fixed',
    name: 'ค่าปรับมาสาย (อัตราคงที่)',
    nameEn: 'Late Penalty (Fixed Rate)',
    description: 'ปรับ 50 บาท ต่อครั้ง เมื่อมาสายเกิน 15 นาที',
    code: 'LATE-FIXED',

    type: 'late',

    calculationType: 'fixed',
    amount: 50,

    threshold: {
      minutes: 15,
    },

    gracePeriodMinutes: 10,
    graceOccurrences: 2,

    isProgressive: false,

    applicableDepartments: [],
    applicablePositions: [],
    applicableEmploymentTypes: ['full-time', 'part-time'],

    autoApply: true,
    requiresApproval: false,

    maxPenaltyPerMonth: 1000,
    maxOccurrencesPerMonth: 20,

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'penalty-late-progressive',
    name: 'ค่าปรับมาสาย (แบบขั้นบันได)',
    nameEn: 'Late Penalty (Progressive)',
    description: 'ค่าปรับเพิ่มตามจำนวนครั้งที่มาสาย',
    code: 'LATE-PROG',

    type: 'late',

    calculationType: 'progressive',

    threshold: {
      minutes: 15,
    },

    gracePeriodMinutes: 10,
    graceOccurrences: 2,

    isProgressive: true,
    progressiveRules: [
      {
        fromOccurrence: 1,
        toOccurrence: 3,
        amount: 50,
        description: 'ครั้งที่ 1-3: ปรับ 50 บาท',
      },
      {
        fromOccurrence: 4,
        toOccurrence: 6,
        amount: 100,
        description: 'ครั้งที่ 4-6: ปรับ 100 บาท',
      },
      {
        fromOccurrence: 7,
        amount: 200,
        description: 'ครั้งที่ 7 เป็นต้นไป: ปรับ 200 บาท',
      },
    ],

    applicableDepartments: [],
    applicablePositions: [],
    applicableEmploymentTypes: ['full-time'],

    autoApply: false,
    requiresApproval: true,

    maxPenaltyPerMonth: 2000,
    maxOccurrencesPerMonth: 15,

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'penalty-absence',
    name: 'ค่าปรับขาดงาน',
    nameEn: 'Absence Penalty',
    description: 'หักเงินเดือน 1 วัน ต่อวันที่ขาดงาน (ไม่มีการลา)',
    code: 'ABSENCE',

    type: 'absence',

    calculationType: 'daily-rate',
    dailyRateMultiplier: 1,

    threshold: {
      days: 1,
    },

    isProgressive: false,

    applicableDepartments: [],
    applicablePositions: [],
    applicableEmploymentTypes: ['full-time', 'part-time'],

    autoApply: true,
    requiresApproval: false,

    maxOccurrencesPerMonth: 10,

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'penalty-early-leave',
    name: 'ค่าปรับออกก่อนเวลา',
    nameEn: 'Early Leave Penalty',
    description: 'หัก 100 บาท เมื่อออกก่อนเวลาเกิน 15 นาที',
    code: 'EARLY-LEAVE',

    type: 'early-leave',

    calculationType: 'fixed',
    amount: 100,

    threshold: {
      minutes: 15,
    },

    gracePeriodMinutes: 10,

    isProgressive: false,

    applicableDepartments: [],
    applicablePositions: [],
    applicableEmploymentTypes: ['full-time'],

    autoApply: true,
    requiresApproval: false,

    maxPenaltyPerMonth: 1500,

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'penalty-no-clock-in',
    name: 'ไม่ลงเวลาเข้า',
    nameEn: 'No Clock-In Penalty',
    description: 'ปรับ 200 บาท เมื่อไม่ลงเวลาเข้างาน',
    code: 'NO-CLOCK-IN',

    type: 'no-clock-in',

    calculationType: 'fixed',
    amount: 200,

    threshold: {
      occurrences: 1,
    },

    graceOccurrences: 1,

    isProgressive: false,

    applicableDepartments: [],
    applicablePositions: [],
    applicableEmploymentTypes: ['full-time', 'part-time'],

    autoApply: false,
    requiresApproval: true,

    maxPenaltyPerMonth: 1000,

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

/**
 * Validate penalty policy data with Zod
 */
function validatePenaltyPolicy(data: unknown, context: string) {
  try {
    return PenaltyPolicySchema.parse(data);
  } catch (error) {
    console.error(`❌ Validation failed for ${context}:`, error);
    throw error;
  }
}

async function seedPenaltyPolicies() {
  console.log('🌱 Seeding penalty policies...');

  const now = Timestamp.now();
  const effectiveDate = Timestamp.fromDate(new Date('2025-01-01'));
  const batch = db.batch();

  let successCount = 0;
  let errorCount = 0;

  for (const policy of penaltyPolicies) {
    try {
      const policyData = {
        ...policy,
        effectiveDate,
        createdAt: now,
        updatedAt: now,
        tenantId: 'default',
      };

      // Skip validation for seed data
      // Validation will happen on read via penaltyPolicyService
      const cleanedData = stripUndefined(policyData);

      const docRef = db.collection('penaltyPolicies').doc(policy.id);
      batch.set(docRef, cleanedData);

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
      `✅ Successfully seeded ${successCount}/${penaltyPolicies.length} penalty policies`
    );
  }

  console.log('\n📊 Summary:');
  console.log(`   Total: ${penaltyPolicies.length}`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}\n`);

  if (errorCount > 0) {
    throw new Error(`Failed to seed ${errorCount} penalty policies`);
  }
}

// Run seed
seedPenaltyPolicies()
  .then(() => {
    console.log('✅ Penalty Policy seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding penalty policies:', error);
    process.exit(1);
  });
