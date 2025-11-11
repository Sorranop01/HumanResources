/**
 * Users Audit Trigger
 * Automatically logs audit entries when users collection changes
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

const db = getFirestore();

interface UserDocument {
  id?: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

interface AuditLogData {
  action: string;
  performedBy: string;
  performedByEmail: string;
  targetUserId?: string;
  targetUserEmail?: string;
  metadata?: Record<string, unknown>;
  timestamp: FirebaseFirestore.FieldValue;
}

/**
 * Helper to detect what changed between before and after
 */
function detectUserChanges(
  before: UserDocument | undefined,
  after: UserDocument | undefined
): Record<string, unknown> {
  const changes: Record<string, unknown> = {};

  if (!before || !after) {
    return changes;
  }

  // Check each field for changes
  if (before.displayName !== after.displayName) {
    changes.displayName = { from: before.displayName, to: after.displayName };
  }
  if (before.email !== after.email) {
    changes.email = { from: before.email, to: after.email };
  }
  if (before.role !== after.role) {
    changes.role = { from: before.role, to: after.role };
  }
  if (before.isActive !== after.isActive) {
    changes.isActive = { from: before.isActive, to: after.isActive };
  }
  if (before.phoneNumber !== after.phoneNumber) {
    changes.phoneNumber = { from: before.phoneNumber, to: after.phoneNumber };
  }

  return changes;
}

/**
 * Trigger on user document write (create, update, delete)
 */
export const onUserWrite = onDocumentWritten(
  {
    document: 'users/{userId}',
    region: 'asia-southeast1',
  },
  async (event) => {
    const userId = event.params.userId;
    const beforeData = event.data?.before.data() as UserDocument | undefined;
    const afterData = event.data?.after.data() as UserDocument | undefined;

    // Determine action type
    let action: string;
    let metadata: Record<string, unknown> = {};

    if (!beforeData && afterData) {
      // Document created
      action = 'USER_CREATED';
      metadata = {
        email: afterData.email,
        displayName: afterData.displayName,
        role: afterData.role,
        isActive: afterData.isActive,
      };
    } else if (beforeData && afterData) {
      // Document updated
      action = 'USER_UPDATED';
      const changes = detectUserChanges(beforeData, afterData);
      metadata = {
        changes,
        userId,
        email: afterData.email,
      };
    } else if (beforeData && !afterData) {
      // Document deleted
      action = 'USER_DELETED';
      metadata = {
        email: beforeData.email,
        displayName: beforeData.displayName,
        role: beforeData.role,
      };
    } else {
      // Should not happen
      console.error('Invalid document state in trigger');
      return;
    }

    // Get performer info (from updatedBy field or system)
    const performedBy = afterData?.updatedBy || beforeData?.updatedBy || 'system';
    const performedByEmail = afterData?.email || beforeData?.email || 'system@humanresources.app';

    // Create audit log entry
    const auditLogData: AuditLogData = {
      action,
      performedBy,
      performedByEmail,
      targetUserId: userId,
      targetUserEmail: afterData?.email || beforeData?.email,
      metadata,
      timestamp: FieldValue.serverTimestamp(),
    };

    try {
      await db.collection('rbacAuditLogs').add(auditLogData);
      console.log(`Audit log created for ${action} on user ${userId}`);
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw - we don't want to fail the main operation
    }
  }
);
