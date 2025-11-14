/**
 * Department Denormalization Trigger
 * Auto-syncs department name across collections
 *
 * Syncs when Department document is updated:
 * - departmentName
 *
 * Updates affected collections:
 * - employees
 * - attendance records
 * - payroll records
 * - leave requests
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

interface DepartmentData {
  name: string;
  code: string;
}

export const syncDepartmentName = onDocumentUpdated('departments/{deptId}', async (event) => {
  const db = getFirestore();
  const beforeData = event.data?.before.data() as DepartmentData;
  const afterData = event.data?.after.data() as DepartmentData;
  const deptId = event.params.deptId;

  if (!afterData) {
    logger.warn(`No after data for department ${deptId}`);
    return;
  }

  // Check if name changed
  if (beforeData.name === afterData.name) {
    logger.info(`Department name unchanged for ${deptId}, skipping sync`);
    return;
  }

  logger.info(`Syncing department name: ${beforeData.name} → ${afterData.name} (ID: ${deptId})`);

  const updateData = {
    departmentName: afterData.name,
    updatedAt: FieldValue.serverTimestamp(),
  };

  let totalUpdated = 0;

  // 1. Update Employees
  try {
    const employeeDocs = await db.collection('employees').where('department', '==', deptId).get();

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

  // 2. Update Attendance Records (collectionGroup)
  try {
    const attendanceDocs = await db
      .collectionGroup('attendance')
      .where('departmentName', '==', beforeData.name) // Query by old name since we don't have departmentId
      .limit(500)
      .get();

    if (!attendanceDocs.empty) {
      const batch2 = db.batch();
      attendanceDocs.docs.forEach((doc) => {
        batch2.update(doc.ref, updateData);
      });
      await batch2.commit();
      totalUpdated += attendanceDocs.size;
      logger.info(`Updated ${attendanceDocs.size} attendance records`);
    }
  } catch (error) {
    logger.error(`Error updating attendance: ${error}`);
  }

  // 3. Update Payroll Records
  try {
    const payrollDocs = await db
      .collection('payrollRecords')
      .where('departmentId', '==', deptId)
      .limit(500)
      .get();

    if (!payrollDocs.empty) {
      const batch3 = db.batch();
      payrollDocs.docs.forEach((doc) => {
        batch3.update(doc.ref, updateData);
      });
      await batch3.commit();
      totalUpdated += payrollDocs.size;
      logger.info(`Updated ${payrollDocs.size} payroll records`);
    }
  } catch (error) {
    logger.error(`Error updating payroll: ${error}`);
  }

  // 4. Update Leave Requests
  try {
    const leaveDocs = await db
      .collection('leaveRequests')
      .where('departmentId', '==', deptId)
      .limit(500)
      .get();

    if (!leaveDocs.empty) {
      const batch4 = db.batch();
      leaveDocs.docs.forEach((doc) => {
        batch4.update(doc.ref, updateData);
      });
      await batch4.commit();
      totalUpdated += leaveDocs.size;
      logger.info(`Updated ${leaveDocs.size} leave requests`);
    }
  } catch (error) {
    logger.error(`Error updating leave requests: ${error}`);
  }

  logger.info(
    `✅ Department name sync completed: ${totalUpdated} total documents updated for ${afterData.name}`
  );
});
