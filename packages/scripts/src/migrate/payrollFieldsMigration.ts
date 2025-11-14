/**
 * Payroll Fields Migration Script
 * Migrates old field names (department, position) to new denormalized format
 * (departmentId, departmentName, positionId, positionName)
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

interface MigrationStats {
  total: number;
  needsMigration: number;
  migrated: number;
  failed: number;
  skipped: number;
}

interface PayrollDocData {
  department?: string;
  position?: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionName?: string;
  [key: string]: unknown;
}

/**
 * Check if document needs migration
 */
function needsMigration(data: PayrollDocData): boolean {
  const hasOldFields = Boolean(data.department || data.position);
  const hasNewFields = Boolean(
    data.departmentId || data.departmentName || data.positionId || data.positionName
  );

  // Needs migration if has old fields and missing new fields
  return hasOldFields && !hasNewFields;
}

/**
 * Create migration update data
 */
function createMigrationData(data: PayrollDocData): Record<string, unknown> {
  const updates: Record<string, unknown> = {};

  // Migrate department field
  if (data.department && !data.departmentId) {
    updates.departmentId = data.department;
    updates.departmentName = data.department;
  }

  // Migrate position field
  if (data.position && !data.positionId) {
    updates.positionId = data.position;
    updates.positionName = data.position;
  }

  // Add updated timestamp
  updates.updatedAt = new Date();

  return updates;
}

/**
 * Main migration function
 */
async function migratePayrollFields(dryRun = true): Promise<void> {
  console.log('🚀 Starting Payroll Fields Migration...');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '⚠️  LIVE MIGRATION'}\n`);

  const stats: MigrationStats = {
    total: 0,
    needsMigration: 0,
    migrated: 0,
    failed: 0,
    skipped: 0,
  };

  try {
    // Get all payroll records
    const snapshot = await db.collection('payrollRecords').get();
    stats.total = snapshot.size;

    console.log(`📊 Found ${stats.total} payroll records\n`);

    if (stats.total === 0) {
      console.log('✅ No records to migrate');
      return;
    }

    // Process each document
    for (const doc of snapshot.docs) {
      const data = doc.data() as PayrollDocData;
      const docId = doc.id;

      // Check if migration needed
      if (!needsMigration(data)) {
        stats.skipped++;
        continue;
      }

      stats.needsMigration++;

      // Show document info
      console.log(`📝 Document: ${docId}`);
      console.log(`   Employee: ${data.employeeName ?? 'N/A'}`);
      console.log(`   Old department: ${data.department ?? 'N/A'}`);
      console.log(`   Old position: ${data.position ?? 'N/A'}`);

      // Create migration data
      const updates = createMigrationData(data);

      console.log(`   New fields:`, updates);

      // Perform migration if not dry run
      if (!dryRun) {
        try {
          await doc.ref.update(updates);
          stats.migrated++;
          console.log(`   ✅ Migrated successfully`);
        } catch (error) {
          stats.failed++;
          console.error(`   ❌ Migration failed:`, error);
        }
      } else {
        console.log(`   🔍 Would migrate (dry run)`);
      }

      console.log('');
    }

    // Print summary
    console.log('\n📊 Migration Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total records:        ${stats.total}`);
    console.log(`Needs migration:      ${stats.needsMigration}`);
    console.log(`Already up-to-date:   ${stats.skipped}`);

    if (!dryRun) {
      console.log(`✅ Successfully migrated: ${stats.migrated}`);
      console.log(`❌ Failed:               ${stats.failed}`);
    } else {
      console.log(`\n💡 This was a DRY RUN. No data was modified.`);
      console.log(`   Run with --live flag to perform actual migration.`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (dryRun && stats.needsMigration > 0) {
      console.log('⚠️  To perform the migration, run:');
      console.log('   pnpm migrate:payroll:live\n');
    } else if (!dryRun && stats.migrated > 0) {
      console.log('✅ Migration completed successfully!');
      console.log('   You can now safely remove the fallback logic in payrollService.ts\n');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// CLI execution
const args = process.argv.slice(2);
const dryRun = !args.includes('--live');

migratePayrollFields(dryRun)
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });

export { migratePayrollFields };
