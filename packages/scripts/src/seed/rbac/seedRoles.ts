/**
 * Seed Role Definitions
 * Creates default system roles in Firestore
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 */

import { db, Timestamp } from '../../config/firebase-admin.js';
import { ROLES } from '../../constants/roles.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

interface RoleDefinition {
  id: string;
  role: string;
  name: string;
  description: string;
  isActive: boolean;
  isSystemRole: boolean;
  tenantId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

const roleDefinitions: Omit<RoleDefinition, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'role-admin',
    role: ROLES.ADMIN,
    name: 'ผู้ดูแลระบบ',
    description: 'มีสิทธิ์เข้าถึงและจัดการระบบทั้งหมด รวมถึงการตั้งค่าระบบและจัดการผู้ใช้',
    isActive: true,
    isSystemRole: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'role-hr',
    role: ROLES.HR,
    name: 'ฝ่ายทรัพยากรบุคคล',
    description: 'มีสิทธิ์จัดการข้อมูลพนักงาน การลา การเข้างาน และเงินเดือน',
    isActive: true,
    isSystemRole: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'role-manager',
    role: ROLES.MANAGER,
    name: 'ผู้จัดการ',
    description: 'มีสิทธิ์จัดการทีมงาน อนุมัติการลา และดูรายงานของทีม',
    isActive: true,
    isSystemRole: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'role-employee',
    role: ROLES.EMPLOYEE,
    name: 'พนักงาน',
    description: 'สิทธิ์พื้นฐานสำหรับพนักงานทั่วไป บันทึกเวลาเข้า-ออก ยื่นคำขอลา',
    isActive: true,
    isSystemRole: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'role-auditor',
    role: ROLES.AUDITOR,
    name: 'ผู้ตรวจสอบ',
    description: 'สิทธิ์ในการดู audit logs และตรวจสอบการเปลี่ยนแปลงในระบบ',
    isActive: true,
    isSystemRole: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

async function seedRoles() {
  console.log('🌱 Seeding Role Definitions...');

  const now = Timestamp.now();
  const batch = db.batch();

  for (const role of roleDefinitions) {
    const docRef = db.collection('roleDefinitions').doc(role.id);

    // ✅ Use stripUndefined for Firestore safety
    const rolePayload = stripUndefined({
      ...role,
      createdAt: now,
      updatedAt: now,
    });

    batch.set(docRef, rolePayload);
    console.log(`  ✅ Created role: ${role.name} (${role.role})`);
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${roleDefinitions.length} roles\n`);
}

// Run seed
seedRoles()
  .then(() => {
    console.log('✅ Role seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding roles:', error);
    process.exit(1);
  });
