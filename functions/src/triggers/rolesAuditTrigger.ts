/**
 * Roles Audit Trigger
 * Automatically logs audit entries when roleDefinitions collection changes
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

interface RoleDefinitionDocument {
  id?: string;
  role: string;
  name: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

interface AuditLogData {
  action: string;
  performedBy: string;
  performedByEmail: string;
  role?: string;
  metadata?: Record<string, unknown>;
  timestamp: FirebaseFirestore.FieldValue;
}

/**
 * Helper to detect what changed between before and after
 */
function detectRoleChanges(
  before: RoleDefinitionDocument | undefined,
  after: RoleDefinitionDocument | undefined
): Record<string, unknown> {
  const changes: Record<string, unknown> = {};

  if (!before || !after) {
    return changes;
  }

  // Check each field for changes
  if (before.name !== after.name) {
    changes.name = { from: before.name, to: after.name };
  }
  if (before.description !== after.description) {
    changes.description = { from: before.description, to: after.description };
  }
  if (before.isActive !== after.isActive) {
    changes.isActive = { from: before.isActive, to: after.isActive };
  }
  if (before.role !== after.role) {
    changes.role = { from: before.role, to: after.role };
  }

  return changes;
}

/**
 * Get performer email from users collection
 */
async function getPerformerEmail(userId: string): Promise<string> {
  const db = getFirestore();
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData?.email || 'unknown@humanresources.app';
    }
  } catch (error) {
    console.error('Error fetching performer email:', error);
  }
  return 'unknown@humanresources.app';
}

/**
 * Trigger on roleDefinition document write (create, update, delete)
 */
export const onRoleDefinitionWrite = onDocumentWritten(
  {
    document: 'roleDefinitions/{roleId}',
    region: 'asia-southeast1',
  },
  async (event) => {
    const db = getFirestore();
    const roleId = event.params.roleId;
    const beforeData = event.data?.before.data() as RoleDefinitionDocument | undefined;
    const afterData = event.data?.after.data() as RoleDefinitionDocument | undefined;

    // Determine action type
    let action: string;
    let metadata: Record<string, unknown> = {};

    if (!beforeData && afterData) {
      // Document created
      action = 'ROLE_CREATED';
      metadata = {
        roleId,
        role: afterData.role,
        name: afterData.name,
        description: afterData.description,
        isSystemRole: afterData.isSystemRole,
        isActive: afterData.isActive,
      };
    } else if (beforeData && afterData) {
      // Document updated
      action = 'ROLE_UPDATED';
      const changes = detectRoleChanges(beforeData, afterData);
      metadata = {
        roleId,
        role: afterData.role,
        name: afterData.name,
        changes,
      };

      // Special case: if only isActive changed, it might be a soft delete
      if (Object.keys(changes).length === 1 && changes.isActive) {
        const statusChange = changes.isActive as { from: boolean; to: boolean };
        if (statusChange.from === true && statusChange.to === false) {
          action = 'ROLE_DELETED'; // Soft delete
        }
      }
    } else if (beforeData && !afterData) {
      // Document permanently deleted
      action = 'ROLE_DELETED';
      metadata = {
        roleId,
        role: beforeData.role,
        name: beforeData.name,
        permanent: true,
      };
    } else {
      // Should not happen
      console.error('Invalid document state in trigger');
      return;
    }

    // Get performer info
    const performedBy =
      afterData?.updatedBy || afterData?.createdBy || beforeData?.updatedBy || 'system';
    let performedByEmail = 'system@humanresources.app';

    if (performedBy !== 'system') {
      performedByEmail = await getPerformerEmail(performedBy);
    }

    // Create audit log entry
    const auditLogData: AuditLogData = {
      action,
      performedBy,
      performedByEmail,
      role: afterData?.role || beforeData?.role,
      metadata,
      timestamp: FieldValue.serverTimestamp(),
    };

    try {
      await db.collection('rbacAuditLogs').add(auditLogData);
      console.log(`Audit log created for ${action} on role ${roleId}`);
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw - we don't want to fail the main operation
    }
  }
);
