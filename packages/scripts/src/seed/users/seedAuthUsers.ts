/**
 * Seed Authentication Users
 * Creates test users with different roles for development
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 */

import { auth, db, Timestamp } from '../../config/firebase-admin.js';
import { ROLES } from '../../constants/roles.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface TestUser {
  email: string;
  password: string;
  displayName: string;
  role: string;
  phoneNumber?: string;
  createEmployee?: boolean; // Flag to create employee record for non-employee users
  employeeData?: {
    firstName: string;
    lastName: string;
    thaiFirstName: string;
    thaiLastName: string;
    employeeCode: string;
  };
}

const testUsers: TestUser[] = [
  {
    email: 'admin@human.com',
    password: 'admin123456',
    displayName: 'Admin User',
    role: ROLES.ADMIN,
    phoneNumber: '+66812345678',
    createEmployee: true,
    employeeData: {
      firstName: 'Admin',
      lastName: 'User',
      thaiFirstName: 'แอดมิน',
      thaiLastName: 'ผู้ดูแลระบบ',
      employeeCode: 'EMP-ADMIN-001',
    },
  },
  {
    email: 'hr@human.com',
    password: 'hr123456',
    displayName: 'HR Manager',
    role: ROLES.HR,
    phoneNumber: '+66823456789',
    createEmployee: true,
    employeeData: {
      firstName: 'HR',
      lastName: 'Manager',
      thaiFirstName: 'เอชอาร์',
      thaiLastName: 'ผู้จัดการ',
      employeeCode: 'EMP-HR-001',
    },
  },
  {
    email: 'manager@human.com',
    password: 'manager123456',
    displayName: 'Team Manager',
    role: ROLES.MANAGER,
    phoneNumber: '+66834567890',
    createEmployee: true,
    employeeData: {
      firstName: 'Team',
      lastName: 'Manager',
      thaiFirstName: 'ทีม',
      thaiLastName: 'ผู้จัดการทีม',
      employeeCode: 'EMP-MGR-001',
    },
  },
  {
    email: 'employee@human.com',
    password: 'employee123456',
    displayName: 'John Doe',
    role: ROLES.EMPLOYEE,
    phoneNumber: '+66845678901',
    createEmployee: false, // Employee seeded separately in seedEmployees.ts
  },
  {
    email: 'auditor@human.com',
    password: 'auditor123456',
    displayName: 'Audit Officer',
    role: ROLES.AUDITOR,
    phoneNumber: '+66856789012',
    createEmployee: true,
    employeeData: {
      firstName: 'Audit',
      lastName: 'Officer',
      thaiFirstName: 'ออดิต',
      thaiLastName: 'เจ้าหน้าที่ตรวจสอบ',
      employeeCode: 'EMP-AUDIT-001',
    },
  },
];

async function seedAuthUsers() {
  console.log('🌱 Seeding Authentication Users...');

  const now = Timestamp.now();

  // Get departments and positions for employee records
  const departmentsSnapshot = await db.collection('departments').limit(1).get();
  const positionsSnapshot = await db.collection('positions').limit(1).get();

  let defaultDepartment = null;
  let defaultPosition = null;

  if (!departmentsSnapshot.empty) {
    const deptData = departmentsSnapshot.docs[0].data();
    defaultDepartment = {
      id: departmentsSnapshot.docs[0].id,
      name: deptData.nameTh || deptData.name || 'General',
    };
  }

  if (!positionsSnapshot.empty) {
    const posData = positionsSnapshot.docs[0].data();
    defaultPosition = {
      id: positionsSnapshot.docs[0].id,
      name: posData.nameTh || posData.name || 'Manager',
    };
  }

  for (const user of testUsers) {
    try {
      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        emailVerified: true,
      });

      console.log(`  ✅ Created Auth user: ${user.email} (${user.role})`);

      let employeeId: string | null = null;

      // Create employee record if flagged
      if (user.createEmployee && user.employeeData && defaultDepartment && defaultPosition) {
        employeeId = `emp-${userRecord.uid}`;
        const hireDate = new Date('2024-01-01');

        const employeeData = {
          // Personal Info
          firstName: user.employeeData.firstName,
          lastName: user.employeeData.lastName,
          thaiFirstName: user.employeeData.thaiFirstName,
          thaiLastName: user.employeeData.thaiLastName,
          displayName: user.displayName,
          thaiDisplayName: `${user.employeeData.thaiFirstName} ${user.employeeData.thaiLastName}`,
          nickname: user.employeeData.firstName,
          email: user.email,
          phoneNumber: user.phoneNumber || null,
          employeeCode: user.employeeData.employeeCode,

          // Employment Info
          userId: userRecord.uid,
          departmentId: defaultDepartment.id,
          department: defaultDepartment.name,
          departmentName: defaultDepartment.name,
          positionId: defaultPosition.id,
          position: defaultPosition.name,
          positionName: defaultPosition.name,
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
          taxId: `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
          withholdingTax: true,
          socialSecurityNumber: `SSN-${user.employeeData.employeeCode}`,

          // Bank Info
          bankName: 'ธนาคารกรุงเทพ',
          bankAccountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          bankAccountName: user.displayName,
          bankBranch: 'สำนักงานใหญ่',

          // Metadata
          tenantId: 'default', // ✅ Fixed: was 'tenant-default'
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: 'system',
          updatedBy: 'system',
        };

        // ✅ Use stripUndefined for Firestore safety
        const employeePayload = stripUndefined(employeeData);
        await db.collection('employees').doc(employeeId).set(employeePayload);
        console.log(`  ✅ Created employee record: ${employeeId}`);
      }

      // Create user profile in Firestore
      const userProfileData = {
        uid: userRecord.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber || null,
        employeeId: employeeId, // Link to employee record
        role: user.role,
        isActive: true,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
        metadata: {
          createdBy: 'system',
          updatedBy: 'system',
        },
      };

      // ✅ Use stripUndefined for Firestore safety
      const userProfilePayload = stripUndefined(userProfileData);
      await db.collection('users').doc(userRecord.uid).set(userProfilePayload);

      console.log(`  ✅ Created Firestore profile: ${user.email}`);

      // Create user role assignment in RBAC system
      const roleAssignmentId = `ura-${userRecord.uid}`;
      const roleAssignmentData = {
        id: roleAssignmentId,
        userId: userRecord.uid,
        userEmail: user.email,
        userDisplayName: user.displayName,
        role: user.role,
        assignedBy: 'system',
        isActive: true,
        expiresAt: null,
        reason: 'Initial seed data',
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        updatedBy: 'system',
      };

      // ✅ Use stripUndefined for Firestore safety
      const roleAssignmentPayload = stripUndefined(roleAssignmentData);
      await db.collection('userRoleAssignments').doc(roleAssignmentId).set(roleAssignmentPayload);

      console.log(`  ✅ Assigned role ${user.role} to ${user.email}\n`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          console.log(`  ⚠️  User ${user.email} already exists, skipping...\n`);
        } else {
          console.error(`  ❌ Error creating user ${user.email}:`, error.message);
        }
      } else {
        console.error(`  ❌ Unknown error creating user ${user.email}:`, error);
      }
    }
  }

  console.log(`✅ Successfully seeded ${testUsers.length} users\n`);
  console.log('📋 Test User Credentials:');
  console.log('═'.repeat(70));
  testUsers.forEach((user) => {
    console.log(
      `${user.role.toUpperCase().padEnd(10)} | ${user.email.padEnd(25)} | ${user.password}`
    );
  });
  console.log('═'.repeat(70));
}

// Run seed
seedAuthUsers()
  .then(() => {
    console.log('\n✅ User seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  });
