/**
 * Seed Payroll Records
 * Creates sample payroll records for employees
 * Must run AFTER seedEmployees
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 */

import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

type PayrollStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'cancelled';
type PaymentMethod = 'bank-transfer' | 'cash' | 'cheque';

interface Allowances {
  transportation: number;
  housing: number;
  meal: number;
  position: number;
  other: number;
}

interface Deductions {
  tax: number;
  socialSecurity: number;
  providentFund: number;
  loan: number;
  advance: number;
  latePenalty: number;
  absencePenalty: number;
  other: number;
}

// Define a type for the data being written to Firestore
type PayrollRecordDocument = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  month: number;
  year: number;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  payDate: Timestamp;
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  allowances: Allowances;
  grossIncome: number;
  deductions: Deductions;
  totalDeductions: number;
  netPay: number;
  workingDays: number;
  actualWorkDays: number;
  absentDays: number;
  lateDays: number;
  onLeaveDays: number;
  overtimeHours: number;
  status: PayrollStatus;
  tenantId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
  approvalComments?: string;
  paidBy?: string;
  paidAt?: Timestamp;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  notes?: string;
};

// Helper functions
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateSocialSecurity(baseSalary: number): number {
  const maxBase = 15000;
  const rate = 0.05;
  return Math.min(baseSalary, maxBase) * rate;
}

function calculateProvidentFund(baseSalary: number, rate: number): number {
  return baseSalary * rate;
}

function calculateTax(grossIncome: number): number {
  // Simplified Thai tax calculation
  if (grossIncome <= 20000) return 0;
  if (grossIncome <= 30000) return (grossIncome - 20000) * 0.05;
  if (grossIncome <= 50000) return 500 + (grossIncome - 30000) * 0.1;
  if (grossIncome <= 70000) return 2500 + (grossIncome - 50000) * 0.15;
  return 5500 + (grossIncome - 70000) * 0.2;
}

async function seedPayrollRecords() {
  console.log('🌱 Seeding Payroll Records...');

  // 1. Fetch all active employees
  const employeesSnapshot = await db.collection('employees').where('status', '==', 'active').get();

  if (employeesSnapshot.empty) {
    console.log('⚠️  No active employees found. Please run seedEmployees first.');
    return;
  }

  const employees = employeesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Create payroll for current month and previous month
  const monthsToSeed = [
    {
      month: currentMonth === 1 ? 12 : currentMonth - 1,
      year: currentMonth === 1 ? currentYear - 1 : currentYear,
    },
    { month: currentMonth, year: currentYear },
  ];

  const now = Timestamp.now();
  let totalRecords = 0;

  for (const period of monthsToSeed) {
    const batch = db.batch();
    let batchCount = 0;

    console.log(`\n📅 Creating payroll for ${period.month}/${period.year}...`);

    for (const employee of employees) {
      const periodStart = new Date(period.year, period.month - 1, 1);
      const periodEnd = new Date(period.year, period.month, 0);
      const payDate = new Date(period.year, period.month, 5);

      const baseSalary = employee.salary?.baseSalary || 30000;
      const workingDays = 22;
      const actualWorkDays = getRandomInt(20, 22);
      const absentDays = workingDays - actualWorkDays;
      const lateDays = getRandomInt(0, 3);
      const onLeaveDays = getRandomInt(0, 2);
      const overtimeHours = getRandomInt(0, 20);
      const overtimeRate = employee.overtime?.rate || 1.5;
      const hourlyRate = baseSalary / workingDays / 8;
      const overtimePay = overtimeHours * hourlyRate * overtimeRate;

      const bonus = period.month === currentMonth ? getRandomInt(0, 5000) : 0;

      const allowances: Allowances = {
        transportation: 2000,
        housing: 0,
        meal: 1500,
        position: employee.level === 'Manager' ? 5000 : employee.level === 'Senior' ? 3000 : 0,
        other: 0,
      };

      const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
      const grossIncome = baseSalary + overtimePay + bonus + totalAllowances;

      const socialSecurity = calculateSocialSecurity(baseSalary);
      const providentFund = employee.benefits?.providentFund?.isEnrolled
        ? calculateProvidentFund(baseSalary, 0.05)
        : 0;
      const tax = calculateTax(grossIncome);
      const latePenalty = lateDays * 100;
      const absencePenalty = absentDays * (baseSalary / workingDays);

      const deductions: Deductions = {
        tax: Math.round(tax),
        socialSecurity: Math.round(socialSecurity),
        providentFund: Math.round(providentFund),
        loan: 0,
        advance: 0,
        latePenalty: Math.round(latePenalty),
        absencePenalty: Math.round(absencePenalty),
        other: 0,
      };

      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
      const netPay = grossIncome - totalDeductions;

      // Determine status based on month
      let status: PayrollStatus;
      let approvedBy: string | undefined;
      let approvedAt: FirebaseFirestore.Timestamp | undefined;
      let paidBy: string | undefined;
      let paidAt: FirebaseFirestore.Timestamp | undefined;
      let paymentMethod: PaymentMethod | undefined;

      if (period.month < currentMonth || period.year < currentYear) {
        // Previous month - mark as paid
        status = 'paid';
        approvedBy = 'system-admin';
        approvedAt = Timestamp.fromDate(new Date(period.year, period.month - 1, 28));
        paidBy = 'system-admin';
        paidAt = Timestamp.fromDate(payDate);
        paymentMethod = 'bank-transfer';
      } else {
        // Current month - randomize status
        const statusOptions: PayrollStatus[] = ['draft', 'pending', 'approved'];
        status = statusOptions[getRandomInt(0, 2)];

        if (status === 'approved' || status === 'pending') {
          approvedBy = 'system-admin';
          approvedAt = Timestamp.fromDate(new Date(period.year, period.month - 1, 25));
        }
      }

      const payrollId = `payroll-${employee.id}-${period.year}-${String(period.month).padStart(2, '0')}`;

      const payrollData: PayrollRecordDocument = {
        id: payrollId,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode || 'N/A',
        department: employee.department || 'N/A',
        position: employee.position || 'N/A',
        month: period.month,
        year: period.year,
        periodStart: Timestamp.fromDate(periodStart),
        periodEnd: Timestamp.fromDate(periodEnd),
        payDate: Timestamp.fromDate(payDate),
        baseSalary: Math.round(baseSalary),
        overtimePay: Math.round(overtimePay),
        bonus: Math.round(bonus),
        allowances,
        grossIncome: Math.round(grossIncome),
        deductions,
        totalDeductions: Math.round(totalDeductions),
        netPay: Math.round(netPay),
        workingDays,
        actualWorkDays,
        absentDays,
        lateDays,
        onLeaveDays,
        overtimeHours,
        status,
        tenantId: 'default',
        createdAt: now,
        updatedAt: now,
      };

      // Add optional fields only if they exist (avoid undefined)
      if (approvedBy) payrollData.approvedBy = approvedBy;
      if (approvedAt) payrollData.approvedAt = approvedAt;
      if (status === 'approved') payrollData.approvalComments = 'อนุมัติตามปกติ';
      if (paidBy) payrollData.paidBy = paidBy;
      if (paidAt) payrollData.paidAt = paidAt;
      if (paymentMethod) payrollData.paymentMethod = paymentMethod;
      if (status === 'paid')
        payrollData.transactionRef = `TXN-${Date.now()}-${getRandomInt(1000, 9999)}`;

      const docRef = db.collection('payrollRecords').doc(payrollId);

      // ✅ Use stripUndefined for Firestore safety
      const payrollPayload = stripUndefined(payrollData);
      batch.set(docRef, payrollPayload);

      batchCount++;
      totalRecords++;

      // Commit in batches of 500
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`  ✅ Created ${batchCount} payroll records...`);
        batchCount = 0;
      }
    }

    // Commit remaining
    if (batchCount > 0) {
      await batch.commit();
      console.log(`  ✅ Created ${batchCount} payroll records for ${period.month}/${period.year}`);
    }
  }

  console.log(`\n✅ Successfully seeded ${totalRecords} payroll records`);
  console.log(`   📊 ${employees.length} employees × ${monthsToSeed.length} months\n`);
}

// Run seed
seedPayrollRecords()
  .then(() => {
    console.log('✅ Payroll record seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding payroll records:', error);
    process.exit(1);
  });
