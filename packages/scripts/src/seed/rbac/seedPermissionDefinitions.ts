/**
 * Seed Permission Definitions
 * Creates detailed permission definitions in Firestore
 */

import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Permission Definitions Data
 */
const permissionDefinitions = [
  // ============================================
  // Employees Resource
  // ============================================
  {
    resource: 'employees',
    permission: 'read',
    name: 'อ่านข้อมูลพนักงาน',
    description: 'สามารถดูข้อมูลพนักงาน เข้าถึงหน้ารายชื่อพนักงาน และดูรายละเอียดพนักงาน',
    routes: ['/employees', '/employees/:id'],
    actions: ['view_employee_list', 'view_employee_detail', 'export_employee_data'],
    uiElements: ['employee_menu', 'employee_table', 'employee_card'],
    scopes: ['own', 'all'],
    category: 'employee_management',
    icon: 'UserOutlined',
    order: 1,
  },
  {
    resource: 'employees',
    permission: 'create',
    name: 'สร้างพนักงานใหม่',
    description: 'สามารถเพิ่มพนักงานใหม่เข้าระบบ',
    routes: ['/employees/new'],
    actions: ['create_employee', 'upload_employee_photo'],
    uiElements: ['employee_create_button', 'employee_form'],
    scopes: [null],
    category: 'employee_management',
    icon: 'PlusOutlined',
    order: 2,
  },
  {
    resource: 'employees',
    permission: 'update',
    name: 'แก้ไขข้อมูลพนักงาน',
    description: 'สามารถแก้ไขข้อมูลพนักงานที่มีอยู่',
    routes: ['/employees/:id/edit'],
    actions: ['update_employee', 'update_employee_salary', 'update_employee_position'],
    uiElements: ['employee_edit_button', 'employee_edit_form'],
    scopes: ['own', 'all'],
    category: 'employee_management',
    icon: 'EditOutlined',
    order: 3,
  },
  {
    resource: 'employees',
    permission: 'delete',
    name: 'ลบข้อมูลพนักงาน',
    description: 'สามารถลบหรือปิดใช้งานข้อมูลพนักงาน',
    routes: [],
    actions: ['delete_employee', 'archive_employee'],
    uiElements: ['employee_delete_button'],
    scopes: [null],
    category: 'employee_management',
    icon: 'DeleteOutlined',
    order: 4,
  },

  // ============================================
  // Attendance Resource
  // ============================================
  {
    resource: 'attendance',
    permission: 'read',
    name: 'อ่านข้อมูลการเข้างาน',
    description: 'สามารถดูข้อมูลการเข้างาน-ออกงาน',
    routes: ['/attendance', '/attendance/:id'],
    actions: ['view_attendance_list', 'view_attendance_detail', 'export_attendance_report'],
    uiElements: ['attendance_menu', 'attendance_table'],
    scopes: ['own', 'all'],
    category: 'attendance_management',
    icon: 'ClockCircleOutlined',
    order: 5,
  },
  {
    resource: 'attendance',
    permission: 'create',
    name: 'บันทึกเวลาเข้างาน',
    description: 'สามารถบันทึกเวลาเข้า-ออกงาน',
    routes: [],
    actions: ['clock_in', 'clock_out', 'create_manual_attendance'],
    uiElements: ['clock_in_button', 'clock_out_button'],
    scopes: ['own', 'all'],
    category: 'attendance_management',
    icon: 'LoginOutlined',
    order: 6,
  },
  {
    resource: 'attendance',
    permission: 'update',
    name: 'แก้ไขข้อมูลการเข้างาน',
    description: 'สามารถแก้ไขหรืออนุมัติข้อมูลการเข้างาน',
    routes: [],
    actions: ['update_attendance', 'approve_attendance', 'reject_attendance'],
    uiElements: ['attendance_edit_button', 'attendance_approve_button'],
    scopes: ['all'],
    category: 'attendance_management',
    icon: 'CheckOutlined',
    order: 7,
  },

  // ============================================
  // Leave Requests Resource
  // ============================================
  {
    resource: 'leave-requests',
    permission: 'read',
    name: 'อ่านข้อมูลการลา',
    description: 'สามารถดูข้อมูลการลา',
    routes: ['/leave-requests', '/leave-requests/:id'],
    actions: ['view_leave_request_list', 'view_leave_request_detail'],
    uiElements: ['leave_menu', 'leave_table'],
    scopes: ['own', 'all'],
    category: 'leave_management',
    icon: 'CalendarOutlined',
    order: 8,
  },
  {
    resource: 'leave-requests',
    permission: 'create',
    name: 'สร้างคำขอลา',
    description: 'สามารถยื่นคำขอลา',
    routes: ['/leave-requests/new'],
    actions: ['create_leave_request'],
    uiElements: ['leave_create_button', 'leave_form'],
    scopes: ['own'],
    category: 'leave_management',
    icon: 'FileAddOutlined',
    order: 9,
  },
  {
    resource: 'leave-requests',
    permission: 'update',
    name: 'อนุมัติ/ปฏิเสธการลา',
    description: 'สามารถอนุมัติหรือปฏิเสธคำขอลา',
    routes: [],
    actions: ['approve_leave_request', 'reject_leave_request', 'cancel_leave_request'],
    uiElements: ['leave_approve_button', 'leave_reject_button'],
    scopes: ['all'],
    category: 'leave_management',
    icon: 'CheckCircleOutlined',
    order: 10,
  },

  // ============================================
  // Payroll Resource
  // ============================================
  {
    resource: 'payroll',
    permission: 'read',
    name: 'อ่านข้อมูลเงินเดือน',
    description: 'สามารถดูข้อมูลเงินเดือนและสลิปเงินเดือน',
    routes: ['/payroll', '/payroll/:id'],
    actions: ['view_payroll_list', 'view_payslip', 'download_payslip'],
    uiElements: ['payroll_menu', 'payroll_table'],
    scopes: ['own', 'all'],
    category: 'payroll_management',
    icon: 'DollarOutlined',
    order: 11,
  },
  {
    resource: 'payroll',
    permission: 'create',
    name: 'สร้างรายการเงินเดือน',
    description: 'สามารถสร้างและคำนวณเงินเดือน',
    routes: ['/payroll/calculate'],
    actions: ['calculate_payroll', 'generate_payroll'],
    uiElements: ['payroll_calculate_button'],
    scopes: [null],
    category: 'payroll_management',
    icon: 'CalculatorOutlined',
    order: 12,
  },
];

/**
 * Seed permission definitions
 */
export async function seedPermissionDefinitions(): Promise<void> {
  console.log('🔐 Seeding permission definitions...');

  const batch = db.batch();
  const permissionDefsRef = db.collection('permissionDefinitions');

  for (const permDef of permissionDefinitions) {
    const docRef = permissionDefsRef.doc();
    batch.set(docRef, {
      id: docRef.id,
      ...permDef,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      updatedBy: 'system',
    });
  }

  await batch.commit();

  console.log(`✅ Created ${permissionDefinitions.length} permission definitions`);
}
