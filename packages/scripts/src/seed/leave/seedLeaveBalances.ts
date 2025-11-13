/**
 * Seed Leave Balances (Leave Entitlements)
 * Creates leave balance records for all employees
 *
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses Zod validation for data integrity
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Must run AFTER seedEmployees and seedLeaveTypes
 */

// ✅ Import Zod schema from domain layer
import { LeaveEntitlementSchema } from '@/domains/people/features/leave/schemas/leaveEntitlementSchema';
import type { LeaveEntitlement } from '@/domains/people/features/leave/types/leaveEntitlement';
import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

// ============================================
// Constants
// ============================================

const COLLECTION_NAME = 'leaveEntitlements';
const TENANT_ID = 'default';

// ============================================
// Helpers
// ============================================

/**
 * Generate random used days (for demo purposes)
 */
function getRandomUsedDays(max: number): number {
  return Math.floor(Math.random() * (max / 2));
}

/**
 * Calculate effective dates for leave entitlement
 */
function calculateEffectiveDates(year: number): { from: Timestamp; to: Timestamp } {
  return {
    from: Timestamp.fromDate(new Date(year, 0, 1)), // Jan 1
    to: Timestamp.fromDate(new Date(year, 11, 31)), // Dec 31
  };
}

/**
 * Validates a leave entitlement using Zod schema
 * @throws {ZodError} if validation fails
 */
function validateLeaveEntitlement(data: unknown, context: string): LeaveEntitlement {
  try {
    return LeaveEntitlementSchema.parse(data);
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

export async function seedLeaveBalances() {
  console.log(`🌱 Seeding ${COLLECTION_NAME}...`);

  try {
    // 1. Fetch all employees
    const employeesSnapshot = await db.collection('employees').get();
    if (employeesSnapshot.empty) {
      console.log('⚠️  No employees found. Please run seedEmployees first.');
      return { successCount: 0, errorCount: 0, total: 0 };
    }

    // 2. Fetch all leave types
    const leaveTypesSnapshot = await db.collection('leaveTypes').get();
    if (leaveTypesSnapshot.empty) {
      console.log('⚠️  No leave types found. Please run seedLeaveTypes first.');
      return { successCount: 0, errorCount: 0, total: 0 };
    }

    const employees = employeesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const leaveTypes = leaveTypesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const currentYear = new Date().getFullYear();
    const now = Timestamp.now();
    const { from: effectiveFrom, to: effectiveTo } = calculateEffectiveDates(currentYear);

    let batch = db.batch();
    let successCount = 0;
    let errorCount = 0;
    let operationCount = 0;

    // 3. Create leave balance for each employee × each leave type
    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        // Skip if leave type is not active
        if (!leaveType.isActive) continue;

        // Skip WFH as it's not a traditional leave balance
        if (leaveType.code === 'WFH') continue;

        try {
          // Generate demo data
          const used = getRandomUsedDays(leaveType.defaultEntitlement);
          const carriedOver = leaveType.carryOverAllowed ? Math.floor(Math.random() * 5) : 0;
          const totalEntitlement = leaveType.defaultEntitlement + carriedOver;
          const remaining = totalEntitlement - used;

          const entitlementId = `entitlement-${employee.id}-${leaveType.id}-${currentYear}`;

          // Prepare entitlement data
          const entitlementData: Omit<LeaveEntitlement, 'createdAt' | 'updatedAt'> = {
            id: entitlementId,

            // Employee (denormalized)
            employeeId: employee.id,
            employeeName: employee.displayName || `${employee.firstName} ${employee.lastName}`,
            employeeCode: employee.employeeCode || 'N/A',

            // Leave Type (denormalized)
            leaveTypeId: leaveType.id,
            leaveTypeCode: leaveType.code,
            leaveTypeName: leaveType.nameTh,

            // Entitlement Period
            year: currentYear,
            effectiveFrom,
            effectiveTo,

            // Balance
            totalEntitlement,
            carriedOver,
            accrued: leaveType.defaultEntitlement,
            used,
            pending: 0,
            remaining,

            // Calculation Details
            basedOnTenure: false,
            tenureYears: 0,

            // Status
            isActive: true,

            // Metadata
            lastCalculatedAt: now,
            tenantId: TENANT_ID,
          };

          // Add timestamps
          const completeData = {
            ...entitlementData,
            createdAt: now,
            updatedAt: now,
            createdBy: 'system',
            updatedBy: 'system',
          };

          // Strip undefined values
          const sanitized = stripUndefined(completeData);

          // ✅ Validate with Zod schema
          const validated = validateLeaveEntitlement(
            sanitized,
            `${employee.employeeCode} - ${leaveType.code}`
          );

          // Add to batch
          const docRef = db.collection(COLLECTION_NAME).doc(validated.id);
          batch.set(docRef, validated);

          successCount++;
          operationCount++;

          // Commit in batches of 500 (Firestore limit)
          if (operationCount === 500) {
            await batch.commit();
            console.log(`  ✅ Created ${successCount} leave entitlements...`);
            batch = db.batch();
            operationCount = 0;
          }
        } catch (error) {
          console.error(
            `  ❌ Failed to create entitlement for ${employee.employeeCode} - ${leaveType.code}:`,
            error
          );
          errorCount++;
        }
      }
    }

    // Commit remaining operations
    if (operationCount > 0) {
      await batch.commit();
    }

    const total = successCount + errorCount;

    console.log(`\n✅ Successfully seeded ${successCount}/${total} leave entitlements`);
    console.log(`   📊 ${employees.length} employees × ${leaveTypes.length - 1} leave types`);
    console.log(`   📅 Year: ${currentYear}`);

    if (errorCount > 0) {
      console.warn(`⚠️  Failed to seed ${errorCount} entitlements`);
    }

    return { successCount, errorCount, total };
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
 * pnpm tsx packages/scripts/src/seed/leave/seedLeaveBalances.ts
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLeaveBalances()
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
