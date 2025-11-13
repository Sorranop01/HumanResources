/**
 * Create Employee Record for Admin User
 * Run with: tsx scripts/create-admin-employee.ts
 */

import { initializeApp } from 'firebase/app';
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';

// Firebase config for emulator
const firebaseConfig = {
  apiKey: 'demo-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'human-b4c2c',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator
connectFirestoreEmulator(db, 'localhost', 8888);

const ADMIN_USER_ID = '3Tx2pgKazksxyxPcDD3w5c7cfcyn';
const ADMIN_EMAIL = 'admin@human.com';

async function createAdminEmployee() {
  console.log('🚀 Creating Employee Record for Admin...\n');

  try {
    // 1. Check if admin user exists
    console.log('1️⃣ Checking admin user...');
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', ADMIN_EMAIL));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    const adminUserDoc = userSnapshot.docs[0];
    const adminUser = adminUserDoc.data();
    console.log(`   ✅ Found admin user: ${adminUser.email}`);
    console.log(`   User ID: ${adminUserDoc.id}\n`);

    // 2. Check if employee record already exists
    console.log('2️⃣ Checking existing employee record...');
    const employeesRef = collection(db, 'employees');
    const employeeQuery = query(employeesRef, where('userId', '==', ADMIN_USER_ID));
    const employeeSnapshot = await getDocs(employeeQuery);

    if (!employeeSnapshot.empty) {
      const existingEmployee = employeeSnapshot.docs[0];
      console.log(`   ⚠️  Employee record already exists: ${existingEmployee.id}`);
      console.log(
        `   Employee: ${existingEmployee.data().firstName} ${existingEmployee.data().lastName}\n`
      );

      // Update user with employeeId
      console.log('3️⃣ Updating user with employeeId...');
      await setDoc(
        doc(db, 'users', adminUserDoc.id),
        {
          employeeId: existingEmployee.id,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
      console.log(`   ✅ Updated user with employeeId: ${existingEmployee.id}\n`);

      console.log('✅ Done! Existing employee record linked to admin user.');
      process.exit(0);
    }

    console.log('   ℹ️  No existing employee record found\n');

    // 3. Get departments and positions
    console.log('3️⃣ Getting departments and positions...');
    const departmentsSnapshot = await getDocs(collection(db, 'departments'));
    const positionsSnapshot = await getDocs(collection(db, 'positions'));

    if (departmentsSnapshot.empty || positionsSnapshot.empty) {
      console.log('❌ No departments or positions found. Please seed them first.');
      process.exit(1);
    }

    // Use first department and position for admin
    const firstDepartment = departmentsSnapshot.docs[0];
    const firstPosition = positionsSnapshot.docs[0];

    console.log(`   Department: ${firstDepartment.data().nameTh}`);
    console.log(`   Position: ${firstPosition.data().nameTh}\n`);

    // 4. Create employee record
    console.log('4️⃣ Creating employee record...');
    const employeeId = `emp-${ADMIN_USER_ID}`;
    const employeeRef = doc(db, 'employees', employeeId);

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
      department: firstDepartment.data().nameTh,
      departmentName: firstDepartment.data().nameTh,
      positionId: firstPosition.id,
      position: firstPosition.data().nameTh,
      positionName: firstPosition.data().nameTh,
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

    await setDoc(employeeRef, employeeData);
    console.log(`   ✅ Created employee record: ${employeeId}\n`);

    // 5. Update user with employeeId
    console.log('5️⃣ Updating user with employeeId...');
    await setDoc(
      doc(db, 'users', adminUserDoc.id),
      {
        employeeId: employeeId,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    console.log(`   ✅ Updated user with employeeId\n`);

    // 6. Create leave balances for admin
    console.log('6️⃣ Creating leave balances...');
    const leaveTypesSnapshot = await getDocs(collection(db, 'leaveTypes'));
    const currentYear = new Date().getFullYear();
    let balanceCount = 0;

    for (const leaveTypeDoc of leaveTypesSnapshot.docs) {
      const leaveType = leaveTypeDoc.data();

      if (!leaveType.isActive || leaveType.code === 'WFH') continue;

      const balanceId = `balance-${employeeId}-${leaveTypeDoc.id}-${currentYear}`;
      const balanceRef = doc(db, 'leaveBalances', balanceId);

      const balanceData = {
        id: balanceId,
        employeeId: employeeId,
        employeeName: 'Admin User',
        employeeCode: 'EMP-ADMIN-001',
        leaveTypeId: leaveTypeDoc.id,
        leaveTypeName: leaveType.nameTh,
        leaveTypeCode: leaveType.code,
        year: currentYear,
        totalDays: leaveType.maxDaysPerYear,
        usedDays: 0,
        remainingDays: leaveType.maxDaysPerYear,
        carriedForwardDays: 0,
        earnedDays: leaveType.maxDaysPerYear,
        adjustmentDays: 0,
        tenantId: 'tenant-default',
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        updatedBy: 'system',
      };

      await setDoc(balanceRef, balanceData);
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

createAdminEmployee();
