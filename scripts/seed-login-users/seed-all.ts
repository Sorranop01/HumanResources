/**
 * Seed All Script (Master Seeder)
 * Seeds all required data in the correct order:
 * 1. Roles (roleDefinitions)
 * 2. Permission Definitions (permissionDefinitions)
 * 3. Role Permissions (rolePermissions)
 * 4. Authentication Users (Firebase Auth)
 * 5. Firestore Users (with roleId and roleName from roles, using Auth UID)
 *
 * Usage: tsx scripts/seed-login-users/seed-all.ts
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin (no credentials needed for emulator)
if (getApps().length === 0) {
  initializeApp({
    projectId: 'human-b4c2c',
  });
}

const auth = getAuth();
const db = getFirestore();

// Connect to emulators
auth.app.options.projectId = 'human-b4c2c';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

db.settings({
  host: 'localhost:8080',
  ssl: false,
});

console.log('🚀 Starting complete data seeding...\n');
console.log('📡 Connected to Auth Emulator at localhost:9099');
console.log('📡 Connected to Firestore Emulator at localhost:8080\n');

// ============================================
// STEP 1: Seed Roles
// ============================================

interface SeedRole {
  role: 'admin' | 'hr' | 'manager' | 'employee' | 'auditor';
  name: string;
  description: string;
  isSystemRole: boolean;
  isActive: boolean;
}

const SEED_ROLES: SeedRole[] = [
  {
    role: 'admin',
    name: 'ผู้ดูแลระบบ',
    description: 'มีสิทธิ์เข้าถึงระบบทั้งหมด สามารถจัดการผู้ใช้ บทบาท และการตั้งค่าระบบ',
    isSystemRole: true,
    isActive: true,
  },
  {
    role: 'hr',
    name: 'ฝ่ายทรัพยากรบุคคล',
    description: 'จัดการข้อมูลพนักงาน การลา การเข้างาน และเงินเดือน',
    isSystemRole: true,
    isActive: true,
  },
  {
    role: 'manager',
    name: 'ผู้จัดการ',
    description: 'อนุมัติการลา ดูรายงานของทีม จัดการข้อมูลพนักงานในทีม',
    isSystemRole: true,
    isActive: true,
  },
  {
    role: 'employee',
    name: 'พนักงาน',
    description: 'ดูและแก้ไขข้อมูลส่วนตัว บันทึกเวลาเข้า-ออกงาน ขอลา',
    isSystemRole: true,
    isActive: true,
  },
  {
    role: 'auditor',
    name: 'ผู้ตรวจสอบ',
    description: 'ดูข้อมูลและรายงานทั้งหมด ตรวจสอบ audit logs แต่ไม่สามารถแก้ไขข้อมูลได้',
    isSystemRole: true,
    isActive: true,
  },
];

async function seedRoles(): Promise<Map<string, { id: string; name: string }>> {
  console.log('📋 STEP 1: Seeding Roles (roleDefinitions)\n');

  const roleMap = new Map<string, { id: string; name: string }>();

  for (const role of SEED_ROLES) {
    try {
      // Check if role already exists
      const existingQuery = await db
        .collection('roleDefinitions')
        .where('role', '==', role.role)
        .limit(1)
        .get();

      let roleId: string;

      if (!existingQuery.empty) {
        // Update existing role
        const existingDoc = existingQuery.docs[0];
        roleId = existingDoc.id;

        await existingDoc.ref.update({
          name: role.name,
          description: role.description,
          isActive: role.isActive,
          updatedAt: Timestamp.now(),
          updatedBy: 'seed-script-admin',
        });

        console.log(`   ♻️  Updated: ${role.role} → ${role.name}`);
      } else {
        // Create new role
        const roleRef = db.collection('roleDefinitions').doc();
        roleId = roleRef.id;

        const roleData = {
          id: roleId,
          role: role.role,
          name: role.name,
          description: role.description,
          isSystemRole: role.isSystemRole,
          isActive: role.isActive,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: 'seed-script-admin',
          updatedBy: 'seed-script-admin',
        };

        await roleRef.set(roleData);

        console.log(`   ✅ Created: ${role.role} → ${role.name}`);
      }

      roleMap.set(role.role, { id: roleId, name: role.name });
    } catch (error: unknown) {
      console.error(`   ❌ Failed: ${role.role}`, error);
    }
  }

  console.log(`\n   ✨ Roles completed: ${roleMap.size} roles\n`);
  return roleMap;
}

// ============================================
// STEP 2: Seed Permission Definitions
// ============================================

interface SeedPermissionDefinition {
  resource: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

const SEED_PERMISSION_DEFINITIONS: SeedPermissionDefinition[] = [
  {
    resource: 'employees',
    name: 'พนักงาน',
    description: 'จัดการข้อมูลพนักงาน สร้าง แก้ไข และลบข้อมูลพนักงาน',
    permissions: ['read:all', 'read:own', 'create', 'update:all', 'update:own', 'delete'],
    isActive: true,
  },
  {
    resource: 'attendance',
    name: 'เวลาทำงาน',
    description: 'จัดการข้อมูลเวลาทำงาน บันทึกเวลาเข้า-ออก',
    permissions: ['read:all', 'read:own', 'create', 'update:all', 'update:own', 'delete'],
    isActive: true,
  },
  {
    resource: 'leave-requests',
    name: 'การลา',
    description: 'จัดการคำขอลา ยื่นคำขอ อนุมัติ/ปฏิเสธ',
    permissions: ['read:all', 'read:own', 'create', 'update:all', 'update:own', 'delete'],
    isActive: true,
  },
  {
    resource: 'payroll',
    name: 'เงินเดือน',
    description: 'จัดการข้อมูลเงินเดือนและการจ่ายเงิน',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    resource: 'settings',
    name: 'การตั้งค่า',
    description: 'จัดการการตั้งค่าระบบ',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    resource: 'users',
    name: 'ผู้ใช้งาน',
    description: 'จัดการบัญชีผู้ใช้งานในระบบ',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    resource: 'roles',
    name: 'บทบาท',
    description: 'จัดการบทบาทและสิทธิ์การเข้าถึง',
    permissions: ['read:all', 'create', 'update:all', 'delete'],
    isActive: true,
  },
  {
    resource: 'audit-logs',
    name: 'ประวัติการใช้งาน',
    description: 'ดูประวัติการใช้งานและการเปลี่ยนแปลงในระบบ',
    permissions: ['read:all'],
    isActive: true,
  },
];

async function seedPermissionDefinitions(): Promise<void> {
  console.log('🔐 STEP 2: Seeding Permission Definitions\n');

  for (const perm of SEED_PERMISSION_DEFINITIONS) {
    try {
      const permRef = db.collection('permissionDefinitions').doc(`perm-${perm.resource}`);

      await permRef.set({
        id: permRef.id,
        resource: perm.resource,
        name: perm.name,
        description: perm.description,
        permissions: perm.permissions,
        isActive: perm.isActive,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'seed-script-admin',
        updatedBy: 'seed-script-admin',
      });

      console.log(`   ✅ Created: ${perm.name} (${perm.resource})`);
    } catch (error: unknown) {
      console.error(`   ❌ Failed: ${perm.resource}`, error);
    }
  }

  console.log(`\n   ✨ Permission definitions completed: ${SEED_PERMISSION_DEFINITIONS.length} definitions\n`);
}

// ============================================
// STEP 3: Seed Role Permissions
// ============================================

interface SeedRolePermission {
  roleId: string;
  role: string;
  resource: string;
  permissions: string[];
  isActive: boolean;
}

async function seedRolePermissions(roleMap: Map<string, { id: string; name: string }>): Promise<void> {
  console.log('🔑 STEP 3: Seeding Role Permissions\n');

  const rolePermissions: SeedRolePermission[] = [
    // Admin - Full access
    ...['employees', 'attendance', 'leave-requests', 'payroll', 'settings', 'users', 'roles'].map(
      (resource) => ({
        roleId: roleMap.get('admin')?.id || '',
        role: 'admin',
        resource,
        permissions: ['read:all', 'create', 'update:all', 'delete'],
        isActive: true,
      })
    ),
    {
      roleId: roleMap.get('admin')?.id || '',
      role: 'admin',
      resource: 'audit-logs',
      permissions: ['read:all'],
      isActive: true,
    },
    // HR
    {
      roleId: roleMap.get('hr')?.id || '',
      role: 'hr',
      resource: 'employees',
      permissions: ['read:all', 'create', 'update:all'],
      isActive: true,
    },
    {
      roleId: roleMap.get('hr')?.id || '',
      role: 'hr',
      resource: 'attendance',
      permissions: ['read:all', 'update:all'],
      isActive: true,
    },
    {
      roleId: roleMap.get('hr')?.id || '',
      role: 'hr',
      resource: 'leave-requests',
      permissions: ['read:all', 'update:all'],
      isActive: true,
    },
    {
      roleId: roleMap.get('hr')?.id || '',
      role: 'hr',
      resource: 'payroll',
      permissions: ['read:all', 'create', 'update:all'],
      isActive: true,
    },
    ...['settings', 'users', 'roles', 'audit-logs'].map((resource) => ({
      roleId: roleMap.get('hr')?.id || '',
      role: 'hr',
      resource,
      permissions: ['read:all'],
      isActive: true,
    })),
    // Manager
    {
      roleId: roleMap.get('manager')?.id || '',
      role: 'manager',
      resource: 'employees',
      permissions: ['read:all'],
      isActive: true,
    },
    {
      roleId: roleMap.get('manager')?.id || '',
      role: 'manager',
      resource: 'attendance',
      permissions: ['read:all', 'update:all'],
      isActive: true,
    },
    {
      roleId: roleMap.get('manager')?.id || '',
      role: 'manager',
      resource: 'leave-requests',
      permissions: ['read:all', 'update:all'],
      isActive: true,
    },
    {
      roleId: roleMap.get('manager')?.id || '',
      role: 'manager',
      resource: 'settings',
      permissions: ['read:all'],
      isActive: true,
    },
    // Employee - Own data only
    ...['employees', 'attendance', 'leave-requests'].map((resource, idx) => ({
      roleId: roleMap.get('employee')?.id || '',
      role: 'employee',
      resource,
      permissions: idx === 0 ? ['read:own'] : ['read:own', 'create'],
      isActive: true,
    })),
    // Auditor - Read-only
    ...['employees', 'attendance', 'leave-requests', 'payroll', 'audit-logs'].map((resource) => ({
      roleId: roleMap.get('auditor')?.id || '',
      role: 'auditor',
      resource,
      permissions: ['read:all'],
      isActive: true,
    })),
  ];

  for (const rolePerm of rolePermissions) {
    try {
      const rolePermRef = db.collection('rolePermissions').doc();

      await rolePermRef.set({
        id: rolePermRef.id,
        roleId: rolePerm.roleId,
        role: rolePerm.role,
        resource: rolePerm.resource,
        permissions: rolePerm.permissions,
        isActive: rolePerm.isActive,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'seed-script-admin',
        updatedBy: 'seed-script-admin',
      });

      console.log(
        `   ✅ ${rolePerm.role.toUpperCase()} → ${rolePerm.resource} (${rolePerm.permissions.join(', ')})`
      );
    } catch (error: unknown) {
      console.error(`   ❌ Failed: ${rolePerm.role} → ${rolePerm.resource}`, error);
    }
  }

  console.log(`\n   ✨ Role permissions completed: ${rolePermissions.length} assignments\n`);
}

// ============================================
// STEP 4: Seed Authentication Users
// ============================================

interface SeedUser {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'hr' | 'manager' | 'employee' | 'auditor';
  phoneNumber?: string;
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    displayName: 'ผู้ดูแลระบบ',
    role: 'admin',
    phoneNumber: '+66812345678',
  },
  {
    email: 'hr@example.com',
    password: 'hr123456',
    displayName: 'ฝ่ายทรัพยากรบุคคล',
    role: 'hr',
    phoneNumber: '+66823456789',
  },
  {
    email: 'manager@example.com',
    password: 'manager123',
    displayName: 'ผู้จัดการแผนก',
    role: 'manager',
    phoneNumber: '+66834567890',
  },
  {
    email: 'employee@example.com',
    password: 'employee123',
    displayName: 'สมชาย ใจดี',
    role: 'employee',
    phoneNumber: '+66845678901',
  },
  {
    email: 'auditor@example.com',
    password: 'auditor123',
    displayName: 'ผู้ตรวจสอบ',
    role: 'auditor',
    phoneNumber: '+66856789012',
  },
];

async function seedAuthUsers(): Promise<Map<string, { uid: string; email: string }>> {
  console.log('🔐 STEP 2: Seeding Authentication Users\n');

  const authUserMap = new Map<string, { uid: string; email: string }>();

  for (const user of SEED_USERS) {
    try {
      let authUser: UserRecord | null = null;

      // Try to get existing user by email
      try {
        authUser = await auth.getUserByEmail(user.email);
        console.log(`   ♻️  Updated: ${user.email} (UID: ${authUser.uid})`);

        // Update existing auth user
        await auth.updateUser(authUser.uid, {
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          password: user.password,
        });
      } catch (error: unknown) {
        const isUserNotFoundError =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code?: string }).code === 'auth/user-not-found';

        if (isUserNotFoundError) {
          // Create new auth user
          authUser = await auth.createUser({
            email: user.email,
            password: user.password,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            emailVerified: false,
          });
          console.log(`   ✅ Created: ${user.email} (UID: ${authUser.uid})`);
        } else {
          throw error;
        }
      }

      if (!authUser) {
        throw new Error(`Auth user not resolved for ${user.email}`);
      }

      const email = authUser.email ?? user.email;
      authUserMap.set(user.email, {
        uid: authUser.uid,
        email,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`   ❌ Failed: ${user.email}`, message);
    }
  }

  console.log(`\n   ✨ Auth users completed: ${authUserMap.size} users\n`);
  return authUserMap;
}

// ============================================
// STEP 5: Seed Firestore Users
// ============================================

async function seedUsers(
  roleMap: Map<string, { id: string; name: string }>,
  authUserMap: Map<string, { uid: string; email: string }>
): Promise<void> {
  console.log('👥 STEP 5: Seeding Firestore Users (with denormalized role data)\n');

  for (const user of SEED_USERS) {
    try {
      const roleInfo = roleMap.get(user.role);
      const authInfo = authUserMap.get(user.email);

      if (!roleInfo) {
        console.error(`   ❌ Role not found: ${user.role} for ${user.email}`);
        continue;
      }

      if (!authInfo) {
        console.error(`   ❌ Auth user not found: ${user.email}`);
        continue;
      }

      // Use Auth UID as Firestore document ID
      const userRef = db.collection('users').doc(authInfo.uid);

      const userData: Record<string, unknown> = {
        id: authInfo.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role, // Primary key for logic & security rules
        roleId: roleInfo.id, // Foreign key to roleDefinitions
        roleName: roleInfo.name, // Denormalized display name
        isActive: true,
        phoneNumber: user.phoneNumber,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'seed-script-admin',
        updatedBy: 'seed-script-admin',
      };

      await userRef.set(userData);

      console.log(`   ✅ ${user.email}`);
      console.log(`      UID: ${authInfo.uid}`);
      console.log(`      Role: ${user.role} → ${roleInfo.name} (${roleInfo.id})`);
      console.log(`      Phone: ${user.phoneNumber || 'N/A'}`);
    } catch (error: unknown) {
      console.error(`   ❌ Failed: ${user.email}`, error);
    }
  }

  console.log(`\n   ✨ Firestore users completed: ${SEED_USERS.length} users\n`);
}

// ============================================
// Main Execution
// ============================================

async function seedAll() {
  try {
    const startTime = Date.now();

    // Step 1: Seed Roles
    const roleMap = await seedRoles();

    // Step 2: Seed Permission Definitions
    await seedPermissionDefinitions();

    // Step 3: Seed Role Permissions
    await seedRolePermissions(roleMap);

    // Step 4: Seed Authentication Users
    const authUserMap = await seedAuthUsers();

    // Step 5: Seed Firestore Users (with role mapping and Auth UIDs)
    await seedUsers(roleMap, authUserMap);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('═'.repeat(70));
    console.log('🎉 All seeding completed successfully!');
    console.log('═'.repeat(70));
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📊 Summary:`);
    console.log(`   • Roles: ${roleMap.size} created/updated`);
    console.log(`   • Auth Users: ${authUserMap.size} created/updated`);
    console.log(`   • Firestore Users: ${SEED_USERS.length} created`);
    console.log('═'.repeat(70));

    console.log('\n📋 Login Credentials:');
    console.log('─'.repeat(70));
    console.log(`${'Role'.padEnd(12)}${'Email'.padEnd(30)}Password`);
    console.log('─'.repeat(70));

    SEED_USERS.forEach((user) => {
      const row = `${user.role.toUpperCase().padEnd(12)}${user.email.padEnd(30)}${user.password}`;
      console.log(row);
    });

    console.log('─'.repeat(70));

    console.log('\n💡 Verification:');
    console.log('   1. Open Emulator UI: http://localhost:4000');
    console.log('   2. Check Authentication → Users (5 users)');
    console.log('   3. Check Firestore → roleDefinitions (5 roles)');
    console.log('   4. Check Firestore → permissionDefinitions (8 resources)');
    console.log('   5. Check Firestore → rolePermissions (permission assignments)');
    console.log('   6. Check Firestore → users (5 users with Auth UID, roleId & roleName)');
    console.log('   7. Try logging in with any of the credentials above!');
    console.log('   8. Navigate to /permissions to see the permission matrix\n');

    process.exit(0);
  } catch (error: unknown) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedAll();
