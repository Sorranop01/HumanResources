/**
 * Seed [COLLECTION_NAME]
 * Creates sample [entity] records for development and testing
 *
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses Zod validation for data integrity
 * ✅ Uses stripUndefined for Firestore safety
 * ✅ Single Source of Truth: imports schema from domain layer
 *
 * @author Human HR Team
 * @version 1.0.0
 * @lastModified 2025-11-13
 */

// ============================================
// Imports
// ============================================

import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

// TODO: Import your Zod schema
// import { MyEntitySchema } from '@/domains/[domain]/features/[feature]/schemas/[schema]';

// TODO: Import TypeScript types
// import type { MyEntity } from '@/domains/[domain]/features/[feature]/types';

// ============================================
// Constants & Configuration
// ============================================

// TODO: Update collection name
const COLLECTION_NAME = 'myEntities';
const TENANT_ID = 'default';
const BATCH_SIZE = 500; // Firestore batch write limit

// ============================================
// Reference Data (if needed)
// ============================================

/**
 * Example: Department reference map
 * Use this pattern for denormalized fields
 */
// const DEPARTMENT_MAP: Record<string, { name: string; code: string }> = {
//   'dept-hr': { name: 'Human Resources', code: 'HR' },
//   'dept-it': { name: 'Information Technology', code: 'IT' },
// };

// ============================================
// Seed Data
// ============================================

/**
 * Sample data for seeding
 * Note: Timestamps (createdAt, updatedAt) will be added during seeding
 */
const seedData = [
  // TODO: Add your seed data
  {
    id: 'entity-001',
    name: 'Example Entity 1',
    code: 'EX001',
    description: 'Sample description for entity 1',
    isActive: true,
    tenantId: TENANT_ID,
  },
  {
    id: 'entity-002',
    name: 'Example Entity 2',
    code: 'EX002',
    description: 'Sample description for entity 2',
    isActive: true,
    tenantId: TENANT_ID,
  },
  // Add more entities here...
];

// ============================================
// Helper Functions
// ============================================

/**
 * Validates a single entity using Zod schema
 * @param data - Entity data to validate
 * @param context - Optional context for error messages
 * @returns Validated entity
 * @throws {ZodError} if validation fails
 */
function validateEntity<T>(data: T, context?: string): T {
  try {
    // TODO: Replace 'any' with your actual schema
    // return MyEntitySchema.parse(data);
    return data; // Temporary: remove this line after adding schema
  } catch (error) {
    const msg = context ? `Validation failed for ${context}` : 'Validation failed';
    console.error(`❌ ${msg}:`, data);

    // Enhanced error logging for Zod validation errors
    if (error && typeof error === 'object' && 'errors' in error) {
      console.error('Validation errors:', error.errors);
    }

    throw error;
  }
}

/**
 * Enriches entity data with denormalized fields (if needed)
 * @param entity - Base entity data
 * @returns Entity with denormalized fields
 */
// function enrichEntityData(entity: any): any {
//   return {
//     ...entity,
//     // Add denormalized fields here
//     // Example: departmentName: DEPARTMENT_MAP[entity.departmentId]?.name,
//   };
// }

// ============================================
// Main Seed Function
// ============================================

/**
 * Seeds [COLLECTION_NAME] into Firestore
 * Uses batch writes for efficiency and atomic operations
 *
 * @returns Promise<SeedResult> - Result summary with counts
 */
export async function seedMyEntities() {
  console.log(`🌱 Seeding ${COLLECTION_NAME}...`);
  console.log(`📦 Total entities to seed: ${seedData.length}\n`);

  const results = {
    total: seedData.length,
    success: 0,
    validationErrors: 0,
    writeErrors: 0,
    errors: [] as Array<{ id: string; error: string; type: 'validation' | 'write' }>,
  };

  try {
    // Initialize batches
    const batches: FirebaseFirestore.WriteBatch[] = [];
    let currentBatch = db.batch();
    let operationCount = 0;
    const collectionRef = db.collection(COLLECTION_NAME);
    const now = Timestamp.now();

    // Process each entity
    for (const data of seedData) {
      try {
        // Step 1: Prepare entity data with timestamps
        const entityData = {
          ...data,
          // TODO: Add denormalized fields if needed
          // ...enrichEntityData(data),
          createdAt: now,
          updatedAt: now,
        };

        // Step 2: Strip undefined values (Firestore requirement)
        const sanitized = stripUndefined(entityData);

        // Step 3: Validate with Zod schema
        const validated = validateEntity(sanitized, `entity ${data.id}`);

        // Step 4: Add to batch
        const docRef = collectionRef.doc(validated.id);
        currentBatch.set(docRef, validated);
        operationCount++;
        results.success++;

        // Step 5: Start new batch if limit reached
        if (operationCount === BATCH_SIZE) {
          batches.push(currentBatch);
          currentBatch = db.batch();
          operationCount = 0;
        }
      } catch (error) {
        // Handle validation errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.validationErrors++;
        results.errors.push({
          id: data.id,
          error: errorMessage,
          type: 'validation',
        });
        console.error(`❌ Failed to validate entity ${data.id}:`, errorMessage);
      }
    }

    // Add remaining operations to batch
    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    // Commit all batches
    if (batches.length > 0) {
      console.log(`📦 Committing ${batches.length} batch(es)...`);

      try {
        await Promise.all(batches.map((batch) => batch.commit()));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown write error';
        results.writeErrors++;
        console.error('❌ Batch commit failed:', errorMessage);
        throw error;
      }
    }

    // Print summary
    console.log('\n📊 Seed Summary:');
    console.log(`   Total:       ${results.total}`);
    console.log(`   ✅ Success:  ${results.success}`);
    console.log(`   ❌ Val Err:  ${results.validationErrors}`);
    console.log(`   ❌ Write Err: ${results.writeErrors}`);

    // Print detailed errors if any
    if (results.errors.length > 0) {
      console.log('\n⚠️  Detailed Errors:');
      results.errors.forEach(({ id, error, type }) => {
        console.log(`   [${type}] ${id}: ${error}`);
      });
    }

    if (results.success > 0) {
      console.log(`\n✅ Successfully seeded ${results.success} ${COLLECTION_NAME}`);
    }

    return results;
  } catch (error) {
    console.error(`\n❌ Fatal error during ${COLLECTION_NAME} seeding:`, error);
    throw error;
  }
}

// ============================================
// Verification Function (Optional but Recommended)
// ============================================

/**
 * Verifies that seeded data is correctly stored in Firestore
 * Checks for:
 * - Document count
 * - Undefined values
 * - Schema compliance
 */
export async function verifySeededData() {
  console.log(`\n🔍 Verifying ${COLLECTION_NAME}...`);

  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();

    console.log(`📊 Verification Results:`);
    console.log(`   Total documents: ${snapshot.size}`);
    console.log(`   Expected:        ${seedData.length}`);

    // Check document count
    if (snapshot.size !== seedData.length) {
      console.warn(`   ⚠️  Document count mismatch!`);
    } else {
      console.log(`   ✅ Document count matches`);
    }

    // Check for undefined values
    let hasUndefined = false;
    let invalidSchemaCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Check for undefined values
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined) {
          console.error(`   ❌ Found undefined value in ${doc.id}.${key}`);
          hasUndefined = true;
        }
      });

      // Validate against schema (optional)
      try {
        validateEntity(data);
      } catch (_error) {
        invalidSchemaCount++;
        console.error(`   ❌ Schema validation failed for ${doc.id}`);
      }
    });

    if (!hasUndefined) {
      console.log(`   ✅ No undefined values found`);
    }

    if (invalidSchemaCount === 0) {
      console.log(`   ✅ All documents match schema`);
    } else {
      console.warn(`   ⚠️  ${invalidSchemaCount} documents failed schema validation`);
    }

    console.log('\n✅ Verification complete\n');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// ============================================
// CLI Execution
// ============================================

/**
 * Execute this script directly using:
 * pnpm tsx packages/scripts/src/seed/[domain]/seedMyEntities.ts
 *
 * Or with verification:
 * pnpm tsx packages/scripts/src/seed/[domain]/seedMyEntities.ts --verify
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const runWithVerification = process.argv.includes('--verify');

  seedMyEntities()
    .then(async (results) => {
      // Run verification if requested
      if (runWithVerification) {
        await verifySeededData();
      }

      // Exit with appropriate code
      const hasErrors = results.validationErrors > 0 || results.writeErrors > 0;
      process.exit(hasErrors ? 1 : 0);
    })
    .catch((error) => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

// ============================================
// Type Exports (for use in seedAll.ts)
// ============================================

export interface SeedResult {
  total: number;
  success: number;
  validationErrors: number;
  writeErrors: number;
  errors: Array<{ id: string; error: string; type: 'validation' | 'write' }>;
}
