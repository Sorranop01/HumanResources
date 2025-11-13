/**
 * Verify Seeded Data
 * Check if all collections have been seeded correctly
 */

import { auth, db } from '../config/firebase-admin.js';

async function verifySeededData() {
  console.log('🔍 Verifying Seeded Data...\n');

  const collections = [
    { name: 'roleDefinitions', expected: 5 },
    { name: 'permissionDefinitions', expected: 8 },
    { name: 'rolePermissions', expected: 30 },
    { name: 'userRoleAssignments', expected: 5 },
    { name: 'workSchedulePolicies', expected: 3 },
    { name: 'overtimePolicies', expected: 2 },
    { name: 'shifts', expected: 5 },
    { name: 'penaltyPolicies', expected: 5 },
    { name: 'publicHolidays', expected: 13 },
    { name: 'departments', expected: 11 },
    { name: 'positions', expected: 29 },
    { name: 'employees', expected: 10 },
    { name: 'users', expected: 5 },
  ];

  let totalSuccess = 0;
  let totalFail = 0;

  // Check Firestore Collections
  console.log('📊 Firestore Collections:');
  console.log('='.repeat(70));

  for (const collection of collections) {
    try {
      const snapshot = await db.collection(collection.name).get();
      const count = snapshot.size;
      const status = count >= collection.expected ? '✅' : '⚠️';

      console.log(
        `${status} ${collection.name.padEnd(30)} ${count.toString().padStart(3)} / ${collection.expected}`
      );

      if (count >= collection.expected) {
        totalSuccess++;
      } else {
        totalFail++;
      }
    } catch (error) {
      console.log(`❌ ${collection.name.padEnd(30)} Error: ${error}`);
      totalFail++;
    }
  }

  // Check Firebase Auth Users
  console.log('\n👥 Firebase Auth Users:');
  console.log('='.repeat(70));

  try {
    const listUsersResult = await auth.listUsers();
    const count = listUsersResult.users.length;
    const expected = 15; // 5 test users + 10 employees
    const status = count >= expected ? '✅' : '⚠️';

    console.log(`${status} Total Auth Users: ${count} / ${expected} (expected)`);

    console.log('\nAuth Users:');
    listUsersResult.users.forEach((user, index) => {
      console.log(`  ${(index + 1).toString().padStart(2)}. ${user.email}`);
    });

    if (count >= expected) {
      totalSuccess++;
    } else {
      totalFail++;
    }
  } catch (error) {
    console.log(`❌ Auth Users Error: ${error}`);
    totalFail++;
  }

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('📈 Summary:');
  console.log(`✅ Success: ${totalSuccess}`);
  console.log(`⚠️  Warning/Fail: ${totalFail}`);

  if (totalFail === 0) {
    console.log('\n🎉 All data seeded successfully!');
  } else {
    console.log('\n⚠️  Some data is missing. Please check the logs above.');
  }
}

// Run verification
verifySeededData()
  .then(() => {
    console.log('\n✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  });
