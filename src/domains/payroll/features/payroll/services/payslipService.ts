/**
 * Payslip Service
 * Generates PDF payslips and helper actions
 */

import dayjs from 'dayjs';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { PayrollRecord } from '@/domains/payroll/features/payroll/types';
import { employeeService } from '@/domains/people/features/employees/services/employeeService';
import type { Employee } from '@/domains/people/features/employees/types';
import { storage } from '@/shared/lib/firebase';
import { payrollService } from './payrollService';

interface PayslipDocument {
  bytes: Uint8Array;
  fileName: string;
  payroll: PayrollRecord;
  employee?: Employee | null;
}

function formatCurrency(value: number): string {
  return `฿${value.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatHeaderDate(payroll: PayrollRecord): string {
  const month = dayjs()
    .month(payroll.month - 1)
    .format('MMMM');
  return `${month} ${payroll.year + 543}`;
}

async function buildPayslipDocument(payroll: PayrollRecord, employee?: Employee | null) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();

  let cursorY = height - 60;

  const drawHeading = (text: string) => {
    page.drawText(text, {
      x: 50,
      y: cursorY,
      size: 18,
      font: boldFont,
      color: rgb(0.15, 0.15, 0.15),
    });
    cursorY -= 30;
  };

  const drawSubHeading = (text: string) => {
    cursorY -= 10;
    page.drawText(text, {
      x: 50,
      y: cursorY,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    cursorY -= 22;
  };

  const drawLineItem = (label: string, value: string) => {
    page.drawText(label, {
      x: 50,
      y: cursorY,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(value, {
      x: 320,
      y: cursorY,
      size: 11,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    cursorY -= 18;
  };

  drawHeading('สลิปเงินเดือน (Payslip)');
  drawLineItem('ประจำงวด', formatHeaderDate(payroll));
  drawLineItem('วันที่จ่าย', dayjs(payroll.payDate).format('DD MMMM YYYY'));

  drawSubHeading('ข้อมูลพนักงาน');
  drawLineItem('พนักงาน', payroll.employeeName);
  drawLineItem('รหัสพนักงาน', payroll.employeeCode);
  drawLineItem('แผนก', payroll.departmentName);
  drawLineItem('ตำแหน่ง', payroll.positionName);
  if (employee?.email) {
    drawLineItem('อีเมล', employee.email);
  }

  drawSubHeading('รายได้ (Earnings)');
  drawLineItem('เงินเดือนพื้นฐาน', formatCurrency(payroll.baseSalary));
  drawLineItem('ค่าล่วงเวลา (OT)', formatCurrency(payroll.overtimePay));
  drawLineItem('โบนัส', formatCurrency(payroll.bonus));
  const allowanceLabelMap: Record<string, string> = {
    transportation: 'ค่าเดินทาง',
    housing: 'ค่าที่พัก',
    meal: 'ค่าอาหาร',
    position: 'ค่าตำแหน่ง',
    other: 'อื่น ๆ',
  };

  const allowanceEntries = Object.entries(payroll.allowances ?? {}).filter(([, value]) => value);
  allowanceEntries.forEach(([key, value]) => {
    if (value) {
      const label = allowanceLabelMap[key] ?? key;
      drawLineItem(`เบี้ยเลี้ยง - ${label}`, formatCurrency(value));
    }
  });
  drawLineItem('รายได้รวม', formatCurrency(payroll.grossIncome));

  drawSubHeading('รายการหัก (Deductions)');
  const deductionLabelMap: Record<string, string> = {
    tax: 'ภาษี (หัก ณ ที่จ่าย)',
    socialSecurity: 'ประกันสังคม',
    providentFund: 'กองทุนสำรองเลี้ยงชีพ',
    loan: 'เงินกู้',
    advance: 'เบิกล่วงหน้า',
    latePenalty: 'ค่าปรับมาสาย',
    absencePenalty: 'หักค่าขาดงาน',
    other: 'อื่น ๆ',
  };

  const deductionEntries = Object.entries(payroll.deductions ?? {}).filter(([, value]) => value);
  deductionEntries.forEach(([key, value]) => {
    if (value) {
      const label = deductionLabelMap[key] ?? key;
      drawLineItem(label, formatCurrency(value));
    }
  });
  drawLineItem('รวมรายการหัก', formatCurrency(payroll.totalDeductions));

  drawSubHeading('สรุป');
  drawLineItem('รับสุทธิ (Net Pay)', formatCurrency(payroll.netPay));
  drawLineItem('วันทำงานจริง', `${payroll.actualWorkDays} วัน`);
  drawLineItem('ลางาน', `${payroll.onLeaveDays} วัน`);
  drawLineItem('ขาดงาน', `${payroll.absentDays} วัน`);
  drawLineItem('ชั่วโมง OT', `${payroll.overtimeHours.toFixed(2)} ชั่วโมง`);

  const pdfBytes = await pdfDoc.save();
  const fileName = `Payslip-${payroll.employeeCode}-${payroll.month}-${payroll.year}.pdf`;

  return { bytes: pdfBytes, fileName };
}

async function resolveEmployee(payroll: PayrollRecord): Promise<Employee | null> {
  try {
    return await employeeService.getById(payroll.employeeId);
  } catch (error) {
    console.warn('Unable to load employee profile for payslip', error);
    return null;
  }
}

async function generatePayslipDocument(payrollId: string): Promise<PayslipDocument> {
  const payroll = await payrollService.getById(payrollId);
  if (!payroll) {
    throw new Error('ไม่พบข้อมูลเงินเดือนสำหรับการสร้างสลิป');
  }
  const employee = await resolveEmployee(payroll);
  const pdf = await buildPayslipDocument(payroll, employee);
  return {
    bytes: pdf.bytes,
    fileName: pdf.fileName,
    payroll,
    employee,
  };
}

async function downloadPayslip(payrollId: string) {
  if (typeof window === 'undefined') {
    throw new Error('ต้องรันบนเบราว์เซอร์เพื่อดาวน์โหลดสลิป');
  }

  const payslip = await generatePayslipDocument(payrollId);
  const buffer = new ArrayBuffer(payslip.bytes.byteLength);
  new Uint8Array(buffer).set(payslip.bytes);
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = payslip.fileName;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function emailPayslip(payrollId: string, recipientEmail?: string) {
  if (typeof window === 'undefined') {
    throw new Error('ต้องรันบนเบราว์เซอร์เพื่อส่งสลิป');
  }

  const { payroll, employee } = await generatePayslipDocument(payrollId);
  const email = recipientEmail ?? employee?.email ?? employee?.personalEmail ?? undefined;

  if (!email) {
    throw new Error('ไม่พบอีเมลของพนักงานสำหรับการส่งสลิป');
  }

  const subject = `Payslip - ${formatHeaderDate(payroll)} (${payroll.employeeName})`;
  const bodyLines = [
    `เรียน ${employee?.firstName ?? payroll.employeeName},`,
    '',
    `สรุปเงินเดือนประจำ ${formatHeaderDate(payroll)}:`,
    `- รายได้รวม: ${formatCurrency(payroll.grossIncome)}`,
    `- หักรวม: ${formatCurrency(payroll.totalDeductions)}`,
    `- รับสุทธิ: ${formatCurrency(payroll.netPay)}`,
    '',
    'โปรดดาวน์โหลดสลิปจากระบบ HR เพื่อเก็บเป็นหลักฐาน',
    '',
    'ขอบคุณค่ะ',
  ];

  const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
  window.location.href = mailtoUrl;
}

async function uploadPayslipToStorage(payrollId: string) {
  const payslip = await generatePayslipDocument(payrollId);
  const monthSegment = String(payslip.payroll.month).padStart(2, '0');
  const storagePath = `payslips/${payslip.payroll.employeeId}/${payslip.payroll.year}-${monthSegment}/${payslip.fileName}`;
  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, payslip.bytes, {
    contentType: 'application/pdf',
  });
  const downloadUrl = await getDownloadURL(fileRef);
  return {
    path: storagePath,
    url: downloadUrl,
    fileName: payslip.fileName,
  };
}

export const payslipService = {
  async generatePayslipPDF(payrollId: string) {
    return generatePayslipDocument(payrollId);
  },
  downloadPayslip,
  emailPayslip,
  uploadPayslipToStorage,
};
