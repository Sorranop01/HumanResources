/**
 * Role Definition Sync Trigger
 * Syncs denormalized roleName to all users when roleDefinitions are updated
 *
 * Trade-off Management: Denormalization Consistency
 * This trigger ensures that when a role name is changed in roleDefinitions,
 * all users with that role get their roleName field updated automatically.
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

/**
 * Trigger on roleDefinition update
 * Syncs roleName to all users when role name changes
 */
export const onRoleDefinitionUpdate = onDocumentUpdated(
  {
    document: 'roleDefinitions/{roleId}',
    region: 'asia-southeast1',
  },
  async (event) => {
    const db = getFirestore();
    const roleId = event.params.roleId;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) {
      logger.warn('Missing before or after data in role update', { roleId });
      return;
    }

    // Check if name has changed
    const beforeName = beforeData.name as string;
    const afterName = afterData.name as string;

    if (beforeName === afterName) {
      logger.info('Role name unchanged, skipping sync', {
        roleId,
        name: afterName,
      });
      return;
    }

    logger.info('Role name changed, syncing to users', {
      roleId,
      beforeName,
      afterName,
    });

    try {
      // Query all users with this roleId
      const usersQuery = await db.collection('users').where('roleId', '==', roleId).get();

      if (usersQuery.empty) {
        logger.info('No users found with this roleId', { roleId });
        return;
      }

      const batchSize = 500; // Firestore batch limit
      const batches: FirebaseFirestore.WriteBatch[] = [];
      let currentBatch = db.batch();
      let operationCount = 0;

      // Update roleName for all users
      for (const userDoc of usersQuery.docs) {
        currentBatch.update(userDoc.ref, {
          roleName: afterName,
          updatedAt: FieldValue.serverTimestamp(),
        });

        operationCount++;

        // Create new batch if limit reached
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

      logger.info('Successfully synced roleName to users', {
        roleId,
        oldName: beforeName,
        newName: afterName,
        usersUpdated: usersQuery.size,
        batchesCommitted: batches.length,
      });
    } catch (error: unknown) {
      logger.error('Failed to sync roleName to users', {
        error,
        roleId,
        beforeName,
        afterName,
      });
      // Don't throw - we don't want to fail the main operation
    }
  }
);

/**
 * Trigger on roleDefinition creation
 * No sync needed for creation, but we log it for monitoring
 */
export const onRoleDefinitionCreate = onDocumentUpdated(
  {
    document: 'roleDefinitions/{roleId}',
    region: 'asia-southeast1',
  },
  async (event) => {
    const roleId = event.params.roleId;
    const data = event.data?.after.data();

    if (!data) {
      return;
    }

    logger.info('New role definition created', {
      roleId,
      role: data.role,
      name: data.name,
    });
  }
);
