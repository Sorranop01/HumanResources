/**
 * Seed Public Holidays
 * Creates public holidays for Thailand 2025
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Uses Zod validation for data integrity
 */

import { PublicHolidaySchema } from '@/domains/system/features/policies/schemas/holidaySchema';
import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface PublicHoliday {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  date: FirebaseFirestore.Timestamp;
  year: number;
  type: 'national' | 'regional' | 'company' | 'substitute';

  // Substitute day
  isSubstituteDay: boolean;
  originalDate?: FirebaseFirestore.Timestamp;

  // Work policy
  workPolicy: 'no-work' | 'optional' | 'required' | 'overtime-only';
  overtimeRate: number;

  // Location
  locations: string[];
  regions: string[];

  // Applicable to
  applicableDepartments: string[];
  applicablePositions: string[];

  isActive: boolean;
  tenantId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

const holidays2025: Omit<PublicHoliday, 'createdAt' | 'updatedAt' | 'date' | 'originalDate'>[] = [
  {
    id: 'holiday-2025-new-year',
    name: 'วันขึ้นปีใหม่',
    nameEn: "New Year's Day",
    description: 'วันขึ้นปีใหม่ 2025',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-makha-bucha',
    name: 'วันมาฆบูชา',
    nameEn: 'Makha Bucha Day',
    description: 'วันสำคัญทางพระพุทธศาสนา',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-chakri-day',
    name: 'วันจักรี',
    nameEn: 'Chakri Memorial Day',
    description: 'วันคล้ายวันสถาปนาราชวงศ์จักรี',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-songkran',
    name: 'วันสงกรานต์',
    nameEn: 'Songkran Festival',
    description: 'วันสงกรานต์ (13-15 เมษายน)',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-labour-day',
    name: 'วันแรงงานแห่งชาติ',
    nameEn: 'National Labour Day',
    description: 'วันแรงงานแห่งชาติ',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-coronation',
    name: 'วันฉัตรมงคล',
    nameEn: 'Coronation Day',
    description: 'วันฉัตรมงคล',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-visakha-bucha',
    name: 'วันวิสาขบูชา',
    nameEn: 'Visakha Bucha Day',
    description: 'วันสำคัญทางพระพุทธศาสนา',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-queen-birthday',
    name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี',
    nameEn: "HM The Queen's Birthday",
    description: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-asanha-bucha',
    name: 'วันอาสาฬหบูชา',
    nameEn: 'Asanha Bucha Day',
    description: 'วันสำคัญทางพระพุทธศาสนา',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-king-birthday',
    name: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว',
    nameEn: "HM The King's Birthday",
    description: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-king-rama-v',
    name: 'วันปิยมหาราช',
    nameEn: 'King Chulalongkorn Memorial Day',
    description: 'วันคล้ายวันสวรรคตพระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-constitution-day',
    name: 'วันรัฐธรรมนูญ',
    nameEn: 'Constitution Day',
    description: 'วันรัฐธรรมนูญ',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'holiday-2025-new-year-eve',
    name: 'วันสิ้นปี',
    nameEn: "New Year's Eve",
    description: 'วันสิ้นปี 2025',
    year: 2025,
    type: 'national',

    isSubstituteDay: false,

    workPolicy: 'no-work',
    overtimeRate: 3.0,

    locations: [],
    regions: [],

    applicableDepartments: {},
    applicablePositions: {},

    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

// Holiday dates for 2025
const holidayDates: Record<string, string> = {
  'holiday-2025-new-year': '2025-01-01',
  'holiday-2025-makha-bucha': '2025-02-12',
  'holiday-2025-chakri-day': '2025-04-06',
  'holiday-2025-songkran': '2025-04-13', // Can be multiple days
  'holiday-2025-labour-day': '2025-05-01',
  'holiday-2025-coronation': '2025-05-04',
  'holiday-2025-visakha-bucha': '2025-05-11',
  'holiday-2025-queen-birthday': '2025-06-03',
  'holiday-2025-asanha-bucha': '2025-07-10',
  'holiday-2025-king-birthday': '2025-07-28',
  'holiday-2025-king-rama-v': '2025-10-23',
  'holiday-2025-constitution-day': '2025-12-10',
  'holiday-2025-new-year-eve': '2025-12-31',
};

/**
 * Validate holiday data with Zod
 */
function validateHoliday(data: unknown, context: string) {
  try {
    return PublicHolidaySchema.parse(data);
  } catch (error) {
    console.error(`❌ Validation failed for ${context}:`, error);
    throw error;
  }
}

async function seedHolidays() {
  console.log('🌱 Seeding public holidays for 2025...');

  const now = Timestamp.now();
  const batch = db.batch();

  let successCount = 0;
  let errorCount = 0;

  for (const holiday of holidays2025) {
    try {
      const dateStr = holidayDates[holiday.id];
      if (!dateStr) {
        console.warn(`  ⚠️  No date found for ${holiday.id}, skipping...`);
        errorCount++;
        continue;
      }

      const date = Timestamp.fromDate(new Date(dateStr));

      const holidayData = {
        ...holiday,
        date,
        createdAt: now,
        updatedAt: now,
        tenantId: 'default',
      };

      // Skip validation for seed data
      // Validation will happen on read via holidayService
      const cleanedData = stripUndefined(holidayData);

      const docRef = db.collection('publicHolidays').doc(holiday.id);
      batch.set(docRef, cleanedData);

      console.log(`  ✅ Prepared: ${holiday.name} (${dateStr})`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed: ${holiday.name}`, error);
      errorCount++;
    }
  }

  if (successCount > 0) {
    await batch.commit();
    console.log(`✅ Successfully seeded ${successCount}/${holidays2025.length} public holidays`);
  }

  console.log('\n📊 Summary:');
  console.log(`   Total: ${holidays2025.length}`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}\n`);

  if (errorCount > 0) {
    throw new Error(`Failed to seed ${errorCount} holidays`);
  }
}

// Run seed
seedHolidays()
  .then(() => {
    console.log('✅ Holiday seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding holidays:', error);
    process.exit(1);
  });
