/**
 * Seed Action Permissions
 * Maps actions to required permissions
 */

import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Action Permissions Data
 * Maps each action to its required permission and scope
 */
const actionPermissions = [
  // ============================================
  // Employee Actions
  // ============================================
  {
    action: 'view_employee_list',
    resource: 'employees',
    requiredPermission: 'read',
    scope: 'all',
    name: 'ดูรายชื่อพนักงาน',
    description: 'ดูรายชื่อพนักงานทั้งหมด',
    category: 'employee_management',
  },
  {
    action: 'view_employee_detail',
    resource: 'employees',
    requiredPermission: 'read',
    scope: 'own',
    name: 'ดูรายละเอียดพนักงาน',
    description: 'ดูรายละเอียดพนักงาน (ของตัวเองหรือทั้งหมด)',
    category: 'employee_management',
  },
  {
    action: 'export_employee_data',
    resource: 'employees',
    requiredPermission: 'read',
    scope: 'all',
    name: 'ส่งออกข้อมูลพนักงาน',
    description: 'ส่งออกข้อมูลพนักงานเป็นไฟล์',
    category: 'employee_management',
  },
  {
    action: 'create_employee',
    resource: 'employees',
    requiredPermission: 'create',
    scope: null,
    name: 'สร้างพนักงานใหม่',
    description: 'เพิ่มพนักงานใหม่เข้าระบบ',
    category: 'employee_management',
  },
  {
    action: 'upload_employee_photo',
    resource: 'employees',
    requiredPermission: 'create',
    scope: null,
    name: 'อัพโหลดรูปพนักงาน',
    description: 'อัพโหลดรูปถ่ายพนักงาน',
    category: 'employee_management',
  },
  {
    action: 'update_employee',
    resource: 'employees',
    requiredPermission: 'update',
    scope: 'own',
    name: 'แก้ไขข้อมูลพนักงาน',
    description: 'แก้ไขข้อมูลพนักงาน (ของตัวเองหรือทั้งหมด)',
    category: 'employee_management',
  },
  {
    action: 'update_employee_salary',
    resource: 'employees',
    requiredPermission: 'update',
    scope: 'all',
    name: 'แก้ไขเงินเดือน',
    description: 'แก้ไขข้อมูลเงินเดือนพนักงาน',
    category: 'employee_management',
  },
  {
    action: 'update_employee_position',
    resource: 'employees',
    requiredPermission: 'update',
    scope: 'all',
    name: 'แก้ไขตำแหน่ง',
    description: 'เปลี่ยนตำแหน่งงานพนักงาน',
    category: 'employee_management',
  },
  {
    action: 'delete_employee',
    resource: 'employees',
    requiredPermission: 'delete',
    scope: null,
    name: 'ลบพนักงาน',
    description: 'ลบข้อมูลพนักงานออกจากระบบ',
    category: 'employee_management',
  },
  {
    action: 'archive_employee',
    resource: 'employees',
    requiredPermission: 'delete',
    scope: null,
    name: 'ปิดการใช้งานพนักงาน',
    description: 'ปิดการใช้งานพนักงาน (Soft delete)',
    category: 'employee_management',
  },

  // ============================================
  // Attendance Actions
  // ============================================
  {
    action: 'view_attendance_list',
    resource: 'attendance',
    requiredPermission: 'read',
    scope: 'own',
    name: 'ดูรายการเข้างาน',
    description: 'ดูรายการเข้างาน-ออกงาน',
    category: 'attendance_management',
  },
  {
    action: 'view_attendance_detail',
    resource: 'attendance',
    requiredPermission: 'read',
    scope: 'own',
    name: 'ดูรายละเอียดการเข้างาน',
    description: 'ดูรายละเอียดการเข้างานแต่ละครั้ง',
    category: 'attendance_management',
  },
  {
    action: 'export_attendance_report',
    resource: 'attendance',
    requiredPermission: 'read',
    scope: 'all',
    name: 'ส่งออกรายงานการเข้างาน',
    description: 'ส่งออกรายงานการเข้างานเป็นไฟล์',
    category: 'attendance_management',
  },
  {
    action: 'clock_in',
    resource: 'attendance',
    requiredPermission: 'create',
    scope: 'own',
    name: 'บันทึกเวลาเข้างาน',
    description: 'บันทึกเวลาเข้างาน (Clock In)',
    category: 'attendance_management',
  },
  {
    action: 'clock_out',
    resource: 'attendance',
    requiredPermission: 'create',
    scope: 'own',
    name: 'บันทึกเวลาออกงาน',
    description: 'บันทึกเวลาออกงาน (Clock Out)',
    category: 'attendance_management',
  },
  {
    action: 'create_manual_attendance',
    resource: 'attendance',
    requiredPermission: 'create',
    scope: 'all',
    name: 'บันทึกเวลาด้วยตนเอง',
    description: 'บันทึกเวลาเข้า-ออกด้วยตนเอง (Manual Entry)',
    category: 'attendance_management',
  },
  {
    action: 'update_attendance',
    resource: 'attendance',
    requiredPermission: 'update',
    scope: 'all',
    name: 'แก้ไขการเข้างาน',
    description: 'แก้ไขข้อมูลการเข้างาน',
    category: 'attendance_management',
  },
  {
    action: 'approve_attendance',
    resource: 'attendance',
    requiredPermission: 'update',
    scope: 'all',
    name: 'อนุมัติการเข้างาน',
    description: 'อนุมัติการเข้างานที่ต้องการอนุมัติ',
    category: 'attendance_management',
  },
  {
    action: 'reject_attendance',
    resource: 'attendance',
    requiredPermission: 'update',
    scope: 'all',
    name: 'ปฏิเสธการเข้างาน',
    description: 'ปฏิเสธการเข้างานที่ไม่ถูกต้อง',
    category: 'attendance_management',
  },

  // ============================================
  // Leave Request Actions
  // ============================================
  {
    action: 'view_leave_request_list',
    resource: 'leave-requests',
    requiredPermission: 'read',
    scope: 'own',
    name: 'ดูรายการคำขอลา',
    description: 'ดูรายการคำขอลา',
    category: 'leave_management',
  },
  {
    action: 'view_leave_request_detail',
    resource: 'leave-requests',
    requiredPermission: 'read',
    scope: 'own',
    name: 'ดูรายละเอียดคำขอลา',
    description: 'ดูรายละเอียดคำขอลาแต่ละรายการ',
    category: 'leave_management',
  },
  {
    action: 'create_leave_request',
    resource: 'leave-requests',
    requiredPermission: 'create',
    scope: 'own',
    name: 'ยื่นคำขอลา',
    description: 'สร้างคำขอลาใหม่',
    category: 'leave_management',
  },
  {
    action: 'approve_leave_request',
    resource: 'leave-requests',
    requiredPermission: 'update',
    scope: 'all',
    name: 'อนุมัติคำขอลา',
    description: 'อนุมัติคำขอลาของพนักงาน',
    category: 'leave_management',
  },
  {
    action: 'reject_leave_request',
    resource: 'leave-requests',
    requiredPermission: 'update',
    scope: 'all',
    name: 'ปฏิเสธคำขอลา',
    description: 'ปฏิเสธคำขอลาของพนักงาน',
    category: 'leave_management',
  },
  {
    action: 'cancel_leave_request',
    resource: 'leave-requests',
    requiredPermission: 'update',
    scope: 'own',
    name: 'ยกเลิกคำขอลา',
    description: 'ยกเลิกคำขอลาของตัวเอง',
    category: 'leave_management',
  },

  // ============================================
  // Payroll Actions
  // ============================================
  {
    action: 'view_payroll_list',
    resource: 'payroll',
    requiredPermission: 'read',
    scope: 'own',
    name: 'ดูรายการเงินเดือน',
    description: 'ดูรายการเงินเดือนของตัวเอง',
    category: 'payroll_management',
  },
  {
    action: 'view_payslip',
    resource: 'payroll',
    requiredPermission: 'read',
    scope: 'own',
    name: 'ดูสลิปเงินเดือน',
    description: 'ดูสลิปเงินเดือนของตัวเอง',
    category: 'payroll_management',
  },
  {
    action: 'download_payslip',
    resource: 'payroll',
    requiredPermission: 'read',
    scope: 'own',
    name: 'ดาวน์โหลดสลิปเงินเดือน',
    description: 'ดาวน์โหลดสลิปเงินเดือนเป็นไฟล์',
    category: 'payroll_management',
  },
  {
    action: 'calculate_payroll',
    resource: 'payroll',
    requiredPermission: 'create',
    scope: null,
    name: 'คำนวณเงินเดือน',
    description: 'คำนวณเงินเดือนประจำเดือน',
    category: 'payroll_management',
  },
  {
    action: 'generate_payroll',
    resource: 'payroll',
    requiredPermission: 'create',
    scope: null,
    name: 'สร้างรายการเงินเดือน',
    description: 'สร้างรายการเงินเดือนใหม่',
    category: 'payroll_management',
  },

  // ============================================
  // Department Actions
  // ============================================
  {
    action: 'view_department_list',
    resource: 'departments',
    requiredPermission: 'read',
    scope: null,
    name: 'ดูรายการแผนก',
    description: 'ดูรายการแผนกทั้งหมด',
    category: 'organization_management',
  },
  {
    action: 'create_department',
    resource: 'departments',
    requiredPermission: 'create',
    scope: null,
    name: 'สร้างแผนกใหม่',
    description: 'สร้างแผนกใหม่',
    category: 'organization_management',
  },
  {
    action: 'update_department',
    resource: 'departments',
    requiredPermission: 'update',
    scope: null,
    name: 'แก้ไขแผนก',
    description: 'แก้ไขข้อมูลแผนก',
    category: 'organization_management',
  },
  {
    action: 'delete_department',
    resource: 'departments',
    requiredPermission: 'delete',
    scope: null,
    name: 'ลบแผนก',
    description: 'ลบแผนกออกจากระบบ',
    category: 'organization_management',
  },

  // ============================================
  // Position Actions
  // ============================================
  {
    action: 'view_position_list',
    resource: 'positions',
    requiredPermission: 'read',
    scope: null,
    name: 'ดูรายการตำแหน่ง',
    description: 'ดูรายการตำแหน่งงานทั้งหมด',
    category: 'organization_management',
  },
  {
    action: 'create_position',
    resource: 'positions',
    requiredPermission: 'create',
    scope: null,
    name: 'สร้างตำแหน่งใหม่',
    description: 'สร้างตำแหน่งงานใหม่',
    category: 'organization_management',
  },
  {
    action: 'update_position',
    resource: 'positions',
    requiredPermission: 'update',
    scope: null,
    name: 'แก้ไขตำแหน่ง',
    description: 'แก้ไขข้อมูลตำแหน่งงาน',
    category: 'organization_management',
  },
  {
    action: 'delete_position',
    resource: 'positions',
    requiredPermission: 'delete',
    scope: null,
    name: 'ลบตำแหน่ง',
    description: 'ลบตำแหน่งงานออกจากระบบ',
    category: 'organization_management',
  },

  // ============================================
  // Candidate Actions
  // ============================================
  {
    action: 'view_candidate_list',
    resource: 'candidates',
    requiredPermission: 'read',
    scope: null,
    name: 'ดูรายการผู้สมัคร',
    description: 'ดูรายการผู้สมัครงานทั้งหมด',
    category: 'recruitment_management',
  },
  {
    action: 'create_candidate',
    resource: 'candidates',
    requiredPermission: 'create',
    scope: null,
    name: 'เพิ่มผู้สมัครใหม่',
    description: 'เพิ่มผู้สมัครงานใหม่',
    category: 'recruitment_management',
  },
  {
    action: 'update_candidate_status',
    resource: 'candidates',
    requiredPermission: 'update',
    scope: null,
    name: 'อัพเดทสถานะผู้สมัคร',
    description: 'อัพเดทสถานะผู้สมัครงาน',
    category: 'recruitment_management',
  },
  {
    action: 'move_to_employee',
    resource: 'candidates',
    requiredPermission: 'create',
    scope: null,
    name: 'ย้ายเป็นพนักงาน',
    description: 'ย้ายผู้สมัครเป็นพนักงาน',
    category: 'recruitment_management',
  },
];

/**
 * Seed action permissions
 */
export async function seedActionPermissions(): Promise<void> {
  console.log('⚡ Seeding action permissions...');

  const batch = db.batch();
  const actionPermsRef = db.collection('actionPermissions');

  for (const actionPerm of actionPermissions) {
    const docRef = actionPermsRef.doc();
    batch.set(docRef, {
      id: docRef.id,
      ...actionPerm,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      updatedBy: 'system',
    });
  }

  await batch.commit();

  console.log(`✅ Created ${actionPermissions.length} action permissions`);
}
