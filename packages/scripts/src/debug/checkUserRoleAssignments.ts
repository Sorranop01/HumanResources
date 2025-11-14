/**
 * Debug script to check userRoleAssignments data in Firestore emulator
 * Uses firebase-admin for unrestricted access
 */

import { db } from '../config/firebase-admin.js';

async function checkUserRoleAssignments() {
  console.log('🔍 Checking userRoleAssignments collection...\n');

  try {
    const snapshot = await db.collection('userRoleAssignments').get();

    if (snapshot.empty) {
      console.log('⚠️  No documents found in userRoleAssignments collection');
      return;
    }

    console.log(`Found ${snapshot.size} documents\n`);

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Document ID:', doc.id);
      console.log('   User:', data.userEmail);
      console.log('   Role:', data.role);
      console.log('   createdAt:', data.createdAt);
      console.log('   createdAt type:', typeof data.createdAt);
      console.log('   createdAt constructor:', data.createdAt?.constructor?.name);

      if (data.createdAt) {
        console.log('   Has toDate method:', typeof data.createdAt.toDate === 'function');
        console.log('   Has seconds:', 'seconds' in data.createdAt);
        console.log('   Has nanoseconds:', 'nanoseconds' in data.createdAt);

        if ('seconds' in data.createdAt) {
          console.log('   seconds value:', data.createdAt.seconds);
          console.log('   nanoseconds value:', data.createdAt.nanoseconds);
        }

        if (typeof data.createdAt.toDate === 'function') {
          try {
            const date = data.createdAt.toDate();
            console.log('   Converted to Date:', date);
          } catch (error) {
            console.log('   ❌ Error converting to Date:', error);
          }
        }
      } else {
        console.log('   ❌ createdAt is missing or undefined!');
      }

      console.log('   updatedAt:', data.updatedAt);
      console.log('\n');
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserRoleAssignments()
  .then(() => {
    console.log('✅ Debug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
