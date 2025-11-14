/**
 * Leave Type Denormalization Trigger
 * Auto-syncs leave type name and code across collections
 *
 * Syncs when LeaveType document is updated:
 * - leaveTypeName
 * - leaveTypeCode
 *
 * Updates affected collections:
 * - leaveRequests
 * - leaveEntitlements (balances)
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

interface LeaveTypeData {
  name: string;
  code: string;
}

export const syncLeaveTypeName = onDocumentUpdated('leaveTypes/{leaveTypeId}', async (event) => {
  const db = getFirestore();
  const beforeData = event.data?.before.data() as LeaveTypeData;
  const afterData = event.data?.after.data() as LeaveTypeData;
  const leaveTypeId = event.params.leaveTypeId;

  if (!afterData) {
    logger.warn(`No after data for leave type ${leaveTypeId}`);
    return;
  }

  // Check if name or code changed
  const nameChanged = beforeData.name !== afterData.name;
  const codeChanged = beforeData.code !== afterData.code;

  if (!nameChanged && !codeChanged) {
    logger.info(`Leave type name/code unchanged for ${leaveTypeId}, skipping sync`);
    return;
  }

  logger.info(
    `Syncing leave type: ${beforeData.name} (${beforeData.code}) → ${afterData.name} (${afterData.code}) (ID: ${leaveTypeId})`
  );

  const updateData: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (nameChanged) {
    updateData.leaveTypeName = afterData.name;
  }
  if (codeChanged) {
    updateData.leaveTypeCode = afterData.code;
  }

  let totalUpdated = 0;

  // 1. Update Leave Requests
  try {
    const leaveRequestDocs = await db
      .collection('leaveRequests')
      .where('leaveTypeId', '==', leaveTypeId)
      .limit(500)
      .get();

    if (!leaveRequestDocs.empty) {
      const batch1 = db.batch();
      leaveRequestDocs.docs.forEach((doc) => {
        batch1.update(doc.ref, updateData);
      });
      await batch1.commit();
      totalUpdated += leaveRequestDocs.size;
      logger.info(`Updated ${leaveRequestDocs.size} leave requests`);
    }
  } catch (error) {
    logger.error(`Error updating leave requests: ${error}`);
  }

  // 2. Update Leave Entitlements (balances)
  try {
    const entitlementDocs = await db
      .collection('leaveEntitlements')
      .where('leaveTypeId', '==', leaveTypeId)
      .limit(500)
      .get();

    if (!entitlementDocs.empty) {
      const batch2 = db.batch();
      entitlementDocs.docs.forEach((doc) => {
        batch2.update(doc.ref, updateData);
      });
      await batch2.commit();
      totalUpdated += entitlementDocs.size;
      logger.info(`Updated ${entitlementDocs.size} leave entitlements`);
    }
  } catch (error) {
    logger.error(`Error updating leave entitlements: ${error}`);
  }

  logger.info(
    `✅ Leave type sync completed: ${totalUpdated} total documents updated for ${afterData.name} (${afterData.code})`
  );
});
