/**
 * Clear Emulator Data Script (Admin SDK Version)
 * Clears all data from Firestore emulator using Admin SDK
 * This bypasses Security Rules
 *
 * Usage: tsx scripts/clear-emulator-data-admin.ts
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

async function clearCollection(collectionName: string): Promise<number> {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();

  if (snapshot.empty) {
    return 0;
  }

  // Delete in batches (max 500 operations per batch)
  const batchSize = 500;
  let count = 0;

  const batches: FirebaseFirestore.WriteBatch[] = [];
  let currentBatch = db.batch();
  let operationCount = 0;

  for (const doc of snapshot.docs) {
    currentBatch.delete(doc.ref);
    operationCount++;
    count++;

    if (operationCount === batchSize) {
      batches.push(currentBatch);
      currentBatch = db.batch();
      operationCount = 0;
    }
  }

  // Add remaining operations
  if (operationCount > 0) {
    batches.push(currentBatch);
  }

  // Commit all batches
  await Promise.all(batches.map((batch) => batch.commit()));

  return count;
}

async function clearEmulatorData() {
  console.log('🧹 Clearing emulator data with Admin SDK...\n');
  console.log('📡 Connected to Firestore Emulator at localhost:8080\n');

  try {
    // Collections to clear
    const collections = [
      'users',
      'employees',
      'rbacAuditLogs',
      'roleDefinitions',
      'userRoleAssignments',
      'permissionDefinitions',
      'rolePermissions',
    ];

    let totalCleared = 0;

    for (const collectionName of collections) {
      try {
        const count = await clearCollection(collectionName);
        if (count > 0) {
          console.log(`✅ Cleared ${count} documents from "${collectionName}"`);
          totalCleared += count;
        } else {
          console.log(`⚪ "${collectionName}" is empty`);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to clear "${collectionName}":`, message);
      }
    }

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`✨ Total cleared: ${totalCleared} documents`);
    console.log('─'.repeat(60));
    console.log('\n💡 Tips:');
    console.log('   • Run "pnpm run seed:users" to populate with default users');
    console.log('   • Data cleared from Firestore emulator only');
    console.log('   • Auth users remain (clear manually via Auth emulator UI)\n');
  } catch (error: unknown) {
    console.error('❌ Failed to clear data:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run clearing
clearEmulatorData();
