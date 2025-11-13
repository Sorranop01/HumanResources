/**
 * Clear Emulator Data
 * Clears all data from Firebase Emulator collections
 * ⚠️ ONLY FOR EMULATOR USE - DO NOT USE IN PRODUCTION
 */

import { auth, db } from '../config/firebase-admin.js';

const COLLECTIONS_TO_CLEAR = [
  'users',
  'roleDefinitions',
  'permissionDefinitions',
  'rolePermissions',
  'userRoleAssignments',
  'rbacAuditLogs',
  'workSchedulePolicies',
  'overtimePolicies',
  'shifts',
  'shiftAssignments',
  'penaltyPolicies',
  'publicHolidays',
  'departments',
  'positions',
  'employees',
];

async function clearCollection(collectionName: string) {
  console.log(`  🗑️  Clearing collection: ${collectionName}`);

  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();
  let count = 0;

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });

  await batch.commit();
  console.log(`  ✅ Deleted ${count} documents from ${collectionName}`);
}

async function clearAuthUsers() {
  console.log('  🗑️  Clearing Auth users');

  try {
    const listUsersResult = await auth.listUsers();
    const deletePromises = listUsersResult.users.map((user) => auth.deleteUser(user.uid));
    await Promise.all(deletePromises);
    console.log(`  ✅ Deleted ${listUsersResult.users.length} auth users`);
  } catch (error) {
    console.error('  ❌ Error clearing auth users:', error);
  }
}

async function clearEmulatorData() {
  console.log('🧹 Clearing Firebase Emulator Data...\n');

  // Check if running on emulator
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.error('❌ ERROR: FIRESTORE_EMULATOR_HOST not set!');
    console.error('❌ This script should ONLY be run against Firebase Emulator.');
    console.error('❌ Exiting for safety...');
    process.exit(1);
  }

  console.log(`✅ Connected to Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  console.log(`✅ Connected to Auth Emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}\n`);

  try {
    // Clear Auth users
    await clearAuthUsers();
    console.log();

    // Clear Firestore collections
    for (const collection of COLLECTIONS_TO_CLEAR) {
      await clearCollection(collection);
    }

    console.log('\n✅ Successfully cleared all emulator data');
  } catch (error) {
    console.error('\n❌ Error clearing emulator data:', error);
    process.exit(1);
  }
}

// Run clear
clearEmulatorData()
  .then(() => {
    console.log('✅ Emulator data clearing completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
