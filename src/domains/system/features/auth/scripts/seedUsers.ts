/**
 * Seed users with Firebase Auth + Firestore profiles
 * Creates both Firebase Auth accounts and Firestore user documents
 *
 * Usage:
 * pnpm tsx src/domains/system/features/auth/scripts/seedUsers.ts
 *
 * With emulators:
 * FIREBASE_EMULATOR=true pnpm tsx src/domains/system/features/auth/scripts/seedUsers.ts
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { initializeFirebaseForScript } from './config';

// Will be initialized in main()
let auth: Awaited<ReturnType<typeof initializeFirebaseForScript>>['auth'];
let db: Awaited<ReturnType<typeof initializeFirebaseForScript>>['db'];

// Role constants (inline since we can't import from @/shared in Node.js context)
const ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];

interface SeedUserData {
  email: string;
  password: string;
  displayName: string;
  role: Role;
  phoneNumber?: string | undefined;
}

/**
 * Create a user with both Firebase Auth and Firestore profile
 */
async function createUser(userData: SeedUserData): Promise<void> {
  const { email, password, displayName, role, phoneNumber } = userData;

  try {
    console.log(`Creating user: ${email}...`);

    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    console.log(`  ✅ Firebase Auth user created (UID: ${uid})`);

    // 2. Create Firestore profile
    const userRef = doc(db, 'users', uid);
    const profileData: Record<string, unknown> = {
      id: uid,
      email: email,
      displayName: displayName,
      role: role,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Only add optional fields if they have values
    if (phoneNumber) {
      profileData.phoneNumber = phoneNumber;
    }

    await setDoc(userRef, profileData);

    console.log(`  ✅ Firestore profile created`);
    console.log(`  👤 ${displayName} (${role})\n`);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };

    if (err.code === 'auth/email-already-in-use') {
      console.log(`  ⚠️  User already exists: ${email}\n`);
    } else {
      console.error(`  ❌ Failed to create user ${email}:`, err.message);
      throw error;
    }
  }
}

/**
 * Seed all test users
 */
async function seedUsers(): Promise<void> {
  console.log('🌱 Seeding users...\n');

  const users: SeedUserData[] = [
    // Admin user
    {
      email: 'admin@company.com',
      password: 'Admin@123456',
      displayName: 'System Admin',
      role: ROLES.ADMIN,
      phoneNumber: '+66812345001',
    },

    // HR users
    {
      email: 'hr@company.com',
      password: 'HR@123456',
      displayName: 'HR Manager',
      role: ROLES.HR,
      phoneNumber: '+66812345002',
    },
    {
      email: 'hr.assistant@company.com',
      password: 'HR@123456',
      displayName: 'HR Assistant',
      role: ROLES.HR,
    },

    // Manager users
    {
      email: 'manager.sales@company.com',
      password: 'Manager@123456',
      displayName: 'Sales Manager',
      role: ROLES.MANAGER,
      phoneNumber: '+66812345003',
    },
    {
      email: 'manager.it@company.com',
      password: 'Manager@123456',
      displayName: 'IT Manager',
      role: ROLES.MANAGER,
    },

    // Employee users
    {
      email: 'employee1@company.com',
      password: 'Employee@123456',
      displayName: 'Somchai Suksai',
      role: ROLES.EMPLOYEE,
      phoneNumber: '+66812345010',
    },
    {
      email: 'employee2@company.com',
      password: 'Employee@123456',
      displayName: 'Somsri Deejai',
      role: ROLES.EMPLOYEE,
      phoneNumber: '+66812345011',
    },
    {
      email: 'employee3@company.com',
      password: 'Employee@123456',
      displayName: 'Wichai Wongsawat',
      role: ROLES.EMPLOYEE,
    },
  ];

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const userData of users) {
    try {
      await createUser(userData);
      successCount++;
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === 'auth/email-already-in-use') {
        skipCount++;
      } else {
        errorCount++;
      }
    }
  }

  console.log('═══════════════════════════════════════');
  console.log(`✅ Created: ${successCount} users`);
  console.log(`⚠️  Skipped: ${skipCount} users (already exist)`);
  console.log(`❌ Errors: ${errorCount} users`);
  console.log('═══════════════════════════════════════\n');
}

/**
 * Display seeded users summary
 */
function displaySummary(): void {
  console.log('📋 Seeded Users Summary:\n');

  console.log('ADMIN:');
  console.log('  admin@company.com / Admin@123456\n');

  console.log('HR:');
  console.log('  hr@company.com / HR@123456');
  console.log('  hr.assistant@company.com / HR@123456\n');

  console.log('MANAGER:');
  console.log('  manager.sales@company.com / Manager@123456');
  console.log('  manager.it@company.com / Manager@123456\n');

  console.log('EMPLOYEE:');
  console.log('  employee1@company.com / Employee@123456');
  console.log('  employee2@company.com / Employee@123456');
  console.log('  employee3@company.com / Employee@123456\n');

  console.log('⚠️  IMPORTANT: Change these passwords in production!\n');
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting user seeding process...\n');

  try {
    // Initialize Firebase
    const firebase = await initializeFirebaseForScript();
    auth = firebase.auth;
    db = firebase.db;

    await seedUsers();
    displaySummary();

    console.log('✅ Seeding completed successfully!\n');
    console.log('📚 Next steps:');
    console.log('1. Verify users in Firebase Console > Authentication');
    console.log('2. Verify profiles in Firebase Console > Firestore > users');
    console.log('3. Test login with seeded credentials');
    console.log('4. CHANGE PASSWORDS in production!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { createUser, seedUsers };
