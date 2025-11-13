/**
 * Cloud Function: Calculate Payroll
 * Calculates payroll for a single employee for a given month
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { type CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';

const db = getFirestore();

/**
 * Input type for calculate payroll
 */
interface CalculatePayrollInput {
  employeeId: string;
  month: number; // 1-12
  year: number;
  payDate: string; // ISO date string
  notes?: string;
}

/**
 * Calculate payroll for an employee
 */
export const calculatePayroll = onCall<CalculatePayrollInput>(
  {
    region: 'asia-southeast1',
    memory: '256MiB',
  },
  async (request: CallableRequest<CalculatePayrollInput>) => {
    try {
      // Authentication check
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { employeeId, month, year, payDate, notes } = request.data;

      // Validation
      if (!employeeId || !month || !year || !payDate) {
        throw new HttpsError('invalid-argument', 'Missing required fields');
      }

      if (month < 1 || month > 12) {
        throw new HttpsError('invalid-argument', 'Invalid month');
      }

      if (year < 2000 || year > 2100) {
        throw new HttpsError('invalid-argument', 'Invalid year');
      }

      logger.info('Calculating payroll', {
        employeeId,
        month,
        year,
        userId: request.auth.uid,
      });

      // Get employee data
      const employeeDoc = await db.collection('employees').doc(employeeId).get();

      if (!employeeDoc.exists) {
        throw new HttpsError('not-found', 'Employee not found');
      }

      const employee = employeeDoc.data();
      if (!employee) {
        throw new HttpsError('not-found', 'Employee data is empty');
      }

      // Check if payroll already exists
      const existingPayroll = await db
        .collection('payroll')
        .where('employeeId', '==', employeeId)
        .where('month', '==', month)
        .where('year', '==', year)
        .limit(1)
        .get();

      if (!existingPayroll.empty) {
        throw new HttpsError('already-exists', 'Payroll already exists for this period');
      }

      // Calculate period dates
      const periodStart = new Date(year, month - 1, 1);
      const periodEnd = new Date(year, month, 0); // Last day of month

      // Get attendance data for the period
      const startDateStr = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = periodEnd.getDate();
      const endDateStr = `${year}-${month.toString().padStart(2, '0')}-${lastDay
        .toString()
        .padStart(2, '0')}`;

      const userId = employee.userId ?? employeeId;

      const attendanceSnapshot = await db
        .collection('attendance')
        .where('userId', '==', userId)
        .where('date', '>=', startDateStr)
        .where('date', '<=', endDateStr)
        .get();

      // Calculate attendance stats
      let actualWorkDays = 0;
      let _totalWorkHours = 0;
      let overtimeHours = 0;

      for (const doc of attendanceSnapshot.docs) {
        const record = doc.data();
        if (record.status === 'clocked-out' && record.durationHours) {
          actualWorkDays++;
          _totalWorkHours += record.durationHours;

          // Calculate OT (hours worked > 8)
          const standardHours = 8;
          if (record.durationHours > standardHours) {
            overtimeHours += record.durationHours - standardHours;
          }
        }
      }

      // Get leave data
      const leaveSnapshot = await db
        .collection('leaveRequests')
        .where('employeeId', '==', employeeId)
        .where('status', '==', 'approved')
        .where('startDate', '>=', Timestamp.fromDate(periodStart))
        .where('startDate', '<=', Timestamp.fromDate(periodEnd))
        .get();

      let onLeaveDays = 0;
      for (const doc of leaveSnapshot.docs) {
        const leave = doc.data();
        onLeaveDays += leave.totalDays ?? 0;
      }

      // Calculate working days in month (excluding weekends)
      let workingDays = 0;
      const current = new Date(periodStart);
      while (current <= periodEnd) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
        current.setDate(current.getDate() + 1);
      }

      const absentDays = Math.max(0, workingDays - actualWorkDays - onLeaveDays);
      const lateDays = 0; // TODO: Implement late detection logic

      // Get salary data
      const baseSalary = employee.salary?.baseSalary ?? 0;
      const overtimeRate = employee.overtime?.rate ?? 1.5;

      // Calculate rates
      const dailyRate = baseSalary / workingDays;
      const hourlyRate = dailyRate / 8;

      // Calculate income
      const overtimePay = overtimeHours * hourlyRate * overtimeRate;
      const bonus = 0; // TODO: Get from employee bonus data

      const allowances = {
        transportation: 0,
        housing: 0,
        meal: 0,
        position: 0,
        other: 0,
      };

      const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
      const grossIncome = baseSalary + overtimePay + bonus + totalAllowances;

      // Calculate deductions
      const absencePenalty = absentDays * dailyRate;
      const latePenalty = lateDays * 100; // Fixed penalty

      // Social Security (5%, max 750 THB)
      const socialSecurity = Math.min(grossIncome * 0.05, 750);

      // Simplified tax calculation
      const tax = 0; // TODO: Implement proper tax calculation

      const providentFund = 0; // TODO: Get from employee settings

      const deductions = {
        tax: Number.parseFloat(tax.toFixed(2)),
        socialSecurity: Number.parseFloat(socialSecurity.toFixed(2)),
        providentFund: Number.parseFloat(providentFund.toFixed(2)),
        loan: 0,
        advance: 0,
        latePenalty: Number.parseFloat(latePenalty.toFixed(2)),
        absencePenalty: Number.parseFloat(absencePenalty.toFixed(2)),
        other: 0,
      };

      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
      const netPay = grossIncome - totalDeductions;

      // Create payroll document
      const payrollData = {
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        department: employee.department,
        position: employee.position,
        month,
        year,
        periodStart: Timestamp.fromDate(periodStart),
        periodEnd: Timestamp.fromDate(periodEnd),
        payDate: Timestamp.fromDate(new Date(payDate)),
        baseSalary: Number.parseFloat(baseSalary.toFixed(2)),
        overtimePay: Number.parseFloat(overtimePay.toFixed(2)),
        bonus: Number.parseFloat(bonus.toFixed(2)),
        allowances,
        grossIncome: Number.parseFloat(grossIncome.toFixed(2)),
        deductions,
        totalDeductions: Number.parseFloat(totalDeductions.toFixed(2)),
        netPay: Number.parseFloat(netPay.toFixed(2)),
        workingDays,
        actualWorkDays,
        absentDays,
        lateDays,
        onLeaveDays,
        overtimeHours: Number.parseFloat(overtimeHours.toFixed(2)),
        status: 'draft',
        approvedBy: null,
        approvedAt: null,
        approvalComments: null,
        paidBy: null,
        paidAt: null,
        paymentMethod: null,
        transactionRef: null,
        notes: notes ?? null,
        tenantId: 'default',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const payrollRef = await db.collection('payroll').add(payrollData);

      logger.info('Payroll created successfully', {
        payrollId: payrollRef.id,
        employeeId,
        netPay,
      });

      return {
        success: true,
        payrollId: payrollRef.id,
        data: {
          grossIncome: payrollData.grossIncome,
          totalDeductions: payrollData.totalDeductions,
          netPay: payrollData.netPay,
          workingDays: payrollData.workingDays,
          actualWorkDays: payrollData.actualWorkDays,
          absentDays: payrollData.absentDays,
          overtimeHours: payrollData.overtimeHours,
        },
      };
    } catch (error: unknown) {
      logger.error('Failed to calculate payroll', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new HttpsError('internal', error.message);
      }

      throw new HttpsError('internal', 'Failed to calculate payroll');
    }
  }
);
