/**
 * Seed Role-Permission Assignments
 * Maps roles to their allowed permissions
 * ✅ Follows @/docs/standards/09-seed-scripts-and-emulator-guide.md
 * ✅ Uses stripUndefined for Firestore safety
 */

import { db, Timestamp } from '../../config/firebase-admin.js';
import { ROLES } from '../../constants/roles.js';
import { stripUndefined } from '../../utils/stripUndefined.js';

const ROLE_NAME_MAP: Record<string, string> = {
  [ROLES.ADMIN]: 'ผู้ดูแลระบบ',
  [ROLES.HR]: 'ฝ่ายทรัพยากรบุคคล',
  [ROLES.MANAGER]: 'ผู้จัดการ',
  [ROLES.EMPLOYEE]: 'พนักงาน',
  [ROLES.AUDITOR]: 'ผู้ตรวจสอบ',
};

const RESOURCE_NAME_MAP: Record<string, string> = {
  employees: 'จัดการข้อมูลพนักงาน',
  attendance: 'จัดการการเข้างาน',
  'leave-requests': 'จัดการคำขอลา',
  payroll: 'จัดการเงินเดือน',
  settings: 'จัดการการตั้งค่าระบบ',
  users: 'จัดการผู้ใช้',
  roles: 'จัดการบทบาท',
  'audit-logs': 'ดู Audit Logs',
};

interface RolePermission {
  id: string;
  roleId: string;
  role: string;
  roleName: string; // Denormalized
  resource: string;
  resourceName: string; // Denormalized
  permissions: string[];
  isActive: boolean;
  tenantId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

const rolePermissionMappings: Omit<
  RolePermission,
  'createdAt' | 'updatedAt' | 'roleName' | 'resourceName'
>[] = [
  // ============================================
  // ADMIN - Full access to everything
  // ============================================
  {
    id: 'rp-admin-employees',
    roleId: 'role-admin',
    role: ROLES.ADMIN,
    resource: 'employees',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-admin-attendance',
    roleId: 'role-admin',
    role: ROLES.ADMIN,
    resource: 'attendance',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-admin-leave',
    roleId: 'role-admin',
    role: ROLES.ADMIN,
    resource: 'leave-requests',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-admin-payroll',
    roleId: 'role-admin',
    role: ROLES.ADMIN,
    resource: 'payroll',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-admin-settings',
    roleId: 'role-admin',
    role: ROLES.ADMIN,
    resource: 'settings',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-admin-users',
    roleId: 'role-admin',
    role: ROLES.ADMIN,
    resource: 'users',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-admin-roles',
    roleId: 'role-admin',
    role: ROLES.ADMIN,
    resource: 'roles',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-admin-audit',
    roleId: 'role-admin',
    role: ROLES.ADMIN,
    resource: 'audit-logs',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // HR - Manage employees, attendance, leave, payroll
  // ============================================
  {
    id: 'rp-hr-employees',
    roleId: 'role-hr',
    role: ROLES.HR,
    resource: 'employees',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-hr-attendance',
    roleId: 'role-hr',
    role: ROLES.HR,
    resource: 'attendance',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-hr-leave',
    roleId: 'role-hr',
    role: ROLES.HR,
    resource: 'leave-requests',
    permissions: ['read', 'create', 'update', 'delete'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-hr-payroll',
    roleId: 'role-hr',
    role: ROLES.HR,
    resource: 'payroll',
    permissions: ['read', 'create', 'update'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-hr-settings',
    roleId: 'role-hr',
    role: ROLES.HR,
    resource: 'settings',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-hr-users',
    roleId: 'role-hr',
    role: ROLES.HR,
    resource: 'users',
    permissions: ['read', 'create', 'update'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // MANAGER - Manage team, approve leave
  // ============================================
  {
    id: 'rp-manager-employees',
    roleId: 'role-manager',
    role: ROLES.MANAGER,
    resource: 'employees',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-manager-attendance',
    roleId: 'role-manager',
    role: ROLES.MANAGER,
    resource: 'attendance',
    permissions: ['read', 'update'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-manager-leave',
    roleId: 'role-manager',
    role: ROLES.MANAGER,
    resource: 'leave-requests',
    permissions: ['read', 'update'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // EMPLOYEE - Basic access
  // ============================================
  {
    id: 'rp-employee-attendance',
    roleId: 'role-employee',
    role: ROLES.EMPLOYEE,
    resource: 'attendance',
    permissions: ['read', 'create'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-employee-leave',
    roleId: 'role-employee',
    role: ROLES.EMPLOYEE,
    resource: 'leave-requests',
    permissions: ['read', 'create'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-employee-payroll',
    roleId: 'role-employee',
    role: ROLES.EMPLOYEE,
    resource: 'payroll',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },

  // ============================================
  // AUDITOR - Read-only access for audit
  // ============================================
  {
    id: 'rp-auditor-employees',
    roleId: 'role-auditor',
    role: ROLES.AUDITOR,
    resource: 'employees',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-auditor-attendance',
    roleId: 'role-auditor',
    role: ROLES.AUDITOR,
    resource: 'attendance',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-auditor-leave',
    roleId: 'role-auditor',
    role: ROLES.AUDITOR,
    resource: 'leave-requests',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-auditor-payroll',
    roleId: 'role-auditor',
    role: ROLES.AUDITOR,
    resource: 'payroll',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-auditor-audit',
    roleId: 'role-auditor',
    role: ROLES.AUDITOR,
    resource: 'audit-logs',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-auditor-users',
    roleId: 'role-auditor',
    role: ROLES.AUDITOR,
    resource: 'users',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rp-auditor-roles',
    roleId: 'role-auditor',
    role: ROLES.AUDITOR,
    resource: 'roles',
    permissions: ['read'],
    isActive: true,
    tenantId: 'default',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

async function seedRolePermissions() {
  console.log('🌱 Seeding Role-Permission Assignments...');

  const now = Timestamp.now();
  const batch = db.batch();

  for (const mapping of rolePermissionMappings) {
    const docRef = db.collection('rolePermissions').doc(mapping.id);

    // ✅ Use stripUndefined for Firestore safety
    const mappingPayload = stripUndefined({
      ...mapping,
      roleName: ROLE_NAME_MAP[mapping.role] || mapping.role,
      resourceName: RESOURCE_NAME_MAP[mapping.resource] || mapping.resource,
      createdAt: now,
      updatedAt: now,
    });

    batch.set(docRef, mappingPayload);
    console.log(
      `  ✅ Assigned ${mapping.resource} [${mapping.permissions.join(', ')}] to ${mapping.role}`
    );
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${rolePermissionMappings.length} role-permission mappings\n`);
}

// Run seed
seedRolePermissions()
  .then(() => {
    console.log('✅ Role-Permission seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding role-permissions:', error);
    process.exit(1);
  });
