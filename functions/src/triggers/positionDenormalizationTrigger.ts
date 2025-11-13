/**
 * Position Denormalization Trigger
 * Auto-syncs position name across collections
 *
 * Syncs when Position document is updated:
 * - positionName
 *
 * Updates affected collections:
 * - employees
 * - payroll records
 * - leave requests
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db = getFirestore();

interface PositionData {
  name: string;
  code: string;
}

export const syncPositionName = onDocumentUpdated('positions/{positionId}', async (event) => {
  const beforeData = event.data?.before.data() as PositionData;
  const afterData = event.data?.after.data() as PositionData;
  const positionId = event.params.positionId;

  if (!afterData) {
    logger.warn(`No after data for position ${positionId}`);
    return;
  }

  // Check if name changed
  if (beforeData.name === afterData.name) {
    logger.info(`Position name unchanged for ${positionId}, skipping sync`);
    return;
  }

  logger.info(`Syncing position name: ${beforeData.name} → ${afterData.name} (ID: ${positionId})`);

  const updateData = {
    positionName: afterData.name,
    updatedAt: FieldValue.serverTimestamp(),
  };

  let totalUpdated = 0;

  // 1. Update Employees
  try {
    const employeeDocs = await db.collection('employees').where('position', '==', positionId).get();

    if (!employeeDocs.empty) {
      const batch1 = db.batch();
      employeeDocs.docs.forEach((doc) => {
        batch1.update(doc.ref, updateData);
      });
      await batch1.commit();
      totalUpdated += employeeDocs.size;
      logger.info(`Updated ${employeeDocs.size} employees`);
    }
  } catch (error) {
    logger.error(`Error updating employees: ${error}`);
  }

  // 2. Update Payroll Records
  try {
    const payrollDocs = await db
      .collection('payrollRecords')
      .where('positionId', '==', positionId)
      .limit(500)
      .get();

    if (!payrollDocs.empty) {
      const batch2 = db.batch();
      payrollDocs.docs.forEach((doc) => {
        batch2.update(doc.ref, updateData);
      });
      await batch2.commit();
      totalUpdated += payrollDocs.size;
      logger.info(`Updated ${payrollDocs.size} payroll records`);
    }
  } catch (error) {
    logger.error(`Error updating payroll: ${error}`);
  }

  // 3. Update Leave Requests
  try {
    const leaveDocs = await db
      .collection('leaveRequests')
      .where('positionId', '==', positionId)
      .limit(500)
      .get();

    if (!leaveDocs.empty) {
      const batch3 = db.batch();
      leaveDocs.docs.forEach((doc) => {
        batch3.update(doc.ref, updateData);
      });
      await batch3.commit();
      totalUpdated += leaveDocs.size;
      logger.info(`Updated ${leaveDocs.size} leave requests`);
    }
  } catch (error) {
    logger.error(`Error updating leave requests: ${error}`);
  }

  logger.info(
    `✅ Position name sync completed: ${totalUpdated} total documents updated for ${afterData.name}`
  );
});
