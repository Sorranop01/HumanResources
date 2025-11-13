/**
 * Create Leave Balances for Admin Employee
 * Run with: cd packages/scripts && npx tsx src/create-admin-leave-balances.ts
 */

import { db, Timestamp } from './config/firebase-admin.js';

const ADMIN_EMPLOYEE_ID = 'emp-3Tx2pgKazksxyxPcDD3w5c7cfcyn';

async function createAdminLeaveBalances() {
  console.log('🚀 Creating Leave Balances for Admin...\n');

  try {
    // 1. Check if employee exists
    console.log('1️⃣ Checking admin employee...');
    const employeeDoc = await db.collection('employees').doc(ADMIN_EMPLOYEE_ID).get();

    if (!employeeDoc.exists) {
      console.log('❌ Admin employee not found!');
      process.exit(1);
    }

    const employee = employeeDoc.data();
    console.log(`   ✅ Found employee: ${employee?.firstName} ${employee?.lastName}\n`);

    // 2. Get leave types
    console.log('2️⃣ Getting leave types...');
    const leaveTypesSnapshot = await db.collection('leaveTypes').get();
    console.log(`   Found ${leaveTypesSnapshot.size} leave types\n`);

    // 3. Create leave balances
    console.log('3️⃣ Creating leave balances...');
    const currentYear = new Date().getFullYear();
    const now = Timestamp.now();
    let balanceCount = 0;
    let skippedCount = 0;

    for (const leaveTypeDoc of leaveTypesSnapshot.docs) {
      const leaveType = leaveTypeDoc.data();

      if (!leaveType.isActive || leaveType.code === 'WFH') {
        console.log(`   ⏭️  Skipping ${leaveType.code}`);
        skippedCount++;
        continue;
      }

      const balanceId = `balance-${ADMIN_EMPLOYEE_ID}-${leaveTypeDoc.id}-${currentYear}`;

      // Check if balance already exists
      const existingBalance = await db.collection('leaveBalances').doc(balanceId).get();
      if (existingBalance.exists) {
        console.log(`   ⚠️  Balance already exists for ${leaveType.code}`);
        skippedCount++;
        continue;
      }

      // Handle different field names
      const leaveTypeName = leaveType.nameTh || leaveType.name || 'Unknown';
      const maxDays = leaveType.maxDaysPerYear || leaveType.defaultDays || 10;

      const balanceData = {
        id: balanceId,
        employeeId: ADMIN_EMPLOYEE_ID,
        employeeName: `${employee?.firstName} ${employee?.lastName}`,
        employeeCode: employee?.employeeCode || 'EMP-ADMIN-001',
        leaveTypeId: leaveTypeDoc.id,
        leaveTypeName: leaveTypeName,
        leaveTypeCode: leaveType.code,
        year: currentYear,
        totalDays: maxDays,
        usedDays: 0,
        remainingDays: maxDays,
        carriedForwardDays: 0,
        earnedDays: maxDays,
        adjustmentDays: 0,
        tenantId: 'tenant-default',
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        updatedBy: 'system',
      };

      await db.collection('leaveBalances').doc(balanceId).set(balanceData);
      console.log(`   ✅ Created balance for ${leaveType.code}: ${maxDays} days`);
      balanceCount++;
    }

    console.log(`\n✅ SUCCESS! Created ${balanceCount} leave balances`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Now refresh the Leave page and the data should appear!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminLeaveBalances()
  .then(() => {
    console.log('✅ Script completed');
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
