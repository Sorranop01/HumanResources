/**
 * Clean Invalid Employees
 * Removes or fixes employees that don't match the current schema
 */

import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as dotenv from 'dotenv';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH not set in .env');
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

const db = getFirestore();
const auth = getAuth();

async function cleanInvalidEmployees() {
  console.log('🧹 Cleaning invalid employees...\n');

  try {
    const snapshot = await db.collection('employees').get();
    console.log(`Found ${snapshot.size} employees\n`);

    let deletedCount = 0;
    let validCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const employeeId = doc.id;

      // Check for critical missing fields
      const hasCriticalFields =
        data.email &&
        data.firstName &&
        data.lastName &&
        data.phoneNumber &&
        data.employmentType &&
        data.workType &&
        data.status;

      // Check if employmentType is valid
      const validEmploymentTypes = ['permanent', 'contract', 'probation', 'freelance', 'intern'];
      const hasValidEmploymentType = validEmploymentTypes.includes(data.employmentType);

      // Check if workType is valid
      const validWorkTypes = ['full-time', 'part-time'];
      const hasValidWorkType = validWorkTypes.includes(data.workType);

      if (!hasCriticalFields || !hasValidEmploymentType || !hasValidWorkType) {
        console.log(`❌ Deleting invalid employee: ${employeeId} (${data.email || 'no email'})`);
        console.log(`   - Missing critical fields: ${!hasCriticalFields}`);
        console.log(
          `   - Invalid employmentType: ${!hasValidEmploymentType} (${data.employmentType})`
        );
        console.log(`   - Invalid workType: ${!hasValidWorkType} (${data.workType})`);

        // Delete from Firestore
        await db.collection('employees').doc(employeeId).delete();

        // Try to delete from Auth if userId exists
        if (data.userId) {
          try {
            await auth.deleteUser(data.userId);
            console.log(`   ✅ Deleted Auth user: ${data.userId}`);
          } catch (_authError: unknown) {
            console.log(`   ⚠️ Could not delete Auth user (might not exist)`);
          }
        }

        deletedCount++;
        console.log('');
      } else {
        validCount++;
      }
    }

    console.log('\n✅ Cleanup completed!');
    console.log(`   - Valid employees: ${validCount}`);
    console.log(`   - Deleted employees: ${deletedCount}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Run: pnpm seed:run');
    console.log('   2. Verify data in your app');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanInvalidEmployees()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
