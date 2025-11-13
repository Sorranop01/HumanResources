/**
 * Seed Shifts
 * Creates default shift definitions
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Uses Zod validation for data integrity
 */

import { ShiftSchema } from '@/domains/system/features/policies/schemas/shiftSchema';
import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface ShiftBreak {
  name: string;
  nameEn: string;
  startTime: string;
  duration: number;
}

interface Shift {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  code: string;

  // Time configuration
  startTime: string;
  endTime: string;
  breaks: ShiftBreak[];

  // Hours
  workHours: number;
  grossHours: number;

  // Premium
  premiumRate: number;
  nightShiftBonus: number;

  // Applicable days (0=Sunday, 1=Monday, ..., 6=Saturday)
  applicableDays: number[];

  // UI
  color?: string;

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

const shifts: Omit<Shift, 'createdAt' | 'updatedAt' | 'effectiveDate' | 'expiryDate'>[] = [
  {
    id: 'shift-morning',
    name: 'กะเช้า',
    nameEn: 'Morning Shift',
    description: 'กะเช้า 08:00-17:00',
    code: 'MORNING',

    startTime: '08:00',
    endTime: '17:00',
    breaks: [
      {
        name: 'พักเที่ยง',
        nameEn: 'Lunch Break',
        startTime: '12:00',
        duration: 60,
      },
    ],

    workHours: 8,
    grossHours: 9,

    premiumRate: 0,
    nightShiftBonus: 0,

    applicableDays: [1, 2, 3, 4, 5], // Mon-Fri

    color: '#3B82F6',

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'shift-afternoon',
    name: 'กะบ่าย',
    nameEn: 'Afternoon Shift',
    description: 'กะบ่าย 14:00-23:00',
    code: 'AFTERNOON',

    startTime: '14:00',
    endTime: '23:00',
    breaks: [
      {
        name: 'พักเย็น',
        nameEn: 'Dinner Break',
        startTime: '18:00',
        duration: 60,
      },
    ],

    workHours: 8,
    grossHours: 9,

    premiumRate: 0.25,
    nightShiftBonus: 500,

    applicableDays: [1, 2, 3, 4, 5],

    color: '#F59E0B',

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'shift-night',
    name: 'กะดึก',
    nameEn: 'Night Shift',
    description: 'กะดึก 22:00-07:00',
    code: 'NIGHT',

    startTime: '22:00',
    endTime: '07:00',
    breaks: [
      {
        name: 'พักกลางดึก',
        nameEn: 'Midnight Break',
        startTime: '02:00',
        duration: 60,
      },
    ],

    workHours: 8,
    grossHours: 9,

    premiumRate: 0.5,
    nightShiftBonus: 800,

    applicableDays: [0, 1, 2, 3, 4, 5, 6], // All days

    color: '#8B5CF6',

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'shift-12hr-day',
    name: 'กะยาว (วัน)',
    nameEn: '12-Hour Day Shift',
    description: 'กะยาว 12 ชม. กลางวัน 07:00-19:00',
    code: '12H-DAY',

    startTime: '07:00',
    endTime: '19:00',
    breaks: [
      {
        name: 'พักเช้า',
        nameEn: 'Morning Break',
        startTime: '10:00',
        duration: 15,
      },
      {
        name: 'พักเที่ยง',
        nameEn: 'Lunch Break',
        startTime: '12:00',
        duration: 60,
      },
      {
        name: 'พักบ่าย',
        nameEn: 'Afternoon Break',
        startTime: '15:00',
        duration: 15,
      },
    ],

    workHours: 10.5,
    grossHours: 12,

    premiumRate: 0.3,
    nightShiftBonus: 0,

    applicableDays: [1, 2, 3, 4, 5, 6],

    color: '#10B981',

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'shift-12hr-night',
    name: 'กะยาว (คืน)',
    nameEn: '12-Hour Night Shift',
    description: 'กะยาว 12 ชม. กลางคืน 19:00-07:00',
    code: '12H-NIGHT',

    startTime: '19:00',
    endTime: '07:00',
    breaks: [
      {
        name: 'พักค่ำ',
        nameEn: 'Dinner Break',
        startTime: '21:00',
        duration: 60,
      },
      {
        name: 'พักกลางดึก',
        nameEn: 'Midnight Break',
        startTime: '01:00',
        duration: 15,
      },
      {
        name: 'พักเช้า',
        nameEn: 'Early Morning Break',
        startTime: '04:00',
        duration: 15,
      },
    ],

    workHours: 10.5,
    grossHours: 12,

    premiumRate: 0.75,
    nightShiftBonus: 1200,

    applicableDays: [0, 1, 2, 3, 4, 5, 6],

    color: '#6366F1',

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

/**
 * Validate shift data with Zod
 */
function validateShift(data: unknown, context: string) {
  try {
    return ShiftSchema.parse(data);
  } catch (error) {
    console.error(`❌ Validation failed for ${context}:`, error);
    throw error;
  }
}

async function seedShifts() {
  console.log('🌱 Seeding shifts...');

  const now = Timestamp.now();
  const effectiveDate = Timestamp.fromDate(new Date('2025-01-01'));
  const batch = db.batch();

  let successCount = 0;
  let errorCount = 0;

  for (const shift of shifts) {
    try {
      const shiftData = {
        ...shift,
        effectiveDate,
        createdAt: now,
        updatedAt: now,
        tenantId: 'default',
      };

      // ✅ Validate with Zod before writing
      const validated = validateShift(stripUndefined(shiftData), `${shift.name} (${shift.code})`);

      const docRef = db.collection('shifts').doc(validated.id);
      batch.set(docRef, validated);

      console.log(`  ✅ Prepared: ${shift.name} (${shift.code})`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed: ${shift.name} (${shift.code})`, error);
      errorCount++;
    }
  }

  if (successCount > 0) {
    await batch.commit();
    console.log(`✅ Successfully seeded ${successCount}/${shifts.length} shifts`);
  }

  console.log('\n📊 Summary:');
  console.log(`   Total: ${shifts.length}`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}\n`);

  if (errorCount > 0) {
    throw new Error(`Failed to seed ${errorCount} shifts`);
  }
}

// Run seed
seedShifts()
  .then(() => {
    console.log('✅ Shift seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding shifts:', error);
    process.exit(1);
  });
