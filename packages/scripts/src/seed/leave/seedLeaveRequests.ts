/**
 * Seed Leave Requests
 * Creates sample leave request records for testing
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 */

import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface LeaveRequestSeed {
  requestNumber: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionName: string;
  leaveTypeId: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  isHalfDay: boolean;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: Date;
  approvalChain: Array<{
    level: number;
    approverId: string;
    approverName: string;
    approverRole: string;
    status: 'pending' | 'approved' | 'rejected';
    actionAt?: Date;
    comments?: string;
  }>;
  currentApprovalLevel: number;
}

async function seedLeaveRequests() {
  console.log('🌱 Seeding Leave Requests...\n');

  try {
    // Get employees
    const employeesSnapshot = await db.collection('employees').limit(10).get();

    if (employeesSnapshot.empty) {
      console.log('⚠️  No employees found. Please run seedEmployees.ts first.');
      return;
    }

    // Get leave types
    const leaveTypesSnapshot = await db.collection('leaveTypes').get();

    if (leaveTypesSnapshot.empty) {
      console.log('⚠️  No leave types found. Please run seedLeaveTypes.ts first.');
      return;
    }

    const leaveTypes = leaveTypesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get test users for approvers
    const usersSnapshot = await db.collection('users').where('role', 'in', ['manager', 'hr']).get();

    const manager = usersSnapshot.docs.find((doc) => doc.data().role === 'manager');
    const hr = usersSnapshot.docs.find((doc) => doc.data().role === 'hr');

    const managerId = manager?.id || 'manager-id';
    const managerName = manager?.data().displayName || 'ผู้จัดการ';
    const hrId = hr?.id || 'hr-id';
    const hrName = hr?.data().displayName || 'HR Manager';

    const now = new Date();
    const leaveRequests: LeaveRequestSeed[] = [];
    let requestCounter = 1;

    // Create leave requests for multiple employees
    for (const empDoc of employeesSnapshot.docs) {
      const empData = empDoc.data();
      const employeeId = empDoc.id;

      // Get random leave types for this employee
      const annualLeave = leaveTypes.find((lt) => lt.code === 'ANNUAL');
      const sickLeave = leaveTypes.find((lt) => lt.code === 'SICK');
      const personalLeave = leaveTypes.find((lt) => lt.code === 'PERSONAL');

      // 1. Approved Annual Leave (past)
      if (annualLeave) {
        const startDate = new Date(2025, 0, 15); // Jan 15, 2025
        const endDate = new Date(2025, 0, 17); // Jan 17, 2025
        const submittedDate = new Date(2024, 11, 20); // Submitted Dec 20, 2024

        leaveRequests.push({
          requestNumber: `LV-2025-${requestCounter.toString().padStart(3, '0')}`,
          employeeId,
          employeeName: `${empData.firstName} ${empData.lastName}`,
          employeeCode: empData.employeeCode,
          departmentId: empData.departmentId || 'dept-default',
          departmentName: empData.department || 'ทั่วไป',
          positionId: empData.positionId || 'pos-default',
          positionName: empData.position || 'พนักงาน',
          leaveTypeId: annualLeave.id,
          leaveTypeCode: annualLeave.code,
          leaveTypeName: annualLeave.nameTh || annualLeave.name,
          startDate,
          endDate,
          totalDays: 3,
          isHalfDay: false,
          reason: 'พักผ่อนตามแผนครอบครัว',
          status: 'approved',
          submittedAt: submittedDate,
          approvalChain: [
            {
              level: 1,
              approverId: managerId,
              approverName: managerName,
              approverRole: 'Manager',
              status: 'approved',
              actionAt: new Date(2024, 11, 21),
              comments: 'อนุมัติ',
            },
            {
              level: 2,
              approverId: hrId,
              approverName: hrName,
              approverRole: 'HR',
              status: 'approved',
              actionAt: new Date(2024, 11, 22),
              comments: 'อนุมัติ',
            },
          ],
          currentApprovalLevel: 2,
        });
        requestCounter++;
      }

      // 2. Pending Sick Leave (future)
      if (sickLeave && requestCounter <= 5) {
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5);
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
        const submittedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

        leaveRequests.push({
          requestNumber: `LV-2025-${requestCounter.toString().padStart(3, '0')}`,
          employeeId,
          employeeName: `${empData.firstName} ${empData.lastName}`,
          employeeCode: empData.employeeCode,
          departmentId: empData.departmentId || 'dept-default',
          departmentName: empData.department || 'ทั่วไป',
          positionId: empData.positionId || 'pos-default',
          positionName: empData.position || 'พนักงาน',
          leaveTypeId: sickLeave.id,
          leaveTypeCode: sickLeave.code,
          leaveTypeName: sickLeave.nameTh || sickLeave.name,
          startDate,
          endDate,
          totalDays: 3,
          isHalfDay: false,
          reason: 'ป่วยเป็นไข้หวัด ต้องพักรักษาตัว',
          status: 'pending',
          submittedAt: submittedDate,
          approvalChain: [
            {
              level: 1,
              approverId: managerId,
              approverName: managerName,
              approverRole: 'Manager',
              status: 'pending',
            },
            {
              level: 2,
              approverId: hrId,
              approverName: hrName,
              approverRole: 'HR',
              status: 'pending',
            },
          ],
          currentApprovalLevel: 1,
        });
        requestCounter++;
      }

      // 3. Approved Personal Leave (recent past)
      if (personalLeave && requestCounter <= 8) {
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 10);
        const endDate = new Date(now.getFullYear(), now.getMonth() - 1, 10);
        const submittedDate = new Date(now.getFullYear(), now.getMonth() - 1, 5);

        leaveRequests.push({
          requestNumber: `LV-2025-${requestCounter.toString().padStart(3, '0')}`,
          employeeId,
          employeeName: `${empData.firstName} ${empData.lastName}`,
          employeeCode: empData.employeeCode,
          departmentId: empData.departmentId || 'dept-default',
          departmentName: empData.department || 'ทั่วไป',
          positionId: empData.positionId || 'pos-default',
          positionName: empData.position || 'พนักงาน',
          leaveTypeId: personalLeave.id,
          leaveTypeCode: personalLeave.code,
          leaveTypeName: personalLeave.nameTh || personalLeave.name,
          startDate,
          endDate,
          totalDays: 1,
          isHalfDay: false,
          reason: 'ติดธุระส่วนตัวเร่งด่วน',
          status: 'approved',
          submittedAt: submittedDate,
          approvalChain: [
            {
              level: 1,
              approverId: managerId,
              approverName: managerName,
              approverRole: 'Manager',
              status: 'approved',
              actionAt: new Date(now.getFullYear(), now.getMonth() - 1, 6),
            },
            {
              level: 2,
              approverId: hrId,
              approverName: hrName,
              approverRole: 'HR',
              status: 'approved',
              actionAt: new Date(now.getFullYear(), now.getMonth() - 1, 7),
            },
          ],
          currentApprovalLevel: 2,
        });
        requestCounter++;
      }

      // Limit to prevent too many records
      if (requestCounter > 15) break;
    }

    // Insert leave requests into Firestore
    console.log(`📝 Creating ${leaveRequests.length} leave requests...\n`);

    let count = 0;
    for (const request of leaveRequests) {
      const docRef = db.collection('leaveRequests').doc();

      // ✅ Use stripUndefined for Firestore safety
      const requestPayload = stripUndefined({
        ...request,
        startDate: Timestamp.fromDate(request.startDate),
        endDate: Timestamp.fromDate(request.endDate),
        submittedAt: Timestamp.fromDate(request.submittedAt),
        approvalChain: request.approvalChain.map((step) => ({
          ...step,
          actionAt: step.actionAt ? Timestamp.fromDate(step.actionAt) : null,
        })),
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
        cancelledBy: null,
        cancelledAt: null,
        cancellationReason: null,
        contactDuringLeave: null,
        workHandoverTo: null,
        workHandoverNotes: null,
        hasCertificate: false,
        certificateUrl: null,
        certificateFileName: null,
        halfDayPeriod: null,
        tenantId: 'default', // ✅ Fixed from 'tenant-default'
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await docRef.set(requestPayload);

      count++;
      console.log(
        `  ✅ Created: ${request.requestNumber} (${request.employeeName} - ${request.leaveTypeName}) [${request.status}]`
      );
    }

    console.log(`\n✅ Successfully seeded ${count} leave requests\n`);

    // Summary
    const approved = leaveRequests.filter((r) => r.status === 'approved').length;
    const pending = leaveRequests.filter((r) => r.status === 'pending').length;

    console.log('📊 Summary:');
    console.log(`   - Approved: ${approved}`);
    console.log(`   - Pending: ${pending}`);
    console.log(`   - Total: ${count}\n`);
  } catch (error) {
    console.error('❌ Error seeding leave requests:', error);
    throw error;
  }
}

// Run seed
seedLeaveRequests()
  .then(() => {
    console.log('✅ Leave request seeding completed\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
