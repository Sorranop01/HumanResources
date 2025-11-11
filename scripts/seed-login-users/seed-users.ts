/**
 * Seed Users Script
 * Populates Firebase emulator with default users for development
 *
 * Usage: tsx scripts/seed-users.ts
 */

import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDocs,
  getFirestore,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

// Initialize Firebase for emulator
const app = initializeApp({
  projectId: 'human-b4c2c',
  apiKey: 'fake-api-key',
});

const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
connectFirestoreEmulator(db, 'localhost', 8080);

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
    phoneNumber: '0812345678', // Thai format (will be stored as-is)
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
  console.log('🌱 Starting user seeding...\n');

  for (const user of SEED_USERS) {
    try {
      // Fetch role definition to get roleId and roleName for denormalization
      let roleId: string | undefined;
      let roleName: string | undefined;

      try {
        const roleDefinitionsRef = collection(db, 'roleDefinitions');
        const roleQuery = await getDocs(roleDefinitionsRef);

        const roleDoc = roleQuery.docs.find((doc) => doc.data().role === user.role);

        if (roleDoc) {
          roleId = roleDoc.id;
          roleName = roleDoc.data().name;
          console.log(`   Found role definition: ${roleName} (${roleId})`);
        } else {
          console.log(`   ⚠️  Role definition not found for ${user.role}, using role string only`);
        }
      } catch (roleError) {
        console.log(`   ⚠️  Failed to fetch role definition:`, roleError);
      }

      // Create user document in Firestore directly
      const userId = `seed_${user.role}_${Date.now()}`;
      const userRef = doc(db, 'users', userId);

      const userData: Record<string, unknown> = {
        id: userId,
        email: user.email,
        displayName: user.displayName,
        role: user.role, // Primary key for logic & security rules
        isActive: true,
        phoneNumber: user.phoneNumber,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'seed-script',
        updatedBy: 'seed-script',
      };

      // Add denormalized role fields if available
      if (roleId) {
        userData.roleId = roleId; // Foreign key to roleDefinitions
      }
      if (roleName) {
        userData.roleName = roleName; // Denormalized display name
      }

      await setDoc(userRef, userData);

      console.log(`✅ Created user: ${user.email} (${user.role})`);
      console.log(`   Password: ${user.password}`);
      console.log(`   User ID: ${userId}`);
      if (roleName) {
        console.log(`   Role Name: ${roleName}`);
      }
      console.log();
    } catch (error) {
      console.error(`❌ Failed to create ${user.email}:`, error);
    }
  }

  console.log('\n🎉 User seeding completed!\n');
  console.log('📋 Login credentials:');
  console.log('─'.repeat(60));

  SEED_USERS.forEach((user) => {
    console.log(
      `${user.role.toUpperCase().padEnd(10)} | ${user.email.padEnd(25)} | ${user.password}`
    );
  });

  console.log('─'.repeat(60));
  console.log('\n💡 Tip: You can now login with any of these accounts in the emulator');

  process.exit(0);
}

// Run seeding
seedUsers().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
