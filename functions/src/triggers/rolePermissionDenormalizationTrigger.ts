/**
 * Role Permission Denormalization Trigger
 * Syncs rolePermissions changes to roleDefinitions (denormalization)
 *
 * When a rolePermission is created/updated/deleted, this trigger
 * updates the corresponding roleDefinition's permissions map
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

interface RolePermissionData {
  roleId: string;
  role: string;
  resource: string;
  resourceName: string;
  permissions: string[];
  isActive: boolean;
}

/**
 * Sync rolePermissions changes to roleDefinitions
 * Keeps the denormalized permissions map up to date
 */
export const syncRolePermissionsToRoleDefinitions = onDocumentWritten(
  {
    document: 'rolePermissions/{permissionId}',
    region: 'asia-southeast1',
  },
  async (event) => {
    const db = getFirestore();

    const before = event.data?.before?.data() as RolePermissionData | undefined;
    const after = event.data?.after?.data() as RolePermissionData | undefined;

    // Document was deleted
    if (!after && before) {
      const { roleId, resource } = before;

      logger.info('Removing permission from role (denormalization)', {
        roleId,
        resource,
      });

      try {
        await db
          .collection('roleDefinitions')
          .doc(roleId)
          .update({
            [`permissions.${resource}`]: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          });

        logger.info('Successfully removed permission from role', {
          roleId,
          resource,
        });
      } catch (error: unknown) {
        logger.error('Failed to remove permission from role', {
          error,
          roleId,
          resource,
        });
      }

      return;
    }

    // Document was created or updated
    if (after) {
      const { roleId, resource, resourceName, permissions } = after;

      logger.info('Syncing permission to role (denormalization)', {
        roleId,
        resource,
        resourceName,
        permissions,
      });

      try {
        await db
          .collection('roleDefinitions')
          .doc(roleId)
          .update({
            [`permissions.${resource}`]: {
              resource,
              resourceName,
              permissions,
            },
            updatedAt: FieldValue.serverTimestamp(),
          });

        logger.info('Successfully synced permission to role', {
          roleId,
          resource,
        });
      } catch (error: unknown) {
        logger.error('Failed to sync permission to role', {
          error,
          roleId,
          resource,
        });
      }
    }
  }
);
