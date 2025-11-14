/**
 * Seed Route Permissions
 * Maps routes to required permissions
 */

import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Route Permissions Data
 * Maps each route pattern to its required permission and scope
 */
const routePermissions = [
  // ============================================
  // Employee Routes
  // ============================================
  {
    route: '/employees',
    resource: 'employees',
    requiredPermission: 'read',
    scope: 'all',
    checkOwnership: false,
    name: 'รายชื่อพนักงาน',
    description: 'หน้ารายชื่อพนักงานทั้งหมด',
  },
  {
    route: '/employees/:id',
    resource: 'employees',
    requiredPermission: 'read',
    scope: 'own',
    checkOwnership: true,
    name: 'รายละเอียดพนักงาน',
    description: 'หน้ารายละเอียดพนักงาน - ดูได้เฉพาะของตัวเองหรือทั้งหมด',
  },
  {
    route: '/employees/new',
    resource: 'employees',
    requiredPermission: 'create',
    scope: null,
    checkOwnership: false,
    name: 'สร้างพนักงานใหม่',
    description: 'หน้าฟอร์มสร้างพนักงานใหม่',
  },
  {
    route: '/employees/:id/edit',
    resource: 'employees',
    requiredPermission: 'update',
    scope: 'own',
    checkOwnership: true,
    name: 'แก้ไขข้อมูลพนักงาน',
    description: 'หน้าฟอร์มแก้ไขข้อมูลพนักงาน',
  },

  // ============================================
  // Attendance Routes
  // ============================================
  {
    route: '/attendance',
    resource: 'attendance',
    requiredPermission: 'read',
    scope: 'own',
    checkOwnership: false,
    name: 'การเข้างาน',
    description: 'หน้าการเข้างาน-ออกงาน',
  },
  {
    route: '/attendance/history',
    resource: 'attendance',
    requiredPermission: 'read',
    scope: 'all',
    checkOwnership: false,
    name: 'ประวัติการเข้างาน',
    description: 'หน้าประวัติการเข้างานทั้งหมด',
  },
  {
    route: '/attendance/approvals',
    resource: 'attendance',
    requiredPermission: 'update',
    scope: 'all',
    checkOwnership: false,
    name: 'อนุมัติการเข้างาน',
    description: 'หน้าอนุมัติ/แก้ไขการเข้างาน',
  },

  // ============================================
  // Leave Request Routes
  // ============================================
  {
    route: '/leave-requests',
    resource: 'leave-requests',
    requiredPermission: 'read',
    scope: 'own',
    checkOwnership: false,
    name: 'คำขอลา',
    description: 'หน้ารายการคำขอลา',
  },
  {
    route: '/leave-requests/new',
    resource: 'leave-requests',
    requiredPermission: 'create',
    scope: 'own',
    checkOwnership: false,
    name: 'สร้างคำขอลา',
    description: 'หน้าฟอร์มยื่นคำขอลา',
  },
  {
    route: '/leave-requests/approvals',
    resource: 'leave-requests',
    requiredPermission: 'update',
    scope: 'all',
    checkOwnership: false,
    name: 'อนุมัติการลา',
    description: 'หน้าอนุมัติ/ปฏิเสธคำขอลา',
  },

  // ============================================
  // Payroll Routes
  // ============================================
  {
    route: '/payroll',
    resource: 'payroll',
    requiredPermission: 'read',
    scope: 'own',
    checkOwnership: false,
    name: 'เงินเดือน',
    description: 'หน้าข้อมูลเงินเดือน',
  },
  {
    route: '/payroll/calculate',
    resource: 'payroll',
    requiredPermission: 'create',
    scope: null,
    checkOwnership: false,
    name: 'คำนวณเงินเดือน',
    description: 'หน้าคำนวณเงินเดือนประจำเดือน',
  },
  {
    route: '/payroll/:id',
    resource: 'payroll',
    requiredPermission: 'read',
    scope: 'own',
    checkOwnership: true,
    name: 'สลิปเงินเดือน',
    description: 'หน้าสลิปเงินเดือนรายบุคคล',
  },

  // ============================================
  // RBAC Management Routes
  // ============================================
  {
    route: '/system/roles',
    resource: 'roles',
    requiredPermission: 'read',
    scope: null,
    checkOwnership: false,
    name: 'จัดการบทบาท',
    description: 'หน้าจัดการบทบาท',
  },
  {
    route: '/system/permissions',
    resource: 'permissions',
    requiredPermission: 'read',
    scope: null,
    checkOwnership: false,
    name: 'จัดการสิทธิ์',
    description: 'หน้าจัดการสิทธิ์',
  },

  // ============================================
  // Department Routes
  // ============================================
  {
    route: '/departments',
    resource: 'departments',
    requiredPermission: 'read',
    scope: null,
    checkOwnership: false,
    name: 'แผนก',
    description: 'หน้ารายการแผนก',
  },
  {
    route: '/departments/new',
    resource: 'departments',
    requiredPermission: 'create',
    scope: null,
    checkOwnership: false,
    name: 'สร้างแผนกใหม่',
    description: 'หน้าฟอร์มสร้างแผนกใหม่',
  },

  // ============================================
  // Position Routes
  // ============================================
  {
    route: '/positions',
    resource: 'positions',
    requiredPermission: 'read',
    scope: null,
    checkOwnership: false,
    name: 'ตำแหน่งงาน',
    description: 'หน้ารายการตำแหน่งงาน',
  },
  {
    route: '/positions/new',
    resource: 'positions',
    requiredPermission: 'create',
    scope: null,
    checkOwnership: false,
    name: 'สร้างตำแหน่งใหม่',
    description: 'หน้าฟอร์มสร้างตำแหน่งใหม่',
  },

  // ============================================
  // Candidate Routes
  // ============================================
  {
    route: '/candidates',
    resource: 'candidates',
    requiredPermission: 'read',
    scope: null,
    checkOwnership: false,
    name: 'ผู้สมัครงาน',
    description: 'หน้ารายการผู้สมัครงาน',
  },
  {
    route: '/candidates/new',
    resource: 'candidates',
    requiredPermission: 'create',
    scope: null,
    checkOwnership: false,
    name: 'เพิ่มผู้สมัครงาน',
    description: 'หน้าฟอร์มเพิ่มผู้สมัครงาน',
  },

  // ============================================
  // Dashboard Routes
  // ============================================
  {
    route: '/dashboard',
    resource: 'dashboard',
    requiredPermission: 'read',
    scope: null,
    checkOwnership: false,
    name: 'แดชบอร์ด',
    description: 'หน้าแดชบอร์ดหลัก',
  },
];

/**
 * Seed route permissions
 */
export async function seedRoutePermissions(): Promise<void> {
  console.log('🛣️  Seeding route permissions...');

  const batch = db.batch();
  const routePermsRef = db.collection('routePermissions');

  for (const routePerm of routePermissions) {
    const docRef = routePermsRef.doc();
    batch.set(docRef, {
      id: docRef.id,
      ...routePerm,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      updatedBy: 'system',
    });
  }

  await batch.commit();

  console.log(`✅ Created ${routePermissions.length} route permissions`);
}
