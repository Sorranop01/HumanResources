/**
 * Seed Users Script (Admin SDK Version)
 * Populates Firebase emulator with default users using Admin SDK
 * This bypasses Security Rules and has full access
 *
 * Usage: tsx scripts/seed-users-admin.ts
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

interface SeedUser {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'hr' | 'manager' | 'employee' | 'auditor';
  phoneNumber?: string;
}

// Default users for development
const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    displayName: 'ผู้ดูแลระบบ',
    role: 'admin',
    phoneNumber: '0812345678',
  },
  {
    email: 'hr@example.com',
    password: 'hr123456',
    displayName: 'ฝ่ายทรัพยากรบุคคล',
    role: 'hr',
    phoneNumber: '0823456789',
  },
  {
    email: 'manager@example.com',
    password: 'manager123',
    displayName: 'ผู้จัดการแผนก',
    role: 'manager',
    phoneNumber: '0834567890',
  },
  {
    email: 'employee@example.com',
    password: 'employee123',
    displayName: 'สมชาย ใจดี',
    role: 'employee',
    phoneNumber: '0845678901',
  },
  {
    email: 'auditor@example.com',
    password: 'auditor123',
    displayName: 'ผู้ตรวจสอบ',
    role: 'auditor',
    phoneNumber: '0856789012',
  },
];

async function seedUsers() {
  console.log('🌱 Starting user seeding with Admin SDK...\n');
  console.log('📡 Connected to Firestore Emulator at localhost:8080\n');

  for (const user of SEED_USERS) {
    try {
      // Fetch role definition to get roleId and roleName for denormalization
      let roleId: string | undefined;
      let roleName: string | undefined;

      try {
        const roleSnapshot = await db.collection('roleDefinitions').get();
        const roleDoc = roleSnapshot.docs.find((doc) => doc.data().role === user.role);

        if (roleDoc) {
          roleId = roleDoc.id;
          roleName = roleDoc.data().name;
          console.log(`   ✓ Found role definition: ${roleName} (${roleId})`);
        } else {
          console.log(`   ⚠️  Role definition not found for ${user.role}, using role string only`);
        }
      } catch (roleError) {
        console.log(`   ⚠️  Failed to fetch role definition:`, roleError);
      }

      // Create user document with unique ID
      const userId = `seed_${user.role}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const userRef = db.collection('users').doc(userId);

      const userData: Record<string, unknown> = {
        id: userId,
        email: user.email,
        displayName: user.displayName,
        role: user.role, // Primary key for logic & security rules
        isActive: true,
        phoneNumber: user.phoneNumber,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'seed-script-admin',
        updatedBy: 'seed-script-admin',
      };

      // Add denormalized role fields if available
      if (roleId) {
        userData.roleId = roleId; // Foreign key to roleDefinitions
      }
      if (roleName) {
        userData.roleName = roleName; // Denormalized display name
      }

      await userRef.set(userData);

      console.log(`✅ Created user: ${user.email} (${user.role})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   🆔 User ID: ${userId}`);
      if (roleName) {
        console.log(`   👤 Role Name: ${roleName}`);
      }
      if (user.phoneNumber) {
        console.log(`   📱 Phone: ${user.phoneNumber}`);
      }
      console.log();
    } catch (error) {
      console.error(`❌ Failed to create ${user.email}:`, error);
    }
  }

  console.log('\n🎉 User seeding completed!\n');
  console.log('📋 Login credentials:');
  console.log('─'.repeat(70));
  console.log(`${'Role'.padEnd(12)}${'Email'.padEnd(30)}Password`);
  console.log('─'.repeat(70));

  SEED_USERS.forEach((user) => {
    const row = `${user.role.toUpperCase().padEnd(12)}${user.email.padEnd(30)}${user.password}`;
    console.log(row);
  });

  console.log('─'.repeat(70));
  console.log('\n💡 Tips:');
  console.log('   • These users are created in the Firestore emulator only');
  console.log('   • You need to manually create Auth users in Firebase Auth emulator');
  console.log('   • Or use the Firebase Auth UI to register with these emails\n');

  process.exit(0);
}

// Run seeding
seedUsers().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
