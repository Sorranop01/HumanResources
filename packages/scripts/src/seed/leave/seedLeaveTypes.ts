/**
 * Seed Leave Types
 * Creates standard leave types for Thai HR system
 *
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses Zod validation for data integrity
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Single Source of Truth: imports schema from domain layer
 */

// ✅ Import Zod schema from domain layer
import { LeaveTypeSchema } from '@/domains/people/features/leave/schemas/leaveTypeSchema';
import type { LeaveAccrualType, LeaveType } from '@/domains/people/features/leave/types/leaveType';
import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

// ============================================
// Constants
// ============================================

const COLLECTION_NAME = 'leaveTypes';
const TENANT_ID = 'default';

// ============================================
// Seed Data
// ============================================

/**
 * Standard Thai leave types
 * Based on Thai labor law and common HR practices
 */
const leaveTypesData: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    code: 'ANNUAL',
    nameTh: 'ลาพักร้อน',
    nameEn: 'Annual Leave',
    description: 'วันลาพักร้อนประจำปี สามารถสะสมและโอนไปปีถัดไปได้',
    maxDaysPerYear: 10,
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    isPaid: true,
    carryOverAllowed: true,
    maxCarryOverDays: 10,
    defaultEntitlement: 10,
    accrualType: 'yearly' as LeaveAccrualType,
    maxConsecutiveDays: 10,
    affectsAttendance: true,
    color: '#10B981',
    icon: 'umbrella-beach',
    isActive: true,
    sortOrder: 1,
    tenantId: TENANT_ID,
  },
  {
    code: 'SICK',
    nameTh: 'ลาป่วย',
    nameEn: 'Sick Leave',
    description: 'ลาป่วยเมื่อไม่สบาย ต้องมีใบรับรองแพทย์หากลาเกิน 3 วัน',
    maxDaysPerYear: 30,
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 3,
    isPaid: true,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 30,
    accrualType: 'yearly' as LeaveAccrualType,
    maxConsecutiveDays: 30,
    affectsAttendance: true,
    color: '#EF4444',
    icon: 'hospital',
    isActive: true,
    sortOrder: 2,
    tenantId: TENANT_ID,
  },
  {
    code: 'PERSONAL',
    nameTh: 'ลากิจ',
    nameEn: 'Personal Leave',
    description: 'ลากิจส่วนตัวที่มีความจำเป็น',
    maxDaysPerYear: 3,
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    isPaid: true,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 3,
    accrualType: 'yearly' as LeaveAccrualType,
    maxConsecutiveDays: 3,
    affectsAttendance: true,
    color: '#F59E0B',
    icon: 'calendar-days',
    isActive: true,
    sortOrder: 3,
    tenantId: TENANT_ID,
  },
  {
    code: 'MATERNITY',
    nameTh: 'ลาคลอด',
    nameEn: 'Maternity Leave',
    description: 'ลาคลอดบุตร สำหรับพนักงานหญิง ได้รับค่าจ้าง 45-90 วัน ตามกฎหมาย',
    maxDaysPerYear: 90,
    requiresApproval: true,
    requiresCertificate: true,
    certificateRequiredAfterDays: 0,
    isPaid: true,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 90,
    accrualType: 'none' as LeaveAccrualType,
    maxConsecutiveDays: 90,
    affectsAttendance: true,
    color: '#EC4899',
    icon: 'baby',
    isActive: true,
    sortOrder: 4,
    tenantId: TENANT_ID,
  },
  {
    code: 'PATERNITY',
    nameTh: 'ลาเพื่อดูแลบุตรของบิดา',
    nameEn: 'Paternity Leave',
    description: 'ลาเพื่อดูแลบุตรและภรรยาหลังคลอด สำหรับพนักงานชาย',
    maxDaysPerYear: 5,
    requiresApproval: true,
    requiresCertificate: true,
    certificateRequiredAfterDays: 0,
    isPaid: true,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 5,
    accrualType: 'none' as LeaveAccrualType,
    maxConsecutiveDays: 5,
    affectsAttendance: true,
    color: '#3B82F6',
    icon: 'baby-carriage',
    isActive: true,
    sortOrder: 5,
    tenantId: TENANT_ID,
  },
  {
    code: 'MARRIAGE',
    nameTh: 'ลาแต่งงาน',
    nameEn: 'Marriage Leave',
    description: 'ลาเพื่อการแต่งงาน',
    maxDaysPerYear: 3,
    requiresApproval: true,
    requiresCertificate: true,
    certificateRequiredAfterDays: 0,
    isPaid: true,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 3,
    accrualType: 'none' as LeaveAccrualType,
    maxConsecutiveDays: 3,
    affectsAttendance: true,
    color: '#8B5CF6',
    icon: 'heart',
    isActive: true,
    sortOrder: 6,
    tenantId: TENANT_ID,
  },
  {
    code: 'ORDINATION',
    nameTh: 'ลาบวช',
    nameEn: 'Ordination Leave',
    description: 'ลาเพื่อบวชเป็นพระภิกษุ/สามเณร',
    maxDaysPerYear: 15,
    requiresApproval: true,
    requiresCertificate: true,
    certificateRequiredAfterDays: 0,
    isPaid: true,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 15,
    accrualType: 'none' as LeaveAccrualType,
    maxConsecutiveDays: 15,
    affectsAttendance: true,
    color: '#F97316',
    icon: 'place-of-worship',
    isActive: true,
    sortOrder: 7,
    tenantId: TENANT_ID,
  },
  {
    code: 'MILITARY',
    nameTh: 'ลาเพื่อเข้ารับการตรวจเลือกทหาร',
    nameEn: 'Military Service Leave',
    description: 'ลาเพื่อเข้ารับการเกณฑ์ทหาร/ตรวจเลือก',
    maxDaysPerYear: 60,
    requiresApproval: true,
    requiresCertificate: true,
    certificateRequiredAfterDays: 0,
    isPaid: false,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 60,
    accrualType: 'none' as LeaveAccrualType,
    maxConsecutiveDays: 60,
    affectsAttendance: true,
    color: '#059669',
    icon: 'shield',
    isActive: true,
    sortOrder: 8,
    tenantId: TENANT_ID,
  },
  {
    code: 'BEREAVEMENT',
    nameTh: 'ลาเพื่อทำศพ',
    nameEn: 'Bereavement Leave',
    description: 'ลาเพื่อทำศพบิดา มารดา คู่สมรส บุตร',
    maxDaysPerYear: 3,
    requiresApproval: true,
    requiresCertificate: true,
    certificateRequiredAfterDays: 0,
    isPaid: true,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 3,
    accrualType: 'none' as LeaveAccrualType,
    maxConsecutiveDays: 3,
    affectsAttendance: true,
    color: '#6B7280',
    icon: 'cross',
    isActive: true,
    sortOrder: 9,
    tenantId: TENANT_ID,
  },
  {
    code: 'STUDY',
    nameTh: 'ลาเพื่อศึกษาต่อ/อบรม',
    nameEn: 'Study Leave',
    description: 'ลาเพื่อศึกษาต่อหรือเข้ารับการอบรม',
    maxDaysPerYear: 30,
    requiresApproval: true,
    requiresCertificate: true,
    certificateRequiredAfterDays: 0,
    isPaid: false,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 30,
    accrualType: 'none' as LeaveAccrualType,
    maxConsecutiveDays: 30,
    affectsAttendance: true,
    color: '#14B8A6',
    icon: 'graduation-cap',
    isActive: true,
    sortOrder: 10,
    tenantId: TENANT_ID,
  },
  {
    code: 'UNPAID',
    nameTh: 'ลาโดยไม่ได้รับค่าจ้าง',
    nameEn: 'Unpaid Leave',
    description: 'ลาโดยไม่ได้รับเงินเดือน กรณีพิเศษต่างๆ',
    maxDaysPerYear: 365,
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    isPaid: false,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 0,
    accrualType: 'none' as LeaveAccrualType,
    maxConsecutiveDays: 365,
    affectsAttendance: true,
    color: '#9CA3AF',
    icon: 'circle-xmark',
    isActive: true,
    sortOrder: 11,
    tenantId: TENANT_ID,
  },
  {
    code: 'WFH',
    nameTh: 'ทำงานที่บ้าน',
    nameEn: 'Work From Home',
    description: 'ขออนุญาตทำงานจากที่บ้าน (ไม่นับเป็นวันลา)',
    maxDaysPerYear: 365,
    requiresApproval: true,
    requiresCertificate: false,
    certificateRequiredAfterDays: 0,
    isPaid: true,
    carryOverAllowed: false,
    maxCarryOverDays: 0,
    defaultEntitlement: 365,
    accrualType: 'none' as LeaveAccrualType,
    maxConsecutiveDays: 365,
    affectsAttendance: false,
    color: '#06B6D4',
    icon: 'house-laptop',
    isActive: true,
    sortOrder: 12,
    tenantId: TENANT_ID,
  },
];

// ============================================
// Generate IDs
// ============================================

const leaveTypes = leaveTypesData.map((data, _index) => ({
  id: `leave-type-${data.code.toLowerCase()}`,
  ...data,
}));

// ============================================
// Validation Helper
// ============================================

/**
 * Validates a leave type using Zod schema
 * @throws {ZodError} if validation fails
 */
function validateLeaveType(data: unknown, context: string): LeaveType {
  try {
    return LeaveTypeSchema.parse(data);
  } catch (error) {
    console.error(`❌ Validation failed for ${context}:`, data);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
}

// ============================================
// Main Seed Function
// ============================================

export async function seedLeaveTypes() {
  console.log(`🌱 Seeding ${COLLECTION_NAME}...`);

  try {
    const batch = db.batch();
    const collectionRef = db.collection(COLLECTION_NAME);
    const now = Timestamp.now();

    let successCount = 0;
    let errorCount = 0;

    for (const leaveType of leaveTypes) {
      try {
        // 1. Prepare data with timestamps
        const leaveTypeData = {
          ...leaveType,
          createdAt: now,
          updatedAt: now,
          createdBy: 'system',
          updatedBy: 'system',
        };

        // 2. Strip undefined values (Firestore requirement)
        const sanitized = stripUndefined(leaveTypeData);

        // 3. ✅ Validate with Zod schema
        const validated = validateLeaveType(sanitized, `${leaveType.nameTh} (${leaveType.code})`);

        // 4. Add to batch
        const docRef = collectionRef.doc(validated.id);
        batch.set(docRef, validated);

        console.log(`  ✅ Prepared: ${leaveType.nameTh} (${leaveType.code})`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Failed to prepare ${leaveType.code}:`, error);
        errorCount++;
      }
    }

    // Commit batch
    if (successCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully seeded ${successCount}/${leaveTypes.length} leave types`);
    }

    if (errorCount > 0) {
      console.warn(`⚠️  Failed to seed ${errorCount} leave types`);
    }

    return { successCount, errorCount, total: leaveTypes.length };
  } catch (error) {
    console.error(`❌ Fatal error seeding ${COLLECTION_NAME}:`, error);
    throw error;
  }
}

// ============================================
// CLI Execution
// ============================================

/**
 * Run this script directly using:
 * pnpm tsx packages/scripts/src/seed/leave/seedLeaveTypes.ts
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLeaveTypes()
    .then(({ successCount, errorCount, total }) => {
      console.log('\n📊 Summary:');
      console.log(`   Total: ${total}`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);
      process.exit(errorCount > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}
