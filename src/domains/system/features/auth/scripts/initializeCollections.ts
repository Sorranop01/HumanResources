/**
 * Initialize Firestore collections for auth feature
 * This script creates the collections structure in Firestore
 *
 * Usage:
 * pnpm tsx src/domains/system/features/auth/scripts/initializeCollections.ts
 */

import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { ROLES } from '@/shared/constants/roles';
import { db } from '@/shared/lib/firebase';

/**
 * Create initial admin user
 * IMPORTANT: You must create Firebase Auth user first!
 */
interface CreateAdminParams {
  authUid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  phoneNumber?: string | undefined;
}

async function createInitialAdmin(params: CreateAdminParams): Promise<void> {
  const { authUid, email, displayName, phoneNumber } = params;

  console.log('Creating initial admin user...');

  try {
    const userRef = doc(db, 'users', authUid);

    await setDoc(userRef, {
      id: authUid,
      email: email,
      displayName: displayName,
      role: ROLES.ADMIN,
      phoneNumber: phoneNumber ?? undefined,
      photoURL: undefined,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Initial admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Display Name: ${displayName}`);
    console.log(`   Role: ADMIN`);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
}

/**
 * Create sample users for testing
 * IMPORTANT: You must create Firebase Auth users first!
 */
async function createSampleUsers(): Promise<void> {
  console.log('\nCreating sample users...');

  const sampleUsers = [
    {
      id: 'sample-hr-001',
      email: 'hr@company.com',
      displayName: 'HR Manager',
      role: ROLES.HR,
    },
    {
      id: 'sample-manager-001',
      email: 'manager@company.com',
      displayName: 'Department Manager',
      role: ROLES.MANAGER,
    },
    {
      id: 'sample-employee-001',
      email: 'employee@company.com',
      displayName: 'John Doe',
      role: ROLES.EMPLOYEE,
    },
  ];

  for (const userData of sampleUsers) {
    try {
      const userRef = doc(db, 'users', userData.id);

      await setDoc(userRef, {
        ...userData,
        phoneNumber: undefined,
        photoURL: undefined,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log(`✅ Created user: ${userData.displayName} (${userData.role})`);
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.email}:`, error);
    }
  }
}

/**
 * Main initialization function
 */
async function initialize(): Promise<void> {
  console.log('🚀 Initializing Firestore collections for auth feature...\n');

  try {
    // Instructions
    console.log('📋 Before running this script:');
    console.log('1. Make sure Firebase is configured');
    console.log('2. Create Firebase Auth users first (via console or script)');
    console.log('3. Update the authUid values below with actual Firebase Auth UIDs\n');

    // Create initial admin
    // ⚠️ IMPORTANT: Replace with your actual Firebase Auth UID!
    const adminAuthUid = process.env.ADMIN_AUTH_UID;

    if (!adminAuthUid) {
      console.log('⚠️  ADMIN_AUTH_UID environment variable not set');
      console.log('   Skipping admin user creation');
      console.log('   To create admin, run:');
      console.log('   ADMIN_AUTH_UID=your-firebase-auth-uid pnpm tsx ...\n');
    } else {
      await createInitialAdmin({
        authUid: adminAuthUid,
        email: 'admin@company.com',
        displayName: 'System Admin',
        phoneNumber: undefined,
      });
    }

    // Create sample users (optional)
    if (process.env.CREATE_SAMPLES === 'true') {
      await createSampleUsers();
    } else {
      console.log('\n⚠️  Skipping sample users creation');
      console.log('   To create samples, run:');
      console.log('   CREATE_SAMPLES=true pnpm tsx ...\n');
    }

    console.log('\n✅ Initialization completed!');
    console.log('\n📚 Next steps:');
    console.log('1. Verify users in Firebase Console > Firestore');
    console.log('2. Check security rules are deployed');
    console.log('3. Test login with created users');
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initialize()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { createInitialAdmin, createSampleUsers, initialize };
