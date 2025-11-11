/**
 * Sync Firestore profiles for existing Firebase Auth users
 * Creates missing user profiles in Firestore
 *
 * Usage:
 * pnpm tsx src/domains/system/features/auth/scripts/syncProfiles.ts
 */

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { initializeFirebaseForScript } from './config';

// Role constants
const ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];

// Will be initialized in main()
let db: Awaited<ReturnType<typeof initializeFirebaseForScript>>['db'];

/**
 * Map email to role
 */
function getRoleFromEmail(email: string): Role {
  if (email.includes('admin')) return ROLES.ADMIN;
  if (email.includes('hr')) return ROLES.HR;
  if (email.includes('manager')) return ROLES.MANAGER;
  return ROLES.EMPLOYEE;
}

/**
 * Get display name from email
 */
function getDisplayNameFromEmail(email: string): string {
  const emailParts = email.split('@');
  const localPart = emailParts[0];

  if (!localPart) return 'Unknown User';

  // Convert dots and underscores to spaces and capitalize
  return localPart
    .replace(/[._]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Sync profile for a single user
 */
async function syncUserProfile(uid: string, email: string): Promise<boolean> {
  try {
    // Check if profile already exists
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      console.log(`  ⏭️  Profile already exists for ${email}`);
      return false;
    }

    // Create profile
    const role = getRoleFromEmail(email);
    const displayName = getDisplayNameFromEmail(email);

    const profileData: Record<string, unknown> = {
      id: uid,
      email: email,
      displayName: displayName,
      role: role,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(userRef, profileData);

    console.log(`  ✅ Created profile for ${email} (${role})`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to create profile for ${email}:`, error);
    return false;
  }
}

/**
 * Sync all Auth users to Firestore
 */
async function syncAllProfiles(): Promise<void> {
  console.log('🔄 Syncing Firebase Auth users to Firestore...\n');

  try {
    // Get all Auth users (this requires Firebase Admin SDK in production)
    // For now, we'll use the predefined list from seed
    const testUsers = [
      { uid: 'UaZIQ8wDKbX3YtpjYlzjn26Z4dq2', email: 'admin@company.com' },
      { uid: 'nLFdFFXNX3b0QYCPS6NDDYqn7j23', email: 'hr@company.com' },
      { uid: 'SWjIqsvCoHXZ9gjwH4JmZ7mEH803', email: 'hr.assistant@company.com' },
      { uid: '8t2olJfG0ENXKh0uItmTl2rXIlk1', email: 'manager.sales@company.com' },
      { uid: 'aoe8JxnP65YtmJMlfG58W0v5tjs1', email: 'manager.it@company.com' },
      { uid: '1bbEE7l2urOaB3FFSxsZ5VIcxGy2', email: 'employee1@company.com' },
      { uid: 'fUJzjji974eZ5GvndGXyUkOCyen1', email: 'employee2@company.com' },
      { uid: 'BzkJxeXJHgSc6EIwoDpwAyDa3Go2', email: 'employee3@company.com' },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const user of testUsers) {
      const created = await syncUserProfile(user.uid, user.email);
      if (created) {
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log(`✅ Created: ${createdCount} profiles`);
    console.log(`⏭️  Skipped: ${skippedCount} profiles (already exist)`);
    console.log('═══════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting profile sync process...\n');

  try {
    // Initialize Firebase
    const firebase = await initializeFirebaseForScript();
    db = firebase.db;

    await syncAllProfiles();

    console.log('✅ Sync completed successfully!\n');
    console.log('📚 Next steps:');
    console.log('1. Verify profiles in Firebase Console > Firestore > users');
    console.log('2. Check all users have correct roles');
    console.log('3. Test login with seeded credentials');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
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

export { syncUserProfile, syncAllProfiles };
