/**
 * Create Employee Record for Admin User
 * Run with: cd packages/scripts && tsx src/fix-admin-employee.ts
 */

import { db, Timestamp } from './config/firebase-admin.js';

const ADMIN_USER_ID = '3Tx2pgKazksxyxPcDD3w5c7cfcyn';
const ADMIN_EMAIL = 'admin@human.com';

async function createAdminEmployee() {
  console.log('🚀 Creating Employee Record for Admin...\n');

  try {
    // 1. Check if admin user exists
    console.log('1️⃣ Checking admin user...');
    const usersSnapshot = await db.collection('users').where('email', '==', ADMIN_EMAIL).get();

    if (usersSnapshot.empty) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    const adminUserDoc = usersSnapshot.docs[0];
    const adminUser = adminUserDoc.data();
    console.log(`   ✅ Found admin user: ${adminUser.email}`);
    console.log(`   User ID: ${adminUserDoc.id}\n`);

    // 2. Check if employee record already exists
    console.log('2️⃣ Checking existing employee record...');
    const employeeSnapshot = await db
      .collection('employees')
      .where('userId', '==', ADMIN_USER_ID)
      .get();

    if (!employeeSnapshot.empty) {
      const existingEmployee = employeeSnapshot.docs[0];
      console.log(`   ⚠️  Employee record already exists: ${existingEmployee.id}`);
      console.log(
        `   Employee: ${existingEmployee.data().firstName} ${existingEmployee.data().lastName}\n`
      );

      // Update user with employeeId
      console.log('3️⃣ Updating user with employeeId...');
      await db.collection('users').doc(adminUserDoc.id).update({
        employeeId: existingEmployee.id,
        updatedAt: Timestamp.now(),
      });
      console.log(`   ✅ Updated user with employeeId: ${existingEmployee.id}\n`);

      console.log('✅ Done! Existing employee record linked to admin user.');
      process.exit(0);
    }

    console.log('   ℹ️  No existing employee record found\n');

    // 3. Get departments and positions
    console.log('3️⃣ Getting departments and positions...');
    const departmentsSnapshot = await db.collection('departments').limit(1).get();
    const positionsSnapshot = await db.collection('positions').limit(1).get();

    if (departmentsSnapshot.empty || positionsSnapshot.empty) {
      console.log('❌ No departments or positions found. Please seed them first.');
      process.exit(1);
    }

    // Use first department and position for admin
    const firstDepartment = departmentsSnapshot.docs[0];
    const firstPosition = positionsSnapshot.docs[0];
    const deptData = firstDepartment.data();
    const posData = firstPosition.data();

    const deptName = deptData.nameTh || deptData.name || 'General';
    const posName = posData.nameTh || posData.name || 'Manager';

    console.log(`   Department: ${deptName}`);
    console.log(`   Position: ${posName}\n`);

    // 4. Create employee record
    console.log('4️⃣ Creating employee record...');
    const employeeId = `emp-${ADMIN_USER_ID}`;

    const now = Timestamp.now();
    const hireDate = new Date('2024-01-01'); // Default hire date

    const employeeData = {
      // Personal Info
      firstName: 'Admin',
      lastName: 'User',
      thaiFirstName: 'แอดมิน',
      thaiLastName: 'ผู้ดูแลระบบ',
      displayName: 'Admin User',
      thaiDisplayName: 'แอดมิน ผู้ดูแลระบบ',
      nickname: 'Admin',
      email: ADMIN_EMAIL,
      phoneNumber: adminUser.phoneNumber || '+66812345678',
      employeeCode: 'EMP-ADMIN-001',

      // Employment Info
      userId: ADMIN_USER_ID,
      departmentId: firstDepartment.id,
      department: deptName,
      departmentName: deptName,
      positionId: firstPosition.id,
      position: posName,
      positionName: posName,
      status: 'active',
      hireDate: Timestamp.fromDate(hireDate),
      employmentType: 'full-time',

      // Compensation
      baseSalary: 50000,
      currency: 'THB',
      paymentFrequency: 'monthly',

      // Benefits
      healthInsurance: true,
      lifeInsurance: true,
      annualLeave: 15,
      sickLeave: 30,

      // Tax & Social Security
      taxId: '1234567890123',
      withholdingTax: true,
      socialSecurityNumber: 'SSN-ADMIN-001',

      // Bank Info
      bankName: 'ธนาคารกรุงเทพ',
      bankAccountNumber: '1234567890',
      bankAccountName: 'Admin User',
      bankBranch: 'สำนักงานใหญ่',

      // Metadata
      tenantId: 'tenant-default',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system',
    };

    await db.collection('employees').doc(employeeId).set(employeeData);
    console.log(`   ✅ Created employee record: ${employeeId}\n`);

    // 5. Update user with employeeId
    console.log('5️⃣ Updating user with employeeId...');
    await db.collection('users').doc(adminUserDoc.id).update({
      employeeId: employeeId,
      updatedAt: Timestamp.now(),
    });
    console.log(`   ✅ Updated user with employeeId\n`);

    // 6. Create leave balances for admin
    console.log('6️⃣ Creating leave balances...');
    const leaveTypesSnapshot = await db.collection('leaveTypes').get();
    const currentYear = new Date().getFullYear();
    let balanceCount = 0;

    for (const leaveTypeDoc of leaveTypesSnapshot.docs) {
      const leaveType = leaveTypeDoc.data();

      if (!leaveType.isActive || leaveType.code === 'WFH') continue;

      const balanceId = `balance-${employeeId}-${leaveTypeDoc.id}-${currentYear}`;

      // Handle different field names
      const leaveTypeName = leaveType.nameTh || leaveType.name || 'Unknown';
      const maxDays = leaveType.maxDaysPerYear || leaveType.defaultDays || 10;

      const balanceData = {
        id: balanceId,
        employeeId: employeeId,
        employeeName: 'Admin User',
        employeeCode: 'EMP-ADMIN-001',
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
      balanceCount++;
    }

    console.log(`   ✅ Created ${balanceCount} leave balances\n`);

    console.log('✅ SUCCESS! Admin employee record created!');
    console.log(`   Employee ID: ${employeeId}`);
    console.log(`   Now refresh the Leave page and the data should appear!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminEmployee()
  .then(() => {
    console.log('✅ Script completed');
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
