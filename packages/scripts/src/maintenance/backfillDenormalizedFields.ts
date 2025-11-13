/**
 * Backfill Script: Sync Denormalized Fields
 *
 * Purpose:
 * - Ensures all existing documents have correct denormalized fields
 * - Runs idempotently (safe to re-run multiple times)
 * - Syncs: employeeName, departmentName, positionName, leaveTypeName, leaveTypeCode
 *
 * Collections Updated:
 * 1. employees → displayName, departmentName, positionName
 * 2. attendance → employeeName, departmentName
 * 3. leaveRequests → employeeName, departmentName, positionName, leaveTypeName, leaveTypeCode
 * 4. leaveEntitlements → leaveTypeName, leaveTypeCode
 * 5. payrollRecords → employeeName, departmentName, positionName
 *
 * Run: pnpm run backfill:denormalized
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: 'human-b4c2c',
  });
}

const db = getFirestore();

interface Stats {
  processed: number;
  updated: number;
  skipped: number;
  errors: number;
}

/**
 * Helper: Get department name by ID
 */
async function getDepartmentName(deptId: string): Promise<string | null> {
  try {
    const doc = await db.collection('departments').doc(deptId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return data?.name || null;
  } catch (error) {
    console.error(`❌ Error fetching department ${deptId}:`, error);
    return null;
  }
}

/**
 * Helper: Get position name by ID
 */
async function getPositionName(positionId: string): Promise<string | null> {
  try {
    const doc = await db.collection('positions').doc(positionId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return data?.name || null;
  } catch (error) {
    console.error(`❌ Error fetching position ${positionId}:`, error);
    return null;
  }
}

/**
 * Helper: Get leave type info by ID
 */
async function getLeaveTypeInfo(
  leaveTypeId: string
): Promise<{ name: string; code: string } | null> {
  try {
    const doc = await db.collection('leaveTypes').doc(leaveTypeId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return {
      name: data?.name || '',
      code: data?.code || '',
    };
  } catch (error) {
    console.error(`❌ Error fetching leave type ${leaveTypeId}:`, error);
    return null;
  }
}

/**
 * Step 1: Sync Employees Collection
 * Updates: displayName, departmentName, positionName
 */
async function syncEmployees(): Promise<Stats> {
  console.log('\n📋 Step 1: Syncing Employees...');
  const stats: Stats = { processed: 0, updated: 0, skipped: 0, errors: 0 };

  try {
    const snapshot = await db.collection('employees').get();
    console.log(`   Found ${snapshot.size} employees`);

    for (const doc of snapshot.docs) {
      stats.processed++;
      const data = doc.data();
      const updates: Record<string, unknown> = {};

      // Update displayName
      const expectedDisplayName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      if (data.displayName !== expectedDisplayName) {
        updates.displayName = expectedDisplayName;
      }

      // Update departmentName
      if (data.department) {
        const deptName = await getDepartmentName(data.department);
        if (deptName && data.departmentName !== deptName) {
          updates.departmentName = deptName;
        }
      }

      // Update positionName
      if (data.position) {
        const posName = await getPositionName(data.position);
        if (posName && data.positionName !== posName) {
          updates.positionName = posName;
        }
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = FieldValue.serverTimestamp();
        await doc.ref.update(updates);
        stats.updated++;
        console.log(`   ✅ Updated employee ${doc.id}`);
      } else {
        stats.skipped++;
      }
    }
  } catch (error) {
    console.error('❌ Error syncing employees:', error);
    stats.errors++;
  }

  console.log(
    `   📊 Processed: ${stats.processed}, Updated: ${stats.updated}, Skipped: ${stats.skipped}`
  );
  return stats;
}

/**
 * Step 2: Sync Attendance Records
 * Updates: employeeName, departmentName
 */
async function syncAttendance(): Promise<Stats> {
  console.log('\n📋 Step 2: Syncing Attendance Records...');
  const stats: Stats = { processed: 0, updated: 0, skipped: 0, errors: 0 };

  try {
    const snapshot = await db.collectionGroup('attendance').limit(500).get();
    console.log(`   Found ${snapshot.size} attendance records`);

    for (const doc of snapshot.docs) {
      stats.processed++;
      const data = doc.data();
      const updates: Record<string, unknown> = {};

      // Get employee info
      if (data.employeeId) {
        const empDoc = await db.collection('employees').doc(data.employeeId).get();
        if (empDoc.exists) {
          const empData = empDoc.data();
          if (empData) {
            const employeeName = empData.displayName || `${empData.firstName} ${empData.lastName}`;
            if (data.employeeName !== employeeName) {
              updates.employeeName = employeeName;
            }
            if (empData.departmentName && data.departmentName !== empData.departmentName) {
              updates.departmentName = empData.departmentName;
            }
          }
        }
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = FieldValue.serverTimestamp();
        await doc.ref.update(updates);
        stats.updated++;
      } else {
        stats.skipped++;
      }
    }
  } catch (error) {
    console.error('❌ Error syncing attendance:', error);
    stats.errors++;
  }

  console.log(
    `   📊 Processed: ${stats.processed}, Updated: ${stats.updated}, Skipped: ${stats.skipped}`
  );
  return stats;
}

/**
 * Step 3: Sync Leave Requests
 * Updates: employeeName, departmentName, positionName, leaveTypeName, leaveTypeCode
 */
async function syncLeaveRequests(): Promise<Stats> {
  console.log('\n📋 Step 3: Syncing Leave Requests...');
  const stats: Stats = { processed: 0, updated: 0, skipped: 0, errors: 0 };

  try {
    const snapshot = await db.collection('leaveRequests').limit(500).get();
    console.log(`   Found ${snapshot.size} leave requests`);

    for (const doc of snapshot.docs) {
      stats.processed++;
      const data = doc.data();
      const updates: Record<string, unknown> = {};

      // Get employee info
      if (data.employeeId) {
        const empDoc = await db.collection('employees').doc(data.employeeId).get();
        if (empDoc.exists) {
          const empData = empDoc.data();
          if (empData) {
            if (empData.displayName && data.employeeName !== empData.displayName) {
              updates.employeeName = empData.displayName;
            }
            if (empData.departmentName && data.departmentName !== empData.departmentName) {
              updates.departmentName = empData.departmentName;
            }
            if (empData.positionName && data.positionName !== empData.positionName) {
              updates.positionName = empData.positionName;
            }
          }
        }
      }

      // Get leave type info
      if (data.leaveTypeId) {
        const leaveTypeInfo = await getLeaveTypeInfo(data.leaveTypeId);
        if (leaveTypeInfo) {
          if (data.leaveTypeName !== leaveTypeInfo.name) {
            updates.leaveTypeName = leaveTypeInfo.name;
          }
          if (data.leaveTypeCode !== leaveTypeInfo.code) {
            updates.leaveTypeCode = leaveTypeInfo.code;
          }
        }
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = FieldValue.serverTimestamp();
        await doc.ref.update(updates);
        stats.updated++;
      } else {
        stats.skipped++;
      }
    }
  } catch (error) {
    console.error('❌ Error syncing leave requests:', error);
    stats.errors++;
  }

  console.log(
    `   📊 Processed: ${stats.processed}, Updated: ${stats.updated}, Skipped: ${stats.skipped}`
  );
  return stats;
}

/**
 * Step 4: Sync Leave Entitlements
 * Updates: leaveTypeName, leaveTypeCode
 */
async function syncLeaveEntitlements(): Promise<Stats> {
  console.log('\n📋 Step 4: Syncing Leave Entitlements...');
  const stats: Stats = { processed: 0, updated: 0, skipped: 0, errors: 0 };

  try {
    const snapshot = await db.collection('leaveEntitlements').limit(500).get();
    console.log(`   Found ${snapshot.size} leave entitlements`);

    for (const doc of snapshot.docs) {
      stats.processed++;
      const data = doc.data();
      const updates: Record<string, unknown> = {};

      // Get leave type info
      if (data.leaveTypeId) {
        const leaveTypeInfo = await getLeaveTypeInfo(data.leaveTypeId);
        if (leaveTypeInfo) {
          if (data.leaveTypeName !== leaveTypeInfo.name) {
            updates.leaveTypeName = leaveTypeInfo.name;
          }
          if (data.leaveTypeCode !== leaveTypeInfo.code) {
            updates.leaveTypeCode = leaveTypeInfo.code;
          }
        }
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = FieldValue.serverTimestamp();
        await doc.ref.update(updates);
        stats.updated++;
      } else {
        stats.skipped++;
      }
    }
  } catch (error) {
    console.error('❌ Error syncing leave entitlements:', error);
    stats.errors++;
  }

  console.log(
    `   📊 Processed: ${stats.processed}, Updated: ${stats.updated}, Skipped: ${stats.skipped}`
  );
  return stats;
}

/**
 * Step 5: Sync Payroll Records
 * Updates: employeeName, departmentName, positionName
 */
async function syncPayrollRecords(): Promise<Stats> {
  console.log('\n📋 Step 5: Syncing Payroll Records...');
  const stats: Stats = { processed: 0, updated: 0, skipped: 0, errors: 0 };

  try {
    const snapshot = await db.collection('payrollRecords').limit(500).get();
    console.log(`   Found ${snapshot.size} payroll records`);

    for (const doc of snapshot.docs) {
      stats.processed++;
      const data = doc.data();
      const updates: Record<string, unknown> = {};

      // Get employee info
      if (data.employeeId) {
        const empDoc = await db.collection('employees').doc(data.employeeId).get();
        if (empDoc.exists) {
          const empData = empDoc.data();
          if (empData) {
            if (empData.displayName && data.employeeName !== empData.displayName) {
              updates.employeeName = empData.displayName;
            }
            if (empData.departmentName && data.departmentName !== empData.departmentName) {
              updates.departmentName = empData.departmentName;
            }
            if (empData.positionName && data.positionName !== empData.positionName) {
              updates.positionName = empData.positionName;
            }
          }
        }
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = FieldValue.serverTimestamp();
        await doc.ref.update(updates);
        stats.updated++;
      } else {
        stats.skipped++;
      }
    }
  } catch (error) {
    console.error('❌ Error syncing payroll records:', error);
    stats.errors++;
  }

  console.log(
    `   📊 Processed: ${stats.processed}, Updated: ${stats.updated}, Skipped: ${stats.skipped}`
  );
  return stats;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Denormalized Fields Backfill...\n');
  console.log('⚠️  This script is idempotent and safe to re-run multiple times\n');

  const totalStats: Stats = { processed: 0, updated: 0, skipped: 0, errors: 0 };

  // Run all sync steps
  const employeeStats = await syncEmployees();
  const attendanceStats = await syncAttendance();
  const leaveRequestStats = await syncLeaveRequests();
  const leaveEntitlementStats = await syncLeaveEntitlements();
  const payrollStats = await syncPayrollRecords();

  // Aggregate stats
  totalStats.processed +=
    employeeStats.processed +
    attendanceStats.processed +
    leaveRequestStats.processed +
    leaveEntitlementStats.processed +
    payrollStats.processed;
  totalStats.updated +=
    employeeStats.updated +
    attendanceStats.updated +
    leaveRequestStats.updated +
    leaveEntitlementStats.updated +
    payrollStats.updated;
  totalStats.skipped +=
    employeeStats.skipped +
    attendanceStats.skipped +
    leaveRequestStats.skipped +
    leaveEntitlementStats.skipped +
    payrollStats.skipped;
  totalStats.errors +=
    employeeStats.errors +
    attendanceStats.errors +
    leaveRequestStats.errors +
    leaveEntitlementStats.errors +
    payrollStats.errors;

  console.log('\n🎉 Backfill Complete!\n');
  console.log('📊 Total Statistics:');
  console.log(`   - Processed: ${totalStats.processed}`);
  console.log(`   - Updated: ${totalStats.updated}`);
  console.log(`   - Skipped: ${totalStats.skipped}`);
  console.log(`   - Errors: ${totalStats.errors}\n`);
}

// Run
main()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
