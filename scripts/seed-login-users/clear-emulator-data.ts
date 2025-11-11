/**
 * Clear Emulator Data Script
 * Clears all data from Firebase emulators (Auth + Firestore)
 *
 * Usage: tsx scripts/clear-emulator-data.ts
 */

import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
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

async function clearCollection(collectionName: string) {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);

  let count = 0;
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, collectionName, docSnap.id));
    count++;
  }

  return count;
}

async function clearEmulatorData() {
  console.log('🧹 Clearing emulator data...\n');

  try {
    // Clear Firestore collections
    const collections = [
      'users',
      'employees',
      'rbacAuditLogs',
      'roleDefinitions',
      'userRoleAssignments',
    ];

    for (const collectionName of collections) {
      try {
        const count = await clearCollection(collectionName);
        console.log(`✅ Cleared ${count} documents from "${collectionName}"`);
      } catch (error: unknown) {
        if (hasErrorCode(error) && error.code === 'permission-denied') {
          console.log(`⚠️  Skipped "${collectionName}" (empty or no access)`);
        } else {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Failed to clear "${collectionName}":`, message);
        }
      }
    }

    console.log('\n✨ Emulator data cleared successfully!');
    console.log('\n💡 Tip: Run "pnpm run seed:users" to populate with default users');
  } catch (error: unknown) {
    console.error('❌ Failed to clear data:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run clearing
clearEmulatorData();
const hasErrorCode = (error: unknown): error is { code?: string; message?: string } =>
  typeof error === 'object' && error !== null && 'code' in error;
