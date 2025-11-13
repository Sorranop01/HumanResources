/**
 * Seed Permission Definitions
 * Creates default resource permissions in Firestore
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 */

import { db, Timestamp } from '../../config/firebase-admin.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface PermissionDefinition {
  id: string;
  resource: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  tenantId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

const permissionDefinitions: Omit<PermissionDefinition, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'perm-employees',
    resource: 'employees',
    name: 'จัดการข้อมูลพนักงาน',
    description: 'สิทธิ์ในการจัดการข้อมูลพนักงาน ประวัติ และเอกสาร',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'perm-attendance',
    resource: 'attendance',
    name: 'จัดการการเข้างาน',
    description: 'สิทธิ์ในการดูและแก้ไขข้อมูลการเข้างาน เวลาทำงาน',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'perm-leave-requests',
    resource: 'leave-requests',
    name: 'จัดการคำขอลา',
    description: 'สิทธิ์ในการยื่นคำขอลา อนุมัติ หรือปฏิเสธคำขอลา',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'perm-payroll',
    resource: 'payroll',
    name: 'จัดการเงินเดือน',
    description: 'สิทธิ์ในการดูและจัดการเงินเดือน โบนัส และสวัสดิการ',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'perm-settings',
    resource: 'settings',
    name: 'จัดการการตั้งค่าระบบ',
    description: 'สิทธิ์ในการตั้งค่าระบบ policies และ configurations',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'perm-users',
    resource: 'users',
    name: 'จัดการผู้ใช้',
    description: 'สิทธิ์ในการสร้าง แก้ไข และลบผู้ใช้ในระบบ',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'perm-roles',
    resource: 'roles',
    name: 'จัดการบทบาท',
    description: 'สิทธิ์ในการสร้างและแก้ไขบทบาท (roles)',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'perm-audit-logs',
    resource: 'audit-logs',
    name: 'ดู Audit Logs',
    description: 'สิทธิ์ในการดูประวัติการเปลี่ยนแปลงในระบบ',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

async function seedPermissions() {
  console.log('🌱 Seeding Permission Definitions...');

  const now = Timestamp.now();
  const batch = db.batch();

  for (const permission of permissionDefinitions) {
    const docRef = db.collection('permissionDefinitions').doc(permission.id);

    // ✅ Use stripUndefined for Firestore safety
    const permissionPayload = stripUndefined({
      ...permission,
      createdAt: now,
      updatedAt: now,
    });

    batch.set(docRef, permissionPayload);
    console.log(`  ✅ Created permission: ${permission.name} (${permission.resource})`);
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${permissionDefinitions.length} permissions\n`);
}

// Run seed
seedPermissions()
  .then(() => {
    console.log('✅ Permission seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding permissions:', error);
    process.exit(1);
  });
