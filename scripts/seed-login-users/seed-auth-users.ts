/**
 * Seed Authentication Users Script
 * Creates Firebase Auth users AND Firestore user documents
 * Uses Auth UID as Firestore document ID for proper data consistency
 *
 * This script:
 * 1. Creates users in Firebase Auth with email/password
 * 2. Uses the Auth UID as the Firestore document ID
 * 3. Syncs user data between Auth and Firestore
 *
 * Usage: tsx scripts/seed-login-users/seed-auth-users.ts
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

interface SeedUser {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'hr' | 'manager' | 'employee' | 'auditor';
  phoneNumber?: string;
}

interface UserDocument {
  id: string;
  email: string;
  displayName: string;
  role: SeedUser['role'];
  isActive: boolean;
  phoneNumber?: string;
  updatedAt: FirebaseFirestore.Timestamp;
  updatedBy: string;
  createdAt?: FirebaseFirestore.Timestamp;
  createdBy?: string;
  roleId?: string;
  roleName?: string;
}

// Default users for development
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

const hasErrorCode = (error: unknown): error is { code?: string } =>
  typeof error === 'object' && error !== null && 'code' in error;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

async function seedAuthUsers() {
  console.log('🌱 Starting Authentication user seeding...\n');
  console.log('📡 Connected to Auth Emulator at localhost:9099');
  console.log('📡 Connected to Firestore Emulator at localhost:8080\n');

  // First, fetch all role definitions for denormalization
  console.log('🔍 Fetching role definitions...');
  const roleMap = new Map<string, { id: string; name: string }>();

  try {
    const roleSnapshot = await db.collection('roleDefinitions').get();
    roleSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      roleMap.set(data.role, {
        id: doc.id,
        name: data.name,
      });
    });
    console.log(`   ✅ Found ${roleMap.size} role definitions\n`);
  } catch (_error: unknown) {
    console.log(
      '   ⚠️  No role definitions found. Users will be created without roleId/roleName.\n'
    );
  }

  const results = {
    created: 0,
    updated: 0,
    failed: 0,
  };

  for (const user of SEED_USERS) {
    try {
      console.log(`\n👤 Processing: ${user.email}`);

      let authUser: UserRecord | null = null;

      // Try to get existing user by email
      try {
        authUser = await auth.getUserByEmail(user.email);
        console.log(`   ✓ Auth user already exists (UID: ${authUser.uid})`);

        // Update existing auth user
        await auth.updateUser(authUser.uid, {
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          password: user.password, // Update password
        });
        console.log(`   ✓ Updated Auth user`);
      } catch (error: unknown) {
        if (hasErrorCode(error) && error.code === 'auth/user-not-found') {
          // Create new auth user
          authUser = await auth.createUser({
            email: user.email,
            password: user.password,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            emailVerified: false,
          });
          console.log(`   ✅ Created Auth user (UID: ${authUser.uid})`);
        } else {
          throw error;
        }
      }

      // Get role info for denormalization
      const roleInfo = roleMap.get(user.role);

      // Create/update Firestore user document using Auth UID
      if (!authUser) {
        throw new Error(`Auth user not resolved for ${user.email}`);
      }

      const userRef = db.collection('users').doc(authUser.uid);

      // Check if Firestore document exists
      const userDoc = await userRef.get();

      const userData: UserDocument = {
        id: authUser.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isActive: true,
        phoneNumber: user.phoneNumber,
        updatedAt: Timestamp.now(),
        updatedBy: 'seed-auth-script',
      };

      // Add denormalized role fields if available
      if (roleInfo) {
        userData.roleId = roleInfo.id;
        userData.roleName = roleInfo.name;
        console.log(`   ✓ Role: ${user.role} → ${roleInfo.name} (${roleInfo.id})`);
      } else {
        console.log(`   ⚠️  Role definition not found for '${user.role}'`);
      }

      if (userDoc.exists) {
        // Update existing document
        await userRef.update(userData);
        console.log(`   ✓ Updated Firestore user document`);
        results.updated++;
      } else {
        // Create new document
        userData.createdAt = Timestamp.now();
        userData.createdBy = 'seed-auth-script';

        await userRef.set(userData);
        console.log(`   ✅ Created Firestore user document`);
        results.created++;
      }

      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   📱 Phone: ${user.phoneNumber || 'N/A'}`);
    } catch (error: unknown) {
      console.error(`   ❌ Failed to process ${user.email}:`);
      console.error(`      ${getErrorMessage(error)}`);
      results.failed++;
    }
  }

  console.log('\n═'.repeat(70));
  console.log('🎉 Authentication user seeding completed!');
  console.log('═'.repeat(70));
  console.log(`📊 Summary:`);
  console.log(`   • Created: ${results.created} users`);
  console.log(`   • Updated: ${results.updated} users`);
  console.log(`   • Failed: ${results.failed} users`);
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

  console.log('\n💡 Next Steps:');
  console.log('   1. Open Emulator UI: http://localhost:4000');
  console.log('   2. Check Authentication → Users (should see 5 users)');
  console.log('   3. Check Firestore → users (documents should match Auth UIDs)');
  console.log('   4. Try logging in with any of the credentials above\n');

  process.exit(0);
}

// Run seeding
seedAuthUsers().catch((error: unknown) => {
  console.error('\n❌ Seeding failed:', error);
  console.error('\n💡 Make sure the emulators are running:');
  console.error('   firebase emulators:start\n');
  process.exit(1);
});
