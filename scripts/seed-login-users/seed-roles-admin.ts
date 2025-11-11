/**
 * Seed Roles Script (Admin SDK Version)
 * Populates Firebase emulator with default roleDefinitions
 *
 * Usage: tsx scripts/seed-roles-admin.ts
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin (no credentials needed for emulator)
if (getApps().length === 0) {
  initializeApp({
    projectId: 'human-b4c2c',
  });
}

const db = getFirestore();

// Connect to emulator
db.settings({
  host: 'localhost:8080',
  ssl: false,
});

interface SeedRole {
  role: 'admin' | 'hr' | 'manager' | 'employee' | 'auditor';
  name: string;
  description: string;
  isSystemRole: boolean;
  isActive: boolean;
}

// Default roles for the system
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

async function seedRoles() {
  console.log('🎭 Starting role seeding with Admin SDK...\n');
  console.log('📡 Connected to Firestore Emulator at localhost:8080\n');

  const roleMap = new Map<string, string>(); // role -> roleId mapping

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

        console.log(`♻️  Updated role: ${role.role}`);
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

        console.log(`✅ Created role: ${role.role}`);
      }

      console.log(`   🆔 Role ID: ${roleId}`);
      console.log(`   📛 Name: ${role.name}`);
      console.log(`   📝 Description: ${role.description}`);
      console.log(`   ${role.isSystemRole ? '🔒' : '🔓'} System Role: ${role.isSystemRole}`);
      console.log();

      roleMap.set(role.role, roleId);
    } catch (error) {
      console.error(`❌ Failed to create/update role ${role.role}:`, error);
    }
  }

  console.log('\n🎉 Role seeding completed!\n');
  console.log('📋 Role Summary:');
  console.log('─'.repeat(70));
  console.log(`${'Role'.padEnd(15)}${'Name'.padEnd(30)}System Role`);
  console.log('─'.repeat(70));

  SEED_ROLES.forEach((role) => {
    const status = role.isSystemRole ? '✅ Yes' : '❌ No';
    console.log(`${role.role.padEnd(15)}${role.name.padEnd(30)}${status}`);
  });

  console.log('─'.repeat(70));

  // Export role mapping for other scripts
  console.log('\n📦 Role ID Mapping:');
  roleMap.forEach((roleId, role) => {
    console.log(`   ${role} → ${roleId}`);
  });

  console.log('\n💡 Next Steps:');
  console.log('   1. Run "pnpm run seed:users" to create users with these roles');
  console.log('   2. Users will automatically get roleId and roleName from these definitions\n');

  process.exit(0);
}

// Run seeding
seedRoles().catch((error) => {
  console.error('❌ Role seeding failed:', error);
  process.exit(1);
});
