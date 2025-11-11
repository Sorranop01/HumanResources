/**
 * Payroll Service
 * Business logic for payroll calculations and management
 */

import {
  addDoc,
  collection,
  type DocumentData,
  doc,
  getDoc,
  getDocs,
  orderBy,
  type QueryConstraint,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { attendanceService } from '@/domains/people/features/attendance';
import { employeeService } from '@/domains/people/features/employees/services/employeeService';
import { db } from '@/shared/lib/firebase';
import type {
  Allowances,
  ApprovePayrollInput,
  CreatePayrollInput,
  Deductions,
  PayrollCalculationInput,
  PayrollCalculationResult,
  PayrollFilters,
  PayrollRecord,
  PayrollSummary,
  ProcessPaymentInput,
  UpdatePayrollInput,
} from '../types';

const COLLECTION_NAME = 'payroll';

/**
 * Convert Firestore document to PayrollRecord
 */
function docToPayrollRecord(id: string, data: DocumentData): PayrollRecord {
  return {
    id,
    employeeId: data.employeeId,
    employeeName: data.employeeName,
    employeeCode: data.employeeCode,
    department: data.department,
    position: data.position,
    month: data.month,
    year: data.year,
    periodStart: data.periodStart.toDate(),
    periodEnd: data.periodEnd.toDate(),
    payDate: data.payDate.toDate(),
    baseSalary: data.baseSalary,
    overtimePay: data.overtimePay,
    bonus: data.bonus,
    allowances: data.allowances,
    grossIncome: data.grossIncome,
    deductions: data.deductions,
    totalDeductions: data.totalDeductions,
    netPay: data.netPay,
    workingDays: data.workingDays,
    actualWorkDays: data.actualWorkDays,
    absentDays: data.absentDays,
    lateDays: data.lateDays,
    onLeaveDays: data.onLeaveDays,
    overtimeHours: data.overtimeHours,
    status: data.status,
    approvedBy: data.approvedBy ?? undefined,
    approvedAt: data.approvedAt ? data.approvedAt.toDate() : undefined,
    approvalComments: data.approvalComments ?? undefined,
    paidBy: data.paidBy ?? undefined,
    paidAt: data.paidAt ? data.paidAt.toDate() : undefined,
    paymentMethod: data.paymentMethod ?? undefined,
    transactionRef: data.transactionRef ?? undefined,
    notes: data.notes ?? undefined,
    tenantId: data.tenantId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

export const payrollService = {
  /**
   * Calculate working days in a month (excluding weekends)
   */
  calculateWorkingDays(month: number, year: number): number {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    let workingDays = 0;

    const current = new Date(firstDay);
    while (current <= lastDay) {
      const dayOfWeek = current.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  },

  /**
   * Calculate daily rate from monthly salary
   */
  calculateDailyRate(monthlySalary: number, workingDays: number): number {
    return monthlySalary / workingDays;
  },

  /**
   * Calculate hourly rate from monthly salary
   */
  calculateHourlyRate(monthlySalary: number, workingDays: number, hoursPerDay = 8): number {
    const dailyRate = this.calculateDailyRate(monthlySalary, workingDays);
    return dailyRate / hoursPerDay;
  },

  /**
   * Calculate overtime pay
   */
  calculateOvertimePay(overtimeHours: number, hourlyRate: number, overtimeRate: number): number {
    return overtimeHours * hourlyRate * overtimeRate;
  },

  /**
   * Calculate absence penalty (deduction for absent days)
   */
  calculateAbsencePenalty(absentDays: number, dailyRate: number): number {
    // Full day deduction for absent days
    return absentDays * dailyRate;
  },

  /**
   * Calculate late penalty (fixed or percentage-based)
   */
  calculateLatePenalty(lateDays: number, penaltyPerDay = 100): number {
    // Fixed penalty per late day (configurable)
    return lateDays * penaltyPerDay;
  },

  /**
   * Calculate social security contribution (Thailand)
   * Max 750 THB/month for employee (5% of salary, capped at 15,000 THB)
   */
  calculateSocialSecurity(grossIncome: number): number {
    const rate = 0.05; // 5%
    const maxContribution = 750; // Max 750 THB
    const contribution = grossIncome * rate;
    return Math.min(contribution, maxContribution);
  },

  /**
   * Calculate withholding tax (simplified Thailand tax calculation)
   */
  calculateWithholdingTax(grossIncome: number, taxRate?: number): number {
    if (taxRate !== undefined) {
      return grossIncome * (taxRate / 100);
    }

    // Simplified progressive tax rates (monthly basis)
    const yearlyIncome = grossIncome * 12;
    const exemption = 150000; // Personal exemption
    const taxableIncome = Math.max(0, yearlyIncome - exemption);

    let tax = 0;
    if (taxableIncome <= 150000) {
      tax = 0;
    } else if (taxableIncome <= 300000) {
      tax = (taxableIncome - 150000) * 0.05;
    } else if (taxableIncome <= 500000) {
      tax = 150000 * 0.05 + (taxableIncome - 300000) * 0.1;
    } else if (taxableIncome <= 750000) {
      tax = 150000 * 0.05 + 200000 * 0.1 + (taxableIncome - 500000) * 0.15;
    } else if (taxableIncome <= 1000000) {
      tax = 150000 * 0.05 + 200000 * 0.1 + 250000 * 0.15 + (taxableIncome - 750000) * 0.2;
    } else if (taxableIncome <= 2000000) {
      tax =
        150000 * 0.05 +
        200000 * 0.1 +
        250000 * 0.15 +
        250000 * 0.2 +
        (taxableIncome - 1000000) * 0.25;
    } else if (taxableIncome <= 5000000) {
      tax =
        150000 * 0.05 +
        200000 * 0.1 +
        250000 * 0.15 +
        250000 * 0.2 +
        1000000 * 0.25 +
        (taxableIncome - 2000000) * 0.3;
    } else {
      tax =
        150000 * 0.05 +
        200000 * 0.1 +
        250000 * 0.15 +
        250000 * 0.2 +
        1000000 * 0.25 +
        3000000 * 0.3 +
        (taxableIncome - 5000000) * 0.35;
    }

    // Monthly tax (divide by 12)
    return tax / 12;
  },

  /**
   * Main payroll calculation function
   */
  async calculatePayroll(input: PayrollCalculationInput): Promise<PayrollCalculationResult> {
    try {
      // Calculate working days
      const workingDays = this.calculateWorkingDays(input.month, input.year);

      // Calculate rates
      const dailyRate = this.calculateDailyRate(input.baseSalary, workingDays);
      const hourlyRate = this.calculateHourlyRate(input.baseSalary, workingDays);

      // Income calculations
      const overtimePay = this.calculateOvertimePay(
        input.overtimeHours,
        hourlyRate,
        input.overtimeRate
      );

      const bonus = input.bonus ?? 0;

      const allowances: Allowances = {
        transportation: input.allowances?.transportation ?? 0,
        housing: input.allowances?.housing ?? 0,
        meal: input.allowances?.meal ?? 0,
        position: input.allowances?.position ?? 0,
        other: input.allowances?.other ?? 0,
      };

      const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);

      // Gross income (before deductions)
      const grossIncome = input.baseSalary + overtimePay + bonus + totalAllowances;

      // Deductions calculations
      const absencePenalty = this.calculateAbsencePenalty(input.absentDays, dailyRate);
      const latePenalty = this.calculateLatePenalty(input.lateDays);

      const socialSecurity = input.socialSecurityRate
        ? grossIncome * (input.socialSecurityRate / 100)
        : this.calculateSocialSecurity(grossIncome);

      const tax = this.calculateWithholdingTax(grossIncome, input.taxRate);

      const providentFund = input.providentFundRate
        ? grossIncome * (input.providentFundRate / 100)
        : 0;

      const deductions: Deductions = {
        tax: Number.parseFloat(tax.toFixed(2)),
        socialSecurity: Number.parseFloat(socialSecurity.toFixed(2)),
        providentFund: Number.parseFloat(providentFund.toFixed(2)),
        loan: input.loan ?? 0,
        advance: input.advance ?? 0,
        latePenalty: Number.parseFloat(latePenalty.toFixed(2)),
        absencePenalty: Number.parseFloat(absencePenalty.toFixed(2)),
        other: 0,
      };

      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);

      // Net pay (after deductions)
      const netPay = grossIncome - totalDeductions;

      return {
        baseSalary: Number.parseFloat(input.baseSalary.toFixed(2)),
        overtimePay: Number.parseFloat(overtimePay.toFixed(2)),
        bonus: Number.parseFloat(bonus.toFixed(2)),
        allowances,
        grossIncome: Number.parseFloat(grossIncome.toFixed(2)),
        deductions,
        totalDeductions: Number.parseFloat(totalDeductions.toFixed(2)),
        netPay: Number.parseFloat(netPay.toFixed(2)),
        workingDays,
        actualWorkDays: input.actualWorkDays,
        absentDays: input.absentDays,
        lateDays: input.lateDays,
        onLeaveDays: input.onLeaveDays,
        overtimeHours: Number.parseFloat(input.overtimeHours.toFixed(2)),
      };
    } catch (error) {
      console.error('Failed to calculate payroll', error);
      throw new Error('ไม่สามารถคำนวณเงินเดือนได้');
    }
  },

  /**
   * Create payroll record
   */
  async create(input: CreatePayrollInput): Promise<string> {
    try {
      // Get employee details
      const employee = await employeeService.getById(input.employeeId);
      if (!employee) {
        throw new Error('ไม่พบข้อมูลพนักงาน');
      }

      // Check if payroll already exists for this period
      const existing = await this.getByEmployeeAndPeriod(input.employeeId, input.month, input.year);
      if (existing) {
        throw new Error('มีข้อมูลเงินเดือนสำหรับช่วงเวลานี้แล้ว');
      }

      // Get attendance data
      const userId = employee.userId ?? employee.id; // Fallback to employee ID if userId not set
      const startDate = input.periodStart.toISOString().split('T')[0];
      const endDate = input.periodEnd.toISOString().split('T')[0];

      if (!userId) {
        throw new Error('ไม่พบ userId ของพนักงาน');
      }

      const attendanceStats = await attendanceService.calculateStats(
        userId,
        input.employeeId,
        startDate,
        endDate
      );

      // Calculate payroll
      const calculation = await this.calculatePayroll({
        employeeId: input.employeeId,
        month: input.month,
        year: input.year,
        actualWorkDays: attendanceStats.presentDays,
        absentDays: attendanceStats.absentDays,
        lateDays: attendanceStats.lateDays,
        overtimeHours: attendanceStats.overtimeHours,
        onLeaveDays: attendanceStats.onLeaveDays,
        baseSalary: employee.salary.baseSalary,
        paymentFrequency: employee.salary.paymentFrequency,
        overtimeRate: employee.overtime.rate,
      });

      // Create document
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        department: employee.department,
        position: employee.position,
        month: input.month,
        year: input.year,
        periodStart: Timestamp.fromDate(input.periodStart),
        periodEnd: Timestamp.fromDate(input.periodEnd),
        payDate: Timestamp.fromDate(input.payDate),
        baseSalary: calculation.baseSalary,
        overtimePay: calculation.overtimePay,
        bonus: calculation.bonus,
        allowances: calculation.allowances,
        grossIncome: calculation.grossIncome,
        deductions: calculation.deductions,
        totalDeductions: calculation.totalDeductions,
        netPay: calculation.netPay,
        workingDays: calculation.workingDays,
        actualWorkDays: calculation.actualWorkDays,
        absentDays: calculation.absentDays,
        lateDays: calculation.lateDays,
        onLeaveDays: calculation.onLeaveDays,
        overtimeHours: calculation.overtimeHours,
        status: 'draft',
        approvedBy: null,
        approvedAt: null,
        approvalComments: null,
        paidBy: null,
        paidAt: null,
        paymentMethod: null,
        transactionRef: null,
        notes: input.notes ?? null,
        tenantId: 'default',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to create payroll', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถสร้างข้อมูลเงินเดือนได้');
    }
  },

  /**
   * Get payroll by ID
   */
  async getById(id: string): Promise<PayrollRecord | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        return null;
      }

      return docToPayrollRecord(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Failed to fetch payroll', error);
      throw new Error('ไม่สามารถดึงข้อมูลเงินเดือนได้');
    }
  },

  /**
   * Get payroll by employee and period
   */
  async getByEmployeeAndPeriod(
    employeeId: string,
    month: number,
    year: number
  ): Promise<PayrollRecord | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('employeeId', '==', employeeId),
        where('month', '==', month),
        where('year', '==', year)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      if (!doc) {
        return null;
      }

      return docToPayrollRecord(doc.id, doc.data());
    } catch (error) {
      console.error('Failed to fetch payroll by employee and period', error);
      throw new Error('ไม่สามารถดึงข้อมูลเงินเดือนได้');
    }
  },

  /**
   * Get all payroll records with filters
   */
  async getAll(filters?: PayrollFilters): Promise<PayrollRecord[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.employeeId) {
        constraints.push(where('employeeId', '==', filters.employeeId));
      }

      if (filters?.department) {
        constraints.push(where('department', '==', filters.department));
      }

      if (filters?.month) {
        constraints.push(where('month', '==', filters.month));
      }

      if (filters?.year) {
        constraints.push(where('year', '==', filters.year));
      }

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => docToPayrollRecord(doc.id, doc.data()));
    } catch (error) {
      console.error('Failed to fetch payroll records', error);
      throw new Error('ไม่สามารถดึงข้อมูลเงินเดือนได้');
    }
  },

  /**
   * Update payroll record (only if status is draft)
   */
  async update(id: string, input: UpdatePayrollInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('ไม่พบข้อมูลเงินเดือน');
      }

      const current = docSnap.data();

      if (current.status !== 'draft') {
        throw new Error('ไม่สามารถแก้ไขข้อมูลเงินเดือนที่ไม่ได้อยู่ในสถานะ draft');
      }

      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      if (input.baseSalary !== undefined) updateData.baseSalary = input.baseSalary;
      if (input.overtimePay !== undefined) updateData.overtimePay = input.overtimePay;
      if (input.bonus !== undefined) updateData.bonus = input.bonus;
      if (input.allowances !== undefined) {
        updateData.allowances = {
          ...current.allowances,
          ...input.allowances,
        };
      }
      if (input.deductions !== undefined) {
        updateData.deductions = {
          ...current.deductions,
          ...input.deductions,
        };
      }
      if (input.payDate !== undefined) updateData.payDate = Timestamp.fromDate(input.payDate);
      if (input.notes !== undefined) updateData.notes = input.notes;

      // Recalculate totals if income or deductions changed
      if (
        input.baseSalary !== undefined ||
        input.overtimePay !== undefined ||
        input.bonus !== undefined ||
        input.allowances !== undefined
      ) {
        const baseSalary = input.baseSalary ?? current.baseSalary;
        const overtimePay = input.overtimePay ?? current.overtimePay;
        const bonus = input.bonus ?? current.bonus;
        const allowances = updateData.allowances ?? current.allowances;

        const totalAllowances = Object.values(allowances).reduce<number>(
          (sum: number, val) => sum + (val as number),
          0
        );
        updateData.grossIncome = baseSalary + overtimePay + bonus + totalAllowances;
      }

      if (input.deductions !== undefined) {
        const deductions = updateData.deductions ?? current.deductions;
        updateData.totalDeductions = Object.values(deductions).reduce<number>(
          (sum: number, val) => sum + (val as number),
          0
        );
      }

      if (updateData.grossIncome !== undefined || updateData.totalDeductions !== undefined) {
        const grossIncome = (updateData.grossIncome as number) ?? (current.grossIncome as number);
        const totalDeductions =
          (updateData.totalDeductions as number) ?? (current.totalDeductions as number);
        updateData.netPay = grossIncome - totalDeductions;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Failed to update payroll', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถอัปเดตข้อมูลเงินเดือนได้');
    }
  },

  /**
   * Approve payroll record
   */
  async approve(id: string, input: ApprovePayrollInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('ไม่พบข้อมูลเงินเดือน');
      }

      const current = docSnap.data();

      if (current.status !== 'pending' && current.status !== 'draft') {
        throw new Error('ไม่สามารถอนุมัติข้อมูลเงินเดือนที่ไม่ได้อยู่ในสถานะ pending หรือ draft');
      }

      await updateDoc(docRef, {
        status: 'approved',
        approvedBy: input.approverId,
        approvedAt: Timestamp.now(),
        approvalComments: input.comments ?? null,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to approve payroll', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถอนุมัติข้อมูลเงินเดือนได้');
    }
  },

  /**
   * Process payment
   */
  async processPayment(id: string, input: ProcessPaymentInput): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap || !docSnap.exists()) {
        throw new Error('ไม่พบข้อมูลเงินเดือน');
      }

      const current = docSnap.data();

      if (current.status !== 'approved') {
        throw new Error('ไม่สามารถจ่ายเงินสำหรับข้อมูลที่ยังไม่ได้อนุมัติ');
      }

      await updateDoc(docRef, {
        status: 'paid',
        paidBy: input.paidBy,
        paidAt: Timestamp.now(),
        paymentMethod: input.paymentMethod,
        transactionRef: input.transactionRef ?? null,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to process payment', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ไม่สามารถจ่ายเงินได้');
    }
  },

  /**
   * Get payroll summary for a period
   */
  async getSummary(month: number, year: number): Promise<PayrollSummary> {
    try {
      const records = await this.getAll({ month, year });

      const totalEmployees = records.length;
      const totalGrossIncome = records.reduce((sum, r) => sum + r.grossIncome, 0);
      const totalDeductions = records.reduce((sum, r) => sum + r.totalDeductions, 0);
      const totalNetPay = records.reduce((sum, r) => sum + r.netPay, 0);
      const averageNetPay = totalEmployees > 0 ? totalNetPay / totalEmployees : 0;

      return {
        totalEmployees,
        totalGrossIncome: Number.parseFloat(totalGrossIncome.toFixed(2)),
        totalDeductions: Number.parseFloat(totalDeductions.toFixed(2)),
        totalNetPay: Number.parseFloat(totalNetPay.toFixed(2)),
        averageNetPay: Number.parseFloat(averageNetPay.toFixed(2)),
        month,
        year,
      };
    } catch (error) {
      console.error('Failed to get payroll summary', error);
      throw new Error('ไม่สามารถสร้างรายงานสรุปเงินเดือนได้');
    }
  },
};
