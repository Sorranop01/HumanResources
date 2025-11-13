/**
 * Employee Denormalization Trigger
 * Auto-syncs denormalized employee fields across collections
 *
 * Syncs when Employee document is updated:
 * - displayName, thaiDisplayName
 * - departmentName, positionName
 *
 * Updates affected collections:
 * - attendance records
 * - payroll records
 * - leave requests
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db = getFirestore();

interface EmployeeData {
  firstName: string;
  lastName: string;
  thaiFirstName: string;
  thaiLastName: string;
  displayName: string;
  thaiDisplayName: string;
  employeeCode: string;
  departmentName: string;
  positionName: string;
  department: string; // ID
  position: string; // ID
}

export const syncEmployeeDenormalizedFields = onDocumentUpdated(
  'employees/{employeeId}',
  async (event) => {
    const beforeData = event.data?.before.data() as EmployeeData;
    const afterData = event.data?.after.data() as EmployeeData;
    const employeeId = event.params.employeeId;

    if (!afterData) {
      logger.warn(`No after data for employee ${employeeId}`);
      return;
    }

    // Check if relevant fields changed
    const displayNameChanged = beforeData.displayName !== afterData.displayName;
    const thaiDisplayNameChanged = beforeData.thaiDisplayName !== afterData.thaiDisplayName;
    const departmentNameChanged = beforeData.departmentName !== afterData.departmentName;
    const positionNameChanged = beforeData.positionName !== afterData.positionName;
    const employeeCodeChanged = beforeData.employeeCode !== afterData.employeeCode;

    if (
      !displayNameChanged &&
      !thaiDisplayNameChanged &&
      !departmentNameChanged &&
      !positionNameChanged &&
      !employeeCodeChanged
    ) {
      logger.info(`No denormalized fields changed for employee ${employeeId}, skipping sync`);
      return;
    }

    logger.info(`Syncing denormalized fields for employee ${employeeId}`);

    const batch = db.batch();
    let updateCount = 0;

    // Prepare update data
    const updateData: Partial<Record<string, unknown>> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (displayNameChanged) {
      updateData.employeeName = afterData.displayName;
    }
    if (employeeCodeChanged) {
      updateData.employeeCode = afterData.employeeCode;
    }
    if (departmentNameChanged) {
      updateData.departmentName = afterData.departmentName;
    }
    if (positionNameChanged) {
      updateData.positionName = afterData.positionName;
    }

    // 1. Update Attendance Records (using collectionGroup for all subcollections)
    try {
      const attendanceDocs = await db
        .collectionGroup('attendance')
        .where('employeeId', '==', employeeId)
        .limit(500) // Batch limit
        .get();

      attendanceDocs.docs.forEach((doc) => {
        if (updateCount < 500) {
          batch.update(doc.ref, updateData);
          updateCount++;
        }
      });

      logger.info(`Queued ${attendanceDocs.size} attendance records for sync`);
    } catch (error) {
      logger.error(`Error querying attendance records: ${error}`);
    }

    // 2. Update Payroll Records
    try {
      const payrollDocs = await db
        .collection('payrollRecords')
        .where('employeeId', '==', employeeId)
        .limit(500 - updateCount)
        .get();

      payrollDocs.docs.forEach((doc) => {
        if (updateCount < 500) {
          batch.update(doc.ref, updateData);
          updateCount++;
        }
      });

      logger.info(`Queued ${payrollDocs.size} payroll records for sync`);
    } catch (error) {
      logger.error(`Error querying payroll records: ${error}`);
    }

    // 3. Update Leave Requests
    try {
      const leaveRequestDocs = await db
        .collection('leaveRequests')
        .where('employeeId', '==', employeeId)
        .limit(500 - updateCount)
        .get();

      leaveRequestDocs.docs.forEach((doc) => {
        if (updateCount < 500) {
          batch.update(doc.ref, updateData);
          updateCount++;
        }
      });

      logger.info(`Queued ${leaveRequestDocs.size} leave requests for sync`);
    } catch (error) {
      logger.error(`Error querying leave requests: ${error}`);
    }

    // Commit batch
    if (updateCount > 0) {
      await batch.commit();
      logger.info(
        `Successfully synced ${updateCount} documents for employee ${employeeId} (${afterData.displayName})`
      );
    } else {
      logger.info(`No documents to sync for employee ${employeeId}`);
    }

    // If we hit the batch limit, schedule a continuation (optional)
    if (updateCount >= 500) {
      logger.warn(
        `Batch limit reached (500 docs) for employee ${employeeId}. Some documents may not be synced. Consider implementing pagination or background job.`
      );
    }
  }
);
